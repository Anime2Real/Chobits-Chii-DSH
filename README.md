<div align="center">
  <h1>Chobits-Chii-DSH</h1>
  <p><b>叽～</b> 把 DeepSeek Harness 换成小叽的绘本风皮肤</p>
  <p>
    <a href="https://github.com/Anime2Real/Chobits-Chii-DSH"><img alt="GitHub" src="https://img.shields.io/badge/GitHub-Chobits--Chii--DSH-181717?logo=github"></a>
    <a href="LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-green.svg"></a>
    <a href="https://github.com/topics/dsh-plugin"><img alt="dsh-plugin" src="https://img.shields.io/badge/dsh--plugin-theme%20%2F%20skin-e86a92"></a>
  </p>
</div>

给 [DeepSeek Harness (DSH)](https://github.com/deepseek-ai/deepseek-harness) Web UI 的小叽皮肤插件:暖奶油底 + 暖墨文字 + 低饱和玫瑰点缀的中性配色,明暗两套 token,圆体字族、玫瑰色选中态、噪点纹理,以及沿界面四周散布、向中心渐隐的**拍立得照片墙**。设计风格与配图来自 [Chobits-Chii-Mascot-Release](https://github.com/Anime2Real/Chobits-Chii-Mascot-Release) 落地页。

> ⚠️ Chobits 及其角色的版权归 CLAMP 及相关权利方所有。本项目代码以 [MIT 许可证](./LICENSE) 发布,角色形象与随附素材仅用于本项目展示,请勿将角色形象用于商业用途。

## 安装

要求已安装 DSH(`dsh --version` 有输出),并启动过 `dsh web`:

```sh
dsh plugin --profile web add github:Anime2Real/Chobits-Chii-DSH
```

然后重启 `dsh web`(或刷新页面)。卸载:`dsh plugin --profile web remove chobits-chii-dsh`。

本地开发安装(在仓库目录下):

```sh
dsh plugin --profile web add ./   # 以 link 方式挂进 profile,改完 build 刷新即可
```

## 实现方式

纯客户端(client-only)插件,返回对象上声明 `inject: ['theme']` 让运行时在 theme 服务就绪后应用:

1. **theme 服务通道**(主通道):`theme.overrideTokens('chobits-chii', aliases)` 注册 66 个 `--dsw-*` token 的明暗两套覆盖(`src/tokens.js`),随 DSH 外观切换即时生效、可热清理。DSH 的主题渲染器把 token 写在 `<body>` 的 inline style 上,这是唯一能压过内置默认值的通道
2. **样式层**:向 `<head>` 注入带 `data-plugin-css` 去重标记的样式,承载字体、选中态、噪点纹理、粉彩光斑与照片墙(`src/skin.css`);其中 token 变量规则挂在 `body` 上,作为渲染器缺位时的次级保护

**配色取向**:主色为暖墨(浅色 `#4a4139` / 深色 `#efe6d8`),侧边栏为暖纸色(不再是粉色);低饱和玫瑰 `#b0687f` 只用于链接、选中、焦点和业务小标签,整体中性、不挑用户群。

**照片墙**:只使用落地页真实用到的 5 张插画(`chii-hero`、`chii-picturebook`、`chii-hideki-chibi`、`chii-headpat`、`chobits-family`),压缩为 520px jpg(共约 250KB)内联为 data URI;竖向图用竖拍立得(4:5)、横向图用横拍立得(5:4);双层 mask(中心径向渐隐 + 左侧 300px 条带)保证侧边栏和正文区始终清晰;窄窗口自动隐藏左侧与中右侧照片;`pointer-events: none` 不挡交互,明暗两套各自透明度。

## 开发

```sh
node scripts/build.mjs   # src/ + assets/ → lib/client.js(纯 JS,提交进仓库,安装免构建)
node scripts/smoke.mjs   # 无浏览器冒烟:ModuleLoader 契约 / 有无 theme 服务两种环境
```

目录结构:

```
package.json          # dsh.client 清单 + dsh.bundle.patch + dshTarget
cordis.patch.yml      # 向 web profile roster 插入 ui-chobits-chii 行
lib/index.js          # host 半(no-op 载体)
lib/client.js         # 浏览器半(构建产物,已提交)
src/client.template.js# lib/client.js 的模板(占位符由 build 替换)
src/tokens.js         # 明暗两套 --dsw-* token 集
src/skin.css          # 装饰层(字体/噪点/照片墙),支持 asset("name") 引用配图
assets/               # 5 张 jpg 配图(构建期内联)
scripts/build.mjs     # 构建脚本(仅 Node 原生 API,零依赖)
scripts/smoke.mjs     # 冒烟测试
```

token 名核对自 `@deepseek-ai/dsh-client-ui-theme@0.2.1-rc.5`(`dshTarget: 0.2.1-rc.5`);暗色选择器为 `body[data-ds-dark-theme]`。

## 路线图

- **v0.1**:皮肤 MVP —— token 双主题 + 字体/噪点
- **v0.2**:拍立得照片墙背景(中心渐隐)
- **v0.3(当前)**:中性配色 + 横竖拍立得 + 侧边栏/正文避让(仅用落地页 5 张图)
- **v0.4**:欢迎页/空状态大图配图、设置页开关
- **v1.0(第二阶段)**:Live2D 小叽桌宠(会话状态驱动动作表情、点击插话),复用 [Chobits-Chii-Mascot](https://github.com/Anime2Real/Chobits-Chii-Mascot) 的 chii 模型资产
