// ---------------------------------------------------------------------------
// Chobits Chii 皮肤 token 集 — 明暗两套
//
// token 名核对自 @deepseek-ai/dsh-client-ui-theme@0.2.1-rc.5 的内置设计平台
// 样式(dsw-alias-* / dsw-specific-* / dsw-shadow-*),暗色挂在 body[data-ds-dark-theme]。
// 配色来自 Chobits-Chii-Mascot-Release 落地页设计系统:
//   cream #fff9ee / paper #f6f1e7 / blush #f7e2e7 / pink #ffd3e0 / pink-deep #e86a92
//   ink #54453f / ink-deep #3e322c(暖棕,替代纯黑)
// 暗色是"夜小叽":暖可可底 + 亮粉强调(不跟纯黑)。
// ---------------------------------------------------------------------------

export const TOKENS = {
  aliases: {
    // ---- 背景层 ----
    '--dsw-alias-bg-base': { light: '#fff9ee', dark: '#2b2320' },
    '--dsw-alias-bg-layer-1': { light: '#fffdf6', dark: '#332a25' },
    '--dsw-alias-bg-layer-2': { light: '#f6f1e7', dark: '#3a302a' },
    '--dsw-alias-bg-layer-3': { light: '#ffffff', dark: '#423730' },
    '--dsw-alias-bg-module-platform': { light: '#f6f1e7', dark: '#3a302a' },
    '--dsw-alias-bg-overlay': { light: '#efe7d8', dark: '#4a3c34' },
    '--dsw-alias-bg-multi-select': { light: '#f7e2e7', dark: '#38302a' },
    '--dsw-alias-bg-skeleton': { light: '#54453f0f', dark: '#ffffff14' },

    // ---- 品牌 ----
    '--dsw-alias-brand-primary': { light: '#e86a92', dark: '#f28bab' },
    '--dsw-alias-brand-primary-invert': { light: '#fff9ee', dark: '#2b2320' },
    '--dsw-alias-brand-text': { light: '#54453f', dark: '#f6eadf' },
    '--dsw-alias-brand-primary-new-colorprimary-new-color': { light: '#e86a92', dark: '#f28bab' },
    '--dsw-alias-state-business-primary': { light: '#e86a92', dark: '#f28bab' },
    '--dsw-alias-state-business-tertiary': { light: '#f7e2e7', dark: '#4d3a38' },
    '--dsw-alias-onboarding-accent': { light: '#e86a92', dark: '#f28bab' },

    // ---- 按钮(button-primary-fill 等通过 var(--dsw-alias-brand-primary) 级联) ----
    '--dsw-alias-button-primary-hover': { light: '#d5577f', dark: '#f7a5bf' },
    '--dsw-alias-button-primary-dimmed': { light: '#f7e2e7', dark: '#4d3a38' },
    '--dsw-alias-button-info-fill': { light: '#54453f', dark: '#f6eadf' },
    '--dsw-alias-button-info-hover': { light: '#3e322c', dark: '#e8d5c4' },
    '--dsw-alias-button-contrast-fill': { light: '#54453f', dark: '#f6eadf' },

    // ---- 文字 ----
    '--dsw-alias-label-primary': { light: '#3e322c', dark: '#f6eadf' },
    '--dsw-alias-label-secondary': { light: '#6b5a52', dark: '#cdb7ab' },
    '--dsw-alias-label-tertiary': { light: '#8a7a72', dark: '#a68f82' },
    '--dsw-alias-label-caption': { light: '#a3938a', dark: '#8a7568' },
    '--dsw-alias-label-primary-dimmed': { light: '#54453f', dark: '#e8d5c4' },
    '--dsw-alias-label-primary-foreground': { light: '#fff9ee', dark: '#2b2320' },
    '--dsw-alias-label-primary-inverted': { light: '#fff9ee', dark: '#2b2320' },
    '--dsw-alias-label-dimmed': { light: '#d9cfc4', dark: '#4d423b' },
    '--dsw-alias-link': { light: '#d5577f', dark: '#f28bab' },
    '--dsw-alias-menu-icon': { light: '#54453f', dark: '#cdb7ab' },

    // ---- 边框(暖棕细线,替代黑/蓝灰) ----
    '--dsw-alias-border-l1': { light: '#54453f0f', dark: '#f6eadf14' },
    '--dsw-alias-border-l2': { light: '#54453f1a', dark: '#f6eadf1f' },
    '--dsw-alias-border-l2-darkmode-thin': { light: '#54453f1a', dark: '#f6eadf0f' },
    '--dsw-alias-border-l3': { light: '#54453f29', dark: '#f6eadf29' },
    '--dsw-alias-border-l4': { light: '#54453f3d', dark: '#f6eadf3d' },

    // ---- 交互 ----
    '--dsw-alias-interactive-bg-hover': { light: '#e86a9214', dark: '#f28bab1f' },
    '--dsw-alias-interactive-bg-hover-accent': { light: '#e86a9224', dark: '#f28bab33' },
    '--dsw-alias-interactive-bg-active': { light: '#e86a922e', dark: '#f28bab42' },
    '--dsw-alias-interactive-bg-hover-solid': { light: '#f7e2e7', dark: '#423730' },

    // ---- 滚动条 ----
    '--dsw-alias-scrollbar-bg-l1': { light: '#e8d9cb', dark: '#4a3c34' },
    '--dsw-alias-scrollbar-bg-l2': { light: '#e8d9cb', dark: '#4a3c34' },
    '--dsw-alias-scrollbar-hover-l1': { light: '#d9c6b4', dark: '#5a4a41' },
    '--dsw-alias-scrollbar-hover-l2': { light: '#d9c6b4', dark: '#5a4a41' },

    // ---- 侧边栏(腮红底) ----
    '--dsw-specific-sidebar-fill': { light: '#f7e2e7', dark: '#241d1a' },
    '--dsw-specific-sidebar-nav-item-hover': { light: '#ffd3e0', dark: '#38302a' },
    '--dsw-specific-sidebar-nav-item-active': { light: '#ffd3e0', dark: '#423730' },
    '--dsw-specific-sidebar-nav-item-active-accent': { light: '#f7b8c9', dark: '#4d3f39' },

    // ---- 对话气泡 ----
    '--dsw-specific-bubble': { light: '#fdeef1', dark: '#38302a' },
    '--dsw-specific-bubble-highlight': { light: '#f9dce3', dark: '#423730' },
    '--dsw-specific-input-major': { light: '#ffffff', dark: '#38302a' },
    '--dsw-specific-login-input': { light: '#fffdf6', dark: '#2b2320' },
    '--dsw-specific-selector': { light: '#f6f1e7', dark: '#3a302a' },
    '--dsw-specific-tip': { light: '#f7e2e7', dark: '#38302a' },

    // ---- 菜单(奶油毛玻璃) ----
    '--dsw-menu-surface-fill': { light: '#fff9eee0', dark: '#2b2320e6' },
    '--dsw-alias-menu-group-header-fill': { light: '#fff9eef0', dark: '#241d1af0' },
    '--dsw-specific-menu': { light: '#fff9eee0', dark: '#2b2320e6' },
    '--dsw-alias-button-floating-fill': { light: '#ffffff', dark: '#332a25' },
    '--dsw-alias-button-floating-hover': { light: '#f7e2e7', dark: '#3a302a' },

    // ---- Markdown / 代码 ----
    '--dsw-alias-markdown-code-block': { light: '#f6f1e7', dark: '#2b2320' },
    '--dsw-alias-markdown-code-block-banner': { light: '#efe7d8', dark: '#241d1a' },
    '--dsw-alias-markdown-inline-code': { light: '#f7e2e7', dark: '#38302a' },
    '--dsw-alias-markdown-citation': { light: '#efe7d8', dark: '#38302a' },
    '--dsw-alias-markdown-tag': { light: '#efe7d8', dark: '#38302a' },
    '--dsw-alias-markdown-placeholder': { light: '#f6f1e7', dark: '#38302a' },
    '--dsw-alias-markdown-code-segment-selected': { light: '#fffdf6', dark: '#423730' },
    '--dsw-alias-markdown-code-segment-unselected': { light: '#f6f1e7', dark: '#2b2320' }
  }
}
