import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, RefreshCw } from 'lucide-react';
import EmptyState from '@/components/dashboard/EmptyState';
import ErrorState from '@/components/dashboard/ErrorState';
import LoadingSkeleton from '@/components/dashboard/LoadingSkeleton';
import { Panel, PanelBody, PanelHeader } from '@/components/dashboard/Panel';
import StatusPill, { type StatusTone } from '@/components/dashboard/StatusPill';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import AuditManager from '@/api/AuditManager';
import type { AuditLogDto } from '@/api/AppDtos';
import { resolveErrorText } from '@/utils/errors';
import { AUDIT_ACTION_OPTIONS, AUDIT_ALL, AUDIT_TARGET_OPTIONS, auditActionTone } from '@/utils/audit';

const PAGE_SIZE = 50;

type LoadStatus = 'loading' | 'ready' | 'error';

/**
 * 操作审计面板。挂在 /settings 里，只有管理员能进这个路由，接口本身也挂了 [RequireRole(admin)]。
 * 变更明细默认收起：列表先给「谁改了什么」，需要追细节时再展开字段级 diff。
 */
const AuditLogPanel = () => {
  const [action, setAction] = useState<string>(AUDIT_ALL);
  const [targetType, setTargetType] = useState<string>(AUDIT_ALL);
  const [keywordInput, setKeywordInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [items, setItems] = useState<AuditLogDto[]>([]);
  const [total, setTotal] = useState(0);
  const [retentionDays, setRetentionDays] = useState(90);
  const [purgedCount, setPurgedCount] = useState(0);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [reloadKey, setReloadKey] = useState(0);

  // 输入停顿 300ms 再查，避免每敲一个字打一次接口。
  useEffect(() => {
    const timer = window.setTimeout(() => setKeyword(keywordInput.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [keywordInput]);

  const buildRequest = useCallback(
    (skip: number) => ({
      Action: action === AUDIT_ALL ? undefined : action,
      TargetType: targetType === AUDIT_ALL ? undefined : targetType,
      Keyword: keyword.length > 0 ? keyword : undefined,
      FromDate: fromDate || undefined,
      ToDate: toDate || undefined,
      Take: PAGE_SIZE,
      Skip: skip,
    }),
    [action, targetType, keyword, fromDate, toDate],
  );

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setError(null);

    AuditManager.ListLogs(buildRequest(0))
      .then((data) => {
        if (cancelled) return;
        setItems(data.Items ?? []);
        setTotal(data.Total ?? 0);
        setRetentionDays(data.RetentionDays ?? 90);
        setPurgedCount(data.PurgedCount ?? 0);
        setStatus('ready');
      })
      .catch((cause) => {
        if (cancelled) return;
        setError(resolveErrorText(cause, '审计记录没有加载成功，稍后重试或检查后端接口。'));
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [buildRequest, reloadKey]);

  const loadMore = () => {
    setLoadingMore(true);
    AuditManager.ListLogs(buildRequest(items.length))
      .then((data) => {
        setItems((current) => [...current, ...(data.Items ?? [])]);
        setTotal(data.Total ?? 0);
      })
      .catch((cause) => setError(resolveErrorText(cause, '加载更多失败，请重试。')))
      .finally(() => setLoadingMore(false));
  };

  const grouped = useMemo(() => {
    const map = new Map<string, AuditLogDto[]>();
    for (const item of items) {
      const key = item.AtDate || item.At.slice(0, 10);
      const list = map.get(key);
      if (list) list.push(item);
      else map.set(key, [item]);
    }
    return Array.from(map.entries());
  }, [items]);

  const toggle = (id: string) =>
    setExpanded((current) => ({ ...current, [id]: !current[id] }));

  const hasFilter =
    action !== AUDIT_ALL || targetType !== AUDIT_ALL || keyword.length > 0 || fromDate.length > 0 || toDate.length > 0;

  return (
    <Panel>
      <PanelHeader
        eyebrow="操作审计"
        title="最近写操作"
        description={`记录阈值、账号、指标、商务单、内容计划与待办的每次写操作，只保留最近 ${retentionDays} 天。`}
        actions={
          <Button variant="ghost" size="sm" onClick={() => setReloadKey((value) => value + 1)}>
            <RefreshCw className="size-4" />
            刷新
          </Button>
        }
      />
      <PanelBody className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="audit-action">动作</Label>
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger id="audit-action">
                <SelectValue placeholder="全部动作" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={AUDIT_ALL}>全部动作</SelectItem>
                {AUDIT_ACTION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="audit-target">对象类型</Label>
            <Select value={targetType} onValueChange={setTargetType}>
              <SelectTrigger id="audit-target">
                <SelectValue placeholder="全部对象" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={AUDIT_ALL}>全部对象</SelectItem>
                {AUDIT_TARGET_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="audit-from">起始日期</Label>
            <Input id="audit-from" type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="audit-to">结束日期</Label>
            <Input id="audit-to" type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Input
            value={keywordInput}
            onChange={(event) => setKeywordInput(event.target.value)}
            placeholder="搜操作人 / 对象名称 / 摘要"
            className="h-9 sm:max-w-xs"
          />
          <p className="text-[11px] leading-5 text-muted-foreground">
            {status === 'ready' ? `命中 ${total} 条，已加载 ${items.length} 条。` : '　'}
            {purgedCount > 0 ? ` 本次清理了 ${purgedCount} 条超过 ${retentionDays} 天的记录。` : ''}
          </p>
        </div>

        {error ? (
          <ErrorState
            message={error}
            onRetry={() => setReloadKey((value) => value + 1)}
            onDismiss={() => setError(null)}
          />
        ) : null}

        {status === 'loading' ? (
          <LoadingSkeleton count={4} variant="row" label="正在加载审计记录…" />
        ) : null}

        {status === 'ready' && items.length === 0 ? (
          <EmptyState
            compact
            title={hasFilter ? '没有符合筛选条件的写操作。' : '还没有任何写操作记录。'}
            description={
              hasFilter
                ? '换个筛选条件再看看。'
                : '改一次阈值、建一个账号或推进一次阶段就会出现在这里。'
            }
          />
        ) : null}

        {items.length > 0 ? (
          <div className="space-y-5">
            {grouped.map(([date, logs]) => (
              <div key={date} className="space-y-2">
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">{date}</p>
                <ul className="space-y-2">
                  {logs.map((log) => {
                    const open = expanded[log.Id] === true;
                    const hasChanges = (log.Changes ?? []).length > 0;

                    return (
                      <li key={log.Id} className="rounded-2xl border border-border/60 bg-background/60">
                        <div className="flex flex-wrap items-start gap-3 px-5 py-4">
                          <span className="w-12 shrink-0 pt-0.5 text-xs tabular-nums text-muted-foreground">
                            {log.At.slice(11)}
                          </span>
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <StatusPill tone={auditActionTone(log.Action) as StatusTone}>{log.ActionLabel}</StatusPill>
                              <span className="text-sm font-medium">
                                {log.TargetLabel || log.TargetTypeLabel}
                              </span>
                              {log.SourceLabel ? <StatusPill tone="default">{log.SourceLabel}</StatusPill> : null}
                            </div>
                            <p className="text-sm leading-6 break-words text-muted-foreground">{log.Summary}</p>
                            <p className="text-[11px] leading-5 text-muted-foreground/80">
                              {log.ActorEmail || log.ActorName || '未知操作人'}
                              {log.Detail ? ` · ${log.Detail}` : ''}
                            </p>
                          </div>
                          {hasChanges ? (
                            <button
                              type="button"
                              onClick={() => toggle(log.Id)}
                              className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border/60 px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-muted"
                            >
                              {open ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
                              {open ? '收起' : `变更 ${log.Changes.length} 项`}
                            </button>
                          ) : null}
                        </div>

                        {open && hasChanges ? (
                          <dl className="space-y-1 border-t border-border/60 px-5 py-3">
                            {log.Changes.map((change) => (
                              <div key={`${log.Id}-${change.Field}`} className="flex flex-wrap items-baseline gap-2 text-xs leading-6">
                                <dt className="w-20 shrink-0 text-muted-foreground">{change.Label}</dt>
                                <dd className="flex flex-wrap items-baseline gap-2">
                                  <span className="text-muted-foreground line-through decoration-border">{change.Before}</span>
                                  <span className="text-muted-foreground">→</span>
                                  <span className="font-medium">{change.After}</span>
                                </dd>
                              </div>
                            ))}
                          </dl>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        ) : null}

        {status === 'ready' && items.length < total ? (
          <div className="flex justify-center pt-1">
            <Button variant="outline" size="sm" disabled={loadingMore} onClick={loadMore}>
              {loadingMore ? '加载中…' : `加载更多（还有 ${total - items.length} 条）`}
            </Button>
          </div>
        ) : null}
      </PanelBody>
    </Panel>
  );
};

export default AuditLogPanel;
