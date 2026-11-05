# HANDOFF

> 交接文档 · 更新于 2026-11-05
> 仓库：`shuishui313/MediaMgDashboard`（public，2026-11-03 从 `gsspai/mediaai` 迁入） · 分支 `main` · 工作区改动待提交（本轮 CI / Pages 启用后的文档同步）

---

## 1. 当前进度

最近几步：产品文档静态站点（`81ba382`）、认证闭环（`4100139`）、首页指标接真实接口（`3e1679c`）、账号与手工录入闭环（`65ea081`）、爆款机会 / 限流风险接真实计算、阈值可配 + CSV 批量导入（`8d43505`）、业务角色权限落地（`58be3ba`）、执行列表三块接真实接口（`55eba5b`）、操作审计 + 仓库迁到 `shuishui313/MediaMgDashboard`（`3a1ab2b`）、**CI + 84 条后端单测 + 信号转跟进待办（本轮，未提交）**。

已到达的状态：

- 产品文档已发布为静态站点 **https://shuishui313.github.io/MediaMgDashboard/**，手机与桌面都能正常打开。
- 登录可用：未登录访问任意受保护路由 → `/login` → 登录 → 回到来源路径；飞书免登未接入。
- 首页四个 KPI 与平台走势来自 `DashboardManager.GetSummary`，每个数字带「数据来源」与回溯文案；接口失败时显式降级为「静态示例数据」，不伪装成真实数据。
- 数据模型与指标口径已写进 README「看板指标与数据模型」一节。
- `/connections` 可用：新增 / 编辑 / 停用账号，手工录入任意一天指标，最近录入明细带来源与录入人；同账号同日覆盖，停用后拒绝录入。
- 首页「爆款机会」「限流 / 掉速风险」由 `DashboardManager` 按日记录实时算，每条带触发值与依据，面板下方写明判定规则。

- 权限矩阵已生效：阈值仅管理员可读写，账号与指标写接口限管理员 / 运营，访客只读；越权返回 403 + 中文原因，前端同步隐藏入口。
- 首页执行列表三块（商务单 / 内容计划 / 跨角色待办）与管理层概览来自 `Deal` / `ContentPlan` / `TodoItem` 三个文档，`/business`、`/business/:dealId`、`/plans`、`/plans/:planId` 四个页面均可用（新建、编辑、阶段推进/复核）。待办里的「自动」条目由单据状态推导，不落库。
- 操作审计已落地：11 类写操作落 `AuditLog`（字段级前后值），`/settings` 底部可筛选、按天分组、展开看 diff；只保留 90 天，查询时自动清理。仅管理员可读。

- **CI 与 Pages 已于 2026-11-05 启用**：`.github/workflows/ci.yml`（网页端创建，`210c2e8`）与模板 `docs/ci-workflow.yml` 一致，首次 CI 运行成功；Pages `main` / `/docs` 已发布，站点返回 200。IDE 凭据仍无 `workflow` scope，改工作流要走网页端。
- 远端 `ce0cfde` 带来的 `AGENTS.md` / `docs/decisions.md` / `docs/declined.md` 已合并；这三份文档把「执行列表仍是演示数据」「首页没有 mock 常量」写成了既定事实，与代码不符，已连同中英文 README 一起按实际行为修正。
- 首页机会 / 风险信号可一键生成待办（风险给运营、机会给策划），`SourceKey` 保证同一条信号不重复建单。
- 中英文 README 双文件维护（`README.md` / `README.en.md`），改状态口径时两份要同步；合并远端 `dd8196f` 时是 fast-forward，无 Git 冲突，但两个文件开头的「前端原型阶段」描述与状态表矛盾，已统一改为「主链路已跑通、飞书与平台同步未接」。

**未开始**：飞书免登、`RoleMappingConfig` / 用户组同步、平台 API 同步、飞书审批回写报价阶段、审计导出、三态组件统一。`/connections/:platform` 仍是占位。

---

## 2. 已完成事项

### 2.1 提交记录（`main` 分支）

| 版本 | 时间 | 内容 |
| --- | --- | --- |
| （待提交） | 2026-11-05 | CI / Pages 启用后同步中英文 README、AGENTS、decisions 与 HANDOFF 中的状态描述 |
| `210c2e8` | 2026-11-05 | 远端提交：在网页端创建 `.github/workflows/ci.yml`，启用 CI（首次运行 success） |
| `adb785f` | 2026-11-05 | 合并远端 `ce0cfde`（UX 三件套 / AGENTS / decisions），修正「执行列表仍是演示数据」「首页没有 mock 常量」等与代码矛盾的描述，中英同步 |
| `ce0cfde` | 2026-11-05 | 远端提交：新增 `AGENTS.md`、`docs/decisions.md`、`docs/declined.md`、PR 模板与 README「已知限制」章节 |
| `173ec7d` | 2026-11-05 | 合并远端双语 README（`dd8196f`），修掉中英文开头「前端原型 / 数据仍是 mock」的过时描述，同步 lint 说明 |
| `dd8196f` | 2026-11-05 | 远端提交：新增 `README.en.md` + 中文 README 语言切换链接 |
| `149abc5` | 2026-11-04 | CI 模板、84 条后端单测、lint 存量清零、首页信号一键转待办（按 `SourceKey` 幂等） |
| `3a1ab2b` | 2026-11-03 | 操作审计（`AuditLog` + `AuditRecorder` + 设置页面板）；仓库迁到 `shuishui313/MediaMgDashboard` |
| `55eba5b` | 2026-10-28 | 执行列表接真实接口：`Deal` / `ContentPlan` / `TodoItem` + 三个 Manager + 四个页面；删除 `/analysis/:viewId` |
| `58be3ba` | 2026-10-28 | 业务角色权限落地：`[RequireRole]`、403 中文原因、管理员引导、前端入口按角色显隐 |
| `8d43505` | 2026-10-27 | CSV 批量导入（`MetricManager.ImportCsv`）与可配判定阈值（`/settings`）；作者邮箱改为 GitHub noreply |
| `3e1679c` | 2026-10-19 | 首页 KPI 与平台走势接入 `DashboardManager.GetSummary`，新增 `PlatformAccount` / `MetricDaily` |
| `4100139` | 2026-10-18 | 补业务角色、新增登录页并挂上受保护路由 |
| `81ba382` | 2026-10-18 00:22 | 产品文档适配移动端：取消固定侧栏、表格与甘特图横向滚动 |
| `b72fdac` | 2026-10-18 00:05 | 统一口径为「个人自媒体矩阵运营工作台」，README 与产品文档对齐 |
| `98183e4` | 2026-10-17 23:59 | README 增加文档入口与 GitHub Pages 发布说明 |
| `8793153` | 2026-10-17 23:56 | 增加 Pages 入口页 `docs/index.html` 与 `docs/.nojekyll` |
| `89132df` | 2026-10-17 23:55 | 新增产品文档与落地实施方案；看板接入 dashboard 组件与真实数据结构 |

