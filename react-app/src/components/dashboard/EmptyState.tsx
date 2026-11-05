import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type EmptyStateProps = {
  title?: string;
  description?: ReactNode;
  action?: ReactNode;
  /** compact 用于表格单元格等狭窄区域，去掉虚线外框与大面积留白。 */
  compact?: boolean;
  className?: string;
};

/**
 * 异步区域统一的空数据态。compact 版本供表格 colSpan 单元格复用。
 */
const EmptyState = ({
  title = '暂无数据',
  description,
  action,
  compact = false,
  className,
}: EmptyStateProps) => (
  <div
    role="status"
    className={cn(
      compact
        ? 'px-2 py-6 text-center'
        : 'rounded-3xl border border-dashed border-border/70 bg-background/60 px-6 py-10 text-center',
      className,
    )}
  >
    <p className="text-sm font-medium text-foreground">{title}</p>
    {description ? (
      <div className="mt-2 text-sm leading-6 text-muted-foreground">{description}</div>
    ) : null}
    {action ? <div className="mt-4 flex flex-wrap justify-center gap-2">{action}</div> : null}
  </div>
);

export default EmptyState;
