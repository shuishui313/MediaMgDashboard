import type { MetricEntryDto, PlatformAccountDto } from '@/api/AppDtos';

export type PlatformDetailSummary = {
  accountCount: number;
  activeCount: number;
  pausedCount: number;
  errorCount: number;
  totalFollowers: number;
  metricCount: number;
  lastMetricDate: string | null;
  sourceCounts: Record<string, number>;
};

/** 仍在正常参与统计的账号状态；paused / error 单独计数，不混进启用中。 */
const ACTIVE_ACCOUNT_STATUSES = ['connected', 'manual'];

export const filterPlatformAccounts = (
  accounts: PlatformAccountDto[] | null | undefined,
  platform: string,
): PlatformAccountDto[] => (accounts ?? []).filter((account) => account.Platform === platform);

export const filterPlatformMetrics = (
  metrics: MetricEntryDto[] | null | undefined,
  accountIds: string[],
): MetricEntryDto[] => {
  const ids = new Set(accountIds);
  return (metrics ?? []).filter((entry) => ids.has(entry.AccountId));
};

/**
 * 平台明细页的汇总口径：账号数按平台过滤，指标只认该平台账号产生的记录。
 * 最近记录日期同时参考账号上的 LastMetricDate 与明细行的 StatDate，取字典序最大的一天。
 */
export const summarizePlatform = (
  accounts: PlatformAccountDto[],
  metrics: MetricEntryDto[],
): PlatformDetailSummary => {
  const dates = [
    ...accounts.map((account) => account.LastMetricDate).filter((value): value is string => Boolean(value)),
    ...metrics.map((entry) => entry.StatDate).filter(Boolean),
  ].sort();

  const sourceCounts: Record<string, number> = {};
  for (const entry of metrics) {
    const key = entry.Source || 'unknown';
    sourceCounts[key] = (sourceCounts[key] ?? 0) + 1;
  }

  return {
    accountCount: accounts.length,
    activeCount: accounts.filter((account) => ACTIVE_ACCOUNT_STATUSES.includes(account.Status)).length,
    pausedCount: accounts.filter((account) => account.Status === 'paused').length,
    errorCount: accounts.filter((account) => account.Status === 'error').length,
    totalFollowers: accounts.reduce(
      (sum, account) => sum + (Number.isFinite(account.FollowerCount) ? account.FollowerCount : 0),
      0,
    ),
    metricCount: metrics.length,
    lastMetricDate: dates.length ? dates[dates.length - 1] : null,
    sourceCounts,
  };
};
