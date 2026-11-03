<div align="center">
  <h1>Chobits-Chii-DSH</h1>
  <p><b>叽～</b> 把 DeepSeek Harness 换成小叽的绘本风皮肤</p>
  <p>A Chii-themed skin plugin for the DeepSeek Harness web UI.</p>
  <p>
    <a href="https://github.com/Anime2Real/Chobits-Chii-DSH"><img alt="GitHub" src="https://img.shields.io/badge/GitHub-Chobits--Chii--DSH-181717?logo=github"></a>
    <a href="LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-green.svg"></a>
    <a href="https://github.com/topics/dsh-plugin"><img alt="dsh-plugin" src="https://img.shields.io/badge/topic-dsh--plugin-b0687f"></a>
    <a href="https://github.com/deepseek-ai/deepseek-harness"><img alt="dshTarget" src="https://img.shields.io/badge/dsh-0.2.1--rc.5-b0687f"></a>
  </p>
</div>

<p align="center">
  <img src="docs/preview-light.png" alt="浅色模式预览" width="49%" />
  <img src="docs/preview-dark.png" alt="深色模式预览" width="49%" />
</p>

> ⚠️ Chobits 及其角色的版权归 CLAMP 及相关权利方所有。本项目代码以 [MIT 许可证](./LICENSE) 发布,角色形象与随附素材仅用于本项目展示,请勿将角色形象用于商业用途。

## ✨ 功能特性

