import { useState } from 'react';
import EmptyState from '@/components/dashboard/EmptyState';
import { formatCompactNumber } from '@/lib/format';
import { cn } from '@/lib/utils';
import { describeTrendPoint } from '@/utils/dashboardRange';

export type TrendPoint = {
  label: string;
  views: number;
  comments: number;
  shares: number;
};

const series = [
  { key: 'views', label: '浏览量', lineClassName: 'text-chart-1', dotClassName: 'bg-chart-1' },
  { key: 'comments', label: '评论量', lineClassName: 'text-info', dotClassName: 'bg-info' },
  { key: 'shares', label: '转发量', lineClassName: 'text-destructive', dotClassName: 'bg-destructive' },
] as const;

const VIEW_WIDTH = 100;
const VIEW_HEIGHT = 46;
const PADDING_X = 3;
const PADDING_Y = 5;

const buildCoordinates = (values: number[]) => {
  const max = Math.max(...values, 1);
  const step = values.length > 1 ? (VIEW_WIDTH - PADDING_X * 2) / (values.length - 1) : 0;

  return values.map((value, index) => ({
    x: PADDING_X + index * step,
    y: VIEW_HEIGHT - PADDING_Y - (value / max) * (VIEW_HEIGHT - PADDING_Y * 2),
  }));
};

const toPolyline = (points: { x: number; y: number }[]) =>
  points.map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(' ');

/**
 * 平台走势图：三条指标线各自按自身峰值归一化，用来比较走势形状而不是绝对值。
 * 绝对值由下方指标卡、hover / 键盘聚焦时的数值条与数据点 title 提供，避免被不同量级压平。
 */
const TrendChart = ({ points, platform, className }: { points: TrendPoint[]; platform: string; className?: string }) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (points.length === 0) {
    return (
      <EmptyState
        compact
        title="暂无更新数据"
        className={cn(
          'flex h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-background/60',
          className,
        )}
      />
    );
  }

  const viewsCoordinates = buildCoordinates(points.map((point) => point.views));
  const areaPath = [
    `M ${viewsCoordinates[0].x.toFixed(2)} ${(VIEW_HEIGHT - PADDING_Y).toFixed(2)}`,
    ...viewsCoordinates.map((point) => `L ${point.x.toFixed(2)} ${point.y.toFixed(2)}`),
    `L ${viewsCoordinates[viewsCoordinates.length - 1].x.toFixed(2)} ${(VIEW_HEIGHT - PADDING_Y).toFixed(2)}`,
    'Z',
  ].join(' ');

  const hitWidth =
    points.length > 1 ? (VIEW_WIDTH - PADDING_X * 2) / (points.length - 1) : VIEW_WIDTH - PADDING_X * 2;
  const activeIndex = hoverIndex ?? points.length - 1;
  const activePoint: TrendPoint = points[activeIndex] ?? { label: '—', views: 0, comments: 0, shares: 0 };

  return (
    <div className={cn('space-y-3', className)}>
      <svg
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        preserveAspectRatio="none"
        className="h-36 w-full"
        role="img"
        aria-label={`${platform} 最近 ${points.length} 条更新的浏览、评论、转发走势；悬停或用 Tab 聚焦数据点可读取每日数值`}
        onMouseLeave={() => setHoverIndex(null)}
      >
        <title>{`${platform} 最近 ${points.length} 条更新走势`}</title>
        {[0.25, 0.5, 0.75].map((ratio) => (
          <line
            key={ratio}
            x1={PADDING_X}
            x2={VIEW_WIDTH - PADDING_X}
            y1={VIEW_HEIGHT * ratio}
            y2={VIEW_HEIGHT * ratio}
            stroke="var(--border)"
            strokeWidth={0.5}
            vectorEffect="non-scaling-stroke"
          />
        ))}

        <path d={areaPath} fill="var(--chart-1)" opacity={0.07} />

        {series.map((item) => {
          const coordinates = buildCoordinates(points.map((point) => point[item.key]));
          return (
            <g key={item.key} className={item.lineClassName}>
              <polyline
                fill="none"
                stroke="currentColor"
                strokeWidth={1.6}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                points={toPolyline(coordinates)}
              />
              {coordinates.map((coordinate, index) => (
                <circle
                  key={`${item.key}-${points[index].label}`}
                  cx={coordinate.x}
                  cy={coordinate.y}
                  r={index === activeIndex ? 2.2 : 1.4}
                  fill="currentColor"
                  stroke="var(--card)"
                  strokeWidth={0.6}
                  vectorEffect="non-scaling-stroke"
                >
                  <title>{`${points[index].label} · ${item.label} ${formatCompactNumber(points[index][item.key])}`}</title>
                </circle>
              ))}
            </g>
          );
        })}
        {points.map((point, index) => (
          <rect
            key={`hit-${point.label}-${index}`}
            x={Math.max(0, (viewsCoordinates[index]?.x ?? PADDING_X) - hitWidth / 2).toFixed(2)}
            y={0}
            width={hitWidth.toFixed(2)}
            height={VIEW_HEIGHT}
            fill="transparent"
            pointerEvents="all"
            tabIndex={0}
            aria-label={describeTrendPoint(point)}
            onMouseEnter={() => setHoverIndex(index)}
            onFocus={() => setHoverIndex(index)}
          />
        ))}
      </svg>

      <div
        className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/60 bg-muted/30 px-3 py-2 text-xs"
        aria-live="polite"
      >
        <span className="font-medium tabular-nums text-foreground">{activePoint.label}</span>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {series.map((item) => (
            <span key={item.key} className="inline-flex items-center gap-1.5 text-muted-foreground">
              <span className={cn('h-1.5 w-1.5 rounded-full', item.dotClassName)} />
              {item.label}
              <span className="font-medium tabular-nums text-foreground">
                {formatCompactNumber(activePoint[item.key])}
              </span>
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] tabular-nums text-muted-foreground">
        {points.map((point, index) => (
          <span key={point.label} className={cn(index === activeIndex && 'font-medium text-foreground')}>
            {point.label}
          </span>
        ))}
      </div>
    </div>
  );
};

export const TrendLegend = ({ className, note }: { className?: string; note?: string }) => (
  <div className={cn('flex flex-col items-start gap-1.5', className)}>
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-muted-foreground">
      {series.map((item) => (
        <span key={item.key} className="inline-flex items-center gap-2">
          <span className={cn('h-2 w-2 rounded-full', item.dotClassName)} />
          {item.label}
        </span>
      ))}
    </div>
    {note ? <p className="text-[11px] leading-4 text-muted-foreground">{note}</p> : null}
  </div>
);

export default TrendChart;
