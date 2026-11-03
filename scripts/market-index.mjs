#!/usr/bin/env node
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const repository = 'https://github.com/Anime2Real/Chobits-Chii-DSH'
const args = new Set(process.argv.slice(2))

if (args.has('--git') && args.has('--npm')) throw new Error('--git 与 --npm 只能选一个')

async function npmRelease() {
  try {
    const response = await fetch(`https://registry.npmjs.org/${encodeURIComponent(pkg.name)}`, {
      signal: AbortSignal.timeout(15000),
    })
    if (!response.ok) return undefined
    const document = await response.json()
    const published = document.time?.[pkg.version]
    if (document.versions?.[pkg.version] === undefined || typeof published !== 'string') return undefined
    return {
      source: { type: 'npm' },
      publishTimestamp: Math.floor(Date.parse(published) / 1000),
    }
  } catch {
    return undefined
  }
}

function gitRelease() {
  const commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim()
  const publishTimestamp = Number(execFileSync('git', ['show', '-s', '--format=%ct', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim())
  return {
    source: { type: 'git', url: repository, commit },
    publishTimestamp,
  }
}

let release
if (args.has('--npm')) {
  release = await npmRelease()
  if (release === undefined) throw new Error(`npm 上还没有 ${pkg.name}@${pkg.version},先执行 npm publish`)
} else if (args.has('--git')) {
  release = gitRelease()
} else {
  release = (await npmRelease()) ?? gitRelease()
}

const index = {
  format: 1,
  title: { en: 'Chobits Chii', zh: '小叽皮肤' },
  description: {
    en: 'Chii-themed skins and companions for the DeepSeek Harness web UI.',
    zh: 'DeepSeek Harness Web UI 的小叽主题皮肤与桌宠。',
  },
  metadata: {
    categories: {
      theme: { title: { en: 'Themes & Appearance', zh: '主题与外观' } },
    },
    labels: {
      'photo-wall': { title: { en: 'Photo wall', zh: '照片墙' } },
      'light-dark': { title: { en: 'Light & dark', zh: '明暗双主题' } },
    },
  },
  plugins: [
    {
      name: pkg.name,
      title: { en: 'Chobits Chii', zh: '小叽绘本皮肤' },
      description: {
        en: pkg.description,
        zh: '中性暖调配色、明暗双 token、拍立得照片墙,以及内置 Live2D 小叽桌宠(视线跟随)的小叽绘本风皮肤。',
      },
      author: pkg.author,
      homepage: pkg.homepage,
      repository: { url: repository },
      metadata: {
        category: 'theme',
        labels: ['photo-wall', 'light-dark'],
        keywords: pkg.keywords,
      },
      versions: [
        {
          version: pkg.version,
          publishTimestamp: release.publishTimestamp,
          source: release.source,
          engines: pkg.engines,
        },
      ],
    },
  ],
}

const output = join(root, 'market/index.json')
mkdirSync(dirname(output), { recursive: true })
writeFileSync(output, `${JSON.stringify(index, null, 2)}\n`)
console.log(`market/index.json: ${pkg.name}@${pkg.version} via ${release.source.type}`)
