namespace Contracts.Dto;

/// <summary>
/// 一条审计记录。Changes 为空表示「新建」或「没有字段级差异」。
/// </summary>
public class AuditLogDto
{
    public Guid Id { get; set; }

    /// <summary>
    /// 本地时间，yyyy-MM-dd HH:mm。
    /// </summary>
    public string At { get; set; } = string.Empty;

    /// <summary>
    /// 本地日期，yyyy-MM-dd，前端按天分组用。
    /// </summary>
    public string AtDate { get; set; } = string.Empty;

    public string ActorEmail { get; set; } = string.Empty;

    public string ActorName { get; set; } = string.Empty;

    public string Action { get; set; } = string.Empty;

    public string ActionLabel { get; set; } = string.Empty;

    public string TargetType { get; set; } = string.Empty;

    public string TargetTypeLabel { get; set; } = string.Empty;

    public string TargetId { get; set; } = string.Empty;

    public string TargetLabel { get; set; } = string.Empty;

    public string Summary { get; set; } = string.Empty;

    public List<AuditFieldChangeDto> Changes { get; set; } = new();

    public string Source { get; set; } = string.Empty;

    public string SourceLabel { get; set; } = string.Empty;

    public string Detail { get; set; } = string.Empty;
}

public class AuditFieldChangeDto
{
    public string Field { get; set; } = string.Empty;

    public string Label { get; set; } = string.Empty;

    public string Before { get; set; } = string.Empty;

    public string After { get; set; } = string.Empty;
}

public class AuditLogListRequestDto
{
    /// <summary>
    /// 动作标识，空表示全部。
    /// </summary>
    public string? Action { get; set; }

    /// <summary>
    /// 对象类型标识，空表示全部。
    /// </summary>
    public string? TargetType { get; set; }

    /// <summary>
    /// 按操作人邮箱或对象名称模糊匹配。
    /// </summary>
    public string? Keyword { get; set; }

    /// <summary>
    /// 起始日期 yyyy-MM-dd（含），空表示不限。
    /// </summary>
    public string? FromDate { get; set; }

    /// <summary>
    /// 结束日期 yyyy-MM-dd（含），空表示不限。
    /// </summary>
    public string? ToDate { get; set; }

    public int Take { get; set; } = 50;

    public int Skip { get; set; }
}

public class AuditLogListDto
{
    public List<AuditLogDto> Items { get; set; } = new();

    /// <summary>
    /// 筛选后的总条数，用于「共 n 条」与翻页。
    /// </summary>
    public int Total { get; set; }

    /// <summary>
    /// 保留天数，界面据此提示「只保留最近 90 天」。
    /// </summary>
    public int RetentionDays { get; set; }

    /// <summary>
    /// 本次查询顺带清理掉的过期条数，正常为 0。
    /// </summary>
    public int PurgedCount { get; set; }
}