### 2.2 产品文档与发布

- `docs/product-overview.html` — 单文件静态文档，10 章：产品定位、用户与角色、信息架构、界面结构、关键流程、指标口径、权限设计、分期计划、非功能需求、验收标准。纯 CSS 可视化（角色卡、流程图、甘特图、权限矩阵），无外部依赖、无构建。
- `docs/index.html` — `product-overview.html` 的**逐字节副本**，作为 Pages 根路径入口。
- `docs/.nojekyll` — 跳过 Jekyll 处理。
- Pages 配置：`Deploy from a branch` → `main` / `/docs`，推送到 `main` 后约 1 分钟自动发布。

### 2.3 口径统一（`b72fdac`）

| 位置 | 改为 |
| --- | --- |
| README 标题 | `MediaAI — 个人自媒体矩阵运营工作台` |
| README 定位句 | 面向个人自媒体矩阵，附产品文档链接 |
| README 技术栈 | 身份改为飞书自建应用免登；Supabase 退为数据库托管 |
| README 认证与会话 | 飞书换 `open_id` → 本系统 JWT；角色来自用户组映射 + `OwnerId` 二次校验 |
| README 角色表 | 管理员 / 商务 / 财务 / 策划 / 运营 / 剪辑 / 分析 / 访客，默认视图按产品文档 |
| README 路由表 | 12 行，逐条标注「静态 / 占位 / 未建立」 |
| README 环境变量 | 新增 `Feishu__*` 五组配置表 |
| README 文档章节 | 「首次启用」改为「已启用」，写明 `main` + `/docs` |
| README 验收 | 4 条扩到 7 条（免登、只读、审批回写、数据隔离） |

同步改动：

- `react-app/src/views/ExampleView.tsx` — `getRoleLabels` 七个显示名改为管理员 / 商务 / 财务 / 策划 / 运营 / 剪辑 / 分析，空角色由「团队协同」改为「访客」；mock 数据 `owner` 由「管理层 / 周岚」改为「管理员 / 周岚」。lint 0 错误。
- `react-app/index.html` — meta description 改为「个人自媒体矩阵运营工作台」。
- `react-app/.env.example` — `VITE_APP_DESCRIPTION` 同步。
- `docs/product-overview.html` — 3 处 `MediaAI Dashboard` 统一为 `MediaAI`；页眉日期改为 2026-10-18。

### 2.4 移动端适配（`81ba382`）

**根因**：`.layout` 固定 `224px + 1fr` 两栏，全文只有 900 / 820 / 760px 三个断点，**没有一个断点处理侧栏**。375px 屏幕上正文只剩约 150px，中文每行 3–5 字，表现为「乱码」。文件本身是 UTF-8 无 BOM、`<meta charset>` 与 viewport 齐全，**不是编码问题**。

新增 `@media(max-width:768px)` 与 `max-width:380px`：

- 布局改单列；侧栏转为吸顶横条，10 个章节变成可横滑胶囊导航
- `.tw` 改 `overflow-x:auto`，表格 `min-width:540px`
- 甘特图容器横滚，列宽下限 38px，条内 7px 文字隐藏（人日看左侧标签）
- h1 36→26px（380px 以下 23px），`.g2/.g3/.g4` 单列，KPI 两列
- 内联 `code` 与长 URL 加 `overflow-wrap:anywhere`

**验证**：无头 Chrome 在 320 / 390 / 768 / 1280 四档实测，`documentElement.scrollWidth === innerWidth`，越界元素列表全空；1280px 桌面布局未变。探针文件 `docs/_probe.html` 已删除，未入库。

### 2.5 认证闭环（P0 第 1 步）

- `Roles.cs` 与 `src/utils/roles.ts` 补齐 7 个业务角色；`getRoleLabels` 收敛到 `utils/roles.ts` 单一来源，技术角色 `user` / `authenticated` 不显示，只剩它们时按「访客」。
- 新增 `react-app/src/views/LoginView.tsx`：账号密码登录 → `AuthStore.setAuth` → 回到来源路径；飞书入口留待接入。
- `Routes.tsx` 挂 `/login` 与 `ProtectedRoute` 分组；无 token → `/login` 并带 `state.from`。
- 首页顶部增加邮箱与「退出」按钮。
- 新增 `react-app/setup-tests.ts`（原先缺失，`npm test` 直接崩）与 `src/utils/roles.test.ts`，8 条测试通过。
- 端到端实测（CDP 驱动无头 Chrome）：未登录访问 `/business` → `/login` → 填表登录 → 回 `/business`；首页显示「访客」徽章与邮箱；点「退出」→ `/login`。
- 本地测试账号：`demo@mediaai.local` / `demo12345`，`Roles: ["user"]`，界面上按访客只读显示。

### 2.6 首页接真实接口（P0 第 2 步，本轮）

代码：

- 新增 Marten 文档 `Services/Contracts.Domain/Database/PlatformAccount.cs`（`Platform` / `Handle` / `Status` / `FollowerCount` / `OwnerId`，状态枚举 `connected` / `manual` / `paused` / `error`）。
- 新增 `Services/Contracts.Domain/Database/MetricDaily.cs`（`AccountId` / `Platform` / `StatDate` / `Views` / `Likes` / `Comments` / `Shares` / `NewFollowers` / `Source` / `RecordedBy` / `RecordedAt`）。
- 新增 `Services/Contracts.Dto/DashboardSummaryDto.cs` 与 `GetDashboardSummaryRequestDto.cs`；`RangeStart`/`RangeEnd` 用 `string`（`yyyy-MM-dd`），DTO 层不引入 `DateOnly`。
- 新增 `Services/App.Api/Managers/DashboardManager.cs`：`[RequireAuthenticated] GetSummary`，返回四个 KPI（`top-platform` / `declining-platform` / `total-views` / `new-followers`）、平台走势（前 3）、`DataSource` 计数。
- 新增 `Services/App.Api/Utilities/PlatformAggregate.cs`：`App.Api.Managers` 命名空间下所有类型都会被当成 `IManagerService` 扫描，聚合用的内部类必须放到 `Utilities`。
- 新增 `Services/App.Api/Utilities/DashboardSeeder.cs` + `Program.cs` 启动钩子：仅 Development、仅当库中无 `MetricDaily` 时写入 5 个账号 × 7 天 = 35 条，`Source = Seed`、`RecordedBy = seed:development`。
- 前端新增 `src/api/DashboardManager.ts`、`src/utils/platforms.ts`（平台英文标识 → 中文名），`src/api/AppDtos.ts` 追加 7 个 DTO。
- `src/views/ExampleView.tsx`：删除硬编码 `metricCards` / `platformSeries`，改为 `fallbackMetricCards` / `fallbackPlatformSeries`（每条 `trace` 写「静态示例数据 · 接口未连接」）；新增 `summary` / `summaryStatus` / `summaryReloadKey`，错误时红色横幅带重试按钮；KPI 卡加 `trace` 行与 `min-h-[168px]`，`pending` 时 `opacity-60`。

