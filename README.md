<div align="center">
  <h1>Chobits-Chii-DSH</h1>
  <p><b>叽～</b> 把 DeepSeek Harness 换成小叽的绘本风皮肤</p>
  <p>
    <a href="https://github.com/Anime2Real/Chobits-Chii-DSH"><img alt="GitHub" src="https://img.shields.io/badge/GitHub-Chobits--Chii--DSH-181717?logo=github"></a>
    <a href="LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-green.svg"></a>
    <a href="https://github.com/topics/dsh-plugin"><img alt="dsh-plugin" src="https://img.shields.io/badge/dsh--plugin-theme%20%2F%20skin-e86a92"></a>
  </p>
</div>

给 [DeepSeek Harness (DSH)](https://github.com/deepseek-ai/deepseek-harness) Web UI 的小叽皮肤插件:奶油底 + 腮红粉 + 暖棕描边的绘本配色,明暗两套 token,圆体字族、粉色选中态、噪点纹理和左下角漂浮的小叽角标。设计风格与配图来自 [Chobits-Chii-Mascot-Release](https://github.com/Anime2Real/Chobits-Chii-Mascot-Release) 落地页。

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

纯客户端(client-only)插件,两条互补的作用通道:

1. **theme 服务**(优先通道):`theme.overrideTokens('chobits-chii', aliases)` 注册 66 个 `--dsw-*` token 的明暗两套覆盖(`src/tokens.js`),随 DSH 外观切换即时生效、可热清理
2. **样式注入**(兜底通道):向 `<head>` 注入带 `data-plugin-css` 去重标记的样式,承载字体、选中态、噪点纹理与配图(`src/skin.css`),在 theme 服务不可用时依然生效

配图在构建期内联为 data URI(`assets/*.webp` → base64),产物单文件、免网络请求。

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
src/skin.css          # 装饰层(字体/噪点/角标),支持 asset("name") 引用配图
assets/               # webp 配图(构建期内联)
scripts/build.mjs     # 构建脚本(仅 Node 原生 API,零依赖)
scripts/smoke.mjs     # 冒烟测试
```

token 名核对自 `@deepseek-ai/dsh-client-ui-theme@0.2.1-rc.5`(`dshTarget: 0.2.1-rc.5`);暗色选择器为 `body[data-ds-dark-theme]`。

## 路线图

- **v0.1(当前)**:皮肤 MVP —— token 双主题 + 字体/噪点/角标
- **v0.2**:欢迎页/空状态配图(chii-hero、chii-picturebook)、设置页开关
- **v1.0(第二阶段)**:Live2D 小叽桌宠(会话状态驱动动作表情、点击插话),复用 [Chobits-Chii-Mascot](https://github.com/Anime2Real/Chobits-Chii-Mascot) 的 chii 模型资产
