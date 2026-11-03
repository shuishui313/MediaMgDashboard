/**
 * 审计筛选项与文案的前端镜像。
 * 标识与后端 AuditAction / AuditTargetType 一致（Contracts.Domain/Database/AuditLog.cs），
 * 中文名以服务端下发的 ActionLabel / TargetTypeLabel 为准，这里的 label 只用于筛选下拉。
 */

export type AuditOption = { value: string; label: string };

export const AUDIT_ACTION_OPTIONS: AuditOption[] = [
  { value: 'threshold.update', label: '修改判定阈值' },
  { value: 'account.save', label: '新增 / 编辑账号' },
  { value: 'account.disable', label: '停用账号' },
  { value: 'metric.ingest', label: '录入日指标' },
  { value: 'metric.import', label: 'CSV 批量导入' },
  { value: 'deal.save', label: '新增 / 编辑商务单' },
  { value: 'deal.stage', label: '推进商务单阶段' },
  { value: 'plan.save', label: '新增 / 编辑内容计划' },
  { value: 'plan.status', label: '推进计划状态' },
  { value: 'todo.create', label: '新建待办' },
  { value: 'todo.complete', label: '完成待办' },
];

export const AUDIT_TARGET_OPTIONS: AuditOption[] = [
  { value: 'signal-threshold', label: '判定阈值' },
  { value: 'platform-account', label: '平台账号' },
  { value: 'metric', label: '日指标' },
  { value: 'deal', label: '商务单' },
  { value: 'content-plan', label: '内容计划' },
  { value: 'todo', label: '待办' },
];

/** 筛选下拉的「全部」选项值；为空表示不传该筛选项。 */
export const AUDIT_ALL = 'all';

/** 动作 → 色板：写配置与删停用偏警示，纯新增/推进用中性色。 */
export const auditActionTone = (action: string): 'default' | 'info' | 'warning' | 'destructive' | 'success' => {
  switch (action) {
    case 'threshold.update':
      return 'warning';
    case 'account.disable':
      return 'destructive';
    case 'metric.import':
      return 'info';
    case 'deal.stage':
    case 'plan.status':
    case 'todo.complete':
      return 'success';
    default:
      return 'default';
  }
};
