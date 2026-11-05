# 已采纳的决定 / Decisions

只记录 README 或提交历史里已经发生的事。不追加没有验证过的产品判断。
Accepted decisions that the README or git history already records. No new untested product claims.

## 仓库改名为 MediaMgDashboard / Rename

- **状态 / Status：** 已发生，2026-11-03（`3a1ab2b` 同轮迁库）。Done on 2026-11-03, in the same change as the audit work.
- 仓库从 `gsspai/mediaai` 迁到 **`shuishui313/MediaMgDashboard`**。旧仓库停用。
  The repository moved from `gsspai/mediaai` to **`shuishui313/MediaMgDashboard`**. The old repository is retired.
- 这次改的是仓库名。中文 README 标题现为 `MediaMgDashboard（MediaAI）`（2026-11-05，`173ec7d`）。产品文档 `docs/product-overview.html` 仍用产品名 MediaAI。英文 README 标题是 MediaMgDashboard (formerly MediaAI)。不要借这次改名去改界面文案。
  The rename is the repository name. The Chinese README title is now `MediaMgDashboard（MediaAI）` (2026-11-05, `173ec7d`). The product doc `docs/product-overview.html` still says MediaAI. The English README title says MediaMgDashboard (formerly MediaAI). Do not rewrite UI copy as part of the rename.
- 文档站目标地址是 https://shuishui313.github.io/MediaMgDashboard/ 。README 写的是迁库后要在新仓库 Settings → Pages 开启一次（`main` / `/docs`），「当前状态」同时写着「已发布（仓库迁移后需重新开启 Pages）」。两句都保留，不要改成「Pages 已经可用」或「站点不存在」。
  The target docs URL is that Pages address. The README says Pages must be enabled once on the new repository, and the status table also says “published (re-enable after the move)”. Keep both. Do not collapse them.

## 中英双文件 / Dual-file bilingual README

- **状态 / Status：** 已采纳，2026-11-05（`dd8196f`）。Accepted on 2026-11-05.
- `README.md` 是中文，`README.en.md` 是英文。文首保留语言切换，不合并成一份中英夹杂的文件，也不删掉其中一份。
  Chinese lives in `README.md`, English in `README.en.md`. Keep the switchers. Do not merge them into one mixed file, and do not drop either file.
- 改一处说明时同步另一处。英文页链到只有中文的深文档时加 `(in Chinese)`。
  Update both files together. English links to Chinese-only deep docs say `(in Chinese)`.

## 数据：mock 与真实接口分开说 / Mock versus live data

- **状态 / Status：** 按 README 在 `173ec7d` 之后的写法。Follow the README after `173ec7d`.
- 开篇曾经写「前端原型阶段 / 页面数据仍为前端 mock / 后端仅保留认证骨架」。这句和状态表矛盾，已在 2026-11-05 删掉。不要写回去。
  The opening used to say “frontend prototype / page data is still mock / the backend only has an auth skeleton”. That contradicted the status table and was removed on 2026-11-05. Do not put it back.
- 现在的开篇：主链路已跑通（登录与角色权限、平台账号与日指标含 CSV、机会 / 风险实时判定、商务单与内容计划、执行列表与跨角色待办、操作审计）。数据由后端接口返回，首页不再有 mock 常量。开发态数据存本地 JSON。
  The opening now says the main path is wired: login and roles, platform accounts and daily metrics including CSV, live opportunity / risk detection, deals and content plans, execution lists and cross-role todos, and the audit log. Data comes from backend APIs. The home page no longer keeps mock constants. Development data lives in local JSON.
- 同一段点名尚未接入：飞书免登、飞书审批、平台 API 自动同步、`/connections/:platform` 详情页。
  The same paragraph names what is still open: Feishu SSO, Feishu approval, automated platform API sync, and the `/connections/:platform` detail page.
- 「当前状态」下面仍有一句：接口不可用时 KPI 与信号显式降级为「静态示例数据」；执行列表三个 Tab 与管理层概览仍是 `ExampleView.tsx` 的演示数据。这句留着，不在这份文档改动里删掉，也不把它升格成「整个仓库仍是 mock」。
  Under Current status, one note remains: when the API is unavailable, KPI and signal blocks degrade to “static sample data”, and the three execution tabs plus the management overview are still demo data in `ExampleView.tsx`. Leave that note. Do not delete it in this docs change, and do not promote it into “the whole repo is still mock”.
