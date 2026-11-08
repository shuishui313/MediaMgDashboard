import { describe, expect, it } from 'vitest';
import type { TrendPoint } from '@/components/dashboard/TrendChart';
import {
  RANGE_OPTIONS,
  describeTrendPoint,
  buildPlatformOptions,
  filterTrendsByPlatform,
  sampleTrendPoints,
  toDays,
} from './dashboardRange';

const points = (count: number): TrendPoint[] =>
  Array.from({ length: count }, (_, index) => ({
    label: `11-${String(index + 1).padStart(2, '0')}`,
    views: (index + 1) * 100,
    comments: index + 1,
    shares: index,
  }));

describe('RANGE_OPTIONS / toDays', () => {
  it('只有 7 / 14 / 30 三档，且都能转成后端需要的数字', () => {
    expect(RANGE_OPTIONS.map((item) => item.value)).toEqual(['7', '14', '30']);
    expect(RANGE_OPTIONS.map((item) => toDays(item.value))).toEqual([7, 14, 30]);
  });
});

describe('sampleTrendPoints', () => {
  it('不超过上限时原样返回，不改动引用', () => {
    const input = points(7);
    expect(sampleTrendPoints(input, 10)).toBe(input);
    expect(sampleTrendPoints([], 10)).toEqual([]);
  });

  it('30 天采样到 10 个点，首尾保留且不重复', () => {
    const input = points(30);
    const sampled = sampleTrendPoints(input, 10);

    expect(sampled).toHaveLength(10);
    expect(sampled[0]).toBe(input[0]);
    expect(sampled[sampled.length - 1]).toBe(input[29]);
    expect(new Set(sampled.map((item) => item.label)).size).toBe(10);
    expect(sampled.every((item) => input.includes(item))).toBe(true);
  });

  it('上限为 1 时只留第一个点', () => {
    expect(sampleTrendPoints(points(30), 1)).toHaveLength(1);
  });
});

describe('buildPlatformOptions', () => {
  it('第一项是全部平台，后面按数据里的平台顺序展开', () => {
    expect(
      buildPlatformOptions([
        { platformKey: 'douyin', platformLabel: '抖音' },
        { platformKey: 'weibo', platformLabel: '微博' },
      ]),
    ).toEqual([
      { value: 'all', label: '全部平台' },
      { value: 'douyin', label: '抖音' },
      { value: 'weibo', label: '微博' },
    ]);
  });

  it('没有平台时仍给出全部平台选项', () => {
    expect(buildPlatformOptions([])).toEqual([{ value: 'all', label: '全部平台' }]);
  });
});

describe('filterTrendsByPlatform', () => {
  const trends = [
    { platformKey: 'douyin', platformLabel: '抖音' },
    { platformKey: 'weibo', platformLabel: '微博' },
  ];

  it('all 不过滤，指定平台只保留该平台', () => {
    expect(filterTrendsByPlatform(trends, 'all')).toBe(trends);
    expect(filterTrendsByPlatform(trends, 'weibo')).toEqual([trends[1]]);
  });

  it('未知平台返回空数组，由页面显示空态', () => {
    expect(filterTrendsByPlatform(trends, 'unknown')).toEqual([]);
  });
});

describe('describeTrendPoint', () => {
  it('把三项数值按统一缩写拼成一句话', () => {
    expect(describeTrendPoint({ label: '11-08', views: 12000, comments: 300, shares: 0 })).toBe(
      '11-08 · 浏览 1.2万 · 评论 300 · 转发 0',
    );
  });

  it('非法数值显示为 -，不抛错', () => {
    expect(describeTrendPoint({ label: '11-09', views: Number.NaN, comments: 0, shares: 0 })).toBe(
      '11-09 · 浏览 - · 评论 0 · 转发 0',
    );
  });
});
