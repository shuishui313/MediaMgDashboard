import EmptyState from '@/components/dashboard/EmptyState';
import PageShell from '@/components/dashboard/PageShell';
import { Panel, PanelBody, PanelHeader } from '@/components/dashboard/Panel';
import SectionHeader from '@/components/dashboard/SectionHeader';
import SegmentedTabs from '@/components/dashboard/SegmentedTabs';
import StatusPill, { type StatusTone } from '@/components/dashboard/StatusPill';
import TrendChart, { TrendLegend, type TrendPoint } from '@/components/dashboard/TrendChart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import DashboardManager from '@/api/DashboardManager';
import TodoManager from '@/api/TodoManager';
import type { DashboardSignalDto, DashboardSummaryDto } from '@/api/AppDtos';
import useAuthStore from '@/auth/AuthStore';
import { formatCompactNumber } from '@/lib/format';
import { getPlatformLabel } from '@/utils/platforms';
import { resolveErrorText } from '@/utils/errors';
import {
  RANGE_OPTIONS,
  buildPlatformOptions,
  filterTrendsByPlatform,
  sampleTrendPoints,
  toDays,
  type RangeDays,
} from '@/utils/dashboardRange';
import { canCreateTodos, canEditThresholds, canManageAccounts } from '@/utils/permissions';
import {
  ADMIN_ROLE,
  ANALYST_ROLE,
  EDITOR_ROLE,
  FINANCE_ROLE,
  OPERATIONS_ROLE,
  PLANNER_ROLE,
  SALES_ROLE,
  getRoleLabels,
  hasRole,
} from '@/utils/roles';
import { ArrowRight, CalendarRange, Flame, ListPlus, Siren } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

const workspaceTabs = [
  { value: 'business', label: '商务合作' },
  { value: 'plans', label: '日常内容计划' },
  { value: 'todo', label: '跨角色待办' },
] as const;

type WorkspaceTab = (typeof workspaceTabs)[number]['value'];

type MetricCardView = {
  key: string;
  label: string;
  value: string;
  unit?: string;
  detail: string;
  isTextValue?: boolean;
  /** 回溯说明：这个数字来自哪些账号、多少条日记录 */
  trace: string;
  pending?: boolean;
};

/**
 * 接口不可用时的兜底展示。这里的数据一律标为「静态示例数据」，
 * 不与接口返回的真实聚合混在一起，避免看着像真数据。
 */
const fallbackMetricCards: MetricCardView[] = [
  { key: 'top-platform', label: '最强平台', value: '抖音', detail: '播放 +32%', isTextValue: true, trace: '静态示例数据 · 接口未连接' },
  { key: 'declining-platform', label: '下滑平台', value: '微博', detail: '日均 -31%', isTextValue: true, trace: '静态示例数据 · 接口未连接' },
  { key: 'total-views', label: '总播放', value: '52.4', unit: '万', detail: '互动率 9.8%', trace: '静态示例数据 · 接口未连接' },
  { key: 'new-followers', label: '新增粉丝', value: '1,284', unit: '人', detail: '净增', trace: '静态示例数据 · 接口未连接' },
];

const fallbackPlatformSeries: { platform: string; tone: StatusTone; points: TrendPoint[] }[] = [
  {
    platform: '抖音',
    tone: 'success',
    points: [
      { label: '01', views: 82000, comments: 14000, shares: 7000 },
      { label: '02', views: 94000, comments: 16000, shares: 8000 },
      { label: '03', views: 108000, comments: 19000, shares: 10000 },
      { label: '04', views: 132000, comments: 26000, shares: 13000 },
      { label: '05', views: 168000, comments: 33000, shares: 16000 },
    ],
  },
  {
    platform: '公众号',
    tone: 'info',
    points: [
      { label: '01', views: 68000, comments: 11000, shares: 5000 },
      { label: '02', views: 72000, comments: 12000, shares: 6000 },
      { label: '03', views: 70000, comments: 12000, shares: 5000 },
      { label: '04', views: 78000, comments: 14000, shares: 7000 },
      { label: '05', views: 84000, comments: 15000, shares: 8000 },
    ],
  },
  {
    platform: '微博',
    tone: 'destructive',
    points: [
      { label: '01', views: 74000, comments: 10000, shares: 6000 },
      { label: '02', views: 67000, comments: 9000, shares: 5000 },
      { label: '03', views: 59000, comments: 8000, shares: 4000 },
      { label: '04', views: 45000, comments: 6000, shares: 3000 },
      { label: '05', views: 39000, comments: 5000, shares: 2000 },
    ],
  },
];

