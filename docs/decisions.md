# 已采纳的决定 / Decisions

只记录 README 或提交历史里已经发生的事。不追加没有验证过的产品判断。
Accepted decisions that the README or git history already records. No new untested product claims.

## 仓库改名为 MediaMgDashboard / Rename

- **状态 / Status：** 已发生，2026-11-03（`3a1ab2b` 同轮迁库）。Done on 2026-11-03, in the same change as the audit work.
- 仓库从 `gsspai/mediaai` 迁到 **`shuishui313/MediaMgDashboard`**。旧仓库停用。
  The repository moved from `gsspai/mediaai` to **`shuishui313/MediaMgDashboard`**. The old repository is retired.
- 这次改的是仓库名。中文 README 标题现为 `MediaMgDashboard（MediaAI）`（2026-11-05，`173ec7d`）。产品文档 `docs/product-overview.html` 仍用产品名 MediaAI。英文 README 标题是 MediaMgDashboard (formerly MediaAI)。不要借这次改名去改界面文案。
  The rename is the repository name. The Chinese README title is now `MediaMgDashboard（MediaAI）` (2026-11-05, `173ec7d`). The product doc `docs/product-overview.html` still says MediaAI. The English README title says MediaMgDashboard (formerly MediaAI). Do not rewrite UI copy as part of the rename.
- 文档站目标地址是 https://shuishui313.github.io/MediaMgDashboard/ 。迁库后需要在新仓库开启一次 Pages；这项已于 2026-11-05 完成（`main` / `/docs`），站点返回 200，「当前状态」写作「已发布」。不要再写「需重新开启 Pages」或「站点不存在」。
  The target docs URL is that Pages address. Re-enabling Pages on the new repository was completed on 2026-11-05 (`main` / `/docs`); the site returns 200 and the status table says “Published”. Do not write “re-enable Pages” or “site missing” again.

## 中英双文件 / Dual-file bilingual README

- **状态 / Status：** 已采纳，2026-11-05（`dd8196f`）。Accepted on 2026-11-05.
- `README.md` 是中文，`README.en.md` 是英文。文首保留语言切换，不合并成一份中英夹杂的文件，也不删掉其中一份。
  Chinese lives in `README.md`, English in `README.en.md`. Keep the switchers. Do not merge them into one mixed file, and do not drop either file.
- 改一处说明时同步另一处。英文页链到只有中文的深文档时加 `(in Chinese)`。
  Update both files together. English links to Chinese-only deep docs say `(in Chinese)`.

## 数据：mock 与真实接口分开说 / Mock versus live data

- **状态 / Status：** 按 2026-11-05 两次合并后的 README 写法。Follow the README after both 2026-11-05 merges.
- 开篇曾经写「前端原型阶段 / 页面数据仍为前端 mock / 后端仅保留认证骨架」。这句和状态表矛盾，已在 2026-11-05 删掉。不要写回去。
  The opening used to say “frontend prototype / page data is still mock / the backend only has an auth skeleton”. That contradicted the status table and was removed on 2026-11-05. Do not put it back.
- 现在的开篇：主链路已跑通（登录与角色权限、平台账号与日指标含 CSV、机会 / 风险实时判定、商务单与内容计划、执行列表与跨角色待办、操作审计）。数据由后端接口返回；首页仍保留只在 `GetSummary` 整个失败时才出现的「静态示例数据」兜底卡片，执行列表与管理层概览没有 mock 兜底。开发态数据存本地 JSON。
  The opening now says the main path is wired: login and roles, platform accounts and daily metrics including CSV, live opportunity / risk detection, deals and content plans, execution lists and cross-role todos, and the audit log. Data comes from backend APIs. The home page still keeps labelled “static sample data” fallback cards that appear only when `GetSummary` fails entirely; the execution lists and management overview have no mock fallback. Development data lives in local JSON.
- 同一段点名尚未接入：飞书免登、飞书审批、平台 API 自动同步、`/connections/:platform` 详情页。
  The same paragraph names what is still open: Feishu SSO, Feishu approval, automated platform API sync, and the `/connections/:platform` detail page.
- 「当前状态」下面把两类行为分开写：接口完全不可用时 KPI 与信号降级为带「静态示例数据」标记的兜底卡片；执行列表三个 Tab 与管理层概览来自 `DashboardManager.GetSummary().Execution`，没有演示数据，失败时显示空态文案。不要把这两类混成「整个仓库仍是 mock」，也不要声称首页完全没有兜底常量。
  Under Current status, keep two cases apart: when the API fails entirely, KPI and signal blocks degrade to labelled “static sample data” fallback cards; the three execution tabs and the management overview read `DashboardManager.GetSummary().Execution`, have no demo data, and show empty states on failure. Do not collapse the two into “the whole repo is still mock”, and do not claim the home page has no fallback constants.

## CI 与 Pages 已启用 / CI and Pages are live

- **状态 / Status：** 2026-11-05 生效。Live on 2026-11-05.
- `.github/workflows/ci.yml`（网页端创建，`210c2e8`）与 `docs/ci-workflow.yml` 模板内容一致；首次 CI 运行 `41991927631` 为 success（后端 84 条单测、前端 17 条单测 + 类型 + lint + 构建）。
  `.github/workflows/ci.yml` (created in the web UI, `210c2e8`) matches the `docs/ci-workflow.yml` template. The first CI run `41991927631` passed: 84 backend tests plus 17 frontend tests, typecheck, lint, and build.
- Pages 的 `pages build and deployment` 也为 success，`https://shuishui313.github.io/MediaMgDashboard/` 返回 200。
  The Pages build/deployment run also passed, and `https://shuishui313.github.io/MediaMgDashboard/` returns 200.
- IDE 的 OAuth 凭据 scope 是 `gist, read:org, repo`，没有 `workflow`；修改 `.github/workflows/*` 仍需在网页端或用带该 scope 的凭据。
  The IDE OAuth credential has `gist, read:org, repo` but not `workflow`; edits to `.github/workflows/*` still need the web UI or a credential with that scope.
