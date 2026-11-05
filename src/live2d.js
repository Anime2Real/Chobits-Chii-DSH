// ---------------------------------------------------------------------------
// chobits-chii-dsh — Live2D 桌宠控制器
//
// 纯 JS、无 import/export,由 scripts/build.mjs 内联进 lib/client.js。
// 运行时库与模型都从 host 半的 /chii-live2d/assets 路由读取:
//   vendor/pixi.min.js                PIXI 6.5.10(MIT)
//   vendor/live2d.min.js              Cubism 2 运行时桩,仅满足注册期符号引用
//   vendor/live2dcubismcore.min.js     Live2D Cubism Core(Live2D Proprietary,允许再分发)
//   vendor/pixi-live2d-display.min.js  pixi-live2d-display 0.4.0(MIT)
//   chii.model3.json 等                web 精简模型(1024 贴图 WebP,约 2.5 MB)
// ---------------------------------------------------------------------------
var ChiiLive2D = (function () {
  var BASE = '/chii-live2d/assets'
  var STORAGE_KEY = 'chobits-chii-dsh:live2d'
  var VENDOR = [
    '/vendor/pixi.min.js',
    '/vendor/live2d.min.js',
    '/vendor/live2dcubismcore.min.js',
    '/vendor/pixi-live2d-display.min.js'
  ]

  var loaded = {}
  var state = null
  var generation = 0
  var listeners = []

  function warn(message, error) {
    if (typeof console === 'undefined') return
    console.warn('[chobits-chii-dsh] ' + message, error || '')
  }

  // 偏好:只有显式写入 'off' 才算关闭;键不存在 = 默认开启
  function isEnabled() {
    try {
      return window.localStorage.getItem(STORAGE_KEY) !== 'off'
    } catch {
      return true
    }
  }

  function setEnabled(enabled) {
    try {
      if (enabled) window.localStorage.removeItem(STORAGE_KEY)
      else window.localStorage.setItem(STORAGE_KEY, 'off')
    } catch {
      // 隐私模式下不可写,只在本次会话内生效
    }
    for (var i = 0; i < listeners.length; i++) listeners[i](enabled)
  }

  function onChange(listener) {
    listeners.push(listener)
    return function () {
      var index = listeners.indexOf(listener)
      if (index >= 0) listeners.splice(index, 1)
    }
  }

  function loadScript(rel) {
    if (loaded[rel]) return loaded[rel]
    loaded[rel] = new Promise(function (resolve, reject) {
      var el = document.createElement('script')
      el.src = BASE + rel
      el.async = false
      el.onload = function () {
        resolve()
      }
      el.onerror = function () {
        delete loaded[rel]
        reject(new Error('script load failed: ' + rel))
      }
      document.head.appendChild(el)
    })
    return loaded[rel]
  }

  // 顺序加载:Core 必须先于 pixi-live2d-display(后者注册时就要读 Live2DCubismCore)
  function loadRuntime() {
    return VENDOR.reduce(function (chain, rel) {
      return chain.then(function () {
        return loadScript(rel)
      })
    }, Promise.resolve())
  }

  function preferredSize() {
    return Math.max(180, Math.min(280, Math.round(window.innerWidth * 0.18)))
  }

  function createContainer() {
    var wrap = document.createElement('div')
    wrap.className = 'chobits-chii-mascot'
    wrap.setAttribute('data-dsh-live2d', '')
    var canvas = document.createElement('canvas')
    canvas.className = 'chobits-chii-mascot-canvas'
    wrap.appendChild(canvas)
    document.body.appendChild(wrap)
    return { wrap: wrap, canvas: canvas }
  }

  function layout(app, model, canvas) {
    var size = preferredSize()
    app.renderer.resize(size, size)
    canvas.style.width = size + 'px'
    canvas.style.height = size + 'px'
    if (!model || !model.width || !model.height) return
    var scale = Math.min((size * 0.98) / model.width, (size * 0.98) / model.height)
    model.scale.set(scale)
    model.anchor.set(0.5, 1)
    model.x = size / 2
    model.y = size
  }

  function destroy() {
    // generation 必须无条件自增：挂载中（state 仍为 null，3.4MB 运行时还在下载）
    // 时关掉开关，不自增就等于取消无效——加载完成后照样把桌宠挂出来
    generation += 1
    var current = state
    state = null
    if (!current) {
      // 加载失败/中途取消也要扫掉已插入的容器：否则残留隐形节点，且 body 上的
      // data-chii-mascot 不摘，照片墙里那张被让位给桌宠的照片会一直空着
      var ghosts = document.querySelectorAll('[data-dsh-live2d]')
      for (var g = 0; g < ghosts.length; g += 1) {
        if (ghosts[g].parentNode) ghosts[g].parentNode.removeChild(ghosts[g])
      }
      if (document.body) document.body.removeAttribute('data-chii-mascot')
      return
    }
    if (current.disposeResize) current.disposeResize()
    if (current.disposeVisibility) current.disposeVisibility()
    if (current.disposePointer) current.disposePointer()
    if (current.model) {
      try {
        current.model.destroy()
      } catch (error) {
        warn('model destroy failed', error)
      }
    }
    if (current.app) {
      try {
        current.app.destroy(true, { children: true, texture: true, baseTexture: true })
      } catch (error) {
        warn('pixi destroy failed', error)
      }
    }
    if (current.wrap.parentNode) current.wrap.parentNode.removeChild(current.wrap)
    if (document.body) document.body.removeAttribute('data-chii-mascot')
  }

  function mount() {
    var token = generation
    var parts = createContainer()
    if (document.body) document.body.setAttribute('data-chii-mascot', '')

    return loadRuntime()
      .then(function () {
        if (token !== generation) return undefined
        if (!window.PIXI || !window.PIXI.live2d) throw new Error('PIXI.live2d unavailable')
        var size = preferredSize()
        var app = new window.PIXI.Application({
          view: parts.canvas,
          width: size,
          height: size,
          backgroundAlpha: 0,
          antialias: true,
          resolution: Math.min(window.devicePixelRatio || 1, 2)
        })
        state = { app: app, wrap: parts.wrap, canvas: parts.canvas, model: null }
        return window.PIXI.live2d.Live2DModel.from(BASE + '/chii.model3.json', { autoInteract: false }).then(
          function (model) {
            if (token !== generation) {
              model.destroy()
              return undefined
            }
            app.stage.addChild(model)
            state.model = model
            state.setState = function (name) {
              if (!model) return
              var group = name === 'thinking' ? 'Look' : 'Idle'
              try {
                // motion() 返回 Promise（Look 组未预载，首帧切换要现取 motion3.json），
                // 同步 try/catch 抓不到它的拒绝 —— 必须挂 catch，否则静默失败 + 未处理拒绝
                var motionResult = model.motion(group, 0, 2)
                if (motionResult && typeof motionResult.catch === 'function') {
                  motionResult.catch(function (error) {
                    warn('motion failed: ' + group, error)
                  })
                }
              } catch (error) {
                warn('motion failed: ' + group, error)
              }
            }
            var relayout = function () {
              layout(app, model, parts.canvas)
            }
            layout(app, model, parts.canvas)
            window.addEventListener('resize', relayout)
            state.disposeResize = function () {
              window.removeEventListener('resize', relayout)
            }
            var onVisibility = function () {
              if (document.hidden) app.ticker.stop()
              else app.ticker.start()
            }
            document.addEventListener('visibilitychange', onVisibility)
            state.disposeVisibility = function () {
              document.removeEventListener('visibilitychange', onVisibility)
            }
            // 视线跟随:autoInteract 关掉(它会同时把点击绑成动作),这里只手动跟指针;
            // canvas 是 pointer-events: none,点击本来就穿透,所以不会误触发动作。
            // 注意:model.focus(x, y) 收的是「canvas/stage 坐标」,不是视口坐标——直接传
            // event.clientX/Y 会让画布外的指针全部挤到同一个边界值,只有正好在画布附近的方向才有变化。
            // 这里改成:取「画布中心 → 指针」的方向,再投影成画布内的一个点,角度只由方向决定。
            var reduceMotion = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
            var finePointer = typeof window.matchMedia !== 'function' || window.matchMedia('(pointer: fine)').matches
            if (!reduceMotion && finePointer) {
              var onPointerMove = function (event) {
                if (!model) return
                try {
                  var rect = parts.canvas.getBoundingClientRect()
                  var cx = rect.left + rect.width / 2
                  var cy = rect.top + rect.height / 2
                  var dx = event.clientX - cx
                  var dy = event.clientY - cy
                  var length = Math.sqrt(dx * dx + dy * dy)
                  if (!(length > 0.5)) return
                  var radius = rect.width / 2
                  model.focus(
                    rect.width / 2 + (dx / length) * radius,
                    rect.height / 2 + (dy / length) * radius
                  )
                } catch (error) {
                  warn('focus failed', error)
                }
              }
              window.addEventListener('pointermove', onPointerMove, { passive: true })
              state.disposePointer = function () {
                window.removeEventListener('pointermove', onPointerMove)
              }
            }
            parts.wrap.setAttribute('data-ready', '')
            return undefined
          }
        )
      })
      .catch(function (error) {
        warn('mascot unavailable, photo wall stays as the fallback', error)
        destroy()
        throw error
      })
  }

  function setState(name) {
    if (state && state.setState) state.setState(name)
  }

  function isMounted() {
    return state !== null
  }

  return {
    mount: mount,
    destroy: destroy,
    setState: setState,
    isMounted: isMounted,
    isEnabled: isEnabled,
    setEnabled: setEnabled,
    onChange: onChange
  }
})()