/** 机会 / 风险区块的一行。由 DashboardSignalDto 映射而来，trace 必须保留。 */
type SignalView = {
  id: string;
  title: string;
  platform: string;
  signal: string;
  detail: string;
  tone: StatusTone;
  trace: string;
  href: string;
};

/** 接口不可用时的兜底：明确标为「静态示例数据」，不与真实计算结果混排。 */
const fallbackOpportunities: SignalView[] = [
  { id: 'fallback-breakout-1', title: '抖音 · 主号', platform: 'douyin', signal: '2.8x 日均', detail: '单日 18.6 万 · 区间日均 6.6 万', tone: 'success', trace: '静态示例数据 · 接口未连接', href: '/connections' },
  { id: 'fallback-breakout-2', title: '公众号 · 主号', platform: 'wechat-official', signal: '1.9x 日均', detail: '单日 6.3 万 · 区间日均 3.3 万', tone: 'success', trace: '静态示例数据 · 接口未连接', href: '/connections' },
];

const fallbackRisks: SignalView[] = [
  { id: 'fallback-risk-1', title: '微博 · 主号', platform: 'weibo', signal: '-42%', detail: '日均 5.2 万 → 3.0 万', tone: 'destructive', trace: '静态示例数据 · 接口未连接', href: '/connections' },
  { id: 'fallback-risk-2', title: '抖音 · 主号', platform: 'douyin', signal: '近 4 天无数据', detail: '最后一次录入 10-14 · 需要补录', tone: 'warning', trace: '静态示例数据 · 接口未连接', href: '/connections' },
];

const toSignalViews = (items: DashboardSignalDto[]): SignalView[] =>
  items.map((item) => ({
    id: item.Key,
    title: item.Title,
    platform: item.Platform,
    signal: item.Signal,
    detail: item.Detail,
    tone: (item.Tone as StatusTone) ?? 'info',
    trace: item.Trace,
    href: '/connections',
  }));

const changeRate = (points: TrendPoint[]) => {
  if (points.length < 2) return '暂无对比';
  const first = points[0].views;
  const last = points[points.length - 1].views;
  if (first === 0) return '暂无对比';
  const rate = ((last - first) / first) * 100;
  return `${rate > 0 ? '+' : ''}${rate.toFixed(0)}%`;
};

