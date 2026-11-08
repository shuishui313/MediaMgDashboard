import type { SegmentedOption } from '@/components/dashboard/SegmentedTabs';

/** 首页平台态势的时间范围；后端 GetSummary 会把 Days 钳制在 3–90。 */
export const RANGE_OPTIONS = [
  { value: '7', label: '7 天' },
  { value: '14', label: '14 天' },
  { value: '30', label: '30 天' },
] as const;

export type RangeDays = (typeof RANGE_OPTIONS)[number]['value'];

export const toDays = (value: RangeDays): number => Number(value);

/**
 * 走势图每天一个点，30 天全铺会把 x 轴标签挤在一起。
 * 等间隔采样到最多 maxPoints 个，首尾点都保留，标签沿用采样点的日期。
 * 不做平均或求和，采样后的每个点仍是真实某一天的数值。
 */
export const sampleTrendPoints = <T>(points: T[], maxPoints = 10): T[] => {
  if (points.length <= maxPoints) return points;
  if (maxPoints < 2) return points.slice(0, 1);

  const lastIndex = points.length - 1;
  const seen = new Set<number>();
  const picked: number[] = [];
  for (let i = 0; i < maxPoints; i += 1) {
    const index = Math.round((i * lastIndex) / (maxPoints - 1));
    if (!seen.has(index)) {
      seen.add(index);
      picked.push(index);
    }
  }
  return picked.map((index) => points[index]);
};

export type PlatformOption = SegmentedOption<string>;

export const buildPlatformOptions = (
  trends: { platformKey: string; platformLabel: string }[],
): PlatformOption[] => [
  { value: 'all', label: '全部平台' },
  ...trends.map((item) => ({ value: item.platformKey, label: item.platformLabel })),
];

/** 平台筛选只在展示层做，不改后端聚合口径；'all' 表示不过滤。 */
export const filterTrendsByPlatform = <T extends { platformKey: string }>(
  trends: T[],
  platform: string,
): T[] => (platform === 'all' ? trends : trends.filter((item) => item.platformKey === platform));
