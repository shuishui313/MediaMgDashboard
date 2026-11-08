import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import EmptyState from '@/components/dashboard/EmptyState';
import ErrorState from '@/components/dashboard/ErrorState';
import LoadingSkeleton from '@/components/dashboard/LoadingSkeleton';
import PageShell from '@/components/dashboard/PageShell';
import { Panel, PanelBody, PanelHeader } from '@/components/dashboard/Panel';
import SectionHeader from '@/components/dashboard/SectionHeader';
import StatusPill, { type StatusTone } from '@/components/dashboard/StatusPill';
import { Button } from '@/components/ui/button';
import MetricManager from '@/api/MetricManager';
import PlatformAccountManager from '@/api/PlatformAccountManager';
import type { MetricEntryDto, PlatformAccountDto } from '@/api/AppDtos';
import { formatCompactNumber } from '@/lib/format';
import {
  filterPlatformAccounts,
  filterPlatformMetrics,
  summarizePlatform,
} from '@/utils/platformDetail';
import { getPlatformLabel } from '@/utils/platforms';

type LoadStatus = 'loading' | 'ready' | 'error';

/** 与平台连接页保持同一套状态 / 来源文案，避免同一状态在两处叫法不同。 */
const accountStatusMeta: Record<string, { label: string; tone: StatusTone }> = {
  connected: { label: '接口已授权', tone: 'success' },
  manual: { label: '手工录入', tone: 'info' },
  paused: { label: '已停用', tone: 'default' },
  error: { label: '授权失效', tone: 'destructive' },
};

const sourceMeta: Record<string, { label: string; tone: StatusTone }> = {
  api: { label: '接口同步', tone: 'success' },
  manual: { label: '手工录入', tone: 'info' },
  csv: { label: 'CSV 导入', tone: 'info' },
  seed: { label: '开发态示例', tone: 'default' },
};

const summaryBlocks = (label: string, value: string, hint: string) => ({ label, value, hint });