口径修正：

- 初版环比用前后两段**总量**比较，7 天区间前 3 后 4 天，结果系统性偏高（微博 -47%）。改为**日均播放**对比（`DailyChangeRate`），修正为 -31%，文案改「日均环比」「前 3 天与后 4 天的日均播放对比」。

验证：

- `dotnet build Services/Services.sln` 0 错误；`npx tsc --noEmit` 0 错误；`npx vitest run --mode test` 8 条通过。
- CDP 驱动无头 Chrome 实测：未登录 `/business` → `/login` → 登录 → 回 `/business`；首页输出 `hasRealSource: true` / `hasFallback: false` / `hasErrorBanner: false`，读数「最强平台 96.9 万 抖音」「下滑平台 -31% 微博」「总播放 214 万 / 互动率 10.1%」「新增粉丝 3,426」「数据来源：开发态示例数据 · 5 个账号 / 35 条日记录（2026-10-12 至 2026-10-18）」。
- `npm run lint` 仍因仓库缺 `typescript-eslint` 报 `ERR_MODULE_NOT_FOUND`（既有问题，非本轮引入），已用 `tsc` + `vitest` 替代。

### 2.7 账号与手工录入（P0 第 3 步，本轮）

代码：

- 新增 `Services/Contracts.Dto/PlatformAccountDtos.cs`：`PlatformAccountDto`（含 `LastMetricDate`、`RecentMetricCount`）、`PlatformAccountListDto`、`SaveAccountRequestDto`、`SaveAccountResultDto`、`AccountIdRequestDto`。
- 新增 `Services/Contracts.Dto/MetricDtos.cs`：`MetricEntryDto`、`MetricEntryListDto`、`IngestManualMetricsRequestDto`、`MetricIngestResultDto`。
- 新增 `Services/App.Api/Utilities/PlatformCatalog.cs`：平台白名单（与前端 `platforms.ts` 同源，改一处需同步另一处）、状态白名单、`AccountVisibility` 归属规则。
- 新增 `Services/App.Api/Managers/PlatformAccountManager.cs`：`ListAccounts` / `SaveAccount` / `DisableAccount`。停用只改状态，历史记录保留。
- 新增 `Services/App.Api/Managers/MetricManager.cs`：`IngestManual`（同账号同日覆盖，写 `Source = manual` + 当前登录邮箱）、`ListRecentMetrics`。
- 新增 `react-app/src/views/ConnectionsView.tsx` + 两个 api 封装；路由 `/connections` 落地，`/connections/:platform` 保持占位。
- 首页数据来源行增加「管理账号 / 录入数据」入口。

关键约定与校验：

- **ServiceInvoker 的方法返回值必须是 DTO 类型**，不能返回 `List<T>`，否则 `ServiceMethodInvoker` 抛 `InvalidOperationException`。列表统一包一层 `{ Items: [...] }`。
- 校验失败一律 `Success = false` + 中文 `Message`，不抛异常——异常会变成 500 Problem 并带堆栈，前端拿不到原因。
- 录制规则：日期 `yyyy-MM-dd`、不可未来、最多回溯两年；播放/点赞/评论/转发非负；互动数之和不得大于播放（`Views = 0` 时跳过）；账号 `paused` 拒绝录入。
- 归属：`OwnerId` 为空 = 共享账号（种子账号），非空仅本人可见。飞书接入后收紧。
- `DataSource.Label` 在混合数据时改为「含开发态示例数据 · 手工录入 N 条」，避免把用户自己录的数据也说成示例。

验证（`AppConfiguration__AppName=MediaAI-Smoke` 起独立实例 + 独立数据目录，不碰用户 5123 实例的数据）：

- API 全链路：登录 → 建账号 → 重复账号被拒 → 录入 → 同日覆盖（`Updated = true`）→ 未来日期被拒 → 互动数超播放被拒 → 最近录入可查 → 停用后再录入被拒 → `GetSummary` 的 `ManualCount = 1`。
- CDP 端到端：`/connections` 未登录跳 `/login` → 登录回 `/connections` → 5 张种子账号卡 → 新增「冒烟 · 验证号」→ 通过卡片「录入」写入 12,345 播放 → 最近录入表出现该行（来源「手工录入」、录入人 `demo@mediaai.local`）→ 回首页数据来源显示「含开发态示例数据 · 手工录入 1 条 · 6 个账号 / 36 条日记录」。
- `dotnet build` 0 错误、`tsc --noEmit` 0 错误、`vitest` 8 条通过。

### 2.8 爆款机会 / 限流风险接真实计算（P0 第 4 步，本轮）

代码：

- `DashboardSummaryDto` 增加 `Opportunities`、`Risks`、`SignalPolicy` 与 `DashboardSignalDto`（Title / Platform / Signal / Detail / Tone / Trace）。
- `DashboardManager.BuildSignals`：按账号分组从 `MetricDaily` 现场算，四个阈值常量写在文件顶部。
- `ExampleView.tsx`：删掉 `breakoutContent` / `throttledContent` 两组硬编码，改为 `toSignalViews(summary.Opportunities)`；`SignalRow` 增加 `trace` 行，平台标识经 `getPlatformLabel` 映射；两块面板的右上角状态改为按条数动态显示（`N 个触发` / `暂无触发` / 接口失败时 `静态示例数据`）。
- 面板下方新增一行「判定规则：…」，直接展示后端生成的 `SignalPolicy`。

判定规则（改阈值必须同步 `BuildSignalPolicy` 文案）：

| 类别 | 规则 | 常量 |
| --- | --- | --- |
| 爆款机会 | 单日播放 ≥ 账号区间日均 2 倍且 ≥ 1,000 | `BreakoutMultiplier` / `BreakoutMinViews` |
| 掉速风险 | 后段日均较前段下降 ≥ 30% | `DeclineThreshold` |
| 互动偏低 | 区间互动率 < 1%（播放 ≥ 1,000 才判） | `LowInteractionRate` |
| 缺数据 | 未停用账号近 3 天无记录；区间内新建账号不判 | `StaleDays` |

- 同一账号只报一条风险（掉速 > 互动偏低 > 缺数据），每块最多 3 条。
- 没有命中时返回空列表，前端显示「区间内没有账号达到阈值」，不生成「疑似机会」。
- 兜底数组保留一份 `fallbackOpportunities` / `fallbackRisks`，仅在接口失败时出现并标注「静态示例数据」。

验证：

