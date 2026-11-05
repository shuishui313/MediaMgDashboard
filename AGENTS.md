# AGENTS.md

在本仓库改代码或文档时遵守下面的约定。每条先写中文，后面是 English。
Rules for this repository. Chinese first, then English.

本文件只约束 `shuishui313/MediaMgDashboard`。ruflo 不是本仓库里的项目：不要添加、嵌套、配置或修改它。见 [docs/declined.md](docs/declined.md)。
This file applies only to `shuishui313/MediaMgDashboard`. ruflo is not this project: do not add, nest, configure, or edit it.

## 文档 / Docs

- 说明是两份文件：`README.md`（中文）和 `README.en.md`（English）。改其中一份时，另一份的对应段落一起改。文首的语言切换保持原样：中文页是 `**中文** | [English](README.en.md)`，英文页是 `[中文](README.md) | **English**`。
  Two READMEs. A change to one updates the matching part of the other. Keep those switchers.
- 英文 README 链到只有中文的深文档时，在链接旁写 `(in Chinese)`。目前包括产品文档站（`docs/product-overview.html` / `docs/index.html`）和 `docs/implementation-plan.md`。`docs/service-invoker-auth-flow.md` 与 `docs/service-invoker-streaming.md` 是英文，不加这句。
  Mark links to Chinese-only deep docs with `(in Chinese)`. The two ServiceInvoker notes are English and do not get the marker.
- 已采纳的决定写在 [docs/decisions.md](docs/decisions.md)，明确不做的写在 [docs/declined.md](docs/declined.md)。
  Accepted decisions and declined work live in those two files.
- 完成度按 README 现在的写法。开篇是「主链路已跑通」，并点名尚未接入的飞书免登、飞书审批、平台 API 自动同步、`/connections/:platform`。不要把已经删掉的「前端原型阶段 / 页面数据仍为前端 mock / 后端仅认证骨架」写回去。「当前状态」下面要分清两类：KPI / 信号仅在 `GetSummary` 整个失败时降级为带「静态示例数据」标记的兜底卡片；执行列表三个 Tab 与管理层概览来自 `GetSummary().Execution`，没有演示数据、失败时显示空态。没有对应 Issue，不要编造编号。
  Status follows the README as it stands: the opening says the main path is wired and names what is still open. Do not restore the deleted “frontend prototype / page data is still mock / auth skeleton only” sentence. Under Current status keep two cases distinct: KPI / signal blocks fall back to labelled “static sample data” only when `GetSummary` fails entirely, while the three execution tabs and the management overview read `GetSummary().Execution`, have no demo data, and show empty states on failure. Do not invent issue numbers.

## 角色常量 / Roles

- `Services/App.Api/Utilities/Roles/Roles.cs` 与 `react-app/src/utils/roles.ts` 必须一起改。README 里的短路径是 `src/utils/roles.ts`。
  A change in one file must land in the other.

## RPC / Manager

- 新增业务能力：在 `Contracts.Dto` 定义 DTO → 在 `App.Api/Managers` 新增 Manager 方法，并标 `[RequireAuthenticated]` / `[RequireRole]` → 在 `react-app/src/api` 增加薄封装。
  That is how a capability is added.
- **不要修改 ServiceInvoker**（`Services/App.ServiceInvoker`）。鉴权、刷新、调用顺序由它统一协调。
  Do not edit ServiceInvoker.
- 新增指标入口必须写入 `MetricDaily.Source` 与 `RecordedBy`，否则数字无法回溯。`Source` 取 `api` / `manual` / `csv` / `seed`。
  New metric ingest must set `Source` and `RecordedBy`.

## 密钥 / Secrets

- 真实密钥不入库。`react-app/.env`、`react-app/.env.local`、`Services/App.Api/appsettings.Development.json`、`appsettings.*.local.json` 已在 `.gitignore`。`appsettings.json` 只留占位值。
  Do not commit secrets. Those paths are gitignored. `appsettings.json` keeps placeholders.
- `AccessToken` / `RefreshToken` 只走请求体和响应 envelope，不写日志、不进 UI、不进错误提示、不进截图和文档。`SupabaseSecretKey` 与全部 `Feishu__*` 只留在服务端，不下发浏览器。
  Tokens stay in the body and the envelope. Server keys, including every `Feishu__*` setting, stay on the server.
- 文档和截图里的密钥写成 `sk_****`、`eyJ****` 或 `<masked>`。误提交后先在 Supabase / 数据库侧轮换密钥，再清理 Git 历史。只删提交、不轮换，等于没做。
  Redact. If a secret is committed, rotate it first, then scrub history.
- 提交前自检：
  Check before committing:

```bash
git grep -nE "eyJ[A-Za-z0-9_-]{20,}|sk_[A-Za-z0-9]{10,}|postgres(ql)?://[^\"' ]+@"
git status --ignored --short | grep -E "\.env|appsettings"
```

## 界面 / UI

来自 README「设计系统与 UI 规范」。
From the design-system section of the README.

- 新页面复用 `react-app/src/components/dashboard/` 里的 `PageShell`、`Panel`、`SectionHeader`、`StatusPill`、`SegmentedTabs`、`TrendChart`，不要另写一套卡片。
  Reuse those components.
- 只用语义色：`bg-background`、`bg-card`、`text-foreground`、`text-muted-foreground`、`border-border`、`text-success`。不要写 `#101114`、`bg-white/90`、`rgba(...)`。
  Semantic colors only. Hard-coded theme colors break dark mode.
- 数字用 `formatCompactNumber()`（`万` / `千`），不要在同一页混用 `k`、`w`、`万`。区块标题用 `SectionHeader`（`h2`），页面主标题用 `h1`。
  Use `formatCompactNumber()`. Section titles use `SectionHeader`.
- 新的异步区域同时给出 loading（骨架）、empty、error。可点击区域用 `Link` / `Button`。图表带 `role="img"` 与 `aria-label`。
  A new async region has loading, empty, and error. Charts expose a name.

## 仓库操作 / Repo operations

- CI 已于 2026-11-05 启用：工作流在 `.github/workflows/ci.yml`，`docs/ci-workflow.yml` 是同步的模板，首次运行通过。IDE 的 OAuth 凭据没有 `workflow` 权限，不能推送或修改 `.github/workflows/*`；要改 CI 规则请用网页端编辑，或改模板后再复制过去。不要为了绕过权限去改应用代码。
  CI has been enabled since 2026-11-05: `.github/workflows/ci.yml` is the live workflow, `docs/ci-workflow.yml` is the synced template, and the first run passed. The IDE OAuth credential lacks the `workflow` scope, so it cannot push or edit `.github/workflows/*`. Change CI in the web UI or edit the template and copy it over. Do not refactor the app to work around that.
- 产品文档站是 `docs/` 下的静态文件，由 GitHub Pages 从 `main` 的 `/docs` 发布。Pages 已于 2026-11-05 在新仓库启用，线上地址返回 200；改文档只需推送 `main`。
  Pages serves `/docs` on `main` and was enabled on the new repository on 2026-11-05. The site returns 200; pushing docs to `main` republishes them.