const PlatformDetailView = () => {
  const { platform = '' } = useParams<{ platform: string }>();
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [accounts, setAccounts] = useState<PlatformAccountDto[]>([]);
  const [metrics, setMetrics] = useState<MetricEntryDto[]>([]);
  const [loadError, setLoadError] = useState<unknown>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const load = useCallback(() => {
    let cancelled = false;
    setStatus('loading');
    setLoadError(null);

    Promise.all([
      PlatformAccountManager.ListAccounts({ IncludePaused: true }),
      MetricManager.ListRecentMetrics({ AccountId: null, Take: 100 }),
    ])
      .then(([accountResult, metricResult]) => {
        if (cancelled) return;
        setAccounts(accountResult.Items ?? []);
        setMetrics(metricResult.Items ?? []);
        setStatus('ready');
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setLoadError(error);
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => load(), [load, reloadKey]);

  const platformAccounts = useMemo(
    () => filterPlatformAccounts(accounts, platform),
    [accounts, platform],
  );
  const platformMetrics = useMemo(
    () => filterPlatformMetrics(metrics, platformAccounts.map((account) => account.Id)),
    [metrics, platformAccounts],
  );
  const summary = useMemo(
    () => summarizePlatform(platformAccounts, platformMetrics),
    [platformAccounts, platformMetrics],
  );
  const label = getPlatformLabel(platform);
  const reload = () => setReloadKey((key) => key + 1);

  const blocks = [
    summaryBlocks('账号数', `${summary.accountCount}`, `启用中 ${summary.activeCount} · 停用 ${summary.pausedCount} · 异常 ${summary.errorCount}`),
    summaryBlocks('粉丝总量', formatCompactNumber(summary.totalFollowers), '按账号当前粉丝数累加'),
    summaryBlocks('最近录入', summary.lastMetricDate ?? '—', summary.lastMetricDate ? '最近一条日记录日期' : '该平台暂无日记录'),
    summaryBlocks('明细条数', `${summary.metricCount}`, '取自最近 100 条录入记录'),
  ];

  return (
    <PageShell>
      <Panel>
        <PanelHeader
          eyebrow="MediaAI · 平台明细"
          title={`${label} · 平台明细`}
          description="按平台汇总账号状态、粉丝规模与最近录入记录；每条明细都带来源，可回溯到录入人。"
          actions={
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/connections">
                  <ArrowLeft className="size-4" />
                  返回平台连接
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={reload}>
                <RefreshCw className="size-4" />
                刷新
              </Button>
            </div>
          }
        />
        <PanelBody className="space-y-6">
          {status === 'loading' ? (
            <LoadingSkeleton variant="card" layout="grid" count={4} label="正在加载平台明细…" />
          ) : null}

          {status === 'error' ? (
            <ErrorState
              variant="panel"
              error={loadError}
              fallback="平台明细没有加载成功，稍后重试。"
              onRetry={reload}
            />
          ) : null}

          {status === 'ready' && platformAccounts.length === 0 ? (
            <EmptyState
              title={`${label} 暂无账号`}
              description="这个平台还没有登记账号。可以先在平台连接页新增账号，再回来查看明细。"
              action={
                <Button variant="outline" size="sm" asChild>
                  <Link to="/connections">去平台连接页</Link>
                </Button>
              }
            />
          ) : null}

          {status === 'ready' && platformAccounts.length > 0 ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {blocks.map((block) => (
                  <div
                    key={block.label}
                    className="rounded-2xl border border-border/60 bg-background/60 px-5 py-4"
                  >
                    <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                      {block.label}
                    </p>
                    <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">{block.value}</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{block.hint}</p>
                  </div>
                ))}
              </div>

              <section className="space-y-3">
                <SectionHeader
                  eyebrow="账号"
                  title={`${label} 下的账号`}
                  description={`共 ${summary.accountCount} 个账号，含已停用与授权失效的账号。`}
                />
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {platformAccounts.map((account) => {
                    const meta = accountStatusMeta[account.Status] ?? { label: account.Status, tone: 'default' as StatusTone };
                    return (
                      <div
                        key={account.Id}
                        className="rounded-2xl border border-border/60 bg-card px-5 py-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">
                              {account.DisplayName || account.Handle}
                            </p>
                            <p className="mt-0.5 truncate text-xs text-muted-foreground">@{account.Handle}</p>
                          </div>
                          <StatusPill tone={meta.tone}>{meta.label}</StatusPill>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-2 text-xs leading-5">
                          <div>
                            <p className="text-muted-foreground">粉丝数</p>
                            <p className="font-medium tabular-nums text-foreground">
                              {formatCompactNumber(account.FollowerCount)}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">最近记录</p>
                            <p className="font-medium tabular-nums text-foreground">
                              {account.LastMetricDate ?? '—'}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="space-y-3">
                <SectionHeader
                  eyebrow="日指标"
                  title="最近录入明细"
                  description="只展示该平台账号产生的记录，最多取最近 100 条中的匹配项。"
                />
                {platformMetrics.length === 0 ? (
                  <EmptyState compact title="该平台暂无录入明细" description="可在平台连接页用手工录入或 CSV 导入补数据。" />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] text-sm">
                      <thead>
                        <tr className="border-b border-border/60 text-left text-xs text-muted-foreground">
                          <th className="py-2 pr-3 font-medium">日期</th>
                          <th className="py-2 pr-3 font-medium">账号</th>
                          <th className="py-2 pr-3 text-right font-medium">播放</th>
                          <th className="py-2 pr-3 text-right font-medium">点赞</th>
                          <th className="py-2 pr-3 text-right font-medium">评论</th>
                          <th className="py-2 pr-3 text-right font-medium">转发</th>
                          <th className="py-2 pr-3 font-medium">来源</th>
                        </tr>
                      </thead>
                      <tbody>
                        {platformMetrics.map((entry) => {
                          const meta = sourceMeta[entry.Source] ?? { label: entry.Source, tone: 'default' as StatusTone };
                          return (
                            <tr key={entry.Id} className="border-b border-border/40 last:border-0">
                              <td className="py-2.5 pr-3 tabular-nums text-foreground">{entry.StatDate}</td>
                              <td className="py-2.5 pr-3 text-foreground">{entry.AccountName}</td>
                              <td className="py-2.5 pr-3 text-right tabular-nums text-foreground">
                                {formatCompactNumber(entry.Views)}
                              </td>
                              <td className="py-2.5 pr-3 text-right tabular-nums text-foreground">
                                {formatCompactNumber(entry.Likes)}
                              </td>
                              <td className="py-2.5 pr-3 text-right tabular-nums text-foreground">
                                {formatCompactNumber(entry.Comments)}
                              </td>
                              <td className="py-2.5 pr-3 text-right tabular-nums text-foreground">
                                {formatCompactNumber(entry.Shares)}
                              </td>
                              <td className="py-2.5 pr-3">
                                <StatusPill tone={meta.tone}>{meta.label}</StatusPill>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <p className="text-xs leading-6 text-muted-foreground">
                账号授权状态与同步失败重试会在平台 API 自动同步接入后在此展示；当前明细来自账号列表与最近录入记录，不涉及任何平台侧 token。
              </p>
            </>
          ) : null}
        </PanelBody>
      </Panel>
    </PageShell>
  );
};

export default PlatformDetailView;
