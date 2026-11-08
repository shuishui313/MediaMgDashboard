# 实现清单

「全部实现」= 下表全部勾选。飞书应用凭据、平台开放平台资质、Supabase 生产连接串属于外部条件，代码以可配置占位 + 单测覆盖，真实联调由用户提供凭据后单独进行，不计入自动完成范围。`docs/declined.md` 明确不做的项不在本表。

每天一轮：取第一个未完成项，在 box 的 `~/project` 用 shell 落地，跑全套测试，写 `progress/<日期>.md` 并重写 `HANDOFF.md` 第 0 节，提交到 `cloud-dev`。

- [x] T01 `/connections/:platform` 平台明细页（账号状态、粉丝规模、最近录入、来源、三态）— 2026-11-08
- [ ] T02 图表交互：7 / 14 / 30 天时间范围切换
- [ ] T03 图表交互：平台筛选、hover 数值、图例归一化说明
- [ ] T04 暗色模式：壳层主题切换 + 持久化
- [ ] T05 移动端：列表页表格转卡片，触控与字号适配
- [ ] T06 管理层指标：口径可配与说明面板
- [ ] T07 管理层指标：CSV 导出
- [ ] T08 审计日志：导出 CSV + 保留期可配
- [ ] T09 商务单 / 内容计划：安全删除（归档优先）
- [ ] T10 商务单 / 内容计划：CSV 批量导入，复用现有校验
- [ ] T11 `UserSettings` 数据模型 + Manager + `/settings` 区块
- [ ] T12 用户配置生效：默认落地 Tab、可见平台
- [ ] T13 `RoleMappingConfig` 单文档 + 管理员配置页（本地映射）
- [ ] T14 飞书免登骨架：`GetLoginUrl` / `ExchangeCode` + `Feishu__*` 环境变量
- [ ] T15 飞书免登：`/auth/feishu/callback` + 登录页入口 + 一次性 state
- [ ] T16 飞书通讯录同步：后台服务、幂等、离职禁用（骨架）
- [ ] T17 飞书审批回调：验签 / 解密 / 幂等 / 推进 Deal 阶段
- [ ] T18 飞书告警卡片：`AlertManager` + 群机器人推送（骨架）
- [ ] T19 告警规则：阈值扫描、Alert 数据模型、列表 / 确认 / 关闭
- [ ] T20 同步骨架：`IPlatformProvider` + `SyncJob` + 后台服务
- [ ] T21 同步写入：Manual / CSV provider 接入 `Source = api` 路径
- [ ] T22 同步健壮性：失败重试、限流退避、token 刷新
- [ ] T23 同步状态页：授权状态、同步任务、失败重试入口
- [ ] T24 数据归属收口：所有列表 / 详情按 `OwnerId` 过滤 + 越权单测
- [ ] T25 Postgres / Supabase 接入（需连接串，本地保留 JSON）
- [ ] T26 安全清单：登录与回调限速、敏感字段脱敏、错误提示收敛
- [ ] T27 端到端验收 + 关键页面 E2E 测试
- [ ] T28 文档收口：README / README.en / HANDOFF / decisions 同步，勾选验收清单

## 每轮固定动作

1. `box_ensure` 唤醒 box，确认 `~/project` 与 `cloud-dev` 分支。
2. 用 shell 读 `progress/ROADMAP.md` 与最近一篇日志，取下一项。
3. 所有写入用 `cat > 文件 <<'EOF'` / `sed` / `patch`，写完 `cat` 确认。
4. 跑 `npm run check-ts`、`npx vitest run --mode test`、`npm run lint`、`npm run build`、`dotnet build`、`dotnet test`。
5. 写 `progress/<日期>.md` 日志，**重写 `HANDOFF.md` 第 0 节**（模板与最少字段见 §0），写完 `cat` 确认。
6. `git add` 明确列出文件（不含 `run.log`），`git commit`，`git push origin cloud-dev`，不动 `main`。
7. 报告改动文件、测试结果、下一步。