- **中性暖调配色**:暖奶油底 + 暖墨文字 + 低饱和玫瑰点缀,浅色 / 深色两套 token(色板取自 [Chobits-Chii-Mascot-Release](https://github.com/Anime2Real/Chobits-Chii-Mascot-Release) 落地页,并按中性化取向收敛)
- **拍立得照片墙**:落地页同款 5 张插画做成横 / 竖拍立得贴片,沿界面四周散布、向中心渐隐;左侧 300px 侧边栏区与正文区永不遮挡,窄窗口自动隐藏边缘照片
- **细节装饰**:圆体字族、玫瑰色选中态、绘本噪点纹理、暖调背景光斑
- **纯客户端、免构建安装**:`lib/client.js` 已随仓库提交,`dsh plugin add` 后即可用;所有配图构建期内联为 data URI,单文件、无网络请求
- **可热卸载**:一切样式与 DOM 注入都走 `ctx.effect`,禁用 / 卸载插件即完全还原

## 🚀 安装

要求已安装 DeepSeek Harness(`dsh --version` 有输出),并至少启动过一次 `dsh web`:

```sh
# npm(发布后可用)
dsh plugin --profile web add chobits-chii-dsh

# GitHub 源(无需 npm)
dsh plugin --profile web add github:Anime2Real/Chobits-Chii-DSH
```

安装后重启 `dsh web`(或刷新页面)。卸载:

```sh
dsh plugin --profile web remove chobits-chii-dsh
```

### 在 Discover 中发现

DSH 的 Plugins → Discover 只显示用户自己添加的索引源。打开 **Plugins → Experimental plugins → Custom plugin indexes**,在 **Discover → Add index source** 里加入:

```
https://cdn.jsdelivr.net/gh/Anime2Real/Chobits-Chii-DSH@main/market/index.json
```

然后搜索 "Chii" 即可一键安装。索引文件是 [`market/index.json`](./market/index.json),格式为 DSH 的 format 1。

本地开发安装(在仓库目录下,以 link 方式挂进 profile):

```sh
dsh plugin --profile web add ./
```

## 🧩 兼容性

| 项 | 值 |
| --- | --- |
| `engines.dsh` | `>=0.2.1-rc.5 <0.3.0` |
| 暗色选择器 | `body[data-ds-dark-theme]` |
| token 名来源 | `@deepseek-ai/dsh-client-ui-theme@0.2.1-rc.5` 内置设计平台样式 |

DSH 处于 developer preview,升级后若 token 名或客户端插件契约变化,皮肤可能失效——此时更新 `src/tokens.js` 与 `package.json` 的 `engines.dsh` 即可。样式层另有 `body` 级 token 兜底规则,即使 theme 服务不可用也能保持大部分观感。

## 🔧 工作原理

纯客户端(client-only)插件,返回对象上声明 `inject: ['theme']`,由运行时在 theme 服务就绪后应用:

1. **theme 服务通道**(主通道):`theme.overrideTokens('chobits-chii', aliases)` 注册 66 个 `--dsw-*` token 的明暗两套覆盖(`src/tokens.js`),随 DSH 外观切换即时生效、可热清理。DSH 的主题渲染器把 token 写在 `<body>` 的 inline style 上,这是唯一能压过内置默认值的通道
2. **样式层**:向 `<head>` 注入带 `data-plugin-css` 去重标记的样式,承载字体、选中态、噪点、光斑与照片墙(`src/skin.css`);token 变量规则同时挂在 `body` 上,作为渲染器缺位时的次级保护
3. **照片墙**:`src/client.template.js` 的 `WALL` 数组驱动,5 张 520px jpg(`assets/wall-*.jpg`,共约 250KB)构建期内联为 data URI;竖向图 4:5、横向图 5:4,双层 mask(中心径向渐隐 + 左侧条带)保证可读性

## 🎨 自定义

- **调色**:改 `src/tokens.js` 的 token 值(明暗成对),重建即可
- **照片墙**:改 `src/client.template.js` 的 `WALL` 数组(`portrait` 控制横竖、`wide` / `tallOnly` 控制窄窗口显隐、`r` 旋转、`s` 缩放);换图把文件放进 `assets/` 即可
- **渐隐范围与透明度**:`src/skin.css` 的 `.chobits-chii-wall`

改完执行 `node scripts/build.mjs`,重启 `dsh web` 并刷新页面。

## 🛠 开发

```sh
node scripts/build.mjs        # src/ + assets/ → lib/client.js(纯 JS,提交进仓库,安装免构建)
node scripts/smoke.mjs        # 无浏览器冒烟:ModuleLoader 契约 / 有无 theme 服务两种环境
node scripts/market-index.mjs # 发布新版本后重新生成 market/index.json(优先 npm 源,未发布时回退到当前 commit)
```

目录结构:

```
package.json           # dsh.client 清单 + dsh.bundle.patch + engines.dsh
cordis.patch.yml       # 向 web profile roster 插入 ui-chobits-chii 行
lib/index.js           # host 半(no-op 载体)
lib/client.js          # 浏览器半(构建产物,已提交)
src/client.template.js # lib/client.js 的模板(占位符由 build 替换)
src/tokens.js          # 明暗两套 --dsw-* token 集
src/skin.css           # 装饰层(字体/噪点/照片墙),支持 asset("name") 引用配图
assets/                # 5 张 jpg 配图(构建期内联)
docs/                  # README 预览截图
market/index.json      # Discover 索引(format 1)
market/awesome/        # awesome-dsh-plugin 投稿条目
scripts/build.mjs      # 构建脚本(仅 Node 原生 API,零依赖)
scripts/smoke.mjs      # 冒烟测试
scripts/market-index.mjs # 生成 Discover 索引
```

## 🗺 路线图

- **v0.1**:皮肤 MVP —— token 双主题 + 字体/噪点
- **v0.2**:拍立得照片墙背景(中心渐隐)
- **v0.3(当前)**:中性配色 + 横竖拍立得 + 侧边栏/正文避让(仅用落地页 5 张图)
- **v0.4**:欢迎页/空状态大图配图、设置页开关
- **v1.0(第二阶段)**:Live2D 小叽桌宠(会话状态驱动动作表情、点击插话),复用 [Chobits-Chii-Mascot](https://github.com/Anime2Real/Chobits-Chii-Mascot) 的 chii 模型资产

## 🔗 小叽家族

| 项目 | 说明 |
| --- | --- |
| [Chobits-Chii-Mascot](https://github.com/Anime2Real/Chobits-Chii-Mascot) | 桌面精灵客户端(Electron + Live2D,本插件第二阶段的模型来源) |
| [Chobits-Chii-Mascot-Release](https://github.com/Anime2Real/Chobits-Chii-Mascot-Release) | 桌面精灵公开发布渠道与[产品主页](https://anime2real.github.io/Chobits-Chii-Mascot-Release/)(皮肤配色与配图来源) |
| [Chobits-Chii-TTS](https://github.com/Anime2Real/Chobits-Chii-TTS) | 小叽语音合成模型 |
| [Chobits-Chii-ASR](https://github.com/Anime2Real/Chobits-Chii-ASR) | 小叽语音识别服务 |
| [Chobits-Chii-LLM](https://github.com/Anime2Real/Chobits-Chii-LLM) | 小叽日语对话 LLM |
| [Chobits-Chii-Live2D](https://github.com/Anime2Real/Chobits-Chii-Live2D) | 小叽 Live2D 模型与动作资产 |

## 📄 许可证

[MIT](./LICENSE)。角色形象与随附素材(插画、Live2D 模型)版权归 CLAMP 及相关权利方,仅用于非商业展示。
