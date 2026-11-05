import { cn } from '@/lib/utils';

export type SkeletonVariant = 'card' | 'row' | 'text';

type LoadingSkeletonProps = {
  count?: number;
  variant?: SkeletonVariant;
  /** grid 用于多列卡片，stack 用于列表与表格。 */
  layout?: 'stack' | 'grid';
  label?: string;
  className?: string;
};

const variantClasses: Record<SkeletonVariant, string> = {
  card: 'h-44 rounded-3xl',
  row: 'h-16 rounded-2xl',
  text: 'h-5 rounded-lg',
};

/**
 * 异步区域统一的加载骨架。带 aria-busy 与可读文案，读屏软件不会把它当成已完成的空内容。
 */
const LoadingSkeleton = ({
  count = 3,
  variant = 'row',
  layout = 'stack',
  label = '正在加载数据…',
  className,
}: LoadingSkeletonProps) => (
  <div
    role="status"
    aria-busy="true"
    aria-label={label}
    className={cn(
      layout === 'grid' ? 'grid gap-4 md:grid-cols-2 xl:grid-cols-3' : 'space-y-2',
      className,
    )}
  >
    {Array.from({ length: count }).map((_, index) => (
      <div
        key={index}
        className={cn('animate-pulse border border-border/60 bg-muted/40', variantClasses[variant])}
      />
    ))}
    <span className="sr-only">{label}</span>
  </div>
);

export default LoadingSkeleton;
