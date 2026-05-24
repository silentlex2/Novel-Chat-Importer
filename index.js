import { getContext } from "../../../extensions.js";

const extensionName = "Novel Chat Importer";
const CHAPTER_PREVIEW_STEP_DEFAULT = 10;
const FLOOR_PREVIEW_STEP_DEFAULT = 20;
const SUMMARY_LENGTH = 800;
const DOM_UPDATE_DELAY = 0;

let novelText = "";
let lastSearchKeyword = "";

const isMobileViewport = () => window.innerWidth <= 900;

let chapterPreviewLimit = CHAPTER_PREVIEW_STEP_DEFAULT;
let floorPreviewLimit = FLOOR_PREVIEW_STEP_DEFAULT;

let cachedWorkingText = null;
let cachedChapters = null;
let cachedChunks = null;

const $ui = {};

function getSendDate() {
    return new Date().toLocaleString();
}

function sleep(ms = 0) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function escapeHtml(str) {
    return String(str ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function escapeRegExp(str) {
    return String(str ?? "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeNewlines(text) {
    return String(text ?? "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function getChunkSize() {
    return Math.max(100, Number($ui.chunkSize.val()) || 1200);
}

function getImportRoleMode() {
    const mode = $ui.roleMode.val() || "assistant";

    if (mode === "alternate_ai") return { startRole: "assistant", alternate: true };
    if (mode === "alternate_user") return { startRole: "user", alternate: true };
    if (mode === "user") return { startRole: "user", alternate: false };

    return { startRole: "assistant", alternate: false };
}

function getImportRangeMode() {
    return $ui.importRangeMode.val() || "all";
}

function getOnlyHitItems() {
    return $ui.onlyHitItems.prop("checked");
}

function getSearchCaseSensitive() {
    return $ui.searchCaseSensitive.prop("checked");
}

function updateRangeVisibility() {
    const mode = getImportRangeMode();
    $ui.chapterRangeWrap.toggle(mode === "chapter");
    $ui.floorRangeWrap.toggle(mode === "floor");
}

function invalidateCache() {
    cachedWorkingText = null;
    cachedChapters = null;
    cachedChunks = null;
}

function countOccurrences(text, keyword, caseSensitive = false) {
    if (!keyword) return 0;

    const re = new RegExp(escapeRegExp(keyword), caseSensitive ? "g" : "gi");
    return (String(text).match(re) || []).length;
}

function highlightKeyword(text, keyword, caseSensitive = false) {
    const escapedText = escapeHtml(text);
    if (!keyword) return escapedText;

    const safeKeyword = escapeRegExp(escapeHtml(keyword));

    try {
        return escapedText.replace(
            new RegExp(safeKeyword, caseSensitive ? "g" : "gi"),
            match => `<mark class="novel_keyword_mark">${match}</mark>`
        );
    } catch {
        return escapedText;
    }
}

function splitSummaryText(text, limit = SUMMARY_LENGTH) {
    if (!text) return "";

    const safeText = text.length > limit ? text.slice(0, limit) : text;
    const truncated = text.length > limit;

    return `
        <div class="novel_summary_text">${highlightKeyword(safeText, lastSearchKeyword.trim(), getSearchCaseSensitive())}</div>
        ${truncated ? `<button class="menu_button novel_show_more_btn" data-show-full="1">展开全文</button>` : ""}
        <div class="novel_full_text" style="display:none;">${highlightKeyword(text, lastSearchKeyword.trim(), getSearchCaseSensitive())}</div>
    `;
}

function bindShowMoreEvents(rootSelector) {
    $(rootSelector).off("click", ".novel_show_more_btn").on("click", ".novel_show_more_btn", function () {
        const $btn = $(this);
        const $wrap = $btn.closest(".novel_text_wrap");
        const $summary = $wrap.find(".novel_summary_text");
        const $full = $wrap.find(".novel_full_text");

        $summary.hide();
        $btn.hide();
        $full.show();
    });
}

function parseChapters(text) {
    text = normalizeNewlines(text);

    const chapterRegex =
        /^(\s*(第\s*[0-9一二三四五六七八九十百千万零〇两壹贰叁肆伍陆柒捌玖拾佰仟]+\s*[章节回卷部集].*|第.{1,30}[章节回卷部集].*|[卷部集]\s*[0-9一二三四五六七八九十百千万零〇两]+.*|Chapter\s*\d+.*|CHAPTER\s*\d+.*|【第.{1,30}[章节回卷部集]】.*|序章.*|楔子.*|引子.*|正文.*|终章.*|尾声.*|后记.*|番外.*)\s*)$/i;

    const lines = text.split("\n");
    const chapters = [];

    let currentTitle = "前言";
    let currentContent = "";

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        if (chapterRegex.test(trimmed)) {
            if (currentContent.trim()) {
                chapters.push({
                    title: currentTitle,
                    content: currentContent.trim(),
                });
            }

            currentTitle = trimmed;
            currentContent = "";
        } else {
            currentContent += trimmed + "\n";
        }
    }

    if (currentContent.trim()) {
        chapters.push({
            title: currentTitle,
            content: currentContent.trim(),
        });
    }

    return chapters;
}

function splitLongParagraphBySentence(paragraph, maxLength) {
    const result = [];
    let current = "";

    const sentences = paragraph.split(/(?<=[。！？!?；;])/);

    for (const sentence of sentences) {
        if (!sentence) continue;

        if (sentence.length > maxLength) {
            if (current.trim()) result.push(current.trim());
            current = "";

            for (let i = 0; i < sentence.length; i += maxLength) {
                result.push(sentence.slice(i, i + maxLength));
            }

            continue;
        }

        if ((current + sentence).length > maxLength) {
            if (current.trim()) result.push(current.trim());
            current = sentence;
        } else {
            current += sentence;
        }
    }

    if (current.trim()) result.push(current.trim());
    return result;
}

function splitByLength(text, maxLength = 1200) {
    const safeMaxLength = Math.max(100, Number(maxLength) || 1200);
    text = normalizeNewlines(text);

    const paragraphs = text.split("\n").map(x => x.trim()).filter(Boolean);
    const result = [];
    let current = "";

    for (const paragraph of paragraphs) {
        if (paragraph.length > safeMaxLength) {
            if (current.trim()) result.push(current.trim());
            current = "";

            result.push(...splitLongParagraphBySentence(paragraph, safeMaxLength));
            continue;
        }

        if ((current + paragraph).length > safeMaxLength) {
            if (current.trim()) result.push(current.trim());
            current = paragraph + "\n";
        } else {
            current += paragraph + "\n";
        }
    }

    if (current.trim()) result.push(current.trim());
    return result;
}

function buildChunksForText(text) {
    const chunkSize = getChunkSize();
    const oneChapterMode = $ui.oneChapter.prop("checked");
    const splitLongChapter = $ui.splitLongChapter.prop("checked");

    if (!text || !text.trim()) return [];

    if (oneChapterMode) {
        const chapters = parseChapters(text);

        if (!splitLongChapter) {
            return chapters.map(ch => ({
                title: ch.title,
                content: `${ch.title}\n\n${ch.content}`,
            }));
        }

        const chunks = [];

        for (const ch of chapters) {
            const chapterText = `${ch.title}\n\n${ch.content}`;
            const parts = splitByLength(chapterText, chunkSize);

            for (let i = 0; i < parts.length; i++) {
                chunks.push({
                    title: parts.length === 1 ? ch.title : `${ch.title}（${i + 1}/${parts.length}）`,
                    content: parts[i],
                });
            }
        }

        return chunks;
    }

    return splitByLength(text, chunkSize).map((content, index) => ({
        title: `${index + 1}楼`,
        content,
    }));
}

function getCachedChapters(text) {
    if (cachedChapters && cachedWorkingText === text) return cachedChapters;
    cachedWorkingText = text;
    cachedChapters = parseChapters(text);
    cachedChunks = buildChunksForText(text);
    return cachedChapters;
}

function getCachedChunks(text) {
    if (cachedChunks && cachedWorkingText === text) return cachedChunks;
    cachedWorkingText = text;
    cachedChapters = parseChapters(text);
    cachedChunks = buildChunksForText(text);
    return cachedChunks;
}

function getRangeValues(prefix, maxValue) {
    let start = Number($(`#${prefix}_start`).val());
    let end = Number($(`#${prefix}_end`).val());

    if (!Number.isFinite(start) || start <= 0) start = 1;
    if (!Number.isFinite(end) || end <= 0) end = maxValue;

    start = Math.max(1, Math.min(start, maxValue));
    end = Math.max(1, Math.min(end, maxValue));

    if (start > end) {
        [start, end] = [end, start];
    }

    return { start, end };
}

function buildImportChunks(workingText) {
    const rangeMode = getImportRangeMode();
    if (!workingText || !workingText.trim()) return [];

    const allChunks = getCachedChunks(workingText);
    if (rangeMode === "all") return allChunks;

    if (rangeMode === "chapter") {
        const chapters = getCachedChapters(workingText);
        if (!chapters.length) return allChunks;

        const { start, end } = getRangeValues("novel_import_chapter", chapters.length);
        const filteredText = chapters
            .filter((_, i) => i + 1 >= start && i + 1 <= end)
            .map(ch => `${ch.title}\n\n${ch.content}`)
            .join("\n\n");

        return buildChunksForText(filteredText);
    }

    if (rangeMode === "floor") {
        if (!allChunks.length) return [];

        const { start, end } = getRangeValues("novel_import_floor", allChunks.length);
        return allChunks.filter((_, i) => i + 1 >= start && i + 1 <= end);
    }

    return allChunks;
}

function getWorkingTextForImport() {
    return novelText;
}

function requestDomUpdate(fn) {
    requestAnimationFrame(() => fn());
}

function updateStats() {
    const workingText = getWorkingTextForImport();
    const chapterCount = getCachedChapters(workingText).length;
    const chunkCount = getCachedChunks(workingText).length;

    requestDomUpdate(() => {
        $ui.stats.html(`
            字数：${novelText.length.toLocaleString()}<br>
            章节：${chapterCount.toLocaleString()}<br>
            预计导入楼数：${chunkCount.toLocaleString()}
        `);
    });
}

function updateRangeInputs() {
    const workingText = getWorkingTextForImport();
    const chapters = getCachedChapters(workingText);
    const chunks = getCachedChunks(workingText);

    requestDomUpdate(() => {
        $ui.chapterEnd.val(chapters.length || 1);
        $ui.floorEnd.val(chunks.length || 1);
    });
}

function updateChapterPreview() {
    const chapters = novelText ? getCachedChapters(novelText) : [];
    const keyword = lastSearchKeyword.trim();
    const caseSensitive = getSearchCaseSensitive();
    const onlyHit = getOnlyHitItems();

    if (!chapters.length) {
        requestDomUpdate(() => {
            $ui.chapterPreview.html(`<div class="novel_empty_hint">暂无章节</div>`);
        });
        return;
    }

    const visibleChapters = chapters.slice(0, chapterPreviewLimit);
    const hasMore = chapterPreviewLimit < chapters.length;

    let visibleCount = 0;
    let visibleHitCount = 0;

    const controls = `
        <div class="novel_preview_controls">
            <span>当前显示章节：${visibleChapters.length.toLocaleString()} / ${chapters.length.toLocaleString()}</span>
            ${hasMore ? `<button id="novel_load_more_chapters" class="menu_button">加载更多章节</button>` : ""}
            ${hasMore ? `<button id="novel_show_all_chapters" class="menu_button danger_button">显示全部章节</button>` : ""}
        </div>
    `;

    const html = visibleChapters
        .map((ch, index) => {
            const chapterIndex = index + 1;
            const fullText = `${ch.title}\n${ch.content}`;
            const hitCount = keyword ? countOccurrences(fullText, keyword, caseSensitive) : 0;

            if (keyword && onlyHit && hitCount <= 0) return "";

            visibleCount += 1;
            visibleHitCount += hitCount;

            const hitInfo = keyword ? `<span class="novel_hit_badge">命中 ${hitCount} 处</span>` : "";

            return `
                <details class="novel_collapse_item">
                    <summary>
                        <span>
                            <b>${chapterIndex}. ${escapeHtml(ch.title)}</b>
                            ${hitInfo}
                        </span>
                        <span class="novel_chapter_meta">${ch.content.length.toLocaleString()} 字</span>
                    </summary>

                    <div class="novel_collapse_content">
                        <div class="novel_text_wrap novel_text_preview">
                            ${splitSummaryText(ch.content)}
                        </div>
                    </div>
                </details>
            `;
        })
        .filter(Boolean)
        .join("");

    requestDomUpdate(() => {
        $ui.chapterPreview.html(controls + (html || `<div class="novel_empty_hint">没有命中章节</div>`));

        if (keyword) {
            $ui.chapterPreview.closest(".novel_panel").find("> summary b")
                .text(`原文预览（可见命中 ${visibleHitCount.toLocaleString()} 处）`);
        } else {
            $ui.chapterPreview.closest(".novel_panel").find("> summary b").text("原文预览");
        }

        bindShowMoreEvents("#novel_chapter_preview");

        $("#novel_load_more_chapters").on("click", () => {
            chapterPreviewLimit += isMobileViewport() ? 10 : CHAPTER_PREVIEW_STEP_DEFAULT;
            updateChapterPreview();
        });

        $("#novel_show_all_chapters").on("click", () => {
            const confirmed = confirm("章节很多时可能导致手机卡顿，确定显示全部章节吗？");
            if (!confirmed) return;

            chapterPreviewLimit = chapters.length;
            updateChapterPreview();
        });
    });
}

function updateFloorPreview() {
    const workingText = getWorkingTextForImport();
    const chunks = workingText ? getCachedChunks(workingText) : [];
    const keyword = lastSearchKeyword.trim();
    const caseSensitive = getSearchCaseSensitive();
    const onlyHit = getOnlyHitItems();

    if (!chunks.length) {
        requestDomUpdate(() => {
            $ui.floorPreview.html(`<div class="novel_empty_hint">暂无楼层</div>`);
        });
        return;
    }

    const visibleChunks = chunks.slice(0, floorPreviewLimit);
    const hasMore = floorPreviewLimit < chunks.length;

    let visibleCount = 0;
    let visibleHitCount = 0;

    const controls = `
        <div class="novel_preview_controls">
            <span>当前显示楼层：${visibleChunks.length.toLocaleString()} / ${chunks.length.toLocaleString()}</span>
            ${hasMore ? `<button id="novel_load_more_floors" class="menu_button">加载更多楼层</button>` : ""}
            ${hasMore ? `<button id="novel_show_all_floors" class="menu_button danger_button">显示全部楼层</button>` : ""}
        </div>
    `;

    const html = visibleChunks
        .map((chunk, index) => {
            const floorIndex = index + 1;
            const hitCount = keyword ? countOccurrences(chunk.content, keyword, caseSensitive) : 0;

            if (keyword && onlyHit && hitCount <= 0) return "";

            visibleCount += 1;
            visibleHitCount += hitCount;

            const hitInfo = keyword ? `<span class="novel_hit_badge">命中 ${hitCount} 处</span>` : "";
            const title = chunk.title && chunk.title !== `${floorIndex}楼`
                ? `${floorIndex}楼：${chunk.title}`
                : `${floorIndex}楼`;

            return `
                <details class="novel_collapse_item" data-novel-floor-index="${floorIndex}">
                    <summary>
                        <span>
                            <b>${escapeHtml(title)}</b>
                            ${hitInfo}
                        </span>
                        <span class="novel_chapter_meta">${chunk.content.length.toLocaleString()} 字</span>
                    </summary>

                    <div class="novel_collapse_content">
                        <div class="novel_text_wrap novel_text_preview">
                            ${splitSummaryText(chunk.content)}
                        </div>
                    </div>
                </details>
            `;
        })
        .filter(Boolean)
        .join("");

    requestDomUpdate(() => {
        $ui.floorPreview.html(controls + (html || `<div class="novel_empty_hint">没有命中楼层</div>`));

        if (keyword) {
            $ui.floorPreview.closest(".novel_panel").find("> summary b")
                .text(`楼层预览（可见命中 ${visibleHitCount.toLocaleString()} 处）`);
        } else {
            $ui.floorPreview.closest(".novel_panel").find("> summary b").text("楼层预览");
        }

        bindShowMoreEvents("#novel_floor_preview");

        $("#novel_load_more_floors").on("click", () => {
            floorPreviewLimit += isMobileViewport() ? 10 : FLOOR_PREVIEW_STEP_DEFAULT;
            updateFloorPreview();
        });

        $("#novel_show_all_floors").on("click", () => {
            const confirmed = confirm("楼层很多时可能导致手机卡顿，确定显示全部楼层吗？");
            if (!confirmed) return;

            floorPreviewLimit = chunks.length;
            updateFloorPreview();
        });
    });
}

function jumpToFloor(index) {
    const workingText = getWorkingTextForImport();
    const chunks = getCachedChunks(workingText);

    if (index > floorPreviewLimit) {
        floorPreviewLimit = Math.min(chunks.length, Math.ceil(index / 20) * 20);
        updateFloorPreview();
    }

    $ui.floorPanel.prop("open", true);

    setTimeout(() => {
        const target = $(`[data-novel-floor-index="${index}"]`);
        if (!target.length) {
            toastr.warning("楼层还没有渲染出来，请先加载更多楼层");
            return;
        }

        target.prop("open", true);
        target[0].scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
}

function bindSearchJumpEvents() {
    $ui.searchResults.off("click", ".novel_jump_floor").on("click", ".novel_jump_floor", function () {
        jumpToFloor(Number($(this).data("floor")));
    });
}

function updateSearchResults() {
    const keyword = $ui.searchKeyword.val().trim();
    const caseSensitive = getSearchCaseSensitive();
    lastSearchKeyword = keyword;

    if (!keyword) {
        requestDomUpdate(() => {
            $ui.searchResults.html(`<div class="novel_empty_hint">请输入关键词后搜索</div>`);
        });

        updateChapterPreview();
        updateFloorPreview();
        return;
    }

    const workingText = getWorkingTextForImport();
    const chapters = getCachedChapters(workingText);
    const chunks = getCachedChunks(workingText);

    const chapterHits = [];
    const floorHits = [];

    chapters.forEach((ch, index) => {
        const fullText = `${ch.title}\n${ch.content}`;
        const hitCount = countOccurrences(fullText, keyword, caseSensitive);

        if (hitCount > 0) {
            chapterHits.push({
                index: index + 1,
                hitCount,
            });
        }
    });

    chunks.forEach((chunk, index) => {
        const hitCount = countOccurrences(chunk.content, keyword, caseSensitive);

        if (hitCount > 0) {
            floorHits.push({
                index: index + 1,
                hitCount,
            });
        }
    });

    const totalHits = countOccurrences(workingText, keyword, caseSensitive);

    const chapterHtml = chapterHits.length
        ? chapterHits.map(hit => `
            <li>
                第 ${hit.index} 章
                <span class="novel_hit_badge">命中 ${hit.hitCount} 处</span>
            </li>
        `).join("")
        : `<li>未在章节中找到</li>`;

    const floorHtml = floorHits.length
        ? floorHits.map(hit => `
            <li>
                <button class="menu_button novel_link_button novel_jump_floor" data-floor="${hit.index}">
                    第 ${hit.index} 楼
                </button>
                <span class="novel_hit_badge">命中 ${hit.hitCount} 处</span>
            </li>
        `).join("")
        : `<li>未在楼层中找到</li>`;

    const floorMore = floorHits.length
        ? `<div class="novel_more_hint">查看原文请在楼层预览中查看。</div>`
        : "";

    requestDomUpdate(() => {
        $ui.searchResults.html(`
            <details class="novel_collapse_item" open>
                <summary>
                    <b>搜索结果：${escapeHtml(keyword)}</b>
                    <span class="novel_hit_badge">全文命中 ${totalHits} 处</span>
                </summary>

                <div class="novel_collapse_content">
                    <b>所在章节</b>
                    <ol>${chapterHtml}</ol>

                    <b>所在楼层</b>
                    <ol>${floorHtml}</ol>
                    ${floorMore}
                </div>
            </details>
        `);

        bindSearchJumpEvents();
    });

    updateChapterPreview();
    updateFloorPreview();
}

function refreshAll() {
    updateStats();
    updateRangeInputs();
    updateChapterPreview();
    updateFloorPreview();

    if ($ui.searchKeyword.val()?.trim()) {
        updateSearchResults();
    }
}

function clearNovel() {
    const confirmed = confirm("确定清空当前已读取的小说文本吗？");
    if (!confirmed) return;

    novelText = "";
    lastSearchKeyword = "";
    chapterPreviewLimit = CHAPTER_PREVIEW_STEP_DEFAULT;
    floorPreviewLimit = FLOOR_PREVIEW_STEP_DEFAULT;

    invalidateCache();

    $ui.fileInput.val("");
    $ui.searchKeyword.val("");
    $ui.importProgress.text("");

    refreshAll();
    toastr.success("已清空小说");
}

function openSingleReplaceModal() {
    if (!novelText) {
        toastr.error("请先选择 TXT 文件");
        return;
    }

    $("#novel_replace_from").val($ui.searchKeyword.val().trim());
    $("#novel_replace_to").val("");
    $("#novel_replace_case_sensitive").prop("checked", false);
    updateSingleReplacePreview();

    $("#novel_replace_modal").addClass("open");
}

function closeSingleReplaceModal() {
    $("#novel_replace_modal").removeClass("open");
}

function updateSingleReplacePreview() {
    const from = $("#novel_replace_from").val();
    const to = $("#novel_replace_to").val();
    const caseSensitive = $("#novel_replace_case_sensitive").prop("checked");

    if (!from) {
        $("#novel_replace_stats").html("请输入要替换的关键词");
        return;
    }

    const re = new RegExp(escapeRegExp(from), caseSensitive ? "g" : "gi");
    const count = (novelText.match(re) || []).length;

    $("#novel_replace_stats").html(`
        将把 <b>${escapeHtml(from)}</b>
        替换为 <b>${escapeHtml(to)}</b><br>
        预计替换：${count.toLocaleString()} 处<br>
        模式：${caseSensitive ? "区分大小写" : "不区分大小写"}
    `);
}

function applySingleReplace() {
    const from = $("#novel_replace_from").val();
    const to = $("#novel_replace_to").val();

    if (!from) {
        toastr.error("请输入要替换的关键词");
        return;
    }

    const caseSensitive = $("#novel_replace_case_sensitive").prop("checked");
    const re = new RegExp(escapeRegExp(from), caseSensitive ? "g" : "gi");
    const count = (novelText.match(re) || []).length;

    if (count <= 0) {
        toastr.warning("没有找到可替换内容");
        return;
    }

    const confirmed = confirm(`确认替换 ${count} 处内容吗？`);
    if (!confirmed) return;

    novelText = novelText.replace(re, to);
    $ui.searchKeyword.val(to || from);
    lastSearchKeyword = to || "";

    chapterPreviewLimit = CHAPTER_PREVIEW_STEP_DEFAULT;
    floorPreviewLimit = FLOOR_PREVIEW_STEP_DEFAULT;

    invalidateCache();
    refreshAll();
    updateSearchResults();
    closeSingleReplaceModal();

    toastr.success(`已替换 ${count} 处`);
}

function createSingleReplaceModal() {
    if ($("#novel_replace_modal").length) return;

    const html = `
        <div id="novel_replace_modal" class="novel_modal_overlay">
            <div class="novel_modal">
                <div class="novel_modal_header">
                    <b>关键词替换</b>
                    <button id="novel_replace_close" class="menu_button novel_modal_close">×</button>
                </div>

                <div class="novel_modal_body">
                    <label>查找关键词</label>
                    <input id="novel_replace_from" class="text_pole" type="text" placeholder="要替换的内容" />

                    <label>替换为</label>
                    <input id="novel_replace_to" class="text_pole" type="text" placeholder="替换后的内容" />

                    <label class="checkbox_label">
                        <input type="checkbox" id="novel_replace_case_sensitive" />
                        区分大小写
                    </label>

                    <div id="novel_replace_stats" class="novel_replace_stats">请输入要替换的关键词</div>
                </div>

                <div class="novel_modal_footer">
                    <button id="novel_replace_cancel" class="menu_button">取消</button>
                    <button id="novel_replace_apply" class="menu_button">确认替换</button>
                </div>
            </div>
        </div>
    `;

    $("body").append(html);

    $("#novel_replace_close").on("click", closeSingleReplaceModal);
    $("#novel_replace_cancel").on("click", closeSingleReplaceModal);

    $("#novel_replace_modal").on("click", function (e) {
        if (e.target === this) closeSingleReplaceModal();
    });

    $("#novel_replace_from").on("input", updateSingleReplacePreview);
    $("#novel_replace_to").on("input", updateSingleReplacePreview);
    $("#novel_replace_case_sensitive").on("change", updateSingleReplacePreview);
    $("#novel_replace_apply").on("click", applySingleReplace);
}

function parseBatchReplaceRules() {
    const raw = $("#novel_batch_replace_rules").val() || "";
    const lines = raw.split(/\r?\n/);
    const rules = [];

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;

        let from = "";
        let to = "";

        if (trimmed.includes("=>")) [from, to] = trimmed.split("=>");
        else if (trimmed.includes("→")) [from, to] = trimmed.split("→");
        else if (trimmed.includes("::")) [from, to] = trimmed.split("::");
        else if (trimmed.includes("=")) [from, to] = trimmed.split("=");
        else continue;

        from = String(from ?? "").trim();
        to = String(to ?? "").trim();
        if (!from) continue;

        rules.push({ from, to });
    }

    return rules;
}

function updateBatchReplacePreview() {
    const rules = parseBatchReplaceRules();
    const caseSensitive = $("#novel_batch_replace_case_sensitive").prop("checked");

    if (!rules.length) {
        $("#novel_batch_replace_stats").html("请输入批量替换规则");
        return;
    }

    let workingText = novelText;
    let totalFound = 0;

    for (const rule of rules) {
        const re = new RegExp(escapeRegExp(rule.from), caseSensitive ? "g" : "gi");
        totalFound += (workingText.match(re) || []).length;
        workingText = workingText.replace(re, rule.to);
    }

    $("#novel_batch_replace_stats").html(`
        规则数：${rules.length.toLocaleString()}<br>
        预计命中：${totalFound.toLocaleString()} 处<br>
        模式：${caseSensitive ? "区分大小写" : "不区分大小写"}
    `);
}

function applyBatchReplace() {
    const rules = parseBatchReplaceRules();
    const caseSensitive = $("#novel_batch_replace_case_sensitive").prop("checked");

    if (!rules.length) {
        toastr.error("请先填写批量替换规则");
        return;
    }

    let workingText = novelText;
    let totalCount = 0;

    for (const rule of rules) {
        const re = new RegExp(escapeRegExp(rule.from), caseSensitive ? "g" : "gi");
        totalCount += (workingText.match(re) || []).length;
        workingText = workingText.replace(re, rule.to);
    }

    if (totalCount <= 0) {
        toastr.warning("没有找到可替换内容");
        return;
    }

    const confirmed = confirm(`确认批量替换 ${rules.length} 条规则，共 ${totalCount} 处吗？`);
    if (!confirmed) return;

    novelText = workingText;
    $ui.searchKeyword.val("");
    lastSearchKeyword = "";

    chapterPreviewLimit = CHAPTER_PREVIEW_STEP_DEFAULT;
    floorPreviewLimit = FLOOR_PREVIEW_STEP_DEFAULT;

    invalidateCache();
    refreshAll();
    closeBatchReplaceModal();
    toastr.success(`批量替换完成，共替换 ${totalCount} 处`);
}

function openBatchReplaceModal() {
    if (!novelText) {
        toastr.error("请先选择 TXT 文件");
        return;
    }

    $("#novel_batch_replace_rules").val("");
    $("#novel_batch_replace_case_sensitive").prop("checked", false);
    updateBatchReplacePreview();

    $("#novel_batch_replace_modal").addClass("open");
}

function closeBatchReplaceModal() {
    $("#novel_batch_replace_modal").removeClass("open");
}

function createBatchReplaceModal() {
    if ($("#novel_batch_replace_modal").length) return;

    const html = `
        <div id="novel_batch_replace_modal" class="novel_modal_overlay">
            <div class="novel_modal novel_modal_large">
                <div class="novel_modal_header">
                    <b>批量替换</b>
                    <button id="novel_batch_replace_close" class="menu_button novel_modal_close">×</button>
                </div>

                <div class="novel_modal_body">
                    <label>规则格式：每行一条，支持 <code>旧词 => 新词</code></label>
                    <textarea
                        id="novel_batch_replace_rules"
                        class="text_pole novel_replace_rules"
                        placeholder="张三 => 李四\n老王 => 王叔"
                    ></textarea>

                    <label class="checkbox_label">
                        <input type="checkbox" id="novel_batch_replace_case_sensitive" />
                        区分大小写
                    </label>

                    <div id="novel_batch_replace_stats" class="novel_replace_stats">请输入批量替换规则</div>
                </div>

                <div class="novel_modal_footer">
                    <button id="novel_batch_replace_cancel" class="menu_button">取消</button>
                    <button id="novel_batch_replace_apply" class="menu_button">确认批量替换</button>
                </div>
            </div>
        </div>
    `;

    $("body").append(html);

    $("#novel_batch_replace_close").on("click", closeBatchReplaceModal);
    $("#novel_batch_replace_cancel").on("click", closeBatchReplaceModal);

    $("#novel_batch_replace_modal").on("click", function (e) {
        if (e.target === this) closeBatchReplaceModal();
    });

    $("#novel_batch_replace_rules").on("input", updateBatchReplacePreview);
    $("#novel_batch_replace_case_sensitive").on("change", updateBatchReplacePreview);
    $("#novel_batch_replace_apply").on("click", applyBatchReplace);
}

async function performImport() {
    const context = getContext();

    if (!novelText) {
        toastr.error("请先选择 TXT 文件");
        return;
    }

    const workingText = getWorkingTextForImport();
    const chunks = buildImportChunks(workingText);

    if (!chunks.length) {
        toastr.error("没有可导入的内容");
        return;
    }

    const { startRole, alternate } = getImportRoleMode();

    let roleLabel = "";
    if (alternate) {
        roleLabel = `轮流导入，起始角色：${startRole === "user" ? "用户" : "AI"}`;
    } else {
        roleLabel = startRole === "user" ? "用户消息" : "AI消息";
    }

    const confirmed = confirm(
        `即将导入 ${chunks.length} 楼内容到当前聊天。\n\n` +
        `导入模式：${roleLabel}\n` +
        `是否继续？`
    );

    if (!confirmed) return;

    if (!Array.isArray(context.chat)) context.chat = [];

    $ui.importBtn.prop("disabled", true).text("正在导入...");
    $ui.importProgress.text(`正在准备导入：${chunks.length} 楼`);

    const messages = chunks.map((chunk, index) => {
        let isUser = startRole === "user";
        if (alternate) {
            isUser = index % 2 === 0 ? isUser : !isUser;
        }

        return {
            name: isUser ? (context.name1 || "User") : (context.name2 || "Assistant"),
            is_user: isUser,
            is_system: false,
            mes: chunk.content,
            send_date: getSendDate(),
            extra: {},
        };
    });

    try {
        $ui.importProgress.text(`正在导入：0 / ${messages.length}`);

        for (let i = 0; i < messages.length; i++) {
            context.chat.push(messages[i]);

            if (i % 25 === 0 || i === messages.length - 1) {
                $ui.importProgress.text(`正在导入：${i + 1} / ${messages.length}`);
                await sleep(DOM_UPDATE_DELAY);
            }
        }

        $ui.importProgress.text("正在保存聊天...");
        await context.saveChat();

        if (typeof context.reloadCurrentChat === "function") {
            await context.reloadCurrentChat();
        } else if (typeof context.reloadChat === "function") {
            await context.reloadChat();
        }

        $ui.importProgress.text(`导入完成：${messages.length} 楼`);
        toastr.success(`成功导入 ${messages.length} 楼内容`);
    } catch (error) {
        console.error(`[${extensionName}] Import failed`, error);
        toastr.error("导入失败，请打开控制台查看错误");
    } finally {
        $ui.importBtn.prop("disabled", false).text("导入小说到聊天");
    }
}

async function readTxtFile(file) {
    const encoding = $ui.fileEncoding.val() || "utf-8";
    const buffer = await file.arrayBuffer();

    try {
        const decoder = new TextDecoder(encoding);
        return decoder.decode(buffer);
    } catch (error) {
        console.warn(`[${extensionName}] TextDecoder failed, fallback to utf-8`, error);
        const decoder = new TextDecoder("utf-8");
        return decoder.decode(buffer);
    }
}

function getExtensionTarget() {
    if ($("#extensions_settings2").length) return $("#extensions_settings2");
    if ($("#extensions_settings").length) return $("#extensions_settings");
    if ($(".extensions_block").length) return $(".extensions_block").first();
    if ($("#extensionsMenu").length) return $("#extensionsMenu");
    return $("body");
}

function createUI() {
    if ($("#novel_importer_container").length) return;

    const html = `
    <div id="novel_importer_container" class="extension_settings">
        <div class="inline-drawer">

            <div class="inline-drawer-toggle inline-drawer-header">
                <b>Novel Chat Importer</b>
                <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
            </div>

            <div class="inline-drawer-content">

                <div class="flex-container flexFlowColumn">

                    <input type="file" id="novel_txt_file" accept=".txt" style="display:none;" />
                    <label for="novel_txt_file" class="menu_button">选择 TXT 小说</label>

                    <label>TXT 编码</label>
                    <select id="novel_file_encoding" class="text_pole">
                        <option value="utf-8">UTF-8</option>
                        <option value="gb18030">GBK / GB18030</option>
                    </select>

                    <div class="novel_button_row">
                        <button id="novel_clear_btn" class="menu_button">清空小说</button>
                    </div>

                    <div id="novel_stats" class="wide100p">
                        字数：0<br>
                        章节：0<br>
                        预计导入楼数：0
                    </div>

                    <details class="novel_panel novel_section_group" open>
                        <summary><b>搜索与替换</b></summary>

                        <div class="novel_section_body">
                            <div class="novel_search_row">
                                <input id="novel_search_keyword" class="text_pole" type="text" placeholder="输入关键词搜索" />
                                <button id="novel_search_btn" class="menu_button">搜索</button>
                                <button id="novel_replace_btn" class="menu_button">替换</button>
                                <button id="novel_batch_replace_btn" class="menu_button">批量替换</button>
                            </div>

                            <label class="checkbox_label">
                                <input type="checkbox" id="novel_search_case_sensitive" />
                                搜索区分大小写
                            </label>

                            <label class="checkbox_label">
                                <input type="checkbox" id="novel_only_hit_items" />
                                只显示命中章节/楼层
                            </label>

                            <div id="novel_search_results" class="wide100p">
                                <div class="novel_empty_hint">请输入关键词后搜索</div>
                            </div>
                        </div>
                    </details>

                    <label>导入范围</label>
                    <select id="novel_import_range_mode" class="text_pole">
                        <option value="all">全部内容</option>
                        <option value="chapter">按章节范围</option>
                        <option value="floor">按楼层范围</option>
                    </select>

                    <div id="novel_chapter_range_wrap" class="novel_range_wrap">
                        <label>章节范围</label>
                        <div class="novel_range_row">
                            <input class="text_pole" type="number" id="novel_import_chapter_start" min="1" value="1" placeholder="起始章" />
                            <input class="text_pole" type="number" id="novel_import_chapter_end" min="1" value="1" placeholder="结束章" />
                        </div>
                    </div>

                    <div id="novel_floor_range_wrap" class="novel_range_wrap">
                        <label>楼层范围</label>
                        <div class="novel_range_row">
                            <input class="text_pole" type="number" id="novel_import_floor_start" min="1" value="1" placeholder="起始楼" />
                            <input class="text_pole" type="number" id="novel_import_floor_end" min="1" value="1" placeholder="结束楼" />
                        </div>
                    </div>

                    <details class="novel_panel novel_section_group" open>
                        <summary><b>切分设置</b></summary>

                        <div class="novel_section_body">
                            <label class="checkbox_label">
                                <input type="checkbox" id="novel_one_chapter_per_message" />
                                一章一楼
                            </label>

                            <label class="checkbox_label">
                                <input type="checkbox" id="novel_split_long_chapter" checked />
                                章节过长时继续按字数切分
                            </label>

                            <label>每楼字数</label>
                            <input class="text_pole" type="number" id="novel_chunk_size" value="1200" min="100" step="100" />
                        </div>
                    </details>

                    <label>导入模式</label>
                    <select id="novel_role_mode" class="text_pole">
                        <option value="assistant">AI消息</option>
                        <option value="user">用户消息</option>
                        <option value="alternate_ai">AI / 用户轮流，AI先发</option>
                        <option value="alternate_user">AI / 用户轮流，用户先发</option>
                    </select>

                    <button id="novel_import_btn" class="menu_button">导入小说到聊天</button>
                    <div id="novel_import_progress" class="novel_import_progress"></div>

                    <details id="novel_chapter_panel" class="novel_panel" open>
                        <summary><b>原文预览</b></summary>
                        <div id="novel_chapter_preview" class="wide100p">
                            <div class="novel_empty_hint">暂无章节</div>
                        </div>
                    </details>

                    <details id="novel_floor_panel" class="novel_panel">
                        <summary><b>楼层预览</b></summary>
                        <div id="novel_floor_preview" class="wide100p">
                            <div class="novel_empty_hint">暂无楼层</div>
                        </div>
                    </details>

                </div>

            </div>

        </div>
    </div>
    `;

    const target = getExtensionTarget();
    target.append(html);

    $ui.container = $("#novel_importer_container");
    $ui.fileInput = $("#novel_txt_file");
    $ui.fileEncoding = $("#novel_file_encoding");
    $ui.stats = $("#novel_stats");
    $ui.searchKeyword = $("#novel_search_keyword");
    $ui.searchResults = $("#novel_search_results");
    $ui.importRangeMode = $("#novel_import_range_mode");
    $ui.chapterRangeWrap = $("#novel_chapter_range_wrap");
    $ui.floorRangeWrap = $("#novel_floor_range_wrap");
    $ui.chapterEnd = $("#novel_import_chapter_end");
    $ui.floorEnd = $("#novel_import_floor_end");
    $ui.oneChapter = $("#novel_one_chapter_per_message");
    $ui.splitLongChapter = $("#novel_split_long_chapter");
    $ui.chunkSize = $("#novel_chunk_size");
    $ui.roleMode = $("#novel_role_mode");
    $ui.importBtn = $("#novel_import_btn");
    $ui.importProgress = $("#novel_import_progress");
    $ui.chapterPreview = $("#novel_chapter_preview");
    $ui.chapterPanel = $("#novel_chapter_panel");
    $ui.floorPreview = $("#novel_floor_preview");
    $ui.floorPanel = $("#novel_floor_panel");
    $ui.searchCaseSensitive = $("#novel_search_case_sensitive");
    $ui.onlyHitItems = $("#novel_only_hit_items");

    createSingleReplaceModal();
    createBatchReplaceModal();
    updateRangeVisibility();

    $ui.fileInput.on("change", async function (e) {
        const file = e.target.files[0];
        if (!file) return;

        try {
            novelText = await readTxtFile(file);
            lastSearchKeyword = "";
            chapterPreviewLimit = CHAPTER_PREVIEW_STEP_DEFAULT;
            floorPreviewLimit = FLOOR_PREVIEW_STEP_DEFAULT;

            invalidateCache();

            $ui.searchKeyword.val("");
            $ui.importProgress.text("");

            refreshAll();
            toastr.success("TXT 已读取");
        } catch (error) {
            console.error(`[${extensionName}] Failed to read TXT`, error);
            toastr.error("TXT 读取失败，请检查文件或切换编码");
        }
    });

    $ui.importBtn.on("click", performImport);

    $("#novel_search_btn").on("click", updateSearchResults);

    $ui.searchKeyword.on("keydown", function (e) {
        if (e.key === "Enter") updateSearchResults();
    });

    $("#novel_replace_btn").on("click", openSingleReplaceModal);
    $("#novel_batch_replace_btn").on("click", openBatchReplaceModal);
    $("#novel_clear_btn").on("click", clearNovel);

    $ui.oneChapter.on("change", () => {
        floorPreviewLimit = FLOOR_PREVIEW_STEP_DEFAULT;
        invalidateCache();
        updateStats();
        updateRangeInputs();
        updateFloorPreview();
    });

    $ui.splitLongChapter.on("change", () => {
        floorPreviewLimit = FLOOR_PREVIEW_STEP_DEFAULT;
        invalidateCache();
        updateStats();
        updateRangeInputs();
        updateFloorPreview();
    });

    $ui.chunkSize.on("input", () => {
        floorPreviewLimit = FLOOR_PREVIEW_STEP_DEFAULT;
        invalidateCache();
        updateStats();
        updateRangeInputs();
        updateFloorPreview();
    });

    $ui.importRangeMode.on("change", updateRangeVisibility);

    $ui.searchCaseSensitive.on("change", () => {
        if ($ui.searchKeyword.val().trim()) {
            updateSearchResults();
        } else {
            updateChapterPreview();
            updateFloorPreview();
        }
    });

    $ui.onlyHitItems.on("change", () => {
        updateChapterPreview();
        updateFloorPreview();

        if ($ui.searchKeyword.val().trim()) {
            updateSearchResults();
        }
    });

    $ui.fileEncoding.on("change", () => {
        toastr.info("编码已切换，下次读取文件时生效");
    });
}

jQuery(async () => {
    console.log(`[${extensionName}] script start`);
    createUI();
    console.log(`[${extensionName}] Loaded`);
});