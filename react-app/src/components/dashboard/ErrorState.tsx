import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { resolveErrorText } from '@/utils/errors';
import { cn } from '@/lib/utils';

type ErrorStateProps = {
  error?: unknown;
  /** 已经拿到展示文案时直接传入，优先于 error 解析结果。 */
  message?: string;
  fallback?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  /** banner 用于区块内横幅，panel 用于整块内容加载失败。 */
  variant?: 'banner' | 'panel';
  title?: string;
  className?: string;
};

/**
 * 异步区域统一的错误态。网络层与后端的中文原因经 resolveErrorText 原样透传，
 * 只有 fetch 自身的失败才回落到页面给的兜底文案。
 */
const ErrorState = ({
  error,
  message,
  fallback = '数据没有加载成功，稍后重试。',
  onRetry,
  onDismiss,
  variant = 'banner',
  title = '加载失败',
  className,
}: ErrorStateProps) => {
  const text = message ?? resolveErrorText(error, fallback);

  if (variant === 'panel') {
    return (
      <div
        role="alert"
        className={cn(
          'rounded-3xl border border-destructive/30 bg-destructive/5 px-6 py-10 text-center',
          className,
        )}
      >
        <p className="text-sm font-medium text-destructive">{title}</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
        {onRetry || onDismiss ? (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {onRetry ? (
              <Button variant="outline" size="sm" onClick={onRetry}>
                <RefreshCw className="size-4" />
                重试
              </Button>
            ) : null}
            {onDismiss ? (
              <Button variant="ghost" size="sm" onClick={onDismiss}>
                关闭
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div
      role="alert"
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm leading-6 text-destructive',
        className,
      )}
    >
      <span className="min-w-0 flex-1">{text}</span>
      <span className="flex shrink-0 items-center gap-1">
        {onRetry ? (
          <Button variant="ghost" size="xs" onClick={onRetry}>
            <RefreshCw className="size-3" />
            重试
          </Button>
        ) : null}
        {onDismiss ? (
          <Button variant="ghost" size="xs" onClick={onDismiss}>
            关闭
          </Button>
        ) : null}
      </span>
    </div>
  );
};

export default ErrorState;