const HomeView = () => {
  const session = useAuthStore((state) => state.session);
  const signOut = useAuthStore((state) => state.signOut);
  const roles = session?.Roles ?? [];
  const roleKey = roles.join(',');
  const roleLabels = getRoleLabels(roles);
  const isManagement = hasRole(roles, ADMIN_ROLE);
  const canEditAccountData = canManageAccounts(roles);
  const canEditThreshold = canEditThresholds(roles);

  const [activeTab, setActiveTab] = useState<WorkspaceTab>('business');
  const [isTabPinned, setIsTabPinned] = useState(false);

  const [summary, setSummary] = useState<DashboardSummaryDto | null>(null);
  const [summaryStatus, setSummaryStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [summaryReloadKey, setSummaryReloadKey] = useState(0);
  const [rangeDays, setRangeDays] = useState<RangeDays>('7');
  const [platformFilter, setPlatformFilter] = useState('all');

  // 信号卡片上的「转待办」：记录每条信号的处理状态，避免重复点击。
  const [signalTodoState, setSignalTodoState] = useState<Record<string, 'pending' | 'done'>>({});
  const [signalNotice, setSignalNotice] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const canCreateTodo = canCreateTodos(roles);

  useEffect(() => {
    if (isTabPinned) return;
    setActiveTab(getDefaultTab(roleKey ? roleKey.split(',') : []));
  }, [roleKey, isTabPinned]);

  useEffect(() => {
    let cancelled = false;
    setSummaryStatus('loading');

    DashboardManager.GetSummary({ Days: toDays(rangeDays) })
      .then((data) => {
        if (cancelled) return;
        setSummary(data);
        setSummaryStatus('ready');
      })
      .catch(() => {
        if (cancelled) return;
        setSummaryStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [summaryReloadKey, rangeDays]);

  const metricViews: MetricCardView[] = summary
    ? summary.Kpis.map((kpi) => ({
        key: kpi.Key,
        label: kpi.Label,
        // 平台类指标后端给的是标识（douyin），展示层统一映射为中文名
        value: kpi.IsText ? getPlatformLabel(kpi.Display) : kpi.Display,
        unit: kpi.Unit || undefined,
        detail: kpi.Detail,
        isTextValue: kpi.IsText,
        trace: kpi.Trace,
        pending: kpi.Status === 'pending',
      }))
    : fallbackMetricCards;

  // 时间范围走后端 Days；平台筛选与点数采样只在展示层做，后端聚合口径不随筛选变化。
  const allTrendViews = summary
    ? summary.PlatformTrends.map((trend) => ({
        platformKey: trend.Platform,
        platformLabel: getPlatformLabel(trend.Platform),
        tone: (trend.Tone as StatusTone) ?? 'info',
        changeRate: trend.ChangeRate,
        points: sampleTrendPoints(
          trend.Points.map((point) => ({
            label: point.Label,
            views: point.Views,
            comments: point.Comments,
            shares: point.Shares,
          })),
          10,
        ),
      }))
    : fallbackPlatformSeries.map((item) => ({
        platformKey: item.platform,
        platformLabel: item.platform,
        tone: item.tone,
        changeRate: changeRate(item.points),
        points: sampleTrendPoints(item.points, 10),
      }));

  const platformOptions = buildPlatformOptions(allTrendViews);
  const trendViews = filterTrendsByPlatform(allTrendViews, platformFilter);

  // 切换区间后平台列表可能变化，失效的筛选值回到「全部平台」，避免停在空结果上。
  useEffect(() => {
    if (platformFilter !== 'all' && !platformOptions.some((option) => option.value === platformFilter)) {
      setPlatformFilter('all');
    }
  }, [platformOptions, platformFilter]);

  const opportunityViews = summary ? toSignalViews(summary.Opportunities ?? []) : fallbackOpportunities;
  const riskViews = summary ? toSignalViews(summary.Risks ?? []) : fallbackRisks;

  // 执行列表三块来自 DashboardManager.GetSummary().Execution，与指标区间无关。
  // 接口没回来时留空，不拿示例数据顶替，避免把假单当成真的待办。
  const execution = summary?.Execution;
  const dealRows = execution?.Deals ?? [];
  const planRows = execution?.Plans ?? [];
  const todoRows = execution?.Todos ?? [];
  const managementRows = execution?.Management ?? [];
  const hasExecution = Boolean(execution);
  // 计划页右栏只放由内容计划推导出来的提醒（缺方向 / 已过排期），不混入结算类待办。
  const planReminders = todoRows.filter((item) => item.Key.startsWith('auto-plan'));

  const createTodoFromSignal = async (item: SignalView, kind: 'opportunity' | 'risk') => {
    setSignalTodoState((prev) => ({ ...prev, [item.id]: 'pending' }));
    setSignalNotice(null);

    try {
      const result = await TodoManager.SaveTodo({
        // 机会交给策划定选题，风险交给运营排查；标题里带上触发值，待办列表一眼能认出是哪条信号。
        Title: `${kind === 'risk' ? '风险跟进' : '机会跟进'}：${item.title} · ${item.signal}`,
        OwnerRole: kind === 'risk' ? OPERATIONS_ROLE : PLANNER_ROLE,
        Priority: item.tone === 'destructive' ? 'high' : 'normal',
        Href: item.href,
        SourceKey: `signal:${item.id}`,
      });

      if (!result.Success) {
        setSignalNotice({ tone: 'error', text: result.Message || '生成待办失败。' });
        setSignalTodoState((prev) => {
          const next = { ...prev };
          delete next[item.id];
          return next;
        });
        return;
      }

      setSignalNotice({ tone: 'success', text: result.Message });
      setSignalTodoState((prev) => ({ ...prev, [item.id]: 'done' }));
      setSummaryReloadKey((value) => value + 1);
    } catch (error) {
      setSignalNotice({ tone: 'error', text: resolveErrorText(error, '生成待办失败，后端接口不可用。') });
      setSignalTodoState((prev) => {
        const next = { ...prev };
        delete next[item.id];
        return next;
      });
    }
  };

  const renderSignalAction = (item: SignalView, kind: 'opportunity' | 'risk') => {
    if (!canCreateTodo) return null;
    const state = signalTodoState[item.id];

    return (
      <Button
        variant="outline"
        size="sm"
        disabled={state === 'pending' || state === 'done'}
        onClick={() => createTodoFromSignal(item, kind)}
      >
        <ListPlus className="size-4" />
        {state === 'done' ? '已转待办' : state === 'pending' ? '生成中…' : '转待办'}
      </Button>
    );
  };

  return (
    <PageShell>
      <section className="overflow-hidden rounded-3xl bg-primary text-primary-foreground">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
          <div className="relative flex flex-col justify-between gap-8 overflow-hidden px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
            <div className="pointer-events-none absolute -left-12 top-6 size-56 rounded-full bg-primary-foreground/5 blur-3xl" />
            <div className="pointer-events-none absolute right-16 top-10 size-40 rounded-full border border-primary-foreground/10" />

            <div className="relative space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.24em] text-primary-foreground/55">
                  <span>MediaAI</span>
                  <span className="size-1 rounded-full bg-primary-foreground/30" />
                  <span>Operations Cockpit</span>
                </div>
                <div className="flex shrink-0 items-center gap-2 text-[11px] text-primary-foreground/45">
                  {session?.Email ? <span className="hidden sm:inline">{session.Email}</span> : null}
                  <button
                    type="button"
                    onClick={signOut}
                    className="rounded-full border border-primary-foreground/20 px-2.5 py-1 leading-none transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
                  >
                    退出
                  </button>
                </div>
              </div>
              <h1 className="max-w-2xl text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
                Dashboard
              </h1>
              <p className="max-w-xl text-sm leading-7 text-primary-foreground/65">
                先看平台态势，再判断爆款机会与限流风险。
              </p>
            </div>

            <div className="relative flex flex-wrap items-center gap-2">
              {roleLabels.map((role) => (
                <Badge
                  key={role}
                  variant="outline"
                  className="h-6 rounded-full border-primary-foreground/20 bg-primary-foreground/10 px-3 text-[10px] font-medium uppercase tracking-[0.16em] text-primary-foreground/75"
                >
                  {role}
                </Badge>
              ))}
              {isManagement ? (
                <Badge className="h-6 rounded-full bg-primary-foreground px-3 text-[10px] tracking-[0.16em] text-primary">
                  管理视图
                </Badge>
              ) : null}
            </div>
          </div>

          <div className="grid gap-px border-t border-primary-foreground/10 bg-primary-foreground/10 p-px sm:grid-cols-2 lg:border-l lg:border-t-0">
            {metricViews.map((item) => (
              <div key={item.key} className="flex min-h-[168px] flex-col justify-between gap-4 bg-primary px-6 py-6">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-primary-foreground/65">{item.label}</p>
                  <StatusPill appearance="inverse">{item.detail}</StatusPill>
                </div>
                <div className="space-y-2">
                  <div className={`flex items-baseline gap-1.5 ${item.pending ? 'opacity-60' : ''}`}>
                    <span
                      className={`font-semibold leading-none tracking-tight tabular-nums ${
                        item.isTextValue ? 'text-4xl' : 'text-5xl'
                      }`}
                    >
                      {item.value}
                    </span>
                    {item.unit ? <span className="text-sm text-primary-foreground/60">{item.unit}</span> : null}
                  </div>
                  <p className="text-[10px] leading-4 text-primary-foreground/40">{item.trace}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {summaryStatus === 'error' ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm leading-6 text-destructive">
          <span>工作台数据没有加载成功，当前显示的是静态示例数据。</span>
          <Button variant="outline" size="sm" onClick={() => setSummaryReloadKey((value) => value + 1)}>
            重试
          </Button>
        </div>
      ) : null}

      {summary ? (
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs leading-6 text-muted-foreground">
          <p>
            数据来源：{summary.DataSource.Label}（{summary.RangeStart} 至 {summary.RangeEnd}）
          </p>
          <div className="flex flex-wrap items-center gap-4">
            {canEditAccountData ? (
              <Link to="/connections" className="font-medium text-foreground underline underline-offset-4">
                管理账号 / 录入数据
              </Link>
            ) : null}
            {canEditThreshold ? (
              <Link to="/settings" className="font-medium text-foreground underline underline-offset-4">
                调整判定阈值
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}

      <Panel>
        <PanelHeader
          eyebrow="平台态势"
          title={`最近 ${toDays(rangeDays)} 天`}
          description="三条指标各自按自身峰值归一化，用于比较走势形状；具体数值见指标卡，环比按日均播放计算。每平台最多 10 个采样点，30 天区间等间隔取样，首尾日期都保留。"
          actions={<TrendLegend />}
        />
        <PanelBody className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <SegmentedTabs
                label="走势时间范围"
                value={rangeDays}
                options={RANGE_OPTIONS}
                onChange={setRangeDays}
              />
              <SegmentedTabs
                label="平台筛选"
                value={platformFilter}
                options={platformOptions}
                onChange={setPlatformFilter}
              />
            </div>
            <p className="text-xs tabular-nums text-muted-foreground">
              {summary ? `数据区间 ${summary.RangeStart} 至 ${summary.RangeEnd}` : '静态示例数据 · 接口未连接'}
              {summaryStatus === 'loading' ? ' · 正在刷新' : ''}
            </p>
          </div>

          {trendViews.length === 0 ? (
            <EmptyState compact title="该平台在区间内暂无走势数据" description="换一个平台或时间范围再试。" />
          ) : (
            <div className="grid gap-4 lg:grid-cols-3" aria-busy={summaryStatus === 'loading'}>
              {trendViews.map((item) => {
                const latest = item.points[item.points.length - 1] ?? { views: 0, comments: 0, shares: 0 };

                return (
                  <article key={item.platformKey} className="rounded-2xl border border-border/60 bg-background/60 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold tracking-tight">{item.platformLabel}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{item.points.length} 个采样点</p>
                      </div>
                      <StatusPill tone={item.tone}>{item.changeRate}</StatusPill>
                    </div>

                    <TrendChart className="mt-4" points={item.points} platform={item.platformLabel} />

                    <dl className="mt-4 grid grid-cols-3 gap-2">
                      <MetricTile label="浏览" value={formatCompactNumber(latest.views)} />
                      <MetricTile label="评论" value={formatCompactNumber(latest.comments)} />
                      <MetricTile label="转发" value={formatCompactNumber(latest.shares)} />
                    </dl>
                  </article>
                );
              })}
            </div>
          )}
        </PanelBody>
      </Panel>

      {signalNotice ? (
        <div
          className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm leading-6 ${
            signalNotice.tone === 'success'
              ? 'border border-border/60 bg-muted/40 text-foreground'
              : 'border border-destructive/30 bg-destructive/5 text-destructive'
          }`}
        >
          <span>{signalNotice.text}</span>
          <button type="button" className="text-xs underline underline-offset-4" onClick={() => setSignalNotice(null)}>
            关闭
          </button>
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel>
          <PanelHeader
            eyebrow="机会"
            title="爆款机会"
            icon={Flame}
            actions={
              <StatusPill tone={summary ? (opportunityViews.length > 0 ? 'success' : 'default') : 'info'}>
                {summary ? `${opportunityViews.length} 个触发` : '静态示例数据'}
              </StatusPill>
            }
          />
          <PanelBody className="space-y-3">
            {opportunityViews.length > 0 ? (
              opportunityViews.map((item) => (
                <SignalRow key={item.id} {...item} action={renderSignalAction(item, 'opportunity')} />
              ))
            ) : (
              <EmptyState
                compact
                title="区间内没有达标的账号。"
                description="只有单日播放达到自身日均 2 倍的账号才会出现在这里，不做「疑似机会」的推测。"
              />
            )}
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader
            eyebrow="风险"
            title="限流 / 掉速风险"
            icon={Siren}
            actions={
              <StatusPill tone={summary ? (riskViews.length > 0 ? 'destructive' : 'success') : 'info'}>
                {summary ? (riskViews.length > 0 ? `${riskViews.length} 个需排查` : '暂未触发') : '静态示例数据'}
              </StatusPill>
            }
          />
          <PanelBody className="space-y-3">
            {riskViews.length > 0 ? (
              riskViews.map((item) => (
                <SignalRow key={item.id} {...item} action={renderSignalAction(item, 'risk')} />
              ))
            ) : (
              <EmptyState compact title="没有账号触发掉速、互动偏低或缺数据规则。" />
            )}
          </PanelBody>
        </Panel>
      </div>

      {summary?.SignalPolicy ? (
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-[11px] leading-5 text-muted-foreground">
          <p>判定规则：{summary.SignalPolicy}</p>
          {summary.SignalPolicyTrace ? <p>{summary.SignalPolicyTrace}</p> : null}
        </div>
      ) : null}

      {isManagement ? (
        <Panel>
          <PanelHeader
            eyebrow="管理层概览"
            title="跨业务总量"
            actions={<StatusPill tone={hasExecution ? 'info' : 'default'}>{hasExecution ? '实时统计' : '待加载'}</StatusPill>}
          />
          <PanelBody className="grid gap-3 sm:grid-cols-3">
            {managementRows.length > 0 ? (
              managementRows.map((item) => (
                <div key={item.Label} className="rounded-2xl border border-border/60 bg-background/60 px-5 py-4">
                  <p className="text-sm text-muted-foreground">{item.Label}</p>
                  <div className="mt-3 flex items-baseline gap-1.5">
                    <span className="text-4xl font-semibold leading-none tracking-tight tabular-nums">{item.Value}</span>
                    <span className="text-xs text-muted-foreground">{item.Unit}</span>
                  </div>
                  <p className="mt-2 text-[10px] leading-4 text-muted-foreground/80">{item.Trace}</p>
                </div>
              ))
            ) : (
              <p className="px-1 py-2 text-sm leading-6 text-muted-foreground">
                {hasExecution ? '当前账号不是管理员，管理层面板仅对管理员展示。' : '接口尚未返回执行列表，管理层面板暂不展示。'}
              </p>
            )}
          </PanelBody>
        </Panel>
      ) : null}

      <section className="space-y-4">
        <SectionHeader
          /* 25px = 卡片 1px 边框 + 24px 内边距，让标题与 Tab 同卡片内文字（表头/单元格）严格对齐 */
          className="px-[25px]"
          eyebrow="业务承接"
          title="执行列表"
          description="按角色汇总需要推进的事项与下一步动作。"
          actions={
            <SegmentedTabs
              label="执行列表分类"
              value={activeTab}
              options={workspaceTabs}
              onChange={(next) => {
                setIsTabPinned(true);
                setActiveTab(next);
              }}
            />
          }
        />

        {activeTab === 'business' ? (
          <Panel>
            <PanelHeader
              eyebrow="商务合作"
              title="当前执行"
              description={hasExecution ? `共 ${execution?.DealTotal ?? 0} 条推进中的商务单，按紧急度取前 ${dealRows.length} 条。` : '接口尚未返回执行列表。'}
              actions={
                <Button variant="outline" size="sm" asChild>
                  <Link to="/business">查看全部</Link>
                </Button>
              }
            />
            <Table>
              <TableHeader>
                <TableRow className="border-border/60 hover:bg-transparent">
                  <TableHead className="px-6">事项</TableHead>
                  <TableHead>负责人</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>下一步</TableHead>
                  <TableHead className="px-6 text-right">详情</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dealRows.length > 0 ? (
                  dealRows.map((row) => (
                    <TableRow key={row.Id} className="border-border/50">
                      <TableCell className="px-6 py-4 font-medium whitespace-normal">
                        <div className="flex flex-wrap items-center gap-2">
                          <span>{row.Title}</span>
                          {row.IsSample ? <StatusPill tone="default">示例</StatusPill> : null}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-muted-foreground">{row.OwnerName}</TableCell>
                      <TableCell className="py-4">
                        <StatusPill tone={(row.Tone as StatusTone) ?? 'default'}>{row.StageLabel}</StatusPill>
                      </TableCell>
                      <TableCell className="py-4 whitespace-normal text-muted-foreground">{row.NextStep}</TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        {/* -mr-2.5 抵消 Button 的 px-2.5，让“进入详情”与表头“详情”右边缘严格对齐 */}
                        <Button variant="ghost" size="sm" asChild className="-mr-[11px]">
                          <Link to={`/business/${row.Id}`}>
                            进入详情
                            <ArrowRight className="size-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableCell colSpan={5} className="px-6 py-6">
                      <EmptyState
                        compact
                        title={hasExecution ? '没有推进中的商务单。' : '执行列表没有加载成功。'}
                        description={
                          hasExecution
                            ? '新建后这里会显示待报价审核、待制作等需要处理的事项。'
                            : '稍后重试或检查后端接口。'
                        }
                      />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Panel>
        ) : null}

        {activeTab === 'plans' ? (
          <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
            <Panel>
              <PanelHeader
                eyebrow="内容计划"
                title="当前执行"
                description={hasExecution ? `共 ${execution?.PlanTotal ?? 0} 条未归档计划，按紧急度取前 ${planRows.length} 条。` : '接口尚未返回执行列表。'}
                actions={
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/plans">查看全部</Link>
                  </Button>
                }
              />
              <Table>
                <TableHeader>
                  <TableRow className="border-border/60 hover:bg-transparent">
                    <TableHead className="px-6">计划</TableHead>
                    <TableHead>周期</TableHead>
                    <TableHead>评分</TableHead>
                    <TableHead>方向</TableHead>
                    <TableHead className="px-6 text-right">详情</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {planRows.length > 0 ? (
                    planRows.map((row) => (
                      <TableRow key={row.Id} className="border-border/50">
                        <TableCell className="px-6 py-4 font-medium whitespace-normal">
                          <div className="flex flex-wrap items-center gap-2">
                            <span>{row.Title}</span>
                            <StatusPill tone={(row.Tone as StatusTone) ?? 'default'}>{row.StatusLabel}</StatusPill>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 text-muted-foreground">{row.CycleDisplay}</TableCell>
                        <TableCell className="py-4 tabular-nums">{row.ScoreDisplay}</TableCell>
                        <TableCell className="py-4 whitespace-normal text-muted-foreground">
                          {row.Direction || '缺少方向说明'}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right">
                          {/* 同上：负外边距抵消按钮左右内边距，保证列内右对齐 */}
                          <Button variant="ghost" size="sm" asChild className="-mr-[11px]">
                            <Link to={`/plans/${row.Id}`}>
                              进入详情
                              <ArrowRight className="size-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow className="border-border/50 hover:bg-transparent">
                      <TableCell colSpan={5} className="px-6 py-6">
                        <EmptyState
                          compact
                          title={hasExecution ? '没有未归档的内容计划。' : '执行列表没有加载成功。'}
                          description={hasExecution ? undefined : '稍后重试或检查后端接口。'}
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Panel>

            <Panel>
              <PanelHeader eyebrow="计划提醒" title="待处理提示" icon={CalendarRange} />
              <PanelBody className="space-y-3">
                {planReminders.length > 0 ? (
                  planReminders.map((item) => (
                    <Link
                      key={item.Key}
                      to={item.Href}
                      className="flex items-start justify-between gap-3 rounded-2xl border border-border/60 bg-background/60 px-5 py-4 transition-colors hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    >
                      <span className="text-sm font-medium leading-6">{item.Title}</span>
                      <StatusPill tone={(item.Tone as StatusTone) ?? 'default'}>{item.Urgency}</StatusPill>
                    </Link>
                  ))
                ) : (
                  <EmptyState
                    compact
                    title={hasExecution ? '没有待补方向或已逾期未发布的计划。' : '执行列表没有加载成功。'}
                  />
                )}
              </PanelBody>
            </Panel>
          </div>
        ) : null}

        {activeTab === 'todo' ? (
          <Panel>
            <PanelHeader
              eyebrow="跨角色待办"
              title="当前执行"
              description={
                hasExecution
                  ? `未完成 ${execution?.TodoOpenCount ?? 0} 条，其中「自动」由商务单阶段或内容计划推导，条件修好后自动消失。`
                  : '接口尚未返回执行列表。'
              }
            />
            <PanelBody className="space-y-3">
              {todoRows.length > 0 ? (
                todoRows.map((row) => (
                  <Link
                    key={row.Key}
                    to={row.Href}
                    className="block rounded-2xl border border-border/60 bg-background/60 px-5 py-4 transition-colors hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <p className="font-medium leading-6">{row.Title}</p>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                          <span>{row.OwnerRoleLabel}</span>
                          {row.Auto ? <StatusPill tone="info">自动</StatusPill> : null}
                        </div>
                      </div>
                      <StatusPill tone={(row.Tone as StatusTone) ?? 'default'}>{row.Urgency}</StatusPill>
                    </div>
                  </Link>
                ))
              ) : (
                <EmptyState
                  compact
                  title={hasExecution ? '没有未完成的待办。' : '执行列表没有加载成功。'}
                  description={hasExecution ? undefined : '稍后重试或检查后端接口。'}
                />
              )}
            </PanelBody>
          </Panel>
        ) : null}
      </section>
    </PageShell>
  );
};

const SignalRow = ({ title, platform, signal, detail, tone, trace, href, action }: SignalView & { action?: ReactNode }) => (
  <div className="rounded-2xl border border-border/60 bg-background/60 transition-colors hover:bg-muted/60">
    <div className="flex items-start justify-between gap-4 px-5 py-4">
      <Link
        to={href}
        className="min-w-0 flex-1 space-y-1.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium tracking-tight">{title}</p>
          <StatusPill>{getPlatformLabel(platform)}</StatusPill>
          <StatusPill tone={tone}>{signal}</StatusPill>
        </div>
        <p className="text-sm text-muted-foreground">{detail}</p>
        <p className="text-[10px] leading-4 text-muted-foreground/80">{trace}</p>
      </Link>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <ArrowRight className="size-4 text-muted-foreground" />
        {action}
      </div>
    </div>
  </div>
);

const MetricTile = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl border border-border/60 bg-card/70 px-3 py-2.5 text-center">
    <dt className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{label}</dt>
    <dd className="mt-1 text-lg font-semibold leading-none tracking-tight tabular-nums">{value}</dd>
  </div>
);

/** 按角色优先级决定默认执行列表；与后端角色清单保持一致，未知角色回落到商务合作。 */
const getDefaultTab = (roles: string[]): WorkspaceTab => {
  const priority: WorkspaceTab[] = ['business', 'plans', 'todo'];
  const roleToTab: Record<string, WorkspaceTab> = {
    [FINANCE_ROLE]: 'todo',
    [PLANNER_ROLE]: 'plans',
    [OPERATIONS_ROLE]: 'plans',
    [EDITOR_ROLE]: 'plans',
    [ANALYST_ROLE]: 'plans',
    [SALES_ROLE]: 'business',
    [ADMIN_ROLE]: 'business',
  };

  for (const tab of priority) {
    if (roles.some((role) => roleToTab[role] === tab)) return tab;
  }

  return 'business';
};

export default HomeView;