- 种子数据（5 账号 × 7 天）下 `GetSummary` 给出 0 条机会、1 条风险（微博 -31%），与旧 KPI 卡的「下滑平台 -31% 微博」口径一致。
- 造数验证：新建「头条 · 掉速验证」（9,000 → 3,000）被识别为 -75% 掉速；新建「B站 · 爆款验证」（6 天里一天 12,000、其余 2,000）被识别为「3.3x 日均」，Trace 为「10-16 · 6 条日记录 · 手工录入」。
- CDP：首页两个面板分别渲染「1 个触发」「2 个需排查」，页面不再出现旧占位文案「供应链幕后」「周末热点追踪」，判定规则行正常展示。
- `dotnet build` 0 错误、`tsc --noEmit` 0 错误、`vitest` 8 条通过。

### 2.9 阈值可配（2b）

代码：

- `Contracts.Domain.Database.SignalThresholdConfig`：单例文档（主键固定 `SignalThresholdDefaults.SingletonId`），五个阈值 + `UpdatedAt` / `UpdatedBy`；`SignalThresholdDefaults` 同时是默认值与「库里没有配置」时的取值来源。
- `SignalPolicyText`（Utilities）：判定规则文案的唯一来源，首页与实际计算共用，`Describe(days, config)`。
- `SignalThresholdStore`（Utilities）：`LoadAsync` 读配置、缺省回落默认值（不写库）；`DescribeSource` 生成「当前使用默认阈值 / 阈值更新于 … · email」。
- `SettingsManager`：`GetSignalThresholds` / `SaveSignalThresholds`，范围校验失败返回 `Success = false` + 中文原因，不抛异常；保存走 `UpsertDocument` + 固定主键，不会写出第二条。
- `DashboardManager.BuildSignals` 改为接收 `SignalThresholdConfig`，四个判定点全部读配置；`DashboardSummaryDto` 新增 `SignalPolicyTrace`。
- 前端：新增 `/settings`（`SettingsView.tsx`）——五项数字输入、保存反馈、当前生效口径与来源；首页数据来源行增加「调整判定阈值」入口，判定规则行右侧显示阈值来源。
- `Program.cs`：`services.AddScoped<SettingsManager>()`。

判定规则（以下为默认值，可在 `/settings` 修改）：

| 类别 | 规则 | 字段 | 默认 | 允许范围 |
| --- | --- | --- | --- | --- |
| 爆款机会 | 单日播放 ≥ 账号区间日均 N 倍且 ≥ M | `BreakoutMultiplier` / `BreakoutMinViews` | 2 倍 / 1,000 | 1.1–10 / 0–100,000,000 |
| 掉速风险 | 后段日均较前段下降 ≥ N% | `DeclineThresholdPercent` | 30% | 1–90% |
| 互动偏低 | 区间互动率 < N%（播放 ≥ 爆款下限才判） | `LowInteractionRatePercent` | 1% | 0.1–50% |
| 缺数据 | 未停用账号近 N 天无记录 | `StaleDays` | 3 天 | 1–30 |

- 阈值存正数表示「下降 ≥ N%」，代码里判定为 `rate <= -DeclineThresholdPercent`，避免表单里出现负号。
- 每块仍最多 3 条、同一账号只报一条风险；这部分是展示规则，不做成配置。

验证：

- `dotnet build` 0 错误、`tsc --noEmit` 0 错误、`npm run build` 成功、`vitest run` 8 条通过。
- 隔离实例（`AppConfiguration__AppName=MediaAI-SmokeThr`，5126）脚本 13 项全通过：默认读取 → 越界拒绝（倍数 20 报「1.1 到 10 之间」）→ 保存 3x / 5,000 / 40% / 1.5% / 5 天 → 回带 Policy 按新值生成 → 保存人 = 当前账号 → 重新读取仍是自定义 → `UpdatedAt` 为 `yyyy-MM-dd HH:mm` → `GetSummary.SignalPolicy` 与设置页 Policy 逐字一致、`SignalPolicyTrace` 带邮箱 → 可保存回默认值。
- 未做浏览器端验证：本机无 playwright、项目未装，`/settings` 的渲染正确性目前只由 `tsc` + `npm run build` 保证。

### 2.10 CSV 批量导入（本轮）

代码：

- `Utilities/CsvTable.cs`：RFC 4180 解析（引号转义、字段内逗号与换行、CRLF、UTF-8 BOM），`CsvRow.LineNumber` 记录**物理行号**，引号内换行不会让后续行号错位。
- `Utilities/MetricRules.cs`：`TryParseDate` + `ValidateCounts`，从 `IngestManual` 里抽出来，手工录入与批量导入共用同一套中文报错。
- `Utilities/MetricImportEntry.cs`：导入中间态（`PendingMetric` 原计划放 Manager 内，但 `App.Api.Managers` 命名空间只允许 `IManagerService` 实现，分析器会报 RIDE0001，故移到 `Utilities`）。
- `MetricManager.ImportCsv(ImportMetricsCsvRequestDto)`：`FileName` + `Content`（整份文本，不走 multipart）。上限 2000 数据行 / 4 MB；必需列 `platform,account,date,views`，缺列整份拒绝并列出缺哪几列；表头别名支持中文（平台 / 账号 / 日期 / 播放 / 点赞 / 评论 / 转发 / 新增粉丝）；未识别列不报错，写进 `Warning`。
- 账号匹配用 `AccountKey(Platform, Handle)`（`@` 去掉、大小写不敏感），`paused` 账号该行报错；行内数字支持千分位与 Excel 的 `12000.0`，`views` 为空视为漏填报错而不是当 0。
- 文件内同账号同日重复：后者覆盖前者，计 `DuplicateRows`；库里已有记录按覆盖计 `UpdatedRows`，写入 `Source = csv` + `RecordedBy = 当前登录邮箱`。
- `IDatabaseAccessor.UpsertDocuments<T>`：Local 实现一次 `SaveAll`，Marten 实现单 session 提交。之前逐条 `UpsertDocument` 在本地 JSON 实现下会反复全量重写，1000 行是 O(n²) 级别。
- `DashboardDataSourceDto.CsvCount` + `DashboardManager.BuildDataSource` 的「CSV 导入 n 条」文案。
- 前端 `ConnectionsView`：工具栏「批量导入 CSV」按钮 + Dialog（选文件、下载带 BOM 的模板、结果四宫格、Warning、错误行「第 N 行：…」、超出 20 条提示截断）。

错误策略：逐行独立校验，坏行不写、好行照常入库；**全部行都失败时整体不写**并在 `Message` 里说明，避免「一半成功」难对账。

验证：

