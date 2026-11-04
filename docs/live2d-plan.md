# Chii Live2D 接入方案（v1.x）

> 本文是 v1.x 分支的接入前分析：给现有皮肤插件增加一个可选的小叽 Live2D 桌宠。
> 结论都标注了依据（实测 / 代码核对 / 官方文档），未验证项单列在「待验证」一节。

## 结论先行

1. **技术可行，且已实测**。生产模型（moc3 v5、8192 贴图、22 组动作、3 个表情）在真实 Chromium 里用
   `pixi 6.5.10 + pixi-live2d-display 0.4.0 + Cubism Core 5.1.0` 正常渲染，无报错。
2. **真正的难点不是"能不能跑"，而是体积和显存**：模型 17.55 MB / 11 个请求；两张 8192×8192 RGBA 贴图
   约占 512 MB 显存。
3. **资产不能进 npm 包**。角色形象是 CLAMP 的 IP，17 MB 模型塞进 npm 包既不合规也不合理。
4. 建议分三步实施：**v1.1 静态立绘占位 → v1.2 Live2D 可选开启（外部模型源）→ v1.3 内置 web 精简模型**。

## 1. 现状：插件结构（v0.3.0）

- **纯客户端**：`lib/client.js` 由 `src/client.template.js` 替换 `__TOKENS__ / __CSS__ / __ASSETS__` 生成，安装后零构建
- 一切样式与 DOM 都走 `ctx.effect`，卸载即完全还原
- token 的唯一有效通道是 `theme.overrideTokens`，`exports.inject = ['theme']` 做激活门控
- 已经用 `fixed` 层叠了一层照片墙（`.chobits-chii-wall`，`z-index: 2147482000`，`pointer-events: none`）
- **没有 host 半逻辑**（`lib/index.js` 是空 `apply()`），也没有任何构建依赖

Live2D 会同时挑战后两条：需要 host 半伺服资产、需要引入第三方运行时库。

## 2. DSH 侧可用的接入点（已对照 dsh 0.2.1-rc.5 代码核对）

| 能力 | 用法 | 对本项目的意义 |
| --- | --- | --- |
| `shell.overlay` 槽位 | root 级，覆盖整个 frame（`ui-chat` 的额度提示就挂在这里） | 桌宠的天然落点，跨面板存活 |
| `ctx.slots.register({name,id,order,locale,inject}, Component)` | 组件可从平台模块 `require('react')` | 也可以不用 React，直接往 `body` 挂 canvas（与现有照片墙一致） |
| `useSessionStatus`（root hook） | `Map<sessionId, {running, pendingInteraction, completionUnread}>` | 状态联动的主要输入 |
| `ctx.remote.$on('api-session/status', (id, running))` | 全局会话运行状态事件 | 不用 React 也能订阅，适合纯 DOM 方案 |
| `ctx.remote.$on('approval/request')` / `'user-questions/request'` | 审批 / 提问交互 | "举手/警觉"类反应 |
| host 半 `ctx.webServer.register({kind:'prefix',path,handler})` | 插件自己开路由发静态资产 | 模型文件不用进 npm 包 |
| 插件配置 | Config 字段 + `.volatile()` 自动进 Settings 表单 | 开关、模型源、位置、缩放 |

补充事实：Web 主机**没有设置全局 CSP 头**（`dsh-host-webserver` 只注册路由），所以第三方 `<script>` 与 WASM 可用；
但仍建议默认自托管，避免离线/内网环境下挂掉。

## 3. 运行时选型

| 方案 | 组成 | 体积 | 优点 | 代价 |
| --- | --- | --- | --- | --- |
| A（推荐 MVP） | pixi 6.5.10 + pixi-live2d-display 0.4.0 + Cubism Core 5（CDN 或本地） | vendor 587 KB + Core 535 KB | 接入成本最低，`Chobits-Chii-Live2D/viewer` 已有现成用法，本次已实测通过 | 物理/表情行为不如官方 Framework 精细 |
| B | 官方 Cubism Web SDK Framework（Mascot 在用） | 更大，且需 TS 构建 | 与 Mascot 行为一致，可复用 trigger 语义 | 要给插件引入真实构建链，破坏"免构建安装" |

