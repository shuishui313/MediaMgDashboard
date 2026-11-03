namespace Contracts.Domain.Database;

/// <summary>
/// 操作审计。每次写操作落一条，记录「谁、什么时候、对哪个对象、改了什么」。
/// 只存字段级前后值，不存密码 / token 等敏感内容（写入端只挑白名单字段）。
/// 保留期见 AuditRecorder.RetentionDays，默认 90 天，过期记录在查询时清理。
/// </summary>
public class AuditLog : BaseEntity
{
    /// <summary>
    /// 发生时间（UTC），展示时统一转本地时区。
    /// </summary>
    public DateTimeOffset At { get; set; } = DateTimeOffset.UtcNow;

    public string ActorAuthId { get; set; } = string.Empty;

    /// <summary>
    /// 操作人邮箱；飞书接入后仍以邮箱为主，便于和 Account / Deal 的 CreatedBy 对上。
    /// </summary>
    public string ActorEmail { get; set; } = string.Empty;

    public string ActorName { get; set; } = string.Empty;

    /// <summary>
    /// 动作标识，取值见 AuditAction；筛选、统计都按这个字段。
    /// </summary>
    public string Action { get; set; } = string.Empty;

    /// <summary>
    /// 动作中文名，写入时固化，避免以后改文案把历史记录读错。
    /// </summary>
    public string ActionLabel { get; set; } = string.Empty;

    /// <summary>
    /// 对象类型标识，取值见 AuditTargetType。
    /// </summary>
    public string TargetType { get; set; } = string.Empty;

    public string TargetId { get; set; } = string.Empty;

    /// <summary>
    /// 对象可读名称，例如「@douyin-main」「青岚科技春季合作」。
    /// </summary>
    public string TargetLabel { get; set; } = string.Empty;

    /// <summary>
    /// 一句话摘要，列表里直接显示，不需要展开 diff。
    /// </summary>
    public string Summary { get; set; } = string.Empty;

    /// <summary>
    /// 字段级变更。新建时通常为空（没有「改前」值），停用 / 推进这类单字段变更为一条。
    /// </summary>
    public List<AuditFieldChange> Changes { get; set; } = new();

    /// <summary>
    /// 变更来源：api（界面操作）/ feishu（审批回调）/ import（批量导入）。
    /// </summary>
    public string Source { get; set; } = AuditSource.Api;

    /// <summary>
    /// 补充信息，例如 CSV 文件名、审批单号。
    /// </summary>
    public string Detail { get; set; } = string.Empty;
}

/// <summary>
/// 单个字段的变更。Before / After 在写入前已转成可读文案（金额带千分位、日期本地化），
/// 查询端不需要再懂业务字段的类型。
/// </summary>
public class AuditFieldChange
{
    public string Field { get; set; } = string.Empty;

    public string Label { get; set; } = string.Empty;

    public string Before { get; set; } = string.Empty;

    public string After { get; set; } = string.Empty;
}

/// <summary>
/// 动作标识与中文名的唯一来源，管理端筛选下拉也从这里取。
/// </summary>
public static class AuditAction
{
    public const string ThresholdUpdate = "threshold.update";
    public const string AccountSave = "account.save";
    public const string AccountDisable = "account.disable";
    public const string MetricIngest = "metric.ingest";
    public const string MetricImport = "metric.import";
    public const string DealSave = "deal.save";
    public const string DealStage = "deal.stage";
    public const string PlanSave = "plan.save";
    public const string PlanStatus = "plan.status";
    public const string TodoCreate = "todo.create";
    public const string TodoComplete = "todo.complete";

    public static readonly string[] All =
    {
        ThresholdUpdate, AccountSave, AccountDisable, MetricIngest, MetricImport,
        DealSave, DealStage, PlanSave, PlanStatus, TodoCreate, TodoComplete
    };

    public static string Label(string action) => action switch
    {
        ThresholdUpdate => "修改判定阈值",
        AccountSave => "新增 / 编辑账号",
        AccountDisable => "停用账号",
        MetricIngest => "录入日指标",
        MetricImport => "CSV 批量导入",
        DealSave => "新增 / 编辑商务单",
        DealStage => "推进商务单阶段",
        PlanSave => "新增 / 编辑内容计划",
        PlanStatus => "推进计划状态",
        TodoCreate => "新建待办",
        TodoComplete => "完成待办",
        _ => action
    };
}

public static class AuditTargetType
{
    public const string Threshold = "signal-threshold";
    public const string Account = "platform-account";
    public const string Metric = "metric";
    public const string Deal = "deal";
    public const string ContentPlan = "content-plan";
    public const string Todo = "todo";

    public static readonly string[] All = { Threshold, Account, Metric, Deal, ContentPlan, Todo };

    public static string Label(string targetType) => targetType switch
    {
        Threshold => "判定阈值",
        Account => "平台账号",
        Metric => "日指标",
        Deal => "商务单",
        ContentPlan => "内容计划",
        Todo => "待办",
        _ => targetType
    };
}

public static class AuditSource
{
    public const string Api = "api";
    public const string Feishu = "feishu";
    public const string Import = "import";
}
