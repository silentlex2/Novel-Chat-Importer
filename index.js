"use strict";
!(function () {
    const STYLE_ID = "novel_chat_importer_assistant_style";
    function getContext() {
        try {
            if (window.SillyTavern && "function" == typeof window.SillyTavern.getContext)
                return window.SillyTavern.getContext();
        } catch (e) {}
        try {
            if (
                "undefined" != typeof SillyTavern &&
                SillyTavern &&
                "function" == typeof SillyTavern.getContext
            )
                return SillyTavern.getContext();
        } catch (e) {}
        return window.SillyTavern || {};
    }
    // 酒馆 1.17 的 getContext() 只暴露 extensionSettings（驼峰），老版本才叫 extension_settings。
    // 关键是必须拿到前端那个「活」的设置对象：getContext() 每次返回新对象，
    // 往返回值的 .extension_settings 上写配置，等于写进垃圾桶，重启就丢。
    var novelImporterExtSettingsFallback = null;
    function getExtensionSettingsRoot() {
        try {
            var ctx = getContext() || {};
            var ext = ctx.extensionSettings || ctx.extension_settings;
            if (ext && "object" == typeof ext) return ext;
            if (!novelImporterExtSettingsFallback) novelImporterExtSettingsFallback = {};
            return novelImporterExtSettingsFallback;
        } catch (e) {}
        if (!novelImporterExtSettingsFallback) novelImporterExtSettingsFallback = {};
        return novelImporterExtSettingsFallback;
    }
    function liftNovelImporterToasts() {
        try {
            const styles = { zIndex: "2147483647", position: "fixed", pointerEvents: "auto" };
            ($("#toast-container,.toast-container").css(styles),
                $("#toast-container .toast,.toast-container .toast").css("z-index", "2147483647"));
        } catch (e) {}
    }
    function setupNovelImporterToasts() {
        try {
            if (!window.toastr) return;
            ((window.toastr.options = Object.assign({}, window.toastr.options || {}, {
                timeOut: 550,
                extendedTimeOut: 120,
                showDuration: 50,
                hideDuration: 80,
                newestOnTop: !0,
                positionClass: "toast-top-right",
                preventDuplicates: !0,
                target: "body"
            })),
                liftNovelImporterToasts());
        } catch (e) {}
    }
    function novelToast(type, message) {
        if ((setupNovelImporterToasts(), window.toastr && "function" == typeof window.toastr[type])) {
            const toastOptions = {
                    timeOut: 550,
                    extendedTimeOut: 100,
                    showDuration: 50,
                    hideDuration: 80,
                    newestOnTop: !0,
                    positionClass: "toast-top-right",
                    preventDuplicates: !0,
                    target: "body",
                    tapToDismiss: !0
                },
                $toast = window.toastr[type](message, void 0, toastOptions);
            (liftNovelImporterToasts(),
                setTimeout(liftNovelImporterToasts, 0),
                setTimeout(liftNovelImporterToasts, 80),
                setTimeout(function () {
                    try {
                        $toast &&
                            $toast.length &&
                            (window.toastr &&
                                "function" == typeof window.toastr.clear &&
                                window.toastr.clear($toast),
                            $toast.stop(!0, !0).fadeOut(80, function () {
                                $(this).remove();
                            }));
                    } catch (e) {}
                }, 700));
        }
    }
    function startNovelImporter() {
        (!(function () {
            const cssText =
                    "#novel_importer_container {\n    margin-top: 10px;\n}\n#novel_stats {\n    padding: 8px;\n    opacity: 0.85;\n}\n.novel_stats_row {\n    display: flex;\n    align-items: center;\n    gap: 8px;\n    flex-wrap: wrap;\n}\n.novel_stats_row #novel_stats {\n    flex: 0 0 auto; min-height: 0; height: auto;\n}\n.novel_import_action {\n    display: flex;\n    align-items: center;\n    gap: 10px;\n    flex-wrap: wrap;\n}\n.novel_import_action #novel_import_btn {\n    min-width: 156px !important;\n}\n.checkbox_label {\n    display: flex;\n    align-items: center;\n    gap: 6px;\n    margin-top: 6px;\n    margin-bottom: 4px;\n}\n.novel_section_title {\n    margin-top: 8px;\n    font-weight: bold;\n    opacity: 0.9;\n}\n.novel_search_row,\n.novel_button_row,\n.novel_range_row {\n    display: flex;\n    gap: 6px;\n    align-items: center;\n    flex-wrap: wrap;\n}\n.novel_search_row input {\n    flex: 1;\n    min-width: 120px;\n}\n.novel_button_row .menu_button,\n.novel_range_row .text_pole {\n    flex: 1;\n    min-width: 120px;\n}\n.novel_range_wrap {\n    margin-top: 4px;\n}\n.novel_panel {\n    border: 1px solid var(--SmartThemeBorderColor);\n    border-radius: 8px;\n    padding: 8px;\n    margin-top: 8px;\n    background: rgba(255, 255, 255, 0.03);\n}\n.novel_panel > summary {\n    cursor: pointer;\n    user-select: none;\n    padding: 4px;\n}\n.novel_section_group {\n    margin-top: 8px;\n}\n.novel_section_group .novel_section_body {\n    margin-top: 8px;\n}\n.novel_collapse_item {\n    border-bottom: 1px solid rgba(255, 255, 255, 0.08);\n    padding: 6px 0;\n}\n.novel_collapse_item:last-child {\n    border-bottom: none;\n}\n.novel_collapse_item > summary {\n    cursor: pointer;\n    user-select: none;\n    display: flex;\n    justify-content: space-between;\n    gap: 8px;\n    align-items: center;\n}\n.novel_collapse_content {\n    margin-top: 8px;\n    padding: 8px;\n    border-radius: 6px;\n    background: rgba(0, 0, 0, 0.15);\n}\n.novel_chapter_meta {\n    opacity: 0.7;\n    font-size: 0.9em;\n    white-space: nowrap;\n}\n.novel_text_preview {\n    max-height: 520px;\n    overflow-y: auto;\n}\n.novel_text_wrap {\n    position: relative;\n}\n.novel_summary_text,\n.novel_full_text {\n    white-space: pre-wrap;\n    word-break: break-word;\n    line-height: 1.55;\n}\n.novel_show_more_btn {\n    margin-top: 8px;\n}\n#novel_chapter_preview,\n#novel_floor_preview {\n    max-height: 620px;\n    overflow-y: auto;\n}\n.novel_empty_hint {\n    opacity: 0.65;\n    padding: 8px;\n}\n.novel_more_hint {\n    opacity: 0.75;\n    padding: 8px;\n    font-size: 0.9em;\n}\n.novel_hit_badge {\n    display: inline-block;\n    margin-left: 6px;\n    padding: 1px 6px;\n    border-radius: 999px;\n    font-size: 0.85em;\n    background: rgba(255, 210, 80, 0.18);\n    color: #ffd866;\n}\n.novel_keyword_mark {\n    background: #ffd866;\n    color: #1b1b1b;\n    padding: 0 2px;\n    border-radius: 2px;\n}\n.novel_preview_controls {\n    display: flex;\n    align-items: center;\n    gap: 6px;\n    flex-wrap: wrap;\n    margin-bottom: 8px;\n    padding: 6px;\n    border-radius: 6px;\n    background: rgba(255, 255, 255, 0.04);\n}\n.novel_preview_controls span {\n    opacity: 0.85;\n    margin-right: auto;\n}\n.novel_link_button {\n    display: inline-block;\n    padding: 2px 8px;\n    margin: 2px 0;\n    text-align: left;\n    white-space: normal;\n}\n.novel_import_progress {\n    padding: 6px 8px;\n    opacity: 0.9;\n    color: #ffd866;\n    min-height: 0;\n}\n.danger_button {\n    color: #ff8080;\n}\n.novel_modal_overlay {\n    /* 必须自己写高度：酒馆在 ≤1000px 时把 body 设为 position:fixed（mobile-styles.css），\n       body 脱离文档流后 html 高度塌成 0；而酒馆又给 html 加了 translateZ(0)（修 Chrome 模糊闪烁），\n       于是 html 成了固定定位的包含块。inset:0 这时算出的是 0 高盒子，\n       align-items:center 会把弹窗顶出屏幕上边缘。改用视口单位，不依赖包含块。 */\n    height: 100vh !important;\n    height: 100dvh !important;\n    display: none;\n    position: fixed !important;\n    inset: 0 !important;\n    z-index: 2147483646 !important;\n    background: rgba(0, 0, 0, 0.62) !important;\n    align-items: center !important;\n    justify-content: center !important;\n    padding: 16px !important;\n    box-sizing: border-box !important;\n}\n.novel_modal_overlay.open {\n    display: flex !important;\n}\n.novel_modal {\n    width: min(520px, 92vw) !important;\n    max-width: 92vw !important;\n    max-height: min(88vh, 720px) !important;\n    /* 再按动态视口收一次：iOS 上 100vh 是最高的“大视口”，\n       地址栏展开时弹窗会比可见区域还高，照样上下被切 */\n    max-height: min(88dvh, 720px) !important;\n    overflow: auto !important;\n    border: 1px solid var(--SmartThemeBorderColor, rgba(255,255,255,0.12)) !important;\n    border-radius: 14px !important;\n    background: var(--SmartThemeBlurTintColor, #1f1f24) !important;\n    box-shadow: 0 18px 48px rgba(0, 0, 0, 0.55) !important;\n    padding: 16px !important;\n    box-sizing: border-box !important;\n    color: var(--SmartThemeBodyColor, #f3f3f3) !important;\n}\n.novel_modal_large {\n    width: min(900px, 96vw) !important;\n}\n.novel_modal_header {\n    display: flex !important;\n    flex-direction: row !important;\n    justify-content: space-between !important;\n    align-items: center !important;\n    gap: 12px !important;\n    margin-bottom: 12px !important;\n}\n.novel_modal_header b {\n    font-size: 1.05em !important;\n    font-weight: 700 !important;\n}\n.novel_modal_close {\n    min-width: 36px !important;\n    width: 36px !important;\n    height: 36px !important;\n    padding: 0 !important;\n    border-radius: 10px !important;\n}\n.novel_modal_body {\n    display: flex !important;\n    flex-direction: column !important;\n    gap: 10px !important;\n}\n.novel_modal_body > label {\n    opacity: 0.9 !important;\n    font-size: 0.92em !important;\n}\n.novel_modal_body .text_pole,\n.novel_modal_body textarea {\n    width: 100% !important;\n    min-width: 0 !important;\n    max-width: 100% !important;\n    box-sizing: border-box !important;\n}\n.novel_modal_footer {\n    display: flex !important;\n    flex-direction: row !important;\n    flex-wrap: nowrap !important;\n    justify-content: flex-end !important;\n    align-items: center !important;\n    gap: 10px !important;\n    margin-top: 14px !important;\n}\n#novel_replace_modal .menu_button,\n#novel_batch_replace_modal .menu_button,\n#novel_cache_modal .menu_button {\n    display: inline-flex !important;\n    flex-direction: row !important;\n    align-items: center !important;\n    justify-content: center !important;\n    width: auto !important;\n    min-width: 96px !important;\n    max-width: none !important;\n    min-height: 38px !important;\n    height: auto !important;\n    padding: 8px 14px !important;\n    white-space: nowrap !important;\n    word-break: keep-all !important;\n    writing-mode: horizontal-tb !important;\n    text-orientation: mixed !important;\n    text-align: center !important;\n    line-height: 1.35 !important;\n    flex: 0 0 auto !important;\n}\n#novel_replace_apply,\n#novel_batch_replace_apply,\n#novel_cache_load_btn {\n    background: var(--cGold, #ffd866) !important;\n    color: #1b1b1b !important;\n    font-weight: 700 !important;\n}\n#novel_replace_cancel,\n#novel_batch_replace_cancel,\n#novel_replace_close,\n#novel_batch_replace_close {\n    opacity: 0.95 !important;\n}\n.novel_replace_stats {\n    margin-top: 0;\n    padding: 8px;\n    border-radius: 6px;\n    background: rgba(255, 255, 255, 0.05);\n    opacity: 0.95;\n    line-height: 1.55;\n}\n.novel_replace_rules {\n    min-height: 120px;\n    resize: vertical;\n}\n@media screen and (max-width: 700px) {\n    .novel_search_row {\n        flex-direction: column;\n        align-items: stretch;\n    }\n    .novel_search_row input,\n    .novel_search_row .menu_button {\n        width: 100%;\n    }\n    .novel_button_row {\n        flex-direction: column;\n        align-items: stretch;\n    }\n    .novel_button_row .menu_button {\n        width: 100%;\n    }\n    .novel_range_row {\n        flex-direction: column;\n        align-items: stretch;\n    }\n    .novel_collapse_item > summary {\n        flex-direction: column;\n        align-items: flex-start;\n    }\n    .novel_chapter_meta {\n        white-space: normal;\n    }\n    .novel_preview_controls {\n        flex-direction: column;\n        align-items: stretch;\n    }\n    .novel_preview_controls span {\n        margin-right: 0;\n    }\n}\n#novel_importer_container .menu_button,\n#novel_importer_fallback_modal .menu_button {\n    display: inline-flex !important;\n    align-items: center !important;\n    justify-content: center !important;\n    width: auto !important;\n    min-width: 72px !important;\n    max-width: none !important;\n    white-space: nowrap !important;\n    word-break: keep-all !important;\n    writing-mode: horizontal-tb !important;\n    text-orientation: mixed !important;\n    line-height: 1.35 !important;\n    padding: 7px 12px !important;\n    overflow-wrap: normal !important;\n    word-wrap: normal !important;\n    text-wrap: nowrap !important;\n    flex: 0 0 auto !important;\n}\n#novel_importer_container label.menu_button {\n    display: inline-flex !important;\n    width: max-content !important;\n    min-width: 132px !important;\n}\n#novel_importer_container .novel_search_row,\n#novel_importer_container .novel_button_row,\n#novel_importer_container .novel_modal_footer,\n#novel_importer_container .novel_preview_controls {\n    display: flex !important;\n    flex-direction: row !important;\n    align-items: center !important;\n}\n#novel_importer_container .novel_search_row input {\n    min-width: 220px;\n}\n@media screen and (max-width: 700px), (hover: none) and (pointer: coarse) {\n    #novel_importer_container .menu_button,\n    #novel_importer_fallback_modal .menu_button {\n        width: 100% !important;\n        min-width: 0 !important;\n        white-space: normal !important;\n        text-wrap: wrap !important;\n        flex: 1 1 auto !important;\n    }\n    #novel_importer_container label.menu_button {\n        width: 100% !important;\n        min-width: 0 !important;\n    }\n    #novel_importer_container .novel_search_row,\n    #novel_importer_container .novel_button_row,\n    #novel_importer_container .novel_range_row,\n    #novel_importer_container .novel_preview_controls {\n        flex-direction: column !important;\n        align-items: stretch !important;\n    }\n    #novel_importer_container .novel_search_row input {\n        min-width: 0 !important;\n        width: 100% !important;\n    }\n    .novel_modal_overlay {\n        position: fixed !important;\n        inset: 0 !important;\n        top: 0 !important;\n        right: 0 !important;\n        bottom: 0 !important;\n        left: 0 !important;\n        /* 100% 在塌陷的包含块下等于 0，没意义；高度由基础规则的 100dvh 决定 */\n        z-index: 2147483646 !important;\n    }\n}\n@media screen and (max-width: 1100px), screen and (max-device-width: 1100px), (hover: none), (pointer: coarse) {\n    #novel_importer_container,\n    #novel_importer_inline_panel {\n        width: 100% !important;\n        max-width: 100% !important;\n        box-sizing: border-box !important;\n        overflow-x: hidden !important;\n    }\n    #novel_importer_container .menu_button,\n    #novel_importer_inline_panel .menu_button,\n    #novel_importer_fallback_modal .menu_button {\n        display: flex !important;\n        align-items: center !important;\n        justify-content: center !important;\n        width: 100% !important;\n        min-width: 0 !important;\n        max-width: 100% !important;\n        min-height: 38px !important;\n        height: auto !important;\n        padding: 7px 10px !important;\n        writing-mode: horizontal-tb !important;\n        text-orientation: mixed !important;\n        white-space: normal !important;\n        word-break: keep-all !important;\n        overflow-wrap: normal !important;\n        word-wrap: normal !important;\n        text-wrap: wrap !important;\n        flex: 1 1 auto !important;\n        text-align: center !important;\n        box-sizing: border-box !important;\n    }\n    #novel_importer_container label.menu_button {\n        width: 100% !important;\n        min-width: 0 !important;\n    }\n    #novel_importer_container .novel_stats_row,\n    #novel_importer_container .novel_import_action,\n    #novel_importer_container .novel_search_row,\n    #novel_importer_container .novel_button_row,\n    #novel_importer_container .novel_range_row,\n    #novel_importer_container .novel_preview_controls {\n        display: flex !important;\n        flex-direction: column !important;\n        align-items: stretch !important;\n        width: 100% !important;\n        max-width: 100% !important;\n        box-sizing: border-box !important;\n    }\n    #novel_importer_container input.text_pole,\n    #novel_importer_container select.text_pole,\n    #novel_importer_container textarea.text_pole {\n        width: 100% !important;\n        min-width: 0 !important;\n        max-width: 100% !important;\n        box-sizing: border-box !important;\n    }\n}\n.novel_importer_mobile #novel_importer_container,\n.novel_importer_mobile #novel_importer_inline_panel {\n    width: 100% !important;\n    max-width: 100% !important;\n    box-sizing: border-box !important;\n    overflow-x: hidden !important;\n}\n.novel_importer_mobile #novel_importer_inline_panel {\n    position: fixed !important;\n    left: var(--novel-importer-panel-left, 4px) !important;\n    top: var(--novel-importer-panel-top, 4px) !important;\n    right: var(--novel-importer-panel-right, 4px) !important;\n    bottom: auto !important;\n    width: auto !important;\n    max-width: none !important;\n    height: var(--novel-importer-panel-height, calc(100dvh - 68px)) !important;\n    max-height: var(--novel-importer-panel-height, calc(100dvh - 68px)) !important;\n    margin: 0 !important;\n    padding: 10px !important;\n    overflow-y: scroll !important;\n    overflow-x: hidden !important;\n    overscroll-behavior: contain !important;\n    -webkit-overflow-scrolling: touch !important;\n    touch-action: pan-y !important;\n    transform: translateZ(0) !important;\n    z-index: 2147483000 !important;\n}\n.novel_importer_mobile.novel_importer_panel_open {\n    overflow: visible !important;\n}\n.novel_importer_mobile #novel_importer_container .menu_button,\n.novel_importer_mobile #novel_importer_inline_panel .menu_button,\n.novel_importer_mobile #novel_importer_fallback_modal .menu_button {\n    display: flex !important;\n    align-items: center !important;\n    justify-content: center !important;\n    width: 100% !important;\n    min-width: 0 !important;\n    max-width: 100% !important;\n    min-height: 38px !important;\n    height: auto !important;\n    padding: 7px 10px !important;\n    writing-mode: horizontal-tb !important;\n    text-orientation: mixed !important;\n    white-space: normal !important;\n    word-break: keep-all !important;\n    overflow-wrap: normal !important;\n    word-wrap: normal !important;\n    text-wrap: wrap !important;\n    flex: 1 1 auto !important;\n    text-align: center !important;\n}\n.novel_importer_mobile #novel_importer_container label.menu_button {\n    width: 100% !important;\n    min-width: 0 !important;\n}\n.novel_importer_mobile #novel_importer_container .novel_stats_row,\n.novel_importer_mobile #novel_importer_container .novel_import_action,\n.novel_importer_mobile #novel_importer_container .novel_search_row,\n.novel_importer_mobile #novel_importer_container .novel_button_row,\n.novel_importer_mobile #novel_importer_container .novel_range_row,\n.novel_importer_mobile #novel_importer_container .novel_preview_controls {\n    display: flex !important;\n    flex-direction: column !important;\n    align-items: stretch !important;\n    width: 100% !important;\n}\n.novel_importer_mobile #novel_importer_container input.text_pole,\n.novel_importer_mobile #novel_importer_container select.text_pole,\n.novel_importer_mobile #novel_importer_container textarea.text_pole {\n    width: 100% !important;\n    min-width: 0 !important;\n    max-width: 100% !important;\n    box-sizing: border-box !important;\n}\n.novel_importer_panel_header,\n.novel_importer_mobile .novel_importer_panel_header {\n    display: flex !important;\n    flex-direction: row !important;\n    align-items: center !important;\n    justify-content: space-between !important;\n    gap: 12px !important;\n    width: 100% !important;\n    box-sizing: border-box !important;\n}\n.novel_importer_panel_title,\n.novel_importer_mobile .novel_importer_panel_title {\n    flex: 1 1 auto !important;\n    min-width: 0 !important;\n    white-space: nowrap !important;\n    writing-mode: horizontal-tb !important;\n    text-orientation: mixed !important;\n    word-break: keep-all !important;\n    overflow: hidden !important;\n    text-overflow: ellipsis !important;\n}\n#novel_importer_inline_close,\n#novel_importer_fallback_close,\n.novel_importer_header_close,\n.novel_importer_mobile #novel_importer_inline_close,\n.novel_importer_mobile #novel_importer_fallback_close,\n.novel_importer_mobile .novel_importer_header_close {\n    width: auto !important;\n    min-width: 72px !important;\n    max-width: 40vw !important;\n    flex: 0 0 auto !important;\n    white-space: nowrap !important;\n    text-wrap: nowrap !important;\n}\n\n/* Enhanced UI styles */\n#novel_importer_container .menu_button {\n    transition: all 0.15s ease;\n    cursor: pointer;\n}\n#novel_importer_container .menu_button:hover {\n    filter: brightness(1.2);\n    transform: translateY(-1px);\n}\n#novel_importer_container .menu_button:active {\n    transform: translateY(0);\n}\n/* Primary action buttons */\n#novel_import_btn,\n#novel_wb_save {\n    background: var(--cGold, #ffd866) !important;\n    color: #1b1b1b !important;\n    font-weight: bold !important;\n}\n/* World book status badge */\n#novel_wb_persist_status {\n    display: inline-block;\n    padding: 2px 10px;\n    border-radius: 999px;\n    background: rgba(255, 216, 102, 0.15);\n    color: var(--cGold, #ffd866);\n    font-size: 0.85em;\n}\n/* Panel headers */\n.novel_panel > summary {\n    font-size: 1.05em;\n    padding: 8px 4px;\n    border-radius: 6px;\n    transition: background 0.15s;\n}\n.novel_panel > summary:hover {\n    background: rgba(255, 255, 255, 0.05);\n}\n/* Chapter/floor count badge */\n.novel_chapter_meta {\n    background: rgba(255, 255, 255, 0.06);\n    padding: 1px 8px;\n    border-radius: 999px;\n    font-size: 0.82em;\n}\n/* Mode switch - pill style active */\n.novel_mode_switch label:has(input:checked) {\n    background: var(--cGold, #ffd866) !important;\n    color: #1b1b1b !important;\n    box-shadow: 0 0 6px rgba(255, 216, 102, 0.3) !important;\n}\n/* Section titles */\n.novel_section_title {\n    text-transform: uppercase;\n    letter-spacing: 0.5px;\n    font-size: 0.78em !important;\n    opacity: 0.6 !important;\n}\n/* Checkbox labels */\n.checkbox_label {\n    padding: 4px 6px !important;\n    border-radius: 4px;\n    transition: background 0.1s;\n}\n.checkbox_label:hover {\n    background: rgba(255, 255, 255, 0.03);\n}\n/* Save button row */\n.novel_button_row {\n    margin-top: 10px !important;\n    gap: 8px !important;\n}\n/* Stats area */\n#novel_stats {\n    padding: 6px 10px !important; height: auto !important; min-height: 0 !important; flex: 0 0 auto !important;\n    border-radius: 6px;\n    background: rgba(255, 255, 255, 0.03);\n    line-height: 1.6;\n}\n/* Import progress */\n#novel_import_progress {\n    font-size: 0.85em;\n    color: var(--cGold, #ffd866);\n}\n/* Mobile adjustments */\n.novel_importer_mobile .novel_mode_switch {\n    flex-direction: row !important;\n}\n.novel_importer_mobile #novel_importer_container #novel_stats,\n.novel_importer_mobile #novel_importer_container .novel_stats_row #novel_stats {\n    flex: 0 0 auto !important;\n    min-height: 0 !important;\n    height: auto !important;\n    width: 100% !important;\n}\n.novel_importer_mobile #novel_importer_container .novel_stats_row,\n.novel_importer_mobile #novel_importer_container .novel_import_action {\n    gap: 6px !important;\n}\n\n.novel_align_start{align-items:flex-start!important;}\n/* Plot control bar - v3 */\n#novel_plot_control_bar{position:relative!important;display:none;width:100%!important;max-width:100%!important;margin:10px 0!important;padding:0!important;box-sizing:border-box!important;z-index:5!important;color:var(--SmartThemeBodyColor,#e8e8e8)!important;font-family:inherit!important;font-size:13px!important;user-select:none!important;touch-action:manipulation!important;--npc-accent:#e6c26e;--npc-accent-soft:rgba(230,194,110,0.16);--npc-dim:rgba(235,235,235,0.52);--npc-line:rgba(255,255,255,0.09);--npc-line2:rgba(255,255,255,0.16);--npc-fill:rgba(255,255,255,0.05);}\n#novel_plot_control_bar.npc_visible{display:block!important;}\n#novel_plot_control_bar .npc_shell{position:relative!important;border:1px solid var(--npc-line)!important;border-radius:14px!important;background:var(--SmartThemeBlurTintColor,#26262c)!important;box-shadow:0 6px 24px rgba(0,0,0,0.28)!important;overflow:hidden!important;}\n#novel_plot_control_bar .npc_topbar{position:relative!important;display:flex!important;flex-direction:row!important;flex-wrap:nowrap!important;align-items:stretch!important;background:linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0))!important;}\n#novel_plot_control_bar .npc_nav{flex:0 0 42px!important;min-width:42px!important;min-height:48px!important;padding:0!important;font-size:20px!important;line-height:1!important;border:0!important;border-radius:0!important;background:transparent!important;cursor:pointer!important;color:var(--npc-dim)!important;transition:background .15s ease,color .15s ease!important;}\n#novel_plot_control_bar .npc_nav:hover{background:var(--npc-fill)!important;color:inherit!important;}\n#novel_plot_control_bar .npc_nav:disabled{opacity:0.3!important;cursor:default!important;}\n#novel_plot_control_bar.npc_no_text .npc_nav{visibility:hidden!important;}\n#novel_plot_control_bar .npc_info{flex:1 1 auto!important;display:flex!important;flex-direction:row!important;align-items:center!important;gap:8px!important;min-width:0!important;padding:7px 12px 10px!important;cursor:pointer!important;}\n#novel_plot_control_bar .npc_info:hover{background:rgba(255,255,255,0.03)!important;}\n#novel_plot_control_bar .npc_head_txt{flex:1 1 auto!important;min-width:0!important;display:flex!important;flex-direction:column!important;gap:2px!important;}\n#novel_plot_control_bar .npc_range{font-size:14px!important;font-weight:700!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important;}\n#novel_plot_control_bar .npc_meta{display:block!important;font-size:11px!important;color:var(--npc-dim)!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important;}\n#novel_plot_control_bar .npc_meta:empty{display:none!important;}\n\n#novel_plot_control_bar .npc_chev{flex:0 0 auto!important;font-size:12px!important;color:var(--npc-dim)!important;transition:transform .2s ease!important;}\n#novel_plot_control_bar.npc_expanded .npc_chev{transform:rotate(180deg)!important;}\n#novel_plot_control_bar .npc_progress{position:absolute!important;left:0!important;right:0!important;bottom:0!important;height:3px!important;background:rgba(255,255,255,0.07)!important;pointer-events:none!important;}\n#novel_plot_control_bar .npc_progress_fill{height:100%!important;background:linear-gradient(90deg,rgba(230,194,110,0.45),#e6c26e)!important;border-radius:0 2px 2px 0!important;transition:width .25s ease!important;}\n#novel_plot_control_bar .npc_panel{display:none!important;padding:12px!important;border-top:1px solid var(--npc-line)!important;}\n#novel_plot_control_bar.npc_expanded .npc_panel{display:block!important;}\n#novel_plot_control_bar .npc_card{border:1px solid var(--npc-line)!important;border-radius:11px!important;background:rgba(255,255,255,0.025)!important;padding:10px 12px!important;margin-top:10px!important;}\n#novel_plot_control_bar .npc_follow{margin-top:2px!important;}\n#novel_plot_control_bar .npc_pin.npc_pinned_on{border-color:rgba(230,194,110,0.28)!important;background:linear-gradient(180deg,rgba(230,194,110,0.07),rgba(255,255,255,0.02))!important;}\n#novel_plot_control_bar .npc_card_head{display:flex!important;flex-direction:row!important;flex-wrap:wrap!important;align-items:center!important;justify-content:space-between!important;gap:8px!important;margin:0 0 8px!important;}\n#novel_plot_control_bar .npc_card_head .npc_sec{margin:0!important;}\n#novel_plot_control_bar .npc_sec{font-size:10.5px!important;font-weight:600!important;letter-spacing:1.5px!important;color:var(--npc-dim)!important;margin:0 0 8px!important;}\n#novel_plot_control_bar .npc_tag{flex:0 0 auto!important;font-size:10.5px!important;color:var(--npc-dim)!important;background:var(--npc-fill)!important;border:1px solid var(--npc-line)!important;border-radius:999px!important;padding:1px 8px!important;line-height:1.5!important;}\n#novel_plot_control_bar .npc_tag:empty{display:none!important;}\n#novel_plot_control_bar .npc_flow{display:flex!important;flex-direction:row!important;align-items:center!important;gap:8px!important;flex-wrap:wrap!important;}\n#novel_plot_control_bar .npc_field{display:flex!important;flex-direction:row!important;align-items:center!important;gap:6px!important;flex:1 1 120px!important;min-width:0!important;}\n#novel_plot_control_bar .npc_field>label{flex:0 0 auto!important;font-size:12px!important;color:var(--npc-dim)!important;white-space:nowrap!important;}\n#novel_plot_control_bar .npc_field input,#novel_plot_control_bar .npc_field select{flex:1 1 auto!important;min-width:0!important;width:100%!important;border-radius:8px!important;border:1px solid var(--npc-line2)!important;background:var(--npc-fill)!important;color:inherit!important;padding:6px 8px!important;min-height:32px!important;box-sizing:border-box!important;outline:none!important;box-shadow:none!important;font-size:13px!important;}\n#novel_plot_control_bar .npc_field input:focus,#novel_plot_control_bar .npc_field select:focus{border-color:rgba(230,194,110,0.55)!important;background:rgba(230,194,110,0.06)!important;}\n#novel_plot_control_bar input[type=number]{-moz-appearance:textfield!important;appearance:textfield!important;}\n#novel_plot_control_bar input[type=number]::-webkit-outer-spin-button,#novel_plot_control_bar input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none!important;margin:0!important;}\n#novel_plot_control_bar .npc_num{flex:0 0 auto!important;}\n#novel_plot_control_bar .npc_num input{flex:0 0 58px!important;width:58px!important;text-align:center!important;padding:6px 4px!important;}\n#novel_plot_control_bar .npc_step{flex:0 0 auto!important;width:24px!important;min-width:24px!important;height:24px!important;min-height:24px!important;padding:0!important;border-radius:6px!important;border:1px solid var(--npc-line)!important;background:transparent!important;color:var(--npc-dim)!important;font-size:14px!important;line-height:1!important;cursor:pointer!important;}\n#novel_plot_control_bar .npc_step:hover{background:var(--npc-fill)!important;color:inherit!important;}\n#novel_plot_control_bar .npc_scrub{margin-top:10px!important;}\n#novel_plot_control_bar #novel_plot_scrub{-webkit-appearance:none!important;appearance:none!important;display:block!important;width:100%!important;height:22px!important;margin:0!important;padding:0!important;background:transparent!important;cursor:pointer!important;outline:none!important;box-shadow:none!important;border:0!important;}\n#novel_plot_control_bar #novel_plot_scrub:disabled{opacity:0.35!important;cursor:default!important;}\n#novel_plot_control_bar #novel_plot_scrub::-webkit-slider-runnable-track{height:6px!important;border-radius:999px!important;background:rgba(255,255,255,0.1)!important;border:1px solid var(--npc-line)!important;}\n#novel_plot_control_bar #novel_plot_scrub::-webkit-slider-thumb{-webkit-appearance:none!important;appearance:none!important;width:16px!important;height:16px!important;border-radius:50%!important;background:var(--npc-accent)!important;border:2px solid #2a2517!important;margin-top:-5.5px!important;box-shadow:0 1px 6px rgba(0,0,0,0.4)!important;}\n#novel_plot_control_bar #novel_plot_scrub::-moz-range-track{height:6px!important;border-radius:999px!important;background:rgba(255,255,255,0.1)!important;border:1px solid var(--npc-line)!important;}\n#novel_plot_control_bar #novel_plot_scrub::-moz-range-thumb{width:14px!important;height:14px!important;border-radius:50%!important;background:var(--npc-accent)!important;border:2px solid #2a2517!important;box-shadow:0 1px 6px rgba(0,0,0,0.4)!important;}\n#novel_plot_control_bar .npc_scrub_ends{display:flex!important;flex-direction:row!important;flex-wrap:nowrap!important;justify-content:space-between!important;font-size:10.5px!important;color:var(--npc-dim)!important;margin-top:2px!important;}\n#novel_plot_control_bar .npc_preview{margin:8px 0 0!important;padding:8px 0 0!important;border-top:1px dashed var(--npc-line)!important;font-size:11.5px!important;line-height:1.55!important;color:var(--npc-dim)!important;}\n#novel_plot_control_bar .npc_preview:empty{display:none!important;margin:0!important;padding:0!important;border:0!important;}\n#novel_plot_control_bar .npc_quick{display:flex!important;flex-direction:row!important;flex-wrap:wrap!important;align-items:center!important;gap:8px!important;margin-top:10px!important;}\n#novel_plot_control_bar .npc_pin_head{display:flex!important;flex-direction:row!important;flex-wrap:wrap!important;align-items:center!important;justify-content:space-between!important;gap:8px!important;}\n#novel_plot_control_bar .npc_pin_count{font-size:11px!important;color:var(--npc-dim)!important;}\n#novel_plot_control_bar .npc_pin_count:empty{display:none!important;}\n#novel_plot_control_bar .npc_pin_hint{font-size:11px!important;color:var(--npc-dim)!important;margin:4px 0 0!important;line-height:1.5!important;}\n#novel_plot_control_bar .npc_switch{display:inline-flex!important;align-items:center!important;gap:8px!important;cursor:pointer!important;flex:0 0 auto!important;}\n#novel_plot_control_bar .npc_switch input[type=checkbox]{position:absolute!important;opacity:0!important;width:0!important;height:0!important;min-width:0!important;min-height:0!important;margin:0!important;padding:0!important;border:0!important;}\n#novel_plot_control_bar .npc_switch_track{width:34px!important;height:20px!important;border-radius:999px!important;background:rgba(255,255,255,0.1)!important;border:1px solid var(--npc-line2)!important;position:relative!important;transition:background .15s ease,border-color .15s ease!important;flex:0 0 auto!important;box-sizing:border-box!important;}\n#novel_plot_control_bar .npc_switch_track::after{content:''!important;position:absolute!important;top:2px!important;left:2px!important;width:14px!important;height:14px!important;border-radius:50%!important;background:rgba(255,255,255,0.75)!important;transition:transform .15s ease,background .15s ease!important;}\n#novel_plot_control_bar .npc_switch input:checked + .npc_switch_track{background:var(--npc-accent)!important;border-color:var(--npc-accent)!important;}\n#novel_plot_control_bar .npc_switch input:checked + .npc_switch_track::after{transform:translateX(14px)!important;background:#241f10!important;}\n#novel_plot_control_bar .npc_switch_text{font-size:13px!important;font-weight:600!important;}\n#novel_plot_control_bar .npc_pin_adv{margin-top:10px!important;border-top:1px solid var(--npc-line)!important;}\n#novel_plot_control_bar .npc_pin_adv>summary{cursor:pointer!important;font-size:12px!important;color:var(--npc-dim)!important;padding:10px 0!important;min-height:40px!important;list-style:none!important;display:flex!important;flex-direction:row!important;align-items:center!important;justify-content:space-between!important;-webkit-tap-highlight-color:transparent!important;touch-action:manipulation!important;user-select:none!important;}\n#novel_plot_control_bar .npc_pin_adv>summary::-webkit-details-marker{display:none!important;}\n#novel_plot_control_bar .npc_pin_adv>summary::after{content:'▾'!important;font-size:11px!important;}\n#novel_plot_control_bar .npc_pin_adv[open]>summary{color:inherit!important;}\n#novel_plot_control_bar .npc_pin_adv[open]>summary::after{content:'▴'!important;}\n#novel_plot_control_bar .npc_pin_adv>summary:hover{color:inherit!important;}\n#novel_plot_control_bar .npc_pin_body{display:flex!important;flex-direction:column!important;gap:10px!important;padding:2px 0 4px!important;}\n#novel_plot_control_bar .npc_seg{display:flex!important;flex-direction:row!important;flex-wrap:nowrap!important;border:1px solid var(--npc-line2)!important;border-radius:9px!important;overflow:hidden!important;background:var(--npc-fill)!important;}\n#novel_plot_control_bar .npc_seg .npc_seg_item{flex:1 1 0!important;min-width:0!important;display:flex!important;}\n#novel_plot_control_bar .npc_seg .npc_seg_item input{position:absolute!important;opacity:0!important;width:0!important;height:0!important;min-width:0!important;min-height:0!important;margin:0!important;padding:0!important;border:0!important;appearance:none!important;-webkit-appearance:none!important;}\n#novel_plot_control_bar .npc_seg .npc_seg_item span{flex:1 1 auto!important;display:flex!important;flex-direction:row!important;align-items:center!important;justify-content:center!important;min-height:32px!important;padding:4px 10px!important;font-size:12.5px!important;color:var(--npc-dim)!important;cursor:pointer!important;transition:background .15s ease,color .15s ease!important;}\n#novel_plot_control_bar .npc_seg .npc_seg_item input:checked+span{background:var(--npc-accent-soft)!important;color:var(--npc-accent)!important;font-weight:700!important;}\n#novel_plot_control_bar .npc_pin_fields{display:flex!important;flex-direction:row!important;gap:10px!important;flex-wrap:wrap!important;}\n#novel_plot_control_bar #novel_plot_pin_single_fields{display:none!important;}\n#novel_plot_control_bar #novel_plot_pin_single_fields.npc_fields_on{display:flex!important;}\n#novel_plot_control_bar #novel_plot_pin_range_fields{display:flex!important;}\n#novel_plot_control_bar #novel_plot_pin_range_fields.npc_fields_off{display:none!important;}\n#novel_plot_control_bar #novel_plot_pin_depth_wrap{display:none!important;}\n#novel_plot_control_bar #novel_plot_pin_depth_wrap.npc_depth_on{display:flex!important;}\n#novel_plot_control_bar .npc_pin_pinned_wrap{border-top:1px dashed var(--npc-line)!important;padding-top:10px!important;}\n#novel_plot_control_bar .npc_pin_pinned_head{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:8px!important;}\n#novel_plot_control_bar .npc_pin_read{font-size:11px!important;min-height:24px!important;padding:2px 8px!important;}\n#novel_plot_control_bar .npc_pin_read[hidden]{display:none!important;}\n#novel_plot_control_bar .npc_chips{display:flex!important;flex-direction:row!important;flex-wrap:wrap!important;gap:6px!important;}\n#novel_plot_control_bar .npc_empty{font-size:11px!important;color:var(--npc-dim)!important;}\n#novel_plot_control_bar .npc_chip{display:inline-flex!important;align-items:center!important;gap:4px!important;padding:3px 4px 3px 10px!important;border-radius:999px!important;background:var(--npc-fill)!important;border:1px solid var(--npc-line2)!important;font-size:11.5px!important;}\n#novel_plot_control_bar .npc_chip button{all:unset!important;cursor:pointer!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;width:20px!important;height:20px!important;min-width:20px!important;min-height:20px!important;border-radius:50%!important;color:var(--npc-dim)!important;font-size:13px!important;line-height:1!important;box-sizing:border-box!important;}\n#novel_plot_control_bar .npc_chip button:hover{background:rgba(224,138,138,0.18)!important;color:#e08a8a!important;}\n#novel_plot_control_bar .npc_pin_actions{display:flex;flex-direction:row!important;justify-content:flex-end!important;gap:8px!important;margin-top:8px!important;}\n#novel_plot_control_bar .npc_adv2{border-top:1px dashed var(--npc-line)!important;}\n#novel_plot_control_bar .npc_adv2>summary{cursor:pointer!important;font-size:11px!important;color:var(--npc-dim)!important;padding:6px 0!important;list-style:none!important;}\n#novel_plot_control_bar .npc_adv2>summary::-webkit-details-marker{display:none!important;}\n#novel_plot_control_bar .npc_adv2>summary::before{content:'▸ '!important;}\n#novel_plot_control_bar .npc_adv2[open]>summary::before{content:'▾ '!important;}\n#novel_plot_control_bar .npc_adv_row{display:flex!important;flex-direction:row!important;gap:8px!important;flex-wrap:wrap!important;padding:4px 0 2px!important;}\n#novel_plot_control_bar .npc_adv_row .npc_field{flex:1 1 0!important;}\n#novel_plot_control_bar .npc_adv_row .npc_field.npc_grow{flex:2 1 0!important;}\n#novel_plot_control_bar .npc_adv_row input[type=number]{max-width:76px!important;}\n#novel_plot_control_bar button,#novel_plot_control_bar .menu_button{display:inline-flex!important;align-items:center!important;justify-content:center!important;white-space:nowrap!important;min-height:32px!important;padding:6px 14px!important;border-radius:8px!important;border:1px solid var(--npc-line2)!important;background:var(--npc-fill)!important;color:inherit!important;font-size:13px!important;line-height:1.3!important;box-sizing:border-box!important;cursor:pointer!important;box-shadow:none!important;float:none!important;max-width:100%!important;writing-mode:horizontal-tb!important;transition:filter .15s ease,background .15s ease,color .15s ease!important;}\n#novel_plot_control_bar .npc_primary{background:var(--npc-accent)!important;border-color:var(--npc-accent)!important;color:#1f1b12!important;font-weight:700!important;}\n#novel_plot_control_bar .npc_primary:hover{filter:brightness(1.08)!important;}\n#novel_plot_control_bar button:disabled{opacity:0.55!important;cursor:default!important;}\n#novel_plot_control_bar .npc_nav:disabled{opacity:0.3!important;}\n#novel_plot_control_bar .npc_primary.npc_busy{opacity:0.6!important;pointer-events:none!important;}\n#novel_plot_control_bar .npc_ghost{background:transparent!important;border-color:var(--npc-line)!important;color:var(--npc-dim)!important;min-height:28px!important;padding:4px 12px!important;font-size:12px!important;}\n#novel_plot_control_bar .npc_ghost:hover{color:inherit!important;background:var(--npc-fill)!important;}\n#novel_plot_control_bar .npc_danger{color:#e08a8a!important;border-color:rgba(224,138,138,0.3)!important;}\n#novel_plot_control_bar .npc_danger:hover{background:rgba(224,138,138,0.1)!important;color:#e08a8a!important;}\n#novel_plot_control_bar .npc_block_btn{width:100%!important;min-width:0!important;align-self:stretch!important;}\n#novel_plot_control_bar .npc_load_hint{display:none!important;font-size:12px!important;color:var(--npc-dim)!important;padding:2px 0!important;line-height:1.5!important;}\n#novel_plot_control_bar.npc_no_text .npc_load_hint{display:block!important;}\n#novel_plot_control_bar.npc_no_text .npc_card{display:none!important;}\n#novel_plot_control_bar .npc_pin_preview_more{opacity:0.8!important;}\n#novel_plot_control_bar .npc_pinned_empty{font-size:11px!important;color:var(--npc-dim)!important;}\n#novel_plot_control_bar .npc_foot{display:flex!important;flex-direction:row!important;flex-wrap:wrap!important;justify-content:flex-end!important;gap:8px!important;margin-top:10px!important;}\n@media screen and (max-width:700px){#novel_plot_control_bar .npc_nav{flex:0 0 34px!important;min-width:34px!important;font-size:18px!important;min-height:44px!important;}#novel_plot_control_bar .npc_adv_row{flex-direction:column!important;}#novel_plot_control_bar .npc_foot{justify-content:space-between!important;}#novel_plot_control_bar .npc_foot .menu_button{flex:1 1 0!important;}}\n\n/* Plot control bar - refined */\n/* ============================================================\n   减法版预览：只改视觉，不动结构 / 功能\n   accent 跟随主题 --SmartThemeQuoteColor（当前主题 #9D89FF）\n   ============================================================ */\n\n#novel_plot_control_bar {\n  --npc-accent: var(--SmartThemeQuoteColor, #9d89ff) !important; flex: 0 0 auto !important; scroll-margin-bottom: 12px !important;\n  --npc-accent-soft: color-mix(in srgb, var(--npc-accent) 15%, transparent) !important; --npc-accent-line: color-mix(in srgb, var(--npc-accent) 35%, transparent) !important; --npc-accent-focus: color-mix(in srgb, var(--npc-accent) 55%, transparent) !important; --npc-accent-wash: color-mix(in srgb, var(--npc-accent) 6%, transparent) !important; --npc-accent-hover: color-mix(in srgb, var(--npc-accent) 22%, transparent) !important;\n  --npc-dim: rgba(235, 235, 235, 0.62) !important;\n  --npc-line: rgba(255, 255, 255, 0.07) !important;\n  --npc-line2: rgba(255, 255, 255, 0.12) !important;\n  --npc-fill: rgba(255, 255, 255, 0.04) !important;\n}\n\n/* 外壳：弱边框、弱阴影、12px */\n#novel_plot_control_bar .npc_shell {\n  border: 1px solid var(--SmartThemeBorderColor, rgba(255, 255, 255, 0.08)) !important;\n  border-radius: 12px !important;\n  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.22) !important;\n}\n\n/* 顶栏：去掉渐变，收窄箭头，字号降一档 */\n#novel_plot_control_bar .npc_topbar { background: none !important; }\n#novel_plot_control_bar button.npc_nav {\n  flex: 0 0 40px !important;\n  min-width: 40px !important;\n  min-height: 46px !important;\n  font-size: 0 !important;\n  /* 通用 .menu_button 规则会盖掉 .npc_nav，把箭头画成两个盒子；这里显式还原 */\n  border: 0 !important;\n  border-radius: 0 !important;\n  background: transparent !important;\n  padding: 0 !important;\n  color: var(--npc-dim) !important;\n}\n/* 用 CSS 画箭头：不依赖字体，笔画粗细和大小都稳定 */\n#novel_plot_control_bar .npc_nav::before {\n  content: '' !important;\n  display: block !important;\n  width: 10px !important;\n  height: 10px !important;\n  border-left: 2px solid currentColor !important;\n  border-bottom: 2px solid currentColor !important;\n  transform: rotate(45deg) !important;\n  opacity: 0.9 !important;\n}\n#novel_plot_control_bar #novel_plot_next::before {\n  transform: rotate(-135deg) !important;\n}\n#novel_plot_control_bar .npc_nav:hover {\n  background: var(--npc-fill) !important;\n  color: inherit !important;\n}\n#novel_plot_control_bar .npc_info { padding: 8px 10px 9px !important; gap: 6px !important; }\n#novel_plot_control_bar .npc_range { font-size: 13.5px !important; font-weight: 600 !important; }\n#novel_plot_control_bar .npc_meta { font-size: 11.5px !important; }\n/* 展开/收起的小三角：和左右箭头同一套笔画，别再当装饰字 */\n#novel_plot_control_bar .npc_chev {\n  font-size: 0 !important;\n  width: 24px !important;\n  height: 24px !important;\n  display: inline-flex !important;\n  align-items: center !important;\n  justify-content: center !important;\n  border-radius: 50% !important;\n  color: rgba(235, 235, 235, 0.7) !important;\n  opacity: 1 !important;\n  transition: background 0.15s ease, color 0.15s ease, transform 0.2s ease !important;\n}\n#novel_plot_control_bar .npc_chev::before {\n  content: '' !important;\n  display: block !important;\n  width: 8px !important;\n  height: 8px !important;\n  border-right: 2px solid currentColor !important;\n  border-bottom: 2px solid currentColor !important;\n  transform: rotate(45deg) !important;\n  margin-top: -3px !important;\n}\n#novel_plot_control_bar .npc_info:hover .npc_chev {\n  background: var(--npc-fill) !important;\n  color: inherit !important;\n}\n#novel_plot_control_bar .npc_progress { height: 2px !important; }\n#novel_plot_control_bar .npc_progress_fill {\n  background: var(--npc-accent) !important;\n  opacity: 0.7 !important;\n  border-radius: 0 1px 1px 0 !important;\n}\n\n/* 展开面板：去掉卡片套卡片，改成一层表面 + 分隔线 */\n#novel_plot_control_bar .npc_panel { padding: 10px 12px 12px !important; }\n#novel_plot_control_bar .npc_card {\n  border: 0 !important;\n  background: transparent !important;\n  border-radius: 0 !important;\n  padding: 0 !important;\n  margin-top: 0 !important;\n}\n#novel_plot_control_bar .npc_follow { margin-top: 0 !important; }\n#novel_plot_control_bar .npc_pin {\n  border-top: 1px solid var(--npc-line) !important;\n  margin-top: 10px !important;\n  padding-top: 10px !important;\n}\n#novel_plot_control_bar .npc_pin.npc_pinned_on {\n  background: transparent !important;\n  border-color: var(--npc-line) !important;\n}\n#novel_plot_control_bar .npc_sec {\n  font-size: 11.5px !important;\n  letter-spacing: 0 !important;\n  margin-bottom: 6px !important;\n}\n#novel_plot_control_bar .npc_tag {\n  background: transparent !important;\n  border: 0 !important;\n  padding: 0 !important;\n  font-size: 11.5px !important;\n}\n\n/* 输入：更矮、更暗、6px 圆角 */\n#novel_plot_control_bar .npc_field input,\n#novel_plot_control_bar .npc_field select {\n  min-height: 30px !important;\n  padding: 5px 8px !important;\n  border-radius: 6px !important;\n  background: rgba(0, 0, 0, 0.16) !important;\n  border-color: var(--npc-line2) !important;\n  font-size: 12.5px !important;\n}\n#novel_plot_control_bar .npc_field input:focus,\n#novel_plot_control_bar .npc_field select:focus {\n  border-color: var(--npc-accent-focus) !important;\n  background: var(--npc-accent-wash) !important;\n}\n#novel_plot_control_bar .npc_num input { flex: 0 0 54px !important; width: 54px !important; }\n#novel_plot_control_bar .npc_step {\n  width: 26px !important;\n  min-width: 26px !important;\n  height: 26px !important;\n  min-height: 26px !important;\n  border-radius: 6px !important;\n  border-color: var(--npc-line2) !important;\n  font-size: 13px !important;\n}\n\n/* 滑块：40px 高的一块压成 18px，轨道 3px，拇指 10px */\n#novel_plot_control_bar .npc_scrub { margin-top: 6px !important; }\n#novel_plot_control_bar #novel_plot_scrub { height: 18px !important; }\n#novel_plot_control_bar #novel_plot_scrub::-webkit-slider-runnable-track {\n  height: 3px !important;\n  border: 0 !important;\n  background: rgba(255, 255, 255, 0.1) !important;\n}\n#novel_plot_control_bar #novel_plot_scrub::-webkit-slider-thumb {\n  width: 10px !important;\n  height: 10px !important;\n  margin-top: -3.5px !important;\n  border: 0 !important;\n  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.35) !important;\n}\n#novel_plot_control_bar #novel_plot_scrub::-moz-range-track {\n  height: 3px !important;\n  border: 0 !important;\n  background: rgba(255, 255, 255, 0.1) !important;\n}\n#novel_plot_control_bar #novel_plot_scrub::-moz-range-thumb {\n  width: 10px !important;\n  height: 10px !important;\n  border: 0 !important;\n}\n#novel_plot_control_bar .npc_scrub_ends { font-size: 11px !important; margin-top: 0 !important; }\n\n/* 预览：去掉虚线，靠间距分组 */\n#novel_plot_control_bar .npc_preview {\n  margin: 6px 0 0 !important;\n  padding: 0 !important;\n  border: 0 !important;\n  font-size: 12px !important;\n  line-height: 1.6 !important;\n}\n#novel_plot_control_bar .npc_preview_more { font-size: 11.5px !important; opacity: 0.75 !important; }\n#novel_plot_control_bar .npc_quick { margin-top: 8px !important; gap: 6px !important; }\n\n/* 固定章节：一行开关 + 右侧管理入口 */\n#novel_plot_control_bar .npc_pin_head { gap: 6px !important; }\n#novel_plot_control_bar .npc_switch_text { font-size: 12.5px !important; }\n#novel_plot_control_bar .npc_switch_track { width: 32px !important; height: 18px !important; }\n#novel_plot_control_bar .npc_switch_track::after {\n  width: 12px !important;\n  height: 12px !important;\n  top: 2px !important;\n  left: 2px !important;\n}\n#novel_plot_control_bar .npc_switch input:checked + .npc_switch_track::after {\n  transform: translateX(14px) !important;\n  background: #fff !important;\n}\n#novel_plot_control_bar .npc_pin_hint { font-size: 11.5px !important; margin-top: 2px !important; }\n#novel_plot_control_bar .npc_pin_adv { margin-top: 6px !important; }\n#novel_plot_control_bar .npc_pin_adv > summary {\n  min-height: 32px !important;\n  padding: 6px 0 !important;\n  font-size: 12px !important;\n}\n\n/* 按钮：统一 28px / 6px；主按钮用淡紫，不用实心大色块 */\n#novel_plot_control_bar button,\n#novel_plot_control_bar .menu_button {\n  min-height: 28px !important;\n  padding: 4px 12px !important;\n  border-radius: 6px !important;\n  font-size: 12px !important;\n}\n#novel_plot_control_bar .npc_primary {\n  background: var(--npc-accent-soft) !important;\n  border-color: var(--npc-accent-line) !important;\n  color: var(--npc-accent) !important;\n  font-weight: 600 !important;\n}\n#novel_plot_control_bar .npc_primary:hover {\n  filter: none !important;\n  background: var(--npc-accent-hover) !important;\n}\n#novel_plot_control_bar .npc_ghost {\n  background: transparent !important;\n  border-color: var(--npc-line) !important;\n}\n#novel_plot_control_bar .npc_ghost:hover {\n  background: var(--npc-fill) !important;\n  color: inherit !important;\n}\n#novel_plot_control_bar .npc_foot { margin-top: 8px !important; gap: 6px !important; }\n#novel_plot_control_bar .npc_foot #novel_plot_hide {\n  border: 0 !important;\n  background: transparent !important;\n  color: var(--npc-dim) !important;\n  padding: 4px 6px !important;\n}\n#novel_plot_control_bar .npc_foot #novel_plot_hide:hover { color: inherit !important; }\n\n/* 顶栏两行：范围主、总数弱；字体跟随 Noto Sans + Noto Sans SC */\n#novel_plot_control_bar{font-family:'Noto Sans','Noto Sans SC',sans-serif!important;}\n#novel_plot_control_bar .npc_range{font-variant-numeric:tabular-nums!important;}\n#novel_plot_control_bar .npc_range_main{font-size:14.5px!important;font-weight:600!important;}\n#novel_plot_control_bar .npc_range_total{font-size:11.5px!important;font-weight:400!important;color:var(--npc-dim)!important;margin-left:8px!important;}\n#novel_plot_control_bar .npc_head_txt{gap:3px!important;}\n#novel_plot_control_bar .npc_progress{pointer-events:auto!important;}\n\n/* 固定章节总闸关着时，钉住管理整块不出现 */\n#novel_plot_control_bar #novel_plot_pin_details{display:none!important;}\n#novel_plot_control_bar .npc_pin.npc_pinned_on #novel_plot_pin_details{display:block!important;}\n\n/* 主题可能把按钮写成竖排/压窄，阅读器里的展开全文强制横排 */\n#novel_plot_reader .novel_show_more_btn{display:inline-flex!important;align-items:center!important;justify-content:center!important;width:auto!important;min-width:max-content!important;white-space:nowrap!important;writing-mode:horizontal-tb!important;text-orientation:mixed!important;word-break:keep-all!important;flex:0 0 auto!important;align-self:flex-start!important;}\n#novel_plot_reader .novel_show_more_btn[hidden],#novel_plot_reader .novel_show_more_btn[style*='display: none'],#novel_plot_reader .novel_show_more_btn[style*='display:none']{display:none!important;}\n/* Plot bar reader / diff modal */\n#novel_plot_reader{position:fixed!important;inset:0!important;height:100vh!important;height:100dvh!important;display:none;align-items:center!important;justify-content:center!important;padding:16px!important;box-sizing:border-box!important;background:rgba(0,0,0,0.62)!important;z-index:2147483646!important;}\n#novel_plot_reader.open{display:flex!important;}\n#novel_plot_reader .novel_text_preview{max-height:none!important;overflow:visible!important;}\n#novel_plot_reader .npc_rd{display:flex!important;flex-direction:column!important;width:min(1080px,96vw)!important;max-height:min(88vh,860px)!important;max-height:min(88dvh,860px)!important;border:1px solid rgba(255,255,255,0.12)!important;border-radius:14px!important;background:var(--SmartThemeBlurTintColor,#1f1f24)!important;color:var(--SmartThemeBodyColor,#f3f3f3)!important;box-shadow:0 18px 48px rgba(0,0,0,0.55)!important;overflow:hidden!important;font-size:13px!important;}\n#novel_plot_reader .npc_rd_head{display:flex!important;flex-direction:row!important;align-items:center!important;gap:10px!important;padding:10px 12px!important;border-bottom:1px solid rgba(255,255,255,0.09)!important;flex-wrap:wrap!important;}\n#novel_plot_reader .npc_rd_title{flex:1 1 auto!important;min-width:0!important;font-weight:700!important;font-size:14px!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important;}\n#novel_plot_reader .npc_rd_tabs{display:flex!important;flex-direction:row!important;flex:0 0 auto!important;border:1px solid rgba(255,255,255,0.16)!important;border-radius:9px!important;overflow:hidden!important;}\n#novel_plot_reader .npc_rd_tab{all:unset!important;cursor:pointer!important;padding:5px 12px!important;font-size:12.5px!important;color:rgba(235,235,235,0.62)!important;white-space:nowrap!important;}\n#novel_plot_reader .npc_rd_tab.npc_on{background:rgba(230,194,110,0.16)!important;color:#e6c26e!important;font-weight:700!important;}\n#novel_plot_reader .npc_rd_close{all:unset!important;cursor:pointer!important;flex:0 0 auto!important;width:30px!important;height:30px!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;border-radius:8px!important;font-size:18px!important;line-height:1!important;color:rgba(235,235,235,0.7)!important;}\n#novel_plot_reader .npc_rd_close:hover{background:rgba(255,255,255,0.08)!important;color:#fff!important;}\n#novel_plot_reader .npc_rd_bar{display:flex!important;flex-direction:row!important;flex-wrap:wrap!important;align-items:center!important;gap:8px!important;padding:8px 12px!important;border-bottom:1px solid rgba(255,255,255,0.07)!important;font-size:12px!important;}\n#novel_plot_reader .npc_rd_bar select{max-width:100%!important;min-width:0!important;height:30px!important;padding:2px 8px!important;border-radius:8px!important;border:1px solid rgba(255,255,255,0.16)!important;background:rgba(255,255,255,0.05)!important;color:inherit!important;font-size:12.5px!important;}\n#novel_plot_reader .npc_rd_stat{color:rgba(235,235,235,0.6)!important;font-size:12px!important;}\n#novel_plot_reader .npc_rd_body{flex:1 1 auto!important;min-height:0!important;overflow:auto!important;padding:12px 14px!important;-webkit-overflow-scrolling:touch!important;}\n#novel_plot_reader .npc_rd_ch{margin:2px 0 8px!important;font-size:13px!important;font-weight:700!important;color:#e6c26e!important;}\n#novel_plot_reader .npc_rd_text{white-space:pre-wrap!important;word-break:break-word!important;line-height:1.8!important;font-size:13.5px!important;margin:0 0 18px!important;}\n#novel_plot_reader .npc_rd_text:last-child{margin-bottom:0!important;}\n#novel_plot_reader mark.npc_hit{background:rgba(120,220,150,0.26)!important;color:inherit!important;border-radius:2px!important;box-shadow:inset 0 -1px 0 rgba(120,220,150,0.5)!important;}\n#novel_plot_reader .npc_rd_cols{display:flex!important;flex-direction:row!important;gap:14px!important;align-items:flex-start!important;}\n#novel_plot_reader .npc_rd_col{flex:1 1 0!important;min-width:0!important;}\n#novel_plot_reader .npc_rd_colhead{position:sticky!important;top:0!important;z-index:2!important;margin:0 0 6px!important;padding:4px 0!important;font-size:11.5px!important;font-weight:700!important;color:rgba(235,235,235,0.65)!important;background:var(--SmartThemeBlurTintColor,#1f1f24)!important;}\n#novel_plot_reader .npc_rd_empty{opacity:0.7!important;padding:16px 4px!important;line-height:1.7!important;}\n#novel_plot_reader .npc_rd_foot{display:flex!important;flex-direction:row!important;flex-wrap:wrap!important;align-items:center!important;justify-content:flex-end!important;gap:8px!important;padding:8px 12px!important;border-top:1px solid rgba(255,255,255,0.09)!important;}\n#novel_plot_reader .npc_rd_hint{flex:1 1 auto!important;min-width:0!important;font-size:11.5px!important;color:rgba(235,235,235,0.55)!important;}\n#novel_plot_reader .npc_rd_btn{display:inline-flex!important;align-items:center!important;justify-content:center!important;min-height:32px!important;padding:6px 14px!important;border-radius:8px!important;border:1px solid rgba(255,255,255,0.16)!important;background:rgba(255,255,255,0.05)!important;color:inherit!important;font-size:12.5px!important;cursor:pointer!important;white-space:nowrap!important;}\n#novel_plot_reader .npc_rd_btn:hover{background:rgba(255,255,255,0.1)!important;}\n@media screen and (max-width:760px){#novel_plot_reader{padding:8px!important;}#novel_plot_reader .npc_rd{width:100%!important;max-height:92dvh!important;}#novel_plot_reader .npc_rd_cols{flex-direction:column!important;}#novel_plot_reader .npc_rd_col{width:100%!important;}}\n\n#toast-container,\n.toast-container {\n    z-index: 2147483647 !important;\n    position: fixed !important;\n    pointer-events: auto !important;\n}\n#toast-container.toast-top-right,\n.toast-container.toast-top-right {\n    top: 12px !important;\n    right: 12px !important;\n}\n#toast-container .toast,\n.toast-container .toast {\n    z-index: 2147483647 !important;\n}\n";
            function injectStyleToDoc(doc) {
                if (!doc || !doc.head) return;
                let style = doc.getElementById(STYLE_ID);
                if (!style) {
                    style = doc.createElement("style");
                    style.id = STYLE_ID;
                    doc.head.appendChild(style);
                }
                style.textContent = cssText;
            }
            injectStyleToDoc(document);
            try {
                if (window.parent && window.parent.document && window.parent.document !== document)
                    injectStyleToDoc(window.parent.document);
            } catch (e) {}
            try {
                if (window.top && window.top.document && window.top.document !== document)
                    injectStyleToDoc(window.top.document);
            } catch (e2) {}
        })(),
            setupNovelImporterToasts());
        const extensionName = "Novel Chat Importer";
        let novelText = "",
            novelFileName = "",
            lastSearchKeyword = "",
            worldBookMode = !1,
            worldBookBatchMode = !1,
            worldBookConfig = {
                selectedChapterIndices: [],
                insertPosition: "before_char_def",
                depth: 5,
                order: 100,
                excludeRecursion: !0,
                preventRecursion: !0,
                persistent: !1,
                useChapterRange: !1,
                chapterRangeStart: 1,
                chapterRangeEnd: 5,
                worldBookName: "",
                worldBookEntryUid: null,
                onceArmed: !1,
                lastSyncedHash: "",
                contentPrefix: "<小说原文>",
                contentSuffix: "</小说原文>",
                novelName: "",
                autoAdvanceEnabled: !1,
                autoAdvanceChapterCount: 5,
                autoAdvanceFloorCount: 10,
                autoAdvanceStartChapter: 1,
                autoAdvanceCurrentStart: 1,
                autoAdvanceBaseChatLength: 0,
                autoAdvanceTargetChatLength: 0,
                autoAdvanceIncludeUserMessages: !0,
                autoAdvanceStopAtEnd: !0,
                excludeSuspiciousChapters: !0,
                excludedChapterNumbers: [],
                includedChapterNumbers: []
            },
            worldBookBatchConfig = {
                rangeStart: 1,
                rangeEnd: 1,
                chaptersPerEntry: 1,
                entryNameTemplate: "小说 - {range}章",
                insertPosition: "before_char_def",
                depth: 5,
                order: 100,
                excludeRecursion: !0,
                preventRecursion: !0,
                entryType: "constant",
                overwriteExisting: !0,
                contentPrefix: "<小说原文>",
                contentSuffix: "</小说原文>"
            },
            worldBookEventRegistered = !1,
            worldBookRegisteredEventSource = null,
            worldBookRegisteredEvents = [],
            worldBookOnceArmedAt = 0,
            worldBookAutoAdvanceBusy = !1,
            novelImporterSettingsLoaded = !1,
            worldBookLastInjected = null,
            worldBookContentDirty = !1,
            plotControlBarEnabled = !1,
            plotControlBarCollapsed = !0,
            plotControlStepBusy = !1,
            plotPinnedChapterNumbers = [],
            plotPinnedEntryUid = null,
            plotPinnedBusy = !1,
            plotPinnedEnabled = !1,
            plotPinnedMode = "range", // single | range
            plotPinnedInsertPosition = "before_char_def",
            plotPinnedDepth = 5,
            plotPinnedOrder = 100,
            novelWorldBookCache = { name: "", data: null, ts: 0 },
            plotPinnedToggleBusy = !1,
            plotControlSettingsSaveTimer = null,
            plotControlSettingsHydrated = !1,
            plotControlActiveCharKey = "",
            plotControlActiveChatKey = "",
            plotHydrateRetryTimer = null,
            plotHydrateRetryAttempts = 0,
            plotCharSession = {},
            plotStepInputTimer = null,
            plotRangePreviewTimer = null,
            plotScrubbing = !1,
            // 剧情栏「原文 / 对照」窗口：标签、选中的章、选中的楼层（-1=最新）
            plotReaderTab = "read",
            plotReaderChapter = "",
            plotReaderMsgIdx = -1,
            plotReaderLastOriginalText = "",
            plotCharSwitchBound = !1,
            entryWrapperSyncTimer = null,
            novelAutoRestoreBusy = !1,
            PLOT_BAR_ENABLED_LS_KEY = "novelChatImporter_plotBarEnabled";
        // —— 章节标题格式的唯一真源 ——
        // 新增/调整章节写法（如「章节1」「回1」「节1」）只需改这个常量块，不要在各处再手写副本：
        //   CHAPTER_NUMERAL       数字字符类（阿拉伯 + 中文小写 + 中文大写）
        //   CHAPTER_HEADING_RE    整行章节标题判定
        //   VOLUME_HEADING_RE     整行卷/部标题判定
        //   CHAPTER_LINE_HINT_RE  行首章节提示（不要求整行匹配，用于可疑章节判定）
        //   CHAPTER_TITLE_NUM_RES 从标题解析章号，按优先级排列
        //   CHAPTER_LOOSE_NUM_RES 从注入内容标题里宽松提取章号（世界书恢复）
        //   CHAPTER_STRIP_RES     剥离标题开头的章号前缀（剧情栏显示）
        // "Chapter" 英文前缀单列一份，供评分分支精确复用（不要用整行正则代替）
        const CHAPTER_NUMERAL = "[0-9０-９一二三四五六七八九十百千万零〇两壹贰叁肆伍陆柒捌玖拾佰仟]+",
            // 章节单位：话/話/節 覆盖轻小说和繁体写法
            CHAPTER_UNIT = "章节回部集话話節",
            CHAPTER_TITLE_UNIT = "章节回卷部集话話節",
            // 行首装饰符（☆第1章、◆第1章）；只认这些符号，不把标点也放进来
            CHAPTER_LEADING_MARK = "(?:[☆★※○●◎◇◆□■▪▫~～·・]\\s*)*",
            CHAPTER_LEADING_STRIP_RE = /^[\s☆★※○●◎◇◆□■▪▫~～·・]+/,
            // 「第一卷：第12章 标题」这类带卷前缀的章节标题。
            // 卷号后面允许冒号/逗号/顿号/空格，章号前的「第」可省略（「第一卷：84章」）。
            CHAPTER_VOLUME_PREFIX = "第\\s*" + CHAPTER_NUMERAL + "\\s*[卷部]\\s*[：:，,、.．\\-—]?\\s*",
            // 章号允许「第8.9章」这种手滑写成小数点的形式；解析时把数字拼起来读作 89
            CHAPTER_DOTTED_NUMERAL = "(?:[0-9０-９]{1,3}[.．][0-9０-９]{1,3}|" + CHAPTER_NUMERAL + ")",
            CHAPTER_SPECIAL_TITLE = "(?:前言|序章|楔子|引子|正文|最终章|终章|尾声|后记|完本感言|完结感言|作者感言)",
            CHAPTER_EN_PREFIX = "Chapter\\s*[0-9０-９]+",
            // 「XX番外篇1:标题」这种带前缀的番外（前缀是人名/CP名），不能像「番外」那样按行首判定，
            // 否则正文里提到「…番外…」的句子也会中。这里把形状卡死：前缀 ≤12 个非空白字符、
            // 番外后接可选编号与分隔符、标题尾巴 ≤40 字且不含句末标点。
            CHAPTER_QUALIFIED_SPECIAL_TITLE =
                "[^\\s]{1,12}\\s*番外(?:篇|章)?(?:\\s*" + CHAPTER_NUMERAL + ")?\\s*[：:、.．][^。！？!?；;]{0,40}",
            CHAPTER_EN_HEADING_RE = new RegExp("^\\s*" + CHAPTER_LEADING_MARK + CHAPTER_EN_PREFIX, "i"),
            // 评分用的标准章节标题（第N章/话/節，含【】、[]、（）前缀）
            CHAPTER_STANDARD_HEADING_RE = new RegExp(
                "^\\s*" + CHAPTER_LEADING_MARK + "(?:【\\s*|[\\[（(]\\s*)?" +
                    "(?:" + CHAPTER_VOLUME_PREFIX + ")?" +
                    "第\\s*" + CHAPTER_NUMERAL + "\\s*[章节回话話節]",
                "i"
            ),
            // 带前缀番外（XX番外1:标题）单独识别，用于评分和序号重置豁免
            CHAPTER_QUALIFIED_SPECIAL_HEADING_RE = new RegExp(
                "^\\s*" + CHAPTER_LEADING_MARK + CHAPTER_QUALIFIED_SPECIAL_TITLE,
                "i"
            ),
            CHAPTER_SPECIAL_HEADING_RE = new RegExp(
                "^\\s*" + CHAPTER_LEADING_MARK + "(?:" + CHAPTER_SPECIAL_TITLE + "|番外|" + CHAPTER_QUALIFIED_SPECIAL_TITLE + ")",
                "i"
            ),
            CHAPTER_HEADING_RE = new RegExp(
                "^\\s*" + CHAPTER_LEADING_MARK + "(?:" +
                    "第\\s*" + CHAPTER_NUMERAL + "\\s*[" + CHAPTER_UNIT + "].*|" +
                    // 卷前缀 + 章号（「第一卷：第12章」「第一卷：84章」「第一卷：第8.9章」）。
                    // 不带「第」时只认阿拉伯数字，否则「第一卷：五章一万二爆更」这种公告会被当成第 5 章
                    CHAPTER_VOLUME_PREFIX + "第\\s*" + CHAPTER_DOTTED_NUMERAL + "\\s*[" + CHAPTER_UNIT + "].*|" +
                    CHAPTER_VOLUME_PREFIX + "[0-9０-９]{1,4}\\s*[" + CHAPTER_UNIT + "].*|" +
                    // 卷前缀 + 番外（「第一卷：免费番外：…」）；番外后必须跟分隔符或编号，
                    // 否则「第一卷：番外以添加，…」这种公告也会被当成章节
                    CHAPTER_VOLUME_PREFIX + "(?:[^\\s：:]{0,6}\\s*)?番外(?:篇|章)?(?:\\s*" + CHAPTER_NUMERAL + ")?\\s*[：:、.．\\-].*|" +
                    "[部集]\\s*" + CHAPTER_NUMERAL + ".*|" +
                    "章节\\s*" + CHAPTER_NUMERAL + ".*|" +
                    "回\\s*" + CHAPTER_NUMERAL + ".*|" +
                    "节\\s*" + CHAPTER_NUMERAL + ".*|" +
                    "话\\s*" + CHAPTER_NUMERAL + ".*|" +
                    "話\\s*" + CHAPTER_NUMERAL + ".*|" +
                    "節\\s*" + CHAPTER_NUMERAL + ".*|" +
                    CHAPTER_EN_PREFIX + ".*|" +
                    CHAPTER_NUMERAL + "\\.\\s*[^0-9０-９.\\s].*|" +
                    "【\\s*第\\s*" + CHAPTER_NUMERAL + "\\s*[" + CHAPTER_UNIT + "][^】]*】.*|" +
                    "[\\[（(]\\s*第\\s*" + CHAPTER_NUMERAL + "\\s*[" + CHAPTER_UNIT + "][^\\]）)]*(?:[\\]）)])?.*|" +
                    CHAPTER_SPECIAL_TITLE + "(?:\\s|$|[：:、·-].*)|" +
                    CHAPTER_QUALIFIED_SPECIAL_TITLE + ".*|" +
                    "番外(?:篇|章)?(?:\\s|$|[：:、·-].*|" + CHAPTER_NUMERAL + ".*)" +
                    ")\\s*$",
                "i"
            ),
            VOLUME_HEADING_RE = new RegExp(
                "^\\s*" + CHAPTER_LEADING_MARK + "(?:" +
                    "第\\s*" + CHAPTER_NUMERAL + "\\s*[卷部].*|" +
                    "[卷部]\\s*" + CHAPTER_NUMERAL + ".*|" +
                    "【\\s*第\\s*" + CHAPTER_NUMERAL + "\\s*[卷部][^】]*】.*" +
                    ")\\s*$",
                "i"
            ),
            // 卷号后紧跟冒号/逗号的「第一卷：…」，在「第一卷：第1章」这种写法里
            // 是作者发的卷内公告（请假条、悬赏、上架感言），不是卷标题；
            // 当卷标题会切出一章公告，并让后面所有章节都挂上公告名
            CHAPTER_VOLUME_ANNOUNCEMENT_RE = new RegExp(
                "^\\s*" + CHAPTER_LEADING_MARK + "第\\s*" + CHAPTER_NUMERAL + "\\s*[卷部]\\s*[：:，,]",
                "i"
            ),
            CHAPTER_LINE_HINT_RE = new RegExp(
                "^\\s*" + CHAPTER_LEADING_MARK + "(?:" +
                    "第\\s*" + CHAPTER_NUMERAL + "\\s*[" + CHAPTER_UNIT + "]|" +
                    "章节\\s*" + CHAPTER_NUMERAL + "|" +
                    "回\\s*" + CHAPTER_NUMERAL + "|" +
                    "节\\s*" + CHAPTER_NUMERAL + "|" +
                    "话\\s*" + CHAPTER_NUMERAL + "|" +
                    "話\\s*" + CHAPTER_NUMERAL + "|" +
                    "節\\s*" + CHAPTER_NUMERAL + "|" +
                    "Chapter\\s*[0-9０-９]+|" +
                    "[\\[（(]\\s*第\\s*" + CHAPTER_NUMERAL + "\\s*[" + CHAPTER_UNIT + "]|" +
                    "番外" +
                    ")",
                "i"
            ),
            CHAPTER_TITLE_NUM_RES = [
                // 卷前缀 + 章号（「第一卷：第12章」「第一卷：第8.9章」）。
                // 不带「第」的写法只认阿拉伯数字（「第一卷：84章」），避免把「五章…」的公告当章节
                new RegExp("^\\s*" + CHAPTER_VOLUME_PREFIX + "第\\s*(" + CHAPTER_DOTTED_NUMERAL + ")\\s*[" + CHAPTER_TITLE_UNIT + "]", "i"),
                new RegExp("^\\s*" + CHAPTER_VOLUME_PREFIX + "([0-9０-９]{1,4})\\s*[" + CHAPTER_TITLE_UNIT + "]", "i"),
                new RegExp("^\\s*第\\s*(" + CHAPTER_NUMERAL + ")\\s*[" + CHAPTER_TITLE_UNIT + "]", "i"),
                new RegExp("^\\s*[卷部集]\\s*(" + CHAPTER_NUMERAL + ")", "i"),
                new RegExp("^\\s*(?:章节|回|节|话|話|節)\\s*(" + CHAPTER_NUMERAL + ")", "i"),
                new RegExp("^\\s*【\\s*第\\s*(" + CHAPTER_NUMERAL + ")\\s*[" + CHAPTER_TITLE_UNIT + "]", "i"),
                new RegExp("^\\s*[\\[（(]\\s*第\\s*(" + CHAPTER_NUMERAL + ")\\s*[" + CHAPTER_TITLE_UNIT + "]", "i"),
                new RegExp("^\\s*Chapter\\s*([0-9０-９]+)", "i"),
                new RegExp("^\\s*([0-9０-９]+)\\s*\\.\\s*[^0-9０-９.\\s]", "i"),
                // 纯数字紧贴标题（「2标题」「1082记得回来」）。
                // 这种形状只给 parseChapters 里通过连续编号链判定的行使用，
                // 否则正文里的「621…」也会被当成章号。
                new RegExp("^\\s*([0-9０-９]{1,4})(?![0-9０-９.．、\\s])", "i"),
                // 链式格式的章号：N、N．N空格、[N]/（N）、单独一行 N
                new RegExp("^\\s*[\\[（(]\\s*([0-9０-９]{1,4})\\s*[\\]）)]", "i"),
                new RegExp("^\\s*([0-9０-９]{1,4})\\s*[、．]\\s*\\S", "i"),
                new RegExp("^\\s*([0-9０-９]{1,4})\\s+\\S", "i"),
                new RegExp("^\\s*([0-9０-９]{1,4})\\s*$", "i"),
                // 带前缀番外的编号（XX番外1:标题）
                new RegExp("^\\s*[^\\s]{1,12}?\\s*番外\\s*(?:篇|章)?\\s*(" + CHAPTER_NUMERAL + ")", "i"),
                new RegExp("^\\s*番外\\s*(?:篇|章)?\\s*(" + CHAPTER_NUMERAL + ")", "i")
            ],
            CHAPTER_LOOSE_NUM_RES = [
                new RegExp("第\\s*(" + CHAPTER_NUMERAL + ")\\s*[" + CHAPTER_TITLE_UNIT + "]", "i"),
                new RegExp("^\\s*(?:章节|回|节|话|話|節)\\s*(" + CHAPTER_NUMERAL + ")", "i"),
                new RegExp("^\\s*([0-9０-９]+)\\s*[.．、\\s]", "i"),
                new RegExp("#\\s*([0-9０-９]+)"),
                new RegExp("^\\s*([0-9０-９]{1,4})(?![0-9０-９.．、\\s])", "i"),
                new RegExp("^\\s*[\\[（(]\\s*([0-9０-９]{1,4})\\s*[\\]）)]", "i"),
                new RegExp("^\\s*([0-9０-９]{1,4})\\s*$", "i"),
                new RegExp("番外\\s*(?:篇|章)?\\s*(" + CHAPTER_NUMERAL + ")", "i")
            ],
            CHAPTER_STRIP_RES = [
                // 先剥卷前缀，再交给下面的章号规则（「第一卷：第1章：标题」→「第1章：标题」）
                new RegExp("^\\s*" + CHAPTER_VOLUME_PREFIX),
                new RegExp("^\\s*第\\s*" + CHAPTER_NUMERAL + "\\s*[" + CHAPTER_TITLE_UNIT + "]\\s*[:：、.\\-]?\\s*"),
                new RegExp("^\\s*[\\[（(]\\s*第\\s*" + CHAPTER_NUMERAL + "\\s*[" + CHAPTER_TITLE_UNIT + "]\\s*[\\]）)]?\\s*"),
                new RegExp("^\\s*[\\[（(]\\s*[0-9０-９]{1,4}\\s*[\\]）)]\\s*"),
                new RegExp("^\\s*(?:章节|回|节|话|話|節)\\s*" + CHAPTER_NUMERAL + "\\s*[:：、.\\-]?\\s*"),
                new RegExp("^\\s*[0-9０-９]{1,4}\\s*[、．]\\s*"),
                new RegExp("^\\s*[0-9０-９]{1,4}\\s+"),
                // 纯数字前缀（「1风起」）要剥，但「3月13日」「12点」这类日期/单位不能剥
                new RegExp("^\\s*[0-9０-９]{1,4}(?![0-9０-９.．、\\s月日年号時时点點分秒章回节節卷部篇集话話期页頁条條])")
            ];
        // 移动端在固定面板底部为聊天输入框预留的高度
        const CHAT_INPUT_RESERVE = 48;
        const WORLD_BOOK_STATUS = {
                idle: "未创建注入条目",
                synced: "已同步",
                dirty: "内容已改变，等待更新",
                once: "一次注入已启用",
                persistent: "持续注入已启用",
                closed: "已关闭",
                cleared: "已清空并关闭"
            },
            isMobileViewport = () => {
                const ua = navigator.userAgent || "",
                    isMobileUa = /Android|iPhone|iPad|iPod|Mobile|Silk|Kindle/i.test(ua),
                    coarsePointer = (() => {
                        try {
                            return window.matchMedia("(hover: none) and (pointer: coarse)").matches;
                        } catch (e) {
                            return !1;
                        }
                    })(),
                    widths = [
                        window.innerWidth,
                        window.outerWidth,
                        window.screen?.width,
                        window.screen?.availWidth,
                        window.visualViewport?.width,
                        document.documentElement?.clientWidth
                    ]
                        .map(Number)
                        .filter(Number.isFinite)
                        .filter((v) => v > 0),
                    viewportWidth = widths.length ? Math.min(...widths) : 0;
                return (
                    isMobileUa ||
                    (viewportWidth > 0 && viewportWidth <= 820) ||
                    (coarsePointer && viewportWidth > 0 && viewportWidth <= 1180)
                );
            };
        // 小说相关的输入控件清单：焦点判定（isNovelInputActive）与事件委托（createUI）共用，
        // 早先两边各抄一份，加新弹窗时漏改过。新增外壳只要往这里补一个根选择器。
        const NOVEL_INPUT_SELECTOR = [
            "#novel_importer_container",
            "#novel_importer_fallback_modal",
            "#novel_importer_inline_panel",
            "#novel_replace_modal",
            "#novel_batch_replace_modal",
            "#novel_cache_modal"
        ]
            .map(function (root) {
                return root + " input, " + root + " textarea, " + root + " select";
            })
            .join(", ");
        let _inputHasFocus = !1,
            _pendingRefreshAfterInput = !1,
            _panelScrollLock = null,
            _panelViewportHandler = null,
            _panelViewportTimer = null;
        function isNovelInputActive() {
            try {
                const el = document.activeElement;
                return !!el && $(el).is(NOVEL_INPUT_SELECTOR);
            } catch (e) {
                return !1;
            }
        }
        function shouldPauseDomRefresh() {
            return isMobileViewport() && (_inputHasFocus || isNovelInputActive());
        }
        function syncNovelImporterResponsiveMode() {
            try {
                const mobile = isMobileViewport();
                $("html, body").toggleClass("novel_importer_mobile", mobile);
            } catch (e) {}
        }
        function setImportantStyles($nodes, styles) {
            $nodes.each(function () {
                for (const [name, value] of Object.entries(styles))
                    this.style.setProperty(name, value, "important");
            });
        }
        function scheduleNovelImporterPanelViewportUpdate(delay = 0) {
            (clearTimeout(_panelViewportTimer),
                (_panelViewportTimer = setTimeout(() => {
                    (forceNovelImporterMobileLayout(), keepNovelFocusedInputVisible());
                }, delay)));
        }
        function keepNovelFocusedInputVisible() {
            const panel = document.getElementById("novel_importer_inline_panel"),
                el = document.activeElement;
            if (!panel || !el || !panel.contains(el)) return;
            const panelRect = panel.getBoundingClientRect(),
                elRect = el.getBoundingClientRect();
            elRect.bottom > panelRect.bottom - 128
                ? (panel.scrollTop += elRect.bottom - (panelRect.bottom - 128))
                : elRect.top < panelRect.top + 76 && (panel.scrollTop -= panelRect.top + 76 - elRect.top);
        }
        function forceNovelImporterMobileLayout() {
            if ((syncNovelImporterResponsiveMode(), !isMobileViewport())) return;
            setImportantStyles($("#novel_importer_container,#novel_importer_inline_panel"), {
                width: "100%",
                "max-width": "100%",
                "box-sizing": "border-box",
                "overflow-x": "hidden"
            });
            const panelRect = (function () {
                const vv = window.visualViewport,
                    fallbackHeight =
                        (window.innerWidth || document.documentElement,
                        window.innerHeight || document.documentElement?.clientHeight || 640),
                    widthBase = Math.max(
                        280,
                        ...[
                            window.innerWidth,
                            document.documentElement?.clientWidth,
                            document.body?.clientWidth,
                            Number(vv?.width) || 0
                        ]
                            .map(Number)
                            .filter(Number.isFinite)
                            .filter((v) => v > 0)
                    ),
                    screenWidths = [window.screen?.width, window.screen?.availWidth]
                        .map(Number)
                        .filter(Number.isFinite)
                        .filter((v) => v > 0 && v <= 1.35 * widthBase),
                    width = Math.max(widthBase, ...screenWidths),
                    rawScreenHeights = [window.screen?.height, window.screen?.availHeight]
                        .map(Number)
                        .filter(Number.isFinite)
                        .filter((v) => v > 0),
                    dpr = Number(window.devicePixelRatio) || 1,
                    screenCssHeights = rawScreenHeights.flatMap((v) => [v, v / dpr]),
                    height = Math.max(
                        320,
                        fallbackHeight,
                        Number(vv?.height) || 0,
                        Number(document.documentElement?.clientHeight) || 0,
                        Number(document.body?.clientHeight) || 0,
                        ...screenCssHeights.filter(
                            (v) =>
                                v >= 320 && v <= 1.8 * Math.max(fallbackHeight, Number(vv?.height) || 0, 320)
                        )
                    ),
                    left = Math.max(0, Number(vv?.offsetLeft) || 0),
                    top = Math.max(0, Number(vv?.offsetTop) || 0),
                    panelTop = Math.round(top + 10),
                    // 面板底部为聊天输入框预留的固定高度；早期版本在这里探测输入框位置，
                    // 但探测结果从未参与计算（恒返回 48），已删除以免误导
                    bottomReserve = CHAT_INPUT_RESERVE,
                    minPanelHeight = Math.min(360, Math.max(260, height - panelTop - 10 - 96)),
                    panelHeight =
                        ((value = Math.round(height - panelTop - 10 - bottomReserve)),
                        (min = minPanelHeight),
                        (max = Math.max(minPanelHeight, height - panelTop - 20)) < min
                            ? Math.max(0, max)
                            : Math.min(max, Math.max(min, value)));
                var value, min, max;
                return {
                    left: Math.round(left + 10),
                    top: panelTop,
                    right: 10,
                    bottom: bottomReserve,
                    width: Math.max(280, Math.round(width - 20)),
                    height: panelHeight
                };
            })();
            (setImportantStyles($("#novel_importer_inline_panel"), {
                position: "fixed",
                left: `${panelRect.left}px`,
                top: `${panelRect.top}px`,
                right: `${panelRect.right}px`,
                bottom: "auto",
                width: "auto",
                "max-width": "none",
                height: `${panelRect.height}px`,
                "max-height": `${panelRect.height}px`,
                margin: "0",
                padding: "10px",
                "overflow-y": "scroll",
                "overflow-x": "hidden",
                "overscroll-behavior": "contain",
                "-webkit-overflow-scrolling": "touch",
                "touch-action": "pan-y",
                "z-index": "2147483000"
            }),
                setImportantStyles(
                    $(
                        "#novel_importer_container .menu_button,#novel_importer_inline_panel .menu_button,#novel_importer_fallback_modal .menu_button"
                    ),
                    {
                        display: "flex",
                        "align-items": "center",
                        "justify-content": "center",
                        width: "100%",
                        "min-width": "0",
                        "max-width": "100%",
                        "min-height": "38px",
                        height: "auto",
                        padding: "7px 10px",
                        "writing-mode": "horizontal-tb",
                        "text-orientation": "mixed",
                        "white-space": "normal",
                        "word-break": "keep-all",
                        "overflow-wrap": "normal",
                        "word-wrap": "normal",
                        "text-wrap": "wrap",
                        flex: "1 1 auto",
                        "text-align": "center",
                        "box-sizing": "border-box"
                    }
                ),
                // 「缓存」是个小按钮，不跟着其它按钮一起拉满整行，只贴在「选择 TXT 小说」右边
                setImportantStyles($("#novel_importer_container #novel_cache_btn"), {
                    flex: "0 0 auto",
                    width: "auto",
                    "min-width": "0",
                    "max-width": "none",
                    padding: "7px 12px"
                }),
                setImportantStyles($(".novel_importer_panel_header"), {
                    display: "flex",
                    "flex-direction": "row",
                    "align-items": "center",
                    "justify-content": "space-between",
                    gap: "12px",
                    width: "100%",
                    "box-sizing": "border-box"
                }),
                setImportantStyles($(".novel_importer_panel_title"), {
                    flex: "1 1 auto",
                    "min-width": "0",
                    "white-space": "nowrap",
                    "writing-mode": "horizontal-tb",
                    "text-orientation": "mixed",
                    "word-break": "keep-all",
                    overflow: "hidden",
                    "text-overflow": "ellipsis"
                }),
                setImportantStyles(
                    $(
                        "#novel_importer_inline_close,#novel_importer_fallback_close,.novel_importer_header_close"
                    ),
                    {
                        display: "inline-flex",
                        "align-items": "center",
                        "justify-content": "center",
                        width: "auto",
                        "min-width": "72px",
                        "max-width": "40vw",
                        flex: "0 0 auto",
                        "white-space": "nowrap",
                        "text-wrap": "nowrap",
                        "word-break": "keep-all"
                    }
                ),
                setImportantStyles(
                    $(
                        "#novel_importer_container .novel_stats_row,#novel_importer_container .novel_import_action,#novel_importer_container .novel_search_row,#novel_importer_container .novel_button_row,#novel_importer_container .novel_range_row,#novel_importer_container .novel_preview_controls"
                    ),
                    {
                        display: "flex",
                        "flex-direction": "column",
                        "align-items": "stretch",
                        width: "100%",
                        "max-width": "100%",
                        "box-sizing": "border-box"
                    }
                ),
                setImportantStyles(
                    $(
                        "#novel_importer_container input.text_pole,#novel_importer_container select.text_pole,#novel_importer_container textarea.text_pole"
                    ),
                    { width: "100%", "min-width": "0", "max-width": "100%", "box-sizing": "border-box" }
                ));
        }
        let chapterPreviewLimit = 10,
            floorPreviewLimit = 20,
            worldBookListLimit = 20,
            cachedChapterText = null,
            cachedChapters = null,
            cachedChapterIndexMap = null,
            cachedPlotUnitKey = null,
            cachedPlotUnitWords = null,
            cachedChunksText = null,
            cachedChunksKey = "",
            cachedChunks = null;
        const $ui = {};
        function sleep(ms = 0) {
            return new Promise((resolve) => setTimeout(resolve, ms));
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
            return String(text ?? "")
                .replace(/\r\n/g, "\n")
                .replace(/\r/g, "\n");
        }
        function normalizeFullWidthDigits(value) {
            return String(value ?? "").replace(/[０-９]/g, function (ch) {
                return String.fromCharCode(ch.charCodeAt(0) - 0xfee0);
            });
        }
        function getChapterNumber(chapter, index) {
            var num = Number(chapter && chapter.chapterNumber);
            return Number.isFinite(num) ? num : index + 1;
        }
        function getChapterNumberBounds(chapters, fallbackTotal) {
            if (Array.isArray(chapters) && chapters.length) {
                var nums = chapters.map(function (chapter, index) {
                    return getChapterNumber(chapter, index);
                });
                return { min: Math.min.apply(null, nums), max: Math.max.apply(null, nums) };
            }
            var total = Math.max(1, Number(fallbackTotal) || 1);
            return { min: 1, max: total };
        }
        function getDefaultStartChapterNumber(chapters) {
            var bounds = getChapterNumberBounds(chapters);
            return bounds.max >= 1 ? 1 : bounds.min;
        }
        function parseChapterNumberValue(value, fallback, minChapter) {
            if (null === value || void 0 === value || "" === String(value).trim()) return fallback;
            var num = Number(value);
            return Number.isFinite(num) ? Math.max(minChapter, Math.floor(num)) : fallback;
        }
        function getNullableIntegerInputValue(selectorOrElement) {
            var raw = String($(selectorOrElement).val() ?? "").trim();
            if (!raw) return null;
            var num = Number(raw);
            return Number.isFinite(num) ? Math.floor(num) : null;
        }
        function setRangeInputValue(selectorOrElement, value, force) {
            var $input = $(selectorOrElement);
            if (!$input.length) return;
            (force || !$input.is(":focus")) && $input.val(value);
        }
        function numberToChinese(value) {
            var num = Math.max(0, Math.floor(Number(value) || 0)),
                digits = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
            function sectionToChinese(section) {
                var units = ["", "十", "百", "千"],
                    result = "",
                    zeroPending = !1;
                for (var i = 3; i >= 0; i--) {
                    var unitValue = Math.pow(10, i),
                        digit = Math.floor(section / unitValue) % 10;
                    digit
                        ? ((zeroPending && result && (result += "零"),
                          (zeroPending = !1),
                          (result += digits[digit] + units[i])))
                        : result && i > 0 && (zeroPending = !0);
                }
                return result.replace(/^一十/, "十") || "零";
            }
            if (num < 10000) return sectionToChinese(num);
            var high = Math.floor(num / 10000),
                low = num % 10000,
                result = sectionToChinese(high) + "万";
            return low ? result + (low < 1000 ? "零" : "") + sectionToChinese(low) : result;
        }
        function formatChapterTriggerKeyword(number) {
            return 0 === Number(number) ? "前言" : "第" + numberToChinese(number) + "章";
        }
        function getChapterDisplayTitle(chapter, index) {
            var parts = [];
            chapter && chapter.volumeTitle && parts.push(chapter.volumeTitle);
            chapter && chapter.title && parts.push(chapter.title);
            return parts.length ? parts.join(" / ") : "第" + getChapterNumber(chapter, index) + "章";
        }
        function stripPlotTitleNumber(title) {
            var text = String(title || ""),
                // 先去掉行首装饰符，否则「☆第1章」会卡在第一个模式之前
                stripped = text.replace(CHAPTER_LEADING_STRIP_RE, "");
            for (var i = 0; i < CHAPTER_STRIP_RES.length; i++)
                stripped = stripped.replace(CHAPTER_STRIP_RES[i], "");
            stripped = stripped
                .replace(/^\s*[0-9０-９]+\s*[.．、]\s*/, "")
                .replace(/^\s*[0-9０-９]+\s+/, "")
                .replace(/^[\s☆★※○●◎◇◆□■▪▫~～·・、，,.\-_:：;；!！?？|｜]+/, "")
                .trim();
            return stripped || text;
        }
        function shouldExcludeChapter(chapter, index) {
            var number = getChapterNumber(chapter, index),
                excluded = Array.isArray(worldBookConfig.excludedChapterNumbers)
                    ? worldBookConfig.excludedChapterNumbers
                    : [],
                included = Array.isArray(worldBookConfig.includedChapterNumbers)
                    ? worldBookConfig.includedChapterNumbers
                    : [];
            if (included.indexOf(number) >= 0) return !1;
            return (
                excluded.indexOf(number) >= 0 ||
                (!!worldBookConfig.excludeSuspiciousChapters && !!(chapter && chapter.suspicious))
            );
        }
        function getChapterItemsByNumberRange(chapters, start, end) {
            var items = [];
            if (!Array.isArray(chapters) || !chapters.length) return items;
            for (var i = 0; i < chapters.length; i++) {
                var number = getChapterNumber(chapters[i], i);
                number >= start &&
                    number <= end &&
                    !shouldExcludeChapter(chapters[i], i) &&
                    items.push({ index: i, number: number, chapter: chapters[i] });
            }
            return items;
        }
        function normalizeWorldBookRange(cfg, totalChapters, syncInputs) {
            cfg = cfg || worldBookConfig;
            var bounds = getChapterNumberBounds(Array.isArray(totalChapters) ? totalChapters : null, totalChapters),
                minChapter = bounds.min,
                maxChapter = bounds.max;
            var start = parseInt(cfg.chapterRangeStart, 10),
                end = parseInt(cfg.chapterRangeEnd, 10);
            // 非法起点落到最小章；非法终点落到「起点起共 5 章」，绝不默认全书
            if (!Number.isFinite(start) || start < minChapter) start = minChapter;
            if (!Number.isFinite(end) || end < minChapter)
                end = Math.min(maxChapter, start + 4);
            var swapped = !1;
            if ((start = Math.max(minChapter, Math.min(start, maxChapter))) > (end = Math.max(minChapter, Math.min(end, maxChapter)))) {
                var tmp = start;
                ((start = end), (end = tmp), (swapped = !0));
            }
            return (
                (cfg.chapterRangeStart = start),
                (cfg.chapterRangeEnd = end),
                syncInputs &&
                    ($("#novel_wb_range_start").attr("min", minChapter).attr("max", maxChapter).val(start),
                    $("#novel_wb_range_end").attr("min", minChapter).attr("max", maxChapter).val(end)),
                { start: start, end: end, swapped: swapped }
            );
        }
        function saveWorldBookConfig() {
            if (!novelImporterSettingsLoaded) return;
            try {
                var ctx = getContext(),
                    extSettings = getExtensionSettingsRoot();
                (function () {
                        var prevBag = extSettings.novelChatImporter_worldBook || {},
                            nextBag = {
                        mode: getNovelImporterMode(),
                        config: {
                            selectedChapterIndices: worldBookConfig.selectedChapterIndices.slice(),
                            insertPosition: worldBookConfig.insertPosition,
                            depth: worldBookConfig.depth,
                            order: worldBookConfig.order,
                            excludeRecursion: !1 !== worldBookConfig.excludeRecursion,
                            preventRecursion: !1 !== worldBookConfig.preventRecursion,
                            persistent: worldBookConfig.persistent,
                            useChapterRange: worldBookConfig.useChapterRange,
                            chapterRangeStart: worldBookConfig.chapterRangeStart,
                            chapterRangeEnd: worldBookConfig.chapterRangeEnd,
                            worldBookName: worldBookConfig.worldBookName || "",
                            worldBookEntryUid: worldBookConfig.worldBookEntryUid,
                            onceArmed: !!worldBookConfig.onceArmed,
                            lastSyncedHash: worldBookConfig.lastSyncedHash || "",
                            contentPrefix: worldBookConfig.contentPrefix ?? "",
                            contentSuffix: worldBookConfig.contentSuffix ?? "",
                            novelName: worldBookConfig.novelName || novelFileName || "",
                            autoAdvanceEnabled: !!worldBookConfig.autoAdvanceEnabled,
                            autoAdvanceChapterCount: Math.max(
                                1,
                                Number(worldBookConfig.autoAdvanceChapterCount) || 5
                            ),
                            autoAdvanceFloorCount: Math.max(
                                1,
                                Number(worldBookConfig.autoAdvanceFloorCount) || 10
                            ),
                            autoAdvanceStartChapter: parseChapterNumberValue(
                                worldBookConfig.autoAdvanceStartChapter,
                                1,
                                0
                            ),
                            autoAdvanceCurrentStart: parseChapterNumberValue(
                                worldBookConfig.autoAdvanceCurrentStart,
                                parseChapterNumberValue(worldBookConfig.autoAdvanceStartChapter, 1, 0),
                                0
                            ),
                            autoAdvanceBaseChatLength: Math.max(
                                0,
                                Number(worldBookConfig.autoAdvanceBaseChatLength) || 0
                            ),
                            autoAdvanceTargetChatLength: Math.max(
                                0,
                                Number(worldBookConfig.autoAdvanceTargetChatLength) || 0
                            ),
                            autoAdvanceIncludeUserMessages:
                                !1 !== worldBookConfig.autoAdvanceIncludeUserMessages,
                            autoAdvanceStopAtEnd: !!worldBookConfig.autoAdvanceStopAtEnd,
                            excludeSuspiciousChapters: !!worldBookConfig.excludeSuspiciousChapters,
                            excludedChapterNumbers: Array.isArray(worldBookConfig.excludedChapterNumbers)
                                ? worldBookConfig.excludedChapterNumbers.slice()
                                : [],
                            includedChapterNumbers: Array.isArray(worldBookConfig.includedChapterNumbers)
                                ? worldBookConfig.includedChapterNumbers.slice()
                                : []
                        },
                        batchConfig: {
                            rangeStart: worldBookBatchConfig.rangeStart,
                            rangeEnd: worldBookBatchConfig.rangeEnd,
                            chaptersPerEntry: worldBookBatchConfig.chaptersPerEntry,
                            entryNameTemplate: worldBookBatchConfig.entryNameTemplate,
                            insertPosition: worldBookBatchConfig.insertPosition,
                            depth: worldBookBatchConfig.depth,
                            order: worldBookBatchConfig.order,
                            excludeRecursion: !1 !== worldBookBatchConfig.excludeRecursion,
                            preventRecursion: !1 !== worldBookBatchConfig.preventRecursion,
                            entryType: worldBookBatchConfig.entryType,
                            overwriteExisting: !!worldBookBatchConfig.overwriteExisting,
                            contentPrefix: worldBookBatchConfig.contentPrefix ?? "",
                            contentSuffix: worldBookBatchConfig.contentSuffix ?? ""
                        }
                    };
                        // 剧情栏设置：未 hydrate 前绝不能用内存默认 false 覆盖已落盘的 enabled
                        if (prevBag.plotControlByChar) nextBag.plotControlByChar = prevBag.plotControlByChar;
                        if (prevBag.plotControlCharKey) nextBag.plotControlCharKey = prevBag.plotControlCharKey;
                        nextBag.plotControl = Object.assign(
                            {},
                            prevBag.plotControl && typeof prevBag.plotControl === "object" ? prevBag.plotControl : {},
                            {
                                collapsed: !!plotControlBarCollapsed
                            }
                        );
                        if (plotControlSettingsHydrated) {
                            nextBag.plotControl.enabled = !!plotControlBarEnabled;
                            nextBag.plotBarEnabled = !!plotControlBarEnabled;
                        } else {
                            if (prevBag.plotControl && "enabled" in prevBag.plotControl)
                                nextBag.plotControl.enabled = !!prevBag.plotControl.enabled;
                            else if ("plotBarEnabled" in prevBag) nextBag.plotControl.enabled = !!prevBag.plotBarEnabled;
                            if ("plotBarEnabled" in prevBag) nextBag.plotBarEnabled = !!prevBag.plotBarEnabled;
                            else if (prevBag.plotControl && "enabled" in prevBag.plotControl)
                                nextBag.plotBarEnabled = !!prevBag.plotControl.enabled;
                        }
                        extSettings.novelChatImporter_worldBook = nextBag;
                    })();
                // 新版酒馆没有 saveSettings，只有 saveSettingsDebounced；
                // 只认前者会导致配置（尤其前置/后置文字）从来没落盘，重启就丢
                "function" == typeof ctx.saveSettings
                    ? ctx.saveSettings()
                    : "function" == typeof ctx.saveSettingsDebounced && ctx.saveSettingsDebounced();
            } catch (e) {}
        }
        function switchNovelMode(mode) {
            (ensureNovelImporterExtendedUI(),
                (worldBookMode = "worldbook" === mode),
                (worldBookBatchMode = "batch_worldbook" === mode),
                $('input[name="novel_mode"]')
                    .prop("checked", !1)
                    .filter(function () {
                        return $(this).val() === mode;
                    })
                    .prop("checked", !0),
                $('input[name="novel_mode"]').each(function () {
                    $(this).closest("label").toggleClass("novel_tab_active", $(this).prop("checked"));
                }),
                worldBookMode
                    ? ($(".novel_import_mode_section").hide(),
                      $(".novel_worldbook_batch_section").hide(),
                      $(".novel_worldbook_section").show(),
                      novelText && renderWorldBookChapterList(),
                      (function () {
                          try {
                              $("#novel_wb_position").val(worldBookConfig.insertPosition);
                              var isDepth = isNovelWorldBookDepthPosition(worldBookConfig.insertPosition);
                              ($("#novel_wb_depth").val(worldBookConfig.depth).toggle(isDepth),
                                  $("#novel_wb_depth_label").toggle(isDepth),
                                  $("#novel_wb_order").val(worldBookConfig.order),
                                  $("#novel_wb_content_prefix").val(
                                      worldBookConfig.contentPrefix ?? "<小说原文>"
                                  ),
                                  $("#novel_wb_content_suffix").val(
                                      worldBookConfig.contentSuffix ?? "</小说原文>"
                                  ),
                                  $('input[name="novel_wb_persist"]')
                                      .prop("checked", !1)
                                      .filter(function () {
                                          return (
                                              $(this).val() ===
                                              (worldBookConfig.persistent ? "always" : "once")
                                          );
                                      })
                                      .prop("checked", !0),
                                  $("#novel_wb_persist_status").text(
                                      "注入方式: " + (worldBookConfig.persistent ? "一直持续" : "只持续一次")
                                  ),
                                  $("#novel_wb_use_range").prop("checked", !!worldBookConfig.useChapterRange),
                                  $("#novel_wb_range_start")
                                      .val(worldBookConfig.chapterRangeStart)
                                      .prop("disabled", !worldBookConfig.useChapterRange),
                                  $("#novel_wb_range_end")
                                      .val(worldBookConfig.chapterRangeEnd)
                                      .prop("disabled", !worldBookConfig.useChapterRange),
                                  updateWorldBookAutoAdvanceStatus());
                          } catch (e) {}
                      })())
                    : worldBookBatchMode
                      ? ($(".novel_import_mode_section").hide(),
                        $(".novel_worldbook_section").hide(),
                        $(".novel_worldbook_batch_section").show(),
                        updateWorldBookBatchPreview())
                      : ($(".novel_import_mode_section").show(),
                        $(".novel_worldbook_section").hide(),
                        $(".novel_worldbook_batch_section").hide()),
                saveWorldBookConfig(),
                registerWorldBookEvents(),
                updateRangeVisibility());
        }
        function setExcludeSuspiciousChapters(value, message) {
            ((worldBookConfig.excludeSuspiciousChapters = !!value),
                $("#novel_exclude_suspicious_global,#novel_wb_exclude_suspicious").prop(
                    "checked",
                    worldBookConfig.excludeSuspiciousChapters
                ),
                (worldBookLastInjected = null),
                message && markWorldBookContentDirty(message),
                saveWorldBookConfig(),
                scheduleRefreshAll(),
                renderWorldBookChapterList(),
                updateWorldBookBatchPreview());
        }
        function renderWorldBookChapterList() {
            var $list = $("#novel_wb_chapter_list");
            if (novelText) {
                var chapters = getCachedChapters(novelText);
                if (chapters.length) {
                    var chapterBounds = getChapterNumberBounds(chapters),
                        minChapterNumber = chapterBounds.min,
                        maxChapterNumber = chapterBounds.max;
                    ((worldBookConfig.selectedChapterIndices = worldBookConfig.selectedChapterIndices.filter(
                        function (i) {
                            return i < chapters.length;
                        }
                    )),
                        normalizeWorldBookRange(worldBookConfig, chapters, !1));
                    for (var sel = {}, si = 0; si < worldBookConfig.selectedChapterIndices.length; si++)
                        sel[worldBookConfig.selectedChapterIndices[si]] = !0;
                    ((worldBookListLimit = Math.max(20, Number(worldBookListLimit) || 20)),
                        (worldBookListLimit = Math.min(worldBookListLimit, chapters.length)));
                    var rangeChecked = worldBookConfig.useChapterRange ? "checked" : "",
                        rangeDisabled = worldBookConfig.useChapterRange ? "" : "disabled",
                        html = "";
                    ((html +=
                        '<div class="novel_wb_range_box" style="margin-bottom:8px;padding:8px;border-radius:6px;background:rgba(255,255,255,0.04);"><label class="checkbox_label" style="margin:0 0 6px 0;"><input type="checkbox" id="novel_wb_exclude_suspicious" ' +
                        (worldBookConfig.excludeSuspiciousChapters ? "checked" : "") +
                        ' /> 自动排除目录/公告类章节</label><label class="checkbox_label" style="margin:0 0 6px 0;"><input type="checkbox" id="novel_wb_use_range" ' +
                        rangeChecked +
                        ' /> 使用章节范围注入</label><div class="novel_range_row"><input class="text_pole" type="number" id="novel_wb_range_start" min="' +
                        minChapterNumber +
                        '" max="' +
                        maxChapterNumber +
                        '" value="' +
                        worldBookConfig.chapterRangeStart +
                        '" placeholder="起始章" ' +
                        rangeDisabled +
                        ' /><input class="text_pole" type="number" id="novel_wb_range_end" min="' +
                        minChapterNumber +
                        '" max="' +
                        maxChapterNumber +
                        '" value="' +
                        worldBookConfig.chapterRangeEnd +
                        '" placeholder="结束章" ' +
                        rangeDisabled +
                        ' /></div><div class="novel_empty_hint" style="padding:4px 0 0 0;font-size:0.85em;">启用后按填写范围注入，忽略下方手动勾选。当前共 ' +
                        chapters.length +
                        " 章。</div></div>"),
                        (html +=
                            '<div class="novel_wb_chapter_tools" style="display:flex;gap:6px;margin-bottom:6px;flex-wrap:wrap;"><button class="menu_button novel_wb_select_all" style="flex:1;">全选已显示</button><button class="menu_button novel_wb_select_all_all" style="flex:1;">全选全部</button><button class="menu_button novel_wb_deselect_all" style="flex:1;">取消全选</button></div>'));
                    for (var ci = 0; ci < chapters.length && ci < worldBookListLimit; ci++) {
                        var ch = chapters[ci],
                            excluded = shouldExcludeChapter(ch, ci),
                            checked = sel[ci] && !excluded ? "checked" : "",
                            disabled = excluded ? "disabled" : "",
                            suspiciousInfo = ch.suspicious
                                ? '<span class="novel_hit_badge">可疑：' +
                                  escapeHtml(ch.suspiciousReason || "可能不是正文") +
                                  "</span>"
                                : "";
                        html +=
                            '<label class="checkbox_label" style="padding:3px 0;display:flex;align-items:center;gap:6px;border-bottom:1px solid rgba(255,255,255,0.05);"><input type="checkbox" class="novel_wb_chapter_cb" data-index="' +
                            ci +
                            '" ' +
                            checked +
                            " " +
                            disabled +
                            ' /><span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"><b>' +
                            escapeHtml(getChapterDisplayTitle(ch, ci)) +
                            "</b>" +
                            suspiciousInfo +
                            '</span><span class="novel_chapter_meta">' +
                            String(ch.content.length).replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
                            "字</span></label>";
                    }
                    var totalChapters = chapters.length;
                    ((html += '<div class="novel_button_row" style="margin-top:8px;">'),
                        totalChapters > worldBookListLimit
                            ? ((html +=
                                  '<button class="menu_button" id="novel_wb_show_more" style="flex:1;">加载更多章节（+30，剩余 ' +
                                  (totalChapters - worldBookListLimit) +
                                  "）</button>"),
                              (html +=
                                  '<button class="menu_button" id="novel_wb_show_all" style="flex:1;">显示全部章节</button>'))
                            : (html +=
                                  '<div class="novel_empty_hint" style="width:100%;text-align:center;">已显示全部章节</div>'),
                        (html += "</div>"),
                        requestDomUpdate(function () {
                            ($list.html(html),
                                $list.find("#novel_wb_exclude_suspicious").on("change", function () {
                                    setExcludeSuspiciousChapters(
                                        $(this).prop("checked"),
                                        "可疑章节过滤已改变，按“更新注入内容”同步到世界书条目"
                                    );
                                }),
                                $list.find("#novel_wb_use_range").on("change", function () {
                                    ((worldBookConfig.useChapterRange = $(this).prop("checked")),
                                        (worldBookLastInjected = null),
                                        markWorldBookContentDirty(
                                            "章节范围模式已改变，按“更新注入内容”同步到世界书条目"
                                        ),
                                        saveWorldBookConfig(),
                                        renderWorldBookChapterList());
                                }),
                                $list
                                    .find("#novel_wb_range_start,#novel_wb_range_end")
                                    .on("input change", function () {
                                        var startVal = parseInt(
                                                $list.find("#novel_wb_range_start").val(),
                                                10
                                            ),
                                            endVal = parseInt($list.find("#novel_wb_range_end").val(), 10);
                                        (!isNaN(startVal) &&
                                            startVal >= minChapterNumber &&
                                            (worldBookConfig.chapterRangeStart = Math.min(startVal, maxChapterNumber)),
                                            !isNaN(endVal) &&
                                                endVal >= minChapterNumber &&
                                                (worldBookConfig.chapterRangeEnd = Math.min(endVal, maxChapterNumber)));
                                        var range = normalizeWorldBookRange(worldBookConfig, chapters, !0);
                                        ((worldBookLastInjected = null),
                                            markWorldBookContentDirty(
                                                range.swapped
                                                    ? "章节范围已自动修正，按“更新注入内容”同步到世界书条目"
                                                    : "章节范围已改变，按“更新注入内容”同步到世界书条目"
                                            ),
                                            saveWorldBookConfig());
                                    }),
                                $list.find("#novel_wb_show_more").on("click", function () {
                                    ((worldBookListLimit = Math.min(totalChapters, worldBookListLimit + 30)),
                                        renderWorldBookChapterList());
                                }),
                                $list.find("#novel_wb_show_all").on("click", function () {
                                    ((worldBookListLimit = totalChapters), renderWorldBookChapterList());
                                }),
                                $list.find(".novel_wb_select_all").on("click", function () {
                                    $list
                                        .find(".novel_wb_chapter_cb:not(:disabled)")
                                        .prop("checked", !0)
                                        .trigger("change");
                                }),
                                $list.find(".novel_wb_select_all_all").on("click", function () {
                                    ((worldBookConfig.selectedChapterIndices = chapters
                                        .map(function (_, i) {
                                            return i;
                                        })
                                        .filter(function (i) {
                                            return !shouldExcludeChapter(chapters[i], i);
                                        })),
                                        (worldBookLastInjected = null),
                                        markWorldBookContentDirty(
                                            "章节范围模式已改变，按“更新注入内容”同步到世界书条目"
                                        ),
                                        saveWorldBookConfig(),
                                        renderWorldBookChapterList());
                                }),
                                $list.find(".novel_wb_deselect_all").on("click", function () {
                                    ((worldBookConfig.selectedChapterIndices = []),
                                        (worldBookLastInjected = null),
                                        markWorldBookContentDirty(
                                            "章节范围模式已改变，按“更新注入内容”同步到世界书条目"
                                        ),
                                        saveWorldBookConfig(),
                                        renderWorldBookChapterList());
                                }),
                                $list.find(".novel_wb_chapter_cb").on("change", function () {
                                    var idx = Number($(this).data("index"));
                                    ($(this).prop("checked")
                                        ? worldBookConfig.selectedChapterIndices.indexOf(idx) < 0 &&
                                          worldBookConfig.selectedChapterIndices.push(idx)
                                        : (worldBookConfig.selectedChapterIndices =
                                              worldBookConfig.selectedChapterIndices.filter(function (i) {
                                                  return i !== idx;
                                              })),
                                        worldBookConfig.selectedChapterIndices.sort(function (a, b) {
                                            return a - b;
                                        }),
                                        (worldBookLastInjected = null),
                                        markWorldBookContentDirty(
                                            "章节范围已改变，按“更新注入内容”同步到世界书条目"
                                        ),
                                        saveWorldBookConfig());
                                }));
                        }));
                } else $list.html('<div class="novel_empty_hint">未解析到章节</div>');
            } else $list.html('<div class="novel_empty_hint">请先选择 TXT 文件</div>');
        }
        function removeWorldBookEventListener(source, name) {
            source &&
                name &&
                ("function" == typeof source.removeListener
                    ? source.removeListener(name, onWorldBookOnceGenerationDone)
                    : "function" == typeof source.off && source.off(name, onWorldBookOnceGenerationDone));
        }
        function unregisterWorldBookEvents() {
            try {
                for (
                    var source = worldBookRegisteredEventSource, i = 0;
                    i < worldBookRegisteredEvents.length;
                    i++
                )
                    removeWorldBookEventListener(source, worldBookRegisteredEvents[i]);
            } catch (e) {}
            ((worldBookEventRegistered = !1),
                (worldBookRegisteredEventSource = null),
                (worldBookRegisteredEvents = []));
        }
        function registerWorldBookEvents() {
            try {
                var ctx = getContext();
                if (!ctx.eventSource || !ctx.eventSource.on) return void unregisterWorldBookEvents();
                var events = (function () {
                    for (
                        var ctx = getContext(),
                            t = ctx.eventTypes || ctx.event_types || {},
                            names = [
                                t.GENERATION_ENDED,
                                t.GENERATION_STOPPED,
                                t.GENERATION_INTERRUPTED,
                                t.GENERATION_AFTER_COMMANDS,
                                "generation_ended",
                                "generation_stopped",
                                "generation_interrupted",
                                "generation_after_commands"
                            ],
                            autoNames = [
                                t.MESSAGE_SENT,
                                t.MESSAGE_RECEIVED,
                                t.MESSAGE_ADDED,
                                t.MESSAGE_UPDATED,
                                t.CHAT_CHANGED,
                                "message_sent",
                                "message_received",
                                "message_added",
                                "message_updated",
                                "chat_changed"
                            ],
                            seen = {},
                            out = [],
                            all = worldBookConfig.autoAdvanceEnabled ? names.concat(autoNames) : names,
                            i = 0;
                        i < all.length;
                        i++
                    ) {
                        var name = all[i];
                        name && !seen[name] && ((seen[name] = !0), out.push(name));
                    }
                    return out;
                })();
                if (
                    !worldBookMode ||
                    !events.length ||
                    (!worldBookConfig.autoAdvanceEnabled && !worldBookConfig.onceArmed)
                )
                    return void unregisterWorldBookEvents();
                var sameSource = worldBookRegisteredEventSource === ctx.eventSource,
                    sameEvents =
                        worldBookRegisteredEvents.length === events.length &&
                        worldBookRegisteredEvents.every(function (name, i) {
                            return name === events[i];
                        });
                if (worldBookEventRegistered && sameSource && sameEvents) return;
                unregisterWorldBookEvents();
                for (var ai = 0; ai < events.length; ai++)
                    ctx.eventSource.on(events[ai], onWorldBookOnceGenerationDone);
                ((worldBookEventRegistered = !0),
                    (worldBookRegisteredEventSource = ctx.eventSource),
                    (worldBookRegisteredEvents = events.slice()));
            } catch (e) {}
        }
        async function onWorldBookOnceGenerationDone(eventData) {
            if (worldBookMode && worldBookConfig.autoAdvanceEnabled) await handleWorldBookAutoAdvance();
            if (
                worldBookMode &&
                !worldBookConfig.autoAdvanceEnabled &&
                !worldBookConfig.persistent &&
                worldBookConfig.onceArmed &&
                !(worldBookOnceArmedAt && Date.now() - worldBookOnceArmedAt < 300)
            )
                try {
                    await (async function () {
                        if (
                            !worldBookConfig.worldBookName ||
                            null === worldBookConfig.worldBookEntryUid ||
                            void 0 === worldBookConfig.worldBookEntryUid
                        )
                            return;
                        const data = await loadNovelWorldBookData(worldBookConfig.worldBookName);
                        data && data.entries && normalizeWorldBookEntries(data);
                        const entry =
                            data && data.entries
                                ? data.entries[String(worldBookConfig.worldBookEntryUid)]
                                : null;
                        entry &&
                            isNovelWorldBookEntry(entry) &&
                            ((entry.disable = !0),
                            entry.extensions &&
                                entry.extensions.novelChatImporter &&
                                (entry.extensions.novelChatImporter.closedAt = new Date().toISOString()),
                            (worldBookConfig.onceArmed = !1),
                            (worldBookOnceArmedAt = 0),
                            await saveNovelWorldBookData(worldBookConfig.worldBookName, data),
                            saveWorldBookConfig(),
                            unregisterWorldBookEvents(),
                            setWorldBookEntryStatus("一次注入已完成，条目已自动关闭", !1, "closed"),
                            novelToast("info", "小说世界书一次注入已自动关闭"));
                    })();
                } catch (error) {
                    console.error("[" + extensionName + "] Failed to close one-shot world book entry", error);
                }
        }
        async function worldBookApi(path, body) {
            const response = await fetch(path, {
                method: "POST",
                headers:
                    ((ctx = getContext()),
                    ctx && "function" == typeof ctx.getRequestHeaders
                        ? ctx.getRequestHeaders()
                        : { "Content-Type": "application/json" }),
                body: JSON.stringify(body || {})
            });
            var ctx;
            if (!response.ok) throw new Error(`${path} failed: ${response.status}`);
            try {
                return await response.json();
            } catch (e) {
                return null;
            }
        }
        function invalidateNovelWorldBookCache() {
            novelWorldBookCache = { name: "", data: null, ts: 0 };
        }
        async function loadNovelWorldBookData(worldName, force) {
            worldName = String(worldName || "");
            if (
                !force &&
                novelWorldBookCache.name === worldName &&
                novelWorldBookCache.data &&
                Date.now() - novelWorldBookCache.ts < 120000
            )
                return novelWorldBookCache.data;
            var ctx = getContext(),
                data = null;
            if (ctx && "function" == typeof ctx.loadWorldInfo) {
                // loadWorldInfo 对「不存在」返回 null，这是正常结果；不要再拿 fetch 兜底，
                // 否则 null 会变成 /api/worldinfo/get 404 异常，被上层误报成「切换章节失败」
                data = await ctx.loadWorldInfo(worldName);
            } else {
                data = await worldBookApi("/api/worldinfo/get", { name: worldName });
            }
            if (data) novelWorldBookCache = { name: worldName, data: data, ts: Date.now() };
            return data;
        }
        async function saveNovelWorldBookData(worldName, data, options) {
            var ctx = getContext();
            if (options && options.lite) {
                // 轻量保存：先更新 ST 内存缓存，再 debounce 写盘（immediately=false）
                // 关键固定开关只改 disable 标志，不需要立刻整本 POST 222 章正文
                novelWorldBookCache = { name: String(worldName || ""), data: data, ts: Date.now() };
                if (ctx && "function" == typeof ctx.saveWorldInfo) {
                    // immediately=false => saveWorldDebounced(1s)，函数同步返回，不阻塞 UI
                    ctx.saveWorldInfo(worldName, data, !1);
                } else {
                    // 无 ST API 时后台 POST，不 await
                    worldBookApi("/api/worldinfo/edit", { name: worldName, data: data }).catch(function () {});
                }
                return;
            }
            // 完整保存可能改写大量条目，先清缓存，保存后再写入新缓存
            invalidateNovelWorldBookCache();
            ctx && "function" == typeof ctx.saveWorldInfo
                ? await ctx.saveWorldInfo(worldName, data, !0)
                : await worldBookApi("/api/worldinfo/edit", { name: worldName, data: data });
            novelWorldBookCache = { name: String(worldName || ""), data: data, ts: Date.now() };
            await (async function (worldName, data) {
                    try {
                        var ctx = getContext(),
                            reloadEditor = function (delay) {
                                setTimeout(function () {
                                    try {
                                        var $selDeferred = $("#world_editor_select");
                                        ctx &&
                                            "function" == typeof ctx.reloadWorldInfoEditor &&
                                            $selDeferred.length &&
                                            $selDeferred.is(":visible") &&
                                            ctx.reloadWorldInfoEditor(worldName);
                                    } catch (e) {}
                                }, delay);
                            };
                        ctx &&
                            "function" == typeof ctx.reloadWorldInfoEditor &&
                            (function () {
                                try {
                                    var $selNow = $("#world_editor_select");
                                    if (!$selNow.length || !$selNow.is(":visible")) return;
                                } catch (eVis) {
                                    return;
                                }
                                (ctx.reloadWorldInfoEditor(worldName), reloadEditor(80), reloadEditor(240));
                            })();
                        var $select = $("#world_editor_select");
                        if ($select.length && $select.is(":visible")) {
                            var $selected = $select.find("option:selected");
                            [
                                $select.val(),
                                $selected.val(),
                                $selected.text(),
                                $selected.attr("data-name"),
                                $selected.data("name")
                            ]
                                .map(normalizeWorldBookNameValue)
                                .indexOf(normalizeWorldBookNameValue(worldName)) >= 0 &&
                                ($select.trigger("change"),
                                setTimeout(function () {
                                    try {
                                        $select.trigger("change");
                                    } catch (e) {}
                                }, 80),
                                setTimeout(function () {
                                    try {
                                        $select.trigger("change");
                                    } catch (e) {}
                                }, 240));
                        }
                        if (ctx && "function" == typeof ctx.updateWorldInfoList)
                            try {
                                var $selList = $("#world_editor_select");
                                if ($selList.length && $selList.is(":visible")) await ctx.updateWorldInfoList();
                            } catch (e1) {}
                        var eventTypes = (ctx && (ctx.eventTypes || ctx.event_types)) || {};
                        if (ctx && ctx.eventSource && "function" == typeof ctx.eventSource.emit)
                            for (
                                var events = [
                                        eventTypes.WORLDINFO_UPDATED,
                                        eventTypes.WORLD_INFO_UPDATED,
                                        "worldinfo_updated",
                                        "WORLDINFO_UPDATED"
                                    ],
                                    seen = {},
                                    i = 0;
                                i < events.length;
                                i++
                            ) {
                                var eventName = events[i];
                                if (eventName && !seen[eventName]) {
                                    seen[eventName] = !0;
                                    try {
                                        await ctx.eventSource.emit(eventName, worldName, data);
                                    } catch (e2) {}
                                }
                            }
                    } catch (e) {
                        console.warn(`[${extensionName}] Failed to refresh world book editor`, e);
                    }
                })(worldName, data);
        }
        function normalizeWorldBookNameValue(value) {
            return (
                Array.isArray(value) && (value = value[0]),
                value && "object" == typeof value && (value = value.name || value.world || value.value || ""),
                String(value || "").trim()
            );
        }
        function getCurrentCharacterWorldBookName() {
            var ctx = getContext(),
                character = null;
            try {
                character =
                    ctx.characters && void 0 !== ctx.characterId ? ctx.characters[ctx.characterId] : null;
            } catch (e) {}
            for (
                var names = [
                        character &&
                            character.data &&
                            character.data.extensions &&
                            character.data.extensions.world,
                        character && character.extensions && character.extensions.world,
                        ctx.chatMetadata && ctx.chatMetadata.world_info,
                        ctx.chat_metadata && ctx.chat_metadata.world_info
                    ],
                    i = 0;
                i < names.length;
                i++
            ) {
                var name = normalizeWorldBookNameValue(names[i]);
                if (name) return name;
            }
            return "";
        }
        function getWorldBookEntryId(entry) {
            return entry && (void 0 !== entry.uid ? entry.uid : entry.id);
        }
        function hashNovelWorldBookContent(text) {
            var hash = 2166136261;
            text = String(text || "");
            for (var i = 0; i < text.length; i++)
                ((hash ^= text.charCodeAt(i)),
                    (hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24)));
            return (hash >>> 0).toString(16);
        }
        function isNovelWorldBookEntry(entry) {
            return !(
                !entry ||
                ("Novel Chat Importer 自动注入" !== entry.comment &&
                    (!entry.extensions || !entry.extensions.novelChatImporter))
            );
        }
        function normalizeWorldBookEntries(data) {
            if (!data.entries || Array.isArray(data.entries)) {
                for (
                    var normalized = {}, arr = Array.isArray(data.entries) ? data.entries : [], i = 0;
                    i < arr.length;
                    i++
                ) {
                    var uid = getWorldBookEntryId(arr[i]);
                    (null == uid && (uid = i),
                        (arr[i].uid = Number(uid)),
                        (normalized[String(uid)] = arr[i]));
                }
                data.entries = normalized;
            }
            return data.entries;
        }
        function findNovelWorldBookEntry(data) {
            var entries = normalizeWorldBookEntries(data);
            if (null !== worldBookConfig.worldBookEntryUid && void 0 !== worldBookConfig.worldBookEntryUid) {
                var saved = entries[String(worldBookConfig.worldBookEntryUid)];
                if (saved && isNovelMainEntry(saved)) return saved;
            }
            for (var values = Object.values(entries), i = 0; i < values.length; i++)
                if (isNovelMainEntry(values[i])) return values[i];
            return null;
        }
        function applyNovelWorldBookEntrySettings(entry, content) {
            var mapped = getNovelWorldBookPositionMapping(worldBookConfig.insertPosition);
            var wrap = getContentWrapperTexts(worldBookConfig.contentPrefix, worldBookConfig.contentSuffix);
            ((entry.comment = "Novel Chat Importer 自动注入"),
                (entry.content = content),
                (entry.constant = !0),
                (entry.selective = !1),
                (entry.key = []),
                (entry.keysecondary = []),
                (entry.addMemo = !0),
                (entry.order = Number(worldBookConfig.order) || 100),
                (entry.position = mapped.position),
                (entry.depth = Number(worldBookConfig.depth) || 5),
                (entry.role = mapped.role),
                (entry.excludeRecursion = !1 !== worldBookConfig.excludeRecursion),
                (entry.preventRecursion = !1 !== worldBookConfig.preventRecursion),
                (entry.disable = !1),
                (entry.extensions = entry.extensions || {}),
                (entry.extensions.novelChatImporter = {
                    version: 1,
                    updatedAt: new Date().toISOString(),
                    persistent: !!worldBookConfig.persistent || !!worldBookConfig.autoAdvanceEnabled,
                    autoAdvance: !!worldBookConfig.autoAdvanceEnabled,
                    autoAdvanceCurrentStart: worldBookConfig.autoAdvanceCurrentStart,
                    autoAdvanceChapterCount: worldBookConfig.autoAdvanceChapterCount,
                    useChapterRange: !!worldBookConfig.useChapterRange,
                    chapterRangeStart: worldBookConfig.chapterRangeStart,
                    chapterRangeEnd: worldBookConfig.chapterRangeEnd,
                    novelName: novelFileName || worldBookConfig.novelName || "",
                    contentHash: hashNovelWorldBookContent(content),
                    wrapperHead: wrap.head,
                    wrapperTail: wrap.tail
                }));
        }
        // —— 空白世界书条目的唯一模板 ——
        // 字段集先从同世界书里的现有条目克隆（ST 各版本字段不同），再补齐缺失的默认值。
        // createNovelWorldBookEntry / createBlankNovelWorldBookEntry 共用，避免两份模板漂移。
        function cloneWorldBookEntryShape(data) {
            try {
                for (var entries = Object.values(normalizeWorldBookEntries(data)), i = 0; i < entries.length; i++) {
                    var sample = entries[i];
                    if (sample && "object" == typeof sample) {
                        var clone = {};
                        return (
                            Object.keys(sample).forEach(function (key) {
                                var value = sample[key];
                                Array.isArray(value)
                                    ? (clone[key] = [])
                                    : (clone[key] = value && "object" == typeof value ? {} : value);
                            }),
                            clone
                        );
                    }
                }
            } catch (e) {}
            return {};
        }
        function buildNovelWorldBookEntryShell(data) {
            var entry = cloneWorldBookEntryShape(data);
            return (
                (entry.uid = getNextWorldBookUid(data)),
                Object.assign(entry, {
                    key: [],
                    keysecondary: [],
                    comment: "",
                    content: "",
                    constant: !0,
                    vectorized: !1,
                    selective: !1,
                    selectiveLogic: 0,
                    addMemo: !0,
                    order: 100,
                    position: 0,
                    disable: !1,
                    ignoreBudget: !1,
                    excludeRecursion: !0,
                    preventRecursion: !0,
                    matchPersonaDescription: !1,
                    matchCharacterDescription: !1,
                    matchCharacterPersonality: !1,
                    matchCharacterDepthPrompt: !1,
                    matchScenario: !1,
                    matchCreatorNotes: !1,
                    delayUntilRecursion: 0,
                    probability: 100,
                    useProbability: !0,
                    depth: 5,
                    group: "",
                    groupOverride: !1,
                    groupWeight: 100,
                    scanDepth: null,
                    caseSensitive: null,
                    matchWholeWords: null,
                    useGroupScoring: null,
                    automationId: "",
                    role: 0,
                    sticky: null,
                    cooldown: null,
                    delay: null,
                    triggers: [],
                    extensions: entry.extensions || {}
                })
            );
        }
        function registerNovelWorldBookEntry(data, entry) {
            return (
                void 0 !== entry.id && (entry.id = entry.uid),
                (data.entries[String(entry.uid)] = entry),
                entry
            );
        }
        function createNovelWorldBookEntry(data, content) {
            var entry = buildNovelWorldBookEntryShell(data);
            return (applyNovelWorldBookEntrySettings(entry, content), registerNovelWorldBookEntry(data, entry));
        }
        function setWorldBookEntryStatus(text, showUpdate, state) {
            var $status = $("#novel_wb_entry_status"),
                prefix = state ? (WORLD_BOOK_STATUS[state] || state) + "｜" : "";
            ($status.length && $status.text(prefix + (text || "")),
                $("#novel_wb_update").toggle(!!showUpdate));
        }
        function markWorldBookContentDirty(message) {
            worldBookContentDirty = !0;
            var hasTrackedEntry =
                null !== worldBookConfig.worldBookEntryUid && void 0 !== worldBookConfig.worldBookEntryUid;
            message &&
                setWorldBookEntryStatus(
                    hasTrackedEntry ? message : "注入设置已改变；准备注入时会使用当前内容",
                    hasTrackedEntry,
                    hasTrackedEntry ? "dirty" : "idle"
                );
        }
        function getNovelImporterMode() {
            return worldBookBatchMode ? "batch_worldbook" : worldBookMode ? "worldbook" : "import";
        }
        function loadNovelImporterSavedConfig() {
            try {
                var saved = getExtensionSettingsRoot().novelChatImporter_worldBook || null;
                if (saved) {
                    ((worldBookMode = "worldbook" === saved.mode),
                        (worldBookBatchMode = "batch_worldbook" === saved.mode));
                    if (saved.config)
                        for (var k in saved.config)
                            saved.config.hasOwnProperty(k) &&
                                worldBookConfig.hasOwnProperty(k) &&
                                (worldBookConfig[k] = saved.config[k]);
                    if (saved.batchConfig)
                        for (var bk in saved.batchConfig)
                            saved.batchConfig.hasOwnProperty(bk) &&
                                worldBookBatchConfig.hasOwnProperty(bk) &&
                                (worldBookBatchConfig[bk] = saved.batchConfig[bk]);
                }
                ((worldBookConfig.contentPrefix =
                    "string" == typeof worldBookConfig.contentPrefix
                        ? worldBookConfig.contentPrefix
                        : "<小说原文>"),
                    (worldBookConfig.contentSuffix =
                        "string" == typeof worldBookConfig.contentSuffix
                            ? worldBookConfig.contentSuffix
                            : "</小说原文>"),
                    (worldBookConfig.excludeRecursion = !1 !== worldBookConfig.excludeRecursion),
                    (worldBookConfig.preventRecursion = !1 !== worldBookConfig.preventRecursion),
                    (worldBookConfig.autoAdvanceChapterCount = Math.max(
                        1,
                        Number(worldBookConfig.autoAdvanceChapterCount) || 5
                    )),
                    // 纠正历史坏数据：起=1 止=全书 这类「默认全书」改回 1-5
                    (function () {
                        try {
                            var s = Number(worldBookConfig.chapterRangeStart);
                            var e = Number(worldBookConfig.chapterRangeEnd);
                            var c = Number(worldBookConfig.autoAdvanceChapterCount);
                            if (!Number.isFinite(s) || s < 1) s = 1;
                            if (!Number.isFinite(e) || e < s) e = s + 4;
                            // 仅当窗口宽得离谱（>=200）且起点是 1，视作坏默认
                            if (e - s + 1 >= 200 && s <= 1) {
                                s = 1;
                                e = 5;
                                c = 5;
                                worldBookConfig.useChapterRange = !0;
                            }
                            if (!Number.isFinite(c) || c < 1) c = Math.max(1, e - s + 1);
                            worldBookConfig.chapterRangeStart = s;
                            worldBookConfig.chapterRangeEnd = e;
                            worldBookConfig.autoAdvanceChapterCount = c;
                            worldBookConfig.autoAdvanceCurrentStart = s;
                            worldBookConfig.autoAdvanceStartChapter = s;
                        } catch (eSan) {}
                    })(),
                    (worldBookConfig.autoAdvanceFloorCount = Math.max(
                        1,
                        Number(worldBookConfig.autoAdvanceFloorCount) || 10
                    )),
                    (worldBookConfig.autoAdvanceStartChapter = parseChapterNumberValue(
                        worldBookConfig.autoAdvanceStartChapter,
                        parseChapterNumberValue(worldBookConfig.autoAdvanceCurrentStart, 1, 0),
                        0
                    )),
                    (worldBookConfig.autoAdvanceCurrentStart = parseChapterNumberValue(
                        worldBookConfig.autoAdvanceCurrentStart,
                        worldBookConfig.autoAdvanceStartChapter,
                        0
                    )),
                    (worldBookConfig.autoAdvanceBaseChatLength = Math.max(
                        0,
                        Number(worldBookConfig.autoAdvanceBaseChatLength) || 0
                    )),
                    (worldBookConfig.autoAdvanceTargetChatLength = Math.max(
                        0,
                        Number(worldBookConfig.autoAdvanceTargetChatLength) || 0
                    )),
                    (worldBookConfig.autoAdvanceIncludeUserMessages =
                        !1 !== worldBookConfig.autoAdvanceIncludeUserMessages),
                    (worldBookConfig.autoAdvanceStopAtEnd = !0),
                    (worldBookConfig.excludeSuspiciousChapters =
                        !1 !== worldBookConfig.excludeSuspiciousChapters),
                    (worldBookConfig.excludedChapterNumbers = Array.isArray(
                        worldBookConfig.excludedChapterNumbers
                    )
                        ? worldBookConfig.excludedChapterNumbers
                              .map(function (num) {
                                  return Number(num);
                              })
                              .filter(Number.isFinite)
                        : []),
                    (worldBookConfig.includedChapterNumbers = Array.isArray(
                        worldBookConfig.includedChapterNumbers
                    )
                        ? worldBookConfig.includedChapterNumbers
                              .map(function (num) {
                                  return Number(num);
                              })
                              .filter(Number.isFinite)
                        : []),
                    (worldBookBatchConfig.rangeStart = parseChapterNumberValue(
                        worldBookBatchConfig.rangeStart,
                        1,
                        0
                    )),
                    (worldBookBatchConfig.rangeEnd = parseChapterNumberValue(
                        worldBookBatchConfig.rangeEnd,
                        1,
                        0
                    )),
                    (worldBookBatchConfig.chaptersPerEntry = Math.max(
                        1,
                        Number(worldBookBatchConfig.chaptersPerEntry) || 1
                    )),
                    (worldBookBatchConfig.contentPrefix =
                        "string" == typeof worldBookBatchConfig.contentPrefix
                            ? worldBookBatchConfig.contentPrefix
                            : "<小说原文>"),
                    (worldBookBatchConfig.contentSuffix =
                        "string" == typeof worldBookBatchConfig.contentSuffix
                            ? worldBookBatchConfig.contentSuffix
                            : "</小说原文>"),
                    (worldBookBatchConfig.excludeRecursion =
                        !1 !== worldBookBatchConfig.excludeRecursion),
                    (worldBookBatchConfig.preventRecursion =
                        !1 !== worldBookBatchConfig.preventRecursion),
                    (worldBookBatchConfig.entryNameTemplate = "小说 - {range}章"),
                    (worldBookBatchConfig.entryType = normalizeWorldBookBatchEntryType(
                        worldBookBatchConfig.entryType
                    )),
                    (worldBookBatchConfig.overwriteExisting = !0));
            } catch (e) {
            } finally {
                novelImporterSettingsLoaded = !0;
            }
        }
        function getNovelWorldBookPositionMapping(position) {
            return "after_char_def" === position
                ? { position: 1, role: 0 }
                : "before_example_mes" === position
                  ? { position: 5, role: 0 }
                  : "after_example_mes" === position
                    ? { position: 6, role: 0 }
                    : "before_authors_note" === position
                      ? { position: 2, role: 0 }
                      : "after_authors_note" === position
                        ? { position: 3, role: 0 }
                        : "system_depth" === position
                          ? { position: 4, role: 0 }
                          : "user_depth" === position
                            ? { position: 4, role: 1 }
                            : "assistant_depth" === position
                               ? { position: 4, role: 2 }
                               : { position: 0, role: 0 };
        }
        function isNovelWorldBookDepthPosition(position) {
            return "system_depth" === position || "user_depth" === position || "assistant_depth" === position;
        }
        function formatWorldBookChapterRange(range) {
            return range.start === range.end ? range.start + "章" : range.start + "-" + range.end + "章";
        }
        function getCurrentAutoAdvanceRangeText() {
            try {
                var chapters = getCachedChapters(novelText);
                if (!chapters.length) return "0章";
                return formatWorldBookChapterRange(getWorldBookAutoAdvanceRange(chapters));
            } catch (e) {
                return "0章";
            }
        }
        function shouldCountChatMessageForAutoAdvance(message) {
            if (worldBookConfig.autoAdvanceIncludeUserMessages) return !0;
            if (!message) return !1;
            var role = message.role ?? message.mesRole ?? message.extra?.role;
            if ("assistant" === role || "char" === role || "bot" === role || 2 === role) return !0;
            if ("user" === role || 0 === role || 1 === role) return !1;
            if (void 0 !== message.is_user) return !message.is_user;
            if (void 0 !== message.is_system) return !1;
            if (void 0 !== message.name) {
                try {
                    var ctx = getContext(),
                        charName = ctx.name2 || ctx.character?.name;
                    return !!charName && message.name === charName;
                } catch (e) {}
            }
            return !0;
        }
        function getCurrentChatFloorCount() {
            try {
                var ctx = getContext(),
                    chat = Array.isArray(ctx.chat) ? ctx.chat : [];
                if (worldBookConfig.autoAdvanceIncludeUserMessages) return chat.length;
                var count = 0;
                for (var i = 0; i < chat.length; i++)
                    shouldCountChatMessageForAutoAdvance(chat[i]) && count++;
                return count;
            } catch (e) {
                return 0;
            }
        }
        // 包裹文字的唯一真源：构建条目正文与「只换包裹不动章节」的重写都必须用同一套换行规则
        function getContentWrapperTexts(prefix, suffix) {
            prefix = String(prefix ?? "");
            suffix = String(suffix ?? "");
            return {
                head: prefix ? prefix + (prefix.endsWith("\n") ? "" : "\n") : "",
                tail: suffix ? (suffix.startsWith("\n") ? "" : "\n") + suffix : ""
            };
        }
        function buildNovelWorldBookContentFromItems(items, prefix, suffix) {
            if (!Array.isArray(items) || !items.length) return "";
            var body = items
                .map(function (item) {
                    return (
                        "[World Info: " +
                        getChapterDisplayTitle(item.chapter, item.index) +
                        "]\n" +
                        item.chapter.content
                    );
                })
                .join("\n\n");
            var wrap = getContentWrapperTexts(prefix, suffix);
            return wrap.head + body + wrap.tail;
        }
        function getWorldBookSelectedItems(chapters, cfg) {
            var items = [];
            if (!Array.isArray(chapters) || !chapters.length) return items;
            if (cfg && cfg.autoAdvanceEnabled) {
                var range = getWorldBookAutoAdvanceRange(chapters);
                return getChapterItemsByNumberRange(chapters, range.start, range.end);
            }
            if (cfg && cfg.useChapterRange) {
                var range2 = normalizeWorldBookRange(cfg, chapters, !1);
                return getChapterItemsByNumberRange(chapters, range2.start, range2.end);
            }
            for (
                var selectedIndices = Array.isArray(cfg.selectedChapterIndices)
                        ? cfg.selectedChapterIndices
                        : [],
                    si = 0;
                si < selectedIndices.length;
                si++
            ) {
                var idx = Number(selectedIndices[si]);
                Number.isFinite(idx) &&
                    idx >= 0 &&
                    idx < chapters.length &&
                    !shouldExcludeChapter(chapters[idx], idx) &&
                    items.push({ index: idx, chapter: chapters[idx] });
            }
            return (
                items.sort(function (a, b) {
                    return a.index - b.index;
                }),
                items
            );
        }
        function getWorldBookAutoAdvanceRange(totalChapters) {
            var count = Math.max(1, Number(worldBookConfig.autoAdvanceChapterCount) || 5),
                start = parseChapterNumberValue(worldBookConfig.autoAdvanceCurrentStart, 1, 0);
            var bounds = getChapterNumberBounds(Array.isArray(totalChapters) ? totalChapters : null, totalChapters);
            start = Math.min(Math.max(start, bounds.min), bounds.max);
            var end = Math.min(bounds.max, start + count - 1);
            return { start: start, end: end, count: count, total: bounds.max, min: bounds.min };
        }
        function buildCurrentNovelWorldBookContent() {
            if (!novelText) return "";
            var chapters = getCachedChapters(novelText),
                items = getWorldBookSelectedItems(chapters, worldBookConfig);
            return buildNovelWorldBookContentFromItems(
                items,
                worldBookConfig.contentPrefix,
                worldBookConfig.contentSuffix
            );
        }
        function updateWorldBookAutoAdvanceStatus() {
            var $status = $("#novel_wb_auto_status");
            if (!$status.length) return;
            if (!novelText) return void $status.text("自动切换：请先选择 TXT 文件");
            var chapters = getCachedChapters(novelText);
            if (!chapters.length) return void $status.text("自动切换：未解析到章节");
            var range = getWorldBookAutoAdvanceRange(chapters),
                current = getCurrentChatFloorCount(),
                target = Math.max(0, Number(worldBookConfig.autoAdvanceTargetChatLength) || 0),
                countMode = worldBookConfig.autoAdvanceIncludeUserMessages
                    ? "计数方式：用户和 AI 消息"
                    : "计数方式：仅 AI 消息",
                text =
                    (worldBookConfig.autoAdvanceEnabled ? "自动切换已启用" : "自动切换未启用") +
                    "｜当前范围：" +
                    formatWorldBookChapterRange(range) +
                    "｜当前楼层：" +
                    current;
            if (worldBookConfig.autoAdvanceEnabled)
                text += target > 0 ? "｜将在：" + target + "楼切换" : "｜准备注入后开始计楼层";
            $status.text(text + "｜" + countMode);
        }
        async function handleWorldBookAutoAdvance() {
            if (worldBookAutoAdvanceBusy || !worldBookMode || !worldBookConfig.autoAdvanceEnabled) return;
            try {
                worldBookAutoAdvanceBusy = !0;
                if (
                    !novelText ||
                    !worldBookConfig.worldBookName ||
                    null === worldBookConfig.worldBookEntryUid ||
                    void 0 === worldBookConfig.worldBookEntryUid
                )
                    return;
                var chapters = getCachedChapters(novelText);
                if (!chapters.length) return;
                var floorCount = Math.max(1, Number(worldBookConfig.autoAdvanceFloorCount) || 10),
                    currentFloors = getCurrentChatFloorCount(),
                    targetFloors = Math.max(0, Number(worldBookConfig.autoAdvanceTargetChatLength) || 0),
                    baseFloors = Math.max(0, Number(worldBookConfig.autoAdvanceBaseChatLength) || 0);
                if (!targetFloors) {
                    ((worldBookConfig.autoAdvanceBaseChatLength = currentFloors),
                        (worldBookConfig.autoAdvanceTargetChatLength = currentFloors + floorCount),
                        saveWorldBookConfig(),
                        updateWorldBookAutoAdvanceStatus());
                    return;
                }
                if (currentFloors < baseFloors) {
                    ((worldBookConfig.autoAdvanceBaseChatLength = currentFloors),
                        (worldBookConfig.autoAdvanceTargetChatLength = currentFloors + floorCount),
                        saveWorldBookConfig(),
                        updateWorldBookAutoAdvanceStatus());
                    return;
                }
                if (currentFloors < targetFloors) return void updateWorldBookAutoAdvanceStatus();
                var currentRange = getWorldBookAutoAdvanceRange(chapters),
                    nextStart = currentRange.start + currentRange.count;
                if (nextStart > currentRange.total) {
                    ((worldBookConfig.autoAdvanceEnabled = !1),
                        (worldBookConfig.autoAdvanceBaseChatLength = currentFloors),
                        (worldBookConfig.autoAdvanceTargetChatLength = 0),
                        $("#novel_wb_auto_enabled").prop("checked", !1),
                        saveWorldBookConfig(),
                        updateWorldBookAutoAdvanceStatus(),
                        unregisterWorldBookEvents(),
                        novelToast("info", "小说已到最后一章，自动切换已关闭"));
                    return;
                }
                worldBookConfig.autoAdvanceCurrentStart = nextStart;
                var nextRange = getWorldBookAutoAdvanceRange(chapters),
                    content = buildCurrentNovelWorldBookContent();
                if (!content.trim()) return;
                // 强制取最新世界书：自动切换前也要判断条目是否被手动改过
                var data = await loadNovelWorldBookData(worldBookConfig.worldBookName, !0);
                if (!data || !data.entries) return;
                normalizeWorldBookEntries(data);
                var entry =
                    data.entries[String(worldBookConfig.worldBookEntryUid)] || findNovelWorldBookEntry(data);
                if (!entry || !isNovelWorldBookEntry(entry))
                    return void novelToast("error", "自动切换失败：找不到小说注入条目");
                // 自动流程不能弹窗打断；但条目被手改过必须让用户知道这次覆盖
                try {
                    var autoMeta = (entry.extensions && entry.extensions.novelChatImporter) || {};
                    var autoStoredHash = autoMeta.contentHash || worldBookConfig.lastSyncedHash || "";
                    if (autoStoredHash && hashNovelWorldBookContent(entry.content || "") !== autoStoredHash)
                        novelToast("warning", "注入条目被手动修改过，自动切换已按当前设置覆盖");
                } catch (eGuard) {}
                (applyNovelWorldBookEntrySettings(entry, content),
                    (worldBookConfig.worldBookEntryUid = getWorldBookEntryId(entry)),
                    (worldBookConfig.autoAdvanceBaseChatLength = currentFloors),
                    (worldBookConfig.autoAdvanceTargetChatLength = currentFloors + floorCount),
                    (worldBookConfig.lastSyncedHash = hashNovelWorldBookContent(content)),
                    await saveNovelWorldBookData(worldBookConfig.worldBookName, data),
                    saveWorldBookConfig(),
                    (worldBookContentDirty = !1),
                    setWorldBookEntryStatus(
                        "自动切换已更新｜世界书: " +
                            worldBookConfig.worldBookName +
                            "｜条目 UID: " +
                            worldBookConfig.worldBookEntryUid,
                        !1,
                        "persistent"
                    ),
                    updateWorldBookAutoAdvanceStatus(),
                    novelToast("success", "小说已更新至 " + formatWorldBookChapterRange(nextRange)),
                    refreshNovelPlotControlBar());
            } catch (error) {
                (console.error("[" + extensionName + "] auto advance failed", error),
                    novelToast("error", "小说自动切换失败，请查看控制台"));
            } finally {
                worldBookAutoAdvanceBusy = !1;
            }
        }
        function getNextWorldBookUid(data) {
            for (
                var entries = normalizeWorldBookEntries(data),
                    ids = Object.keys(entries)
                        .map(function (k) {
                            return Number(k);
                        })
                        .filter(Number.isFinite),
                    uid = ids.length ? Math.max.apply(null, ids) + 1 : 0;
                entries[String(uid)];
            )
                uid++;
            return uid;
        }
        function createBlankNovelWorldBookEntry(data) {
            var entry = buildNovelWorldBookEntryShell(data);
            return registerNovelWorldBookEntry(data, entry);
        }
        function readWorldBookAutoAdvanceConfigFromUI(eventOrReset) {
            if (!$("#novel_wb_auto_enabled").length) return;
            var wasEnabled = !!worldBookConfig.autoAdvanceEnabled,
                closedRangeText = getCurrentAutoAdvanceRangeText(),
                startChapter = parseChapterNumberValue($("#novel_wb_auto_start").val(), 1, 0),
                resetCurrent =
                    !eventOrReset ||
                    eventOrReset === !0 ||
                    (eventOrReset.target && "novel_wb_auto_start" === eventOrReset.target.id);
            ((worldBookConfig.autoAdvanceEnabled = $("#novel_wb_auto_enabled").prop("checked")),
                (worldBookConfig.autoAdvanceChapterCount = Math.max(
                    1,
                    Number($("#novel_wb_auto_chapter_count").val()) || 5
                )),
                (worldBookConfig.autoAdvanceFloorCount = Math.max(
                    1,
                    Number($("#novel_wb_auto_floor_count").val()) || 10
                )),
                (worldBookConfig.autoAdvanceStartChapter = startChapter),
                resetCurrent &&
                    ((worldBookConfig.autoAdvanceCurrentStart = startChapter),
                    (worldBookConfig.autoAdvanceTargetChatLength = 0)),
                (worldBookConfig.autoAdvanceIncludeUserMessages = $("#novel_wb_auto_include_user").length
                    ? $("#novel_wb_auto_include_user").prop("checked")
                    : !0),
                (worldBookConfig.autoAdvanceStopAtEnd = !0),
                worldBookConfig.autoAdvanceEnabled ||
                    ($("#novel_wb_auto_enabled").length &&
                        wasEnabled &&
                        novelToast("info", "自动切换已关闭，当前世界书为 " + closedRangeText),
                    (worldBookConfig.autoAdvanceTargetChatLength = 0)),
                saveWorldBookConfig(),
                updateWorldBookAutoAdvanceStatus(),
                registerWorldBookEvents());
        }
        function readWorldBookRecursionOptionsFromUI() {
            $("#novel_wb_exclude_recursion").length &&
                (worldBookConfig.excludeRecursion = $("#novel_wb_exclude_recursion").prop("checked"));
            $("#novel_wb_prevent_recursion").length &&
                (worldBookConfig.preventRecursion = $("#novel_wb_prevent_recursion").prop("checked"));
        }
        function readWorldBookBatchConfigFromUI() {
            if (!$("#novel_batch_range_start").length) return;
            var startInput = getNullableIntegerInputValue("#novel_batch_range_start"),
                endInput = getNullableIntegerInputValue("#novel_batch_range_end"),
                entryType = $("#novel_batch_entry_type").val();
            (null !== startInput && (worldBookBatchConfig.rangeStart = Math.max(0, startInput)),
                null !== endInput && (worldBookBatchConfig.rangeEnd = Math.max(0, endInput)),
                (worldBookBatchConfig.chaptersPerEntry = Math.max(
                    1,
                    Number($("#novel_batch_chapters_per_entry").val()) || 1
                )),
                (worldBookBatchConfig.entryNameTemplate = "小说 - {range}章"),
                (worldBookBatchConfig.insertPosition = $("#novel_batch_position").val() || "before_char_def"),
                (worldBookBatchConfig.depth = Math.max(1, Number($("#novel_batch_depth").val()) || 5)),
                (worldBookBatchConfig.order = Math.max(0, Number($("#novel_batch_order").val()) || 100)),
                (worldBookBatchConfig.excludeRecursion = $("#novel_batch_exclude_recursion").length
                    ? $("#novel_batch_exclude_recursion").prop("checked")
                    : !1 !== worldBookBatchConfig.excludeRecursion),
                (worldBookBatchConfig.preventRecursion = $("#novel_batch_prevent_recursion").length
                    ? $("#novel_batch_prevent_recursion").prop("checked")
                    : !1 !== worldBookBatchConfig.preventRecursion),
                (worldBookBatchConfig.entryType = normalizeWorldBookBatchEntryType(entryType)),
                (worldBookBatchConfig.overwriteExisting = !0),
                (worldBookBatchConfig.contentPrefix = String($("#novel_batch_content_prefix").val() ?? "")),
                (worldBookBatchConfig.contentSuffix = String($("#novel_batch_content_suffix").val() ?? "")),
                saveWorldBookConfig());
        }
        function normalizeWorldBookBatchEntryType(entryType) {
            return "disabled" === entryType ? "disabled" : "keyword" === entryType ? "keyword" : "constant";
        }
        function normalizeWorldBookBatchRange(chapters, forceWrite) {
            var bounds = getChapterNumberBounds(chapters),
                minChapter = bounds.min,
                maxChapter = bounds.max,
                defaultStart = getDefaultStartChapterNumber(chapters),
                startInput = getNullableIntegerInputValue("#novel_batch_range_start"),
                endInput = getNullableIntegerInputValue("#novel_batch_range_end"),
                start =
                    null === startInput
                        ? parseChapterNumberValue(worldBookBatchConfig.rangeStart, defaultStart, minChapter)
                        : startInput,
                end =
                    null === endInput
                        ? parseChapterNumberValue(worldBookBatchConfig.rangeEnd, maxChapter, minChapter)
                        : endInput;
            return (
                (start = Math.max(minChapter, Math.min(start, maxChapter))),
                (end = Math.max(minChapter, Math.min(end, maxChapter))),
                start > end && ([start, end] = [end, start]),
                (worldBookBatchConfig.rangeStart = start),
                (worldBookBatchConfig.rangeEnd = end),
                $("#novel_batch_range_start,#novel_batch_range_end")
                    .attr("min", minChapter)
                    .attr("max", maxChapter),
                setRangeInputValue("#novel_batch_range_start", start, forceWrite),
                setRangeInputValue("#novel_batch_range_end", end, forceWrite),
                { start: start, end: end, min: minChapter, max: maxChapter }
            );
        }
        function getWorldBookBatchItems() {
            if (!novelText) return [];
            var chapters = getCachedChapters(novelText);
            if (!chapters.length) return [];
            var bounds = getChapterNumberBounds(chapters),
                minChapter = bounds.min,
                maxChapter = bounds.max,
                start = Number(worldBookBatchConfig.rangeStart),
                end = Number(worldBookBatchConfig.rangeEnd);
            ((!Number.isFinite(start) || start < minChapter) && (start = getDefaultStartChapterNumber(chapters)),
                (!Number.isFinite(end) || end < minChapter) && (end = maxChapter),
                (start = Math.max(minChapter, Math.min(start, maxChapter))),
                (end = Math.max(minChapter, Math.min(end, maxChapter))),
                start > end && ([start, end] = [end, start]));
            var per = Math.max(1, Number(worldBookBatchConfig.chaptersPerEntry) || 1),
                selectedChapters = getChapterItemsByNumberRange(chapters, start, end),
                items = [],
                entryIndex = 1;
            for (var i = 0; i < selectedChapters.length; i += per) {
                var groupItems = selectedChapters.slice(i, Math.min(i + per, selectedChapters.length)),
                    group = groupItems.map(function (item) {
                        return item.chapter;
                    }),
                    rangeStart = groupItems.length ? groupItems[0].number : start,
                    rangeEnd = groupItems.length ? groupItems[groupItems.length - 1].number : rangeStart,
                    rangeText =
                        rangeStart === rangeEnd ? rangeStart + "章" : rangeStart + "-" + rangeEnd + "章",
                    raw = {
                        index: entryIndex,
                        start: rangeStart,
                        end: rangeEnd,
                        count: group.length,
                        firstTitle: groupItems[0]
                            ? getChapterDisplayTitle(groupItems[0].chapter, groupItems[0].index)
                            : "",
                        lastTitle: groupItems[groupItems.length - 1]
                            ? getChapterDisplayTitle(
                                  groupItems[groupItems.length - 1].chapter,
                                  groupItems[groupItems.length - 1].index
                              )
                            : ""
                    };
                ((raw.title = "小说 - " + rangeText),
                    (raw.chapters = group),
                    (raw.triggerNumbers = groupItems.map(function (item) {
                        return item.number;
                    })),
                    (raw.triggerKeywords = raw.triggerNumbers.map(function (number) {
                        return formatChapterTriggerKeyword(number);
                    })),
                    (raw.triggerKeywordText = raw.triggerKeywords.join(",")),
                    (raw.content = buildNovelWorldBookContentFromItems(
                        groupItems.map(function (item) {
                            return { index: item.index, number: item.number, chapter: item.chapter };
                        }),
                        worldBookBatchConfig.contentPrefix,
                        worldBookBatchConfig.contentSuffix
                    )),
                    (raw.charCount = raw.content.length),
                    items.push(raw),
                    entryIndex++);
            }
            return items;
        }
        function findWorldBookEntryByComment(data, comment) {
            var entries = normalizeWorldBookEntries(data),
                values = Object.values(entries);
            for (var i = 0; i < values.length; i++)
                if (String(values[i].comment || "") === String(comment || "")) return values[i];
            return null;
        }
        function isNovelWorldBookBatchEntry(entry) {
            return !!(entry && entry.extensions && entry.extensions.novelChatImporterBatch);
        }
        function getNovelWorldBookBatchEntryKeys(data) {
            var entries = normalizeWorldBookEntries(data),
                keys = [];
            Object.keys(entries).forEach(function (key) {
                isNovelWorldBookBatchEntry(entries[key]) && keys.push(key);
            });
            return keys;
        }
        function applyNovelWorldBookBatchEntrySettings(entry, item, cfg) {
            var mapped = getNovelWorldBookPositionMapping(cfg.insertPosition),
                entryType = normalizeWorldBookBatchEntryType(cfg.entryType),
                keywordMode = "keyword" === entryType,
                triggerKeywords = keywordMode && Array.isArray(item.triggerKeywords) ? item.triggerKeywords.slice() : [];
            ((entry.comment = item.title),
                (entry.content = item.content),
                (entry.order = Number(cfg.order) || 100),
                (entry.position = mapped.position),
                (entry.depth = Number(cfg.depth) || 5),
                (entry.role = mapped.role),
                (entry.constant = !keywordMode),
                (entry.selective = !1),
                (entry.key = triggerKeywords),
                (entry.keysecondary = []),
                (entry.excludeRecursion = !1 !== cfg.excludeRecursion),
                (entry.preventRecursion = !1 !== cfg.preventRecursion),
                (entry.disable = "disabled" === entryType),
                (entry.addMemo = !0),
                (entry.extensions = entry.extensions || {}),
                (entry.extensions.novelChatImporterBatch = {
                    version: 1,
                    updatedAt: new Date().toISOString(),
                    rangeStart: item.start,
                    rangeEnd: item.end,
                    entryType: entryType,
                    triggerKeywords: triggerKeywords,
                    triggerKeywordText: triggerKeywords.join(","),
                    contentHash: hashNovelWorldBookContent(item.content)
                }));
        }
        function updateWorldBookBatchPreview(forceWriteRange) {
            var $preview = $("#novel_batch_preview");
            if (!$preview.length) return;
            if (!novelText)
                return (
                    $("#novel_batch_keyword_hint").hide().text(""),
                    void $preview.html('<div class="novel_empty_hint">请先选择 TXT 文件</div>')
                );
            readWorldBookBatchConfigFromUI();
            var chapters = getCachedChapters(novelText);
            if (!chapters.length)
                return (
                    $("#novel_batch_keyword_hint").hide().text(""),
                    void $preview.html('<div class="novel_empty_hint">未解析到章节</div>')
                );
            normalizeWorldBookBatchRange(chapters, !0 === forceWriteRange);
            var items = getWorldBookBatchItems(),
                worldName = getCurrentCharacterWorldBookName(),
                entryType = normalizeWorldBookBatchEntryType(worldBookBatchConfig.entryType),
                keywordMode = "keyword" === entryType,
                keywordHint =
                    keywordMode && items.length
                        ? "当前关键词：" + items[0].triggerKeywordText + (items.length > 1 ? " ..." : "")
                        : keywordMode
                          ? "当前关键词：暂无"
                          : "",
                html =
                    '<div class="novel_replace_stats">当前世界书: ' +
                    escapeHtml(worldName || "未绑定") +
                    "<br>将创建/更新 " +
                    items.length +
                    " 个条目｜章节总数 " +
                    chapters.length +
                    "</div>";
            $("#novel_batch_keyword_hint").toggle(keywordMode).text(keywordHint);
            html += '<div class="novel_text_preview">';
            for (var i = 0; i < items.length && i < 30; i++) {
                var item = items[i];
                html +=
                    '<details class="novel_collapse_item"><summary><span>' +
                    escapeHtml(item.title) +
                    '</span><span class="novel_chapter_meta">' +
                    item.start +
                    "-" +
                    item.end +
                    "章｜" +
                    String(item.charCount).replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
                    '字</span></summary><div class="novel_collapse_content">' +
                    (keywordMode
                        ? '<div class="novel_replace_stats">关键词：' +
                          escapeHtml(item.triggerKeywordText || "暂无") +
                          "</div>"
                        : "") +
                    escapeHtml(
                        item.chapters
                            .map(function (ch) {
                                return getChapterDisplayTitle(ch);
                            })
                            .join(" / ")
                    ) +
                    "</div></details>";
            }
            (items.length > 30 &&
                (html +=
                    '<div class="novel_more_hint">仅预览前 30 个条目，剩余 ' +
                    (items.length - 30) +
                    " 个会一并处理。</div>"));
            ((html += "</div>"), $preview.html(html));
        }
        async function createWorldBookBatchEntries() {
            try {
                if (!novelText) return void novelToast("error", "请先选择 TXT 文件");
                readWorldBookBatchConfigFromUI();
                var chapters = getCachedChapters(novelText);
                if (!chapters.length) return void novelToast("error", "未解析到章节");
                normalizeWorldBookBatchRange(chapters, !0);
                var worldName = getCurrentCharacterWorldBookName();
                if (!worldName)
                    return void novelToast("error", "当前角色/聊天没有绑定世界书，请先绑定一个世界书");
                var items = getWorldBookBatchItems();
                if (!items.length) return void novelToast("error", "没有可创建的章节条目");
                var warn = items.length > 200 ? "\n\n条目数量较多，可能影响酒馆世界书编辑器性能。" : "";
                if (
                    !confirm(
                        "即将在世界书 " +
                            worldName +
                            " 中创建或更新 " +
                            items.length +
                            " 个小说条目。" +
                            warn +
                            "\n\n是否继续？"
                    )
                )
                    return;
                $("#novel_batch_progress").text("正在加载世界书...");
                var data = await loadNovelWorldBookData(worldName);
                if (!data) {
                    $("#novel_batch_progress").text("");
                    return void novelToast(
                        "error",
                        "世界书「" + worldName + "」不存在或读取失败，请重新选择世界书"
                    );
                }
                (data.entries || (data.entries = {}), normalizeWorldBookEntries(data));
                var created = 0,
                    updated = 0;
                for (var i = 0; i < items.length; i++) {
                    var item = items[i],
                        entry = findWorldBookEntryByComment(data, item.title);
                    (entry
                        ? (applyNovelWorldBookBatchEntrySettings(entry, item, worldBookBatchConfig),
                          updated++)
                        : ((entry = createBlankNovelWorldBookEntry(data)),
                          applyNovelWorldBookBatchEntrySettings(entry, item, worldBookBatchConfig),
                          created++),
                        (i % 20 != 0 && i !== items.length - 1) ||
                            ($("#novel_batch_progress").text("正在处理：" + (i + 1) + " / " + items.length),
                            await sleep(0)));
                }
                ($("#novel_batch_progress").text("正在保存世界书..."),
                    await saveNovelWorldBookData(worldName, data),
                    saveWorldBookConfig(),
                    $("#novel_batch_progress").text("完成：新建 " + created + "，更新 " + updated),
                    updateWorldBookBatchPreview(),
                    novelToast("success", "世界书条目处理完成：新建 " + created + "，更新 " + updated));
            } catch (error) {
                (console.error("[" + extensionName + "] batch world book failed", error),
                    novelToast("error", "批量创建世界书条目失败，请查看控制台"));
            }
        }
        async function deleteWorldBookBatchEntries() {
            try {
                var worldName = getCurrentCharacterWorldBookName();
                if (!worldName)
                    return void novelToast("error", "当前角色/聊天没有绑定世界书，请先绑定一个世界书");
                $("#novel_batch_progress").text("正在加载世界书...");
                var data = await loadNovelWorldBookData(worldName);
                if (!data || !data.entries)
                    return (
                        $("#novel_batch_progress").text("没有找到可删除的批量条目"),
                        void novelToast("info", "没有找到可删除的批量世界书条目")
                    );
                normalizeWorldBookEntries(data);
                var keys = getNovelWorldBookBatchEntryKeys(data);
                if (!keys.length)
                    return (
                        $("#novel_batch_progress").text("没有找到可删除的批量条目"),
                        void novelToast("info", "没有找到插件批量创建的世界书条目")
                    );
                if (
                    !confirm(
                        "将在世界书 " +
                            worldName +
                            " 中删除 " +
                            keys.length +
                            " 个由本插件批量创建的小说条目。\n\n不会删除手动创建的世界书条目。是否继续？"
                    )
                )
                    return void $("#novel_batch_progress").text("");
                for (var i = 0; i < keys.length; i++) delete data.entries[keys[i]];
                ($("#novel_batch_progress").text("正在保存世界书..."),
                    await saveNovelWorldBookData(worldName, data),
                    $("#novel_batch_progress").text("已删除 " + keys.length + " 个批量条目"),
                    updateWorldBookBatchPreview(),
                    novelToast("success", "已删除 " + keys.length + " 个批量世界书条目"));
            } catch (error) {
                (console.error("[" + extensionName + "] delete batch world book failed", error),
                    $("#novel_batch_progress").text("删除失败"),
                    novelToast("error", "删除批量世界书条目失败，请查看控制台"));
            }
        }
        async function closeWorldBookBatchEntries() {
            try {
                var worldName = getCurrentCharacterWorldBookName();
                if (!worldName)
                    return void novelToast("error", "当前角色/聊天没有绑定世界书，请先绑定一个世界书");
                $("#novel_batch_progress").text("正在加载世界书...");
                var data = await loadNovelWorldBookData(worldName);
                if (!data || !data.entries)
                    return (
                        $("#novel_batch_progress").text("没有找到可关闭的批量条目"),
                        void novelToast("info", "没有找到可关闭的批量世界书条目")
                    );
                normalizeWorldBookEntries(data);
                var keys = getNovelWorldBookBatchEntryKeys(data);
                if (!keys.length)
                    return (
                        $("#novel_batch_progress").text("没有找到可关闭的批量条目"),
                        void novelToast("info", "没有找到插件批量创建的世界书条目")
                    );
                if (
                    !confirm(
                        "将在世界书 " +
                            worldName +
                            " 中关闭 " +
                            keys.length +
                            " 个由本插件批量创建的小说条目。\n\n条目会保留，只会改为关闭状态。是否继续？"
                    )
                )
                    return void $("#novel_batch_progress").text("");
                for (var i = 0; i < keys.length; i++) {
                    var entry = data.entries[keys[i]];
                    entry &&
                        ((entry.disable = !0),
                        (entry.extensions = entry.extensions || {}),
                        (entry.extensions.novelChatImporterBatch =
                            entry.extensions.novelChatImporterBatch || {}),
                        (entry.extensions.novelChatImporterBatch.closedAt = new Date().toISOString()));
                }
                ($("#novel_batch_progress").text("正在保存世界书..."),
                    await saveNovelWorldBookData(worldName, data),
                    $("#novel_batch_progress").text("已关闭 " + keys.length + " 个批量条目"),
                    updateWorldBookBatchPreview(),
                    novelToast("success", "已关闭 " + keys.length + " 个批量世界书条目"));
            } catch (error) {
                (console.error("[" + extensionName + "] close batch world book failed", error),
                    $("#novel_batch_progress").text("关闭失败"),
                    novelToast("error", "关闭批量世界书条目失败，请查看控制台"));
            }
        }
        function ensureNovelImporterExtendedUI() {
            try {
                var $mode = $(".novel_mode_switch");
                $mode.length &&
                    !$mode.find('input[value="batch_worldbook"]').length &&
                    $mode.append(
                        '<label class="menu_button" style="flex:1;text-align:center;cursor:pointer;"><input type="radio" name="novel_mode" value="batch_worldbook" style="display:none;" />批量世界书条目</label>'
                    );
                if (!$("#novel_plot_bar_panel").length)
                    $("#novel_wb_entry_status").before(
                        '<details id="novel_plot_bar_panel" class="novel_panel" style="margin-top:8px;"><summary><b>聊天文末剧情控制栏</b></summary><div class="novel_section_body"><label class="checkbox_label"><input type="checkbox" id="novel_plot_bar_enabled" /> 显示聊天页剧情控制栏</label><div class="novel_empty_hint" style="padding:4px 0;">全局开关：开启后所有角色卡聊天页都会显示控制栏。各角色的章节范围/固定章节从该角色绑定的世界书条目自动检测恢复。</div><div class="novel_button_row"><button id="novel_plot_bar_show" class="menu_button" type="button">立即显示文末控制栏</button></div></div></details>'
                    );
                if (!$("#novel_wb_auto_panel").length)
                    $("#novel_wb_entry_status").before(
                        '<details id="novel_wb_auto_panel" class="novel_panel" style="margin-top:8px;"><summary><b>自动切换章节</b></summary><div class="novel_section_body"><label class="checkbox_label"><input type="checkbox" id="novel_wb_auto_enabled" /> 启用自动切换</label><label class="checkbox_label"><input type="checkbox" id="novel_wb_auto_include_user" checked /> 考虑用户消息</label><div class="novel_range_row"><div style="flex:1;min-width:180px;"><div class="novel_section_title">每次注入章节数</div><input class="text_pole" type="number" id="novel_wb_auto_chapter_count" min="1" value="5" /></div><div style="flex:1;min-width:180px;"><div class="novel_section_title">经过多少楼后切换</div><input class="text_pole" type="number" id="novel_wb_auto_floor_count" min="1" value="10" /></div><div style="flex:1;min-width:180px;"><div class="novel_section_title">起始章节</div><input class="text_pole" type="number" id="novel_wb_auto_start" min="0" value="1" /></div></div><div id="novel_wb_auto_status" class="novel_replace_stats">自动切换未启用</div><div class="novel_button_row"><button id="novel_wb_auto_reset" class="menu_button">重置从起始章节开始</button></div></div></details>'
                    );
                if (!$("#novel_exclude_suspicious_global").length)
                    $("#novel_chapter_range_wrap").before(
                        '<label class="checkbox_label novel_import_mode_section"><input type="checkbox" id="novel_exclude_suspicious_global" /> 自动排除目录/公告类章节</label>'
                    );
                if (!$(".novel_worldbook_batch_section").length)
                    $(".novel_worldbook_section").after(
                        '<div class="novel_worldbook_batch_section" style="display:none;"><details class="novel_panel" open><summary><b>批量世界书条目</b></summary><div class="novel_section_body"><div class="novel_section_title">章节范围</div><div class="novel_range_row"><div style="flex:1;min-width:180px;"><div class="novel_section_title">起始章节</div><input class="text_pole" type="number" id="novel_batch_range_start" min="0" value="1" /></div><div style="flex:1;min-width:180px;"><div class="novel_section_title">结束章节</div><input class="text_pole" type="number" id="novel_batch_range_end" min="0" value="1" /></div><div style="flex:1;min-width:180px;"><div class="novel_section_title">每个条目包含章节数</div><input class="text_pole" type="number" id="novel_batch_chapters_per_entry" min="1" value="1" /></div></div><div class="novel_replace_stats" id="novel_batch_name_rule">条目名称自动生成：小说 - 起始章-结束章</div><div class="novel_section_title">条目启用状态</div><select id="novel_batch_entry_type" class="text_pole"><option value="constant">创建后启用</option><option value="disabled">仅创建但关闭</option></select><div class="novel_section_title">插入位置</div><select id="novel_batch_position" class="text_pole"><option value="before_char_def">角色定义前 (↑ Char)</option><option value="after_char_def">角色定义后 (↓ Char)</option><option value="before_example_mes">示例消息前 (↑ EM)</option><option value="after_example_mes">示例消息后 (↓ EM)</option><option value="before_authors_note">作者注释前 (↑ AN)</option><option value="after_authors_note">作者注释后 (↓ AN)</option><option value="system_depth">[系统] 插入深度 @D</option><option value="user_depth">[用户 1] 插入深度 @D</option><option value="assistant_depth">[AI 1] 插入深度 @D</option></select><div class="novel_range_row novel_align_start" style="margin-top:6px;"><div style="flex:1;min-width:180px;display:none;" id="novel_batch_depth_label"><div class="novel_section_title">深度 @D</div><input id="novel_batch_depth" class="text_pole" type="number" min="1" value="5" /></div><div style="flex:1;min-width:180px;"><div class="novel_section_title">顺序 / Order</div><input id="novel_batch_order" class="text_pole" type="number" min="0" value="100" /></div></div><div style="display:flex;gap:6px;margin-top:4px;"><div style="flex:1;min-width:0;"><div class="novel_section_title" style="margin-top:2px;">每条顶部内容</div><textarea id="novel_batch_content_prefix" class="text_pole" rows="1" placeholder="&lt;小说原文&gt;"></textarea></div><div style="flex:1;min-width:0;"><div class="novel_section_title" style="margin-top:2px;">每条底部内容</div><textarea id="novel_batch_content_suffix" class="text_pole" rows="1" placeholder="&lt;/小说原文&gt;"></textarea></div></div><div class="novel_button_row"><button id="novel_batch_preview_btn" class="menu_button">刷新预览</button><button id="novel_batch_create_btn" class="menu_button">批量创建条目</button><button id="novel_batch_delete_btn" class="menu_button danger_button">删除已创建条目</button><div id="novel_batch_progress" class="novel_import_progress"></div></div><div id="novel_batch_preview" class="wide100p"><div class="novel_empty_hint">请先选择 TXT 文件</div></div></div></details></div>'
                    );
                var $batchEntryType = $("#novel_batch_entry_type");
                ($batchEntryType.length &&
                    !$batchEntryType.find('option[value="keyword"]').length &&
                    $batchEntryType.append(
                        '<option value="keyword">启用且绿灯，按关键词触发</option>'
                    ),
                    $batchEntryType.length &&
                        !$("#novel_batch_keyword_hint").length &&
                        $batchEntryType.after(
                            '<div class="novel_replace_stats" id="novel_batch_keyword_hint" style="margin-top:6px;display:none;"></div>'
                        ),
                    $("#novel_batch_delete_btn").length &&
                        !$("#novel_batch_close_btn").length &&
                        $("#novel_batch_delete_btn").before(
                            '<button id="novel_batch_close_btn" class="menu_button danger_button">关闭已创建条目</button>'
                        ));
                if ($("#novel_wb_order").length && !$("#novel_wb_recursion_options").length)
                    $("#novel_wb_order").parent().append(
                        '<div id="novel_wb_recursion_options" class="novel_button_row" style="margin-top:6px;"><label class="checkbox_label" style="flex:1;"><input type="checkbox" id="novel_wb_exclude_recursion" /> 不可递归</label><label class="checkbox_label" style="flex:1;"><input type="checkbox" id="novel_wb_prevent_recursion" /> 防止进一步递归</label></div>'
                    );
                if ($("#novel_batch_order").length && !$("#novel_batch_recursion_options").length)
                    $("#novel_batch_order").parent().append(
                        '<div id="novel_batch_recursion_options" class="novel_button_row" style="margin-top:6px;"><label class="checkbox_label" style="flex:1;"><input type="checkbox" id="novel_batch_exclude_recursion" /> 不可递归</label><label class="checkbox_label" style="flex:1;"><input type="checkbox" id="novel_batch_prevent_recursion" /> 防止进一步递归</label></div>'
                    );
                ($("#novel_exclude_suspicious_global").prop(
                    "checked",
                    !!worldBookConfig.excludeSuspiciousChapters
                ),
                    $("#novel_wb_auto_enabled").prop("checked", !!worldBookConfig.autoAdvanceEnabled),
                    $("#novel_plot_bar_enabled").length &&
                        $("#novel_plot_bar_enabled").prop("checked", !!plotControlBarEnabled),
                    $("#novel_wb_auto_include_user").prop(
                        "checked",
                        !1 !== worldBookConfig.autoAdvanceIncludeUserMessages
                    ),
                    $("#novel_wb_auto_chapter_count").val(worldBookConfig.autoAdvanceChapterCount),
                    $("#novel_wb_auto_floor_count").val(worldBookConfig.autoAdvanceFloorCount),
                    $("#novel_wb_auto_start").val(
                        parseChapterNumberValue(
                            worldBookConfig.autoAdvanceStartChapter,
                            parseChapterNumberValue(worldBookConfig.autoAdvanceCurrentStart, 1, 0),
                            0
                        )
                    ),
                    $("#novel_wb_exclude_recursion").prop(
                        "checked",
                        !1 !== worldBookConfig.excludeRecursion
                    ),
                    $("#novel_wb_prevent_recursion").prop(
                        "checked",
                        !1 !== worldBookConfig.preventRecursion
                    ),
                    $("#novel_batch_range_start").val(worldBookBatchConfig.rangeStart),
                    $("#novel_batch_range_end").val(worldBookBatchConfig.rangeEnd),
                    $("#novel_batch_chapters_per_entry").val(worldBookBatchConfig.chaptersPerEntry),
                    $("#novel_batch_entry_type").val(
                        normalizeWorldBookBatchEntryType(worldBookBatchConfig.entryType)
                    ),
                    $("#novel_batch_position").val(worldBookBatchConfig.insertPosition),
                    $("#novel_batch_depth").val(worldBookBatchConfig.depth),
                    $("#novel_batch_depth_label").toggle(
                        isNovelWorldBookDepthPosition(worldBookBatchConfig.insertPosition)
                    ),
                    $("#novel_batch_order").val(worldBookBatchConfig.order),
                    $("#novel_batch_exclude_recursion").prop(
                        "checked",
                        !1 !== worldBookBatchConfig.excludeRecursion
                    ),
                    $("#novel_batch_prevent_recursion").prop(
                        "checked",
                        !1 !== worldBookBatchConfig.preventRecursion
                    ),
                    $("#novel_batch_content_prefix").val(worldBookBatchConfig.contentPrefix),
                    $("#novel_batch_content_suffix").val(worldBookBatchConfig.contentSuffix),
                    $(
                        "#novel_wb_auto_enabled,#novel_wb_auto_include_user,#novel_wb_auto_chapter_count,#novel_wb_auto_floor_count,#novel_wb_auto_start"
                    )
                        .off(".novelAuto")
                        .on("input.novelAuto change.novelAuto", function (e) {
                            readWorldBookAutoAdvanceConfigFromUI(e);
                            refreshNovelPlotControlBar();
                        }),
                    $("#novel_plot_bar_enabled")
                        .off("change.novelPlotBar")
                        .on("change.novelPlotBar", function () {
                            setNovelPlotControlBarVisible($(this).prop("checked"));
                        }),
                    $("#novel_plot_bar_show")
                        .off("click.novelPlotBar")
                        .on("click.novelPlotBar", function () {
                            $("#novel_plot_bar_enabled").prop("checked", !0);
                            setNovelPlotControlBarVisible(!0);
                            novelToast("success", "剧情控制栏已显示");
                        }),
                    $("#novel_plot_bar_enabled").prop("checked", !!plotControlBarEnabled),
                    $("#novel_exclude_suspicious_global")
                        .off("change.novelFilter")
                        .on("change.novelFilter", function () {
                            setExcludeSuspiciousChapters($(this).prop("checked"));
                        }),
                    $("#novel_wb_auto_reset")
                        .off("click.novelAuto")
                        .on("click.novelAuto", function () {
                            var start = parseChapterNumberValue($("#novel_wb_auto_start").val(), 1, 0),
                                floorCount = Math.max(1, Number($("#novel_wb_auto_floor_count").val()) || 10),
                                current = getCurrentChatFloorCount();
                            ((worldBookConfig.autoAdvanceStartChapter = start),
                                (worldBookConfig.autoAdvanceCurrentStart = start),
                                (worldBookConfig.autoAdvanceBaseChatLength = current),
                                (worldBookConfig.autoAdvanceTargetChatLength =
                                    worldBookConfig.autoAdvanceEnabled ? current + floorCount : 0),
                                $("#novel_wb_auto_start").val(start),
                                saveWorldBookConfig(),
                                updateWorldBookAutoAdvanceStatus(),
                                novelToast(
                                    "info",
                                    "重置从起始章节开始：" + getCurrentAutoAdvanceRangeText()
                                ));
                        }),
                    $("#novel_wb_exclude_recursion,#novel_wb_prevent_recursion")
                        .off("change.novelRecursion")
                        .on("change.novelRecursion", function () {
                            (readWorldBookRecursionOptionsFromUI(),
                                (worldBookLastInjected = null),
                                markWorldBookContentDirty(
                                    "递归选项已改变，按“更新注入内容”同步到世界书条目"
                                ),
                                saveWorldBookConfig());
                        }),
                    $(
                        "#novel_batch_range_start,#novel_batch_range_end,#novel_batch_chapters_per_entry,#novel_batch_entry_type,#novel_batch_position,#novel_batch_depth,#novel_batch_order,#novel_batch_exclude_recursion,#novel_batch_prevent_recursion,#novel_batch_content_prefix,#novel_batch_content_suffix"
                    )
                        .off(".novelBatch")
                        .on("input.novelBatch change.novelBatch", updateWorldBookBatchPreview),
                    $("#novel_batch_range_start,#novel_batch_range_end")
                        .off("blur.novelBatchRange")
                        .on("blur.novelBatchRange", function () {
                            if (!novelText) return;
                            var chapters = getCachedChapters(novelText);
                            chapters.length &&
                                (normalizeWorldBookBatchRange(chapters, !0), updateWorldBookBatchPreview(!0));
                        }),
                    $("#novel_batch_position")
                        .off("change.novelBatchDepth")
                        .on("change.novelBatchDepth", function () {
                            $("#novel_batch_depth_label").toggle(isNovelWorldBookDepthPosition($(this).val()));
                        }),
                    $("#novel_batch_preview_btn")
                        .off("click.novelBatch")
                        .on("click.novelBatch", function () {
                            updateWorldBookBatchPreview(!0);
                        }),
                    $("#novel_batch_create_btn")
                        .off("click.novelBatch")
                        .on("click.novelBatch", function () {
                            createWorldBookBatchEntries();
                        }),
                    $("#novel_batch_close_btn")
                        .off("click.novelBatch")
                        .on("click.novelBatch", function () {
                            closeWorldBookBatchEntries();
                        }),
                    $("#novel_batch_delete_btn")
                        .off("click.novelBatch")
                        .on("click.novelBatch", function () {
                            deleteWorldBookBatchEntries();
                        }),
                    updateWorldBookAutoAdvanceStatus(),
                    updateWorldBookBatchPreview());
            } catch (error) {
                console.error("[" + extensionName + "] extended UI failed", error);
            }
        }
        async function syncNovelWorldBookEntry(forceUpdate) {
            readWorldBookAutoAdvanceConfigFromUI();
            readWorldBookRecursionOptionsFromUI();
            const worldName = getCurrentCharacterWorldBookName();
            if (!worldName)
                return (
                    novelToast("error", "当前角色/聊天没有绑定世界书，请先绑定一个世界书"),
                    void setWorldBookEntryStatus("未找到当前角色或聊天绑定的世界书", !1, "idle")
                );
            const content = buildCurrentNovelWorldBookContent();
            if (!content.trim())
                return (
                    novelToast(
                        "error",
                        worldBookConfig.autoAdvanceEnabled
                            ? "请先确认自动切换章节范围"
                            : "请先选择要注入的章节范围"
                    ),
                    void setWorldBookEntryStatus("没有可注入内容", !1, "idle")
                );
            const newHash = hashNovelWorldBookContent(content),
                data = await loadNovelWorldBookData(worldName);
            if (!data) {
                novelToast(
                    "error",
                    "世界书「" + worldName + "」不存在或读取失败，请重新选择世界书"
                );
                setWorldBookEntryStatus("世界书不存在或读取失败", !1, "idle");
                return;
            }
            (data.entries || (data.entries = {}), normalizeWorldBookEntries(data));
            let entry = findNovelWorldBookEntry(data);
            const entryMeta = entry && entry.extensions ? entry.extensions.novelChatImporter : null,
                currentHash = entry ? hashNovelWorldBookContent(entry.content || "") : "",
                storedHash = (entryMeta && entryMeta.contentHash) || worldBookConfig.lastSyncedHash || "",
                hasExistingContent = !(!entry || !String(entry.content || "").trim()),
                isDifferent = !(!entry || String(entry.content || "") === content),
                externallyChanged = !(!entry || !storedHash || currentHash === storedHash);
            if (hasExistingContent && isDifferent && !forceUpdate)
                return (
                    (worldBookConfig.worldBookName = worldName),
                    (worldBookConfig.worldBookEntryUid = getWorldBookEntryId(entry)),
                    (worldBookConfig.lastSyncedHash = storedHash || currentHash),
                    saveWorldBookConfig(),
                    setWorldBookEntryStatus(
                        externallyChanged
                            ? "检测到条目可能被外部修改；按“更新注入内容”确认覆盖"
                            : "检测到已有注入条目内容；按“更新注入内容”覆盖为当前范围",
                        !0,
                        "dirty"
                    ),
                    void novelToast(
                        "info",
                        externallyChanged
                            ? "注入条目可能被手动改过，更新前请确认"
                            : "已有注入内容，按更新后才会覆盖"
                    )
                );
            (externallyChanged &&
                forceUpdate &&
                !confirm("检测到注入条目内容可能被手动修改。确定要用当前小说范围覆盖吗？")) ||
                (entry
                    ? applyNovelWorldBookEntrySettings(entry, content)
                    : (entry = createNovelWorldBookEntry(data, content)),
                (worldBookConfig.worldBookName = worldName),
                (worldBookConfig.worldBookEntryUid = getWorldBookEntryId(entry)),
                (worldBookConfig.onceArmed =
                    !worldBookConfig.persistent && !worldBookConfig.autoAdvanceEnabled),
                (worldBookOnceArmedAt = worldBookConfig.onceArmed ? Date.now() : 0),
                worldBookConfig.autoAdvanceEnabled &&
                    (function () {
                        var current = getCurrentChatFloorCount(),
                            floorCount = Math.max(1, Number(worldBookConfig.autoAdvanceFloorCount) || 10);
                        ((worldBookConfig.autoAdvanceBaseChatLength = current),
                            (worldBookConfig.autoAdvanceTargetChatLength = current + floorCount),
                            novelToast(
                                "info",
                                "当前是 " +
                                    current +
                                    " 楼，将在 " +
                                    worldBookConfig.autoAdvanceTargetChatLength +
                                    " 楼切换世界书注入"
                            ));
                    })(),
                (worldBookConfig.lastSyncedHash = newHash),
                await saveNovelWorldBookData(worldName, data),
                saveWorldBookConfig(),
                (worldBookContentDirty = !1),
                registerWorldBookEvents(),
                updateWorldBookAutoAdvanceStatus(),
                refreshNovelPlotControlBar(),
                setWorldBookEntryStatus(
                    (worldBookConfig.autoAdvanceEnabled
                        ? "自动切换已启用"
                        : worldBookConfig.persistent
                          ? "世界书持续生效"
                          : "下一次回复后会自动关闭") +
                        "｜世界书: " +
                        worldName +
                        "｜条目 UID: " +
                        worldBookConfig.worldBookEntryUid,
                    !1,
                    worldBookConfig.autoAdvanceEnabled || worldBookConfig.persistent ? "persistent" : "once"
                ),
                novelToast(
                    "success",
                    worldBookConfig.autoAdvanceEnabled
                                        ? "小说已更新至 " +
                                          formatWorldBookChapterRange(
                                              getWorldBookAutoAdvanceRange(getCachedChapters(novelText))
                                          )
                        : worldBookConfig.persistent
                          ? "世界书持续注入已准备"
                          : "世界书一次注入已准备"
                ));
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
            const oneChapterMode = !!$ui.oneChapter?.prop?.("checked"),
                mode = getImportRangeMode();
            ($ui.byLengthOptions?.toggle?.(!oneChapterMode),
                $ui.importRangeOptions?.toggle?.(!oneChapterMode),
                $ui.chapterRangeWrap?.toggle?.(oneChapterMode || "chapter" === mode),
                $ui.floorRangeWrap?.toggle?.(!oneChapterMode && "floor" === mode),
                $ui.chunkSize?.prop?.("disabled", oneChapterMode)?.toggleClass?.("disabled", oneChapterMode));
        }
        function invalidateCache() {
            ((cachedChapterText = null),
                (cachedChapters = null),
                (cachedChapterIndexMap = null),
                (cachedPlotUnitKey = null),
                (cachedPlotUnitWords = null),
                (cachedChunksText = null),
                (cachedChunksKey = ""),
                (cachedChunks = null));
        }
        function countOccurrences(text, keyword, caseSensitive = !1) {
            if (!keyword) return 0;
            const re = new RegExp(escapeRegExp(keyword), caseSensitive ? "g" : "gi");
            return (String(text).match(re) || []).length;
        }
        function highlightKeyword(text, keyword, caseSensitive = !1) {
            const escapedText = escapeHtml(text);
            if (!keyword) return escapedText;
            const safeKeyword = escapeRegExp(escapeHtml(keyword));
            try {
                return escapedText.replace(
                    new RegExp(safeKeyword, caseSensitive ? "g" : "gi"),
                    (match) => `<mark class="novel_keyword_mark">${match}</mark>`
                );
            } catch {
                return escapedText;
            }
        }
        function splitSummaryText(text, limit = 800) {
            if (!text) return "";
            const safeText = text.length > limit ? text.slice(0, limit) : text,
                truncated = text.length > limit;
            return `\n                <div class="novel_summary_text">${highlightKeyword(safeText, lastSearchKeyword.trim(), getSearchCaseSensitive())}</div>\n                ${truncated ? '<button class="menu_button novel_show_more_btn" data-show-full="1">展开全文</button>' : ""}\n                <div class="novel_full_text" style="display:none;">${highlightKeyword(text, lastSearchKeyword.trim(), getSearchCaseSensitive())}</div>\n            `;
        }
        function bindShowMoreEvents(rootSelector) {
            $(rootSelector)
                .off("click", ".novel_show_more_btn")
                .on("click", ".novel_show_more_btn", function () {
                    const $btn = $(this),
                        $wrap = $btn.closest(".novel_text_wrap"),
                        $summary = $wrap.find(".novel_summary_text"),
                        $full = $wrap.find(".novel_full_text");
                    ($summary.hide(), $btn.hide(), $full.show());
                });
        }
        function getSuspiciousChapterReason(title, content) {
            var text = String(content || "").trim(),
                compactText = text.replace(/\s/g, ""),
                titleText = String(title || "").trim(),
                lines = text.split("\n").map(function (line) {
                    return line.trim();
                }).filter(Boolean),
                chapterLineCount = lines.filter(function (line) {
                    return CHAPTER_LINE_HINT_RE.test(line);
                }).length,
                nonChapterLineCount = Math.max(0, lines.length - chapterLineCount),
                metaTitle =
                    !/^\s*(前言|序章|楔子|引子)/.test(titleText) &&
                    /目录|公告|通知|说明|声明|感言|上架|请假|请假条|作者的话|完本|后记|推荐|打赏|月票|求票|更新说明|作品相关|内容简介/i.test(
                        titleText
                    );
            if (!text) return "空章节";
            if (compactText.length <= 50) return "内容过短";
            if (/^(目录|公告|通知|说明|声明|感言|作品相关|内容简介)$/i.test(text) && compactText.length < 80)
                return "内容像目录/说明";
            if (metaTitle && compactText.length < 1200) return "标题像公告/说明";
            if (lines.length >= 5 && chapterLineCount >= 4 && chapterLineCount >= nonChapterLineCount * 2)
                return "内容像目录";
            if (chapterLineCount >= 8 && compactText.length < 2500) return "内容像章节列表";
            return "";
        }
        function parseChapters(text) {
            // 章节/卷标题的判定正则统一来自顶部 CHAPTER_HEADING_RE / VOLUME_HEADING_RE
            const lines = normalizeNewlines(text)
                    .split("\n")
                    .map(function (raw, index) {
                        return { raw: raw, text: raw.trim(), index: index };
                    }),
                chapters = [],
                // 数字编号标题的链路判定参数：起始编号只认 1~5，
                // 允许章号跳跃 50，允许相邻候选间隔 2000 行。
                NUMBERED_HEADING_MAX_LENGTH = 80,
                NUMBERED_HEADING_MAX_NUMBER_GAP = 50,
                NUMBERED_HEADING_MAX_LINE_GAP = 2000;
            let fallbackOriginalNumber = 1;
            function parseChineseNumber(value) {
                // 「第8.9章」是作者把 89 打成 8.9，按数字串联读，避免整章被并进上一章
                value = normalizeFullWidthDigits(value).replace(/[.．]/g, "");
                if (/^\d+$/.test(value)) return Number(value);
                var digits = {
                        零: 0,
                        "〇": 0,
                        一: 1,
                        二: 2,
                        三: 3,
                        四: 4,
                        五: 5,
                        六: 6,
                        七: 7,
                        八: 8,
                        九: 9,
                        两: 2,
                        壹: 1,
                        贰: 2,
                        叁: 3,
                        肆: 4,
                        伍: 5,
                        陆: 6,
                        柒: 7,
                        捌: 8,
                        玖: 9
                    },
                    units = { 十: 10, 拾: 10, 百: 100, 佰: 100, 千: 1000, 仟: 1000, 万: 10000 },
                    total = 0,
                    section = 0,
                    number = 0;
                for (var i = 0; i < value.length; i++) {
                    var ch = value[i];
                    if (Object.prototype.hasOwnProperty.call(digits, ch)) {
                        number = digits[ch];
                    } else if (units[ch]) {
                        var unit = units[ch];
                        unit >= 10000
                            ? ((section = (section + number) * unit), (total += section), (section = 0), (number = 0))
                            : ((section += (number || 1) * unit), (number = 0));
                    }
                }
                return total + section + number;
            }
            function parseTitleNumber(title, useFallback = !0) {
                // 行首装饰符（☆第1章）先去掉，否则所有章号正则都从符号开始匹配不到
                var titleText = String(title || "").replace(CHAPTER_LEADING_STRIP_RE, "");
                if (/^\s*前言(?:\s|$|[：:、-])/i.test(titleText)) return 0;
                // 按优先级依次尝试顶部共享的章号正则
                for (var ti = 0, match = null; ti < CHAPTER_TITLE_NUM_RES.length; ti++)
                    if ((match = titleText.match(CHAPTER_TITLE_NUM_RES[ti]))) break;
                if (!match) return useFallback ? fallbackOriginalNumber++ : null;
                var parsedNumber = parseChineseNumber(match[1]);
                if (!parsedNumber && 0 !== parsedNumber) return useFallback ? fallbackOriginalNumber++ : null;
                return useFallback
                    ? ((fallbackOriginalNumber = Math.max(fallbackOriginalNumber, parsedNumber + 1)), parsedNumber)
                    : parsedNumber;
            }
            // 数字编号标题：裸数字（「2标题」）、N、N．N空格、[N]/（N）、单独一行 N。
            // 单看一行无法和正文里的「621…」「1、首先…」区分，所以按章号找连续链：
            // 从 1~5 开始，每次取当前行之后、编号在 current+1..current+50 的
            // 第一个候选；链长 ≥3 才整条接受。这样孤立的正文数字行会被排除。
            // 同一本书出现两份（残本 + 全本）时，两份会各自成链并被分别分章；
            // 这里不做去重，避免静默丢掉其中一份的正文。
            function collectNumberedHeadings() {
                var raw = [];
                for (var i = 0; i < lines.length; i++) {
                    // 行首装饰符先去掉，让「☆1、标题」也能进链
                    var text = lines[i].text.replace(CHAPTER_LEADING_STRIP_RE, "");
                    if (!text || text.length > NUMBERED_HEADING_MAX_LENGTH) continue;
                    // 只排除分号；问号、感叹号、逗号、句号都可能出现在标题里
                    // （「18答应吗？」「21来，吃雪糕」「108和塔露拉一起行动。」）。
                    if (/[；;]/.test(text)) continue;
                    var match =
                        /^\s*([0-9０-９]{1,4})\s*$/.exec(text) ||
                        /^\s*[\[（(]\s*([0-9０-９]{1,4})\s*[\]）)]\s*\S/.exec(text) ||
                        /^\s*([0-9０-９]{1,4})\s*[、．]\s*\S/.exec(text) ||
                        /^\s*([0-9０-９]{1,4})\s+\S/.exec(text) ||
                        /^\s*([0-9０-９]{1,4})(?![0-9０-９.．、\s])\S/.exec(text);
                    if (!match) continue;
                    raw.push({
                        lineIndex: lines[i].index,
                        number: Number(normalizeFullWidthDigits(match[1]))
                    });
                }
                var byNumber = new Map();
                raw.forEach(function (candidate) {
                    var list = byNumber.get(candidate.number);
                    list ? list.push(candidate) : byNumber.set(candidate.number, [candidate]);
                });
                var accepted = new Set();
                raw.forEach(function (start) {
                    if (start.number < 1 || start.number > 5 || accepted.has(start.lineIndex)) return;
                    var chain = [start],
                        inChain = new Set([start.lineIndex]),
                        current = start;
                    while (!0) {
                        var next = null;
                        for (var gap = 1; gap <= NUMBERED_HEADING_MAX_NUMBER_GAP && !next; gap++) {
                            var list = byNumber.get(current.number + gap);
                            if (!list) continue;
                            for (var j = 0; j < list.length; j++) {
                                var candidate = list[j];
                                if (
                                    candidate.lineIndex > current.lineIndex &&
                                    candidate.lineIndex - current.lineIndex <= NUMBERED_HEADING_MAX_LINE_GAP &&
                                    !inChain.has(candidate.lineIndex)
                                ) {
                                    next = candidate;
                                    break;
                                }
                            }
                        }
                        if (!next) break;
                        chain.push(next);
                        inChain.add(next.lineIndex);
                        current = next;
                    }
                    if (chain.length >= 3)
                        chain.forEach(function (candidate) {
                            accepted.add(candidate.lineIndex);
                        });
                });
                return accepted;
            }
            function getCandidateKind(line, lineIndex) {
                if (numberedHeadingLineIndexes.has(lineIndex)) return "chapter";
                // 带卷前缀的章节（第一卷：第12章）同时命中 VOLUME_HEADING_RE，
                // 必须先按章节判定，否则整本书会被当成一卷、全塞进「前言」
                if (CHAPTER_HEADING_RE.test(line)) return "chapter";
                // 卷号后直接跟标点、又不是章节的，是卷内公告（请假/悬赏/感言），留给正文
                if (CHAPTER_VOLUME_ANNOUNCEMENT_RE.test(line)) return "";
                return VOLUME_HEADING_RE.test(line) ? "volume" : "";
            }
            function getCompactLengthBetween(startIndex, endIndex) {
                var length = 0,
                    end = Math.min(endIndex, lines.length);
                for (var i = Math.max(0, startIndex); i < end; i++)
                    length += lines[i].text.replace(/\s/g, "").length;
                return length;
            }
            function isBlankLine(index) {
                return index < 0 || index >= lines.length || !lines[index].text;
            }
            function hasDirectoryHeadingNear(lineIndex) {
                for (var i = Math.max(0, lineIndex - 6); i < lineIndex; i++)
                    if (/目录|章节列表|作品目录|正文目录|总目录/i.test(lines[i].text)) return !0;
                return !1;
            }
            // 抓取/搬运产物里同一个标题常连续出现两遍（顶格一遍 + 缩进一遍）。
            // 不去重的话两遍都选不中：第一遍到「下一候选」只隔一行，内容长度被算成
            // 标题本身的几字，吃满短内容扣分；第二遍虽带着整章正文，却因为
            // 「前一个同号、后一个正好 +1」被当成重复条目扣 5 分。两遍都低于阈值，
            // 整本书会塌成「前言」一章。这里合并成一条并保留后一条：前一条常是被
            // 截断的版本（「第1章」/「第1章 开始」），留下信息更全的那个。
            // 判据只认「去掉空白后标题完全相同」——相邻行标题一致才可能是重复；
            // 不能拿章号相等当判据，卷首和番外都会把章号数回 1，会把两章并掉。
            function mergeRepeatedHeadings(candidates) {
                for (var merged = [], i = 0; i < candidates.length; i++) {
                    var current = candidates[i],
                        previous = merged[merged.length - 1],
                        repeated =
                            previous &&
                            previous.kind === current.kind &&
                            current.lineIndex - previous.lineIndex <= 2 &&
                            previous.title.replace(/\s/g, "") === current.title.replace(/\s/g, "");
                    repeated
                        ? (ignoredLineIndexes.add(previous.lineIndex), (merged[merged.length - 1] = current))
                        : merged.push(current);
                }
                return merged;
            }
            function buildCandidates() {
                var candidates = [];
                lines.forEach(function (line) {
                    if (!line.text) return;
                    var kind = getCandidateKind(line.text, line.index);
                    kind &&
                        candidates.push({
                            kind: kind,
                            title: line.text,
                            lineIndex: line.index,
                            originalNumber: parseTitleNumber(line.text, !1),
                            numbered: numberedHeadingLineIndexes.has(line.index),
                            contentLengthToNext: 0,
                            lineDistanceToNext: 0,
                            catalog: !1,
                            score: 0
                        });
                });
                candidates = mergeRepeatedHeadings(candidates);
                candidates.forEach(function (candidate, index) {
                    var next = candidates[index + 1],
                        nextLineIndex = next ? next.lineIndex : lines.length;
                    candidate.order = index;
                    candidate.contentLengthToNext = getCompactLengthBetween(candidate.lineIndex + 1, nextLineIndex);
                    candidate.lineDistanceToNext = next ? next.lineIndex - candidate.lineIndex : lines.length - candidate.lineIndex;
                });
                return candidates;
            }
            function findNearbyChapterCandidate(candidates, order, direction) {
                for (var i = order + direction; i >= 0 && i < candidates.length; i += direction) {
                    var candidate = candidates[i];
                    if (!candidate.catalog && "chapter" === candidate.kind && null != candidate.originalNumber) return candidate;
                }
                return null;
            }
            function findNearbyVolumeCandidate(candidates, order, direction) {
                for (var i = order + direction; i >= 0 && i < candidates.length; i += direction) {
                    var candidate = candidates[i];
                    if (!candidate.catalog && "volume" === candidate.kind) return candidate;
                    if (!candidate.catalog && "chapter" === candidate.kind) return null;
                }
                return null;
            }
            function markCatalogCandidates(candidates, ignoredLineIndexes) {
                for (var i = 0; i < candidates.length; i++) {
                    var run = [candidates[i]],
                        j = i;
                    while (j + 1 < candidates.length) {
                        var current = candidates[j],
                            next = candidates[j + 1];
                        if (current.contentLengthToNext > 80 || current.lineDistanceToNext > 4) break;
                        if ("chapter" !== next.kind && "volume" !== next.kind) break;
                        run.push(next);
                        j++;
                    }
                    // 链式数字标题（N、/N．/[N]/裸数字）最容易把正文里的编号列表吃进来。
                    // 连续 3 条以上、彼此之间内容很短，就按目录/编号列表排除；
                    // 真正的 N、 章节每章正文较长，run 在第一条就会断开。
                    var numberedPrefix = 0;
                    while (numberedPrefix < run.length && run[numberedPrefix].numbered) numberedPrefix++;
                    if (numberedPrefix >= 3) {
                        run.slice(0, numberedPrefix).forEach(function (candidate) {
                            candidate.catalog = !0;
                            ignoredLineIndexes.add(candidate.lineIndex);
                        });
                        i += numberedPrefix - 1;
                        continue;
                    }
                    var markRun = run.slice();
                    markRun.length > 1 &&
                        markRun[markRun.length - 1].contentLengthToNext >= 80 &&
                        markRun.pop();
                    var markChapterCount = markRun.filter(function (candidate) {
                            return "chapter" === candidate.kind;
                        }).length,
                        nearDirectory = hasDirectoryHeadingNear(markRun[0].lineIndex);
                    if (markChapterCount >= 6 || (nearDirectory && markChapterCount >= 3)) {
                        markRun.forEach(function (candidate) {
                            candidate.catalog = !0;
                            ignoredLineIndexes.add(candidate.lineIndex);
                        });
                        for (var lineIndex = Math.max(0, markRun[0].lineIndex - 6); lineIndex < markRun[0].lineIndex; lineIndex++)
                            /目录|章节列表|作品目录|正文目录|总目录/i.test(lines[lineIndex].text) && ignoredLineIndexes.add(lineIndex);
                        i = Math.max(i, j);
                    }
                }
            }
            function getTitleShapeScore(candidate) {
                var title = candidate.title,
                    compactTitle = title.replace(/\s/g, ""),
                    punctuationCount = (title.match(/[，,。！？!?；;]/g) || []).length,
                    score = 0;
                compactTitle.length <= 40
                    ? (score += 2)
                    : compactTitle.length <= 80
                      ? (score += 1)
                      : compactTitle.length <= 120
                        ? (score -= 1)
                        : (score -= 4);
                isBlankLine(candidate.lineIndex - 1) && (score += 1);
                isBlankLine(candidate.lineIndex + 1) && (score += 1);
                punctuationCount >= 2 ? (score -= 2) : punctuationCount && (score -= 1);
                /[。！？!?；;]/.test(title) && (score -= 2);
                // 长句以句号收尾更像正文里的编号列表（「4.备用方案准备……。」），
                // 真正的章节标题很少这么写。
                /。$/.test(title) && compactTitle.length > 20 && (score -= 4);
                return score;
            }
            function getSequenceScore(candidate, candidates) {
                if (null == candidate.originalNumber)
                    return /^\s*(前言|序章|楔子|引子|最终章|终章|尾声|后记|完本感言|完结感言|作者感言|番外)/.test(candidate.title) ||
                        CHAPTER_QUALIFIED_SPECIAL_HEADING_RE.test(candidate.title)
                        ? 1
                        : 0;
                if (0 === candidate.originalNumber) return 3;
                // 番外/带前缀番外常把编号重新从 1 开始，按常规序列会吃「章号回退」扣分。
                // 特殊标题直接给固定分，避免因为编号重置被误杀。
                if (CHAPTER_SPECIAL_HEADING_RE.test(candidate.title)) return 2;
                var previous = findNearbyChapterCandidate(candidates, candidate.order, -1),
                    next = findNearbyChapterCandidate(candidates, candidate.order, 1),
                    recentVolume = findNearbyVolumeCandidate(candidates, candidate.order, -1),
                    score = 0;
                if (previous && null != previous.originalNumber) {
                    candidate.originalNumber === previous.originalNumber + 1
                        ? (score += 3)
                        : recentVolume && candidate.originalNumber === 1
                          ? (score += 3)
                          : next && previous.originalNumber + 1 === next.originalNumber && candidate.originalNumber !== next.originalNumber
                            ? (score -= 5)
                            : candidate.originalNumber <= previous.originalNumber && !recentVolume
                              ? (score -= 2)
                              // 章号突然跳很远，但下一章正好接得上：多半是前一行的
                              // 「第一章…」正文把相邻候选带偏了，不按跳号扣分
                              : candidate.originalNumber > previous.originalNumber + 20 &&
                                !(next && next.originalNumber === candidate.originalNumber + 1) &&
                                (score -= 3);
                }
                next &&
                    null != next.originalNumber &&
                    (next.originalNumber === candidate.originalNumber + 1
                        ? (score += 2)
                        : previous &&
                          previous.originalNumber + 1 === next.originalNumber &&
                          candidate.originalNumber !== next.originalNumber &&
                          (score -= 3));
                return score;
            }
            function scoreCandidate(candidate, candidates) {
                var score = getTitleShapeScore(candidate);
                if ("volume" === candidate.kind) {
                    var nextChapter = findNearbyChapterCandidate(candidates, candidate.order, 1);
                    score += 4;
                    nextChapter && nextChapter.lineIndex - candidate.lineIndex <= 12
                        ? ((score += 2), 1 === nextChapter.originalNumber && (score += 3))
                        : (score -= 2);
                    return score;
                }
                CHAPTER_STANDARD_HEADING_RE.test(candidate.title)
                    ? (score += 4)
                    : CHAPTER_EN_HEADING_RE.test(candidate.title)
                      ? (score += 4)
                      : CHAPTER_QUALIFIED_SPECIAL_HEADING_RE.test(candidate.title)
                        ? (score += 3)
                        : /^\s*番外/i.test(candidate.title)
                          ? (score += 3)
                          : /^\s*(前言|序章|楔子|引子|最终章|终章|尾声|后记|完本感言|完结感言|作者感言)/.test(candidate.title)
                            ? (score += 4)
                            : /^\s*正文(?:\s|$|[：:、-])/.test(candidate.title)
                              ? (score += 1)
                              : (score += 2);
                candidate.contentLengthToNext >= 200
                    ? (score += 3)
                    : candidate.contentLengthToNext >= 80
                      ? (score += 2)
                      : candidate.contentLengthToNext >= 20
                        ? (score += 1)
                        : /^\s*(前言|序章|楔子|引子|最终章|终章|尾声|后记|完本感言|完结感言|作者感言|番外)/.test(candidate.title) ||
                            CHAPTER_QUALIFIED_SPECIAL_HEADING_RE.test(candidate.title) ||
                            (score -= 2);
                score += getSequenceScore(candidate, candidates);
                return score;
            }
            var ignoredLineIndexes = new Set();
            var numberedHeadingLineIndexes = collectNumberedHeadings();
            // buildCandidates 内部会把重复标题行写进 ignoredLineIndexes，必须先建好集合
            var candidates = buildCandidates();
            markCatalogCandidates(candidates, ignoredLineIndexes);
            candidates.forEach(function (candidate) {
                candidate.score = scoreCandidate(candidate, candidates);
            });
            var selectedByLine = new Map(),
                validChapterCandidateCount = candidates.filter(function (candidate) {
                    return !candidate.catalog && "chapter" === candidate.kind;
                }).length;
            candidates.forEach(function (candidate) {
                if (candidate.catalog) return;
                var loneOpeningChapter =
                    "chapter" === candidate.kind &&
                    1 === validChapterCandidateCount &&
                    candidate.score >= 5 &&
                    getCompactLengthBetween(0, candidate.lineIndex) <= 80;
                if ("volume" === candidate.kind ? candidate.score >= 6 : candidate.score >= 6 || loneOpeningChapter)
                    selectedByLine.set(candidate.lineIndex, candidate);
            });
            let currentTitle = "前言",
                currentContent = "",
                currentNumber = null,
                currentOriginalNumber = null,
                currentVolumeTitle = "",
                activeVolumeTitle = "",
                nextSequentialNumber = 1;
            function pushCurrentChapter() {
                currentContent.trim() &&
                    (function () {
                        var content = currentContent.trim(),
                            title = currentTitle || currentVolumeTitle || "前言";
                        var originalNumber =
                                null == currentOriginalNumber
                                    ? parseTitleNumber(title)
                                    : currentOriginalNumber,
                            sequenceNumber =
                                null == currentNumber
                                    ? 0 === originalNumber
                                        ? 0
                                        : nextSequentialNumber++
                                    : currentNumber;
                        // 可疑判定只算一次（内部对全文做多轮正则扫描，长篇小说很贵）
                        var suspiciousReason = getSuspiciousChapterReason(title, content);
                        chapters.push({
                            title: title,
                            content: content,
                            chapterNumber: sequenceNumber,
                            originalChapterNumber: originalNumber,
                            volumeTitle: currentVolumeTitle,
                            suspicious: !!suspiciousReason,
                            suspiciousReason: suspiciousReason
                        });
                    })();
            }
            for (const line of lines) {
                const trimmed = line.text;
                if (!trimmed || ignoredLineIndexes.has(line.index)) continue;
                var selected = selectedByLine.get(line.index);
                selected
                    ? "volume" === selected.kind
                        ? (pushCurrentChapter(),
                          (activeVolumeTitle = selected.title),
                          (currentTitle = ""),
                          (currentContent = ""),
                          (currentNumber = null),
                          (currentOriginalNumber = null),
                          (currentVolumeTitle = activeVolumeTitle))
                        : (pushCurrentChapter(),
                          (currentTitle = selected.title),
                          (currentOriginalNumber = selected.originalNumber),
                          (currentNumber = null),
                          (currentVolumeTitle = activeVolumeTitle),
                          (currentContent = ""))
                    : (currentContent += trimmed + "\n");
            }
            return (pushCurrentChapter(), chapters);
        }
        function splitLongParagraphBySentence(paragraph, maxLength) {
            const result = [];
            let current = "";
            const sentences = paragraph.split(/(?<=[。！？!?；;])/);
            for (const sentence of sentences)
                if (sentence)
                    if (sentence.length > maxLength) {
                        (current.trim() && result.push(current.trim()), (current = ""));
                        for (let i = 0; i < sentence.length; i += maxLength)
                            result.push(sentence.slice(i, i + maxLength));
                    } else
                        (current + sentence).length > maxLength
                            ? (current.trim() && result.push(current.trim()), (current = sentence))
                            : (current += sentence);
            return (current.trim() && result.push(current.trim()), result);
        }
        function buildChunksForText(text, chaptersForText) {
            const chunkSize = Math.max(100, Number($ui.chunkSize.val()) || 1200),
                oneChapterMode = $ui.oneChapter.prop("checked");
            if (!text || !text.trim()) return [];
            if (oneChapterMode) {
                var chapters = Array.isArray(chaptersForText) ? chaptersForText : getCachedChapters(text);
                return chapters.map((ch, index) => ({
                    title: getChapterDisplayTitle(ch, index),
                    content: `${getChapterDisplayTitle(ch, index)}\n\n${ch.content}`
                }));
            }
            return (function (text, maxLength = 1200) {
                const safeMaxLength = Math.max(100, Number(maxLength) || 1200),
                    paragraphs = (text = normalizeNewlines(text))
                        .split("\n")
                        .map((x) => x.trim())
                        .filter(Boolean),
                    result = [];
                let current = "";
                for (const paragraph of paragraphs)
                    paragraph.length > safeMaxLength
                        ? (current.trim() && result.push(current.trim()),
                          (current = ""),
                          result.push(...splitLongParagraphBySentence(paragraph, safeMaxLength)))
                        : (current + paragraph).length > safeMaxLength
                          ? (current.trim() && result.push(current.trim()), (current = paragraph + "\n"))
                          : (current += paragraph + "\n");
                return (current.trim() && result.push(current.trim()), result);
            })(text, chunkSize).map((content, index) => ({ title: `${index + 1}楼`, content: content }));
        }
        function getCachedChapters(text) {
            if (cachedChapters && cachedChapterText === text) return cachedChapters;
            cachedChapterText = text;
            cachedChapters = parseChapters(text);
            cachedChapterIndexMap = null;
            cachedPlotUnitKey = null;
            cachedPlotUnitWords = null;
            return cachedChapters;
        }
        function getChapterIndexMap(chapters) {
            chapters = Array.isArray(chapters) ? chapters : [];
            if (!chapters.length) return {};
            if (chapters === cachedChapters && cachedChapterIndexMap) return cachedChapterIndexMap;
            var map = Object.create(null);
            for (var i = 0; i < chapters.length; i++) map[getChapterNumber(chapters[i], i)] = i;
            if (chapters === cachedChapters) cachedChapterIndexMap = map;
            return map;
        }
        function getChunkCacheKey() {
            return [
                $ui.oneChapter?.prop?.("checked") ? "chapter" : "length",
                Math.max(100, Number($ui.chunkSize?.val?.()) || 1200)
            ].join(":");
        }
        function getCachedChunks(text) {
            var cacheKey = getChunkCacheKey();
            return cachedChunks && cachedChunksText === text && cachedChunksKey === cacheKey
                ? cachedChunks
                : ((cachedChunksText = text),
                  (cachedChunksKey = cacheKey),
                  (cachedChunks = buildChunksForText(text, getCachedChapters(text))),
                  cachedChunks);
        }
        function getRangeValues(prefix, maxValue, forceWrite = !0) {
            let start = getNullableIntegerInputValue(`#${prefix}_start`),
                end = getNullableIntegerInputValue(`#${prefix}_end`);
            return (
                (maxValue = Math.max(1, Number(maxValue) || 1)),
                (null === start || start <= 0) && (start = 1),
                (null === end || end <= 0) && (end = maxValue),
                (start = Math.max(1, Math.min(start, maxValue))),
                (end = Math.max(1, Math.min(end, maxValue))),
                start > end && ([start, end] = [end, start]),
                $(`#${prefix}_start,#${prefix}_end`).attr("min", 1).attr("max", maxValue),
                setRangeInputValue(`#${prefix}_start`, start, forceWrite),
                setRangeInputValue(`#${prefix}_end`, end, forceWrite),
                { start: start, end: end }
            );
        }
        function getChapterRangeValues(prefix, chapters, forceWrite = !0) {
            var bounds = getChapterNumberBounds(chapters),
                start = getNullableIntegerInputValue(`#${prefix}_start`),
                end = getNullableIntegerInputValue(`#${prefix}_end`),
                minChapter = bounds.min,
                maxChapter = bounds.max;
            return (
                (null === start || start < minChapter) && (start = Math.max(1, minChapter)),
                (null === end || end < minChapter) && (end = maxChapter),
                (start = Math.max(minChapter, Math.min(start, maxChapter))),
                (end = Math.max(minChapter, Math.min(end, maxChapter))),
                start > end && ([start, end] = [end, start]),
                $(`#${prefix}_start,#${prefix}_end`).attr("min", minChapter).attr("max", maxChapter),
                setRangeInputValue(`#${prefix}_start`, start, forceWrite),
                setRangeInputValue(`#${prefix}_end`, end, forceWrite),
                { start: start, end: end, min: minChapter, max: maxChapter }
            );
        }
        function normalizeImportRangeInputs(forceWrite) {
            if (!novelText) return;
            var workingText = getWorkingTextForImport(),
                chapters = getCachedChapters(workingText),
                chunks = getCachedChunks(workingText);
            chapters.length && getChapterRangeValues("novel_import_chapter", chapters, forceWrite);
            chunks.length && getRangeValues("novel_import_floor", chunks.length, forceWrite);
        }
        function getWorkingTextForImport() {
            return novelText;
        }
        function requestDomUpdate(fn) {
            requestAnimationFrame(() => fn());
        }
        function isPanelOpen(panel) {
            try {
                return !panel || !panel.length || !0 === panel.prop("open");
            } catch (e) {
                return !0;
            }
        }
        let refreshTimer = null;
        function scheduleRefreshAll() {
            if (shouldPauseDomRefresh())
                return (
                    (_pendingRefreshAfterInput = !0),
                    void (refreshTimer && (clearTimeout(refreshTimer), (refreshTimer = null)))
                );
            (refreshTimer && clearTimeout(refreshTimer),
                (refreshTimer = setTimeout(
                    () => {
                        ((refreshTimer = null),
                            shouldPauseDomRefresh() || shouldPauseDomRefresh()
                                ? (_pendingRefreshAfterInput = !0)
                                : (updateStats(),
                                  updateRangeInputs(),
                                  isPanelOpen($ui.chapterPanel)
                                      ? updateChapterPreview()
                                      : $ui.chapterPreview.html(
                                            '<div class="novel_empty_hint">展开后生成预览</div>'
                                        ),
                                  isPanelOpen($ui.floorPanel)
                                      ? updateFloorPreview()
                                      : $ui.floorPreview.html(
                                            '<div class="novel_empty_hint">展开后生成预览</div>'
                                        ),
                                  $ui.searchKeyword.val()?.trim() && updateSearchResults(),
                                  setTimeout(fixNovelImporterButtonLayout, 0)));
                    },
                    isMobileViewport() ? 120 : 80
                )));
        }
        function updateStats() {
            if (shouldPauseDomRefresh()) return void (_pendingRefreshAfterInput = !0);
            const workingText = getWorkingTextForImport(),
                chapters = getCachedChapters(workingText),
                chapterCount = chapters.length,
                suspiciousCount = chapters.filter((ch) => ch.suspicious).length,
                excludedCount = chapters.filter((ch, index) => shouldExcludeChapter(ch, index)).length,
                chunkCount = getCachedChunks(workingText).length;
            requestDomUpdate(() => {
                shouldPauseDomRefresh()
                    ? (_pendingRefreshAfterInput = !0)
                    : $ui.stats.html(
                          `\n                    字数：${novelText.length.toLocaleString()}<br>\n                    章节：${chapterCount.toLocaleString()}｜可疑：${suspiciousCount.toLocaleString()}｜已排除：${excludedCount.toLocaleString()}<br>\n                    预计导入楼数：${chunkCount.toLocaleString()}\n                `
                      );
            });
        }
        function updateRangeInputs() {
            if (shouldPauseDomRefresh()) return void (_pendingRefreshAfterInput = !0);
            const workingText = getWorkingTextForImport(),
                chapters = getCachedChapters(workingText),
                chunks = getCachedChunks(workingText);
            requestDomUpdate(() => {
                shouldPauseDomRefresh()
                    ? (_pendingRefreshAfterInput = !0)
                    : (chapters.length && getChapterRangeValues("novel_import_chapter", chapters, !1),
                      chunks.length && getRangeValues("novel_import_floor", chunks.length, !1));
            });
        }
        function updateChapterPreview() {
            if (shouldPauseDomRefresh()) return void (_pendingRefreshAfterInput = !0);
            const chapters = novelText ? getCachedChapters(novelText) : [],
                keyword = lastSearchKeyword.trim(),
                caseSensitive = getSearchCaseSensitive(),
                onlyHit = getOnlyHitItems();
            if (!chapters.length)
                return void requestDomUpdate(() => {
                    $ui.chapterPreview.html('<div class="novel_empty_hint">暂无章节</div>');
                });
            const visibleChapters = chapters.slice(0, chapterPreviewLimit),
                hasMore = chapterPreviewLimit < chapters.length;
            let visibleCount = 0,
                visibleHitCount = 0;
            const controls = `\n                <div class="novel_preview_controls">\n                    <span>当前显示章节：${visibleChapters.length.toLocaleString()} / ${chapters.length.toLocaleString()}</span>\n                    ${hasMore ? '<button id="novel_load_more_chapters" class="menu_button">加载更多章节</button>' : ""}\n                    ${hasMore ? '<button id="novel_show_all_chapters" class="menu_button danger_button">显示全部章节</button>' : ""}\n                </div>\n            `,
                html = visibleChapters
                    .map((ch, index) => {
                        const chapterIndex = getChapterNumber(ch, index),
                            displayTitle = getChapterDisplayTitle(ch, index),
                            fullText = `${displayTitle}\n${ch.content}`,
                            hitCount = keyword ? countOccurrences(fullText, keyword, caseSensitive) : 0;
                        if (keyword && onlyHit && hitCount <= 0) return "";
                        ((visibleCount += 1), (visibleHitCount += hitCount));
                        const hitInfo = keyword
                                ? `<span class="novel_hit_badge">命中 ${hitCount} 处</span>`
                                : "",
                            excluded = shouldExcludeChapter(ch, index),
                            suspiciousInfo = ch.suspicious
                                ? `<span class="novel_hit_badge">可疑：${escapeHtml(ch.suspiciousReason || "可能不是正文")}</span>`
                                : "",
                            excludeButton = `<button class="menu_button novel_chapter_exclude_toggle" data-chapter-number="${chapterIndex}">${excluded ? "恢复" : "排除"}</button>`;
                        return `\n                        <details class="novel_collapse_item">\n                            <summary>\n                                <span>\n                                    <b>${chapterIndex}. ${escapeHtml(displayTitle)}</b>\n                                    ${hitInfo}\n                                    ${suspiciousInfo}\n                                </span>\n                                <span class="novel_chapter_meta">${excluded ? "已排除｜" : ""}${ch.content.length.toLocaleString()} 字</span>\n                            </summary>\n        \n                            <div class="novel_collapse_content">\n                                <div class="novel_button_row">${excludeButton}</div>\n                                <div class="novel_text_wrap novel_text_preview">\n                                    ${splitSummaryText(ch.content)}\n                                </div>\n                            </div>\n                        </details>\n                    `;
                    })
                    .filter(Boolean)
                    .join("");
            requestDomUpdate(() => {
                shouldPauseDomRefresh()
                    ? (_pendingRefreshAfterInput = !0)
                    : ($ui.chapterPreview.html(
                          controls + (html || '<div class="novel_empty_hint">没有命中章节</div>')
                      ),
                      keyword
                          ? $ui.chapterPreview
                                .closest(".novel_panel")
                                .find("> summary b")
                                .text(`原文预览（可见命中 ${visibleHitCount.toLocaleString()} 处）`)
                          : $ui.chapterPreview.closest(".novel_panel").find("> summary b").text("原文预览"),
                      bindShowMoreEvents("#novel_chapter_preview"),
                      $("#novel_chapter_preview")
                          .off("click", ".novel_chapter_exclude_toggle")
                          .on("click", ".novel_chapter_exclude_toggle", function (event) {
                              event.preventDefault();
                              var number = Number($(this).data("chapter-number")),
                                  excludedList = Array.isArray(worldBookConfig.excludedChapterNumbers)
                                      ? worldBookConfig.excludedChapterNumbers.slice()
                                      : [],
                                  includedList = Array.isArray(worldBookConfig.includedChapterNumbers)
                                      ? worldBookConfig.includedChapterNumbers.slice()
                                      : [],
                                  excludedIdx = excludedList.indexOf(number),
                                  includedIdx = includedList.indexOf(number),
                                  isExcluded = shouldExcludeChapter(
                                      chapters.find(function (ch, idx) {
                                          return getChapterNumber(ch, idx) === number;
                                      }),
                                      0
                                  );
                              (isExcluded
                                  ? (excludedIdx >= 0 && excludedList.splice(excludedIdx, 1),
                                    includedIdx < 0 && Number.isFinite(number) && includedList.push(number))
                                  : (includedIdx >= 0 && includedList.splice(includedIdx, 1),
                                    excludedIdx < 0 && Number.isFinite(number) && excludedList.push(number)),
                                  (worldBookConfig.excludedChapterNumbers = excludedList
                                      .filter(Number.isFinite)
                                      .sort(function (a, b) {
                                          return a - b;
                                      })),
                                  (worldBookConfig.includedChapterNumbers = includedList
                                      .filter(Number.isFinite)
                                      .sort(function (a, b) {
                                          return a - b;
                                      })),
                                  saveWorldBookConfig(),
                                  invalidateCache(),
                                  scheduleRefreshAll(),
                                  renderWorldBookChapterList(),
                                  updateWorldBookBatchPreview());
                          }),
                      setTimeout(fixNovelImporterButtonLayout, 0),
                      $("#novel_load_more_chapters").on("click", () => {
                          ((chapterPreviewLimit += (isMobileViewport(), 10)), updateChapterPreview());
                      }),
                      $("#novel_show_all_chapters").on("click", () => {
                          confirm("章节很多时可能导致手机卡顿，确定显示全部章节吗？") &&
                              ((chapterPreviewLimit = chapters.length), updateChapterPreview());
                      }));
            });
        }
        function updateFloorPreview() {
            if (shouldPauseDomRefresh()) return void (_pendingRefreshAfterInput = !0);
            const workingText = getWorkingTextForImport(),
                chunks = workingText ? getCachedChunks(workingText) : [],
                keyword = lastSearchKeyword.trim(),
                caseSensitive = getSearchCaseSensitive(),
                onlyHit = getOnlyHitItems();
            if (!chunks.length)
                return void requestDomUpdate(() => {
                    $ui.floorPreview.html('<div class="novel_empty_hint">暂无楼层</div>');
                });
            const visibleChunks = chunks.slice(0, floorPreviewLimit),
                hasMore = floorPreviewLimit < chunks.length;
            let visibleCount = 0,
                visibleHitCount = 0;
            const controls = `\n                <div class="novel_preview_controls">\n                    <span>当前显示楼层：${visibleChunks.length.toLocaleString()} / ${chunks.length.toLocaleString()}</span>\n                    ${hasMore ? '<button id="novel_load_more_floors" class="menu_button">加载更多楼层</button>' : ""}\n                    ${hasMore ? '<button id="novel_show_all_floors" class="menu_button danger_button">显示全部楼层</button>' : ""}\n                </div>\n            `,
                html = visibleChunks
                    .map((chunk, index) => {
                        const floorIndex = index + 1,
                            hitCount = keyword ? countOccurrences(chunk.content, keyword, caseSensitive) : 0;
                        if (keyword && onlyHit && hitCount <= 0) return "";
                        ((visibleCount += 1), (visibleHitCount += hitCount));
                        const hitInfo = keyword
                            ? `<span class="novel_hit_badge">命中 ${hitCount} 处</span>`
                            : "";
                        return `\n                        <details class="novel_collapse_item" data-novel-floor-index="${floorIndex}">\n                            <summary>\n                                <span>\n                                    <b>${escapeHtml(chunk.title && chunk.title !== `${floorIndex}楼` ? `${floorIndex}楼：${chunk.title}` : `${floorIndex}楼`)}</b>\n                                    ${hitInfo}\n                                </span>\n                                <span class="novel_chapter_meta">${chunk.content.length.toLocaleString()} 字</span>\n                            </summary>\n        \n                            <div class="novel_collapse_content">\n                                <div class="novel_text_wrap novel_text_preview">\n                                    ${splitSummaryText(chunk.content)}\n                                </div>\n                            </div>\n                        </details>\n                    `;
                    })
                    .filter(Boolean)
                    .join("");
            requestDomUpdate(() => {
                shouldPauseDomRefresh()
                    ? (_pendingRefreshAfterInput = !0)
                    : ($ui.floorPreview.html(
                          controls + (html || '<div class="novel_empty_hint">没有命中楼层</div>')
                      ),
                      keyword
                          ? $ui.floorPreview
                                .closest(".novel_panel")
                                .find("> summary b")
                                .text(`楼层预览（可见命中 ${visibleHitCount.toLocaleString()} 处）`)
                          : $ui.floorPreview.closest(".novel_panel").find("> summary b").text("楼层预览"),
                      bindShowMoreEvents("#novel_floor_preview"),
                      setTimeout(fixNovelImporterButtonLayout, 0),
                      $("#novel_load_more_floors").on("click", () => {
                          ((floorPreviewLimit += isMobileViewport() ? 10 : 20), updateFloorPreview());
                      }),
                      $("#novel_show_all_floors").on("click", () => {
                          confirm("楼层很多时可能导致手机卡顿，确定显示全部楼层吗？") &&
                              ((floorPreviewLimit = chunks.length), updateFloorPreview());
                      }));
            });
        }
        function updateSearchResults() {
            if (shouldPauseDomRefresh()) return void (_pendingRefreshAfterInput = !0);
            const keyword = ($ui.searchKeyword.val() || "").trim(),
                caseSensitive = getSearchCaseSensitive();
            if (((lastSearchKeyword = keyword), !keyword))
                return (
                    requestDomUpdate(() => {
                        $ui.searchResults.html('<div class="novel_empty_hint">请输入关键词后搜索</div>');
                    }),
                    isPanelOpen($ui.chapterPanel) && updateChapterPreview(),
                    isPanelOpen($ui.floorPanel) && updateFloorPreview(),
                    void setTimeout(fixNovelImporterButtonLayout, 0)
                );
            const workingText = getWorkingTextForImport(),
                chapters = getCachedChapters(workingText),
                chunks = getCachedChunks(workingText),
                chapterHits = [],
                floorHits = [];
            (chapters.forEach((ch, index) => {
                const displayTitle = getChapterDisplayTitle(ch, index),
                    hitCount = countOccurrences(`${displayTitle}\n${ch.content}`, keyword, caseSensitive);
                hitCount > 0 &&
                    chapterHits.push({
                        index: getChapterNumber(ch, index),
                        title: displayTitle,
                        hitCount: hitCount
                    });
            }),
                chunks.forEach((chunk, index) => {
                    const hitCount = countOccurrences(chunk.content, keyword, caseSensitive);
                    hitCount > 0 && floorHits.push({ index: index + 1, hitCount: hitCount });
                }));
            const totalHits = countOccurrences(workingText, keyword, caseSensitive),
                SEARCH_LIMIT = 15,
                chapterVisible = chapterHits.slice(0, SEARCH_LIMIT),
                chapterHidden = chapterHits.slice(SEARCH_LIMIT),
                chapterHtml = chapterHits.length
                    ? chapterVisible
                          .map(
                              (hit) =>
                                  `\n                    <li>\n                        第 ${hit.index} 章：${escapeHtml(hit.title)}\n                        <span class="novel_hit_badge">命中 ${hit.hitCount} 处</span>\n                    </li>\n                `
                          )
                          .join("") +
                      (chapterHidden.length
                          ? `<li><button class="menu_button novel_search_expand" data-target="chapter">${chapterHidden.length} 章未显示，点击展开</button></li>`
                          : "")
                    : "<li>未在章节中找到</li>",
                floorVisible = floorHits.slice(0, SEARCH_LIMIT),
                floorHidden = floorHits.slice(SEARCH_LIMIT),
                floorHtml = floorHits.length
                    ? floorVisible
                          .map(
                              (hit) =>
                                  `\n                    <li>\n                        <button class="menu_button novel_link_button novel_jump_floor" data-floor="${hit.index}">\n                            第 ${hit.index} 楼\n                        </button>\n                        <span class="novel_hit_badge">命中 ${hit.hitCount} 处</span>\n                    </li>\n                `
                          )
                          .join("") +
                      (floorHidden.length
                          ? `<li><button class="menu_button novel_search_expand" data-target="floor">${floorHidden.length} 楼未显示，点击展开</button></li>`
                          : "")
                    : "<li>未在楼层中找到</li>",
                floorMore = floorHits.length
                    ? '<div class="novel_more_hint">查看原文请在楼层预览中查看。</div>'
                    : "";
            (requestDomUpdate(() => {
                shouldPauseDomRefresh()
                    ? (_pendingRefreshAfterInput = !0)
                    : ($ui.searchResults.html(
                          `\n                    <details class="novel_collapse_item" open>\n                        <summary>\n                            <b>搜索结果：${escapeHtml(keyword)}</b>\n                            <span class="novel_hit_badge">全文命中 ${totalHits} 处</span>\n                        </summary>\n        \n                        <div class="novel_collapse_content">\n                            <b>所在章节</b>\n                            <ol class="novel_search_chapter_list">${chapterHtml}</ol>\n        \n                            <b>所在楼层</b>\n                            <ol class="novel_search_floor_list">${floorHtml}</ol>\n                            ${floorMore}\n                        </div>\n                    </details>\n                `
                      ),
                      $ui.searchResults
                          .off("click", ".novel_jump_floor")
                          .on("click", ".novel_jump_floor", function () {
                              !(function (index) {
                                  const chunks = getCachedChunks(getWorkingTextForImport());
                                  (index > floorPreviewLimit &&
                                      ((floorPreviewLimit = Math.min(
                                          chunks.length,
                                          20 * Math.ceil(index / 20)
                                      )),
                                      updateFloorPreview()),
                                      $ui.floorPanel.prop("open", !0),
                                      setTimeout(() => {
                                          const target = $(`[data-novel-floor-index="${index}"]`);
                                          if (target.length)
                                              if (
                                                  (target.prop("open", !0),
                                                  isMobileViewport() &&
                                                      $("#novel_importer_inline_panel").is(":visible"))
                                              ) {
                                                  const panel = document.getElementById(
                                                          "novel_importer_inline_panel"
                                                      ),
                                                      targetRect = target[0].getBoundingClientRect(),
                                                      panelRect = panel.getBoundingClientRect();
                                                  panel.scrollTop +=
                                                      targetRect.top -
                                                      panelRect.top -
                                                      Math.max(60, 0.25 * panelRect.height);
                                              } else
                                                  target[0].scrollIntoView({
                                                      behavior: "smooth",
                                                      block: "center"
                                                  });
                                          else novelToast("warning", "楼层还没有渲染出来，请先加载更多楼层");
                                      }, 50));
                              })(Number($(this).data("floor")));
                          }),
                      $ui.searchResults
                          .off("click", ".novel_search_expand")
                          .on("click", ".novel_search_expand", function () {
                              const target = $(this).data("target");
                              if ("chapter" === target) {
                                  const html = chapterHits
                                      .map(
                                          (hit) =>
                                              `\n                    <li>\n                        第 ${hit.index} 章：${escapeHtml(hit.title)}\n                        <span class="novel_hit_badge">命中 ${hit.hitCount} 处</span>\n                    </li>\n                `
                                      )
                                      .join("");
                                  $ui.searchResults
                                      .find(".novel_search_chapter_list")
                                      .html(html);
                              } else if ("floor" === target) {
                                  const html = floorHits
                                      .map(
                                          (hit) =>
                                              `\n                    <li>\n                        <button class="menu_button novel_link_button novel_jump_floor" data-floor="${hit.index}">\n                            第 ${hit.index} 楼\n                        </button>\n                        <span class="novel_hit_badge">命中 ${hit.hitCount} 处</span>\n                    </li>\n                `
                                      )
                                      .join("");
                                  $ui.searchResults
                                      .find(".novel_search_floor_list")
                                      .html(html);
                              }
                              setTimeout(fixNovelImporterButtonLayout, 0);
                          }),
                      setTimeout(fixNovelImporterButtonLayout, 0));
            }),
                updateChapterPreview(),
                updateFloorPreview());
        }
        function clearNovel() {
            confirm("确定清空当前已读取的小说文本吗？") &&
                ((novelText = ""),
                (lastSearchKeyword = ""),
                (chapterPreviewLimit = 10),
                (floorPreviewLimit = 20),
                (worldBookListLimit = 20),
                (worldBookConfig.useChapterRange = !1),
                (worldBookConfig.chapterRangeStart = 1),
                (worldBookConfig.chapterRangeEnd = 1),
                (worldBookConfig.autoAdvanceCurrentStart = 1),
                (worldBookConfig.autoAdvanceBaseChatLength = 0),
                (worldBookBatchConfig.rangeStart = 1),
                (worldBookBatchConfig.rangeEnd = 1),
                (worldBookLastInjected = null),
                invalidateCache(),
                $ui.fileInput.val(""),
                $ui.searchKeyword?.length && $ui.searchKeyword.val(""),
                $ui.importProgress.text(""),
                scheduleRefreshAll(),
                renderWorldBookChapterList(),
                updateWorldBookAutoAdvanceStatus(),
                updateWorldBookBatchPreview(),
                novelToast("success", "已清空小说"));
        }
        // —— 已缓存的小说（IndexedDB）——
        // 网页没有用户点选就无法重读本地文件，所以「重启酒馆后还能用同一本书」只能把正文本身存下来。
        // localStorage 装不下长篇（UTF-16 计数、配额约 5MB，几百万字的书必炸），所以走 IndexedDB。
        // 元信息与正文分两个 store：列缓存列表只读 meta，几 KB，不用把几百 MB 正文拉进内存。
        // 写入时机：选择 TXT 读取成功后、以及替换文本后（防抖）；恢复入口是“选择 TXT 小说”旁的「缓存」按钮，
        // 全手动，不会自动覆盖用户当前读的书。
        const NOVEL_CACHE_DB_NAME = "novelChatImporterCache",
            NOVEL_CACHE_META_STORE = "meta",
            NOVEL_CACHE_TEXT_STORE = "text",
            NOVEL_CACHE_LIMIT = 8,
            NOVEL_CACHE_SAVE_DELAY = 2000;
        let novelCacheDbPromise = null,
            novelCacheRows = [],
            novelCacheSaveTimer = null,
            $novelCacheModal = null;
        function getNovelCacheIndexedDB() {
            var candidates = [];
            // 助手脚本跑在酒馆助手的 iframe 里（srcdoc / blob URL，无 sandbox 属性），与酒馆同源，
            // 所以 indexedDB 通常直接可用；取不到时再逐级向上借宿主的同源 connection
            try {
                candidates.push(indexedDB);
            } catch (e) {}
            try {
                window.parent && window.parent !== window && candidates.push(window.parent.indexedDB);
            } catch (e2) {}
            try {
                window.top && window.top !== window && candidates.push(window.top.indexedDB);
            } catch (e3) {}
            for (var i = 0; i < candidates.length; i++) if (candidates[i]) return candidates[i];
            return null;
        }
        function openNovelCacheDb() {
            if (novelCacheDbPromise) return novelCacheDbPromise;
            novelCacheDbPromise = new Promise(function (resolve, reject) {
                var idb = getNovelCacheIndexedDB();
                if (!idb) return void reject(new Error("当前环境不支持 IndexedDB"));
                var request;
                try {
                    request = idb.open(NOVEL_CACHE_DB_NAME, 1);
                } catch (e) {
                    return void reject(e);
                }
                ((request.onupgradeneeded = function () {
                    var db = request.result;
                    db.objectStoreNames.contains(NOVEL_CACHE_META_STORE) ||
                        db.createObjectStore(NOVEL_CACHE_META_STORE, { keyPath: "id" }),
                        db.objectStoreNames.contains(NOVEL_CACHE_TEXT_STORE) ||
                            db.createObjectStore(NOVEL_CACHE_TEXT_STORE, { keyPath: "id" });
                }),
                    (request.onsuccess = function () {
                        resolve(request.result);
                    }),
                    (request.onerror = function () {
                        reject(request.error || new Error("IndexedDB 打开失败"));
                    }));
            }).catch(function (error) {
                // 失败不缓存 Promise，下次还能重试
                novelCacheDbPromise = null;
                throw error;
            });
            return novelCacheDbPromise;
        }
        function isNovelCacheRequest(value) {
            return !!value && "object" == typeof value && "onsuccess" in value;
        }
        function novelCacheRun(mode, stores, worker) {
            return openNovelCacheDb().then(function (db) {
                return new Promise(function (resolve, reject) {
                    var tx = db.transaction(stores, mode),
                        result;
                    try {
                        result = worker(tx);
                    } catch (error) {
                        return void reject(error);
                    }
                    ((tx.oncomplete = function () {
                        resolve(isNovelCacheRequest(result) ? result.result : result);
                    }),
                        (tx.onerror = function () {
                            reject(tx.error || new Error("IndexedDB 事务失败"));
                        }),
                        (tx.onabort = function () {
                            reject(tx.error || new Error("IndexedDB 事务已中止"));
                        }));
                });
            });
        }
        function listNovelCacheEntries() {
            return novelCacheRun("readonly", [NOVEL_CACHE_META_STORE], function (tx) {
                return tx.objectStore(NOVEL_CACHE_META_STORE).getAll();
            }).then(function (rows) {
                return (Array.isArray(rows) ? rows : []).sort(function (a, b) {
                    return String(b.savedAt || "").localeCompare(String(a.savedAt || ""));
                });
            });
        }
        function getNovelCacheText(id) {
            return novelCacheRun("readonly", [NOVEL_CACHE_TEXT_STORE], function (tx) {
                return tx.objectStore(NOVEL_CACHE_TEXT_STORE).get(String(id));
            }).then(function (row) {
                return row && "string" == typeof row.text ? row.text : "";
            });
        }
        function putNovelCacheEntry(entry) {
            return novelCacheRun(
                "readwrite",
                [NOVEL_CACHE_META_STORE, NOVEL_CACHE_TEXT_STORE],
                function (tx) {
                    return (
                        tx.objectStore(NOVEL_CACHE_META_STORE).put({
                            id: entry.id,
                            name: entry.name,
                            charCount: entry.charCount,
                            chapterCount: entry.chapterCount,
                            savedAt: entry.savedAt
                        }),
                        tx.objectStore(NOVEL_CACHE_TEXT_STORE).put({ id: entry.id, text: entry.text })
                    );
                }
            );
        }
        function deleteNovelCacheEntry(id) {
            return novelCacheRun(
                "readwrite",
                [NOVEL_CACHE_META_STORE, NOVEL_CACHE_TEXT_STORE],
                function (tx) {
                    return (
                        tx.objectStore(NOVEL_CACHE_META_STORE).delete(String(id)),
                        tx.objectStore(NOVEL_CACHE_TEXT_STORE).delete(String(id))
                    );
                }
            );
        }
        function clearNovelCacheStore() {
            return novelCacheRun(
                "readwrite",
                [NOVEL_CACHE_META_STORE, NOVEL_CACHE_TEXT_STORE],
                function (tx) {
                    return (
                        tx.objectStore(NOVEL_CACHE_META_STORE).clear(),
                        tx.objectStore(NOVEL_CACHE_TEXT_STORE).clear()
                    );
                }
            );
        }
        // 超出上限就按最后写入时间淘汰最旧的几本，避免缓存无限膨胀
        function trimNovelCache() {
            return listNovelCacheEntries().then(function (rows) {
                if (rows.length <= NOVEL_CACHE_LIMIT) return rows;
                var overflow = rows.slice(NOVEL_CACHE_LIMIT);
                return Promise.all(
                    overflow.map(function (row) {
                        return deleteNovelCacheEntry(row.id);
                    })
                ).then(function () {
                    return rows.slice(0, NOVEL_CACHE_LIMIT);
                });
            });
        }
        function saveNovelTextToCache(name, text) {
            var cacheId = String(name || "").trim();
            if (!cacheId || "string" != typeof text || !text) return Promise.resolve(!1);
            var chapterCount = 0;
            try {
                // 调用点刚解析过全文，这里是缓存命中；万一没有也不会更贵
                chapterCount = getCachedChapters(text).length;
            } catch (e) {}
            return putNovelCacheEntry({
                id: cacheId,
                name: cacheId,
                charCount: text.length,
                chapterCount: chapterCount,
                savedAt: new Date().toISOString(),
                text: text
            })
                .then(function () {
                    return trimNovelCache();
                })
                .then(function () {
                    refreshNovelCacheButton();
                    return !0;
                })
                .catch(function (error) {
                    console.warn("[" + extensionName + "] 缓存小说失败", error);
                    var quotaError = /quota|storage/i.test(
                        String(error && error.name) + String(error && error.message)
                    );
                    novelToast(
                        "warning",
                        quotaError
                            ? "缓存失败：浏览器存储空间不足，可在「缓存」里删掉旧书"
                            : "缓存失败：" + (error && error.message ? error.message : error)
                    );
                    return !1;
                });
        }
        // 替换文本后正文变了，延迟把缓存同步一遍，免得恢复出来的是替换前的版本
        function scheduleNovelCacheSave() {
            if (!novelFileName || !novelText) return;
            clearTimeout(novelCacheSaveTimer);
            novelCacheSaveTimer = setTimeout(function () {
                (novelCacheSaveTimer = null), saveNovelTextToCache(novelFileName, novelText);
            }, NOVEL_CACHE_SAVE_DELAY);
        }
        function refreshNovelCacheButton() {
            var $scope = $ui.container && $ui.container.length ? $ui.container : $("#novel_importer_container"),
                $buttons = $scope.find("#novel_cache_btn");
            if (!$buttons.length) return Promise.resolve(0);
            return listNovelCacheEntries()
                .then(function (rows) {
                    ($buttons.text(rows.length ? "缓存 " + rows.length : "缓存"),
                        $buttons.attr(
                            "title",
                            rows.length ? "已缓存 " + rows.length + " 本小说，点击查看" : "查看已缓存的小说"
                        ));
                    return rows.length;
                })
                .catch(function () {
                    return 0;
                });
        }
        function formatNovelCacheTime(value) {
            var date = new Date(value);
            if (isNaN(date.getTime())) return "";
            function pad(n) {
                return (n < 10 ? "0" : "") + n;
            }
            return (
                date.getFullYear() +
                "/" +
                pad(date.getMonth() + 1) +
                "/" +
                pad(date.getDate()) +
                " " +
                pad(date.getHours()) +
                ":" +
                pad(date.getMinutes())
            );
        }
        function renderNovelCacheRowHtml(row, index) {
            var meta = [Number(row.charCount || 0).toLocaleString() + " 字"],
                savedAt = formatNovelCacheTime(row.savedAt);
            (row.chapterCount && meta.push(Number(row.chapterCount).toLocaleString() + " 章"),
                savedAt && meta.push(savedAt));
            var isCurrent = !!novelFileName && String(novelFileName) === String(row.id);
            return (
                '<div class="novel_cache_row" style="display:flex;align-items:center;gap:10px;padding:8px 6px;border-bottom:1px solid rgba(255,255,255,0.08);">' +
                '<div style="flex:1 1 auto;min-width:0;">' +
                '<div style="font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="' +
                escapeHtml(row.name) +
                '">' +
                escapeHtml(row.name) +
                (isCurrent ? '<span style="opacity:.6;font-weight:400;">（当前）</span>' : "") +
                "</div>" +
                '<div style="opacity:.65;font-size:.88em;margin-top:2px;">' +
                escapeHtml(meta.join(" · ")) +
                "</div>" +
                "</div>" +
                '<div style="flex:0 0 auto;display:flex;gap:6px;">' +
                '<button class="menu_button novel_cache_load_btn" type="button" data-cache-index="' +
                index +
                '" style="background:var(--cGold,#ffd866);color:#1b1b1b;font-weight:700;">载入</button>' +
                '<button class="menu_button danger_button novel_cache_del_btn" type="button" data-cache-index="' +
                index +
                '">删除</button>' +
                "</div>" +
                "</div>"
            );
        }
        function renderNovelCacheList() {
            var $modal = $novelCacheModal && $novelCacheModal.length ? $novelCacheModal : $("#novel_cache_modal"),
                $list = $modal.find("#novel_cache_list");
            if (!$list.length) return Promise.resolve();
            $list.html('<div class="novel_empty_hint">正在读取缓存…</div>');
            return listNovelCacheEntries()
                .then(function (rows) {
                    if (((novelCacheRows = rows), !rows.length))
                        return void $list.html(
                            '<div class="novel_empty_hint">还没有缓存</div>'
                        );
                    $list.html(rows.map(renderNovelCacheRowHtml).join(""));
                })
                .catch(function (error) {
                    (novelCacheRows = []),
                        $list.html(
                            '<div class="novel_empty_hint">读取缓存失败：' +
                                escapeHtml(error && error.message ? error.message : String(error)) +
                                "</div>"
                        );
                });
        }
        function ensureNovelCacheModal() {
            // 缓存对象可能是被外部清理掉的游离节点，检查 isConnected 才不会拿到死 DOM
            if ($novelCacheModal && $novelCacheModal.length && $novelCacheModal[0].isConnected)
                return $novelCacheModal;
            $("#novel_cache_modal").remove();
            $("body").append(
                '\n<div id="novel_cache_modal" class="novel_modal_overlay">\n<div class="novel_modal">\n<div class="novel_modal_header">\n<b>已缓存</b>\n<button id="novel_cache_close" class="menu_button novel_modal_close" type="button">×</button>\n</div>\n<div class="novel_modal_body">\n<div id="novel_cache_list"></div>\n</div>\n<div class="novel_modal_footer">\n<button id="novel_cache_clear" class="menu_button danger_button" type="button">清空缓存</button>\n<button id="novel_cache_close2" class="menu_button" type="button">关闭</button>\n</div>\n</div>\n</div>\n'
            );
            var $modal = $("#novel_cache_modal");
            return (
                ($novelCacheModal = $modal),
                $modal.hide(),
                $modal.find("#novel_cache_close,#novel_cache_close2").on("click", closeNovelCacheModal),
                $modal.on("click", function (e) {
                    e.target === this && closeNovelCacheModal();
                }),
                $modal.find("#novel_cache_clear").on("click", function () {
                    if (!confirm("确定清空全部已缓存的小说吗？")) return;
                    clearNovelCacheStore()
                        .then(function () {
                            (novelToast("success", "已清空小说缓存"), refreshNovelCacheButton());
                            return renderNovelCacheList();
                        })
                        .catch(function (error) {
                            novelToast(
                                "error",
                                "清空缓存失败：" + (error && error.message ? error.message : error)
                            );
                        });
                }),
                $modal.find("#novel_cache_list").on("click", ".novel_cache_load_btn", function () {
                    loadNovelFromCache(Number($(this).attr("data-cache-index")));
                }),
                $modal.find("#novel_cache_list").on("click", ".novel_cache_del_btn", function () {
                    deleteNovelCacheAt(Number($(this).attr("data-cache-index")));
                }),
                $modal
            );
        }
        function openNovelCacheModal(event) {
            event && "function" == typeof event.preventDefault && event.preventDefault();
            if (!getNovelCacheIndexedDB())
                return void novelToast("error", "当前环境不支持本地缓存（IndexedDB 不可用）");
            (showNovelModal(ensureNovelCacheModal()), renderNovelCacheList());
        }
        function closeNovelCacheModal() {
            $novelCacheModal && $novelCacheModal.length
                ? $novelCacheModal.removeClass("open").hide()
                : $("#novel_cache_modal").removeClass("open").hide();
        }
        function loadNovelFromCache(index) {
            var row = novelCacheRows[index];
            if (!row) return;
            getNovelCacheText(row.id)
                .then(function (text) {
                    if (!text) return void novelToast("error", "缓存内容已丢失，请重新选择 TXT 文件");
                    (closeNovelCacheModal(), applyLoadedNovelText(text, row.name || row.id, { fromCache: !0 }));
                })
                .catch(function (error) {
                    novelToast("error", "载入缓存失败：" + (error && error.message ? error.message : error));
                });
        }
        function deleteNovelCacheAt(index) {
            var row = novelCacheRows[index];
            if (!row || !confirm("确定删除缓存「" + (row.name || row.id) + "」吗？")) return;
            deleteNovelCacheEntry(row.id)
                .then(function () {
                    (novelToast("success", "已删除缓存"), refreshNovelCacheButton());
                    return renderNovelCacheList();
                })
                .catch(function (error) {
                    novelToast("error", "删除缓存失败：" + (error && error.message ? error.message : error));
                });
        }
        async function readNovelTextFromFile(file) {
            const encoding = ($ui.fileEncoding && $ui.fileEncoding.val()) || "auto",
                buffer = await file.arrayBuffer();
            function decodeAuto(buf) {
                try {
                    const utf8Text = new TextDecoder("utf-8", { fatal: false }).decode(buf),
                        sample = utf8Text.slice(0, Math.min(50000, utf8Text.length)),
                        replacementCount = (sample.match(/\uFFFD/g) || []).length,
                        ratio = sample.length ? replacementCount / sample.length : 0;
                    if (ratio < 0.01) return utf8Text;
                } catch (e) {}
                try {
                    return new TextDecoder("gb18030").decode(buf);
                } catch (e2) {
                    try {
                        return new TextDecoder("utf-8").decode(buf);
                    } catch (e3) {
                        return "";
                    }
                }
            }
            if ("auto" === encoding) return decodeAuto(buffer);
            try {
                return new TextDecoder(encoding).decode(buffer);
            } catch (error) {
                return (
                    console.warn(`[${extensionName}] TextDecoder failed, fallback to auto`, error),
                    decodeAuto(buffer)
                );
            }
        }
        // 读到正文之后的全部收尾工作：文件选择与「缓存载入」共用同一段，
        // 顺序沿用旧版内联代码（重置分页 → 重算默认章节范围 → 刷新各面板），避免两处行为漂移
        function applyLoadedNovelText(text, name, opts) {
            opts = opts || {};
            (novelFileName = name || novelFileName || ""),
                (worldBookConfig.novelName = novelFileName),
                (novelText = text),
                (lastSearchKeyword = ""),
                (chapterPreviewLimit = 10),
                (floorPreviewLimit = 20),
                (worldBookListLimit = 20),
                invalidateCache(),
                (function () {
                    var chapters = getCachedChapters(novelText),
                        bounds = getChapterNumberBounds(chapters),
                        defaultStart = getDefaultStartChapterNumber(chapters);
                    (function () {
                        var keep =
                            !!worldBookConfig.useChapterRange &&
                            Number.isFinite(Number(worldBookConfig.chapterRangeStart)) &&
                            Number.isFinite(Number(worldBookConfig.chapterRangeEnd)) &&
                            Number(worldBookConfig.chapterRangeEnd) >=
                                Number(worldBookConfig.chapterRangeStart) &&
                            // uid 可能是 0（世界书第一条条目），不能用真值判断
                            null !== worldBookConfig.worldBookEntryUid &&
                            void 0 !== worldBookConfig.worldBookEntryUid;
                        if (keep) {
                            var ks = Number(worldBookConfig.chapterRangeStart);
                            var ke = Number(worldBookConfig.chapterRangeEnd);
                            ks = Math.min(Math.max(ks, bounds.min || 1), bounds.max || ks);
                            ke = Math.min(Math.max(ke, ks), bounds.max || ke);
                            worldBookConfig.chapterRangeStart = ks;
                            worldBookConfig.chapterRangeEnd = ke;
                            worldBookConfig.autoAdvanceStartChapter = ks;
                            worldBookConfig.autoAdvanceCurrentStart = ks;
                            worldBookConfig.autoAdvanceChapterCount = Math.max(1, ke - ks + 1);
                        } else {
                            var win = Math.max(1, Number(worldBookConfig.autoAdvanceChapterCount) || 5);
                            worldBookConfig.chapterRangeStart = defaultStart;
                            worldBookConfig.chapterRangeEnd = Math.min(
                                bounds.max || defaultStart,
                                defaultStart + win - 1
                            );
                            worldBookConfig.autoAdvanceStartChapter = defaultStart;
                            worldBookConfig.autoAdvanceCurrentStart = defaultStart;
                            worldBookConfig.autoAdvanceChapterCount = win;
                            worldBookConfig.useChapterRange = !0;
                        }
                        worldBookBatchConfig.rangeStart = worldBookConfig.chapterRangeStart;
                        worldBookBatchConfig.rangeEnd = worldBookConfig.chapterRangeEnd;
                    })();
                })(),
                (worldBookConfig.autoAdvanceBaseChatLength = getCurrentChatFloorCount()),
                (worldBookConfig.autoAdvanceTargetChatLength = 0),
                (worldBookLastInjected = null),
                markWorldBookContentDirty("TXT 已重新读取，按“更新注入内容”同步到世界书条目"),
                $ui.searchKeyword?.length && $ui.searchKeyword.val(""),
                $ui.importProgress.text(""),
                scheduleRefreshAll(),
                renderWorldBookChapterList(),
                updateWorldBookAutoAdvanceStatus(),
                updateWorldBookBatchPreview(),
                refreshNovelPlotControlBar();
            if (opts.autoRestore)
                return void novelToast(
                    "success",
                    "已自动恢复上次的小说《" + (getNovelDisplayName() || novelFileName) + "》，可直接翻页"
                );
            if (opts.fromCache)
                return void novelToast("success", "已从缓存载入：" + (getNovelDisplayName() || novelFileName));
            novelToast("success", "TXT 已读取");
            var parsedChapters = getCachedChapters(novelText);
            if (novelText.length > 100000 && parsedChapters.length <= 5) {
                var usedEncoding = $ui.fileEncoding.val() || "auto";
                novelToast(
                    "warning",
                    "仅识别到 " +
                        parsedChapters.length +
                        " 章，可能编码不匹配。当前编码：" +
                        usedEncoding +
                        "。请尝试切换为 UTF-8 或 GBK/GB18030 后重新选择文件。"
                );
            }
        }
        function ensureSingleReplaceModal() {
            if ($("#novel_replace_modal").length) return $("#novel_replace_modal");
            $("body").append(
                '\n<div id="novel_replace_modal" class="novel_modal_overlay">\n<div class="novel_modal">\n<div class="novel_modal_header">\n<b>关键词替换</b>\n<button id="novel_replace_close" class="menu_button novel_modal_close" type="button">×</button>\n</div>\n<div class="novel_modal_body">\n<label>查找关键词</label>\n<input id="novel_replace_from" class="text_pole" type="text" placeholder="要替换的内容" />\n<label>替换为</label>\n<input id="novel_replace_to" class="text_pole" type="text" placeholder="替换后的内容" />\n<label class="checkbox_label">\n<input type="checkbox" id="novel_replace_case_sensitive" />\n区分大小写\n</label>\n<div id="novel_replace_stats" class="novel_replace_stats">请输入要替换的关键词</div>\n</div>\n<div class="novel_modal_footer">\n<button id="novel_replace_cancel" class="menu_button" type="button">取消</button>\n<button id="novel_replace_apply" class="menu_button" type="button">确认替换</button>\n</div>\n</div>\n</div>\n'
            );
            var $modal = $("#novel_replace_modal");
            $modal.hide();
            $("#novel_replace_close").on("click", closeSingleReplaceModal);
            $("#novel_replace_cancel").on("click", closeSingleReplaceModal);
            $modal.on("click", function (e) {
                e.target === this && closeSingleReplaceModal();
            });
            $("#novel_replace_from").on("input", updateSingleReplacePreview);
            $("#novel_replace_to").on("input", updateSingleReplacePreview);
            $("#novel_replace_case_sensitive").on("change", updateSingleReplacePreview);
            $("#novel_replace_apply").on("click", applySingleReplace);
            return $modal;
        }
        function showNovelModal($modal) {
            if (!$modal || !$modal.length) return;
            var hostDoc = document;
            try {
                if (window.parent && window.parent.document) hostDoc = window.parent.document;
            } catch (e) {}
            var $hostBody = $(hostDoc.body);
            if ($modal.parent()[0] !== hostDoc.body) $hostBody.append($modal);
            $modal
                .css({
                    display: "flex",
                    position: "fixed",
                    inset: "0",
                    top: "0",
                    right: "0",
                    bottom: "0",
                    left: "0",
                    zIndex: "2147483646",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(0, 0, 0, 0.62)",
                    padding: "16px",
                    boxSizing: "border-box"
                })
                .addClass("open")
                .show();
            $modal.find(".novel_modal").css({
                width: "min(520px, 92vw)",
                maxWidth: "92vw",
                maxHeight: "min(88vh, 720px)",
                overflow: "auto",
                borderRadius: "14px",
                padding: "16px",
                boxSizing: "border-box"
            });
            $modal.find(".novel_modal_footer").css({
                display: "flex",
                flexDirection: "row",
                flexWrap: "nowrap",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: "10px",
                marginTop: "14px"
            });
            $modal.find(".menu_button").css({
                display: "inline-flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                width: "auto",
                minWidth: "96px",
                maxWidth: "none",
                minHeight: "38px",
                height: "auto",
                padding: "8px 14px",
                whiteSpace: "nowrap",
                wordBreak: "keep-all",
                writingMode: "horizontal-tb",
                textOrientation: "mixed",
                textAlign: "center",
                lineHeight: "1.35",
                flex: "0 0 auto"
            });
            $modal.find(".novel_modal_close").css({
                minWidth: "36px",
                width: "36px",
                height: "36px",
                padding: "0"
            });
            $modal.find("#novel_replace_apply,#novel_batch_replace_apply").css({
                background: "var(--cGold, #ffd866)",
                color: "#1b1b1b",
                fontWeight: "700"
            });
        }
        function openSingleReplaceModal(e) {
            e && "function" == typeof e.preventDefault && e.preventDefault();
            e && "function" == typeof e.stopPropagation && e.stopPropagation();
            if (!novelText) return void novelToast("error", "请先选择 TXT 文件");
            try {
                var $modal = ensureSingleReplaceModal();
                $("#novel_replace_from").val(($ui.searchKeyword && $ui.searchKeyword.val() || "").trim());
                $("#novel_replace_to").val("");
                $("#novel_replace_case_sensitive").prop("checked", !1);
                updateSingleReplacePreview();
                showNovelModal($modal);
            } catch (err) {
                console.error(`[${extensionName}] openSingleReplaceModal error`, err);
                novelToast("error", "打开替换窗口失败：" + (err && err.message ? err.message : err));
            }
        }
        function closeSingleReplaceModal() {
            $("#novel_replace_modal").removeClass("open").hide();
        }
        function updateSingleReplacePreview() {
            const from = $("#novel_replace_from").val(),
                to = $("#novel_replace_to").val(),
                caseSensitive = $("#novel_replace_case_sensitive").prop("checked");
            if (!from) return void $("#novel_replace_stats").html("请输入要替换的关键词");
            const re = new RegExp(escapeRegExp(from), caseSensitive ? "g" : "gi"),
                count = (novelText.match(re) || []).length;
            $("#novel_replace_stats").html(
                `\n                将把 <b>${escapeHtml(from)}</b>\n                替换为 <b>${escapeHtml(to)}</b><br>\n                预计替换：${count.toLocaleString()} 处<br>\n                模式：${caseSensitive ? "区分大小写" : "不区分大小写"}\n            `
            );
        }
        function applySingleReplace() {
            const from = $("#novel_replace_from").val(),
                to = $("#novel_replace_to").val();
            if (!from) return void novelToast("error", "请输入要替换的关键词");
            const caseSensitive = $("#novel_replace_case_sensitive").prop("checked"),
                re = new RegExp(escapeRegExp(from), caseSensitive ? "g" : "gi"),
                count = (novelText.match(re) || []).length;
            count <= 0
                ? novelToast("warning", "没有找到可替换内容")
                : confirm(`确认替换 ${count} 处内容吗？`) &&
                  ((novelText = novelText.replace(re, () => to)),
                  $ui.searchKeyword?.length && $ui.searchKeyword.val(to || from),
                  (lastSearchKeyword = to || ""),
                  (chapterPreviewLimit = 10),
                  (floorPreviewLimit = 20),
                  invalidateCache(),
                  markWorldBookContentDirty(
                      "文本已替换，按“更新注入内容”同步到世界书条目"
                  ),
                  scheduleRefreshAll(),
                  // 正文变了，把缓存同步一遍，免得恢复出来的是替换前的旧版本
                  scheduleNovelCacheSave(),
                  closeSingleReplaceModal(),
                  novelToast("success", `已替换 ${count} 处`));
        }
        function parseBatchReplaceRules() {
            const lines = ($("#novel_batch_replace_rules").val() || "").split(/\r?\n/),
                rules = [];
            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith("#")) continue;
                let from = "",
                    to = "";
                if (trimmed.includes("=>")) [from, to] = trimmed.split("=>");
                else if (trimmed.includes("→")) [from, to] = trimmed.split("→");
                else if (trimmed.includes("::")) [from, to] = trimmed.split("::");
                else {
                    if (!trimmed.includes("=")) continue;
                    [from, to] = trimmed.split("=");
                }
                ((from = String(from ?? "").trim()),
                    (to = String(to ?? "").trim()),
                    from && rules.push({ from: from, to: to }));
            }
            return rules;
        }
        function updateBatchReplacePreview() {
            const rules = parseBatchReplaceRules(),
                caseSensitive = $("#novel_batch_replace_case_sensitive").prop("checked");
            if (!rules.length) return void $("#novel_batch_replace_stats").html("请输入批量替换规则");
            let workingText = novelText,
                totalFound = 0;
            for (const rule of rules) {
                const re = new RegExp(escapeRegExp(rule.from), caseSensitive ? "g" : "gi");
                ((totalFound += (workingText.match(re) || []).length),
                    (workingText = workingText.replace(re, () => rule.to)));
            }
            $("#novel_batch_replace_stats").html(
                `\n                规则数：${rules.length.toLocaleString()}<br>\n                预计命中：${totalFound.toLocaleString()} 处<br>\n                模式：${caseSensitive ? "区分大小写" : "不区分大小写"}\n            `
            );
        }
        function applyBatchReplace() {
            const rules = parseBatchReplaceRules(),
                caseSensitive = $("#novel_batch_replace_case_sensitive").prop("checked");
            if (!rules.length) return void novelToast("error", "请先填写批量替换规则");
            let workingText = novelText,
                totalCount = 0;
            for (const rule of rules) {
                const re = new RegExp(escapeRegExp(rule.from), caseSensitive ? "g" : "gi");
                ((totalCount += (workingText.match(re) || []).length),
                    (workingText = workingText.replace(re, () => rule.to)));
            }
            totalCount <= 0
                ? novelToast("warning", "没有找到可替换内容")
                : confirm(`确认批量替换 ${rules.length} 条规则，共 ${totalCount} 处吗？`) &&
                  ((novelText = workingText),
                  $ui.searchKeyword?.length && $ui.searchKeyword.val(""),
                  (lastSearchKeyword = ""),
                  (chapterPreviewLimit = 10),
                  (floorPreviewLimit = 20),
                  invalidateCache(),
                  markWorldBookContentDirty(
                      "文本已批量替换，按“更新注入内容”同步到世界书条目"
                  ),
                  scheduleRefreshAll(),
                  scheduleNovelCacheSave(),
                  closeBatchReplaceModal(),
                  novelToast("success", `批量替换完成，共替换 ${totalCount} 处`));
        }
        function ensureBatchReplaceModal() {
            if ($("#novel_batch_replace_modal").length) return $("#novel_batch_replace_modal");
            $("body").append(
                '\n                <div id="novel_batch_replace_modal" class="novel_modal_overlay">\n                    <div class="novel_modal novel_modal_large">\n                        <div class="novel_modal_header">\n                            <b>批量替换</b>\n                            <button id="novel_batch_replace_close" class="menu_button novel_modal_close" type="button">×</button>\n                        </div>\n        \n                        <div class="novel_modal_body">\n                            <label>规则格式：每行一条，支持 <code>旧词 => 新词</code></label>\n                            <textarea\n                                id="novel_batch_replace_rules"\n                                class="text_pole novel_replace_rules"\n                                placeholder="张三 => 李四\n老王 => 王叔"\n                            ></textarea>\n        \n                            <label class="checkbox_label">\n                                <input type="checkbox" id="novel_batch_replace_case_sensitive" />\n                                区分大小写\n                            </label>\n        \n                            <div id="novel_batch_replace_stats" class="novel_replace_stats">请输入批量替换规则</div>\n                        </div>\n        \n                        <div class="novel_modal_footer">\n                            <button id="novel_batch_replace_cancel" class="menu_button" type="button">取消</button>\n                            <button id="novel_batch_replace_apply" class="menu_button" type="button">确认批量替换</button>\n                        </div>\n                    </div>\n                </div>\n            '
            );
            var $modal = $("#novel_batch_replace_modal");
            $modal.hide();
            $("#novel_batch_replace_close").on("click", closeBatchReplaceModal);
            $("#novel_batch_replace_cancel").on("click", closeBatchReplaceModal);
            $modal.on("click", function (e) {
                e.target === this && closeBatchReplaceModal();
            });
            $("#novel_batch_replace_rules").on("input", updateBatchReplacePreview);
            $("#novel_batch_replace_case_sensitive").on("change", updateBatchReplacePreview);
            $("#novel_batch_replace_apply").on("click", applyBatchReplace);
            return $modal;
        }
        function openBatchReplaceModal(e) {
            e && "function" == typeof e.preventDefault && e.preventDefault();
            e && "function" == typeof e.stopPropagation && e.stopPropagation();
            if (!novelText) return void novelToast("error", "请先选择 TXT 文件");
            try {
                var $modal = ensureBatchReplaceModal();
                $("#novel_batch_replace_rules").val("");
                $("#novel_batch_replace_case_sensitive").prop("checked", !1);
                updateBatchReplacePreview();
                showNovelModal($modal);
            } catch (err) {
                console.error(`[${extensionName}] openBatchReplaceModal error`, err);
                novelToast("error", "打开批量替换窗口失败：" + (err && err.message ? err.message : err));
            }
        }
        function closeBatchReplaceModal() {
            $("#novel_batch_replace_modal").removeClass("open").hide();
        }
        function closeNovelImporterPanels() {
            (closeSingleReplaceModal(),
                closeBatchReplaceModal(),
                $("#novel_importer_inline_panel").hide(),
                $("#novel_importer_fallback_modal").hide(),
                (function () {
                    if (
                        ($("html, body").removeClass("novel_importer_panel_open"),
                        clearTimeout(_panelViewportTimer),
                        !_panelScrollLock)
                    )
                        return;
                    const doc = document.documentElement,
                        body = document.body,
                        lock = _panelScrollLock;
                    ((_panelScrollLock = null),
                        (doc.style.overflow = lock.htmlOverflow),
                        (body.style.overflow = lock.bodyOverflow),
                        (body.style.position = lock.bodyPosition),
                        (body.style.top = lock.bodyTop),
                        (body.style.left = lock.bodyLeft),
                        (body.style.right = lock.bodyRight),
                        (body.style.width = lock.bodyWidth));
                })());
            const $container = $("#novel_importer_container"),
                $host = $("#novel_importer_host");
            ($container.length && $host.length && $host.append($container),
                (_inputHasFocus = !1),
                (_pendingRefreshAfterInput = !1));
        }
        async function performImport() {
            const context = getContext();
            if (!novelText) return void novelToast("error", "请先选择 TXT 文件");
            const chunks = (function (workingText) {
                const rangeMode = getImportRangeMode();
                if (!workingText || !workingText.trim()) return [];
                const allChunks = getCachedChunks(workingText),
                    oneChapterMode = !!$ui.oneChapter?.prop?.("checked");
                if ("all" === rangeMode && !oneChapterMode) return allChunks;
                if ("chapter" === rangeMode || oneChapterMode) {
                    const chapters = getCachedChapters(workingText);
                    if (!chapters.length) return allChunks;
                    const { start: start, end: end } = getChapterRangeValues(
                        "novel_import_chapter",
                        chapters
                    );
                    const selectedChapters = chapters
                        .map((ch, index) => ({ chapter: ch, index: index }))
                        .filter((item) => {
                            const chapterNumber = getChapterNumber(item.chapter, item.index);
                            return (
                                chapterNumber >= start &&
                                chapterNumber <= end &&
                                !shouldExcludeChapter(item.chapter, item.index)
                            );
                        });
                    return oneChapterMode
                        ? selectedChapters.map((item) => {
                              var title = getChapterDisplayTitle(item.chapter, item.index);
                              return { title: title, content: `${title}\n\n${item.chapter.content}` };
                          })
                        : buildChunksForText(
                              selectedChapters
                                  .map((item) => `${getChapterDisplayTitle(item.chapter, item.index)}\n\n${item.chapter.content}`)
                                  .join("\n\n")
                          );
                }
                if ("floor" === rangeMode) {
                    if (!allChunks.length) return [];
                    const { start: start, end: end } = getRangeValues("novel_import_floor", allChunks.length);
                    return allChunks.filter((_, i) => i + 1 >= start && i + 1 <= end);
                }
                return allChunks;
            })(getWorkingTextForImport());
            if (!chunks.length) return void novelToast("error", "没有可导入的内容");
            const { startRole: startRole, alternate: alternate } = (function () {
                const mode = $ui.roleMode.val() || "assistant";
                return "alternate_ai" === mode
                    ? { startRole: "assistant", alternate: !0 }
                    : "alternate_user" === mode
                      ? { startRole: "user", alternate: !0 }
                      : "user" === mode
                        ? { startRole: "user", alternate: !1 }
                        : { startRole: "assistant", alternate: !1 };
            })();
            let roleLabel = "";
            if (
                ((roleLabel = alternate
                    ? "轮流导入，起始角色：" + ("user" === startRole ? "用户" : "AI")
                    : "user" === startRole
                      ? "用户消息"
                      : "AI消息"),
                !confirm(
                    `即将导入 ${chunks.length} 楼内容到当前聊天。\n\n导入模式：${roleLabel}\n是否继续？`
                ))
            )
                return;
            (Array.isArray(context.chat) || (context.chat = []),
                $ui.importBtn.prop("disabled", !0).text("正在导入..."),
                $ui.importProgress.text(`正在准备导入：${chunks.length} 楼`));
            const messages = chunks.map((chunk, index) => {
                let isUser = "user" === startRole;
                return (
                    alternate && (isUser = index % 2 == 0 ? isUser : !isUser),
                    {
                        name: isUser ? context.name1 || "User" : context.name2 || "Assistant",
                        is_user: isUser,
                        is_system: !1,
                        mes: chunk.content,
                        send_date: new Date().toLocaleString(),
                        extra: {}
                    }
                );
            });
            try {
                $ui.importProgress.text(`正在导入：0 / ${messages.length}`);
                for (let i = 0; i < messages.length; i++)
                    (context.chat.push(messages[i]),
                        (i % 25 != 0 && i !== messages.length - 1) ||
                            ($ui.importProgress.text(`正在导入：${i + 1} / ${messages.length}`),
                            await sleep(0)));
                ($ui.importProgress.text("正在保存聊天..."),
                    await context.saveChat(),
                    "function" == typeof context.reloadCurrentChat
                        ? await context.reloadCurrentChat()
                        : "function" == typeof context.reloadChat && (await context.reloadChat()),
                    $ui.importProgress.text(`导入完成：${messages.length} 楼`),
                    novelToast("success", `成功导入 ${messages.length} 楼内容`));
            } catch (error) {
                (console.error(`[${extensionName}] Import failed`, error),
                    novelToast("error", "导入失败，请打开控制台查看错误"));
            } finally {
                $ui.importBtn.prop("disabled", !1).text("导入小说到聊天");
            }
        }

        function getHostDocument() {
            try {
                if (window.parent && window.parent.document) return window.parent.document;
            } catch (e) {}
            try {
                if (window.top && window.top.document) return window.top.document;
            } catch (e2) {}
            return document;
        }
        function getHostWindow() {
            try {
                if (window.parent && window.parent.document) return window.parent;
            } catch (e) {}
            try {
                if (window.top && window.top.document) return window.top;
            } catch (e2) {}
            return window;
        }
        function getHostJQuery() {
            var hostWin = getHostWindow();
            return (hostWin && (hostWin.jQuery || hostWin.$)) || window.jQuery || window.$;
        }
        function getActivePlotRange(chapters) {
            chapters = Array.isArray(chapters) ? chapters : getCachedChapters(novelText || "");
            if (!chapters.length) return null;
            if (worldBookConfig.autoAdvanceEnabled) return getWorldBookAutoAdvanceRange(chapters);
            if (worldBookConfig.useChapterRange) {
                var range = normalizeWorldBookRange(worldBookConfig, chapters, !1);
                return {
                    start: range.start,
                    end: range.end,
                    count: Math.max(1, range.end - range.start + 1),
                    total: getChapterNumberBounds(chapters).max,
                    min: getChapterNumberBounds(chapters).min
                };
            }
            var items = getWorldBookSelectedItems(chapters, worldBookConfig);
            if (!items.length) {
                var bounds = getChapterNumberBounds(chapters);
                var start = parseChapterNumberValue(worldBookConfig.autoAdvanceCurrentStart, bounds.min || 1, 0);
                var count = Math.max(1, Number(worldBookConfig.autoAdvanceChapterCount) || 5);
                var end = Math.min(bounds.max, start + count - 1);
                return { start: start, end: end, count: count, total: bounds.max, min: bounds.min };
            }
            var numbers = items.map(function (item) {
                return getChapterNumber(item.chapter, item.index);
            });
            var minN = Math.min.apply(null, numbers);
            var maxN = Math.max.apply(null, numbers);
            var bounds2 = getChapterNumberBounds(chapters);
            return {
                start: minN,
                end: maxN,
                count: Math.max(1, maxN - minN + 1),
                total: bounds2.max,
                min: bounds2.min
            };
        }
        function getNovelDisplayName() {
            var name = novelFileName || worldBookConfig.novelName || "";
            name = String(name || "").trim();
            if (!name) return "";
            name = name.replace(/^.*[\\\/]/, "").replace(/\.txt$/i, "");
            return name;
        }
        function describeActivePlotRange() {
            var words = getPlotUnitWords();
            if (novelText) {
                var chapters = getCachedChapters(novelText);
                if (chapters.length) {
                    var range = getActivePlotRange(chapters);
                    if (range) return formatPlotRangeText(range) + " / 共 " + range.total + " " + words.one;
                }
            }
            if (worldBookConfig.useChapterRange || worldBookConfig.worldBookEntryUid != null) {
                var s = Number(worldBookConfig.chapterRangeStart);
                var e = Number(worldBookConfig.chapterRangeEnd);
                if (Number.isFinite(s) && Number.isFinite(e) && e >= s)
                    return s + (e !== s ? "-" + e : "") + words.one + "（待加载 TXT）";
            }
            return "尚未加载小说 TXT";
        }
        function describeActivePlotMeta() {
            var name = getNovelDisplayName();
            if (name) return name.replace(/\s*作者\s*[：:]\s*/, "· ");
            if (!novelText) return worldBookConfig.worldBookEntryUid != null ? "已从世界书恢复" : "";
            return "";
        }
        function setActivePlotWindow(start, countOrEnd, chapters, asEnd) {
            chapters = Array.isArray(chapters) ? chapters : getCachedChapters(novelText || "");
            if (!chapters.length) return null;
            var bounds = getChapterNumberBounds(chapters);
            start = parseChapterNumberValue(start, bounds.min || 1, 0);
            start = Math.min(Math.max(start, bounds.min), bounds.max);
            var end, count;
            if (asEnd) {
                end = parseChapterNumberValue(countOrEnd, start, 0);
                end = Math.min(Math.max(end, start), bounds.max);
                count = Math.max(1, end - start + 1);
            } else {
                count = Math.max(1, Number(countOrEnd) || Number(worldBookConfig.autoAdvanceChapterCount) || 5);
                end = Math.min(bounds.max, start + count - 1);
            }
            worldBookConfig.useChapterRange = !0;
            worldBookConfig.chapterRangeStart = start;
            worldBookConfig.chapterRangeEnd = end;
            worldBookConfig.autoAdvanceChapterCount = count;
            worldBookConfig.autoAdvanceCurrentStart = start;
            worldBookConfig.autoAdvanceStartChapter = start;
            worldBookConfig.selectedChapterIndices = getChapterItemsByNumberRange(chapters, start, end).map(
                function (item) {
                    return item.index;
                }
            );
            try {
                $("#novel_wb_use_range").prop("checked", !0);
                $("#novel_wb_range_start").val(start);
                $("#novel_wb_range_end").val(end);
                $("#novel_wb_auto_start").val(start);
                $("#novel_wb_auto_chapter_count").val(count);
            } catch (e) {}
            return { start: start, end: end, count: count, total: bounds.max, min: bounds.min };
        }
        function snapshotPlotRangeState() {
            return {
                start: worldBookConfig.chapterRangeStart,
                end: worldBookConfig.chapterRangeEnd,
                count: worldBookConfig.autoAdvanceChapterCount,
                currentStart: worldBookConfig.autoAdvanceCurrentStart,
                selected: Array.isArray(worldBookConfig.selectedChapterIndices)
                    ? worldBookConfig.selectedChapterIndices.slice()
                    : null
            };
        }
        function restorePlotRangeState(state) {
            if (!state) return;
            if (state.start != null) worldBookConfig.chapterRangeStart = state.start;
            if (state.end != null) worldBookConfig.chapterRangeEnd = state.end;
            if (state.count != null) worldBookConfig.autoAdvanceChapterCount = state.count;
            if (state.currentStart != null) worldBookConfig.autoAdvanceCurrentStart = state.currentStart;
            if (state.selected) worldBookConfig.selectedChapterIndices = state.selected.slice();
            try { saveWorldBookConfig(); } catch (e) {}
        }
        async function commitPlotRangeToWorldBook(range, toastPrefix) {
            if (!(await ensureNovelTextForPlotAction())) return !1;
            if (!range) {
                novelToast("error", "没有可注入的章节范围");
                return !1;
            }
            var content = buildCurrentNovelWorldBookContent();
            if (!content.trim()) {
                novelToast("error", "当前范围没有可注入内容");
                return !1;
            }
            var worldName = worldBookConfig.worldBookName || getCurrentCharacterWorldBookName();
            if (!worldName) {
                novelToast("error", "当前角色/聊天没有绑定世界书");
                return !1;
            }
            // 强制取最新世界书：翻页前要判断条目是否被人在世界书面板里手动改过，
            // 用 2 分钟内存缓存会漏掉手改、把用户内容冲掉
            var data = await loadNovelWorldBookData(worldName, !0);
            if (!data) {
                novelToast(
                    "error",
                    "世界书「" + worldName + "」不存在或读取失败，请在角色卡/聊天绑定里重新选择世界书"
                );
                return !1;
            }
            if (!data.entries) data.entries = {};
            normalizeWorldBookEntries(data);
            var entry = findNovelWorldBookEntry(data);
            // 翻页会整段重写条目正文；如果条目在上次写入后被手动改过，先让用户确认，别静默吃掉手改内容
            if (entry) {
                var prevMeta = (entry.extensions && entry.extensions.novelChatImporter) || {};
                var storedHash = prevMeta.contentHash || worldBookConfig.lastSyncedHash || "";
                var externalChanged =
                    !!storedHash && hashNovelWorldBookContent(entry.content || "") !== storedHash;
                if (externalChanged) {
                    var proceed =
                        typeof confirm !== "function" ||
                        confirm(
                            "检测到注入条目被手动修改过。\n继续翻页会用当前设置覆盖它，确定继续吗？\n（想保留手改内容请点取消）"
                        );
                    if (!proceed) {
                        // 回滚刚才在内存里改过的章节窗口，保持面板与世界书一致
                        if (prevMeta.chapterRangeStart != null)
                            worldBookConfig.chapterRangeStart = Number(prevMeta.chapterRangeStart) || worldBookConfig.chapterRangeStart;
                        if (prevMeta.chapterRangeEnd != null)
                            worldBookConfig.chapterRangeEnd = Number(prevMeta.chapterRangeEnd) || worldBookConfig.chapterRangeEnd;
                        if (prevMeta.autoAdvanceCurrentStart != null)
                            worldBookConfig.autoAdvanceCurrentStart =
                                Number(prevMeta.autoAdvanceCurrentStart) || worldBookConfig.autoAdvanceCurrentStart;
                        saveWorldBookConfig();
                        novelToast("info", "已取消，条目保留手动修改的内容");
                        return !1;
                    }
                }
            }
            if (entry) applyNovelWorldBookEntrySettings(entry, content);
            else entry = createNovelWorldBookEntry(data, content);
            worldBookConfig.worldBookName = worldName;
            worldBookConfig.worldBookEntryUid = getWorldBookEntryId(entry);
            worldBookConfig.persistent = !0;
            worldBookConfig.onceArmed = !1;
            worldBookConfig.lastSyncedHash = hashNovelWorldBookContent(content);
            if (worldBookConfig.autoAdvanceEnabled) {
                var current = getCurrentChatFloorCount();
                var floorCount = Math.max(1, Number(worldBookConfig.autoAdvanceFloorCount) || 10);
                worldBookConfig.autoAdvanceBaseChatLength = current;
                worldBookConfig.autoAdvanceTargetChatLength = current + floorCount;
            }
            await saveNovelWorldBookData(worldName, data);
            saveWorldBookConfig();
            worldBookContentDirty = !1;
            registerWorldBookEvents();
            updateWorldBookAutoAdvanceStatus();
            try {
                renderWorldBookChapterList();
            } catch (e) {}
            setWorldBookEntryStatus(
                "快捷栏已更新｜世界书: " + worldName + "｜条目 UID: " + worldBookConfig.worldBookEntryUid,
                !1,
                "persistent"
            );
            novelToast("success", (toastPrefix || "剧情已更新至 ") + formatWorldBookChapterRange(range));
            refreshNovelPlotControlBar();
            return !0;
        }
        // 剧情栏操作前确保正文在：启动时的自动恢复可能因为聊天/世界书还没就绪而错过，
        // 这里按世界书记录的书名再试一次；缓存里确实没有，才提示用户重新选一次文件。
        async function ensureNovelTextForPlotAction(silent) {
            if (novelText) return !0;
            var name = worldBookConfig.novelName || novelFileName || "";
            if (name) {
                try {
                    if (await autoRestoreNovelTextFromCache(name)) return !0;
                } catch (e) {}
            }
            if (!silent) {
                novelToast(
                    "error",
                    "当前页面没有小说正文：请在「导入面板」重新选一次同一本 TXT，选过之后下次会自动恢复"
                );
                try {
                    openNovelImporter();
                } catch (e2) {}
            }
            return !1;
        }
        async function stepNovelPlotWindow(direction) {
            if (plotControlStepBusy) return;
            var previousRange = null;
            try {
                plotControlStepBusy = !0;
                if (!(await ensureNovelTextForPlotAction())) return;
                var chapters = getCachedChapters(novelText);
                if (!chapters.length) return void novelToast("error", "未解析到章节");
                var current = getActivePlotRange(chapters);
                if (!current) return void novelToast("error", "当前没有可用章节范围");
                var step = Math.max(1, Number(current.count) || Number(worldBookConfig.autoAdvanceChapterCount) || 5);
                try {
                    var stepDoc = getHostDocument();
                    var stepEl = stepDoc && stepDoc.getElementById("novel_plot_step");
                    var stepVal = stepEl ? Number(stepEl.value) : NaN;
                    if (Number.isFinite(stepVal) && stepVal >= 1) step = Math.floor(stepVal);
                } catch (eStep) {}
                worldBookConfig.autoAdvanceChapterCount = step;
                var nextStart =
                    direction > 0 ? current.start + step : current.start - step;
                if (direction > 0 && nextStart > current.total) {
                    novelToast("info", "已经到最后一批章节了");
                    return;
                }
                if (direction < 0 && nextStart < current.min) {
                    if (current.start <= current.min) {
                        novelToast("info", "已经到第一批章节了");
                        return;
                    }
                    nextStart = current.min;
                }
                previousRange = snapshotPlotRangeState();
                var next = setActivePlotWindow(nextStart, step, chapters);
                var committed = await commitPlotRangeToWorldBook(
                    next,
                    direction > 0 ? "已切换到下一批 " : "已切换到上一批 "
                );
                if (!committed) restorePlotRangeState(previousRange);
            } catch (error) {
                restorePlotRangeState(previousRange);
                console.error("[" + extensionName + "] plot step failed", error);
                var detail = error && error.message ? String(error.message).slice(0, 120) : "";
                novelToast(
                    "error",
                    "切换章节失败" + (detail ? "：" + detail : "，请查看控制台")
                );
            } finally {
                plotControlStepBusy = !1;
                refreshNovelPlotControlBar();
            }
        }
        function getDefaultPlotControlState() {
            return {
                // enabled 是全局偏好：设置里开一次，所有角色卡都显示
                enabled: !1,
                collapsed: !0
            };
        }
        function getPlotCharacterKey() {
            try {
                var ctx = getContext();
                var character = null;
                try {
                    character =
                        ctx.characters && void 0 !== ctx.characterId && ctx.characterId !== null
                            ? ctx.characters[ctx.characterId]
                            : null;
                } catch (e0) {}
                if (character) {
                    if (character.avatar) return "av:" + String(character.avatar);
                    var nm =
                        (character.data && (character.data.name || character.data.nickname)) ||
                        character.name ||
                        character.nickname ||
                        "";
                    if (nm) return "nm:" + String(nm);
                    if (void 0 !== ctx.characterId && ctx.characterId !== null) return "id:" + String(ctx.characterId);
                }
                if (void 0 !== ctx.characterId && ctx.characterId !== null) return "id:" + String(ctx.characterId);
            } catch (e) {}
            return "";
        }
        function getPlotChatKey() {
            try {
                var ctx = getContext();
                var id = "";
                if (ctx && "function" == typeof ctx.getCurrentChatId) id = ctx.getCurrentChatId() || "";
                if (!id && ctx) id = ctx.chatId || "";
                return String(id || "");
            } catch (e) {
                return "";
            }
        }
        function isWelcomeOrAssistantContext() {
            try {
                var ctx = getContext();
                if (ctx.characterId === undefined || ctx.characterId === null || ctx.characterId === "") return !0;
                if (!ctx.characters || !ctx.characters[ctx.characterId]) return !0;
                var ch = ctx.characters[ctx.characterId];
                var nm = (ch && (ch.name || (ch.data && ch.data.name))) || ctx.name2 || "";
                if (String(nm).trim() === "Assistant") return !0;
                try {
                    var hostWin = getHostWindow();
                    if (hostWin && typeof hostWin.getPermanentAssistantAvatar === "function" && ch && ch.avatar) {
                        if (ch.avatar === hostWin.getPermanentAssistantAvatar()) return !0;
                    }
                } catch (e2) {}
                return !1;
            } catch (e) {
                return !1;
            }
        }
        function writePlotBarEnabledLocal(enabled) {
            try {
                if (typeof localStorage !== "undefined")
                    localStorage.setItem(PLOT_BAR_ENABLED_LS_KEY, enabled ? "1" : "0");
            } catch (eLs) {}
        }
        function readPlotBarEnabledLocal() {
            try {
                if (typeof localStorage === "undefined") return null;
                var v = localStorage.getItem(PLOT_BAR_ENABLED_LS_KEY);
                if (v === "1") return !0;
                if (v === "0") return !1;
            } catch (eLs) {}
            return null;
        }
        function savePlotControlBarSettings(immediate) {
            try {
                // 未 hydrate 前禁止把默认 false 写进 extension_settings（刷新掉开关的主因）
                if (!plotControlSettingsHydrated && !immediate) return;
                var ctx = getContext(),
                    extSettings = getExtensionSettingsRoot();
                var bag = extSettings.novelChatImporter_worldBook || {};
                // 全局显示偏好（所有角色共用）
                bag.plotControl = {
                    enabled: !!plotControlBarEnabled,
                    collapsed: !!plotControlBarCollapsed
                };
                bag.plotBarEnabled = !!plotControlBarEnabled;
                writePlotBarEnabledLocal(!!plotControlBarEnabled);
                // 仍写一份角色侧缓存，仅作加速；权威数据在世界书
                var key = getPlotCharacterKey();
                bag.plotControlByChar = bag.plotControlByChar || {};
                if (key) {
                    bag.plotControlByChar[key] = {
                        pinnedChapterNumbers: Array.isArray(plotPinnedChapterNumbers) ? plotPinnedChapterNumbers.slice() : [],
                        pinnedEntryUid: plotPinnedEntryUid != null ? plotPinnedEntryUid : null,
                        pinnedEnabled: !!plotPinnedEnabled,
                        // 展开态仅会话内记忆，不落盘——避免移动端 details 与持久化互相打架闪烁
                        pinnedMode: plotPinnedMode === "single" ? "single" : "range",
                        pinnedInsertPosition: plotPinnedInsertPosition || "before_char_def",
                        pinnedDepth: Math.max(1, Number(plotPinnedDepth) || 5),
                        pinnedOrder: Math.max(0, Number(plotPinnedOrder) || 100)
                    };
                    bag.plotControlCharKey = key;
                    plotControlActiveCharKey = key;
                    // 内存会话：保留 TXT，避免同会话内切走再回来丢书
                    plotCharSession[key] = {
                        novelText: novelText || "",
                        novelFileName: novelFileName || worldBookConfig.novelName || "",
                        worldBookConfig: {
                            selectedChapterIndices: Array.isArray(worldBookConfig.selectedChapterIndices)
                                ? worldBookConfig.selectedChapterIndices.slice()
                                : [],
                            useChapterRange: !!worldBookConfig.useChapterRange,
                            chapterRangeStart: worldBookConfig.chapterRangeStart,
                            chapterRangeEnd: worldBookConfig.chapterRangeEnd,
                            autoAdvanceEnabled: !!worldBookConfig.autoAdvanceEnabled,
                            autoAdvanceChapterCount: Math.max(1, Number(worldBookConfig.autoAdvanceChapterCount) || 5),
                            autoAdvanceCurrentStart: worldBookConfig.autoAdvanceCurrentStart,
                            autoAdvanceStartChapter: worldBookConfig.autoAdvanceStartChapter,
                            worldBookName: worldBookConfig.worldBookName || "",
                            worldBookEntryUid: worldBookConfig.worldBookEntryUid,
                            persistent: !!worldBookConfig.persistent,
                            onceArmed: !!worldBookConfig.onceArmed
                        }
                    };
                }
                extSettings.novelChatImporter_worldBook = bag;
                if (plotControlSettingsSaveTimer) {
                    clearTimeout(plotControlSettingsSaveTimer);
                    plotControlSettingsSaveTimer = null;
                }
                var flush = function (hard) {
                    plotControlSettingsSaveTimer = null;
                    try {
                        // 双重保险：localStorage 已先写；再尽量把 ST settings 落盘
                        if (hard) {
                            if ("function" == typeof ctx.saveSettings) ctx.saveSettings();
                            else if ("function" == typeof ctx.saveSettingsDebounced) ctx.saveSettingsDebounced();
                        } else {
                            if ("function" == typeof ctx.saveSettingsDebounced) ctx.saveSettingsDebounced();
                            else if ("function" == typeof ctx.saveSettings) ctx.saveSettings();
                        }
                    } catch (eFlush) {}
                };
                // immediate：立刻写盘；非 immediate 也尽快 debounce，避免刷新丢
                if (immediate) flush(!0);
                else plotControlSettingsSaveTimer = setTimeout(function () { flush(!0); }, 120);
            } catch (e) {}
        }
        function loadPlotControlBarSettings() {
            try {
                var extSettings = getExtensionSettingsRoot();
                var bag = extSettings.novelChatImporter_worldBook || {};
                var conf = bag.plotControl && typeof bag.plotControl === "object" ? bag.plotControl : getDefaultPlotControlState();
                var enabled = !1;
                // localStorage 同步写入、刷新必在；ST bag 可能被启动 race 用默认 false 污染
                var lsEnabled = readPlotBarEnabledLocal();
                if (lsEnabled !== null) {
                    enabled = !!lsEnabled;
                } else if (conf && "enabled" in conf) {
                    enabled = !!conf.enabled;
                } else if ("plotBarEnabled" in bag) {
                    enabled = !!bag.plotBarEnabled;
                }
                plotControlBarEnabled = enabled;
                plotControlBarCollapsed = conf && "collapsed" in conf ? !!conf.collapsed : !0;
                if (worldBookConfig.novelName && !novelFileName) novelFileName = worldBookConfig.novelName;
                plotControlActiveCharKey = getPlotCharacterKey() || "";
                plotControlSettingsHydrated = !0;
                // 把读到的真实值立刻回写，修复被默认 false 污染过的 bag
                try {
                    bag.plotControl = bag.plotControl && typeof bag.plotControl === "object" ? bag.plotControl : {};
                    bag.plotControl.enabled = !!plotControlBarEnabled;
                    bag.plotControl.collapsed = !!plotControlBarCollapsed;
                    bag.plotBarEnabled = !!plotControlBarEnabled;
                    extSettings.novelChatImporter_worldBook = bag;
                    writePlotBarEnabledLocal(!!plotControlBarEnabled);
                } catch (eSync) {}
            } catch (e) {
                plotControlSettingsHydrated = !0;
            }
        }
        function resetPlotCharacterRuntimeSoft() {
            // 切角色时不要清全局 enabled；只重置「当前角色运行时」的注入/钉住字段
            plotPinnedChapterNumbers = [];
            plotPinnedEntryUid = null;
            plotPinnedEnabled = !1;
            plotPinnedMode = "range";
            plotPinnedInsertPosition = "before_char_def";
            plotPinnedDepth = 5;
            plotPinnedOrder = 100;
            try {
                worldBookConfig.worldBookEntryUid = null;
                worldBookConfig.worldBookName = "";
                worldBookConfig.onceArmed = !1;
                worldBookConfig.useChapterRange = !1;
                worldBookConfig.selectedChapterIndices = [];
                worldBookConfig.chapterRangeStart = 1;
                worldBookConfig.chapterRangeEnd = 5;
                worldBookConfig.autoAdvanceCurrentStart = 1;
                worldBookConfig.autoAdvanceChapterCount = 5;
                worldBookConfig.autoAdvanceStartChapter = 1;
            } catch (e) {}
        }
        function parseChapterNumberFromTitleText(title) {
            var text = String(title || "").trim().replace(CHAPTER_LEADING_STRIP_RE, "");
            if (!text) return null;
            var m = null;
            for (var li = 0; li < CHAPTER_LOOSE_NUM_RES.length; li++)
                if ((m = text.match(CHAPTER_LOOSE_NUM_RES[li]))) break;
            if (!m) return null;
            var raw = normalizeFullWidthDigits(m[1]);
            if (/^[0-9]+$/.test(raw)) return Number(raw);
            try {
                var map = { "零":0,"〇":0,"一":1,"二":2,"两":2,"三":3,"四":4,"五":5,"六":6,"七":7,"八":8,"九":9,"十":10,"百":100,"千":1000,"万":10000 };
                var n = 0, unit = 1, num = 0;
                for (var i = raw.length - 1; i >= 0; i--) {
                    var v = map[raw[i]];
                    if (v == null) continue;
                    if (v >= 10) {
                        if (v > unit) unit = v;
                        else unit *= v;
                        if (num === 0) num = 1;
                        n += num * unit;
                        num = 0;
                    } else num = v;
                }
                n += num;
                return n > 0 ? n : null;
            } catch (e) {
                return null;
            }
        }
        function inferRangeFromWorldBookContent(content) {
            content = String(content || "");
            if (!content.trim()) return null;
            var titles = [];
            var re = /\[World Info:\s*([^\]]+)\]/g;
            var m;
            while ((m = re.exec(content))) titles.push(String(m[1] || "").trim());
            if (!titles.length) {
                var re2 = /(?:^|\n)\s*(第\s*[0-9一二三四五六七八九十百千万零〇两]+\s*[章节回卷部集][^\n]{0,40})/g;
                while ((m = re2.exec(content))) titles.push(String(m[1] || "").trim());
            }
            if (!titles.length) return null;
            var nums = [];
            for (var i = 0; i < titles.length; i++) {
                var n = parseChapterNumberFromTitleText(titles[i]);
                if (Number.isFinite(n) && n > 0) nums.push(n);
            }
            if (nums.length) {
                var start = Math.min.apply(null, nums);
                var end = Math.max.apply(null, nums);
                return { start: start, end: end, count: Math.max(1, end - start + 1), blockCount: titles.length };
            }
            return { start: null, end: null, count: titles.length, blockCount: titles.length };
        }
        function applyMainEntryMetaToConfig(entry, worldName) {
            if (!entry) return;
            var meta = (entry.extensions && entry.extensions.novelChatImporter) || {};
            worldBookConfig.worldBookName = worldName || worldBookConfig.worldBookName || "";
            worldBookConfig.worldBookEntryUid = getWorldBookEntryId(entry);
            if ("autoAdvance" in meta) worldBookConfig.autoAdvanceEnabled = !!meta.autoAdvance;
            if ("persistent" in meta) worldBookConfig.persistent = !!meta.persistent;
            if (meta.novelName) {
                worldBookConfig.novelName = String(meta.novelName);
                if (!novelFileName) novelFileName = worldBookConfig.novelName;
            }

            var hasMetaStart = meta.chapterRangeStart != null || meta.autoAdvanceCurrentStart != null;
            var hasMetaEnd = meta.chapterRangeEnd != null;
            var hasMetaCount = meta.autoAdvanceChapterCount != null;
            var start = null, end = null, count = null;

            if (hasMetaStart)
                start = parseChapterNumberValue(
                    meta.chapterRangeStart != null ? meta.chapterRangeStart : meta.autoAdvanceCurrentStart,
                    1,
                    0
                );
            if (hasMetaEnd) end = parseChapterNumberValue(meta.chapterRangeEnd, start || 1, 0);
            if (hasMetaCount) count = Math.max(1, Number(meta.autoAdvanceChapterCount) || 5);

            // 已导入完整元数据：直接用世界书里的起止
            var hasFullMeta = hasMetaStart && (hasMetaEnd || hasMetaCount);
            if (hasFullMeta) {
                if (start == null || !Number.isFinite(start) || start < 1) start = 1;
                if (end == null || !Number.isFinite(end)) end = count ? start + count - 1 : start + 4;
                if (end < start) end = start;
                count = Math.max(1, end - start + 1);
            } else {
                var inferred = inferRangeFromWorldBookContent(entry.content);
                if (start == null && inferred && inferred.start != null) start = inferred.start;
                // 正文块数合理（<=50）时，用实际注入跨度作为已导入窗口
                if (
                    inferred &&
                    inferred.start != null &&
                    inferred.end != null &&
                    inferred.blockCount > 0 &&
                    inferred.blockCount <= 50 &&
                    inferred.end - inferred.start + 1 <= 50
                ) {
                    start = inferred.start;
                    end = inferred.end;
                    count = Math.max(1, end - start + 1);
                } else {
                    if (start == null) start = 1;
                    count = 5;
                    end = start + count - 1;
                }
            }

            if (start == null || !Number.isFinite(start) || start < 1) start = 1;
            if (count == null || !Number.isFinite(count) || count < 1) count = 5;
            if (end == null || !Number.isFinite(end) || end < start) end = start + count - 1;
            count = Math.max(1, end - start + 1);

            worldBookConfig.useChapterRange = !0;
            worldBookConfig.chapterRangeStart = start;
            worldBookConfig.chapterRangeEnd = end;
            worldBookConfig.autoAdvanceCurrentStart = start;
            worldBookConfig.autoAdvanceStartChapter = start;
            worldBookConfig.autoAdvanceChapterCount = count;
            worldBookConfig.selectedChapterIndices = [];
        }
        function applyPinnedEntryMetaToState(entry) {
            if (!entry) {
                plotPinnedChapterNumbers = [];
                plotPinnedEntryUid = null;
                plotPinnedEnabled = !1;
                return;
            }
            var meta = (entry.extensions && entry.extensions.novelChatImporter) || {};
            plotPinnedEntryUid = getWorldBookEntryId(entry);
            plotPinnedChapterNumbers = Array.isArray(meta.pinnedChapters)
                ? meta.pinnedChapters.map(function (n) { return Number(n); }).filter(Number.isFinite)
                : [];
            if ("pinnedEnabled" in meta) plotPinnedEnabled = !!meta.pinnedEnabled;
            else plotPinnedEnabled = !entry.disable;
            if (meta.insertPosition) plotPinnedInsertPosition = meta.insertPosition;
            if (meta.depth != null) plotPinnedDepth = Math.max(1, Number(meta.depth) || 5);
            if (meta.order != null) plotPinnedOrder = Math.max(0, Number(meta.order) || 100);
            // 不在 hydrate 时强行展开钉住管理——移动端 details 被反复 open/close 会闪
        }
        async function hydratePlotStateFromWorldBook(opts) {
            opts = opts || {};
            try {
                var worldName = getCurrentCharacterWorldBookName();
                if (!worldName) {
                    if (!opts.silent) {
                        // 没绑定世界书：栏仍可按全局开关显示，但提示无数据
                        resetPlotCharacterRuntimeSoft();
                    }
                    return !1;
                }
                var data = await loadNovelWorldBookData(worldName);
                if (!data || !data.entries) {
                    resetPlotCharacterRuntimeSoft();
                    worldBookConfig.worldBookName = worldName;
                    return !1;
                }
                normalizeWorldBookEntries(data);
                // 临时清空 uid，强制按标记扫描本角色世界书
                var prevUid = worldBookConfig.worldBookEntryUid;
                worldBookConfig.worldBookEntryUid = null;
                var mainEntry = findNovelWorldBookEntry(data);
                var pinnedEntry = findNovelPinnedEntry(data);
                if (mainEntry) applyMainEntryMetaToConfig(mainEntry, worldName);
                else {
                    worldBookConfig.worldBookEntryUid = null;
                    worldBookConfig.worldBookName = worldName;
                }
                applyPinnedEntryMetaToState(pinnedEntry);
                // 同会话内存 TXT 优先恢复（刷新页面后没有）
                var key = getPlotCharacterKey();
                if (key && plotCharSession[key] && plotCharSession[key].novelText) {
                    novelText = plotCharSession[key].novelText;
                    if (plotCharSession[key].novelFileName) {
                        novelFileName = plotCharSession[key].novelFileName;
                        worldBookConfig.novelName = novelFileName;
                    }
                }
                // 重启/刷新后正文已不在内存：按这个角色条目里记录的书名，从 IndexedDB 缓存找回
                var metaNovelName =
                    (mainEntry &&
                        mainEntry.extensions &&
                        mainEntry.extensions.novelChatImporter &&
                        mainEntry.extensions.novelChatImporter.novelName) ||
                    "";
                if (!novelText && metaNovelName) await autoRestoreNovelTextFromCache(metaNovelName);
                // 包裹文字改过但条目还没跟上，且条目没被手改过 → 静默套用新包裹
                if (
                    (mainEntry && shouldResyncEntryWrapper(mainEntry)) ||
                    (pinnedEntry && shouldResyncEntryWrapper(pinnedEntry))
                )
                    resyncEntryWrapper(!0);
                return !!(mainEntry || pinnedEntry);
            } catch (e) {
                console.error("[" + extensionName + "] hydratePlotStateFromWorldBook failed", e);
                return !1;
            } finally {
                try {
                    refreshNovelPlotControlBar();
                } catch (e2) {}
            }
        }
        // 启动/切角色时聊天与世界书可能还没就绪，第一次 hydrate 会扑空；
        // 正文为空就按退避重试几次，避免「重进酒馆必须手动重新导入」
        function schedulePlotHydrateRetry() {
            try {
                if (plotHydrateRetryTimer) {
                    clearTimeout(plotHydrateRetryTimer);
                    plotHydrateRetryTimer = null;
                }
                if (novelText) {
                    plotHydrateRetryAttempts = 0;
                    return;
                }
                if (plotHydrateRetryAttempts >= 4) return;
                var delays = [1200, 2200, 4000, 6500];
                var delay = delays[Math.min(plotHydrateRetryAttempts, delays.length - 1)];
                plotHydrateRetryAttempts++;
                plotHydrateRetryTimer = setTimeout(function () {
                    plotHydrateRetryTimer = null;
                    if (novelText) {
                        plotHydrateRetryAttempts = 0;
                        return;
                    }
                    hydratePlotStateFromWorldBook({ silent: !0 }).then(function () {
                        try {
                            ensureNovelPlotControlBar();
                            refreshNovelPlotControlBar();
                        } catch (e) {}
                        if (novelText) plotHydrateRetryAttempts = 0;
                        else schedulePlotHydrateRetry();
                    });
                }, delay);
            } catch (e) {}
        }
        function switchPlotControlToCurrentCharacter(force) {
            try {
                var key = getPlotCharacterKey();
                var chatKey = getPlotChatKey();
                // 同一角色换聊天也要重新 hydrate：每个聊天可以绑定不同的世界书
                if (!force && key && key === plotControlActiveCharKey && chatKey === plotControlActiveChatKey)
                    return;
                // 离开前：缓存当前角色的 TXT/运行时（不改全局 enabled）
                if (plotControlActiveCharKey) {
                    plotCharSession[plotControlActiveCharKey] = {
                        novelText: novelText || "",
                        novelFileName: novelFileName || worldBookConfig.novelName || "",
                        worldBookConfig: {
                            selectedChapterIndices: Array.isArray(worldBookConfig.selectedChapterIndices)
                                ? worldBookConfig.selectedChapterIndices.slice()
                                : [],
                            useChapterRange: !!worldBookConfig.useChapterRange,
                            chapterRangeStart: worldBookConfig.chapterRangeStart,
                            chapterRangeEnd: worldBookConfig.chapterRangeEnd,
                            autoAdvanceEnabled: !!worldBookConfig.autoAdvanceEnabled,
                            autoAdvanceChapterCount: Math.max(1, Number(worldBookConfig.autoAdvanceChapterCount) || 5),
                            autoAdvanceCurrentStart: worldBookConfig.autoAdvanceCurrentStart,
                            autoAdvanceStartChapter: worldBookConfig.autoAdvanceStartChapter,
                            worldBookName: worldBookConfig.worldBookName || "",
                            worldBookEntryUid: worldBookConfig.worldBookEntryUid,
                            persistent: !!worldBookConfig.persistent,
                            onceArmed: !!worldBookConfig.onceArmed
                        }
                    };
                }
                plotControlActiveCharKey = key || "";
                plotControlActiveChatKey = chatKey;
                // 欢迎页 / 默认助手：直接隐藏栏，不 hydrate
                if (isWelcomeOrAssistantContext()) {
                    ensureNovelPlotControlBar();
                    refreshNovelPlotControlBar();
                    try {
                        $("#novel_plot_bar_enabled").prop("checked", !!plotControlBarEnabled);
                    } catch (eUi0) {}
                    return;
                }
                // 先软重置角色侧字段，再从世界书检测恢复
                resetPlotCharacterRuntimeSoft();
                // 同会话切回：先恢复 TXT，预览标题立刻有
                if (key && plotCharSession[key] && plotCharSession[key].novelText) {
                    novelText = plotCharSession[key].novelText;
                    if (plotCharSession[key].novelFileName) {
                        novelFileName = plotCharSession[key].novelFileName;
                        worldBookConfig.novelName = novelFileName;
                    }
                } else {
                    novelText = "";
                    novelFileName = "";
                }
                ensureNovelPlotControlBar();
                refreshNovelPlotControlBar();
                try {
                    $("#novel_plot_bar_enabled").prop("checked", !!plotControlBarEnabled);
                } catch (eUi) {}
                // 异步从世界书恢复范围/钉住
                hydratePlotStateFromWorldBook({ silent: !0 }).then(function () {
                    try {
                        ensureNovelPlotControlBar();
                        refreshNovelPlotControlBar();
                    } catch (e3) {}
                    // 换了角色/聊天就重新给满重试次数
                    plotHydrateRetryAttempts = 0;
                    schedulePlotHydrateRetry();
                });
            } catch (e) {}
        }
        function ensurePlotCharacterSwitchBinding() {
            if (plotCharSwitchBound) return;
            plotCharSwitchBound = !0;
            try {
                var ctx = getContext();
                var es = ctx && ctx.eventSource;
                var t = (ctx && (ctx.eventTypes || ctx.event_types)) || {};
                var names = [
                    t.CHAT_CHANGED,
                    t.CHARACTER_EDITED,
                    t.CHARACTER_PAGE_LOADED,
                    t.CHARACTER_DELETED,
                    "chat_id_changed",
                    "chat_changed",
                    "character_edited",
                    "character_page_loaded"
                ];
                var seen = {};
                if (es && typeof es.on === "function") {
                    for (var i = 0; i < names.length; i++) {
                        var name = names[i];
                        if (!name || seen[name]) continue;
                        seen[name] = !0;
                        es.on(name, function () {
                            setTimeout(function () {
                                switchPlotControlToCurrentCharacter(!1);
                            }, 80);
                        });
                    }
                }
            } catch (e) {}
            try {
                var hostDoc = getHostDocument();
                if (hostDoc && !hostDoc.__novelPlotCharWatch) {
                    hostDoc.__novelPlotCharWatch = setInterval(function () {
                        try {
                            var k = getPlotCharacterKey();
                            if (k !== plotControlActiveCharKey) switchPlotControlToCurrentCharacter(!1);
                        } catch (e2) {}
                    }, 1200);
                }
            } catch (e3) {}
        }
        function findChapterEntryByNumber(chapters, num) {
            num = Number(num);
            if (!Array.isArray(chapters) || !Number.isFinite(num)) return null;
            var map = getChapterIndexMap(chapters);
            var idx = map[num];
            if (idx == null || idx < 0 || idx >= chapters.length) return null;
            return { chapter: chapters[idx], index: idx };
        }
        function renderFlowRangePreviewHtml(start, end, chapters) {
            chapters = Array.isArray(chapters) ? chapters : [];
            var f = findChapterEntryByNumber(chapters, start);
            var l = findChapterEntryByNumber(chapters, end);
            var lines = [];
            lines.push(
                '<div class="npc_pin_preview_item">起 #' +
                    start +
                    " " +
                    (f ? escapeHtml(stripPlotTitleNumber(getChapterDisplayTitle(f.chapter, f.index))) : "（未找到）") +
                    "</div>"
            );
            if (end !== start)
                lines.push(
                    '<div class="npc_pin_preview_item">止 #' +
                        end +
                        " " +
                        (l ? escapeHtml(stripPlotTitleNumber(getChapterDisplayTitle(l.chapter, l.index))) : "（未找到）") +
                        "</div>"
                );
            lines.push(
                '<div class="npc_pin_preview_more">共 ' +
                    Math.max(1, end - start + 1) +
                    " " +
                    getPlotUnitWords().one +
                    "</div>"
            );
            return lines.join("");
        }
        function scheduleFlowRangePreview($bar) {
            if (plotRangePreviewTimer) {
                clearTimeout(plotRangePreviewTimer);
                plotRangePreviewTimer = null;
            }
            plotRangePreviewTimer = setTimeout(function () {
                plotRangePreviewTimer = null;
                try {
                    if (!$bar || !$bar.length || !novelText) return;
                    var chapters = getCachedChapters(novelText);
                    if (!chapters.length) return;
                    var bounds = getChapterNumberBounds(chapters);
                    var start = parseChapterNumberValue($bar.find("#novel_plot_start").val(), bounds.min || 1, 0);
                    var end = parseChapterNumberValue($bar.find("#novel_plot_end").val(), start, 0);
                    if (end < start) {
                        var tt = start;
                        start = end;
                        end = tt;
                    }
                    $bar.find("#novel_plot_range_preview").html(renderFlowRangePreviewHtml(start, end, chapters));
                } catch (e) {}
            }, 180);
        }
        // ===== 剧情栏 · 原文查看 / 生成内容重合对照 =====
        // 社区反馈：想一边聊一边核对原文（不必每次开导入面板），并想知道回复里有多少字是照原文写的。
        var PLOT_READER_ID = "novel_plot_reader";
        function ensurePlotReaderModal() {
            try {
                var hostDoc = getHostDocument();
                var $ = getHostJQuery();
                if (!hostDoc || !hostDoc.body || !$) return null;
                var $modal = $(hostDoc).find("#" + PLOT_READER_ID);
                if ($modal.length) return $modal;
                $(hostDoc.body).append(
                    '<div id="' + PLOT_READER_ID + '">' +
                        '<div class="npc_rd">' +
                        '<div class="npc_rd_head">' +
                        '<div class="npc_rd_title" id="novel_plot_reader_title">原文</div>' +
                        '<div class="npc_rd_tabs">' +
                        '<button type="button" class="npc_rd_tab" data-npc-rd-tab="read">原文</button>' +
                        '<button type="button" class="npc_rd_tab" data-npc-rd-tab="pinned">固定章节</button>' +
                        '<button type="button" class="npc_rd_tab" data-npc-rd-tab="diff">对照生成</button>' +
                        "</div>" +
                        '<button type="button" class="npc_rd_close" id="novel_plot_reader_close" title="关闭">×</button>' +
                        "</div>" +
                        '<div class="npc_rd_bar" id="novel_plot_reader_bar"></div>' +
                        '<div class="npc_rd_body" id="novel_plot_reader_body"></div>' +
                        '<div class="npc_rd_foot">' +
                        '<span class="npc_rd_hint" id="novel_plot_reader_hint"></span>' +
                        '<button type="button" class="menu_button npc_rd_btn" id="novel_plot_reader_copy">复制原文</button>' +
                        '<button type="button" class="menu_button npc_rd_btn" id="novel_plot_reader_done">关闭</button>' +
                        "</div>" +
                        "</div>" +
                        "</div>"
                );
                return $(hostDoc).find("#" + PLOT_READER_ID);
            } catch (e) {
                return null;
            }
        }
        function getPlotReaderData() {
            var chapters = novelText ? getCachedChapters(novelText) : [];
            if (!chapters.length) return null;
            var range = getActivePlotRange(chapters);
            if (!range) return null;
            var items = getChapterItemsByNumberRange(chapters, range.start, range.end);
            if (!items.length) return null;
            return { chapters: chapters, range: range, items: items };
        }
        function getPlotReaderItems(data) {
            if (!data) return [];
            var want = String(plotReaderChapter || "");
            if (!want) return data.items;
            var picked = data.items.filter(function (item) {
                return String(item.number) === want;
            });
            return picked.length ? picked : data.items;
        }
        function plotReaderChapterLabel(item) {
            var unit = getPlotUnitWords().one;
            var raw = String((item && item.chapter && item.chapter.title) || "");
            var title = raw ? stripPlotTitleNumber(raw) : "";
            if (title.length > 26) title = title.slice(0, 26) + "…";
            return "第" + item.number + unit + (title ? " · " + title : "");
        }
        // 最近的 AI 回复（跳过用户/系统消息），新→旧
        function getPlotReaderAiMessages(limit) {
            try {
                var ctx = getContext();
                var chat = Array.isArray(ctx && ctx.chat) ? ctx.chat : [];
                var out = [];
                var max = Math.max(1, Number(limit) || 8);
                for (var i = chat.length - 1; i >= 0 && out.length < max; i--) {
                    var m = chat[i];
                    if (!m || m.is_user || m.is_system) continue;
                    var text = String(m.mes || "");
                    if (!text.trim()) continue;
                    out.push({ index: i, text: text, name: String(m.name || "") });
                }
                return out;
            } catch (e) {
                return [];
            }
        }
        // 比对用归一化：只留汉字/假名/韩文/字母数字，丢掉空白、标点、markdown 符号
        function normalizeOverlapText(text) {
            var src = String(text || "");
            var chars = [];
            var map = [];
            for (var i = 0; i < src.length; i++) {
                var code = src.charCodeAt(i);
                var keep =
                    (code >= 0x3400 && code <= 0x9fff) ||
                    (code >= 0xf900 && code <= 0xfaff) ||
                    (code >= 0x3040 && code <= 0x30ff) ||
                    (code >= 0xac00 && code <= 0xd7af) ||
                    (code >= 0x30 && code <= 0x39) ||
                    (code >= 0x41 && code <= 0x5a) ||
                    (code >= 0x61 && code <= 0x7a) ||
                    (code >= 0xff10 && code <= 0xff19) ||
                    (code >= 0xff21 && code <= 0xff3a) ||
                    (code >= 0xff41 && code <= 0xff5a) ||
                    (code >= 0xff66 && code <= 0xff9f);
                if (!keep) continue;
                var ch = src.charAt(i);
                if (code >= 0x41 && code <= 0x5a) ch = ch.toLowerCase();
                chars.push(ch);
                map.push(i);
            }
            return { norm: chars.join(""), map: map };
        }
        // 种子 + 向两边扩展：找出两条文本里长度 ≥ minRun 的公共片段并标记
        function findOverlapRuns(aNorm, bNorm, seed, minRun) {
            seed = Math.max(3, Number(seed) || 6);
            minRun = Math.max(seed + 2, Number(minRun) || seed + 2);
            var aMarks = new Uint8Array(aNorm.length);
            var bMarks = new Uint8Array(bNorm.length);
            var index = Object.create(null);
            var i, j, k, g, list, si, same;
            for (i = 0; i + seed <= aNorm.length; i++) {
                g = aNorm.slice(i, i + seed);
                same = !0;
                for (si = 1; si < g.length; si++) {
                    if (g.charAt(si) !== g.charAt(0)) {
                        same = !1;
                        break;
                    }
                }
                // 全同字的 gram（「哈哈哈哈」）命中面太大，跳过
                if (same) continue;
                list = index[g] || (index[g] = []);
                if (list.length < 6) list.push(i);
            }
            var longest = 0;
            for (j = 0; j + seed <= bNorm.length; j++) {
                list = index[bNorm.slice(j, j + seed)];
                if (!list) continue;
                for (k = 0; k < list.length; k++) {
                    i = list[k];
                    var back = 0;
                    while (
                        i - back - 1 >= 0 &&
                        j - back - 1 >= 0 &&
                        aNorm.charAt(i - back - 1) === bNorm.charAt(j - back - 1)
                    )
                        back++;
                    var fwd = 0;
                    while (
                        i + seed + fwd < aNorm.length &&
                        j + seed + fwd < bNorm.length &&
                        aNorm.charAt(i + seed + fwd) === bNorm.charAt(j + seed + fwd)
                    )
                        fwd++;
                    var run = back + seed + fwd;
                    if (run < minRun) continue;
                    if (run > longest) longest = run;
                    for (var x = i - back; x < i + seed + fwd; x++) aMarks[x] = 1;
                    for (var y = j - back; y < j + seed + fwd; y++) bMarks[y] = 1;
                }
            }
            var aCount = 0;
            var bCount = 0;
            for (i = 0; i < aMarks.length; i++) if (aMarks[i]) aCount++;
            for (j = 0; j < bMarks.length; j++) if (bMarks[j]) bCount++;
            return { aMarks: aMarks, bMarks: bMarks, aCount: aCount, bCount: bCount, longest: longest };
        }
        function renderOverlapHtml(src, normInfo, marks) {
            var text = String(src || "");
            if (!normInfo || !normInfo.map || !marks || !marks.length) return escapeHtml(text);
            var map = normInfo.map;
            var out = [];
            var last = 0;
            var i = 0;
            while (i < marks.length) {
                if (!marks[i]) {
                    i++;
                    continue;
                }
                var s = i;
                while (i < marks.length && marks[i]) i++;
                var from = map[s];
                var to = map[i - 1] + 1;
                if (from === void 0 || to <= from) continue;
                if (from > last) out.push(escapeHtml(text.slice(last, from)));
                out.push('<mark class="npc_hit">' + escapeHtml(text.slice(from, to)) + "</mark>");
                last = to;
            }
            if (last < text.length) out.push(escapeHtml(text.slice(last)));
            return out.join("");
        }
        function renderPlotReader() {
            var $ = getHostJQuery();
            var hostDoc = getHostDocument();
            if (!hostDoc || !$) return;
            var $modal = $(hostDoc).find("#" + PLOT_READER_ID);
            if (!$modal.length) return;
            var unit = getPlotUnitWords();
            var $bar = $modal.find("#novel_plot_reader_bar");
            var $body = $modal.find("#novel_plot_reader_body");
            var $title = $modal.find("#novel_plot_reader_title");
            var $hint = $modal.find("#novel_plot_reader_hint");
            $modal.find("[data-npc-rd-tab]").each(function () {
                $(this).toggleClass("npc_on", String($(this).attr("data-npc-rd-tab")) === plotReaderTab);
            });
            if ($bar[0]) $bar[0].style.removeProperty("display");
            if (plotReaderTab === "pinned") {
                var pinnedItems = getPinnedChapterItems(novelText ? getCachedChapters(novelText) : []);
                $title.text(
                    "固定章节 · 常驻注入" +
                        (pinnedItems.length ? " / 共 " + pinnedItems.length + " " + unit.one : "")
                );
                $bar.empty();
                if ($bar[0]) $bar[0].style.setProperty("display", "none", "important");
                if (!pinnedItems.length) {
                    $body.html(
                        '<div class="npc_rd_empty">还没有钉住章节。在「固定章节 → 钉住管理」里钉住需要的章节后，这里就能看到原文预览。</div>'
                    );
                    plotReaderLastOriginalText = "";
                } else {
                    $body.html(buildPinnedChapterPreviewHtml());
                    bindShowMoreEvents("#novel_plot_reader");
                    plotReaderLastOriginalText = pinnedItems
                        .map(function (item) {
                            return String(item.chapter.content || "");
                        })
                        .join("\n\n");
                }
                $hint.text("固定章节会常驻注入；点章节看 800 字预览，点「展开全文」看全文");
                return;
            }
            var data = getPlotReaderData();
            if (!data) {
                $title.text(plotReaderTab === "diff" ? "对照生成" : "原文");
                $bar.empty();
                $body.html(
                    '<div class="npc_rd_empty">当前页面还没有小说正文。如果这本书之前在这个浏览器里导入过，会自动从缓存恢复；否则请到「导入面板」重新选一次 TXT（选过之后下次自动记住）。</div>'
                );
                $hint.text("");
                plotReaderLastOriginalText = "";
                return;
            }
            var items = getPlotReaderItems(data);
            $title.text(
                (plotReaderTab === "diff" ? "对照生成 · " : "原文 · ") +
                    formatPlotRangeText(data.range) +
                    " / 共 " +
                    data.range.total +
                    " " +
                    unit.one
            );
            var chapterOpts = ['<option value="">全部本批（' + data.items.length + " " + unit.one + "）</option>"];
            data.items.forEach(function (item) {
                chapterOpts.push(
                    '<option value="' +
                        item.number +
                        '"' +
                        (String(plotReaderChapter) === String(item.number) ? " selected" : "") +
                        ">" +
                        escapeHtml(plotReaderChapterLabel(item)) +
                        "</option>"
                );
            });
            var chapterSel =
                '<select id="novel_plot_reader_chapter" title="选择章节">' + chapterOpts.join("") + "</select>";
            var originalText = "";
            items.forEach(function (item) {
                originalText += (originalText ? "\n\n" : "") + String(item.chapter.content || "");
            });
            plotReaderLastOriginalText = originalText;
            if (plotReaderTab !== "diff") {
                var readHtml = "";
                items.forEach(function (item) {
                    readHtml +=
                        '<div class="npc_rd_ch">' +
                        escapeHtml(plotReaderChapterLabel(item)) +
                        "</div>" +
                        '<div class="npc_rd_text">' +
                        escapeHtml(String(item.chapter.content || "")) +
                        "</div>";
                });
                $bar.html(
                    chapterSel +
                        '<span class="npc_rd_stat">共 ' +
                        originalText.length.toLocaleString() +
                        " 字</span>"
                );
                $body.html(readHtml);
                $hint.text("只读预览，不改动小说与注入内容");
                return;
            }
            var msgs = getPlotReaderAiMessages(8);
            var msg = null;
            if (msgs.length) {
                msg = msgs[0];
                for (var mi = 0; mi < msgs.length; mi++) if (msgs[mi].index === plotReaderMsgIdx) msg = msgs[mi];
                plotReaderMsgIdx = msg.index;
            } else {
                plotReaderMsgIdx = -1;
            }
            var msgOpts = [];
            if (!msgs.length) msgOpts.push('<option value="-1">还没有 AI 回复</option>');
            msgs.forEach(function (m) {
                var brief = String(m.text).replace(/\s+/g, " ").trim().slice(0, 18);
                msgOpts.push(
                    '<option value="' +
                        m.index +
                        '"' +
                        (m.index === plotReaderMsgIdx ? " selected" : "") +
                        ">第 " +
                        (m.index + 1) +
                        " 楼 · " +
                        escapeHtml(brief) +
                        (brief.length >= 18 ? "…" : "") +
                        "</option>"
                );
            });
            var msgSel =
                '<select id="novel_plot_reader_msg" title="选择要对比的 AI 回复">' + msgOpts.join("") + "</select>";
            var genText = msg ? String(msg.text || "") : "";
            var aInfo = normalizeOverlapText(originalText);
            var bInfo = normalizeOverlapText(genText);
            var overlap = findOverlapRuns(aInfo.norm, bInfo.norm, 6, 8);
            var pct = bInfo.norm.length ? (overlap.bCount / bInfo.norm.length) * 100 : 0;
            var srcPct = aInfo.norm.length ? (overlap.aCount / aInfo.norm.length) * 100 : 0;
            var stat =
                msg && bInfo.norm.length
                    ? "重合 " +
                      pct.toFixed(1) +
                      "% · 原文覆盖 " +
                      srcPct.toFixed(1) +
                      "% · 最长连续 " +
                      overlap.longest +
                      " 字"
                    : "没有可对比的 AI 回复";
            $bar.html(chapterSel + msgSel + '<span class="npc_rd_stat">' + escapeHtml(stat) + "</span>");
            $body.html(
                '<div class="npc_rd_cols">' +
                    '<div class="npc_rd_col"><div class="npc_rd_colhead">原文 · ' +
                    escapeHtml(items.map(plotReaderChapterLabel).join("、")) +
                    '</div><div class="npc_rd_text">' +
                    renderOverlapHtml(originalText, aInfo, overlap.aMarks) +
                    "</div></div>" +
                    '<div class="npc_rd_col"><div class="npc_rd_colhead">生成内容 · 第 ' +
                    (msg ? msg.index + 1 : "-") +
                    " 楼" +
                    (msg && msg.name ? " · " + escapeHtml(msg.name) : "") +
                    '</div><div class="npc_rd_text">' +
                    (msg
                        ? renderOverlapHtml(genText, bInfo, overlap.bMarks)
                        : '<div class="npc_rd_empty">没有可对比的 AI 回复。先在聊天里生成一条回复，再回来点「对照」。</div>') +
                    "</div></div>" +
                    "</div>"
            );
            $hint.text("绿色 = 与原文逐字重合的部分（忽略标点与空格）");
        }
        function openPlotReader(tab) {
            plotReaderTab = tab === "diff" ? "diff" : tab === "pinned" ? "pinned" : "read";
            var $modal = ensurePlotReaderModal();
            if (!$modal || !$modal.length) {
                novelToast("error", "打开原文窗口失败");
                return;
            }
            renderPlotReader();
            $modal.addClass("open");
            if (!novelText) {
                // 启动时可能没赶上（聊天/世界书还没就绪），按书名再捞一次缓存
                autoRestoreNovelTextFromCache(worldBookConfig.novelName || novelFileName || "").then(function (ok) {
                    if (ok) renderPlotReader();
                });
            }
            try {
                $modal.find("#novel_plot_reader_body").scrollTop(0);
            } catch (e) {}
        }
        function closePlotReader() {
            try {
                var $ = getHostJQuery();
                var hostDoc = getHostDocument();
                if ($ && hostDoc) $(hostDoc).find("#" + PLOT_READER_ID).removeClass("open");
            } catch (e) {}
        }
        function copyPlotReaderText() {
            var text = plotReaderLastOriginalText || "";
            if (!text) {
                novelToast("warning", "没有可复制的原文");
                return;
            }
            var ok = !1;
            try {
                var hostDoc = getHostDocument() || document;
                var ta = hostDoc.createElement("textarea");
                ta.value = text;
                ta.setAttribute("readonly", "readonly");
                ta.style.cssText = "position:fixed;left:-9999px;top:0;opacity:0;";
                hostDoc.body.appendChild(ta);
                ta.select();
                ok = hostDoc.execCommand("copy");
                hostDoc.body.removeChild(ta);
            } catch (e) {}
            if (!ok) {
                try {
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        navigator.clipboard.writeText(text);
                        ok = !0;
                    }
                } catch (e2) {}
            }
            novelToast(ok ? "success" : "error", ok ? "原文已复制" : "复制失败，请手动选择文字");
        }
        function syncPinModeFields($bar) {
            var single = (plotPinnedMode || "range") === "single";
            $bar.find("#novel_plot_pin_single_fields").toggleClass("npc_fields_on", single);
            $bar.find("#novel_plot_pin_range_fields").toggleClass("npc_fields_off", single);
        }
        function refreshNovelPlotControlBar() {
            try {
                var hostDoc = getHostDocument();
                var $hostJQ = getHostJQuery();
                if (!hostDoc || !$hostJQ) return;
                var $bar = $hostJQ(hostDoc).find("#novel_plot_control_bar");
                if (!$bar.length) return;
                $bar.toggleClass("npc_collapsed", !!plotControlBarCollapsed);
                $bar.toggleClass("npc_expanded", !plotControlBarCollapsed);
                $bar.find("#novel_plot_status").text(describeActivePlotRange());
                var chaptersForFab = novelText ? getCachedChapters(novelText) : [];
                var rangeForFab = chaptersForFab.length ? getActivePlotRange(chaptersForFab) : null;
                if (!rangeForFab && (worldBookConfig.useChapterRange || worldBookConfig.worldBookEntryUid != null)) {
                    var rs = Number(worldBookConfig.chapterRangeStart);
                    var re = Number(worldBookConfig.chapterRangeEnd);
                    if (Number.isFinite(rs) && Number.isFinite(re) && re >= rs)
                        rangeForFab = { start: rs, end: re, count: re - rs + 1, total: re, min: rs };
                }
                var words = getPlotUnitWords();
                var $scrub = $bar.find("#novel_plot_scrub");
                if (rangeForFab) {
                    var span = rangeForFab.total - rangeForFab.min;
                    var pct = span > 0 ? Math.round(((rangeForFab.start - rangeForFab.min) / span) * 100) : 0;
                    pct = Math.min(100, Math.max(0, pct));
                    var $fill = $bar.find("#novel_plot_progress_fill");
                    if ($fill.length) $fill.css("width", pct + "%");
                    var metaTxt = describeActivePlotMeta();
                    $bar.find("#novel_plot_sb_meta").text(metaTxt);
                    $bar.find("#novel_plot_progress_wrap").attr("title", "进度 " + pct + "%");
                    var $totalChip = $bar.find("#novel_plot_total_chip");
                    if ($totalChip.length) $totalChip.text("共 " + rangeForFab.total + " " + words.one);
                    if (!$bar.find("#novel_plot_start").is(":focus")) $bar.find("#novel_plot_start").val(rangeForFab.start);
                    if (!$bar.find("#novel_plot_end").is(":focus")) $bar.find("#novel_plot_end").val(rangeForFab.end);
                    if (!$bar.find("#novel_plot_step").is(":focus")) $bar.find("#novel_plot_step").val(Math.max(1, rangeForFab.end - rangeForFab.start + 1));
                    if ($scrub.length && !plotScrubbing) {
                        var scrubMax = Math.max(rangeForFab.min, rangeForFab.total - Math.max(0, rangeForFab.count - 1));
                        $scrub.attr({ min: rangeForFab.min, max: scrubMax });
                        if (!$scrub.is(":focus")) $scrub.val(rangeForFab.start);
                        var $smin = $bar.find("#novel_plot_scrub_min"),
                            $smax = $bar.find("#novel_plot_scrub_max");
                        if ($smin.length) $smin.text("第" + rangeForFab.min + words.one);
                        if ($smax.length) $smax.text("第" + rangeForFab.total + words.one);
                    }
                    try {
                        var $rp = $bar.find("#novel_plot_range_preview");
                        if ($rp.length && chaptersForFab.length) {
                            $rp.html(
                                renderFlowRangePreviewHtml(rangeForFab.start, rangeForFab.end, chaptersForFab)
                            );
                        } else if ($rp.length) {
                            $rp.html(
                                renderFlowRangePreviewHtml(rangeForFab.start, rangeForFab.end, [])
                            );
                        }
                    } catch (ePrev) {}
                } else {
                    $bar.find("#novel_plot_sb_meta").text(describeActivePlotMeta());
                    $bar.find("#novel_plot_progress_wrap").removeAttr("title");
                    $bar.find("#novel_plot_range_preview").empty();
                    var $fill0 = $bar.find("#novel_plot_progress_fill");
                    if ($fill0.length) $fill0.css("width", "0%");
                    var $chip0 = $bar.find("#novel_plot_total_chip");
                    if ($chip0.length) $chip0.text("");
                }
                var $pinnedList = $bar.find("#novel_plot_pinned_list");
                if ($pinnedList.length) {
                    $pinnedList.html(renderPinnedChipsHtml(plotPinnedChapterNumbers));
                }
                var $pinRead = $bar.find("#novel_plot_pinned_read");
                if ($pinRead.length) {
                    var hasPins = plotPinnedChapterNumbers.length > 0;
                    $pinRead.prop("hidden", !hasPins);
                    if ($pinRead[0]) $pinRead[0].style.setProperty("display", hasPins ? "inline-flex" : "none", "important");
                }
                var $pinCount = $bar.find("#novel_plot_pin_count");
                if ($pinCount.length) $pinCount.text(plotPinnedChapterNumbers.length ? ("已钉 " + plotPinnedChapterNumbers.length + " 章") : "");
                var $pinActions = $bar.find(".npc_pin_actions");
                if ($pinActions.length) $pinActions.toggle(plotPinnedChapterNumbers.length > 0);
                mountNovelPlotControlBarToLastMessage($bar, hostDoc);
                // layout 补丁只在新建/重挂 HTML 时跑一次，避免每次 refresh 扫 DOM
                if (!$bar.attr("data-npc-layout-ok")) {
                    fixNovelPlotControlBarLayout($bar);
                    $bar.attr("data-npc-layout-ok", "1");
                }
                var el = $bar[0];
                if (el && el.style) {
                    var showBar = !!plotControlBarEnabled && !isWelcomeOrAssistantContext();
                    el.style.setProperty("display", showBar ? "block" : "none", "important");
                    el.style.setProperty("position", "relative", "important");
                    el.style.setProperty("left", "auto", "important");
                    el.style.setProperty("right", "auto", "important");
                    el.style.setProperty("top", "auto", "important");
                    el.style.setProperty("bottom", "auto", "important");
                    el.style.removeProperty("z-index");
                }
                $bar.toggleClass("npc_visible", !!plotControlBarEnabled && !isWelcomeOrAssistantContext());
                $bar.toggleClass("npc_no_text", !novelText);
                setNovelPlotStatusText($bar, $bar.find("#novel_plot_status").text());
                $bar.find("#novel_plot_sb_chevron").text(plotControlBarCollapsed ? "▾" : "▴");
                var canStep = !!novelText && chaptersForFab.length > 0 && !plotControlStepBusy;
                $bar.find("#novel_plot_prev,#novel_plot_next").prop("disabled", !canStep);
                var words2 = getPlotUnitWords();
                $bar.find("#novel_plot_prev").attr("title", words2.prev).text("‹");
                $bar.find("#novel_plot_next").attr("title", words2.next).text("›");
                var busy = !!plotControlStepBusy;
                var $applyBtn = $bar.find("#novel_plot_apply_range");
                if ($applyBtn.length) {
                    $applyBtn.prop("disabled", busy).toggleClass("npc_busy", busy).text(busy ? "应用中…" : "应用");
                }
                if ($scrub.length) $scrub.prop("disabled", busy || !chaptersForFab.length);
                                // pinned panel state
                var $pinSec = $bar.find("#novel_plot_pinned_section,.npc_pinned_section");
                $pinSec.toggleClass("npc_pinned_on", !!plotPinnedEnabled);
                // 不要在 refresh 里强写 details.open —— 移动端会和用户手势打架闪烁
                $bar.find("#novel_plot_pin_enabled").prop("checked", !!plotPinnedEnabled);
                $bar.find('input[name="novel_plot_pin_mode"][value="' + (plotPinnedMode || "range") + '"]').prop("checked", !0);
                syncPinModeFields($bar);
                if ($bar.find("#novel_plot_pin_position").length) {
                    $bar.find("#novel_plot_pin_position").val(plotPinnedInsertPosition || "before_char_def");
                    $bar.find("#novel_plot_pin_depth").val(Number(plotPinnedDepth) || 5);
                    $bar.find("#novel_plot_pin_order").val(Number(plotPinnedOrder) || 100);
                    syncPinnedPositionDepthVisibility();
                }
                if (plotPinnedEnabled) refreshPinnedDraftPreview();
            } catch (e) {}
        }
        async function applyCustomPlotRange() {
            if (plotControlStepBusy) return;
            try {
                plotControlStepBusy = !0;
                if (!(await ensureNovelTextForPlotAction())) return;
                var chapters = getCachedChapters(novelText);
                if (!chapters.length) return void novelToast("error", "未解析到章节");
                var hostDoc = getHostDocument();
                var $ = getHostJQuery();
                var $bar = $(hostDoc).find("#novel_plot_control_bar");
                var startVal = $bar.find("#novel_plot_start").val();
                var endVal = $bar.find("#novel_plot_end").val();
                var bounds = getChapterNumberBounds(chapters);
                var start = parseChapterNumberValue(startVal, bounds.min || 1, 0);
                var end = parseChapterNumberValue(endVal, start, 0);
                if (end < start) {
                    var t = start;
                    start = end;
                    end = t;
                }
                var count = Math.max(1, end - start + 1);
                worldBookConfig.autoAdvanceChapterCount = count;
                try { $("#novel_wb_auto_chapter_count").val(count); } catch (e) {}
                var next = setActivePlotWindow(start, end, chapters, !0);
                await commitPlotRangeToWorldBook(next, "已应用范围 ");
            } catch (error) {
                console.error("[" + extensionName + "] apply custom range failed", error);
                novelToast("error", "应用范围失败，请查看控制台");
            } finally {
                plotControlStepBusy = !1;
                refreshNovelPlotControlBar();
            }
        }


function fixNovelPlotControlBarLayout($bar) {
            try {
                if (!$bar || !$bar.length) return;
                var el = $bar[0];
                if (!el || !el.querySelectorAll) return;
                // 防竖排/继承错乱：所有行容器强制水平排版
                var horizNodes = el.querySelectorAll(
                    ".npc_topbar,.npc_info,.npc_head_txt,.npc_flow,.npc_card_head,.npc_pin_head,.npc_pin_fields,.npc_seg,.npc_quick,.npc_foot,.npc_adv_row,.npc_scrub_ends,.npc_pin_actions,.npc_chips,.npc_pin_adv>summary"
                );
                for (var i = 0; i < horizNodes.length; i++) {
                    var n = horizNodes[i];
                    if (!n || !n.style) continue;
                    n.style.setProperty("writing-mode", "horizontal-tb", "important");
                    n.style.setProperty("text-orientation", "mixed", "important");
                }
                // 可换行的行：明确 flex-row + wrap（.npc_pin_actions 除外——refresh 里 toggle 要能隐藏它）
                var rowNodes = el.querySelectorAll(
                    ".npc_flow,.npc_card_head,.npc_pin_head,.npc_quick,.npc_foot,.npc_adv_row,.npc_chips"
                );
                for (var r = 0; r < rowNodes.length; r++) {
                    var row = rowNodes[r];
                    row.style.setProperty("display", "flex", "important");
                    row.style.setProperty("flex-direction", "row", "important");
                    row.style.setProperty("flex-wrap", "wrap", "important");
                    row.style.setProperty("align-items", "center", "important");
                }
                // 不许换行的行：seg / 滑杆两端 / 顶栏
                var nowrapNodes = el.querySelectorAll(".npc_seg,.npc_scrub_ends,.npc_topbar,.npc_info,.npc_head_txt");
                for (var w = 0; w < nowrapNodes.length; w++) {
                    var nw = nowrapNodes[w];
                    nw.style.setProperty("flex-wrap", "nowrap", "important");
                }
                var btns = el.querySelectorAll("button, .menu_button");
                for (var j = 0; j < btns.length; j++) {
                    var b = btns[j];
                    if (b.closest && (b.closest(".npc_chip") || b.classList.contains("npc_step"))) continue;
                    b.style.setProperty("display", "inline-flex", "important");
                    b.style.setProperty("flex-direction", "row", "important");
                    b.style.setProperty("align-items", "center", "important");
                    b.style.setProperty("justify-content", "center", "important");
                    b.style.setProperty("height", "auto", "important");
                    b.style.setProperty("min-height", b.classList && b.classList.contains("npc_ghost") ? "28px" : "34px", "important");
                    if (!(b.classList && b.classList.contains("npc_block_btn"))) b.style.setProperty("width", "auto", "important");
                    b.style.setProperty("max-width", "100%", "important");
                    b.style.setProperty("float", "none", "important");
                }
            } catch (e) {}
        }
        function isNovelPlotUserMes(node) {
            if (!node || !node.getAttribute) return !1;
            var v = node.getAttribute("is_user");
            if (v === "true" || v === "1") return !0;
            if (v === "false" || v === "0") return !1;
            return node.classList.contains("user") || node.classList.contains("is_user");
        }
        function isNovelPlotSystemMes(node) {
            if (!node || !node.getAttribute) return !1;
            var v = node.getAttribute("is_system");
            if (v === "true" || v === "1") return !0;
            return node.classList.contains("system") || node.classList.contains("is_system");
        }
        function getChatMessageNodes(hostDoc) {
            var chat = hostDoc.querySelector("#chat") || hostDoc.querySelector(".chat");
            if (!chat) return [];
            // 只取聊天根下的直接消息节点，避免嵌套误匹配
            var out = [], kids = chat.children || [];
            for (var i = 0; i < kids.length; i++) {
                var n = kids[i];
                if (!n || !n.classList) continue;
                if (n.id === "novel_plot_control_bar") continue;
                if (n.classList.contains("mes") || n.classList.contains("message")) out.push(n);
            }
            if (out.length) return out;
            return Array.prototype.slice.call(hostDoc.querySelectorAll("#chat > .mes, #chat > .message, .chat > .mes"));
        }
        function findLatestAiMessageNode(hostDoc) {
            var allMes = getChatMessageNodes(hostDoc);
            var lastAny = null, lastAi = null;
            for (var i = allMes.length - 1; i >= 0; i--) {
                var m = allMes[i];
                if (!m) continue;
                if (!lastAny) lastAny = m;
                if (isNovelPlotSystemMes(m)) continue;
                if (!isNovelPlotUserMes(m)) {
                    lastAi = m;
                    break;
                }
            }
            // 优先 last_mes：流式/刚生成完时最可靠
            try {
                var lastMes = hostDoc.querySelector("#chat .mes.last_mes, #chat .last_mes, .chat .mes.last_mes");
                if (lastMes && !isNovelPlotUserMes(lastMes) && !isNovelPlotSystemMes(lastMes)) lastAi = lastMes;
            } catch (e) {}
            return lastAi || lastAny;
        }
        function mountNovelPlotControlBarToLastMessage($bar, hostDoc) {
            try {
                if (!$bar || !$bar.length || !hostDoc) return !1;
                var el = $bar[0];
                if (!el) return !1;
                var chat = hostDoc.querySelector("#chat") || hostDoc.querySelector(".chat") || hostDoc.body;
                var targetMes = findLatestAiMessageNode(hostDoc);
                if (targetMes && targetMes.parentNode) {
                    // 挂在整条 .mes 后面，而不是 mes_text 内部——避免 ST 流式/重绘把栏清掉
                    if (el.parentNode === targetMes.parentNode && el.previousElementSibling === targetMes) return !1;
                    if (targetMes.nextSibling === el) return !1;
                    if (targetMes.nextSibling) targetMes.parentNode.insertBefore(el, targetMes.nextSibling);
                    else targetMes.parentNode.appendChild(el);
                    return !0;
                }
                if (chat && el.parentNode !== chat) {
                    chat.appendChild(el);
                    return !0;
                }
                return !1;
            } catch (e) {
                return !1;
            }
        }
        function stopPlotBarRuntime() {
            try {
                var hostDoc = getHostDocument();
                if (!hostDoc) return;
                if (hostDoc.__novelPlotBarFollowTimer) {
                    clearInterval(hostDoc.__novelPlotBarFollowTimer);
                    hostDoc.__novelPlotBarFollowTimer = null;
                }
                if (hostDoc.__novelPlotBarFollowKick) {
                    clearTimeout(hostDoc.__novelPlotBarFollowKick);
                    hostDoc.__novelPlotBarFollowKick = null;
                }
                if (hostDoc.__novelPlotBarFollowKick2) {
                    clearTimeout(hostDoc.__novelPlotBarFollowKick2);
                    hostDoc.__novelPlotBarFollowKick2 = null;
                }
                if (hostDoc.__novelPlotBarObserver) {
                    try {
                        hostDoc.__novelPlotBarObserver.disconnect();
                    } catch (eDisc) {}
                    hostDoc.__novelPlotBarObserver = null;
                    hostDoc.__novelPlotBarObservedChat = null;
                }
            } catch (e) {}
        }
        function startPlotBarRuntime() {
            try {
                if (!plotControlBarEnabled || isWelcomeOrAssistantContext()) {
                    stopPlotBarRuntime();
                    return;
                }
                ensureNovelPlotControlBarObserver();
            } catch (e) {}
        }
        function followPlotBarToLatestMessage() {
            try {
                if (!plotControlBarEnabled || isWelcomeOrAssistantContext()) return;
                var d = getHostDocument();
                var $q = getHostJQuery();
                if (!d || !$q) return;
                var $b = $q(d).find("#novel_plot_control_bar");
                // 栏丢失时才完整 ensure（重建 DOM/绑事件）；平时只 mount
                if (!$b.length) {
                    ensureNovelPlotControlBar();
                    $b = $q(d).find("#novel_plot_control_bar");
                }
                if ($b.length) mountNovelPlotControlBarToLastMessage($b, d);
            } catch (e) {}
        }
        function scheduleNovelPlotControlBarFollow(reason) {
            try {
                var hostDoc = getHostDocument();
                if (!hostDoc) return;
                if (hostDoc.__novelPlotBarFollowKick) {
                    clearTimeout(hostDoc.__novelPlotBarFollowKick);
                    hostDoc.__novelPlotBarFollowKick = null;
                }
                hostDoc.__novelPlotBarFollowKick = setTimeout(function () {
                    hostDoc.__novelPlotBarFollowKick = null;
                    try {
                        followPlotBarToLatestMessage();
                    } catch (e) {}
                }, reason === "immediate" ? 0 : 60);
                // 流式后半段再补一次，防止 last_mes 晚到
                if (hostDoc.__novelPlotBarFollowKick2) clearTimeout(hostDoc.__novelPlotBarFollowKick2);
                hostDoc.__novelPlotBarFollowKick2 = setTimeout(function () {
                    hostDoc.__novelPlotBarFollowKick2 = null;
                    try {
                        followPlotBarToLatestMessage();
                    } catch (e) {}
                }, 450);
            } catch (e) {}
        }
        function ensureNovelPlotControlBarObserver() {
            try {
                var hostDoc = getHostDocument();
                if (!hostDoc || !hostDoc.body) return;
                var chat = hostDoc.querySelector("#chat") || hostDoc.querySelector(".chat") || hostDoc.body;
                // chat 节点被 ST 整段替换时，旧 observer 会失联，需要重绑
                var needObs = !hostDoc.__novelPlotBarObserver || hostDoc.__novelPlotBarObservedChat !== chat;
                if (needObs) {
                    try {
                        if (hostDoc.__novelPlotBarObserver && hostDoc.__novelPlotBarObserver.disconnect)
                            hostDoc.__novelPlotBarObserver.disconnect();
                    } catch (eDisc) {}
                    var timer = null;
                    var obs = new MutationObserver(function () {
                        if (!plotControlBarEnabled || isWelcomeOrAssistantContext()) return;
                        if (timer) return;
                        timer = setTimeout(function () {
                            timer = null;
                            try {
                                followPlotBarToLatestMessage();
                            } catch (e) {}
                        }, 100);
                    });
                    // 只盯 #chat 直接子节点变化（新消息楼），避免流式改 mes_text 触发风暴
                    obs.observe(chat, { childList: true, subtree: false });
                    hostDoc.__novelPlotBarObserver = obs;
                    hostDoc.__novelPlotBarObservedChat = chat;
                }
                if (!hostDoc.__novelPlotBarFollowTimer) {
                    // 兜底降频：事件+observer 为主，interval 只防漏
                    hostDoc.__novelPlotBarFollowTimer = setInterval(function () {
                        try {
                            if (!plotControlBarEnabled || isWelcomeOrAssistantContext()) return;
                            var d = getHostDocument();
                            var chatNow = d && (d.querySelector("#chat") || d.querySelector(".chat") || d.body);
                            if (chatNow && hostDoc.__novelPlotBarObservedChat !== chatNow)
                                ensureNovelPlotControlBarObserver();
                            followPlotBarToLatestMessage();
                        } catch (e) {}
                    }, 1500);
                }
                // 订阅 ST 事件：比 MutationObserver 更准
                if (!hostDoc.__novelPlotBarEventsBound) {
                    hostDoc.__novelPlotBarEventsBound = !0;
                    try {
                        var ctx = getContext();
                        var es = ctx && ctx.eventSource;
                        var t = (ctx && (ctx.eventTypes || ctx.event_types)) || {};
                        var names = [
                            t.CHARACTER_MESSAGE_RENDERED,
                            t.MESSAGE_RECEIVED,
                            t.MESSAGE_UPDATED,
                            t.MESSAGE_EDITED,
                            t.MESSAGE_DELETED,
                            t.MESSAGE_SWIPED,
                            t.GENERATION_ENDED,
                            t.GENERATION_STOPPED,
                            t.CHAT_CHANGED,
                            "character_message_rendered",
                            "message_received",
                            "message_updated",
                            "message_edited",
                            "message_deleted",
                            "message_swiped",
                            "generation_ended",
                            "generation_stopped",
                            "chat_id_changed",
                            "chat_changed"
                        ];
                        var seen = {};
                        if (es && typeof es.on === "function") {
                            for (var i = 0; i < names.length; i++) {
                                var name = names[i];
                                if (!name || seen[name]) continue;
                                seen[name] = !0;
                                es.on(name, function () {
                                    scheduleNovelPlotControlBarFollow("event");
                                });
                            }
                        }
                    } catch (eEv) {}
                }
            } catch (e) {}
        }
        function ensureNovelPlotControlBar() {
            try {
                var hostDoc = getHostDocument();
                var $ = getHostJQuery();
                if (!hostDoc || !hostDoc.body || !$) return;
                var $host = $(hostDoc);
                var $bar = $host.find("#novel_plot_control_bar");
                                var npcBarHtml =
                    '<div class="npc_shell npc_v3">' +
                    '<div class="npc_topbar">' +
                    '<button type="button" id="novel_plot_prev" class="menu_button npc_nav" title="上一批">‹</button>' +
                    '<div class="npc_info" id="novel_plot_statusbar" title="展开/收起">' +
                    '<div class="npc_head_txt">' +
                    '<span class="npc_range" id="novel_plot_sb_status">尚未加载小说</span>' +
                    '<span class="npc_meta" id="novel_plot_sb_meta"></span>' +
                    '</div>' +
                    '<span class="npc_chev" id="novel_plot_sb_chevron">▾</span>' +
                    '</div>' +
                    '<button type="button" id="novel_plot_next" class="menu_button npc_nav" title="下一页">›</button>' +
                    '<div class="npc_progress" id="novel_plot_progress_wrap"><div class="npc_progress_fill" id="novel_plot_progress_fill" style="width:0%;"></div></div>' +
                    '</div>' +
                    '<div class="npc_panel">' +
                    '<div id="novel_plot_status" class="npc_status" style="display:none;"></div>' +
                    '<div class="npc_load_hint">还没有加载小说 TXT — 去「导入面板」加载后，这里就能控制剧情范围了</div>' +
                    '<div class="npc_card npc_follow">' +
                    '<div class="npc_card_head"><div class="npc_sec">跟随范围</div><span class="npc_tag" id="novel_plot_total_chip"></span></div>' +
                    '<div class="npc_flow">' +
                    '<div class="npc_field npc_num"><label>起</label><button type="button" class="npc_step" data-npc-step-target="#novel_plot_start" data-npc-step-delta="-1" tabindex="-1">−</button><input type="number" id="novel_plot_start" min="0" step="1" placeholder="1" /><button type="button" class="npc_step" data-npc-step-target="#novel_plot_start" data-npc-step-delta="1" tabindex="-1">+</button></div>' +
                    '<div class="npc_field npc_num"><label>止</label><button type="button" class="npc_step" data-npc-step-target="#novel_plot_end" data-npc-step-delta="-1" tabindex="-1">−</button><input type="number" id="novel_plot_end" min="0" step="1" placeholder="5" /><button type="button" class="npc_step" data-npc-step-target="#novel_plot_end" data-npc-step-delta="1" tabindex="-1">+</button></div>' +
                    '<div class="npc_field npc_num"><label>步数</label><input type="number" id="novel_plot_step" min="1" step="1" title="‹ › 每次移动的章数；改动后按 止=起+步数-1 联动" /></div>' +
                    '<button type="button" id="novel_plot_apply_range" class="menu_button npc_primary">应用</button>' +
                    '</div>' +
                    '<div class="npc_scrub">' +
                    '<input type="range" id="novel_plot_scrub" min="1" max="10" value="1" step="1" aria-label="拖动跳转章节" />' +
                    '<div class="npc_scrub_ends"><span id="novel_plot_scrub_min"></span><span id="novel_plot_scrub_max"></span></div>' +
                    '</div>' +
                    '<div id="novel_plot_range_preview" class="npc_preview"></div>' +
                    '<div class="npc_quick"><button type="button" id="novel_plot_read_original" class="menu_button npc_ghost npc_action" title="查看当前批次原文">原文</button><button type="button" id="novel_plot_diff" class="menu_button npc_ghost npc_action" title="对比生成内容与原文的文字重合度">对照</button></div>' +
                    '</div>' +
                    '<div class="npc_card npc_pin" id="novel_plot_pinned_section">' +
                    '<div class="npc_pin_head">' +
                    '<label class="npc_switch"><input type="checkbox" id="novel_plot_pin_enabled" /><span class="npc_switch_track"></span><span class="npc_switch_text">固定章节</span></label>' +
                    '<span class="npc_pin_count" id="novel_plot_pin_count"></span>' +
                    '</div>' +
                    '<div class="npc_pin_hint">钉住的章节会常驻注入，不随跟随范围滚动</div>' +
                    '<details class="npc_pin_adv" id="novel_plot_pin_details"><summary>钉住管理</summary>' +
                    '<div class="npc_pin_body">' +
                    '<div class="npc_seg">' +
                    '<label class="npc_seg_item"><input type="radio" name="novel_plot_pin_mode" value="range" checked /><span>连续范围</span></label>' +
                    '<label class="npc_seg_item"><input type="radio" name="novel_plot_pin_mode" value="single" /><span>单章列表</span></label>' +
                    '</div>' +
                    '<div class="npc_pin_fields" id="novel_plot_pin_range_fields"><div class="npc_field npc_num"><label>起</label><input type="number" id="novel_plot_pin_range_start" min="0" step="1" placeholder="1" /></div><div class="npc_field npc_num"><label>止</label><input type="number" id="novel_plot_pin_range_end" min="0" step="1" placeholder="5" /></div></div>' +
                    '<div class="npc_pin_fields" id="novel_plot_pin_single_fields"><div class="npc_field"><label>章</label><input type="text" id="novel_plot_pin_single_input" placeholder="如 1,3,7" /></div></div>' +
                    '<div id="novel_plot_pin_preview" class="npc_preview"></div>' +
                    '<button type="button" id="novel_plot_pin_apply" class="menu_button npc_primary npc_block_btn">钉住所选章节</button>' +
                    '<div class="npc_pin_pinned_wrap">' +
                    '<div class="npc_pin_pinned_head"><div class="npc_sec">已钉章节</div><button type="button" id="novel_plot_pinned_read" class="menu_button npc_ghost npc_pin_read" title="查看固定章节原文" hidden>原文</button></div>' +
                    '<div id="novel_plot_pinned_list" class="npc_chips"><span class="npc_empty">无</span></div>' +
                    '<div class="npc_pin_actions"><button type="button" id="novel_plot_pin_clear" class="menu_button npc_ghost npc_danger">清空固定</button></div>' +
                    '</div>' +
                    '<details class="npc_adv2"><summary>世界书参数（位置 / 顺序）</summary>' +
                    '<div class="npc_adv_row">' +
                    '<div class="npc_field npc_grow"><label>位置</label><select id="novel_plot_pin_position"><option value="before_char_def">角色定义前</option><option value="after_char_def">角色定义后</option><option value="before_example_mes">示例消息前</option><option value="after_example_mes">示例消息后</option><option value="before_authors_note">作者注释前</option><option value="after_authors_note">作者注释后</option><option value="system_depth">[系统] 深度 @D</option><option value="user_depth">[用户] 深度 @D</option><option value="assistant_depth">[AI] 深度 @D</option></select></div>' +
                    '<div class="npc_field npc_pin_depth_wrap" id="novel_plot_pin_depth_wrap"><label>深度</label><input type="number" id="novel_plot_pin_depth" min="1" value="5" /></div>' +
                    '<div class="npc_field"><label>顺序</label><input type="number" id="novel_plot_pin_order" min="0" value="100" /></div>' +
                    '</div>' +
                    '</details>' +
                    '</div>' +
                    '</details>' +
                    '</div>' +
                    '<div class="npc_foot">' +
                    '<button type="button" id="novel_plot_open_panel" class="menu_button npc_ghost">导入面板</button>' +
                    '<button type="button" id="novel_plot_hide" class="menu_button npc_ghost">隐藏</button>' +
                    '</div>' +
                    '</div></div>';
                if (!$bar.length) {
                    $host.find("body").append(
                        '<div id="novel_plot_control_bar" class="npc_collapsed" style="display:none;">' +
                            npcBarHtml +
                            "</div>"
                    );
                    $bar = $host.find("#novel_plot_control_bar");
                } else {
                    $bar.find("#novel_plot_fab,.npc_fab").remove();
                    if (!$bar.find(".npc_v3").length) {
                        $bar.empty();
                        $bar.append(npcBarHtml);
                        $bar.removeAttr("data-npc-layout-ok");
                    }
                    $bar.find("#novel_plot_collapse").remove();
                    $bar.find(".npc_drag_handle").removeClass("npc_drag_handle");
                }
                // 事件只绑一次：跟楼/ensure 高频路径不再 off+on 风暴
                if (!hostDoc.__novelPlotBarHandlersBound) {
                hostDoc.__novelPlotBarHandlersBound = !0;
                $host.on("click.novelPlotBar", "#novel_plot_statusbar", function (ev) {
                    ev.preventDefault();
                    ev.stopPropagation();
                    plotControlBarCollapsed = !plotControlBarCollapsed;
                    savePlotControlBarSettings(!0);
                    refreshNovelPlotControlBar();
                    // 展开后把栏底滚进视野，避免下半截（固定章节/钉住管理）落在聊天可视区外
                    if (!plotControlBarCollapsed) {
                        var barEl = $(this).closest("#novel_plot_control_bar")[0];
                        setTimeout(function () {
                            try {
                                if (barEl && barEl.scrollIntoView) barEl.scrollIntoView({ block: "end", behavior: "smooth" });
                            } catch (e) {}
                        }, 80);
                    }
                });
                $host.on("click.novelPlotBar", "#novel_plot_prev", function (ev) {
                    ev.preventDefault();
                    stepNovelPlotWindow(-1);
                });
                $host.on("click.novelPlotBar", "#novel_plot_next", function (ev) {
                    ev.preventDefault();
                    stepNovelPlotWindow(1);
                });
                $host.on("click.novelPlotBar", "#novel_plot_hide", function (ev) {
                    ev.preventDefault();
                    plotControlBarEnabled = !1;
                    plotControlSettingsHydrated = !0;
                    writePlotBarEnabledLocal(!1);
                    savePlotControlBarSettings(!0);
                    stopPlotBarRuntime();
                    refreshNovelPlotControlBar();
                    try {
                        $("#novel_plot_bar_enabled").prop("checked", !1);
                    } catch (eHide) {}
                    novelToast("info", "剧情控制栏已隐藏，可在导入面板里重新打开");
                });
                $host.on("click.novelPlotBar", "#novel_plot_apply_range", function (ev) { ev.preventDefault(); applyCustomPlotRange(); });
                $host.on("input.novelPlotBar change.novelPlotBar", "#novel_plot_start,#novel_plot_end", function () {
                    try {
                        var $b = $(this).closest("#novel_plot_control_bar");
                        if (!$b.length) $b = $(getHostDocument()).find("#novel_plot_control_bar");
                        scheduleFlowRangePreview($b);
                    } catch (e) {}
                });
                $host.on("keydown.novelPlotBar", "#novel_plot_start,#novel_plot_end,#novel_plot_step", function (ev) {
                    if (ev.key === "Enter") {
                        ev.preventDefault();
                        applyCustomPlotRange();
                    }
                });
                $host.on("input.novelPlotBar", "#novel_plot_step", function () {
                    var $inp = $(this);
                    if (plotStepInputTimer) {
                        clearTimeout(plotStepInputTimer);
                        plotStepInputTimer = null;
                    }
                    plotStepInputTimer = setTimeout(function () {
                        plotStepInputTimer = null;
                        try {
                            var raw = String($inp.val() || "").trim();
                            if (!raw) return; // 输入中间态，不联动
                            var step = Math.floor(Number(raw));
                            if (!Number.isFinite(step) || step < 1) return;
                            var $b = $inp.closest("#novel_plot_control_bar");
                            var start = Number($b.find("#novel_plot_start").val());
                            if (!Number.isFinite(start)) start = 1;
                            var end = start + step - 1;
                            if (novelText) {
                                var boundsSt = getChapterNumberBounds(getCachedChapters(novelText));
                                if (boundsSt && boundsSt.max) end = Math.min(end, boundsSt.max);
                            }
                            // 只改止，不链式 trigger，避免同步重绘风暴
                            $b.find("#novel_plot_end").val(end);
                            scheduleFlowRangePreview($b);
                        } catch (e) {}
                    }, 220);
                });
                $host.on("change.novelPlotBar", "#novel_plot_step", function () {
                    try {
                        var $inp = $(this);
                        var raw = String($inp.val() || "").trim();
                        var step = Math.floor(Number(raw));
                        if (!Number.isFinite(step) || step < 1) return;
                        var $b = $inp.closest("#novel_plot_control_bar");
                        var start = Number($b.find("#novel_plot_start").val());
                        if (!Number.isFinite(start)) start = 1;
                        var end = start + step - 1;
                        if (novelText) {
                            var boundsSt = getChapterNumberBounds(getCachedChapters(novelText));
                            if (boundsSt && boundsSt.max) end = Math.min(end, boundsSt.max);
                        }
                        $b.find("#novel_plot_end").val(end);
                        scheduleFlowRangePreview($b);
                    } catch (e) {}
                });
                $host.on("click.novelPlotBar", "[data-npc-step-target]", function (ev) {
                    ev.preventDefault();
                    try {
                        var sel = String($(this).attr("data-npc-step-target") || "");
                        var delta = Number($(this).attr("data-npc-step-delta")) || 0;
                        if (!sel || !delta) return;
                        var $inp = $(this).closest("#novel_plot_control_bar").find(sel);
                        if (!$inp.length) return;
                        var cur = Number($inp.val());
                        if (!Number.isFinite(cur)) cur = 0;
                        $inp.val(Math.max(0, cur + delta)).trigger("input");
                    } catch (e) {}
                });
                // 拖动滑杆：拖动中只联动输入框/预览/顶栏文字，松手（change）才真正应用
                $host.on("input.novelPlotBar pointerdown.novelPlotBar", "#novel_plot_scrub", function (ev) {
                    try {
                        if (ev.type === "pointerdown") {
                            plotScrubbing = !0;
                            return;
                        }
                        var $inp = $(this);
                        var $b = $inp.closest("#novel_plot_control_bar");
                        var chapters = novelText ? getCachedChapters(novelText) : [];
                        if (!chapters.length) return;
                        plotScrubbing = !0;
                        var bounds = getChapterNumberBounds(chapters);
                        var start = Math.min(Math.max(Number($inp.val()) || bounds.min || 1, bounds.min), bounds.max);
                        var stepVal = Number($b.find("#novel_plot_step").val());
                        var step =
                            Number.isFinite(stepVal) && stepVal >= 1
                                ? Math.floor(stepVal)
                                : Math.max(1, Number(worldBookConfig.autoAdvanceChapterCount) || 5);
                        var end = Math.min(bounds.max, start + step - 1);
                        $b.find("#novel_plot_start").val(start);
                        $b.find("#novel_plot_end").val(end);
                        scheduleFlowRangePreview($b);
                        setNovelPlotStatusText(
                            $b,
                            formatPlotRangeText({ start: start, end: end }) +
                                " / 共 " +
                                bounds.max +
                                " " +
                                getPlotUnitWords().one
                        );
                    } catch (e) {}
                });
                $host.on("change.novelPlotBar blur.novelPlotBar", "#novel_plot_scrub", function () {
                    plotScrubbing = !1;
                });
                $host.on("change.novelPlotBar", "#novel_plot_scrub", function () {
                    if (!plotControlStepBusy) applyCustomPlotRange();
                });
                $host.on("change.novelPlotBar click.novelPlotBar", "#novel_plot_pin_enabled", function () {
                    var nowTs = Date.now();
                    if (hostDoc.__novelPinToggleTs && nowTs - hostDoc.__novelPinToggleTs < 400) return;
                    hostDoc.__novelPinToggleTs = nowTs;
                    if (plotPinnedToggleBusy) return;
                    plotPinnedEnabled = !!$(this).prop("checked");
                    // 开启时展开管理区一次即可，之后尊重用户手势，不再反复写 open
                    var $details = $(this).closest("#novel_plot_control_bar").find("#novel_plot_pin_details");
                    if (plotPinnedEnabled && $details.length && !$details.prop("open")) {
                        $details.prop("open", !0);
                    } else if (!plotPinnedEnabled && $details.length && $details.prop("open")) {
                        // 关掉总闸时收起管理区，避免「开关已关、管理区还开着」的错觉
                        $details.prop("open", !1);
                    }
                    // 本地状态立刻落盘，世界书写操作异步不阻塞 UI
                    savePlotControlBarSettings(!0);
                    // 没有任何钉住章节时不碰世界书（只改本地状态）
                    if (plotPinnedChapterNumbers.length) {
                        setPinnedEntryActive(plotPinnedEnabled, !1);
                    } else {
                        plotPinnedEntryUid = null;
                    }
                    // 轻量刷新：只同步 checkbox，不强制 details
                    try {
                        var $barNow = $(this).closest("#novel_plot_control_bar");
                        $barNow.find("#novel_plot_pin_enabled").prop("checked", !!plotPinnedEnabled);
                        $barNow.find("#novel_plot_pinned_section,.npc_pinned_section").toggleClass("npc_pinned_on", !!plotPinnedEnabled);
                    } catch (eUi) {}
                });
                $host.on("change.novelPlotBar", "input[name='novel_plot_pin_mode']", function () {
                    plotPinnedMode = $(this).val() || "range";
                    savePlotControlBarSettings();
                    // 只切字段 class，避免整栏 refresh 在手机上抖 details
                    try {
                        var $b = $(this).closest("#novel_plot_control_bar");
                        syncPinModeFields($b);
                    } catch (eMode) {}
                    refreshPinnedDraftPreview();
                });
                $host.on("input.novelPlotBar change.novelPlotBar", "#novel_plot_pin_single_input,#novel_plot_pin_range_start,#novel_plot_pin_range_end", function () {
                    refreshPinnedDraftPreview();
                });
                $host.on("keydown.novelPlotBar", "#novel_plot_pin_single_input,#novel_plot_pin_range_start,#novel_plot_pin_range_end", function (ev) {
                    if (ev.key === "Enter") {
                        ev.preventDefault();
                        pinSelectedFromUI();
                    }
                });
                $host.on("change.novelPlotBar", "#novel_plot_pin_position", function () {
                    plotPinnedInsertPosition = $(this).val() || "before_char_def";
                    syncPinnedPositionDepthVisibility();
                    savePlotControlBarSettings();
                });
                $host.on("change.novelPlotBar", "#novel_plot_pin_depth,#novel_plot_pin_order", function () {
                    readPinnedOptionsFromUI();
                    savePlotControlBarSettings();
                });
                $host.on("click.novelPlotBar", "#novel_plot_pin_apply", function (ev) {
                    ev.preventDefault();
                    pinSelectedFromUI();
                });
                $host.on("click.novelPlotBar", "#novel_plot_pinned_read", function (ev) {
                    ev.preventDefault();
                    openPlotReader("pinned");
                });
                $host.on("click.novelPlotBar", "#novel_plot_pin_clear", function (ev) { ev.preventDefault(); clearAllPinned(); });
                $host.on("click.novelPlotBar", "[data-npc-unpin-range]", function (ev) {
                    ev.preventDefault();
                    var raw = String($(this).attr("data-npc-unpin-range") || "");
                    var parts = raw.split("-");
                    unpinChapterRange(parts[0], parts[1] || parts[0]);
                });
                $host.on("click.novelPlotBar", "[data-npc-unpin]", function (ev) {
                    ev.preventDefault();
                    unpinChapter(Number($(this).attr("data-npc-unpin")));
                });
                $host.on("click.novelPlotBar", "#novel_plot_open_panel", function (ev) {
                    ev.preventDefault();
                    try {
                        openNovelImporter(ev);
                    } catch (e) {
                        novelToast("error", "打开导入面板失败");
                    }
                });
                $host.on("click.novelPlotBar", "#novel_plot_read_original", function (ev) {
                    ev.preventDefault();
                    openPlotReader("read");
                });
                $host.on("click.novelPlotBar", "#novel_plot_diff", function (ev) {
                    ev.preventDefault();
                    openPlotReader("diff");
                });
                $host.on("click.novelPlotBar", "#novel_plot_reader_close,#novel_plot_reader_done", function (ev) {
                    ev.preventDefault();
                    closePlotReader();
                });
                $host.on("click.novelPlotBar", "#novel_plot_reader", function (ev) {
                    if (ev.target === this) closePlotReader();
                });
                $host.on("click.novelPlotBar", "[data-npc-rd-tab]", function (ev) {
                    ev.preventDefault();
                    var nextTab = String($(this).attr("data-npc-rd-tab"));
                    plotReaderTab = nextTab === "diff" ? "diff" : nextTab === "pinned" ? "pinned" : "read";
                    renderPlotReader();
                });
                $host.on("change.novelPlotBar", "#novel_plot_reader_chapter", function () {
                    plotReaderChapter = String($(this).val() || "");
                    renderPlotReader();
                });
                $host.on("change.novelPlotBar", "#novel_plot_reader_msg", function () {
                    plotReaderMsgIdx = Number($(this).val());
                    renderPlotReader();
                });
                $host.on("click.novelPlotBar", "#novel_plot_reader_copy", function (ev) {
                    ev.preventDefault();
                    copyPlotReaderText();
                });
                $host.on("keydown.novelPlotBar", function (ev) {
                    if (!ev || ev.key !== "Escape") return;
                    try {
                        if ($(getHostDocument()).find("#" + PLOT_READER_ID + ".open").length) closePlotReader();
                    } catch (eEsc) {}
                });
                } // end __novelPlotBarHandlersBound
                if (plotControlBarEnabled && !isWelcomeOrAssistantContext()) startPlotBarRuntime();
                else stopPlotBarRuntime();
                refreshNovelPlotControlBar();
            } catch (error) {
                console.error("[" + extensionName + "] plot control bar failed", error);
            }
        }
        function setNovelPlotControlBarVisible(visible) {
            plotControlBarEnabled = !!visible;
            plotControlSettingsHydrated = !0;
            writePlotBarEnabledLocal(!!plotControlBarEnabled);
            savePlotControlBarSettings(!0);
            try {
                $("#novel_plot_bar_enabled").prop("checked", !!plotControlBarEnabled);
            } catch (eChk) {}
            if (plotControlBarEnabled && !isWelcomeOrAssistantContext()) {
                ensureNovelPlotControlBar();
                startPlotBarRuntime();
                refreshNovelPlotControlBar();
                hydratePlotStateFromWorldBook({ silent: !0 }).then(function () {
                    try { refreshNovelPlotControlBar(); } catch (e) {}
                    plotHydrateRetryAttempts = 0;
                    schedulePlotHydrateRetry();
                });
            } else {
                stopPlotBarRuntime();
                refreshNovelPlotControlBar();
            }
        }

        
        
        function groupPinnedChapterRanges(numbers) {
            var nums = (Array.isArray(numbers) ? numbers : [])
                .map(function (n) {
                    return Number(n);
                })
                .filter(Number.isFinite)
                .sort(function (a, b) {
                    return a - b;
                });
            var ranges = [];
            for (var i = 0; i < nums.length; ) {
                var start = nums[i],
                    end = start,
                    j = i + 1;
                while (j < nums.length && nums[j] === end + 1) {
                    end = nums[j];
                    j++;
                }
                ranges.push({ start: start, end: end });
                i = j;
            }
            return ranges;
        }
        function formatPinnedRangeLabel(range, unit) {
            unit = unit || "章";
            return range.start === range.end
                ? range.start + unit
                : range.start + "-" + range.end + unit;
        }
        function renderPinnedChipsHtml(numbers) {
            var unit = getPlotUnitWords().one;
            var ranges = groupPinnedChapterRanges(numbers);
            if (!ranges.length) return '<span class="npc_empty">无</span>';
            return ranges
                .map(function (r) {
                    return (
                        '<span class="npc_chip" data-pin-start="' +
                        r.start +
                        '" data-pin-end="' +
                        r.end +
                        '">' +
                        formatPinnedRangeLabel(r, unit) +
                        '<button type="button" data-npc-unpin-range="' +
                        r.start +
                        "-" +
                        r.end +
                        '" title="取消钉住">×</button></span>'
                    );
                })
                .join("");
        }
        async function setPinnedEntryActive(active, silent) {
            if (plotPinnedToggleBusy) return;
            plotPinnedToggleBusy = !0;
            try {
                var worldName = worldBookConfig.worldBookName || getCurrentCharacterWorldBookName();
                if (!worldName) return;
                // 还没有任何钉住章节时，不碰世界书，只改本地状态
                if (!plotPinnedChapterNumbers.length) {
                    plotPinnedEntryUid = null;
                    return;
                }
                var data = await loadNovelWorldBookData(worldName);
                if (!data || !data.entries) return;
                var entries = normalizeWorldBookEntries(data);
                var entry = null;
                if (plotPinnedEntryUid != null && entries[String(plotPinnedEntryUid)])
                    entry = entries[String(plotPinnedEntryUid)];
                if (!entry || !isNovelPinnedEntry(entry)) entry = findNovelPinnedEntry(data);
                if (!entry) {
                    if (active && plotPinnedChapterNumbers.length) {
                        await rebuildPinnedEntry(!!silent);
                        return;
                    }
                    return;
                }
                // 状态没变就跳过写盘
                if (!!entry.disable === !active) {
                    plotPinnedEntryUid = getWorldBookEntryId(entry);
                    return;
                }
                entry.disable = !active;
                if (entry.extensions && entry.extensions.novelChatImporter) {
                    entry.extensions.novelChatImporter.pinnedEnabled = !!active;
                    entry.extensions.novelChatImporter.updatedAt = new Date().toISOString();
                }
                plotPinnedEntryUid = getWorldBookEntryId(entry);
                await saveNovelWorldBookData(worldName, data, { lite: !0 });
                if (!silent)
                    novelToast(
                        "info",
                        active ? "固定条目已启用（世界书常亮注入）" : "固定条目已关闭（世界书条目已变灰停用）"
                    );
            } catch (e) {
                console.error("[" + extensionName + "] setPinnedEntryActive failed", e);
                if (!silent) novelToast("error", "切换固定条目状态失败");
            } finally {
                plotPinnedToggleBusy = !1;
            }
        }
        async function unpinChapterRange(start, end) {
            try {
                start = Number(start);
                end = Number(end);
                if (!Number.isFinite(start)) return;
                if (!Number.isFinite(end)) end = start;
                if (end < start) {
                    var t = start;
                    start = end;
                    end = t;
                }
                plotPinnedChapterNumbers = plotPinnedChapterNumbers.filter(function (n) {
                    n = Number(n);
                    return !(n >= start && n <= end);
                });
                await rebuildPinnedEntry(!1);
            } catch (e) {
                novelToast("error", "取消钉住失败");
            }
        }

        function isCharLikeChapterSplit(chapters) {
            try {
                chapters = Array.isArray(chapters) ? chapters : getCachedChapters(novelText || "");
                if (!chapters || chapters.length < 2) return !1;
                var sample = chapters.slice(0, Math.min(12, chapters.length));
                var titleHits = 0,
                    plainHits = 0,
                    lens = [];
                for (var i = 0; i < sample.length; i++) {
                    var t = String((sample[i] && (sample[i].title || sample[i].volumeTitle)) || "");
                    if (/第?\s*\d+\s*(段|节选|字)/.test(t) || /分段|字数|字符/.test(t)) titleHits++;
                    if (/^第[一二三四五六七八九十百千零\d]+[章节回部卷]/.test(t) || /^第\s*\d+\s*[章节回部卷]/.test(t))
                        plainHits++;
                    lens.push(String((sample[i] && sample[i].content) || "").length);
                }
                if (titleHits >= Math.ceil(sample.length * 0.5)) return !0;
                if (plainHits >= Math.ceil(sample.length * 0.5)) return !1;
                // equal-ish lengths => likely char split fallback
                if (lens.length >= 3) {
                    var avg = lens.reduce(function (a, b) { return a + b; }, 0) / lens.length;
                    var near = lens.filter(function (n) { return Math.abs(n - avg) / Math.max(avg, 1) < 0.25; }).length;
                    if (near >= lens.length - 1 && avg > 200) return !0;
                }
                return !1;
            } catch (e) {
                return !1;
            }
        }
        function getPlotUnitWords() {
            var key = novelText || "";
            if (cachedPlotUnitWords && cachedPlotUnitKey === key) return cachedPlotUnitWords;
            var charLike = isCharLikeChapterSplit();
            cachedPlotUnitKey = key;
            cachedPlotUnitWords = charLike
                ? { one: "段", many: "段", next: "下一段", prev: "上一段", unit: "字数段", stepHint: "上一批/下一段每次移动段数" }
                : { one: "章", many: "章", next: "下一页", prev: "上一批", unit: "章", stepHint: "上一批/下一页每次移动章数" };
            return cachedPlotUnitWords;
        }
        function formatPlotRangeText(range) {
            if (!range) return "0";
            var u = getPlotUnitWords().one;
            return range.start === range.end ? range.start + " " + u : range.start + "–" + range.end + " " + u;
        }
        // 顶栏状态拆成「当前范围 + 总数」两段，总数可以弱化显示
        function setNovelPlotStatusText($bar, statusText) {
            var $status = $bar.find("#novel_plot_sb_status");
            if (!$status.length) return;
            var text = String(statusText == null ? "" : statusText);
            var match = text.match(/^(.*?)\s*\/\s*共\s*(\d+)\s*(.*)$/);
            if (!match) {
                $status.text(text);
                return;
            }
            $status.empty();
            var host = $status[0];
            var main = host.ownerDocument.createElement("span");
            main.className = "npc_range_main";
            main.textContent = match[1];
            var total = host.ownerDocument.createElement("span");
            total.className = "npc_range_total";
            total.textContent = "共 " + match[2] + (match[3] ? " " + match[3] : "");
            host.appendChild(main);
            host.appendChild(total);
        }
        function parsePinnedNumberList(raw) {
            var out = [],
                seen = {};
            String(raw || "")
                .split(/[\s,，;；|、]+/)
                .forEach(function (part) {
                    part = String(part || "").trim();
                    if (!part) return;
                    var m = part.match(/^(\d+)\s*[-~～—–到至]\s*(\d+)$/);
                    if (m) {
                        var a = Number(m[1]),
                            b = Number(m[2]);
                        if (!Number.isFinite(a) || !Number.isFinite(b)) return;
                        if (a > b) {
                            var t = a;
                            a = b;
                            b = t;
                        }
                        for (var n = a; n <= b; n++) {
                            if (!seen[n]) {
                                seen[n] = 1;
                                out.push(n);
                            }
                        }
                        return;
                    }
                    var num = Number(part);
                    if (Number.isFinite(num)) {
                        num = Math.floor(num);
                        if (!seen[num]) {
                            seen[num] = 1;
                            out.push(num);
                        }
                    }
                });
            return out.sort(function (a, b) {
                return a - b;
            });
        }
        function getPinnedDraftNumbersFromUI() {
            var hostDoc = getHostDocument(),
                $ = getHostJQuery(),
                $bar = $(hostDoc).find("#novel_plot_control_bar");
            if (!$bar.length) return [];
            var mode = $bar.find('input[name="novel_plot_pin_mode"]:checked').val() || plotPinnedMode || "range";
            if (mode === "single") return parsePinnedNumberList($bar.find("#novel_plot_pin_single_input").val());
            var chapters = novelText ? getCachedChapters(novelText) : [];
            var bounds = getChapterNumberBounds(chapters);
            var start = parseChapterNumberValue($bar.find("#novel_plot_pin_range_start").val(), bounds.min || 1, 0);
            var end = parseChapterNumberValue($bar.find("#novel_plot_pin_range_end").val(), start, 0);
            if (end < start) {
                var t = start;
                start = end;
                end = t;
            }
            var nums = [];
            for (var n = start; n <= end; n++) nums.push(n);
            return nums;
        }
        function buildPinnedPreviewHtml(numbers) {
            if (!novelText) return '<span class="npc_pinned_empty">请先加载 TXT 小说</span>';
            var chapters = getCachedChapters(novelText);
            if (!chapters.length) return '<span class="npc_pinned_empty">未解析到章节</span>';
            numbers = Array.isArray(numbers) ? numbers : [];
            if (!numbers.length) return '<span class="npc_pinned_empty">输入章号后显示预览</span>';
            var mode = plotPinnedMode || "range";
            try {
                var hostDoc = getHostDocument(),
                    $ = getHostJQuery();
                mode =
                    $(hostDoc).find("#novel_plot_control_bar input[name=\"novel_plot_pin_mode\"]:checked").val() ||
                    mode;
            } catch (e) {}
            var map = {};
            for (var i = 0; i < chapters.length; i++) {
                map[getChapterNumber(chapters[i], i)] = { chapter: chapters[i], index: i };
            }
            var lines = [];
            if (mode === "single") {
                var maxShow = 40;
                for (var si = 0; si < numbers.length && si < maxShow; si++) {
                    var num = numbers[si],
                        hit = map[num];
                    if (hit)
                        lines.push(
                            '<div class="npc_pin_preview_item">#' +
                                num +
                                " " +
                                escapeHtml(getChapterDisplayTitle(hit.chapter, hit.index)) +
                                "</div>"
                        );
                    else lines.push('<div class="npc_pin_preview_item">#' + num + " （未找到）</div>");
                }
                if (numbers.length > maxShow)
                    lines.push(
                        '<div class="npc_pin_preview_more">… 另有 ' + (numbers.length - maxShow) + " 章未展开</div>"
                    );
            } else {
                var first = numbers[0],
                    last = numbers[numbers.length - 1],
                    f = map[first],
                    l = map[last];
                lines.push(
                    '<div class="npc_pin_preview_item">起 #' +
                        first +
                        " " +
                        (f ? escapeHtml(stripPlotTitleNumber(getChapterDisplayTitle(f.chapter, f.index))) : "（未找到）") +
                        "</div>"
                );
                if (last !== first)
                    lines.push(
                        '<div class="npc_pin_preview_item">止 #' +
                            last +
                            " " +
                            (l ? escapeHtml(stripPlotTitleNumber(getChapterDisplayTitle(l.chapter, l.index))) : "（未找到）") +
                            "</div>"
                    );
                lines.push(
                    '<div class="npc_pin_preview_more">共 ' + numbers.length + " " + getPlotUnitWords().one + "</div>"
                );
            }
            return lines.join("");
        }
        function refreshPinnedDraftPreview() {
            try {
                var hostDoc = getHostDocument(),
                    $ = getHostJQuery(),
                    $bar = $(hostDoc).find("#novel_plot_control_bar");
                if (!$bar.length) return;
                var nums = getPinnedDraftNumbersFromUI();
                $bar.find("#novel_plot_pin_preview").html(buildPinnedPreviewHtml(nums));
            } catch (e) {}
        }
        function syncPinnedPositionDepthVisibility() {
            try {
                var hostDoc = getHostDocument(),
                    $ = getHostJQuery(),
                    $bar = $(hostDoc).find("#novel_plot_control_bar");
                if (!$bar.length) return;
                var pos = $bar.find("#novel_plot_pin_position").val() || plotPinnedInsertPosition;
                $bar.find("#novel_plot_pin_depth_wrap").toggleClass("npc_depth_on", isNovelWorldBookDepthPosition(pos)).css("display", isNovelWorldBookDepthPosition(pos) ? "flex" : "none");
            } catch (e) {}
        }
        function readPinnedOptionsFromUI() {
            try {
                var hostDoc = getHostDocument(),
                    $ = getHostJQuery(),
                    $bar = $(hostDoc).find("#novel_plot_control_bar");
                if (!$bar.length) return;
                plotPinnedEnabled = !!$bar.find("#novel_plot_pin_enabled").prop("checked");
                plotPinnedMode = $bar.find('input[name="novel_plot_pin_mode"]:checked').val() || "range";
                plotPinnedInsertPosition = $bar.find("#novel_plot_pin_position").val() || "before_char_def";
                plotPinnedDepth = Math.max(1, Number($bar.find("#novel_plot_pin_depth").val()) || 5);
                plotPinnedOrder = Math.max(0, Number($bar.find("#novel_plot_pin_order").val()) || 100);
            } catch (e) {}
        }

        function isNovelPinnedEntry(entry) {
            return entry && entry.extensions && entry.extensions.novelChatImporter && entry.extensions.novelChatImporter.pinned === !0;
        }
        function isNovelMainEntry(entry) {
            return entry && entry.extensions && entry.extensions.novelChatImporter && !entry.extensions.novelChatImporter.pinned;
        }
        function findNovelPinnedEntry(data) {
            var entries = normalizeWorldBookEntries(data);
            for (var values = Object.values(entries), i = 0; i < values.length; i++)
                if (isNovelPinnedEntry(values[i])) return values[i];
            return null;
        }
        function getPinnedChapterItems(chapters) {
            var items = [];
            if (!Array.isArray(chapters) || !chapters.length) return items;
            var pinned = Array.isArray(plotPinnedChapterNumbers) ? plotPinnedChapterNumbers : [];
            if (!pinned.length) return items;
            for (var i = 0; i < chapters.length; i++) {
                var num = getChapterNumber(chapters[i], i);
                if (pinned.indexOf(num) >= 0 && !shouldExcludeChapter(chapters[i], i))
                    items.push({ index: i, number: num, chapter: chapters[i] });
            }
            return items.sort(function (a, b) { return a.number - b.number; });
        }
        function buildPinnedChapterPreviewHtml() {
            if (!novelText) return "";
            var items = getPinnedChapterItems(getCachedChapters(novelText));
            if (!items.length) return "";
            return items
                .map(function (item) {
                    var title = getChapterDisplayTitle(item.chapter, item.index),
                        content = String(item.chapter.content || "");
                    return (
                        '<details class="novel_collapse_item">' +
                        '<summary><span><b>' +
                        item.number +
                        ". " +
                        escapeHtml(title) +
                        '</b></span><span class="novel_chapter_meta">' +
                        content.length.toLocaleString() +
                        ' 字</span></summary>' +
                        '<div class="novel_collapse_content"><div class="novel_text_wrap novel_text_preview">' +
                        splitSummaryText(content, 800) +
                        "</div></div></details>"
                    );
                })
                .join("");
        }
        function buildPinnedContent() {
            if (!novelText) return "";
            var items = getPinnedChapterItems(getCachedChapters(novelText));
            if (!items.length) return "";
            return buildNovelWorldBookContentFromItems(items, worldBookConfig.contentPrefix, worldBookConfig.contentSuffix);
        }
        function applyNovelPinnedEntrySettings(entry, content) {
            var pos = plotPinnedInsertPosition || worldBookConfig.insertPosition || "before_char_def";
            var mapped = getNovelWorldBookPositionMapping(pos);
            var wrap = getContentWrapperTexts(worldBookConfig.contentPrefix, worldBookConfig.contentSuffix);
            entry.comment = "Novel Chat Importer 固定章节";
            entry.content = content;
            entry.constant = !0;
            entry.selective = !1;
            entry.key = [];
            entry.keysecondary = [];
            entry.addMemo = !0;
            entry.order = Number(plotPinnedOrder) || Number(worldBookConfig.order) || 100;
            entry.position = mapped.position;
            entry.depth = Number(plotPinnedDepth) || Number(worldBookConfig.depth) || 5;
            entry.role = mapped.role;
entry.excludeRecursion = !1 !== worldBookConfig.excludeRecursion;
            entry.preventRecursion = !1 !== worldBookConfig.preventRecursion;
            entry.disable = !plotPinnedEnabled;
            entry.extensions = entry.extensions || {};
            entry.extensions.novelChatImporter = {
                version: 1, updatedAt: new Date().toISOString(), persistent: !0, pinned: !0,
                pinnedEnabled: !!plotPinnedEnabled,
                pinnedChapters: plotPinnedChapterNumbers.slice(),
                insertPosition: plotPinnedInsertPosition || "before_char_def",
                depth: Number(plotPinnedDepth) || 5,
                order: Number(plotPinnedOrder) || 100,
                contentHash: hashNovelWorldBookContent(content),
                wrapperHead: wrap.head,
                wrapperTail: wrap.tail
            };
        }
        function createNovelPinnedEntry(data, content) {
            var uid = getNextWorldBookUid(data);
            var entry = createBlankNovelWorldBookEntry(data);
            entry.uid = uid;
            void 0 !== entry.id && (entry.id = uid);
            applyNovelPinnedEntrySettings(entry, content);
            data.entries[String(uid)] = entry;
            return entry;
        }
        // —— 只换包裹、不动章节正文 ——
        // 条目正文里除了包裹文字，还有脚本生成的部分；用户手改过的条目绝不能在这里被覆盖，
        // 所以只有「能认出旧包裹」的条目才允许剥壳重包，认不出就跳过。
        function getEntryWrapperMeta(entry) {
            var meta = (entry && entry.extensions && entry.extensions.novelChatImporter) || {};
            return {
                meta: meta,
                head: "wrapperHead" in meta ? String(meta.wrapperHead ?? "") : null,
                tail: "wrapperTail" in meta ? String(meta.wrapperTail ?? "") : null
            };
        }
        function stripKnownWrapper(content, head, tail) {
            content = String(content || "");
            var headOk = !head || content.indexOf(head) === 0;
            var tailOk = !tail || (content.length >= tail.length && content.lastIndexOf(tail) === content.length - tail.length);
            if (!headOk || !tailOk) return null;
            var inner = content;
            if (head) inner = inner.slice(head.length);
            if (tail) inner = inner.slice(0, inner.length - tail.length);
            return inner;
        }
        function resolveEntryPayload(entry) {
            var info = getEntryWrapperMeta(entry);
            var content = String((entry && entry.content) || "");
            if (!content.trim()) return null;
            var candidates = [];
            // meta 里记的包裹是「上次真正写进条目的那份」，最可信；即使为空也认（表示当时没加包裹）
            if (info.head !== null || info.tail !== null)
                candidates.push({ head: info.head || "", tail: info.tail || "", trusted: !0 });
            var cur = getContentWrapperTexts(worldBookConfig.contentPrefix, worldBookConfig.contentSuffix);
            candidates.push({ head: cur.head, tail: cur.tail, trusted: !1 });
            var dflt = getContentWrapperTexts("<小说原文>", "</小说原文>");
            candidates.push({ head: dflt.head, tail: dflt.tail, trusted: !1 });
            for (var i = 0; i < candidates.length; i++) {
                if (!candidates[i].trusted && !candidates[i].head && !candidates[i].tail) continue;
                var inner = stripKnownWrapper(content, candidates[i].head, candidates[i].tail);
                if (inner !== null) return inner;
            }
            return null;
        }
        // 主条目/固定条目：把当前前置/后置文字套到已有正文上，章节内容一个字都不改
        async function resyncEntryWrapper(silent) {
            try {
                var worldName = worldBookConfig.worldBookName || getCurrentCharacterWorldBookName();
                if (!worldName) return !1;
                var data = await loadNovelWorldBookData(worldName);
                if (!data || !data.entries) return !1;
                normalizeWorldBookEntries(data);
                var wrap = getContentWrapperTexts(worldBookConfig.contentPrefix, worldBookConfig.contentSuffix);
                var targets = [findNovelWorldBookEntry(data), findNovelPinnedEntry(data)];
                var changed = 0;
                for (var i = 0; i < targets.length; i++) {
                    var entry = targets[i];
                    if (!entry) continue;
                    var inner = resolveEntryPayload(entry);
                    if (inner === null) continue;
                    var next = wrap.head + inner + wrap.tail;
                    if (String(entry.content || "") === next) continue;
                    entry.content = next;
                    entry.extensions = entry.extensions || {};
                    var meta = entry.extensions.novelChatImporter || (entry.extensions.novelChatImporter = {});
                    meta.wrapperHead = wrap.head;
                    meta.wrapperTail = wrap.tail;
                    meta.contentHash = hashNovelWorldBookContent(next);
                    meta.updatedAt = new Date().toISOString();
                    if (i === 0) worldBookConfig.lastSyncedHash = meta.contentHash;
                    changed++;
                }
                if (!changed) return !1;
                await saveNovelWorldBookData(worldName, data, { lite: !0 });
                saveWorldBookConfig();
                refreshNovelPlotControlBar();
                if (!silent) novelToast("success", "已把新的包裹文字同步到世界书条目");
                return !0;
            } catch (e) {
                console.error("[" + extensionName + "] resync entry wrapper failed", e);
                if (!silent) novelToast("error", "同步包裹文字失败，请查看控制台");
                return !1;
            }
        }
        // 启动自检：条目还是脚本写的那份（哈希没变）、只是包裹设置变了，就自动套用新包裹；
        // 哈希对不上说明被人手改过，绝不自动动它。
        function shouldResyncEntryWrapper(entry) {
            try {
                if (!entry) return !1;
                var info = getEntryWrapperMeta(entry);
                if (info.head === null && info.tail === null) return !1;
                var storedHash = info.meta.contentHash || "";
                if (!storedHash) return !1;
                if (hashNovelWorldBookContent(entry.content || "") !== storedHash) return !1;
                var wrap = getContentWrapperTexts(worldBookConfig.contentPrefix, worldBookConfig.contentSuffix);
                return String(info.head ?? "") !== wrap.head || String(info.tail ?? "") !== wrap.tail;
            } catch (e) {
                return !1;
            }
        }
        function scheduleEntryWrapperSync(immediate) {
            clearTimeout(entryWrapperSyncTimer);
            entryWrapperSyncTimer = setTimeout(
                function () {
                    entryWrapperSyncTimer = null;
                    resyncEntryWrapper(!0);
                },
                immediate ? 0 : 700
            );
        }
        // —— 重启后自动从 IndexedDB 缓存恢复 TXT ——
        // novelText 只在页面内存里，刷新/重开浏览器就没了；但导入时正文已存进缓存，
        // 这里按世界书里记录的 novelName 找回同一本书，避免用户每次都要重新选 TXT 文件。
        function findNovelCacheEntryByName(name) {
            var wanted = String(name || "").trim();
            if (!wanted) return Promise.resolve(null);
            return listNovelCacheEntries().then(function (rows) {
                rows = Array.isArray(rows) ? rows : [];
                var i;
                for (i = 0; i < rows.length; i++)
                    if (String(rows[i].id) === wanted || String(rows[i].name) === wanted) return rows[i];
                var lower = wanted.toLowerCase();
                for (i = 0; i < rows.length; i++)
                    if (
                        String(rows[i].id || "").toLowerCase() === lower ||
                        String(rows[i].name || "").toLowerCase() === lower
                    )
                        return rows[i];
                return null;
            });
        }
        async function autoRestoreNovelTextFromCache(preferredName) {
            if (novelText || novelAutoRestoreBusy) return !1;
            var name = String(preferredName || "").trim();
            if (!name) return !1;
            novelAutoRestoreBusy = !0;
            try {
                var row = await findNovelCacheEntryByName(name);
                if (!row || novelText) return !1;
                var text = await getNovelCacheText(row.id);
                if (!text || novelText) return !1;
                applyLoadedNovelText(text, row.name || row.id, { autoRestore: !0 });
                return !0;
            } catch (e) {
                return !1;
            } finally {
                novelAutoRestoreBusy = !1;
            }
        }
        async function rebuildPinnedEntry(silent) {
            if (plotPinnedBusy) return;
            try {
                plotPinnedBusy = !0;
                if (!(await ensureNovelTextForPlotAction(silent))) return;
                var worldName = worldBookConfig.worldBookName || getCurrentCharacterWorldBookName();
                if (!worldName) { if (!silent) novelToast("error", "\u5f53\u524d\u89d2\u8272/\u804a\u5929\u6ca1\u6709\u7ed1\u5b9a\u4e16\u754c\u4e66"); return; }
                var items = getPinnedChapterItems(getCachedChapters(novelText));
                var data = await loadNovelWorldBookData(worldName);
                if (!data) data = { entries: {} };
                if (!data.entries) data.entries = {};
                normalizeWorldBookEntries(data);
                if (!items.length) {
                    var existing = findNovelPinnedEntry(data);
                    if (existing) { var uid = getWorldBookEntryId(existing); delete data.entries[String(uid)]; await saveNovelWorldBookData(worldName, data); }
                    plotPinnedEntryUid = null;
                    savePlotControlBarSettings();
                    refreshNovelPlotControlBar();
                    if (!silent) novelToast("info", "\u56fa\u5b9a\u7ae0\u8282\u5df2\u6e05\u7a7a");
                    return;
                }
                var content = buildPinnedContent();
                if (!content.trim()) { if (!silent) novelToast("warning", "\u56fa\u5b9a\u7ae0\u8282\u6ca1\u6709\u53ef\u6ce8\u5165\u5185\u5bb9"); return; }
                var entry = findNovelPinnedEntry(data);
                if (entry) applyNovelPinnedEntrySettings(entry, content);
                else entry = createNovelPinnedEntry(data, content);
                entry.disable = !plotPinnedEnabled;
                if (entry.extensions && entry.extensions.novelChatImporter)
                    entry.extensions.novelChatImporter.pinnedEnabled = !!plotPinnedEnabled;
                plotPinnedEntryUid = getWorldBookEntryId(entry);
                await saveNovelWorldBookData(worldName, data);
                savePlotControlBarSettings();
                refreshNovelPlotControlBar();
                if (!silent) novelToast("success", "\u5df2\u56fa\u5b9a " + items.length + " \u7ae0\uff08\u4e0d\u88ab\u4e0b\u4e00\u9875\u8986\u76d6\uff09");
            } catch (error) {
                console.error("[" + extensionName + "] rebuild pinned failed", error);
                if (!silent) novelToast("error", "\u56fa\u5b9a\u7ae0\u8282\u66f4\u65b0\u5931\u8d25");
            } finally { plotPinnedBusy = !1; }
        }
        
        async function pinSelectedFromUI() {
            try {
                if (!(await ensureNovelTextForPlotAction())) return;
                readPinnedOptionsFromUI();
                if (!plotPinnedEnabled) {
                    plotPinnedEnabled = !0;
                }
                var nums = getPinnedDraftNumbersFromUI();
                if (!nums.length) return void novelToast("error", "请先填写要钉住的章号");
                var chapters = getCachedChapters(novelText);
                var chapterNumbers = new Set();
                for (var j = 0; j < chapters.length; j++) chapterNumbers.add(getChapterNumber(chapters[j], j));
                var valid = [];
                for (var i = 0; i < nums.length; i++) {
                    if (chapterNumbers.has(nums[i])) valid.push(nums[i]);
                }
                if (!valid.length) return void novelToast("warning", "没有匹配到可钉住的章节");
                // set as union
                valid.forEach(function (n) {
                    if (plotPinnedChapterNumbers.indexOf(n) < 0) plotPinnedChapterNumbers.push(n);
                });
                plotPinnedChapterNumbers.sort(function (a, b) {
                    return a - b;
                });
                await rebuildPinnedEntry(!1);
            } catch (e) {
                console.error(e);
                novelToast("error", "钉住所选失败");
            }
        }

        async function unpinChapter(number) {
            try {
                var idx = plotPinnedChapterNumbers.indexOf(Number(number));
                if (idx < 0) return;
                plotPinnedChapterNumbers.splice(idx, 1);
                await rebuildPinnedEntry(!1);
            } catch (e) { novelToast("error", "\u53d6\u6d88\u9489\u4f4f\u5931\u8d25"); }
        }
        async function clearAllPinned() {
            try {
                if (!plotPinnedChapterNumbers.length) return;
                if (!confirm("\u786e\u5b9a\u6e05\u7a7a\u6240\u4f4f\u56fa\u5b9a\u7ae0\u8282\u5417\uff1f")) return;
                plotPinnedChapterNumbers = [];
                await rebuildPinnedEntry(!1);
            } catch (e) { novelToast("error", "\u6e05\u7a7a\u56fa\u5b9a\u5931\u8d25"); }
        }function createUI() {
            if ((syncNovelImporterResponsiveMode(), !$("#novel_importer_container").length)) {
                ((function () {
                    let host = $("#novel_importer_host");
                    return (
                        host.length ||
                            ($("body").append('<div id="novel_importer_host" style="display:none;"></div>'),
                            (host = $("#novel_importer_host"))),
                        host
                    );
                })().append(
                    '\n\n<div id="novel_importer_container" class="extension_settings">\n<div class="flex-container flexFlowColumn">\n\x3c!-- Mode Switch --\x3e\n<div class="novel_mode_switch" style="display:flex;gap:6px;margin-bottom:8px;padding:5px;border-radius:6px;background:rgba(255,255,255,0.04);">\n<label class="menu_button" style="flex:1;text-align:center;cursor:pointer;">\n<input type="radio" name="novel_mode" value="import" checked style="display:none;" />\n普通导入\n</label>\n<label class="menu_button" style="flex:1;text-align:center;cursor:pointer;">\n<input type="radio" name="novel_mode" value="worldbook" style="display:none;" />\n世界书注入\n</label>\n</div>\n\x3c!-- Import mode controls --\x3e\n<div class="novel_import_mode_section">\n<div class="novel_file_row" style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">\n<input type="file" id="novel_txt_file" accept=".txt" style="display:none;" />\n<label for="novel_txt_file" class="menu_button">选择 TXT 小说</label>\n<button id="novel_cache_btn" class="menu_button" type="button" title="查看已缓存的小说">缓存</button>\n</div>\n<label>TXT 编码</label>\n<select id="novel_file_encoding" class="text_pole">\n<option value="auto" selected>自动检测</option>\n<option value="utf-8">UTF-8</option>\n<option value="gb18030">GBK / GB18030</option>\n</select>\n<div class="novel_button_row">\n<button id="novel_clear_btn" class="menu_button">清空小说</button>\n</div>\n<div id="novel_stats_row" class="novel_stats_row">\n<div id="novel_stats" class="wide100p">\n字符数: 0<br>\n章节: 0<br>\n预计导入楼层: 0\n</div>\n<div class="novel_import_action">\n<button id="novel_import_btn" class="menu_button">导入小说内容</button>\n<div id="novel_import_progress" class="novel_import_progress"></div>\n</div>\n</div>\n<details class="novel_panel novel_section_group novel_import_mode_section" open>\n<summary><b>导入设置</b></summary>\n<div class="novel_section_body">\n<div class="novel_section_title">角色模式</div>\n<select id="novel_role_mode" class="text_pole">\n<option value="assistant">AI消息</option>\n<option value="user">用户消息</option>\n<option value="alternate_ai">AI / 用户交替（AI先发）</option>\n<option value="alternate_user">AI / 用户交替（用户先发）</option>\n</select>\n<label class="checkbox_label">\n<input type="checkbox" id="novel_one_chapter_per_message" />\n一章一楼\n</label>\n<div id="novel_by_length_options" class="novel_import_mode_section">\n<label>每楼字数</label>\n<input class="text_pole" type="number" id="novel_chunk_size" value="1200" min="100" step="100" />\n</div>\n<div id="novel_import_range_options" class="novel_import_mode_section">\n<div class="novel_section_title">导入范围</div>\n<select id="novel_import_range_mode" class="text_pole">\n<option value="all">全部导入</option>\n<option value="chapter">按章节范围</option>\n<option value="floor">按楼层范围</option>\n</select>\n</div>\n<div id="novel_chapter_range_wrap" class="novel_range_wrap novel_import_mode_section">\n<label>章节范围</label>\n<div class="novel_range_row">\n<input class="text_pole" type="number" id="novel_import_chapter_start" min="0" value="1" placeholder="起始章" />\n<input class="text_pole" type="number" id="novel_import_chapter_end" min="0" value="1" placeholder="结束章" />\n</div>\n</div>\n<div id="novel_floor_range_wrap" class="novel_range_wrap novel_import_mode_section">\n<label>楼层范围</label>\n<div class="novel_range_row">\n<input class="text_pole" type="number" id="novel_import_floor_start" min="1" value="1" placeholder="起始楼" />\n<input class="text_pole" type="number" id="novel_import_floor_end" min="1" value="1" placeholder="结束楼" />\n</div>\n</div>\n</div>\n</details>\n</div>\n\x3c!-- World Book section --\x3e\n<div class="novel_worldbook_section" style="display:none;">\n<details class="novel_panel" open>\n<summary><b>章节选择</b></summary>\n<div id="novel_wb_chapter_list" class="novel_section_body">\n<div class="novel_empty_hint">请先选择 TXT 文件</div>\n</div>\n</details>\n<details class="novel_panel" open>\n<summary><b>注入配置</b></summary>\n<div class="novel_section_body">\n<div class="novel_section_title">插入位置</div>\n<select id="novel_wb_position" class="text_pole">\n<option value="before_char_def">角色定义前 (↑ Char)</option>\n<option value="after_char_def">角色定义后 (↓ Char)</option>\n<option value="before_example_mes">示例消息前 (↑ EM)</option>\n<option value="after_example_mes">示例消息后 (↓ EM)</option>\n<option value="before_authors_note">作者注释前 (↑ AN)</option>\n<option value="after_authors_note">作者注释后 (↓ AN)</option>\n<option value="system_depth">[系统] 插入深度 @D</option>\n<option value="user_depth">[用户 1] 插入深度 @D</option>\n<option value="assistant_depth">[AI 1] 插入深度 @D</option>\n</select>\n<div class="novel_align_start" style="display:flex;gap:8px;margin-top:8px;">\n<div style="flex:1;display:none;" id="novel_wb_depth_label">\n<div class="novel_section_title">深度 @D</div>\n<input id="novel_wb_depth" class="text_pole" type="number" min="1" value="5" style="display:none;" />\n</div>\n<div style="flex:1;">\n<div class="novel_section_title">顺序 / Order</div>\n<input id="novel_wb_order" class="text_pole" type="number" min="0" value="100" />\n<div class="novel_empty_hint" style="padding:2px 0;font-size:0.82em;">用于支持顺序字段的酒馆提示管理器；手动注入时会写入消息 metadata。</div>\n</div>\n</div>\n<div style="display:flex;gap:8px;margin-top:8px;">\n<div style="flex:1;">\n<div class="novel_section_title">前置文字</div>\n<input id="novel_wb_content_prefix" class="text_pole" type="text" placeholder="&lt;小说原文&gt;" />\n</div>\n<div style="flex:1;">\n<div class="novel_section_title">后置文字</div>\n<input id="novel_wb_content_suffix" class="text_pole" type="text" placeholder="&lt;/小说原文&gt;" />\n</div>\n</div>\n<div class="novel_wb_persist_toggle" style="display:flex;gap:8px;margin-top:8px;padding:6px 8px;border-radius:6px;background:rgba(255,255,255,0.04);align-items:center;">\n<span style="opacity:0.8;font-size:0.9em;">注入方式:</span>\n<label class="menu_button" style="flex:1;text-align:center;cursor:pointer;font-size:0.9em;">\n<input type="radio" name="novel_wb_persist" value="once" checked style="display:none;" />\n只持续一次\n</label>\n<label class="menu_button" style="flex:1;text-align:center;cursor:pointer;font-size:0.9em;">\n<input type="radio" name="novel_wb_persist" value="always" style="display:none;" />\n一直持续\n</label>\n</div>\n<div id="novel_wb_persist_status" style="font-size:0.85em;opacity:0.7;margin-top:4px;padding:0 8px;">注入方式: 只持续一次</div>\n<div id="novel_wb_entry_status" class="novel_replace_stats" style="margin-top:8px;">尚未准备注入条目</div>\n<div class="novel_button_row" style="margin-top:8px;">\n<button id="novel_wb_prepare" class="menu_button">准备注入</button>\n<button id="novel_wb_update" class="menu_button" style="display:none;">更新注入内容</button>\n<button id="novel_wb_clear" class="menu_button danger_button">清空并关闭</button>\n<button id="novel_wb_delete" class="menu_button danger_button">删除条目</button>\n<button id="novel_wb_save" class="menu_button">保存配置</button>\n</div>\n</div>\n</details>\n</div>\n\x3c!-- Search & Replace --\x3e\n<details class="novel_panel novel_section_group">\n<summary><b>搜索替换</b></summary>\n<div class="novel_section_body">\n<div class="novel_search_row">\n<input id="novel_search_keyword" class="text_pole" type="text" placeholder="输入关键词搜索" />\n<button id="novel_search_btn" class="menu_button">搜索</button>\n<button id="novel_replace_btn" class="menu_button">替换</button>\n<button id="novel_batch_replace_btn" class="menu_button">批量替换</button>\n</div>\n<label class="checkbox_label">\n<input type="checkbox" id="novel_search_case_sensitive" />\n搜索时区分大小写\n</label>\n<label class="checkbox_label">\n<input type="checkbox" id="novel_only_hit_items" />\n只显示命中章节/楼层\n</label>\n<div id="novel_search_results" class="wide100p">\n<div class="novel_empty_hint">输入关键词后搜索</div>\n</div>\n</div>\n</details>\n<details id="novel_chapter_panel" class="novel_panel" open>\n<summary><b>章节预览</b></summary>\n<div id="novel_chapter_preview" class="wide100p">\n<div class="novel_empty_hint">暂无章节</div>\n</div>\n</details>\n<details id="novel_floor_panel" class="novel_panel novel_import_mode_section">\n<summary><b>楼层预览</b></summary>\n<div id="novel_floor_preview" class="wide100p">\n<div class="novel_empty_hint">暂无楼层</div>\n</div>\n</details>\n</div>\n</div>\n'
                ),
                    ($ui.container = $("#novel_importer_container")),
                    ($ui.fileInput = $("#novel_txt_file")),
                    ($ui.fileEncoding = $("#novel_file_encoding")),
                    ($ui.stats = $("#novel_stats")),
                    ($ui.searchKeyword = $("#novel_search_keyword")),
                    ($ui.searchResults = $("#novel_search_results")),
                    ($ui.importRangeMode = $("#novel_import_range_mode")),
                    ($ui.chapterRangeWrap = $("#novel_chapter_range_wrap")),
                    ($ui.byLengthOptions = $("#novel_by_length_options")),
                    ($ui.importRangeOptions = $("#novel_import_range_options")),
                    ($ui.floorRangeWrap = $("#novel_floor_range_wrap")),
                    ($ui.chapterStart = $("#novel_import_chapter_start")),
                    ($ui.chapterEnd = $("#novel_import_chapter_end")),
                    ($ui.floorStart = $("#novel_import_floor_start")),
                    ($ui.floorEnd = $("#novel_import_floor_end")),
                    ($ui.oneChapter = $("#novel_one_chapter_per_message")),
                    ($ui.chunkSize = $("#novel_chunk_size")),
                    ($ui.roleMode = $("#novel_role_mode")),
                    ($ui.importBtn = $("#novel_import_btn")),
                    ($ui.importProgress = $("#novel_import_progress")),
                    ($ui.chapterPreview = $("#novel_chapter_preview")),
                    ($ui.chapterPanel = $("#novel_chapter_panel")),
                    ($ui.floorPreview = $("#novel_floor_preview")),
                    ($ui.floorPanel = $("#novel_floor_panel")),
                    ($ui.searchCaseSensitive = $("#novel_search_case_sensitive")),
                    ($ui.onlyHitItems = $("#novel_only_hit_items")),
                    // 替换弹窗的标记与接线只在 ensure*ReplaceModal 里写一份，
                    // 这里只负责建出来；早先两边各写一份，按钮的 type 已经走样过
                    ensureSingleReplaceModal(),
                    ensureBatchReplaceModal(),
                    ensureNovelImporterExtendedUI(),
                    updateRangeVisibility(),
                    forceNovelImporterMobileLayout(),
                    fixNovelImporterButtonLayout(),
                    $ui.fileInput.on("change", async function (e) {
                        var file = e.target.files[0];
                        if (!file) return;
                        try {
                            var text = await readNovelTextFromFile(file),
                                name = file.name || novelFileName || "";
                            (applyLoadedNovelText(text, name, {}),
                                // 读完就缓存，重启酒馆后可以从「缓存」按钮里载回来
                                saveNovelTextToCache(name, text),
                                // 清空 input，否则再次选同一个文件不会触发 change，无法重新读取
                                $ui.fileInput.val(""));
                        } catch (error) {
                            (console.error(`[${extensionName}] Failed to read TXT`, error),
                                novelToast("error", "TXT 读取失败，请检查文件或切换编码"));
                        }
                    }),
                    $ui.importBtn.on("click", performImport),
                    $("#novel_search_btn").on("click", updateSearchResults));
                var searchTimer = null;
                ($ui.searchKeyword.on("input", function () {
                    (clearTimeout(searchTimer), (searchTimer = setTimeout(updateSearchResults, 300)));
                }),
                    $ui.searchKeyword.on("keydown", function (e) {
                        "Enter" === e.key && (clearTimeout(searchTimer), updateSearchResults());
                    }),
                    $(document).on("click.novelReplace", "#novel_replace_btn", openSingleReplaceModal),
                    $(document).on("click.novelReplace", "#novel_batch_replace_btn", openBatchReplaceModal),
                    $(document).on("click.novelReplace", "#novel_replace_apply", applySingleReplace),
                    $(document).on("click.novelReplace", "#novel_batch_replace_apply", applyBatchReplace),
                    (function(){
                        var doc = (window.parent && window.parent.document) || (window.top && window.top.document) || document;
                        var $doc = $(doc);
                        $doc.on("click.novelReplace", "#novel_replace_btn", openSingleReplaceModal);
                        $doc.on("click.novelReplace", "#novel_batch_replace_btn", openBatchReplaceModal);
                        $doc.on("click.novelReplace", "#novel_replace_apply", applySingleReplace);
                        $doc.on("click.novelReplace", "#novel_batch_replace_apply", applyBatchReplace);
                    })(),
                    $("#novel_clear_btn").on("click", clearNovel),
                    // 「缓存」按钮在三种外壳里是同一份 DOM，面板/弹窗可能挂在宿主文档，所以本窗口与宿主各绑一次委托
                    (function () {
                        var docs = [document];
                        try {
                            window.parent &&
                                window.parent.document &&
                                docs.indexOf(window.parent.document) < 0 &&
                                docs.push(window.parent.document);
                        } catch (e) {}
                        try {
                            window.top &&
                                window.top.document &&
                                docs.indexOf(window.top.document) < 0 &&
                                docs.push(window.top.document);
                        } catch (e2) {}
                        docs.forEach(function (doc) {
                            // 先 off 再 on：重复绑定会让一次点击弹两次窗
                            $(doc)
                                .off("click.novelCache", "#novel_cache_btn")
                                .on("click.novelCache", "#novel_cache_btn", openNovelCacheModal);
                        });
                    })(),
                    refreshNovelCacheButton(),
                    $ui.oneChapter.on("change", () => {
                        ((floorPreviewLimit = 20),
                            invalidateCache(),
                            updateRangeVisibility(),
                            updateStats(),
                            updateRangeInputs(),
                            updateFloorPreview());
                    }),
                    $ui.chunkSize.on("input", () => {
                        ((floorPreviewLimit = 20),
                            invalidateCache(),
                            updateStats(),
                            updateRangeInputs(),
                            updateFloorPreview());
                    }),
                    $ui.importRangeMode.on("change", updateRangeVisibility),
                    $ui.chapterStart.add($ui.chapterEnd).add($ui.floorStart).add($ui.floorEnd).on("blur", () => {
                        (normalizeImportRangeInputs(!0), updateRangeInputs());
                    }),
                    $ui.chapterPanel.on("toggle", () => {
                        (isPanelOpen($ui.chapterPanel) && updateChapterPreview(),
                            setTimeout(fixNovelImporterButtonLayout, 0));
                    }),
                    $ui.floorPanel.on("toggle", () => {
                        (isPanelOpen($ui.floorPanel) && updateFloorPreview(),
                            setTimeout(fixNovelImporterButtonLayout, 0));
                    }),
                    $ui.searchCaseSensitive.on("change", () => {
                        ($ui.searchKeyword.val() || "").trim()
                            ? updateSearchResults()
                            : (updateChapterPreview(), updateFloorPreview());
                    }),
                    $ui.onlyHitItems.on("change", () => {
                        (updateChapterPreview(),
                            updateFloorPreview(),
                            ($ui.searchKeyword.val() || "").trim() && updateSearchResults());
                    }),
                    $ui.fileEncoding.on("change", () => {
                        novelToast("info", "编码已切换，下次读取文件时生效");
                    }),
                    $('input[name="novel_mode"]').on("change", function () {
                        (switchNovelMode($(this).val()),
                            $('input[name="novel_mode"]').each(function () {
                                $(this)
                                    .closest("label")
                                    .toggleClass("novel_tab_active", $(this).prop("checked"));
                            }));
                    }),
                    $("#novel_wb_position").on("change", function () {
                        ((worldBookConfig.insertPosition = $(this).val()),
                            (worldBookLastInjected = null),
                            markWorldBookContentDirty("插入位置已改变，按“更新注入内容”同步到世界书条目"));
                        var isDepth = isNovelWorldBookDepthPosition($(this).val());
                        ($("#novel_wb_depth").toggle(isDepth),
                            $("#novel_wb_depth_label").toggle(isDepth),
                            saveWorldBookConfig());
                    }),
                    $("#novel_wb_depth").on("input", function () {
                        var v = parseInt($(this).val(), 10);
                        (!isNaN(v) &&
                            v > 0 &&
                            ((worldBookConfig.depth = v),
                            (worldBookLastInjected = null),
                            markWorldBookContentDirty("深度已改变，按“更新注入内容”同步到世界书条目")),
                            saveWorldBookConfig());
                    }),
                    $("#novel_wb_order").on("input", function () {
                        var v = parseInt($(this).val(), 10);
                        (!isNaN(v) &&
                            v >= 0 &&
                            ((worldBookConfig.order = v),
                            (worldBookLastInjected = null),
                            markWorldBookContentDirty("顺序已改变，按“更新注入内容”同步到世界书条目")),
                            saveWorldBookConfig());
                    }),
                    $("#novel_wb_content_prefix,#novel_wb_content_suffix").on("input change", function () {
                        ((worldBookConfig.contentPrefix = String($("#novel_wb_content_prefix").val() ?? "")),
                            (worldBookConfig.contentSuffix = String(
                                $("#novel_wb_content_suffix").val() ?? ""
                            )),
                            (worldBookLastInjected = null),
                            markWorldBookContentDirty("包裹文字已改变，正在同步到世界书条目"),
                            saveWorldBookConfig(),
                            // 已有条目时自动只换包裹、不动章节，改完就生效（防抖避免每敲一个字都写盘）
                            scheduleEntryWrapperSync(!1));
                    }),
                    $('input[name="novel_wb_persist"]').on("change", function () {
                        ((worldBookConfig.persistent = "always" === $(this).val()),
                            (worldBookConfig.onceArmed = !1),
                            (worldBookOnceArmedAt = 0),
                            unregisterWorldBookEvents(),
                            (worldBookLastInjected = null),
                            markWorldBookContentDirty("注入方式已改变，按“更新注入内容”同步到世界书条目"),
                            $("#novel_wb_persist_status").text(
                                "注入方式: " + ("always" === $(this).val() ? "一直持续" : "只持续一次")
                            ),
                            saveWorldBookConfig());
                    }),
                    $("#novel_wb_prepare").on("click", function () {
                        syncNovelWorldBookEntry(!1).catch(function (error) {
                            (console.error(`[${extensionName}] prepare world book failed`, error),
                                novelToast("error", "准备注入失败，请查看控制台"));
                        });
                    }),
                    $("#novel_wb_update").on("click", function () {
                        syncNovelWorldBookEntry(!0).catch(function (error) {
                            (console.error(`[${extensionName}] update world book failed`, error),
                                novelToast("error", "更新注入失败，请查看控制台"));
                        });
                    }),
                    $("#novel_wb_clear").on("click", function () {
                        (async function () {
                            const worldName =
                                worldBookConfig.worldBookName || getCurrentCharacterWorldBookName();
                            if (!worldName)
                                return void setWorldBookEntryStatus("没有可清除的注入条目", !1, "idle");
                            const data = await loadNovelWorldBookData(worldName);
                            if (!data || !data.entries) return;
                            normalizeWorldBookEntries(data);
                            const entry = findNovelWorldBookEntry(data);
                            entry
                                ? ((entry.content = ""),
                                  (entry.disable = !0),
                                  entry.extensions &&
                                      entry.extensions.novelChatImporter &&
                                      ((entry.extensions.novelChatImporter.clearedAt =
                                          new Date().toISOString()),
                                      (entry.extensions.novelChatImporter.contentHash =
                                          hashNovelWorldBookContent(""))),
                                  (worldBookConfig.worldBookName = worldName),
                                  (worldBookConfig.worldBookEntryUid = getWorldBookEntryId(entry)),
                                  (worldBookConfig.onceArmed = !1),
                                  (worldBookOnceArmedAt = 0),
                                  (worldBookConfig.lastSyncedHash = hashNovelWorldBookContent("")),
                                  await saveNovelWorldBookData(worldName, data),
                                  saveWorldBookConfig(),
                                  unregisterWorldBookEvents(),
                                  setWorldBookEntryStatus(
                                      `世界书: ${worldName}｜条目 UID: ${worldBookConfig.worldBookEntryUid}`,
                                      !1,
                                      "cleared"
                                  ),
                                  novelToast("success", "注入条目已清空并关闭"))
                                : setWorldBookEntryStatus("没有找到插件创建的注入条目", !1, "idle");
                        })().catch(function (error) {
                            (console.error(`[${extensionName}] clear world book failed`, error),
                                novelToast("error", "清除注入失败，请查看控制台"));
                        });
                    }),
                    $("#novel_wb_delete").on("click", function () {
                        (async function () {
                            const worldName =
                                worldBookConfig.worldBookName || getCurrentCharacterWorldBookName();
                            if (!worldName)
                                return void setWorldBookEntryStatus("没有可删除的注入条目", !1, "idle");
                            const data = await loadNovelWorldBookData(worldName);
                            if (!data || !data.entries) return;
                            normalizeWorldBookEntries(data);
                            const entry = findNovelWorldBookEntry(data);
                            if (entry) {
                                if (confirm("确定删除插件创建的小说注入世界书条目吗？")) {
                                    var uid = getWorldBookEntryId(entry);
                                    ((delete data.entries[String(uid)], (function () { var pe = findNovelPinnedEntry(data); if (pe) { var puid2 = getWorldBookEntryId(pe); delete data.entries[String(puid2)]; } })()),
                                        (worldBookConfig.worldBookName = worldName),
                                        (worldBookConfig.worldBookEntryUid = null),
                                        (worldBookConfig.onceArmed = !1),
                                        (worldBookOnceArmedAt = 0),
                                        (worldBookConfig.lastSyncedHash = ""),
                                        await saveNovelWorldBookData(worldName, data),
                                        saveWorldBookConfig(),
                                        unregisterWorldBookEvents(),
                                        setWorldBookEntryStatus(`世界书: ${worldName}`, !1, "idle"),
                                        novelToast("success", "注入条目已删除"));
                                }
                            } else setWorldBookEntryStatus("没有找到插件创建的注入条目", !1, "idle");
                        })().catch(function (error) {
                            (console.error(`[${extensionName}] delete world book failed`, error),
                                novelToast("error", "删除条目失败，请查看控制台"));
                        });
                    }),
                    $("#novel_wb_save").on("click", function () {
                        saveWorldBookConfig();
                        novelToast("success", "世界书配置已保存");
                        // 让按钮名副其实：已有条目时顺手把包裹文字同步进去（只换包裹，不动章节正文）
                        resyncEntryWrapper(!1);
                    }),
                    $(document)
                        .off("focusin.novelImporterInput focusout.novelImporterInput")
                        .on(
                            "focusin.novelImporterInput focusout.novelImporterInput",
                            NOVEL_INPUT_SELECTOR,
                            function (e) {
                                ((_inputHasFocus = "focusin" === e.type || isNovelInputActive()),
                                    isMobileViewport() &&
                                        $("#novel_importer_inline_panel").is(":visible") &&
                                        (scheduleNovelImporterPanelViewportUpdate(
                                            "focusin" === e.type ? 0 : 80
                                        ),
                                        "focusin" === e.type &&
                                            (setTimeout(keepNovelFocusedInputVisible, 120),
                                            setTimeout(keepNovelFocusedInputVisible, 360))),
                                    "focusout" === e.type &&
                                        setTimeout(() => {
                                            ((_inputHasFocus = isNovelInputActive()),
                                                !_inputHasFocus &&
                                                    _pendingRefreshAfterInput &&
                                                    ((_pendingRefreshAfterInput = !1), scheduleRefreshAll()));
                                        }, 180));
                            }
                        ));
            }
        }
        var layoutRAF = null;
        function fixNovelImporterButtonLayout() {
            layoutRAF ||
                (layoutRAF = requestAnimationFrame(function () {
                    ((layoutRAF = null),
                        (function () {
                            if ((syncNovelImporterResponsiveMode(), isMobileViewport()))
                                return void forceNovelImporterMobileLayout();
                            const common = {
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: "auto",
                                    minWidth: "96px",
                                    maxWidth: "none",
                                    whiteSpace: "nowrap",
                                    wordBreak: "keep-all",
                                    overflowWrap: "normal",
                                    writingMode: "horizontal-tb",
                                    textOrientation: "mixed",
                                    lineHeight: "1.35",
                                    padding: "7px 12px",
                                    flex: "0 0 auto",
                                    textAlign: "center"
                                },
                                wide = Object.assign({}, common, { minWidth: "132px" }),
                                compact = Object.assign({}, common, { minWidth: "86px" });
                            ($(
                                "#novel_importer_container .menu_button,#novel_importer_fallback_modal .menu_button,#novel_importer_container button,#novel_importer_fallback_modal button,#novel_importer_container .novel_link_button,#novel_importer_fallback_modal .novel_link_button,#novel_importer_container .novel_show_more_btn,#novel_importer_fallback_modal .novel_show_more_btn"
                            ).css(common),
                                $(
                                    "#novel_txt_file + label.menu_button,#novel_clear_btn,#novel_batch_replace_btn,#novel_batch_replace_apply,#novel_wb_update,#novel_wb_clear"
                                ).css(wide),
                                $(
                                    "#novel_importer_container .novel_link_button,#novel_importer_fallback_modal .novel_link_button"
                                ).css(compact),
                                $(
                                    "#novel_importer_container .novel_search_row,#novel_importer_container .novel_button_row,#novel_importer_container .novel_modal_footer,#novel_importer_container .novel_preview_controls,#novel_importer_container .novel_range_row"
                                ).css({
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: "8px",
                                    flexWrap: "wrap"
                                }),
                                $("#novel_importer_container .novel_search_row input").css({
                                    flex: "1 1 260px",
                                    minWidth: "220px"
                                }),
                                setupNovelImporterToasts());
                        })());
                }));
        }
        function openNovelImporter(e) {
            try {
                if (
                    (e &&
                        (e.preventDefault(),
                        e.stopPropagation(),
                        e.stopImmediatePropagation && e.stopImmediatePropagation()),
                    console.log("[Novel Chat Importer] open requested"),
                    createUI(),
                    refreshNovelCacheButton(),
                    syncNovelImporterResponsiveMode(),
                    isMobileViewport())
                ) {
                    let panel = $("#novel_importer_inline_panel");
                    (panel.length ||
                        ($("body").append(
                            '\n                            <div id="novel_importer_inline_panel" style="position:fixed;left:10px;right:10px;top:10px;bottom:auto;z-index:2147483000;width:auto;height:calc(100dvh - 68px);max-height:calc(100dvh - 68px);overflow-y:scroll;overflow-x:hidden;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;touch-action:pan-y;background:var(--SmartThemeBlurTintColor,#222);border:1px solid var(--SmartThemeBorderColor,#555);border-radius:10px;box-shadow:0 6px 24px rgba(0,0,0,.35);padding:12px;box-sizing:border-box;">\n                                <div class="novel_importer_panel_header" style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px;">\n                                    <b class="novel_importer_panel_title">小说导入</b>\n                                    <button id="novel_importer_inline_close" class="menu_button novel_importer_header_close" type="button">关闭</button>\n                                </div>\n                                <div id="novel_importer_inline_body"></div>\n                            </div>\n                        '
                        ),
                        $("#novel_importer_inline_close")
                            .off("click.novelImporter")
                            .on("click.novelImporter", function (ev) {
                                (ev.preventDefault(), closeNovelImporterPanels());
                            }),
                        (panel = $("#novel_importer_inline_panel"))),
                        $("#novel_importer_inline_body").append($("#novel_importer_container")),
                        (function () {
                            if (_panelScrollLock || !isMobileViewport()) return;
                            const doc = document.documentElement,
                                body = document.body,
                                scrollY = window.scrollY || document.scrollingElement?.scrollTop || 0;
                            _panelScrollLock = {
                                scrollY: scrollY,
                                htmlOverflow: doc.style.overflow,
                                bodyOverflow: body.style.overflow,
                                bodyPosition: body.style.position,
                                bodyTop: body.style.top,
                                bodyLeft: body.style.left,
                                bodyRight: body.style.right,
                                bodyWidth: body.style.width
                            };
                        })(),
                        (function () {
                            if (
                                (_panelViewportHandler ||
                                    (_panelViewportHandler = () =>
                                        scheduleNovelImporterPanelViewportUpdate(40)),
                                $(window)
                                    .off(
                                        "resize.novelImporterPanelViewport orientationchange.novelImporterPanelViewport"
                                    )
                                    .on(
                                        "resize.novelImporterPanelViewport orientationchange.novelImporterPanelViewport",
                                        _panelViewportHandler
                                    ),
                                window.visualViewport)
                            ) {
                                const vv = window.visualViewport;
                                (vv.__novelImporterPanelHandler &&
                                    (vv.removeEventListener("resize", vv.__novelImporterPanelHandler),
                                    vv.removeEventListener("scroll", vv.__novelImporterPanelHandler)),
                                    vv.addEventListener("resize", _panelViewportHandler, { passive: !0 }),
                                    vv.addEventListener("scroll", _panelViewportHandler, { passive: !0 }),
                                    (vv.__novelImporterPanelHandler = _panelViewportHandler));
                            }
                        })(),
                        panel.show(),
                        forceNovelImporterMobileLayout(),
                        panel.scrollTop(0),
                        scheduleNovelImporterPanelViewportUpdate(80),
                        scheduleNovelImporterPanelViewportUpdate(320));
                } else {
                    fixNovelImporterButtonLayout();
                    let modal = $("#novel_importer_fallback_modal");
                    (modal.length ||
                        ($("body").append(
                            '\n                            <div id="novel_importer_fallback_modal" style="position:fixed;inset:0;height:100vh;height:100dvh;z-index:1000000;background:rgba(0,0,0,.55);display:none;align-items:center;justify-content:center;padding:18px;box-sizing:border-box;">\n                                <div style="width:min(1280px,68vw);max-height:88vh;overflow:auto;background:var(--SmartThemeBlurTintColor,#222);border:1px solid var(--SmartThemeBorderColor,#555);border-radius:10px;box-shadow:0 10px 40px rgba(0,0,0,.5);padding:16px;box-sizing:border-box;">\n                                    <div class="novel_importer_panel_header" style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px;">\n                                        <b class="novel_importer_panel_title">小说导入</b>\n                                        <button id="novel_importer_fallback_close" class="menu_button novel_importer_header_close" type="button">关闭</button>\n                                    </div>\n                                    <div id="novel_importer_fallback_body"></div>\n                                </div>\n                            </div>\n                        '
                        ),
                        $("#novel_importer_fallback_close").on("click", function (ev) {
                            (ev.preventDefault(), closeNovelImporterPanels());
                        }),
                        $("#novel_importer_fallback_modal").on("click", function (ev) {
                            ev.target === this && closeNovelImporterPanels();
                        }),
                        (modal = $("#novel_importer_fallback_modal"))),
                        $("#novel_importer_fallback_body").append($("#novel_importer_container")),
                        fixNovelImporterButtonLayout(),
                        setTimeout(fixNovelImporterButtonLayout, 50),
                        modal.css("display", "flex"));
                }
                novelToast("info", "已打开小说导入");
            } catch (error) {
                (console.error("[Novel Chat Importer] open failed", error),
                    novelToast("error", "小说导入窗口打开失败，请查看控制台"));
            }
        }
        function addMagicMenuEntry() {
            (() => {
                const menu = $("#extensionsMenu");
                if (!menu.length) return !1;
                if (!$("#novel_importer_magic_menu").length) {
                    const item = $(
                        '<div class="list-group-item flex-container flexGap5 interactable" id="novel_importer_magic_menu"><div class="fa-fw fa-solid fa-book-open"></div><span>小说导入</span></div>'
                    );
                    (item.off("click.novelImporter").on("click.novelImporter", function (ev) {
                        openNovelImporter(ev);
                    }),
                        menu.append(item));
                }
                return !0;
            })() || setTimeout(addMagicMenuEntry, 1e3);
        }
        jQuery(async () => {
            (console.log(`[${extensionName}] script start`),
                forceNovelImporterMobileLayout(),
                $(window)
                    .off("resize.novelImporterResponsive orientationchange.novelImporterResponsive")
                    .on("resize.novelImporterResponsive orientationchange.novelImporterResponsive", () => {
                        isMobileViewport()
                            ? forceNovelImporterMobileLayout()
                            : setTimeout(fixNovelImporterButtonLayout, 0);
                    }),
                (function () {
                    try {
                        $(
                            "#novel_importer_container,#novel_importer_host,#novel_importer_fallback_modal,#novel_importer_inline_panel,#novel_replace_modal,#novel_batch_replace_modal,#novel_cache_modal,#novel_importer_magic_menu,#novel_plot_control_bar"
                        ).remove();
                    } catch (e) {}
                })(),
                createUI(),
                refreshNovelCacheButton(),
                // 先读剧情栏开关（含 localStorage 兜底），再 load 其它配置 / switchMode，避免默认 false 写回盘
                loadPlotControlBarSettings(),
                loadNovelImporterSavedConfig(),
                // loadNovelImporter 不改 plot；再读一次确保 bag 与 LS 对齐
                loadPlotControlBarSettings(),
                ensurePlotCharacterSwitchBinding(),
                switchNovelMode(
                    worldBookBatchMode ? "batch_worldbook" : worldBookMode ? "worldbook" : "import"
                ),
                ($("#novel_plot_bar_enabled").length && $("#novel_plot_bar_enabled").prop("checked", !!plotControlBarEnabled)),
                addMagicMenuEntry(),
                ensureNovelPlotControlBar(),
                refreshNovelPlotControlBar(),
                // 启动时从当前角色世界书检测恢复范围/钉住（不改全局 enabled）
                hydratePlotStateFromWorldBook({ silent: !0 }).then(function () {
                    try {
                        loadPlotControlBarSettings();
                        $("#novel_plot_bar_enabled").prop("checked", !!plotControlBarEnabled);
                        ensureNovelPlotControlBar();
                        refreshNovelPlotControlBar();
                    } catch (eHydra) {}
                    // 启动时角色/聊天常常还没就绪，正文没恢复就退避重试
                    schedulePlotHydrateRetry();
                }),
                setTimeout(function () {
                    try {
                        loadPlotControlBarSettings();
                        $("#novel_plot_bar_enabled").prop("checked", !!plotControlBarEnabled);
                        ensureNovelPlotControlBar();
                        refreshNovelPlotControlBar();
                    } catch (eLate) {}
                }, 500),
                // ST extension_settings 有时更晚才就绪，再对齐一次
                setTimeout(function () {
                    try {
                        loadPlotControlBarSettings();
                        $("#novel_plot_bar_enabled").prop("checked", !!plotControlBarEnabled);
                        ensureNovelPlotControlBar();
                        refreshNovelPlotControlBar();
                    } catch (eLater) {}
                }, 1800),
                (window.openNovelChatImporter = openNovelImporter),
                (function(){
                    var w = window;
                    try { if (window.parent && window.parent !== window) { window.parent.openNovelChatImporter = openNovelImporter; } } catch(e){}
                    w.__novelDebug = function () {
                        var info = {
                            containerExists: $("#novel_importer_container").length,
                            replaceBtnExists: $("#novel_replace_btn").length,
                            batchReplaceBtnExists: $("#novel_batch_replace_btn").length,
                            replaceModalExists: $("#novel_replace_modal").length,
                            batchReplaceModalExists: $("#novel_batch_replace_modal").length,
                            novelTextLength: novelText ? novelText.length : 0,
                            inIframe: window !== window.top
                        };
                        console.log("[Novel Chat Importer] Debug info:", info);
                        return info;
                    };
                    w.__novelReplaceTest = function () {
                        if (!novelText) return "novelText is empty";
                        try { openSingleReplaceModal(); return "openSingleReplaceModal called OK"; }
                        catch (e) { return "ERROR: " + e.message; }
                    };
                    w.__novelBatchReplaceTest = function () {
                        if (!novelText) return "novelText is empty";
                        try { openBatchReplaceModal(); return "openBatchReplaceModal called OK"; }
                        catch (e) { return "ERROR: " + e.message; }
                    };
                    // 同一份调试接口同时挂到本窗口与父窗口（助手脚本常跑在 iframe 里）
                    var novelPlotBarApi = {
                        show: function () { setNovelPlotControlBarVisible(!0); },
                        hide: function () { setNovelPlotControlBarVisible(!1); },
                        next: function () { return stepNovelPlotWindow(1); },
                        prev: function () { return stepNovelPlotWindow(-1); },
                        refresh: refreshNovelPlotControlBar,
                        pinSelected: function () { return pinSelectedFromUI(); },
                        applyRange: function () { return applyCustomPlotRange(); },
                        clearPinned: function () { return clearAllPinned(); },
                        unpin: function (n) { return unpinChapter(n); },
                        rebuildPinned: function (s) { return rebuildPinnedEntry(s); },
                        openReader: function () { openPlotReader("read"); },
                        openDiff: function () { openPlotReader("diff"); }
                    };
                    try {
                        if (window.parent && window.parent !== window) {
                            window.parent.__novelDebug = w.__novelDebug;
                            window.parent.__novelReplaceTest = w.__novelReplaceTest;
                            window.parent.__novelBatchReplaceTest = w.__novelBatchReplaceTest;
                            window.parent.__novelPlotBar = novelPlotBarApi;
                        }
                    } catch (e) {}
                    w.__novelPlotBar = novelPlotBarApi;
                })(),
                window.__novelChatImporterLoadedToast ||
                    ((window.__novelChatImporterLoadedToast = !0),
                    novelToast("success", "小说导入助手已加载")),
                console.log(`[${extensionName}] Loaded`));
        });
    }
    const wait = setInterval(() => {
        if (window.jQuery || window.$) {
            clearInterval(wait);
            try {
                startNovelImporter();
            } catch (error) {
                (console.error("[Novel Chat Importer] assistant script failed", error),
                    novelToast("error", "小说导入助手启动失败，请查看控制台"));
            }
        }
    }, 500);
})();
