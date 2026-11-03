// ---------------------------------------------------------------------------
// chobits-chii-dsh — 浏览器半(client bundle)
//
// 构建产物为免构建纯 JS:仓库内提交 lib/client.js,安装时无需任何构建步骤。
// 本文件(src/client.template.js)是 lib/client.js 的模板,
// 由 scripts/build.mjs 将 __TOKENS__ / __CSS__ / __ASSETS__ 三个占位符
// 替换为内联内容后生成 lib/client.js。
//
// DSH 客户端契约(对齐 dsh 0.2.x):
//   window.__ModuleLoader__.load({ id, factory })
//   factory(require) 返回 CJS 模块,exports.apply(ctx) 在首次 materialize 时调用。
//   ctx 服务:theme / slots / modules / settings / remote …(均为可选能力,缺失要容忍)
// ---------------------------------------------------------------------------

window.__ModuleLoader__.load({
  id: 'chobits-chii-dsh',
  factory: function (require) {
    var module = { exports: {} }
    var exports = module.exports

    var PLUGIN_ID = 'chobits-chii-dsh'
    var THEME_ID = 'chobits-chii'

    // 构建占位符说明(scripts/build.mjs 按全词替换,注释里不要写占位符原文):
    //   TOKENS 占位 → { aliases: { '<css-var>': { light, dark } } }
    //   CSS 占位   → 皮肤样式字符串(字体/噪点/配图,已内联资产引用)
    //   ASSETS 占位 → { '<name>': 'data:image/webp;base64,…' }
    var TOKENS = __TOKENS__
    // CSS 占位(值见上方注释)
    var CSS = __CSS__
    // ASSETS 占位(值见上方注释)
    var ASSETS = __ASSETS__

    // 照片墙:仅使用落地页真实使用的 5 张配图;portrait 控制横/竖拍立得,
    // wide 标记的照片只在宽窗口显示(窄窗口避免压住内容)
    var WALL = [
      { asset: 'wall-chii-hero', left: 'calc(310px + 8%)', y: '6%', r: '-7deg', s: 1, portrait: true, wide: true },
      { asset: 'wall-chii-picturebook', left: 'calc(310px + 4%)', bottom: '4%', r: '-5deg', s: 0.72, portrait: true, wide: true },
      { asset: 'wall-chii-hideki-chibi', right: '2%', y: '6%', r: '4deg', s: 0.95 },
      { asset: 'wall-chobits-family', right: '2%', y: '42%', r: '-5deg', s: 1, tallOnly: true },
      { asset: 'wall-chii-headpat', right: '9%', y: '74%', r: '3deg', s: 0.85 }
    ]

    function warn(message, error) {
      // 插件日志会出现在 profile 进程 stdout / 浏览器控制台,保持克制
      if (typeof console === 'undefined') return
      console.warn('[' + PLUGIN_ID + '] ' + message, error || '')
    }

    // 由 token 集生成 token 变量覆盖层(兜底通道)。
    // 注意:DSH 的主题渲染器把 token 写在 <body> 的 inline style 上,
    // 样式层只在渲染器缺位(例如 theme 服务不可用的旧版本)时才有意义;
    // 因此规则挂在 body 上(同特异性时后注入者胜),而不是 :root。
    function buildTokenStylesheet() {
      var light = []
      var dark = []
      for (var alias in TOKENS.aliases) {
        var pair = TOKENS.aliases[alias]
        light.push(alias + ':' + pair.light)
        dark.push(alias + ':' + pair.dark)
      }
      return (
        'body{\n' + light.join(';\n') + '\n}\n' +
        'body[data-ds-dark-theme]{\n' + dark.join(';\n') + '\n}\n' +
        '@media (prefers-color-scheme: dark){\n' +
        '  body:not([data-ds-dark-theme]){\n' + dark.join(';\n') + '\n  }\n' +
        '}\n'
      )
    }

    // 向 <head> 注入去重样式标签;返回 disposer 供 ctx.effect 清理。
    function injectStylesheet(cssText) {
      if (typeof document === 'undefined') return function () {}
      var id = 'data-plugin-css'
      var old = document.head.querySelector('style[' + id + '="' + PLUGIN_ID + '"]')
      if (old) old.parentNode.removeChild(old)
      var style = document.createElement('style')
      style.setAttribute(id, PLUGIN_ID)
      style.setAttribute('data-theme-id', THEME_ID)
      style.textContent = cssText
      document.head.appendChild(style)
      return function () {
        if (style.parentNode) style.parentNode.removeChild(style)
      }
    }

    // 照片墙:拍立得贴片沿界面四周散布,中心由 CSS mask 渐隐,不挡交互
    function injectPhotoWall() {
      if (typeof document === 'undefined' || !document.body) return function () {}
      var old = document.querySelector('.chobits-chii-wall')
      if (old) old.parentNode.removeChild(old)
      var wall = document.createElement('div')
      wall.className = 'chobits-chii-wall'
      wall.setAttribute('aria-hidden', 'true')
      for (var i = 0; i < WALL.length; i++) {
        var item = WALL[i]
        var photo = document.createElement('div')
        photo.className =
          'chobits-chii-photo' +
          (item.wide ? ' chobits-chii-photo--wide-only' : '') +
          (item.tallOnly ? ' chobits-chii-photo--tall-only' : '')
        if (item.left !== undefined) photo.style.left = item.left
        if (item.right !== undefined) photo.style.right = item.right
        if (item.bottom !== undefined) photo.style.bottom = item.bottom
        else photo.style.top = item.y
        photo.style.setProperty('--r', item.r || '0deg')
        photo.style.setProperty('--s', String(item.s === undefined ? 1 : item.s))
        photo.style.setProperty('--ar', item.portrait ? '4 / 5' : '5 / 4')
        var inner = document.createElement('i')
        inner.style.backgroundImage = 'url("' + ASSETS[item.asset] + '")'
        photo.appendChild(inner)
        wall.appendChild(photo)
      }
      document.body.appendChild(wall)
      return function () {
        if (wall.parentNode) wall.parentNode.removeChild(wall)
      }
    }

    exports.name = PLUGIN_ID
    // 客户端运行时按返回对象上的 inject 做激活门控:theme 服务就绪前挂起、
    // 就绪后应用;provider 卸载时自动停车。缺少此声明会在服务未就绪时静默跳过。
    exports.inject = ['theme']

    exports.apply = function (ctx) {
      // 1) theme 服务集成:注册明暗两套 token(唯一能压过 body inline style 的通道)
      try {
        var theme = typeof ctx.get === 'function' ? ctx.get('theme') : undefined
        if (theme && typeof theme.overrideTokens === 'function') {
          ctx.effect(function () {
            return theme.overrideTokens(THEME_ID, TOKENS.aliases)
          }, THEME_ID + ': tokens')
        }
      } catch (error) {
        warn('theme.overrideTokens unavailable, falling back to stylesheet only', error)
      }

      // 2) 样式注入:token 变量层 + 皮肤装饰层(兜底通道,同时承载字体/噪点/配图)
      var disposeSkin = function () {
        var disposeStyle = injectStylesheet(buildTokenStylesheet() + '\n' + CSS)
        var disposeWall = injectPhotoWall()
        return function () {
          disposeStyle()
          disposeWall()
        }
      }
      if (typeof ctx.effect === 'function') {
        ctx.effect(disposeSkin, PLUGIN_ID + ': css')
      } else {
        disposeSkin()
      }

      return module.exports
    }

    return module.exports
  },
})
