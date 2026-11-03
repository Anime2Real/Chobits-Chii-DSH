// chobits-chii-dsh — host 半(服务端)
// 皮肤主体是纯客户端能力;host 半只做一件事:把内置的 Live2D 模型与运行时库
// 从插件包内以只读静态路由发给浏览器。这样 3 MB 级别的模型不必内联进 client bundle,
// 也不依赖任何外部 CDN。
import { createReadStream, statSync } from 'node:fs'
import { join, normalize, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

export const inject = ['webServer']

const PREFIX = '/chii-live2d/assets'
const ROOT = join(fileURLToPath(new URL('..', import.meta.url)), 'assets', 'live2d')

const CONTENT_TYPES = {
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.moc3': 'application/octet-stream'
}

const CACHE_CONTROL = 'public, max-age=3600'

function contentType(file) {
  const dot = file.lastIndexOf('.')
  return (dot === -1 ? undefined : CONTENT_TYPES[file.slice(dot).toLowerCase()]) ?? 'application/octet-stream'
}

// 请求路径 → 包内绝对路径;越界(../、绝对路径、编码绕过)一律拒绝
function resolveFile(pathname) {
  let rel
  try {
    rel = decodeURIComponent(pathname.slice(PREFIX.length))
  } catch {
    return undefined
  }
  if (!rel || rel === '/' || rel.includes('\0')) return undefined
  const target = normalize(join(ROOT, rel))
  if (target !== ROOT && !target.startsWith(ROOT + sep)) return undefined
  return target
}

function serve(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { allow: 'GET, HEAD' })
    res.end()
    return
  }
  const target = resolveFile(new URL(req.url ?? '/', 'http://localhost').pathname)
  if (target === undefined) {
    res.writeHead(404)
    res.end()
    return
  }
  let stat
  try {
    stat = statSync(target)
  } catch {
    res.writeHead(404)
    res.end()
    return
  }
  if (!stat.isFile()) {
    res.writeHead(404)
    res.end()
    return
  }
  res.writeHead(200, {
    'content-type': contentType(target),
    'content-length': stat.size,
    'cache-control': CACHE_CONTROL,
    etag: `"${stat.size.toString(16)}-${Math.floor(stat.mtimeMs).toString(16)}"`
  })
  if (req.method === 'HEAD') {
    res.end()
    return
  }
  createReadStream(target).pipe(res)
}

export function apply(ctx) {
  ctx.effect(
    () => ctx.webServer.register({ kind: 'prefix', path: PREFIX, handler: serve }),
    'chobits-chii-dsh: live2d assets route'
  )
}
