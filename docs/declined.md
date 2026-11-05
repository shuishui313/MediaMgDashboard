# 明确不做 / Declined

本仓库不接下面这些事。对应的已采纳决定见 [decisions.md](decisions.md)。
This repository will not take the following. Accepted decisions are in [decisions.md](decisions.md).

## ruflo 不属于本仓库 / ruflo is not this project

- **状态 / Status：** 不做。Declined.
- 本仓库是 `shuishui313/MediaMgDashboard`。仓库里没有 ruflo 的路径、配置或依赖。
  This repository is `shuishui313/MediaMgDashboard`. It has no ruflo path, config, or dependency.
- 不引入、不嵌套、不配置、不修改 ruflo，也不要到别的项目里替它改文件。跟 ruflo 有关的请求停在本仓库边界上。
  Do not add, nest, configure, or edit ruflo, and do not edit some other project on its behalf. A ruflo request stops at this repository’s boundary.

## 不把两份 README 合成一份 / Do not merge the two READMEs

- **状态 / Status：** 不做。Declined. 双文件已在 2026-11-05 落地。The dual-file README landed on 2026-11-05.
- 不改成单文件中英夹杂，也不只留英文或只留中文。文首语言切换保留。
  Do not collapse to one mixed-language file, and do not keep only one language. Keep the switchers at the top.

## 不把删掉的「前端原型 / 全是 mock」写回去 / Do not restore the deleted prototype claim

- **状态 / Status：** 不做。Declined.
- 不恢复「前端原型阶段 / 页面数据仍为前端 mock / 后端仅认证骨架」。那句和状态表矛盾，`173ec7d` 已换成「主链路已跑通，飞书与平台同步未接」。
  Do not restore “frontend prototype / page data is still mock / auth skeleton only”. It contradicted the status table. `173ec7d` replaced it with “the main path is wired; Feishu and platform sync are not”.
- 也不要借「当前状态」下面的兜底说明改写成另一套完成度：KPI / 信号的「静态示例数据」确实存在，但只在 `GetSummary` 整个失败时出现；执行列表与管理层概览已接 `Execution`，接口失败时显示空态，不是 `ExampleView.tsx` 的演示数据。见 [decisions.md](decisions.md)。
  Do not use the fallback note under Current status to invent a different status story: the “static sample data” cards exist, but only when `GetSummary` fails entirely; the execution lists and management overview are backed by `Execution` and show empty states on failure, not demo data in `ExampleView.tsx`. See [decisions.md](decisions.md).
- 这些限制目前没有对应的 GitHub Issue。文档里不要编造 Issue 编号。
  There is no GitHub Issue for these limits. Do not invent issue numbers.