- 隔离实例 `AppConfiguration__AppName=MediaAI-Smoke`（5127），`/tmp/test_import.py` + `/tmp/test_edge.py` 全部通过。
- 混合文件：5 类错误分别命中（不支持的平台 `tiktok`、账号不存在、`2026-13-01`、互动数超播放、账号已停用），错误行号 5–9 与实际物理行一致。
- 中文表头 + BOM + CRLF + 引号内逗号：导入成功，无 warning。
- 覆盖：同账号同日再导 → `created 0 / updated 1`；未知列 `saves` → 只出 warning 不失败；`12000.0` 正常，空播放与 `12.5` 按行报错；列数少于表头按行报错。
- 1000 行（450 唯一 + 550 重复）：`耗时 22 ms`，`新增 450 行，文件内重复 550 行`（改造前逐条写会到秒级）。
- 首页来源：导入窗口内日期后 `DataSource.Label` = `CSV 导入 3 条 · 9 个账号 / 3 条日记录`，`CsvCount = 3`、`ManualCount = 0`。
- `dotnet build` 0 错误、`tsc --noEmit` 0 错误。
- 未做浏览器端验证：导入 Dialog 的实际渲染只由 `tsc` 保证，没跑过 CDP。

### 2.11 业务角色权限落地（本轮）

代码：

- `SettingsManager.GetSignalThresholds` / `SaveSignalThresholds` → `[RequireRole(Roles.Admin)]`（原为 `[RequireAuthenticated]`，任何登录用户都能改阈值）。
- `PlatformAccountManager.SaveAccount` / `DisableAccount`、`MetricManager.IngestManual` / `ImportCsv` → `[RequireRole(Roles.Admin, Roles.Operations)]`。
- 读接口（`GetSummary`、`ListAccounts`、`ListRecentMetrics`）保持只要求登录：访客要能看总览与账号列表，只是看不到写入口。
- `AttributeMethodAuthorizer`：403 的异常文案由 `Forbidden.` 改为「当前账号无权执行该操作（需要角色：admin / operations）。」，让界面能直接告诉用户找谁开通。
- `ServiceInvokerEndpoints`：403 从「只有状态码」改为带 JSON 正文 `{ Success: false, Message }`；否则浏览器侧只能显示 `Forbidden`。
- `AppConfiguration.AdminEmails` + `LocalAuthAccessor.EnsureBootstrapAdminAsync`：本地认证没有飞书用户组，命中名单的邮箱（逗号 / 分号分隔）在登录或注册时补 `admin` 并落库。**没有它，`/settings` 收紧后就没有任何账号进得去**；生产环境此项留空，角色走 `RoleMappingConfig`。
- 前端 `src/utils/permissions.ts`：`canManageAccounts` / `canEditThresholds` / `readOnlyNotice`，取值与权限矩阵一致，权限判断只此一处。
- `src/utils/errors.ts` + `ApiClient`：403 正文的中文原因透传到界面，只有 `Failed to fetch` 之类才回落到页面兜底文案（此前 catch 一律吞成「保存失败，后端接口不可用。」）。
- 路由：`/settings` 移入 `<ProtectedRoute roles={[ADMIN_ROLE]}>`，非管理员落到 `/unauthorized`。
- `ConnectionsView`：非管理员 / 运营不渲染新增账号、批量导入、录入日指标、单账号录入 / 编辑 / 停用，顶部显示只读说明；`ExampleView` 首页两个快捷入口按角色显隐。

验证：

- `dotnet build` 0 错误、`tsc --noEmit` 0 错误、`vitest run` 13 条通过（新增 5 条权限用例）。
- 隔离实例（`AppConfiguration__AppName=MediaAI-RoleSmoke`，5130）+ `/tmp/test_roles.py` 17 项全通过：管理员（`AppConfiguration__AdminEmails` 命中）自动带 `admin`、可读写阈值、可建账号；访客 `['user']` 可读总览 / 账号列表 / 最近录入，但读阈值、写阈值、建账号、停用、录入、CSV 导入全部 403，且正文含「需要角色：admin」。
- 运营角色（手改 `Users.json` 加 `operations`）：可建账号、可 CSV 导入，读阈值 403。
- 界面级验证（`/tmp/ui_roles.py`，CDP + 无头 Chrome，15 项断言全通过）：管理员在 `/connections` 有 8 组「录入 / 编辑 / 停用」按钮，访客只有「刷新」；访客看到只读说明、首页无阈值与账号入口、直接访问 `/settings` 落到「暂无访问权限」；管理员 `/settings` 正常打开。
- 未验证：多角色叠加（如 `admin + sales`）、飞书签发 token 的同样路径（无凭据）。

### 2.12 执行列表接真实接口（本轮）

代码：

- 数据文档：`Deal`（客户、事项、金额、阶段、负责人、下一步、预计签约、备注）、`ContentPlan`（标题、平台、排期、状态、方向、机会分、责任人、关联商务单、成品链接）、`TodoItem`（人工待办）。字段与《实施计划 · 3.5 / 3.6》对齐。
- `DealManager`：`ListDeals`（阶段 + 关键词筛选）/ `GetDeal` / `SaveDeal`（admin、sales）/ `UpdateDealStage`（admin、sales、finance）。阶段只允许前进一步或进入 `lost`，跳级返回「只能推进到下一阶段「quoting」…」；财务单独持有时只能「待报价审核 → 已确认 / 退回报价中」。
- `ContentPlanManager`：`ListPlans` / `GetPlan` / `SavePlan` / `UpdatePlanStatus`（admin、planner、operations、editor）；状态只能顺次推进或归档，机会分 0–10，平台标识去重并校验。
- `TodoManager`：`ListTodos` / `SaveTodo`（admin、operations）/ `CompleteTodo`（所有业务角色）。
- `Utilities/TodoBuilder`：自动待办从单据推导，不落库——待报价审核、报价超 3 天未复核、计划缺方向、计划过排期未发布；勾选自动待办返回「自动待办由商务单阶段或内容计划推导，不能勾选」。
- `Utilities/ExecutionMapper` / `ExecutionText`：阶段文案、色板、金额与分数格式化、周期文案的唯一来源，首页 / 列表 / 详情三处共用，前端不再自己拼。
- `DashboardSummaryDto.Execution`：`Deals` / `Plans` / `Todos`（各取前 3）、`Management`（仅 admin）、`SourceLabel`、`DealTotal` / `PlanTotal` / `TodoOpenCount`。**执行列表与指标区间无关**，无日记录时照样返回。
- `Utilities/ExecutionSeeder`：开发态示例数据（4 单 / 4 计划 / 2 待办，`CreatedBy = seed:development`），界面打「示例」标记。
- 前端：首页三块改成真实数据（含空态与加载失败文案），管理层概览换 `Execution.Management`；新增 `/business`、`/plans` 列表页（筛选、新建 / 编辑对话框）与 `/business/:dealId`、`/plans/:planId` 详情页（`StatusTimeline` 阶段条、推进 / 复核 / 归档、关联对象互跳）；`utils/execution.ts` 维护筛选用的阶段选项、角色名与日期提示。
- 删除 `/analysis/:viewId` 路由与占位配置（遗留第 1 条），现在落到 404。

验证：

