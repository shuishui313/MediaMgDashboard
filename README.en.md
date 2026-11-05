# MediaMgDashboard — personal media-matrix ops workbench

MediaMgDashboard (formerly MediaAI) is the daily ops workbench for a personal media matrix. Playback and engagement across platform accounts, breakout opportunities, and throttling risk sit on the same screen as commercial deals and the content calendar — read the situation, judge opportunity and risk, then land on who does what, and at which step.

Positioning, roles, metric definitions, and screen structure are specified in the [product docs](https://shuishui313.github.io/MediaMgDashboard/) (in Chinese).

The main path is wired end to end: login and role permissions, platform accounts and daily metrics (including CSV import), live opportunity / risk detection, deals and content plans, execution lists and cross-role todos, and the audit log. All data comes from backend APIs. The home page shows labelled “static sample data” fallback cards only when `GetSummary` fails entirely; the execution lists and management overview have no mock fallback and show empty states instead. Development data lives in local JSON. Feishu SSO, Feishu approval callbacks, automated platform API sync, and the `/connections/:platform` detail page are still open.

[中文](README.md) | **English**

[Documentation](#documentation) · [Current status](#current-status) · [Known limits](#known-limits) · [Tech stack](#tech-stack) · [Directory structure](#directory-structure) · [Quick start](#quick-start) · [Environment variables and configuration](#environment-variables-and-configuration) · [Architecture](#architecture) · [Roles and permissions](#roles-and-permissions) · [Frontend routes](#frontend-routes) · [Design system and UI conventions](#design-system-and-ui-conventions) · [Security and secrets](#security-and-secrets) · [Deployment](#deployment) · [Next steps](#next-steps)

---

## Contents

- [Documentation](#documentation)
- [Current status](#current-status)
- [Known limits](#known-limits)
- [Tech stack](#tech-stack)
- [Directory structure](#directory-structure)
- [Quick start](#quick-start)
- [Environment variables and configuration](#environment-variables-and-configuration)
- [Architecture](#architecture)
- [Roles and permissions](#roles-and-permissions)
- [Frontend routes](#frontend-routes)
- [Design system and UI conventions](#design-system-and-ui-conventions)
- [Security and secrets](#security-and-secrets)
- [Deployment](#deployment)
- [Next steps](#next-steps)

---

## Documentation

| Document | What it covers | Where |
| --- | --- | --- |
| Product docs | Positioning, roles, information architecture, screen structure, key flows, metric definitions, permissions, phases, acceptance | https://shuishui313.github.io/MediaMgDashboard/ (in Chinese) |
| Implementation plan | Data model, Manager API list, frontend changes, task breakdown | [docs/implementation-plan.md](docs/implementation-plan.md) (in Chinese) |
| Auth flow | JWT validation and role checks inside `ServiceInvoker` | [docs/service-invoker-auth-flow.md](docs/service-invoker-auth-flow.md) |
| Streaming RPC | Transport and lifetime of streaming calls | [docs/service-invoker-streaming.md](docs/service-invoker-streaming.md) |

The product doc (in Chinese) is a single static page (`docs/product-overview.html`, entered from `docs/index.html`), with no build and no external dependencies. GitHub Pages publishes the `/docs` directory of the `main` branch.

On 2026-11-03 the repository moved to **`shuishui313/MediaMgDashboard`** (the old `gsspai/mediaai` repo is retired). Pages was enabled on the new repository on 2026-11-05 (Source `Deploy from a branch`, Branch `main`, folder `/docs`); https://shuishui313.github.io/MediaMgDashboard/ (in Chinese) now returns 200. A push to `main` republishes in about a minute, with no build step.

---

## Current status

| Capability | Status | Notes |
| --- | --- | --- |
| Workbench home (`/`) | Done (every block is API-backed) | Four KPIs, platform trend, breakout opportunities, throttling risks, the three execution lists (deals / plans / todos), and the management overview are all returned live by `DashboardManager.GetSummary` |
| Role-based views | Done (frontend) | The default execution list follows the role; `admin` also sees the management overview |
| API permissions | First batch wired | Thresholds are `admin` only. Account and metric writes are limited to `admin` / `operations`. Unauthorized calls return 403 plus a Chinese reason. See [Roles and permissions](#roles-and-permissions) |
| Audit log | Done | 11 kinds of writes land in `AuditLog`. `/settings` can filter and expand field-level diffs. Admin read only. Retained 90 days |
| Signal → follow-up | Done | Opportunity / risk cards on the home page can create a todo in one click, deduped by `SourceKey`. Risks go to operations; opportunities go to planning |
| Continuous integration | Enabled (first run passed) | `.github/workflows/ci.yml` runs backend build + 84 unit tests and frontend typecheck / 17 unit tests / lint / production build. The template stays in sync in `docs/ci-workflow.yml`; [see the runs](https://github.com/shuishui313/MediaMgDashboard/actions) |
| Shared design system | Done | `PageShell` / `Panel` / `SectionHeader` / `StatusPill` / `TrendChart` / `SegmentedTabs` |
| Product docs | Published | [shuishui313.github.io/MediaMgDashboard](https://shuishui313.github.io/MediaMgDashboard/) (in Chinese), covering positioning, roles, metric definitions, and acceptance criteria. Pages is enabled on the new repo from `main` / `/docs` |
| Platform connections (`/connections`) | Done (manual + CSV) | Account CRUD, disable, manual daily metrics, CSV bulk import, and recent entries. `/connections/:platform` is still a placeholder. OAuth is not wired |
| Deals and plans | Done (no approval flow) | `/business`, `/business/:dealId`, `/plans`, and `/plans/:planId` use live data. Quote approval is still moved by hand. Feishu approval is not wired |
| Detail pages | Partial | `/connections/:platform` is still a placeholder. `/settings` implements threshold configuration. `/analysis/:viewId` has been removed |
| Auth API | Skeleton usable | `AuthManager` exposes 8 methods (login, register, password change, session, and related). Feishu SSO is not wired |
| Dashboard API | Usable | `DashboardManager.GetSummary` (KPIs, platform trend, opportunity / risk signals, three execution lists, management overview, data source). `PlatformAccountManager`, `MetricManager`, `DealManager`, `ContentPlanManager`, and `TodoManager` are in place. Analytics Managers are not |
| Data model | In place | `PlatformAccount`, `MetricDaily` (including `Source` / `RecordedBy`), `Deal`, `ContentPlan`, `TodoItem` (manual todos) |
| Login | Usable | `/login` is username and password, then returns to the path the user came from. Feishu SSO is not wired |
| Dark mode | Partial | Tokens are ready. There is no theme toggle on the pages yet |

> Home KPI cards, the platform trend, breakout opportunities, and throttling risks all come from the API. Every card and every signal carries a source label (API sync / manual entry / CSV import / development seed). The three Execution list tabs (deals, plans, todos) and the management overview also come from `DashboardManager.GetSummary().Execution`, with no mock fallback: a failed call shows an empty state. Only when `GetSummary` fails entirely do the KPI and signal blocks degrade to labelled “static sample data” fallback cards.

---

## Known limits

These bullets only repeat limits this README already states. The repository has no Issues for them, so this list does not invent issue numbers. How to treat the gap is in [docs/decisions.md](docs/decisions.md).

- **The main path is wired. These are not.** Login and role permissions, platform accounts and daily metrics (including CSV), live opportunity / risk detection, deals and content plans, execution lists and cross-role todos, and the audit log come from backend APIs. The execution lists and management overview have no mock fallback. Development data lives in local JSON. Still open: Feishu SSO, Feishu approval, automated platform API sync, and the `/connections/:platform` detail page.
- **Do not put “frontend prototype / page data is still mock” back.** That opening was removed because it contradicted the status table. Under Current status, keep two cases distinct: when the API fails entirely, KPI and signal blocks degrade to labelled “static sample data” fallback cards; the three execution tabs and the management overview read `GetSummary().Execution`, have no demo data, and show empty states on failure.
- **Only accounts with the `workflow` scope can edit the CI file.** `.github/workflows/ci.yml` was created in the GitHub UI on 2026-11-05 and its first run passed. The IDE OAuth credential lacks that scope, so it cannot push or modify this path. Edit CI in the web UI, or change `docs/ci-workflow.yml` and copy it over.

---

## Tech stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS v4 + ShadCN UI (`radix-ui`)
- **State**: Zustand
- **Backend**: .NET 8 Web API, one RPC entry (`ServiceInvoker`)
- **Identity**: Feishu self-built app SSO (OAuth authorization code → `open_id` → this system's JWT). Local development falls back to `LocalAuthAccessor`
- **Hosted database**: Supabase (Postgres)
- **Document database**: MartenDB (PostgreSQL, `app` schema rather than `public`; local development writes JSON files)

---

## Directory structure

```text
MediaMgDashboard/
├── react-app/                     # Frontend
│   ├── src/
│   │   ├── api/                   # ApiClient + DTOs + AuthManager wrappers
│   │   ├── auth/                  # AuthStore (token / session persistence)
│   │   ├── components/
│   │   │   ├── dashboard/         # Shared display components (panel, header, status, trend, segmented control)
│   │   │   └── ui/                # ShadCN primitives
│   │   ├── lib/                   # cn(), number formatting
│   │   ├── routes/                # Route table and ProtectedRoute
│   │   ├── views/                 # Page views
│   │   └── default.css            # Design tokens (color / radius / shadow)
│   └── .env.example               # Env template (no real values)
├── Services/                      # Backend
│   ├── App.Api/                   # Host, Managers, Engines, Accessors
│   ├── App.ServiceInvoker/        # RPC routing, reflection invoke, auth
│   ├── Contracts.Dto/             # Request / response DTOs
│   └── Contracts.Domain/          # Domain entities and contracts
├── docs/                          # Product docs, implementation plan, RPC notes
└── .gitea/workflows/deploy.yml    # Deploy pipeline
```

The tree root is the repository name `MediaMgDashboard` (the old `gsspai/mediaai` repository is retired). A table of the same tree is at the end of this file.

---

## Quick start

### Frontend

```bash
cd react-app
npm ci
cp .env.example .env        # point this at the local API
npm run dev                 # http://localhost:3000
```

Common scripts:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Typecheck + production build into `dist/` |
| `npm run check-ts` | Typecheck only |
| `npm run lint` | ESLint (`eslint.config.js` uses the `typescript-eslint` dev dependency, which is already in `package.json`) |
| `npm run format` | Prettier |

### Backend

```bash
dotnet restore Services/Services.sln
dotnet run --project Services/App.Api      # https://localhost:5123
```

- With `ASPNETCORE_ENVIRONMENT=Development`, the API uses `LocalDatabaseAccessor` + `LocalAuthAccessor`. Account data is written to local JSON. Supabase is not required.
- The first launch generates a development JWT signing key, `local-signing.key`, under `~/CodeBuddy/Resources/<AppName>/`, readable and writable only by the current user. To pin a key, set `AppConfiguration__LocalJwtSigningKey`. Do not put the key in a config file.
- Health check: `GET /api/health`.

### Tests

```bash
dotnet test Services/Services.sln
cd react-app && npm test
```

---

## Environment variables and configuration

Every committed config value is a placeholder. Real secrets are injected by the deploy environment (environment variables / config pipeline). **Do not commit them to Git.**

Frontend (`react-app/.env`, not committed):

| Variable | Purpose | Example (placeholder) |
| --- | --- | --- |
| `VITE_API_URL` | API origin only. `ApiClient` appends `/Api/invoke` | `https://<your-api-host>` |
| `VITE_APP_NAME` | Web App Manifest name | `MediaAI` |
| `VITE_APP_DESCRIPTION` | Web App Manifest description | `个人自媒体矩阵运营工作台` |

Backend (`AppConfiguration` section, environment-variable prefix `AppConfiguration__`):

| Key | Purpose | Example (placeholder) |
| --- | --- | --- |
| `SupabaseId` | Supabase project ref, used to derive Auth / JWKS URLs | `<supabase-project-ref>` |
| `SupabaseHost` | Postgres host | `<db-host>` |
| `SupabasePort` | Postgres port | `<db-port>` |
| `SupabaseDatabasePassword` | Postgres password | `<masked>` |
| `SupabasePublishableKey` | Anon key, used only on client request headers | `<publishable-key>` |
| `SupabaseSecretKey` | Server admin key (can bypass RLS) | `<service-role-key>` |
| `AppName` | Local data directory name | `MediaAI` |
| `LocalJwtSigningKey` | Development only: local JWT signing key (at least 32 characters). Empty means generate and persist on first run | `<generated-on-first-run>` |
| `AdminEmails` | Development only: initial admin emails, separated by comma or semicolon. Matching accounts receive the `admin` role on login or register, and the role is stored. Production roles come from Feishu user groups; leave this empty | `admin@example.com` |

`Services/App.Api/appsettings.json` contains only placeholders such as `default` and can be committed.

Feishu self-built app (environment-variable prefix `Feishu__`, **server-side only, never sent to the frontend**):

| Key | Purpose | Example (placeholder) |
| --- | --- | --- |
| `Feishu__AppId` / `Feishu__AppSecret` | Self-built app credentials. `AppSecret` is not committed and is not echoed | `<app-id>` / `<masked>` |
| `Feishu__RedirectUri` | SSO callback. Must match the open-platform registration exactly | `https://<your-host>/auth/feishu/callback` |
| `Feishu__VerificationToken` / `Feishu__EncryptKey` | Event-callback signature check and decryption | `<masked>` |
| `Feishu__ApprovalCodes` | `approval_code` values for quote review / publish confirmation | `{"quote":"<code>","publish":"<code>"}` |
| `Feishu__AlertWebhook` | Ops group bot URL | `https://open.feishu.cn/open-apis/bot/v2/hook/<masked>` |

The user-group → role map lives in the database (`RoleMappingConfig`). It is edited on `/settings`, takes effect immediately, and is not an environment variable.

---

## Architecture

### Single RPC entry

The frontend does not call REST resources. It calls Manager methods through ServiceInvoker:

```text
POST /api/invoke   → ServiceInvokerEndpoints → ServiceMethodInvoker → Manager method
POST /api/stream   → NDJSON stream (the method returns IAsyncEnumerable<T>)
```

To add a capability: define DTOs in `Contracts.Dto` → add a Manager method in `App.Api/Managers` with `[RequireAuthenticated]` / `[RequireRole]` → add a thin wrapper in `react-app/src/api`. **Do not modify ServiceInvoker.**

### Authentication and session

- The frontend sends `AccessToken` / `RefreshToken` in the request body. The response envelope returns refreshed tokens and `SessionDto`.
- `AuthManager` also implements `IAuthTokenManager`. ServiceInvoker always refreshes, then authorizes, then invokes.
- Identity comes from Feishu: the frontend exchanges an authorization code for `open_id`, the backend upserts the user and **issues this system's JWT**. The Feishu `user_access_token` is discarded after use. It is not stored and not sent to the browser.
- Roles are mapped from Feishu user groups (`RoleMappingConfig`, stored and hot-reloadable), written onto `Session.Roles`, and checked by `[RequireRole(...)]`. Ownership is checked again via `OwnerId`. Both checks must pass.
- Local development signs and validates tokens with `LocalAuthAccessor`, including an admin fallback account (admin only). Production validates JWTs issued by this system.

See [docs/service-invoker-auth-flow.md](docs/service-invoker-auth-flow.md) and [docs/service-invoker-streaming.md](docs/service-invoker-streaming.md).

### Dashboard metrics and data model

`DashboardManager.GetSummary({ Days })` returns the four home KPIs, the platform trend, and a data-source note. `Days` is clamped to 3–90.

| Document | Role | Key fields |
| --- | --- | --- |
| `PlatformAccount` | Platform account | `Platform`, `Handle`, `Status` (`connected` / `manual` / `paused` / `error`), `FollowerCount`, `OwnerId` |
| `MetricDaily` | One account's metrics for one day | `AccountId`, `Platform`, `StatDate`, `Views` / `Likes` / `Comments` / `Shares`, `NewFollowers`, `Source`, `RecordedBy`, `RecordedAt` |
| `Deal` | Commercial deal | `ClientName`, `Title`, `Amount`, `Stage`, `OwnerName`, `OwnerAuthId`, `NextStep`, `ExpectedCloseAt`, `Notes`, `CreatedBy` |
| `ContentPlan` | Content plan | `Title`, `Platforms`, `PlannedAt`, `Status`, `Direction`, `Score`, `AssigneeName`, `DealId`, `Link` |
| `TodoItem` | Manual todo | `Title`, `OwnerRole`, `Priority`, `DueDate`, `Href`, `SourceKey` (idempotency key), `Status`, `DoneAt`, `DoneBy` |
| `AuditLog` | Write audit | `At`, `ActorEmail` / `ActorAuthId`, `Action` / `ActionLabel`, `TargetType` / `TargetId` / `TargetLabel`, `Summary`, `Changes` (field-level before/after), `Source`, `Detail` |

- `MetricDaily.Source` is `api` (platform sync), `manual` (typed in), `csv` (CSV import), or `seed` (development seed). `DataSource` on the response counts all four, and the UI shows copy such as “开发态示例数据 · 5 个账号 / 35 条日记录” (development sample · 5 accounts / 35 daily rows) or “CSV 导入 12 条” (12 rows from CSV). **Every new ingest path must set `Source` and `RecordedBy`, or the numbers cannot be traced.**
- Period-over-period change splits the window in half and compares **average daily views** (`DailyChangeRate`), not the two totals. A 7-day window is 3 days then 4; comparing totals systematically understates the later half.
- Missing data is not an error: `HasData = false`, the four KPIs return `"—"` with `Status = pending`, and the execution lists still return real records. Only when `GetSummary` fails entirely does the UI show labelled “static sample data” fallback cards along with an error banner.

Development seed data is written once, only when `ASPNETCORE_ENVIRONMENT=Development` and the store has **no** `MetricDaily` rows (`Utilities/DashboardSeeder.cs`). To reset, delete `PlatformAccount.json` and `MetricDaily.json` under the local data directory and restart the API.

### Account and ingest APIs

| Method | Role | Notes |
| --- | --- | --- |
| `PlatformAccountManager.ListAccounts` | Account list | `paused` filtered out by default; includes last record date and the count for the last 7 days |
| `PlatformAccountManager.SaveAccount` | Create / edit | `Handle` is unique per platform; an account that already has daily rows cannot change platform |
| `PlatformAccountManager.DisableAccount` | Disable | Status only. History stays and still counts in lookbacks |
| `MetricManager.IngestManual` | Manual one-day metrics | Same account + same day overwrites; writes `Source = manual` and the signed-in email |
| `MetricManager.ImportCsv` | CSV bulk import | Validated row by row; same account + same day overwrites; writes `Source = csv` and the signed-in email |
| `MetricManager.ListRecentMetrics` | Recent entries | Newest stat date first, at most 100 rows |

Validation returns `Success = false` plus a Chinese reason. It does not throw:

- Dates must be `yyyy-MM-dd`, must not be in the future, and may go back at most two years.
- Views / likes / comments / shares must not be negative, and engagement must not exceed views (`Views = 0` skips that check, so a follower-only row is allowed).
- Disabled accounts reject new rows.
- Ownership: an empty `OwnerId` means a shared account (development seed). A set `OwnerId` is visible only to that person. This is a development rule and tightens once Feishu is connected.

### CSV bulk import

The entry is “批量导入 CSV” (Import CSV) on the platform-connections toolbar. The same dialog can download a template first. Parsing and validation live in `MetricManager.ImportCsv` and **share `MetricRules` with manual ingest**, so the same numbers take the same path either way.

| Item | Contract |
| --- | --- |
| Required columns | `platform`, `account`, `date`, `views` (a missing column rejects the whole file and names the missing columns) |
| Optional columns | `likes`, `comments`, `shares`, `followers_new`; a missing column is treated as 0 |
| Header aliases | Chinese headers are accepted: 平台 / 账号 / 日期 / 播放 / 点赞 / 评论 / 转发 / 新增粉丝 (also common Excel labels such as 阅读量 and 涨粉) |
| Limits | 2000 data rows and 4 MB. Over the limit, the file must be split. Rows are not silently truncated |
| Account match | Platform + handle (case-insensitive, leading `@` stripped). A `paused` account fails that row |
| Duplicates | An existing same-account same-day row counts as `updated` (overwrite). Duplicates inside one file keep the later row and count as `duplicateRows` |
| Errors | Each row is validated on its own. Bad rows are not written; the rest are. Nothing is written only when every row fails. Error details include the **physical line number** (header offset and newlines inside quotes). At most 20 errors are returned; further ones set `errorsTruncated` |
| Numbers | Thousands separators (`12,000`) and Excel's `12000.0` are accepted. Decimals, negatives, and an empty views cell are errors and name the row |
| Unknown columns | Not an error. A `warning` says the unrecognized columns were ignored, so one extra stats column does not reject the file |

- Encoding accepts a UTF-8 BOM and CRLF (Excel “Save as CSV”). Quotes and commas inside fields follow RFC 4180.
- An empty `views` cell is not treated as 0. Empty means the cell may have been skipped; the row errors instead of writing a dirty value.
- Writes go through `IDatabaseAccessor.UpsertDocuments` (one session / one `SaveAll`), so the local JSON store is not rewritten once per row. 1000 rows measure about 20–120 ms.
- After import, the home “data source” line shows `CSV 导入 n 条` (`DashboardDataSourceDto.CsvCount`), counted apart from manual entry.

### Execution list: deals, content plans, and todos

The three home execution blocks and the management overview come from `DashboardManager.GetSummary().Execution`. They are **independent of the metric window**: deals and todos stay real documents even when the window has no daily rows. Each block returns at most 3 items. `DealTotal` / `PlanTotal` / `TodoOpenCount` are the full counts.

| Method | Role | Who | Notes |
| --- | --- | --- | --- |
| `DealManager.ListDeals` / `GetDeal` | List (stage and keyword filters) / detail | Signed in | Settled and lost deals stay out of the in-progress list |
| `DealManager.SaveDeal` | Create / edit | `admin`, `sales` | Client name required; amount must not be negative; dates are `yyyy-MM-dd` |
| `DealManager.UpdateDealStage` | Advance stage | `admin`, `sales`, `finance` | Finance alone may only move `pricing-review` → confirmed, or send it back to quoting |
| `ContentPlanManager.ListPlans` / `GetPlan` | List / detail | Signed in | The linked deal title is filled in by the backend |
| `ContentPlanManager.SavePlan` | Create / edit | `admin`, `planner`, `operations`, `editor` | Opportunity score 0–10; platform ids are deduped and checked |
| `ContentPlanManager.UpdatePlanStatus` | Advance status | Same as save | Move forward one step, or archive from any status |
| `TodoManager.ListTodos` | Todo list | Signed in | Derived todos and manual todos are merged |
| `TodoManager.SaveTodo` | Create a manual todo | `admin`, `operations` | The owner role must be a business role |
| `TodoManager.CompleteTodo` | Mark done | Every business role | Derived todos cannot be checked off; change the deal or content plan instead |

Deal stages: `lead → quoting → pricing-review → confirmed → delivering → settled`. `lost` can be entered from any stage. **Only one step forward is allowed.** Skipping a stage is rejected, and the response says which stage is legal.

Content-plan statuses: `draft → scoring → scheduled → published`. `archived` can be entered from any status.

Derived todos are not stored. They disappear once the condition is fixed:

| Trigger | Copy | Owner role |
| --- | --- | --- |
| Any deal is in `pricing-review` | N deals are waiting on finance to review the quote | Finance |
| Any deal is in `quoting` and has not been updated for more than 3 days | N deal quotes have gone more than 3 days without review | Sales |
| Any content plan is missing `Direction` and is not published or archived | N content plans are missing a direction | Planning |
| Any content plan is `scheduled` and the planned date has passed | N content plans are past their date and still unpublished | Operations |

Development seed data is written by `Utilities/ExecutionSeeder.cs` (4 deals / 4 content plans / 2 manual todos, `CreatedBy = seed:development`). The UI marks them as samples, and `Execution.SourceLabel` says the payload includes development sample data. To reset, delete `Deal.json`, `ContentPlan.json`, and `TodoItem.json` under the local data directory.

### Turning signals into follow-up todos

Each breakout-opportunity and throttling-risk row on the home page has a “转待办” (Create todo) button, visible to admin / operations / planning. One click opens a cross-role todo and closes the loop from “something looks wrong” to “someone owns it”:

- The title includes the account and the trigger value, for example `风险跟进：微博 · 主号 · -42%` (risk follow-up: Weibo · main account · -42%).
- Risks are assigned to `operations`, opportunities to `planner`. A `destructive` risk is created at high priority.
- The request sends `SourceKey = signal:<signal Key>`. If an open todo already exists for that source, the API returns “already in the todo list” and does not create a second one.
- The create is audited (`todo.create`, summary marked as generated from a home-page signal).
- Derived todos (from deals / content plans) are outside this flow. They disappear on their own once the condition is fixed, and are not checked off by hand.

### Audit log

After a successful write, one `AuditLog` records who, when, which object, and which fields changed. The only write entry is `Utilities/AuditRecorder.RecordAsync`.

| Action | Trigger | What is stored |
| --- | --- | --- |
| `threshold.update` | `SettingsManager.SaveSignalThresholds` | Before/after for the five thresholds |
| `account.save` / `account.disable` | `PlatformAccountManager` | Platform, handle, display name, connection status, follower count |
| `metric.ingest` | `MetricManager.IngestManual` | Views / likes / comments / shares / new followers (previous values included on overwrite) |
| `metric.import` | `MetricManager.ImportCsv` | File name, inserted / overwritten / failed row counts (source `import`) |
| `deal.save` / `deal.stage` | `DealManager` | Client, subject, amount, stage, owner, next step, expected close; finance review goes in `Detail` |
| `plan.save` / `plan.status` | `ContentPlanManager` | Plan name, platforms, schedule, direction, score, assignee, linked deal (display title) |
| `todo.create` / `todo.complete` | `TodoManager` | Owner role, priority, due date / status |

- Only allowlisted fields store before/after values. Passwords, tokens, and full request bodies are never stored. Values are formatted with `AuditText` (amounts use thousands separators, empty values read as “未填写”, roles and statuses are Chinese labels).
- **Failed operations are not audited.** A rejected request does not appear, so something that did not happen is not recorded as if it did.
- An audit write failure does not fail the business call. `AuditRecorder` swallows the exception and logs it. Returning 500 after the data is already saved would push the user to submit again.
- `AuditManager.ListLogs` is `admin` only: filter by action, object type, keyword, and date range, plus paging. A query also deletes records older than 90 days and reports how many were removed.
- The frontend block is at the bottom of `/settings` (“最近写操作”, recent writes), grouped by day. The default view is the summary; “变更 n 项” (n fields changed) expands the field-level diff.

### Opportunity and risk rules

`DashboardManager.GetSummary` also returns `Opportunities` and `Risks`, both computed from `MetricDaily` inside the window. `SignalPolicy` text in the conclusion is generated by the backend from the **thresholds currently in effect**. The frontend displays that text as-is, so the source of each conclusion stays explicit.

Thresholds live in `SignalThresholdConfig` (a singleton document with a fixed id). They are edited on `/settings` and apply on save. If the document is missing, defaults are used. The Default column below is `SignalThresholdDefaults`.

| Category | Rule | Fields | Default | Allowed range |
| --- | --- | --- | --- | --- |
| Breakout opportunity | Single-day views ≥ N times that account's average daily views in the window, and ≥ M | `BreakoutMultiplier` / `BreakoutMinViews` | 2× / 1,000 | 1.1–10 / 0–100,000,000 |
| Slowdown risk | Later-half average daily views are down ≥ N% versus the earlier half (skipped when the earlier half has no data) | `DeclineThresholdPercent` | 30% | 1–90% |
| Low engagement | Window engagement rate < N% (judged only when views ≥ the breakout minimum) | `LowInteractionRatePercent` | 1% | 0.1–50% |
| Missing data | A non-disabled account has no daily row for N days (accounts created inside the window are skipped) | `StaleDays` | 3 days | 1–30 |

- Thresholds are stored as positive “down by ≥ N%”, so the form has no minus sign. The check compares `rate <= -DeclineThresholdPercent`.
- Each account reports at most one risk at a time, most severe first: slowdown, then low engagement, then missing data, so one account cannot fill the panel.
- Each block shows at most 3 rows. Opportunities sort by multiple, descending. Risks sort by severity and magnitude. Those caps are display rules, not settings.
- Rule copy has one source (`SignalPolicyText`). The home page and the “current policy” on Settings share that text, so a threshold change updates both.
- No hits returns an empty list. The frontend says no account in the window reached the threshold. It does not invent a “possible opportunity” row.

---

## Roles and permissions

Display names, default views, and the [product docs · Users and roles](https://shuishui313.github.io/MediaMgDashboard/) (in Chinese) use the same column:

| Role id | Display name | Default view |
| --- | --- | --- |
| `admin` | Administrator (管理员) | Overview (plus the management panel) |
| `sales` | Sales (商务) | Deals |
| `finance` | Finance (财务) | Deals (quote review) |
| `planner` | Planning (策划) | Content plans |
| `operations` | Operations (运营) | Content plans (throttling response) |
| `editor` | Editing (剪辑) | Todos |
| `analyst` | Analysis (分析) | Overview |
| — | Guest (not in a business user group) | Overview, read-only |

This system does not keep its own membership list. Feishu user groups are the source: joining a group grants the role, leaving it removes the role. The map is `RoleMappingConfig`.

> Role constants live in both `Services/App.Api/Utilities/Roles/Roles.cs` and `src/utils/roles.ts`. A change in one must land in the other.

APIs already enforced by the permission matrix (`[RequireRole(...)]` on the backend; the frontend hides the matching entry points):

| API | Allowed roles | Unauthorized result |
| --- | --- | --- |
| `SettingsManager.GetSignalThresholds` / `SaveSignalThresholds` | `admin` | 403 + Chinese reason |
| `PlatformAccountManager.SaveAccount` / `DisableAccount` | `admin`, `operations` | 403 + Chinese reason |
| `MetricManager.IngestManual` / `ImportCsv` | `admin`, `operations` | 403 + Chinese reason |

Read APIs (`GetSummary`, `ListAccounts`, `ListRecentMetrics`) only require a signed-in user, so a guest can see the overview and the account list and cannot see any write entry. The `/settings` route itself sends non-admins to `/unauthorized`. In development, `AppConfiguration__AdminEmails` decides who receives `admin`.

---

## Frontend routes

The product docs define 6 pages (`/login`, `/`, `/business`, `/plans`, `/connections`, `/settings`). Current progress:

| Path | Page | Status |
| --- | --- | --- |
| `/` | Workbench home (Dashboard) | Behind `ProtectedRoute` |
| `/login` | Login | Implemented (username and password). Feishu SSO still to be wired |
| `/business` | Commercial deal list | Implemented (filter, create / edit, stage advance) |
| `/business/:dealId` | Deal detail | Implemented (stage timeline, review / advance, linked content plans) |
| `/plans` | Content plan list | Implemented (filter, create / edit) |
| `/plans/:planId` | Content plan detail | Implemented (status timeline, advance / archive, linked deal) |
| `/connections` | Platform connection list | Implemented (account management + manual entry + CSV import) |
| `/connections/:platform` | Platform connection detail | Placeholder |
| `/settings` | Settings (thresholds, default view, notification channels) | Thresholds implemented. Default view and notification channels are not |
| `/unauthorized` | No permission | Shared copy and styling |
| `*` | 404 | Shared copy and styling |

`ProtectedRoute` (`react-app/src/routes/ProtectedRoute.tsx`) hydrates the session for protected routes: no token → redirect to `/login` and keep the original path, then return there after login; token without a session → `AuthManager.GetSession`; timeout → retry / sign in again.

---

## Design system and UI conventions

Every page uses the components under `react-app/src/components/dashboard/`. New pages should reuse them instead of inventing another card style.

| Component | Responsibility |
| --- | --- |
| `PageShell` | Page inset, max width (1440px), vertical rhythm |
| `Panel` / `PanelHeader` / `PanelBody` | Panel chrome. Shared `surface-panel` radius / border / shadow |
| `SectionHeader` | `eyebrow + title + description + actions`, optional icon |
| `StatusPill` | Five semantic status colors. Fixed 24px height, tabular figures |
| `SegmentedTabs` | Segmented control with `role="tablist"` / `aria-selected` |
| `TrendChart` / `TrendLegend` | Multi-metric trend, each series normalized to its own peak. Colors from `chart-1` / `info` / `destructive` |

Conventions:

1. **Semantic colors only**: `bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`, `text-success`, and the rest of the token set. Hard-coded theme colors such as `#101114`, `bg-white/90`, or `rgba(...)` break dark mode.
2. **Radius scale**: panel `rounded-3xl` (24px) → inner card `rounded-2xl` (16px) → metric block `rounded-xl` (12px) → pill `rounded-full`.
3. **Numbers**: use `formatCompactNumber()` (`万` / `千`). Tables and metrics use `tabular-nums`. Do not mix `k`, `w`, and `万` on a page.
4. **Headings**: section titles use `SectionHeader` (`h2`). The page title uses `h1`. Do not use `CardDescription` as a subheading.
5. **Do not repeat the same metric**: the metric card, the chart, and the legend each carry a different fact (value / trend / color key).
6. **Complete states**: a new async region provides loading (skeleton), empty, and error. Reuse `LoadingSkeleton` / `EmptyState` / `ErrorState` from `react-app/src/components/dashboard/`; the no-permission case routes to `/unauthorized`.
7. **Accessibility**: clickable regions use `Link` / `Button` with a visible `focus-visible` ring. Charts need `role="img"` and `aria-label`.

---

## Security and secrets

- **Secrets stay out of the repo.** `react-app/.env`, `react-app/.env.local`, `Services/App.Api/appsettings.Development.json`, and `appsettings.*.local.json` are in `.gitignore`. `appsettings.json` keeps placeholders only.
- **Tokens are confidential.** `AccessToken` / `RefreshToken` travel only in the request body and the response envelope. They are not logged, not shown in the UI, not put in error text, and not included in screenshots or docs.
- **Server keys stay on the server.** `SupabaseSecretKey` (service role) can bypass RLS. It is for backend admin operations only and must not be sent to the browser.
- **The development signing key is not baked into code.** `LocalAuthAccessor` has no hard-coded key. Startup reads `AppConfiguration:LocalJwtSigningKey` first. If it is unset, a 48-byte random key is generated at `~/CodeBuddy/Resources/<AppName>/local-signing.key` and written with mode `0600` (current user only). The file is outside the repository and is not committed. Rotating it invalidates local tokens already issued; sign in again.
- **Redact docs and screenshots.** Write secrets as `sk_****`, `eyJ****`, or `<masked>`.
- **If a secret is committed:** rotate it on the Supabase / database side first, then scrub Git history. Deleting the commit without rotating the key does nothing.

Check before you commit:

```bash
git grep -nE "eyJ[A-Za-z0-9_-]{20,}|sk_[A-Za-z0-9]{10,}|postgres(ql)?://[^\"' ]+@"
git status --ignored --short | grep -E "\.env|appsettings"
```

---

## Deployment

`.gitea/workflows/deploy.yml` is a manually triggered pipeline:

1. Build the frontend (`npm ci && npm run build`).
2. Publish the backend (`dotnet publish -c Release`).
3. Deploy the frontend to Azure Static Web Apps (input `SWA_DEPLOYMENT_TOKEN`).
4. Deploy the backend to Azure App Service (input `APP_SERVICE_PUBLISH_PROFILE`).

All three inputs are supplied by the person who runs the workflow. They are not stored and not written into the repository. CORS is configured on the Azure side. Production does not also emit CORS headers from the app.

### Docs site

The product docs (`docs/`) are not part of that pipeline. GitHub Pages publishes them on their own: static files under `/docs` on `main`, with no build. Push doc changes to `main` and Pages republishes, usually within a minute.

Pages charges for private repositories. This repository is public, and Pages is already enabled.

---

## Next steps

> Positioning, roles, and metric definitions are in the [product docs](https://shuishui313.github.io/MediaMgDashboard/) (in Chinese). The full breakdown (M0–M4), data-model fields, Manager API list, and acceptance criteria are in [docs/implementation-plan.md](docs/implementation-plan.md) (in Chinese).

### P0 — A main path that has data and identity

1. **Feishu SSO.** Add a Feishu entry beside password login and a `/auth/feishu/callback` route. `FeishuManager.ExchangeCode` exchanges the code for `open_id` and issues this system's JWT. Feishu credentials stay in `Feishu__*` environment variables; the Feishu token is not sent to the browser. Password login and `ProtectedRoute` are done.
2. **Align roles.** Add `RoleMappingConfig` (Feishu user group → role) and a `SyncDirectory` job that marks departed users `Disabled`. `[RequireRole(...)]` is already on Settings and on account / metric writes; remaining write APIs get it as they land.
3. **Backend data skeleton.** `DashboardManager.GetSummary` already covers every home block. The execution lists and management overview no longer keep mock constants; KPI, trend, and signal blocks still have labelled “static sample data” fallback cards for a failed API call. Opportunity / risk thresholds are editable on `/settings` and apply on save; rule copy shares `SignalPolicyText` with the home page. The execution list and the management overview are backed by `DealManager` / `ContentPlanManager` / `TodoManager`. Opportunities and risks can be turned into todos in one click.
4. **Detail pages.** `/business/:dealId` and `/plans/:planId` are done. Still open: `/connections/:platform` (authorization status, retry after a failed sync).

### P1 — Make the pages usable and trustworthy

5. ~~**States and feedback.** Shared loading skeleton, empty, and error-retry states.~~ — Done. The three shared states live in `components/dashboard/`; no-permission routes to `/unauthorized`.
6. **Chart interaction.** Range switch (5 points / week / month), hover values, platform filter, and a normalization note next to the legend.
7. **Platform connections.** Authorization status, sync jobs, failure retry, and throttling alerts, matching the home “sync error” metric.

### P2 — Experience and the management view

8. **Management metric definitions.** Configurable metrics, definition copy, and export.
9. **Dark mode.** A theme toggle on the app shell. Tokens are ready, and pages no longer hard-code colors.
10. **Mobile.** Tables become card lists; touch targets and type scale adapt. Add end-to-end coverage for the key pages.

### Acceptance reference

- Every number on the workbench comes from the API and matches the backend after refresh. Every conclusion can be drilled into its detail rows.
- An anonymous visit to `/` is sent to `/login`. After Feishu authorization, the user lands on that role's default view.
- Frontend and backend role lists match. An unauthorized call returns 403. Changing a URL parameter does not reveal someone else's data.
- A colleague in no business user group can look and cannot edit.
- After a deal finishes Feishu approval, the list stage updates on its own. An illegal transition is rejected.
- Pages do not hard-code theme colors. Dark mode has no unreadable text.

The full checklist (M3, item by item) is in the [product docs · Acceptance criteria](https://shuishui313.github.io/MediaMgDashboard/) (in Chinese).

---

<details>
<summary>Directory overview</summary>

The table is the directory tree above, with the repository name `MediaMgDashboard` as the root (the retired `mediaai` repo name is no longer the label). The last rows are docs files the tree does not expand.

| Path | What it is |
| --- | --- |
| `react-app/` | Frontend |
| `react-app/src/api/` | ApiClient + DTOs + AuthManager wrappers |
| `react-app/src/auth/` | AuthStore (token / session persistence) |
| `react-app/src/components/dashboard/` | Shared display components (panel, header, status, trend, segmented control) |
| `react-app/src/components/ui/` | ShadCN primitives |
| `react-app/src/lib/` | `cn()`, number formatting |
| `react-app/src/routes/` | Route table and ProtectedRoute |
| `react-app/src/views/` | Page views |
| `react-app/src/default.css` | Design tokens (color / radius / shadow) |
| `react-app/.env.example` | Env template (no real values) |
| `Services/` | Backend |
| `Services/App.Api/` | Host, Managers, Engines, Accessors |
| `Services/App.ServiceInvoker/` | RPC routing, reflection invoke, auth |
| `Services/Contracts.Dto/` | Request / response DTOs |
| `Services/Contracts.Domain/` | Domain entities and contracts |
| `docs/` | Product docs, implementation plan, RPC notes |
| `.gitea/workflows/deploy.yml` | Deploy pipeline |
| `README.md`, `README.en.md` | Chinese and English READMEs. Keep the language switchers; update both |
| `AGENTS.md` | Agent rules: keep role files in sync, do not commit secrets, do not edit ServiceInvoker |
| `docs/decisions.md`, `docs/declined.md` | Accepted decisions, and work this repo will not take |
| `.github/PULL_REQUEST_TEMPLATE.md` | Three-column pull request template |

</details>
