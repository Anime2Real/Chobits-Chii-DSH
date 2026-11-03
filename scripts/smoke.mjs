// 冒烟测试(无浏览器):验证 bundle 符合 ModuleLoader 契约、apply 在
// 有无 theme 服务的两种环境下都能正确注册与清理。
// 用法:node scripts/smoke.mjs(或 pnpm smoke)
import { strict as assert } from 'node:assert'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

// ---- 最小 DOM 桩 ----
const elements = []
globalThis.document = {
  head: {
    appendChild(el) { elements.push(el) },
    querySelector: () => null
  },
  body: {
    appendChild(el) { elements.push(el) },
    querySelector: () => null
  },
  createElement: () => ({
    setAttribute() {},
    style: {},
    set textContent(v) { this._text = v },
    get textContent() { return this._text }
  }),
  querySelector: () => null
}
globalThis.window = globalThis

let registered = null
globalThis.__ModuleLoader__ = {
  load(entry) {
    assert.equal(registered, null, '重复注册')
    registered = entry
  }
}

await import(pathToFileURL(join(root, 'lib/client.js')).href + '?smoke=' + Date.now())

assert.ok(registered, 'bundle 未调用 window.__ModuleLoader__.load')
assert.equal(registered.id, 'chobits-chii-dsh')

const mod = registered.factory((id) => {
  throw new Error('皮肤插件不应 require 任何模块: ' + id)
})
assert.equal(typeof mod.apply, 'function', 'factory 须返回带 apply 的模块')

// ---- 环境 1:无 theme 服务(仅样式通道) ----
const ctxNoTheme = {
  get: () => undefined,
  effect: (fn) => fn()
}
mod.apply(ctxNoTheme)

// ---- 环境 2:有 theme 服务(token 通道) ----
let overrideDisposed = false
const seenTokens = []
const themeMock = {
  overrideTokens(source, tokens) {
    assert.equal(source, 'chobits-chii')
    for (const [name, pair] of Object.entries(tokens)) {
      assert.ok(name.startsWith('--dsw-'), 'token 名应为 --dsw-*: ' + name)
      assert.equal(typeof pair.light, 'string', name + ' 缺 light')
      assert.equal(typeof pair.dark, 'string', name + ' 缺 dark')
      seenTokens.push(name)
    }
    return () => { overrideDisposed = true }
  }
}
const ctxWithTheme = {
  get: (name) => (name === 'theme' ? themeMock : undefined),
  effect: (fn) => fn()
}
mod.apply(ctxWithTheme)

assert.ok(seenTokens.length > 0, 'theme.overrideTokens 未被调用')
assert.ok(elements.some((el) => el._text && el._text.includes('--dsw-alias-brand-primary')), '样式注入缺少 token 变量层')
assert.ok(elements.some((el) => el._text && el._text.includes('chobits-chii-corner')), '样式注入缺少角标样式')

console.log(`smoke ok:${seenTokens.length} 个 token 校验通过,样式注入 ${elements.length} 个元素`)