- `dotnet build` 0 错误、`tsc --noEmit` 0 错误、`npm run build` 成功、`vitest run` 17 条通过（新增 4 条商务 / 计划 / 待办权限用例）、本轮文件 lint 0 错误。
- 隔离实例（`AppConfiguration__AppName=MediaAI-Exec`，5131/5132）+ `/tmp/test_exec.py` 43 项：种子数据 4 单 4 计划 2 待办；首页执行列表按紧急度排序（待报价审核在最前）、自动待办出现且文案正确、管理层三项带说明、来源标出「含开发态示例数据」；筛选 / 详情 / 新建 / 各类校验（空客户名、负金额、日期格式、机会分越界、平台不支持）全部符合预期；阶段跳级被拒、正常推进、归档生效；访客读得到列表但写操作与阶段推进全部 403。
- `/tmp/test_finance.py` 8 项：财务看不到管理层概览、不能新建商务单（403）、复核通过（待审核 → 已确认）、退回报价（待审核 → 报价中）、跳到其它阶段被拒、勾选自动待办被拒。
- 界面级 `/tmp/ui_exec.py`（CDP + 无头 Chrome）22 项：首页三个 Tab 显示真实单据与「自动」标记、管理层概览、商务/计划列表与详情、访客看不到写入口与推进按钮、`/analysis/whatever` 落到 404；额外用对话框实际新建了一条商务单（填写 → 保存 → 列表出现「界面验收合作」）。
- 未验证：`/connections/:platform` 仍是占位；飞书审批回调推进阶段未接，阶段推进目前靠人点。

### 2.13 操作审计 + 仓库迁移（本轮）

代码：

- `Contracts.Domain.Database.AuditLog`：时间、操作人（`ActorAuthId` / `ActorEmail` / `ActorName`）、`Action` + `ActionLabel`、对象类型 / ID / 名称、`Summary`、字段级 `Changes`、`Source`（`api` / `feishu` / `import`）、`Detail`。同文件的 `AuditAction` / `AuditTargetType` / `AuditSource` 是标识与中文名的唯一来源。
- `Utilities/AuditRecorder`：唯一写入入口。写失败只记日志不抛异常（数据已落库却返回 500 会诱发重复提交）；自动过滤「改前 = 改后」的空变更；`PurgeExpiredAsync` 清理 90 天前记录。
- `Utilities/AuditText`：金额、日期、平台、角色、优先级、接入状态的统一格式化，保证 diff 里不出现 GUID、空串或原始英文。
- `AuditManager.ListLogs`（`[RequireRole(admin)]`）：按动作、对象类型、关键词、日期筛选 + 分页；查询时顺带清理过期记录并回报 `PurgedCount`；日期按服务器本地日期比较（库里存 UTC，直接比 DateOnly 会把 0–8 点的记录算错一天）。
- 11 个写入点：阈值保存、账号新增/编辑、停用、指标录入（覆盖时记旧值）、CSV 导入（汇总一条，来源 `import`）、商务单新增/编辑、阶段推进（财务复核写进 `Detail`）、计划新增/编辑（关联商务单显示标题而非 ID）、状态推进、待办新建、待办完成。**失败的操作不写审计**。
- 前端：`/settings` 底部「最近写操作」面板（`AuditLogPanel`）——动作 / 对象类型下拉、日期区间、关键词 300ms 防抖、按天分组、字段级 diff 展开、加载更多、保留期提示。
- 迁移：`origin` 指向 `https://github.com/shuishui313/MediaMgDashboard.git`，历史全量推送；README / HANDOFF 里的仓库与 Pages 地址同步替换。旧仓库 `gsspai/mediaai` 停用。

验证：

- `dotnet build` 0 错误、`tsc --noEmit` 0 错误、`npm run build` 成功、`vitest run` 17 条通过、新增文件 lint 0 错误。
- 隔离实例（`AppConfiguration__AppName=MediaAI-Audit2`，5133）+ `/tmp/test_audit.py` 45 项：11 类写操作全部落库且字段前后值正确（阈值 5 项、播放 10,000 → 25,000、账号粉丝 1,234 → 2,345、阶段 线索 → 报价中、计划 选题中 → 评分中）；操作人、来源标签（界面操作 / 批量导入）、动作中文名正确；失败操作不产生记录；按动作 / 对象类型 / 关键词 / 日期筛选正确；访客读审计 403；手工塞入一条 2025-01-01 的记录后，`PurgedCount = 1`、总数回到原值、返回结果里不再出现该条。
- 界面级 `/tmp/ui_audit.py`（CDP + 无头 Chrome，3103/9226）12 项：设置页出现审计面板、保留期文案、列表含阈值与阶段记录、操作人邮箱、来源标签、「变更 n 项」按钮、展开后能看到「阶段 / 线索 / 报价中」与「→」、收起按钮、两个筛选下拉。
- 环境备注：本机 `~/Tools/dotnet/shared` 在 10-29 被清空过，已用 `dotnet-install.sh` 补装 `Microsoft.NETCore.App` 与 `Microsoft.AspNetCore.App` 8.0；后台进程活不过单次命令，验证脚本要「同一条命令内启动 → 跑测试 → kill」。

---

### 2.14 CI、单测与信号转跟进待办（本轮）

代码：

- `docs/ci-workflow.yml`（CI 模板）：`push main` / PR 触发，两个 job 并行。后端 `dotnet build Services/Services.sln -c Release` + `dotnet test App.Api.Tests`；前端 `npm ci` + `check-ts` + `vitest run` + `lint` + `build`。
- `Services/App.Api.Tests/Tests/` 新增 6 个测试文件、84 条用例：商务单阶段机（跳级、倒退、终点、已丢失）、内容计划状态机、指标录入校验（日期 / 未来 / 过旧 / 负数 / 互动超播放）、阈值文案、审计标识与格式化、CSV 解析（BOM / 引号内逗号与换行 / 物理行号）。都是纯逻辑，不依赖数据库或凭据。
- 清掉前端 23 个存量 lint error：`any` 改 `unknown`（`ApiClient` / `AppDtos` / `ProtectedRoute` / `LoginView` / `debounce` / `vite.config.ts`）、空接口改 `Record<string, never>`、移除未使用的 `SampleEnum`、给 vite 插件补 `Plugin` / `Connect` 类型、空 catch 加注释说明。
- 信号转跟进：`TodoItem.SourceKey` + `SaveTodoRequestDto.SourceKey`；`TodoManager.SaveTodo` 在写入前查同来源未完成待办，命中就返回「已经在待办里了」不重复建单，角色放开到 `admin / operations / planner`。`TodoDto` 回传 `SourceKey`，审计摘要区分「手工新建」与「从首页信号生成待办」。
- 前端 `ExampleView` 的信号卡片右侧加「转待办」按钮（仅上述三个角色可见）：风险 → 运营、机会 → 策划，`destructive` 风险设高优先级，标题带账号与触发值，成功后刷新总览并就地显示「已转待办」。

验证：