- **Core 许可**：`live2dcubismcore.min.js` 在 Live2D 官方的 `RedistributableFiles.txt` 清单内，
  允许按 Live2D Proprietary Software License 再分发（[清单](https://raw.githubusercontent.com/Live2D/CubismWebSamples/develop/Core/RedistributableFiles.txt)）。
  即便如此，建议**默认从官方 CDN 加载，允许设置项覆盖成本地文件**，避免把许可文件打进 MIT 仓库。
- `pixi.min.js` 自带一个 `vendor/live2d.min.js`（Cubism 2 运行时的桩），只为满足注册期符号引用，与模型无关。

## 4. 模型资产来源

**"源"指的是模型文件从哪来。** 运行时至少要 11 个文件（model3.json / moc3 / 2 张贴图 / idle 动作 /
物理 / cdi3 / 表情），插件可以从三个地方拿：

| 选项 | 文件从哪读 | 体积 | 首次体验 | 前提 |
| --- | --- | --- | --- | --- |
| A 本地目录 | 设置项填本机路径，host 路由 `ctx.webServer.register` 伺服 | 17 MB，零下载 | 最快 | 用户自己准备模型 |
| B 远程 URL | 一个公开 HTTPS 地址，浏览器跨域拉取 | 17.55 MB | 5–20 s（视网络） | 需要一个公开托管位置 |
| C 内置精简版 | 随 npm 包发布，host 路由伺服 | 2–3 MB | 最快且开箱即用 | 需先导出 web 变体 |

**关键事实**：`Chobits-Chii-Mascot` 和 `Chobits-Chii-Resource` 都是**私有仓库**，`Chobits-Chii-Mascot-Release`
里没有模型——所以"远程源"现在没有现成的公开地址。可行的托管点是**本仓库的 GitHub Pages**
（`https://anime2real.github.io/Chobits-Chii-DSH/`，已是公开站点、`access-control-allow-origin: *`，
照片墙的插画本来就走这里），把 web 变体放进去与现有做法一致。

**已决定（2026-11-03）**：走 **C 内置精简版**。`Chobits-Chii-Live2D` 已补上 `pipeline/export-web.mjs`，
现役运行时模型导出为 2.49 MB（1024 贴图 WebP：texture_00 180 KB + texture_01 3 KB；2026-11-04 由 2048 重导出），随 npm 包发布、
由 host 路由伺服；本地目录覆盖与远程源都先不做。

## 5. 状态联动映射（复用 Mascot 的 trigger 表）

| DSH 状态 | trigger | 动作组 | 说明 |
| --- | --- | --- | --- |
| 空闲 | `idle` | `Idle ×1`（loop） | 默认待机 |
| 会话 running | `thinking` | `Look ×1`（loop） | 也可用 `Body_sway` |
| 工具调用中（可选） | `processing` | `Brows ×1`（loop） | 需要更细的事件源 |
| 流式输出（可选） | `talk` + lipSync | `Talk ×1` + `ParamMouthOpenY` | 需要接文本流 |
| 等待审批 / 提问 | `surprised` / `curious` | `Surprise` / `Action ×3` | 用 `approval/request`、`user-questions/request` |
| 回合完成 | `success` | `Smile ×1` | 一次性 |
| 回合失败 | `error` / `failure` | `Head_shake` / `Sad` | 一次性 |

Mascot 的 `resources/characters/live2d/chii/live2d.json` 已经把 22 组动作映射成 33 个语义 trigger，
这份映射可以整份复用到插件里（纯数据，无依赖）。

## 6. 性能与降级

- **显存**：两张 8192² RGBA 贴图 ≈ 512 MB；移动端常见 `MAX_TEXTURE_SIZE` 为 4096，**会直接加载失败**。
  这是必须解决的硬约束 → 需要 C 方案（现用 1024 贴图 ≈ 8 MB）。
- **懒加载**：默认关闭；开启后首屏不阻塞，`requestIdleCallback` 之后再拉运行时；页面 `visibilitychange` 时暂停 rAF。
- **WebGL 上下文丢失**：监听 `webglcontextlost`，重建或降级为静态立绘。
- **降级路径**：无 WebGL → 显示静态立绘（可以直接复用照片墙里的 `wall-chii-hero` 或 `wall-chii-picturebook`），
  保证功能不缺失。
- **与照片墙的位置**：桌宠固定右下角，把右下角 `wall-chii-headpat` 向中间挪一点（`right: 9%` → 约 `right: 18%`）
  避开即可；v1.2 补一个"可拖动"设置项后，用户自己微调位置（拖动不算点击交互，与"不要点击交互"不冲突）。

## 7. 分阶段实施

> 本节原定的 v1.1 / v1.2 / v1.3 是**开发里程碑**（不是发版号）；实际以 **1.0.0** 一次性发布了下面 v1.1 的全部内容
> 加上 v1.2 的一部分（`running → Look` 联动、Plugins 页开关）。剩下的条目顺延到下个版本。

**v1.1 — 骨架（已随 1.0.0 发布）**
- host 半：`inject: ['webServer']` + `ctx.webServer.register({kind:'prefix', path:'/chii-live2d/assets', handler})`，
  从内置目录读文件（带路径穿越防护、`ETag`）
- 客户端：默认开启 + `<canvas>` 挂载 + pixi + pixi-live2d-display + Core 加载 + idle 渲染
- 位置：固定右下角，`wall-chii-headpat` 在桌宠在场时隐藏
- 验收：真实 `dsh web` 右下角能看到小叽待机，资产请求全部 200

**v1.1.1 — 联动（部分已随 1.0.0 发布）**
- ✅ `api-session/status` → `thinking` / `idle`
- ✅ Plugins 页开关（`plugins.bundle.config`）、点击穿透、视线跟随
- ⏳ `approval/request` → `surprised`、回合完成 / 失败 → 表情
- ⏳ 设置项：模型源（本地覆盖）、缩放、"可拖动"（默认关）

**v1.2 — 更小的精简模型 + 降级**
- ✅ Live2D 仓库贴图变体已定为 1024×1024（2026-11-04 按 1024 重导出，贴图 404 KB → 180 KB + 3 KB）
- 无 WebGL / 加载失败时降级为静态立绘（当前是直接退回照片墙）
- 性能巡检：首屏不加载、显存、帧率

## 8. 风险

| 风险 | 影响 | 应对 |
| --- | --- | --- |
| 角色形象许可 | npm 包/远程分发 CLAMP 形象 | 保持现有免责声明；模型不进 npm 包；默认源可配置 |
| Core 许可 | 再分发条款 | 默认 CDN，设置项覆盖本地 |
| moc3 v5 + pixi-live2d-display 0.4 | 已实测可通过（Core 5.1.0） | 锁定 Core 版本下限 |
| DSH API 迭代（0.2.x → 0.3.0） | `shell.overlay` / `remote.$on` 可能变 | 用 `engines.dsh` 限界；缺失服务时静默降级 |
| 包体积 | npm 包从 511 KB → +1.1 MB（不含模型） | 运行时库也可选择 CDN，看是否接受离线不可用 |
| 移动端显存 | 8192 贴图加载失败 | C 方案 + 静态降级 |

## 9. 待验证

- `shell.overlay` 里挂 canvas 时，与模态层（`--dsh-frame-overlay-top`）、拖拽区的 z-index/`pointer-events` 冲突
  —— 照片墙已有同类经验，但 canvas 需要 `pointer-events: auto`，需实测点击是否会挡住底下的按钮
- `useSessionStatus` 的 `pendingInteraction` 粒度是否足够驱动"审批"反应（可能与 `approval/request` 重复）
- 流式文本 → lipSync 的接入点（需要确认客户端能否拿到增量文本）
- 精简模型需要由 `Chobits-Chii-Live2D` 侧产出，本仓库只消费

## 10. 已拍板（2026-11-03）

1. **位置**：右下角。桌宠在场时 `wall-chii-headpat` 照片**直接隐藏**（`display: none`，不挪位置，避免和桌宠挤在一起）；
   桌宠关掉后它回到用户自己设的位置（`right: 10%` / `y: 82%`）。v1.2 再补"可拖动"设置项。
2. **点击交互**：**视线跟随做**（`autoInteract` 关掉、只在 `pointermove` 里手动 `model.focus`，所以点击不会触发动作）；
   点击触发动作（`TapBody`）留到后续版本；`prefers-reduced-motion` 或触屏下不启用视线跟随。
3. **气泡对话**：暂不做（TTS/ASR 留到后续大版本）。
4. **模型源**：**内置精简版**（2.49 MB，随 npm 包发布，host 路由伺服），不依赖远程托管。

仍然开放的问题：
- ✅ 精简模型的贴图尺寸：已定为 1024×1024（2026-11-04 重导出）。
- 是否把运行时库（pixi + pixi-live2d-display）也走 CDN，换取更小的 npm 包。

## 11. 实施记录（v1.1，已完成）

已落地：

- `Chobits-Chii-Live2D/pipeline/export-web.mjs`：导出 web 精简模型（`sharp` 仅 devDependency）
- `assets/live2d/`：44 个文件、2.49 MB——模型 + 运行时库 + Cubism Core（含 `LICENSE-Live2D-Core.md` 与
  `RedistributableFiles.txt`）+ `SOURCE.md`
- `lib/index.js`：`ctx.webServer.register({kind:'prefix', path:'/chii-live2d/assets'})`，带路径穿越防护、
  `ETag` / `Cache-Control`、GET/HEAD、405
- `src/live2d.js`：懒加载（首屏后 `requestIdleCallback`）、`saveData` / 慢网络不自动加载、点击穿透、
  `visibilitychange` 暂停 rAF、WebGL 失败时安静退回照片墙、桌宠身上不带关闭按钮（开关只在 Plugins 页）、
  视线跟随（`autoInteract: false` + 手动 `model.focus`，传的是「画布中心 → 指针」的方向在画布内的投影点）
- `src/client.template.js`：`running → Look` / 空闲 → `Idle`；`plugins.bundle.config` 配置页（**小叽桌宠** 开关）
- `src/skin.css`：照片墙 `z-index: 30`、桌宠 `z-index: 35`——在正文之上、菜单（70）/ 弹窗（1000）/
  toast（1100）之下，弹窗打开时会被遮罩正常压暗

已在真实 Chromium 里验证：

- 模型（moc3 v5 + WebP 贴图）在 `pixi 6.5.10 + pixi-live2d-display 0.4.0 + Core 5.0.0` 正常渲染，
  10 个资产请求全部 200、无报错
- canvas 中心 `elementFromPoint` 命中底层 `scrollBody`——不挡点击，桌宠身上也没有任何可点元素
- **开关（Plugins → chobits-chii-dsh → 小叽桌宠）**：关 → 桌宠立即卸载、写入 `off`；再开 → 立即挂载并
  `data-ready`；这是关闭桌宠的唯一入口
- 视线跟随：把指针放到左 / 右 / 上 / 下四个方向各截一帧，左右相差 40,319 像素、上下相差 51,028 像素
  （最大差值 234–238）——四个方向各不相同，说明方向映射正确（修复前只有画布附近的指针才会改变方向）
- 右下角让位：桌宠在场时 `wall-chii-headpat` 的 `display` 为 `none`；关掉桌宠后回到 `display: block`、`right: 144px`（用户自己的位置）
- 弹窗层级：打开 Settings 时 `wallZ=30`、弹窗根 `1000`，照片墙与桌宠都被压暗
- 明暗两套预览截图已更新到 `docs/preview-{light,dark}.png`

一个踩过的坑（值得记下）：`ctx.effect(fn)` 会**立刻调用 fn 并把返回值当清理函数**，所以传进去的必须是工厂，
不能是已经建好的清理函数——否则桌宠一挂载就被自己清理掉。

未验证：`running → Look` 的状态联动只做了代码核对，没有跑真实回合（需要花一次真实模型调用）；
`approval/request` 等更细的事件留给 v1.2。
