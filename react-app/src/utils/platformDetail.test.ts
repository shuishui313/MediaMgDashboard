import { describe, expect, it } from 'vitest';
import type { MetricEntryDto, PlatformAccountDto } from '@/api/AppDtos';
import {
  filterPlatformAccounts,
  filterPlatformMetrics,
  summarizePlatform,
} from './platformDetail';

const account = (overrides: Partial<PlatformAccountDto> = {}): PlatformAccountDto => ({
  Id: 'a1',
  Platform: 'douyin',
  Handle: 'shuishui',
  DisplayName: '水水',
  Status: 'manual',
  FollowerCount: 1000,
  OwnerId: '',
  LastMetricDate: '2026-11-06',
  RecentMetricCount: 3,
  CreatedAt: '2026-10-01T00:00:00Z',
  UpdatedAt: '2026-11-06T00:00:00Z',
  ...overrides,
});

const metric = (overrides: Partial<MetricEntryDto> = {}): MetricEntryDto => ({
  Id: 'm1',
  AccountId: 'a1',
  Platform: 'douyin',
  AccountName: '水水',
  StatDate: '2026-11-06',
  Views: 12000,
  Likes: 300,
  Comments: 20,
  Shares: 10,
  NewFollowers: 50,
  Source: 'manual',
  RecordedBy: 'demo@mediaai.local',
  RecordedAt: '2026-11-06T08:00:00Z',
  ...overrides,
});

describe('filterPlatformAccounts', () => {
  it('只保留目标平台，空输入返回空数组', () => {
    const accounts = [account(), account({ Id: 'a2', Platform: 'weibo' })];
    expect(filterPlatformAccounts(accounts, 'douyin').map((item) => item.Id)).toEqual(['a1']);
    expect(filterPlatformAccounts(null, 'douyin')).toEqual([]);
  });
});

describe('filterPlatformMetrics', () => {
  it('按账号 ID 过滤，不误收其它平台的记录', () => {
    const entries = [metric(), metric({ Id: 'm2', AccountId: 'a2', Platform: 'weibo' })];
    expect(filterPlatformMetrics(entries, ['a1']).map((item) => item.Id)).toEqual(['m1']);
    expect(filterPlatformMetrics(undefined, ['a1'])).toEqual([]);
  });
});

describe('summarizePlatform', () => {
  it('汇总账号状态、粉丝数、最近日期与来源分布', () => {
    const accounts = [
      account(),
      account({ Id: 'a2', Status: 'paused', FollowerCount: 2000, LastMetricDate: '2026-11-05' }),
      account({ Id: 'a3', Status: 'error', FollowerCount: 0, LastMetricDate: null }),
    ];
    const entries = [
      metric(),
      metric({ Id: 'm2', StatDate: '2026-11-07', Source: 'csv' }),
      metric({ Id: 'm3', Source: 'csv' }),
    ];
    const summary = summarizePlatform(accounts, entries);

    expect(summary.accountCount).toBe(3);
    expect(summary.activeCount).toBe(1);
    expect(summary.pausedCount).toBe(1);
    expect(summary.errorCount).toBe(1);
    expect(summary.totalFollowers).toBe(3000);
    expect(summary.metricCount).toBe(3);
    expect(summary.lastMetricDate).toBe('2026-11-07');
    expect(summary.sourceCounts).toEqual({ manual: 1, csv: 2 });
  });

  it('没有任何数据时不产生假数值', () => {
    expect(summarizePlatform([], [])).toEqual({
      accountCount: 0,
      activeCount: 0,
      pausedCount: 0,
      errorCount: 0,
      totalFollowers: 0,
      metricCount: 0,
      lastMetricDate: null,
      sourceCounts: {},
    });
  });

  it('非法粉丝数按 0 处理，不污染合计', () => {
    const summary = summarizePlatform([account({ FollowerCount: Number.NaN })], []);
    expect(summary.totalFollowers).toBe(0);
    expect(summary.lastMetricDate).toBe('2026-11-06');
  });
});