- `dotnet build` 0 错误、`dotnet test` 84/84、`tsc --noEmit` 0 错误、`vitest run` 17/17、`npm run build` 成功、`npm run lint` 0 error / 4 warning。
- `/tmp/verify_signal_todo.py` 11/11：造 7 天指标触发掉速信号 → 访客建待办 403 → 策划角色生效且能转待办 → `SourceKey` 回传正确 → 同信号重复转换被幂等拦下且待办数不变 → 审计写入「从首页信号生成待办」。
- **推送限制（仍适用）**：GitHub 拒绝 OAuth App 推送 `.github/workflows/*.yml`（`without workflow scope`）。工作流已在 2026-11-05 由网页端创建（`210c2e8`），内容与 `docs/ci-workflow.yml` 一致；IDE 凭据 scope 为 `gist, read:org, repo`，以后**修改**该文件仍需网页端或带 `workflow` scope 的凭据。
- 启用结果：首次 CI 运行 `41991927631` 为 success（后端 84 条单测 + 前端 17 条单测 / 类型 / lint / 构建）；`pages build and deployment` 也为 success，`https://shuishui313.github.io/MediaMgDashboard/` 返回 200。界面级点击验证未做（起常驻服务被 IDE 判定为长任务取消了两次），但类型、构建与接口链路均已覆盖。

---

## 3. 遗留问题

| # | 问题 | 影响 | 状态 |
| --- | --- | --- | --- |
| 1 | ~~`/analysis/:viewId` 路由去留~~ | 已删除路由与占位配置，访问落到 404（见 2.12） | ✅ |
| 2 | ~~业务角色已定义，但没有任何接口挂 `[RequireRole(...)]`~~ | 阈值与账号 / 指标写接口已按权限矩阵收口（见 2.11）；后续新 Manager 记得同步标注 | ✅ |
| 2b | 本地认证下角色的唯一入口是 `AppConfiguration__AdminEmails` | 只能给 `admin`；`sales` / `planner` 等角色需手改 `Users.json`，等 `RoleMappingConfig` 落地 | 待做（随飞书同步） |
| 3 | 飞书免登未接入 | `/auth/feishu/callback` 与 `FeishuManager` 不存在，登录页只支持账号密码 | 待做（P0） |
| 4 | ~~首页执行列表与管理层概览仍是前端常量~~ | 已全部接接口，这两块不再有 mock 常量（见 2.12）；KPI / 走势 / 机会 / 风险仍保留接口失败时的静态兜底卡片 | ✅ |
| 4b | 指标来源为手工录入 + CSV 导入，平台 API 同步未接 | 已能用表格灌数，但仍需人导出再上传；`Source = api` 尚无写入方 | 待做（M1-4） |
| 4c | 商务单阶段推进靠人点，飞书报价审批未接 | 报价复核有记录但没有审批留痕；`DealManager.UpdateDealStage` 已留好入口给回调 | 待做（M2-1） |
| 4d | 内容计划与待办没有删除 / 批量导入 | 录错了只能改状态（归档 / 完成），不能物理删除 | 待定 |
| 4e | 审计记录只能在线看 | 没有导出 / 归档；保留期固定 90 天不可配；`AuditLog.json` 增长后每次查询会全量读（本地 JSON 实现） | 待定 |
| 5 | ~~`/` 未挂 `ProtectedRoute`~~ | 已完成 | ✅ |
| 6 | ~~无任何自动化测试与 CI~~ | 已补 84 条后端单测、17 条前端单测与 GitHub Actions（见 2.14） | ✅ |
| 6b | ~~lint 跑不起来 / 存量 error~~ | 依赖补齐，23 个存量 error 已清完，现在 0 error / 4 warning（shadcn 组件的 react-refresh 提示，不影响） | ✅ |
| 7 | 推文文案只存在于对话中 | X / Facebook 两版成稿未落文件，若要发布需重新生成 | 未落地 |

**待确认**：无阻塞项。下一批优先级见第 4 节。

---

## 4. 下一步计划

按依赖顺序，建议：

1. ~~**首页接真实接口**：`DashboardManager` + DTO，先接四个指标卡~~ — 已完成（见 2.6）
2. ~~**数据模型**：`PlatformAccount` + `MetricDaily`~~ — 已完成（见 2.6）

接下来，建议按以下顺序：

1. ~~**手工录入 / 接口同步入口**：`MetricManager.UpsertDaily` + `PlatformAccountManager` 增删改查 + 「平台连接」页~~ — 已完成手工模式（见 2.7），接口同步仍未做
2. ~~**首页剩余区块接接口**：爆款机会、限流风险~~ — 已完成（见 2.8）
2b. ~~**阈值可配**：把 `BuildSignals` 的四个常量挪到 `SignalThresholdConfig` 文档，管理面板可改，改完 `SignalPolicy` 自动跟着变~~ — 已完成（见 2.9）；`[RequireRole("admin")]` 已接（见 2.11），审计见 2.13
3. ~~**批量导入**：给运营一个 CSV 导入（账号、日期、播放、互动），复用 `MetricManager` 的校验~~ — 已完成（见 2.10，`Source = csv`）；后续可加导入历史与失败行导出
3b. ~~**执行列表接接口**：`DealManager` / `ContentPlanManager` / `TodoManager` + 商务单与内容计划页面~~ — 已完成（见 2.12）；删除 / 导入、飞书审批推进未做
4. ~~**操作审计**：`AuditLog` 记录阈值、账号、指标、商务单阶段变更（谁、何时、前后值），设置页 / 详情页可查~~ — 已完成（见 2.13）；导出与保留期配置未做
5. **飞书免登**：`/auth/feishu/callback` + 登录页飞书入口，与账号登录共用同一签发出口
6. **`RoleMappingConfig`**（飞书用户组 → 角色，存库热改）+ `SyncDirectory` 定时同步，离职置 `Disabled`
7. **`/connections/:platform`**：账号授权状态、同步失败重试、平台限额（当前仍是占位）
8. **三态组件统一（M1-5）**：`LoadingSkeleton` / `EmptyState` / `ErrorState`，替换各页面手写的加载与空态文案

产品文档给出的分期是 M0–M4、共 36 人日（M0 7.5 / M1 9 / M2 11.5 / M3 8），为估算值，大概率会超。

---

## 5. 关键上下文

### 5.1 文件关系（易踩坑）

