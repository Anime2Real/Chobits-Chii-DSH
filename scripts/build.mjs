// 构建 lib/client.js:把 tokens / CSS / 配图内联进模板,产物为免构建纯 JS。
// 用法:node scripts/build.mjs(或 pnpm build)
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { join, dirname, extname, basename } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

// ---- 1) token 集 ----
const { TOKENS } = await import(pathToFileURL(join(root, 'src/tokens.js')).href)

// ---- 2) 配图 → data URI ----
const MIME = {
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png'
}
const assetsDir = join(root, 'assets')
const assets = {}
for (const file of readdirSync(assetsDir)) {
  const ext = extname(file).toLowerCase()
  const mime = MIME[ext]
  if (!mime) continue
  const buf = readFileSync(join(assetsDir, file))
  assets[basename(file, ext)] = `data:${mime};base64,` + buf.toString('base64')
}

// ---- 3) CSS:解析 asset("name") 占位符 ----
let css = readFileSync(join(root, 'src/skin.css'), 'utf8')
css = css.replace(/asset\("([a-z0-9-]+)"\)/g, (_match, name) => {
  if (!assets[name]) throw new Error('skin.css 引用了不存在的资产: ' + name)
  return 'url("' + assets[name] + '")'
})
const leftover = css.match(/asset\("[a-z0-9-]+"\)/)
if (leftover) throw new Error('存在未解析的 asset() 占位符: ' + leftover[0])

// ---- 4) 组装并校验 ----
const template = readFileSync(join(root, 'src/client.template.js'), 'utf8')
const live2d = readFileSync(join(root, 'src/live2d.js'), 'utf8')
const out = template
  .replaceAll('__TOKENS__', JSON.stringify(TOKENS))
  .replaceAll('__CSS__', JSON.stringify(css))
  .replaceAll('__ASSETS__', JSON.stringify(assets))
  .replaceAll('__LIVE2D__', () => live2d.trim())

if (/^\s*(import|export)\s/m.test(out)) {
  throw new Error('产物必须是无 import/export 的纯 JS(client bundle 契约)')
}

writeFileSync(join(root, 'lib/client.js'), out)
const kb = (statSync(join(root, 'lib/client.js')).size / 1024).toFixed(1)
console.log(
  `lib/client.js 已生成(${kb} KB,` +
    `${Object.keys(TOKENS.aliases).length} 个 token,` +
    `${Object.keys(assets).length} 张配图内联)`
)
