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
    //   LIVE2D 占位 → src/live2d.js 的源码(IIFE,定义 ChiiLive2D)
    var TOKENS = __TOKENS__
    // CSS 占位(值见上方注释)
    var CSS = __CSS__
    // ASSETS 占位(值见上方注释)
    var ASSETS = __ASSETS__
    // LIVE2D 占位(值见上方注释)
    __LIVE2D__

    // 照片墙:仅使用落地页真实使用的 5 张配图;portrait 控制横/竖拍立得,
    // wide 标记的照片只在宽窗口显示(窄窗口避免压住内容)
    var WALL = [
      { asset: 'wall-chii-hero', left: 'calc(310px + 8%)', y: '6%', r: '-7deg', s: 1, portrait: true, wide: true, depth: 15 },
      { asset: 'wall-chii-picturebook', left: 'calc(310px + 4%)', bottom: '4%', r: '-5deg', s: 0.72, portrait: true, wide: true, depth: 9 },
      { asset: 'wall-chii-hideki-chibi', right: '2%', y: '6%', r: '4deg', s: 0.95, depth: 14 },
      { asset: 'wall-chobits-family', right: '2%', y: '42%', r: '-5deg', s: 1, tallOnly: true, depth: 10 },
      { asset: 'wall-chii-headpat', right: '10%', y: '82%', r: '3deg', s: 0.72, depth: 12 }
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

    // 指针视差:照片按各自 depth 轻微反向移动,形成分层感;尊重 reduced-motion 与触屏
    function enableWallParallax(photos) {
      if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return function () {}
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return function () {}
      if (!window.matchMedia('(pointer: fine)').matches) return function () {}
      var targetX = 0
      var targetY = 0
      var currentX = 0
      var currentY = 0
      var frame = 0
      var running = false
      var depths = []
      for (var i = 0; i < photos.length; i++) depths.push(Number(photos[i].chiiDepth) || 10)

      function tick() {
        currentX += (targetX - currentX) * 0.08
        currentY += (targetY - currentY) * 0.08
        for (var i = 0; i < photos.length; i++) {
          photos[i].style.setProperty('--px', (-currentX * depths[i]).toFixed(2) + 'px')
          photos[i].style.setProperty('--py', (-currentY * depths[i]).toFixed(2) + 'px')
        }
        if (Math.abs(targetX - currentX) > 0.001 || Math.abs(targetY - currentY) > 0.001) {
          frame = window.requestAnimationFrame(tick)
        } else {
          running = false
        }
      }

      function onPointerMove(event) {
        targetX = event.clientX / window.innerWidth - 0.5
        targetY = event.clientY / window.innerHeight - 0.5
        if (!running) {
          running = true
          frame = window.requestAnimationFrame(tick)
        }
      }

      window.addEventListener('pointermove', onPointerMove, { passive: true })
      return function () {
        window.removeEventListener('pointermove', onPointerMove)
        if (frame) window.cancelAnimationFrame(frame)
      }
    }

    // 照片墙:拍立得贴片沿界面四周散布,中心由 CSS mask 渐隐,不挡交互
    function injectPhotoWall() {
      if (typeof document === 'undefined' || !document.body) return function () {}
      var old = document.querySelector('.chobits-chii-wall')
      if (old) old.parentNode.removeChild(old)
      var wall = document.createElement('div')
      var photos = []
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
        photo.setAttribute('data-wall', item.asset)
        photo.style.setProperty('--r', item.r || '0deg')
        photo.style.setProperty('--s', String(item.s === undefined ? 1 : item.s))
        photo.style.setProperty('--ar', item.portrait ? '4 / 5' : '5 / 4')
        photo.style.setProperty('--fd', (8 + (i % 3) * 1.7).toFixed(2) + 's')
        photo.style.setProperty('--fdel', (-i * 1.3).toFixed(2) + 's')
        photo.chiiDepth = item.depth || 10
        var inner = document.createElement('i')
        inner.style.backgroundImage = 'url("' + ASSETS[item.asset] + '")'
        photo.appendChild(inner)
        wall.appendChild(photo)
        photos.push(photo)
      }
      document.body.appendChild(wall)
      var stopParallax = enableWallParallax(photos)
      return function () {
        stopParallax()
        if (wall.parentNode) wall.parentNode.removeChild(wall)
      }
    }

    // Live2D 桌宠:默认开启;首屏之后空闲时再加载(3.4 MB,vendor + 模型)。
    // 开关在 Plugins 页本 bundle 的配置页里(plugins.bundle.config),关掉后可随时开回来。
    function setupMascot(ctx) {
      var runningSessions = {}
      var disposeRemote = null
      var disposeIdleCallback = null
      var disposeDomReady = null
      var disposeChange = null
      var started = false

      function sync() {
        var anyRunning = false
        for (var id in runningSessions) {
          if (runningSessions[id]) {
            anyRunning = true
            break
          }
        }
        ChiiLive2D.setState(anyRunning ? 'thinking' : 'idle')
      }

      function start() {
        if (started) return
        started = true
        ChiiLive2D.mount().catch(function () {
          // 加载失败就安静退回照片墙,不再重试
          started = false
          stop()
        })
        var remote = typeof ctx.get === 'function' ? ctx.get('remote') : undefined
        if (remote && typeof remote.$on === 'function') {
          disposeRemote = remote.$on('api-session/status', function (sessionId, running) {
            if (running) runningSessions[sessionId] = true
            else delete runningSessions[sessionId]
            sync()
          })
        }
      }

      function stop() {
        started = false
        if (disposeRemote) {
          disposeRemote()
          disposeRemote = null
        }
        // 退订期间收不到 status 事件，这张表就此失效：不清会让「关掉再开」后
        // 永远残留一个 running 会话，桌宠在空闲时也一直播 thinking
        runningSessions = {}
        if (disposeIdleCallback) {
          disposeIdleCallback()
          disposeIdleCallback = null
        }
        if (disposeDomReady) {
          disposeDomReady()
          disposeDomReady = null
        }
        ChiiLive2D.destroy()
      }

      function schedule() {
        if (typeof document === 'undefined') return
        // 省流量 / 慢网络下不自动加载
        var connection = typeof navigator === 'undefined' ? undefined : navigator.connection
        if (connection && (connection.saveData || /(^|-)(2g|slow-2g)$/.test(connection.effectiveType || ''))) return
        // 不等 load:DSH 的 SPA 壳在 load 之后仍会继续换文档,监听 load 可能永远等不到
        var boot = function () {
          if (typeof window.requestIdleCallback === 'function') {
            var handle = window.requestIdleCallback(start, { timeout: 2000 })
            disposeIdleCallback = function () {
              window.cancelIdleCallback(handle)
            }
          } else {
            start()
          }
        }
        if (document.readyState === 'loading') {
          window.addEventListener('DOMContentLoaded', boot, { once: true })
          disposeDomReady = function () {
            window.removeEventListener('DOMContentLoaded', boot)
          }
        } else {
          boot()
        }
      }

      // 设置页开关:开 → 立即加载,关 → 立即卸载(无需刷新)
      disposeChange = ChiiLive2D.onChange(function (enabled) {
        if (enabled) start()
        else stop()
      })
      if (ChiiLive2D.isEnabled()) schedule()

      return function () {
        if (disposeChange) {
          disposeChange()
          disposeChange = null
        }
        stop()
      }
    }

    // Plugins 页里本 bundle 的配置页:一个开关。偏好存在 localStorage(客户端偏好,
    // 不需要 host 半往返);关掉后可以随时在这里开回来,不用动 DevTools
    function registerBundleConfig(ctx) {
      var slots = typeof ctx.get === 'function' ? ctx.get('slots') : undefined
      if (!slots || typeof slots.inject !== 'function' || typeof slots.register !== 'function') return
      var React
      try {
        React = require('react')
      } catch (error) {
        warn('react unavailable, bundle config skipped', error)
        return
      }
      function ChiiMascotConfig() {
        var pair = React.useState(ChiiLive2D.isEnabled())
        var enabled = pair[0]
        var update = pair[1]
        React.useEffect(function () {
          return ChiiLive2D.onChange(update)
        }, [])
        return React.createElement(
          'div',
          { className: 'chobits-chii-config' },
          React.createElement(
            'div',
            { className: 'chobits-chii-config-text' },
            React.createElement('div', { className: 'chobits-chii-config-title' }, '小叽桌宠'),
            React.createElement(
              'p',
              { className: 'chobits-chii-config-desc' },
              '在右下角显示 Live2D 小叽,按会话运行状态切换动作。关掉后随时可以在这里开回来。'
            ),
            React.createElement(
              'p',
              { className: 'chobits-chii-config-org' },
              '小叽来自 ',
              React.createElement(
                'a',
                {
                  href: 'https://github.com/Anime2Real',
                  target: '_blank',
                  rel: 'noopener noreferrer'
                },
                'Anime2Real'
              ),
              ' —— 把二次元角色做成能真正跑起来的东西,全部开源。'
            )
          ),
          React.createElement(
            'button',
            {
              type: 'button',
              role: 'switch',
              'aria-checked': enabled ? 'true' : 'false',
              'aria-label': '小叽桌宠',
              className: 'chobits-chii-switch' + (enabled ? ' is-on' : ''),
              onClick: function () {
                ChiiLive2D.setEnabled(!ChiiLive2D.isEnabled())
              }
            },
            React.createElement('span', { className: 'chobits-chii-switch-thumb' })
          )
        )
      }
      ctx.effect(function () {
        return slots.inject('plugins.bundle.config', function () {
          return slots.register({ name: 'plugins.bundle.config', key: PLUGIN_ID }, ChiiMascotConfig)
        })
      }, PLUGIN_ID + ': bundle config')
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

      // 3) Live2D 桌宠:默认开启,加载失败时安静退回照片墙。
      // 注意:ctx.effect(fn) 会立刻调用 fn 并把返回值当清理函数,所以这里传工厂,不能传已建好的清理函数
      if (typeof ctx.effect === 'function') {
        ctx.effect(function () {
          return setupMascot(ctx)
        }, PLUGIN_ID + ': live2d')
        registerBundleConfig(ctx)
      } else {
        setupMascot(ctx)
      }

      return module.exports
    }

    return module.exports
  },
})