- **`docs/index.html` 是 `docs/product-overview.html` 的副本**。改完正文必须执行 `cp docs/product-overview.html docs/index.html`，否则首页不变。这是本次最容易漏的一步。
- Pages 从 `main` 的 `/docs` 目录发布，`/docs` 下**任何**新增文件都会被公开，不要放草稿。
- `.gitignore` 已排除 `.env`、`appsettings.*.json`、`local-signing.key`。
- **`App.Api.Managers` 命名空间下只放 Manager**：反射会扫描该命名空间的 `IManagerService`，任何辅助类（如聚合用的 `PlatformAggregate`）必须放到 `Utilities`，静态工具类同样会被当文档类型扫描。
- 调 `/Api/invoke` 时 **`AccessToken` 与 `RefreshToken` 必须同时带**，只给 `AccessToken` 会失败（与 `AuthManager.Login` 返回一致）。
- **`AuthManager.Login` / `SignUp` 返回的 token 在 `Result` 里面**，不在信封顶层。脚本取 token 时按 `Result.AccessToken` / `Result.RefreshToken` 读。
- **ServiceInvoker 的方法返回值必须是 DTO 类型**：返回 `List<T>` 会被 `ServiceMethodInvoker` 判为非法返回值并抛异常。列表统一包 `{ Items: [...] }`。
- Manager 里做参数校验时不要抛异常——异常会变成 500 Problem 带堆栈，前端拿不到中文原因；改用 `Success = false` 的 Result DTO。
- **新增 Manager 必须在 `Program.cs` 的 `GetScopedServices` 里 `AddScoped` 注册**。反射只负责发现方法，实例仍从 DI 取；漏注册时 `/api/invoke` 直接返回 500，且控制台**没有任何堆栈**，很容易误判成业务逻辑问题。
- **Manager 里不要写 public 的辅助方法**（例如「取首页前 3 条」）。反射会把 public 方法一并当成可调用接口，返回 `List<T>` 的直接被约定检查拒绝；聚合逻辑放在 `DashboardManager` 内部或 `Utilities` 里。
- **阶段 / 状态文案只在后端维护一份**（`Utilities/ExecutionText.cs` 的 `DealStageText` / `PlanStatusText` / `RoleText`），DTO 直接下发 Label 与 Tone；前端 `utils/execution.ts` 里的同名 map 只用于筛选下拉与按钮文案。
- 删掉 `Deal.json` / `ContentPlan.json` / `TodoItem.json` 会重置商务单、内容计划与人工待办（`ExecutionSeeder` 只在 Development 且没有 Deal 时写示例数据）。
- **新增写接口时记得加审计**：写完库调用 `_auditRecorder.RecordAsync(...)`，只传白名单字段的前后值；失败分支不要写（否则「被拒绝的操作」会出现在审计里）。可用 `AuditText.*` 格式化，避免把 GUID、空串、英文标识塞进 diff。
- 审计 `AuditLog.json` 会持续增长，本地 JSON 实现每次查询全量读取；切 Postgres 前不要指望它扛大数据量。需要重置：删掉 `~/CodeBuddy/Resources/<AppName>/AuditLog.json`。
- 仓库已迁到 `shuishui313/MediaMgDashboard`，Pages 已于 2026-11-05 在新仓库开启（`main` / `/docs`），线上地址 `https://shuishui313.github.io/MediaMgDashboard/` 返回 200；旧仓库 `gsspai/mediaai` 不再推送。

### 5.2 本地环境

- 预览服务：在 `docs/` 下跑 `python3 -m http.server 4174`，访问 `http://localhost:4174/product-overview.html`。**该进程可能仍在后台运行**，端口冲突时先 `lsof -ti:4174 | xargs kill`。
- 无头截图 / 布局度量：`/Applications/Google Chrome.app/Contents/MacOS/Google Chrome --headless=new --dump-dom`，配合同源 iframe 探针可读取 `scrollWidth` 实测溢出（探针文件用完即删）。
- 推送凭据由 IDE 临时注入，**不可用于 GitHub Settings API**；机器上无 gh CLI token、无钥匙串凭据、无 `GITHUB_TOKEN`、无 `~/.netrc`。需要改仓库设置时只能人工操作。
- 改完后端不想打扰正在跑的 `https://localhost:5123`：用 `dotnet run --no-build --urls https://localhost:5124` 起一个独立实例验证，验完 kill 掉。前端 `react-app/.env` 的 `VITE_API_URL` 指向验证实例时，**验完必须改回 5123**。
- 重置开发态种子数据：删掉本地数据目录下 `PlatformAccount.json` 与 `MetricDaily.json`（路径含 `AppConfiguration__AppName`，默认 `~/CodeBuddy/Resources/MediaAI/` 附近），重启后端即重新生成 5 个账号 × 7 天。
- **做写操作验证时隔离数据目录**：`AppConfiguration__AppName=MediaAI-Smoke dotnet run --no-build --urls https://localhost:5126`，数据落在 `~/CodeBuddy/Resources/MediaAI-Smoke/`，不会污染用户 5123 实例的数据。新目录里没有用户，要先调 `AuthManager.SignUp` 再登录。
- 前端验证实例用环境变量覆盖接口地址，别改 `.env`：`VITE_API_URL=https://localhost:5126 npx vite --port 3100`。

### 5.3 口径约定（后续改动请沿用）

- 产品名：**MediaAI**（不再用 `MediaAI Dashboard`）
- 一句话定位：把多个平台账号的播放与互动、爆款机会、限流风险，连同商务合作与内容排期，收敛到同一块屏幕
- 角色显示名：管理员 / 商务 / 财务 / 策划 / 运营 / 剪辑 / 分析 / 访客
- 硬约束：**每个数字都必须能回溯到「谁、在哪个平台、哪一天、录了什么或同步了什么」**，无法回溯的展示数据不上线

### 5.4 验证现状

线上地址 `https://shuishui313.github.io/MediaMgDashboard/` 已确认返回 200，且含移动端 CSS（`max-width:768px`）。桌面与四档移动视口均无横向溢出。

2.9 / 2.10 的验证记录：

- `dotnet build Services/Services.sln` → 0 错误（4 条 Marten 7.37.1 的 NU1904 告警是历史遗留）。
- `npm run check-ts`、`npm run build`、`npx vitest run --mode test` 全部通过。
- 阈值接口在 5126 隔离实例上 13 项断言全通过；验证数据目录 `~/CodeBuddy/Resources/MediaAI-SmokeThr/`，已保存回默认阈值。
- CSV 导入在 5127 隔离实例（`AppConfiguration__AppName=MediaAI-Smoke`）上跑完混合错误、中文表头、覆盖、未知列、千分位/小数、空播放、列数不足、BOM+CRLF+引号、空内容、未来日期、1000 行性能共 11 组用例，全部符合预期。
- **注意**：`npm run test` 是 watch 模式（`vitest --mode test`），非交互环境下会一直挂住，请用 `npx vitest run --mode test`。
- **注意**：验证脚本里的统计日期必须落在 `GetSummary` 的窗口内（`Days` 默认 7，`today-1` 起算最稳），否则 `DataSource.Label` 会显示「区间内暂无数据」，看着像导入失败。
- 本机 `dotnet` 曾被系统判为签名失效（进程 SIGKILL），修复方式：`codesign --force --sign - /Users/shuishui/Tools/dotnet/dotnet`。生产环境启动会连 Supabase，本机网络不可达，验证一律用 `ASPNETCORE_ENVIRONMENT=Development`（`LocalAuthAccessor` + 本地 JSON）。
