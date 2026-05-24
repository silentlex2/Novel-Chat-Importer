import { getContext } from "../../../extensions.js";

let novelText = "";

function parseChapters(text) {
    const chapterRegex =
        /^(第\s*[0-9一二三四五六七八九十百千万零〇两]+\s*[章节回卷].*|第.{1,20}[章节回卷].*|Chapter\s+\d+.*|【第.{1,20}[章节回卷]】.*|序章.*|终章.*|番外.*)$/i;

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

function splitByLength(text, maxLength = 1200) {

    const lines = text.split("\n");

    const result = [];

    let current = "";

    for (const line of lines) {

        const trimmed = line.trim();

        if (!trimmed) continue;

        if ((current + trimmed).length > maxLength) {

            if (current.trim()) {
                result.push(current.trim());
            }

            current = trimmed + "\n";

        } else {

            current += trimmed + "\n";

        }
    }

    if (current.trim()) {
        result.push(current.trim());
    }

    return result;
}

function updateStats(text) {
    const charCount = text.length;

    const chapterCount = parseChapters(text).length;

    $("#novel_stats").html(`
        字数：${charCount.toLocaleString()}<br>
        章节：${chapterCount}
    `);
}

function updateChapterList(text) {

    const chapters = parseChapters(text);

    const html = chapters.map((ch, i) => {

        const count = ch.content.length;

        return `
            <div class="novel_chapter_item">
                <b>${i + 1}. ${ch.title}</b>
                <div class="novel_chapter_meta">
                    ${count.toLocaleString()} 字
                </div>
            </div>
        `;
    }).join("");

    $("#novel_chapter_list").html(html);
}

async function importNovel() {
    const context = getContext();

    const chunkSize = Number($("#novel_chunk_size").val());

    const roleMode = $("#novel_role_mode").val();

    const oneChapterMode =
        $("#novel_one_chapter_per_message").prop("checked");

    if (!novelText) {
        toastr.error("请先选择TXT文件");
        return;
    }

    let chunks = [];

    if (oneChapterMode) {

        const chapters = parseChapters(novelText);

        chunks = chapters.map(ch =>
            `${ch.title}\n\n${ch.content}`
        );

    } else {

        chunks = splitByLength(
            novelText,
            chunkSize
        );
    }

    for (const chunk of chunks) {
        context.chat.push({
            name:
                roleMode === "user"
                    ? context.name1
                    : context.name2,

            is_user: roleMode === "user",

            is_system: false,

            mes: chunk,

            send_date: Date.now(),

            extra: {},
        });
    }

    await context.saveChat();

    if (context.reloadCurrentChat) {
        await context.reloadCurrentChat();
    }

    toastr.success(
        `成功导入 ${chunks.length} 楼内容`
    );
}

function createUI() {
    const html = `
    <div id="novel_importer_container"
         class="inline-drawer">

        <div class="inline-drawer-toggle inline-drawer-header">

            <b>Novel Chat Importer</b>

            <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>

        </div>

        <div class="inline-drawer-content">

            <div class="flex-container flexFlowColumn">

                <input
                    type="file"
                    id="novel_txt_file"
                    accept=".txt"
                    style="display:none;"
                />

                <label
                    for="novel_txt_file"
                    class="menu_button"
                >
                    选择 TXT 小说
                </label>

                <div
                    id="novel_stats"
                    class="wide100p"
                >
                    字数：0<br>
                    章节：0
                </div>

                <div
                    id="novel_chapter_list"
                    class="wide100p"
                ></div>

                <label class="checkbox_label">
                    <input
                        type="checkbox"
                        id="novel_one_chapter_per_message"
                    />
                    一章一楼
                </label>

                <label>每楼字数</label>

                <input
                    class="text_pole"
                    type="number"
                    id="novel_chunk_size"
                    value="1200"
                />

                <label>导入模式</label>

                <select
                    id="novel_role_mode"
                    class="text_pole"
                >
                    <option value="assistant">
                        AI消息（角色卡名字）
                    </option>

                    <option value="user">
                        用户消息（用户名字）
                    </option>
                </select>

                <div
                    id="novel_import_btn"
                    class="menu_button"
                >
                    导入小说到聊天
                </div>

                <label>预览</label>

                <textarea
                    id="novel-importer-preview"
                    class="text_pole"
                    style="min-height:220px;resize:vertical;"
                ></textarea>

            </div>

        </div>

    </div>
    `;

    $("#extensions_settings2").append(html);

    $("#novel_txt_file").on(
        "change",
        async function (e) {

            const file = e.target.files[0];

            if (!file) return;

            novelText = await file.text();

            $("#novel-importer-preview").val(
                novelText.slice(0, 4000)
            );

            updateStats(novelText);

            updateChapterList(novelText);

            toastr.success("TXT 已读取");
        }
    );

    $("#novel_import_btn").on(
        "click",
        async () => {
            await importNovel();
        }
    );
}

jQuery(async () => {
    createUI();

    console.log(
        "[Novel Chat Importer] Loaded"
    );
});
