// ---------------------------------------------------------------------------
// Chobits Chii 皮肤 token 集 — 明暗两套(中性向配色)
//
// token 名核对自 @deepseek-ai/dsh-client-ui-theme@0.2.1-rc.5 的内置设计平台
// 样式(dsw-alias-* / dsw-specific-*),暗色挂在 body[data-ds-dark-theme]。
//
// 配色取自 Chobits-Chii-Mascot-Release 落地页的暖棕(ink #54453f)、
// 奶油(cream #fff9ee)、纸(paper #f6f1e7)基底;粉色收敛为点缀
// (链接/选中/焦点/业务强调用低饱和玫瑰 #b0687f),主按钮仍用暖墨色,
// 整体偏中性,适合更广的用户群。
// ---------------------------------------------------------------------------

export const TOKENS = {
  aliases: {
    // ---- 背景层 ----
    '--dsw-alias-bg-base': { light: '#fdfaf3', dark: '#26211d' },
    '--dsw-alias-bg-layer-1': { light: '#fffdf8', dark: '#2e2823' },
    '--dsw-alias-bg-layer-2': { light: '#f6f1e7', dark: '#352e28' },
    '--dsw-alias-bg-layer-3': { light: '#ffffff', dark: '#3d352e' },
    '--dsw-alias-bg-module-platform': { light: '#f6f1e7', dark: '#352e28' },
    '--dsw-alias-bg-overlay': { light: '#ece4d5', dark: '#463d34' },
    '--dsw-alias-bg-multi-select': { light: '#efe8da', dark: '#352e28' },
    '--dsw-alias-bg-skeleton': { light: '#5a4f4510', dark: '#ffffff14' },

    // ---- 品牌(暖墨主色,粉仅作小面积点缀) ----
    '--dsw-alias-brand-primary': { light: '#4a4139', dark: '#efe6d8' },
    '--dsw-alias-brand-primary-invert': { light: '#fdfaf3', dark: '#26211d' },
    '--dsw-alias-brand-text': { light: '#4a4139', dark: '#efe6d8' },
    '--dsw-alias-brand-primary-new-colorprimary-new-color': { light: '#4a4139', dark: '#efe6d8' },
    '--dsw-alias-state-business-primary': { light: '#b0687f', dark: '#d99aae' },
    '--dsw-alias-state-business-tertiary': { light: '#f0e2e4', dark: '#4a3a3d' },
    '--dsw-alias-onboarding-accent': { light: '#b0687f', dark: '#d99aae' },

    // ---- 按钮 ----
    '--dsw-alias-button-primary-hover': { light: '#352e28', dark: '#fffaf0' },
    '--dsw-alias-button-primary-dimmed': { light: '#ece4d5', dark: '#3d352e' },
    '--dsw-alias-button-info-fill': { light: '#8a7a68', dark: '#cbb9a8' },
    '--dsw-alias-button-info-hover': { light: '#6f6253', dark: '#e0d2c1' },
    '--dsw-alias-button-contrast-fill': { light: '#4a4139', dark: '#efe6d8' },

    // ---- 文字 ----
    '--dsw-alias-label-primary': { light: '#3a332c', dark: '#efe6d8' },
    '--dsw-alias-label-secondary': { light: '#665a4f', dark: '#c6b6a6' },
    '--dsw-alias-label-tertiary': { light: '#83766a', dark: '#a4937f' },
    '--dsw-alias-label-caption': { light: '#9c8f82', dark: '#8a7a68' },
    '--dsw-alias-label-primary-dimmed': { light: '#4a4139', dark: '#e0d2c1' },
    '--dsw-alias-label-primary-foreground': { light: '#fdfaf3', dark: '#26211d' },
    '--dsw-alias-label-primary-inverted': { light: '#fdfaf3', dark: '#26211d' },
    '--dsw-alias-label-dimmed': { light: '#ddd3c5', dark: '#453c33' },
    '--dsw-alias-link': { light: '#a85f75', dark: '#e0a3b6' },
    '--dsw-alias-menu-icon': { light: '#4a4139', dark: '#c6b6a6' },

    // ---- 边框(暖棕细线) ----
    '--dsw-alias-border-l1': { light: '#5a4f450f', dark: '#efe6d814' },
    '--dsw-alias-border-l2': { light: '#5a4f451a', dark: '#efe6d81f' },
    '--dsw-alias-border-l2-darkmode-thin': { light: '#5a4f451a', dark: '#efe6d80f' },
    '--dsw-alias-border-l3': { light: '#5a4f4529', dark: '#efe6d829' },
    '--dsw-alias-border-l4': { light: '#5a4f453d', dark: '#efe6d83d' },

    // ---- 交互 ----
    '--dsw-alias-interactive-bg-hover': { light: '#5a4f4512', dark: '#efe6d81f' },
    '--dsw-alias-interactive-bg-hover-accent': { light: '#b0687f1f', dark: '#d99aae2e' },
    '--dsw-alias-interactive-bg-active': { light: '#b0687f2e', dark: '#d99aae3d' },
    '--dsw-alias-interactive-bg-hover-solid': { light: '#efe8da', dark: '#3d352e' },

    // ---- 滚动条 ----
    '--dsw-alias-scrollbar-bg-l1': { light: '#e6ddcd', dark: '#4a4138' },
    '--dsw-alias-scrollbar-bg-l2': { light: '#e6ddcd', dark: '#4a4138' },
    '--dsw-alias-scrollbar-hover-l1': { light: '#d8ccb9', dark: '#5a5046' },
    '--dsw-alias-scrollbar-hover-l2': { light: '#d8ccb9', dark: '#5a5046' },

    // ---- 侧边栏(暖纸底,不再是腮红粉) ----
    '--dsw-specific-sidebar-fill': { light: '#f4efe5', dark: '#201b17' },
    '--dsw-specific-sidebar-nav-item-hover': { light: '#ebe3d4', dark: '#2e2823' },
    '--dsw-specific-sidebar-nav-item-active': { light: '#e4dac8', dark: '#352e28' },
    '--dsw-specific-sidebar-nav-item-active-accent': { light: '#d6c9b4', dark: '#453c33' },

    // ---- 对话气泡 ----
    '--dsw-specific-bubble': { light: '#f8f4ea', dark: '#352e28' },
    '--dsw-specific-bubble-highlight': { light: '#f0e9da', dark: '#3d352e' },
    '--dsw-specific-input-major': { light: '#ffffff', dark: '#352e28' },
    '--dsw-specific-login-input': { light: '#fffdf8', dark: '#26211d' },
    '--dsw-specific-selector': { light: '#f6f1e7', dark: '#352e28' },
    '--dsw-specific-tip': { light: '#efe8da', dark: '#352e28' },

    // ---- 菜单(奶油毛玻璃) ----
    '--dsw-menu-surface-fill': { light: '#fdfaf3e6', dark: '#26211de6' },
    '--dsw-alias-menu-group-header-fill': { light: '#fdfaf3f0', dark: '#201b17f0' },
    '--dsw-specific-menu': { light: '#fdfaf3e6', dark: '#26211de6' },
    '--dsw-alias-button-floating-fill': { light: '#ffffff', dark: '#2e2823' },
    '--dsw-alias-button-floating-hover': { light: '#efe8da', dark: '#352e28' },

    // ---- Markdown / 代码 ----
    '--dsw-alias-markdown-code-block': { light: '#f6f1e7', dark: '#26211d' },
    '--dsw-alias-markdown-code-block-banner': { light: '#ece4d5', dark: '#201b17' },
    '--dsw-alias-markdown-inline-code': { light: '#efe8da', dark: '#352e28' },
    '--dsw-alias-markdown-citation': { light: '#ece4d5', dark: '#352e28' },
    '--dsw-alias-markdown-tag': { light: '#ece4d5', dark: '#352e28' },
    '--dsw-alias-markdown-placeholder': { light: '#f6f1e7', dark: '#352e28' },
    '--dsw-alias-markdown-code-segment-selected': { light: '#fffdf8', dark: '#3d352e' },
    '--dsw-alias-markdown-code-segment-unselected': { light: '#f6f1e7', dark: '#26211d' }
  }
}
