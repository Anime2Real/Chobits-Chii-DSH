#!/usr/bin/env node
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const repository = 'https://github.com/Anime2Real/Chobits-Chii-DSH'
const commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim()
const publishTimestamp = Number(execFileSync('git', ['show', '-s', '--format=%ct', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim())

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
        zh: '中性暖调配色、明暗双 token、拍立得照片墙的小叽绘本风皮肤。',
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
          publishTimestamp,
          source: { type: 'git', url: repository, commit },
          engines: pkg.engines,
        },
      ],
    },
  ],
}

const output = join(root, 'market/index.json')
mkdirSync(dirname(output), { recursive: true })
writeFileSync(output, `${JSON.stringify(index, null, 2)}\n`)
console.log(`market/index.json: ${pkg.name}@${pkg.version} at ${commit.slice(0, 7)}`)
