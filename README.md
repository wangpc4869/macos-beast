# 牛马一生

上班时看着薪水往上跳的 macOS 桌面客户端。  
数据只存在本机，不联网、不上云。关掉窗口后下次打开会按时间戳自动补账。

## 功能概览

- 实时累计工资（月薪 / 日薪、午休扣除、可选加班倍率）
- 迷你浮窗、窗口置顶
- 打卡日历：补卡、事假、调休、出差补贴、法定假日加班
- 月薪 / 年薪覆盖、节假日涂鸦图标与签章
- 多皮肤、情绪小人、本地账本持久化

## 技术栈

| 层级 | 技术 |
|------|------|
| 桌面壳 | Electron 45 |
| 构建 | electron-vite + Vite 8 |
| 界面 | React 19 + TypeScript |
| 打包 | electron-builder（macOS arm64 DMG） |

## 环境要求

- macOS（Apple Silicon，当前产物为 `arm64`）
- Node.js 20+（建议 LTS）
- npm

> 国内网络下项目已配置 Electron 镜像（见 `.npmrc` 与脚本环境变量），一般可直接安装。

## 快速开始

```bash
# 克隆仓库
git clone <你的仓库地址>.git
cd badge   # 或你的本地目录名

# 安装依赖（会拉取 Electron）
npm install

# 开发模式（热更新）
npm run dev
```

也可以双击项目根目录的 `启动牛马计时器.command`：  
若已有打包产物会直接打开 App，否则走开发模式。

## 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 开发调试 |
| `npm run build` | 仅编译到 `out/` |
| `npm run dist:mac` | 编译并打出 macOS 安装包 |
| `npm run open` | 打开已打包的 `牛马一生.app` |
| `npm run typecheck` | TypeScript 类型检查 |
| `npm test` | 计薪引擎基础测试 |

## 目录结构

```text
badge/
├── src/
│   ├── main/                 # Electron 主进程（窗口、菜单、IPC）
│   ├── preload/              # 预加载桥
│   └── renderer/             # React 界面
│       └── src/
│           ├── engine/       # 计薪、日历、打卡、存储
│           ├── ui/           # 界面组件
│           └── wpc_App.tsx   # 根组件
├── scripts/                  # 图标生成、打包后签名、测试
├── build/                    # 图标、卸载/修复脚本（打包资源）
├── out/                      # 编译产物（不入库）
├── release/                  # DMG / .app（不入库）
├── package.json
├── electron.vite.config.ts
└── 启动牛马计时器.command
```

## 代码约定

- 函数使用箭头函数，命名加 `wpc_` 前缀（如 `wpc_startSession`）
- 函数需写 JSDoc 注释
- 使用 `const` / `let`，禁止 `var`
- 优先 TypeScript；复用项目内已有工具，勿随意引入过旧依赖

## 数据与隐私

| 项目 | 说明 |
|------|------|
| 存储位置 | `~/Library/Application Support/牛马一生/` |
| 前端键名 | `localStorage`：`wpc-niuma-ledger-v2` |
| 网络 | 无业务联网；账本不上传 |
| 卸载清数据 | 运行 `release/卸载牛马一生.command`（打包后会复制到此） |

改名自「牛马计时器」后，首次启动会尝试把旧目录数据迁移到新目录。

## 打包与分发

### 生成本地安装包

```bash
npm run dist:mac
```

产出（均在 `release/`，默认不提交到 Git）：

| 文件 | 用途 |
|------|------|
| `牛马一生-1.0.0-arm64.dmg` | 发给别人安装 |
| `mac-arm64/牛马一生.app` | 本机直接打开 |
| `首次打开-修复损坏.command` | 微信等渠道传来后首次打开用 |
| `卸载牛马一生.command` | 删除 App + 清除本地数据 |

当前配置：

- 架构：`arm64`（Apple Silicon）
- 签名：ad-hoc（`scripts/wpc_after_pack.cjs`），**未**使用 Apple 开发者证书
- `CSC_IDENTITY_AUTO_DISCOVERY=false`，避免本机误用证书导致打包失败

### 发给另一台 Mac

1. 发送 `牛马一生-*.dmg` 与 `首次打开-修复损坏.command`
2. 对方打开 DMG，把 App 拖进「应用程序」
3. **务必先运行** `首次打开-修复损坏.command`（右键 → 打开）  
   否则微信等来源会触发「已损坏，无法打开」（隔离属性 `com.apple.quarantine`）
4. 也可手动执行：

```bash
xattr -cr "/Applications/牛马一生.app"
open "/Applications/牛马一生.app"
```

### Intel Mac

当前只打 `arm64`。若需 Intel / 通用包，需在 `package.json` → `build.mac.target` 增加 `x64` 或 `universal` 后重新 `npm run dist:mac`。

## 开发说明（主流程）

1. **设置台账**（`wpc_Desk`）：月薪、计薪天数（默认 `21.5`）、上下班、午休  
2. **计薪引擎**（`engine/wpc_money.ts`）：按有效工时累计；摸鱼不停表，午休才扣时  
3. **会话**（`engine/wpc_session.ts`）：开始 / 暂停 / 结束；关闭窗口靠时间戳补算  
4. **日历打卡**（`engine/wpc_marks.ts` + `ui/wpc_Calendar.tsx`）：补卡、事假、调休、出差、假日加班费  
5. **节假日**（`engine/wpc_calendar.ts` + `ui/wpc_FestIcon.tsx`）：法定假与涂鸦图标  
6. **持久化**（`engine/wpc_storage.ts`）：读写 `localStorage` 整包状态

主进程能力通过 preload 暴露，渲染层用 `wpc_bridge` 调用（置顶、迷你窗、改标题等）。

## 调试建议

- 开发时用 `npm run dev`，改 UI / 引擎可即时验证  
- 看打包效果用 `npm run dist:mac` 再 `npm run open`  
- 日历详情标签样式：只用 `.cal-detail-meta > span`，避免嵌套 `span` 被套上胶囊边框导致图标崩坏  
- 清本地数据调试：运行卸载脚本，或手动删 `~/Library/Application Support/牛马一生/`

## 上传 GitHub 清单

仓库已忽略大体积与缓存目录（见 `.gitignore`）：

- `node_modules/`、`out/`、`release/`、`.cache/`、`.npm-cache/`

建议首次提交：

```bash
git add .
git status   # 确认没有 release/*.dmg、node_modules
git commit -m "Initial commit: 牛马一生 macOS 客户端"
git branch -M main
git remote add origin <你的仓库地址>.git
git push -u origin main
```

DMG 体积较大，请用 GitHub Releases 或网盘分发，不要把安装包提交进仓库。

## License

私有项目（`package.json` 中 `"private": true`）。若开源，请自行补充许可证文件。
