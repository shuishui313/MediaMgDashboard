namespace Contracts.Dto;

/// <summary>
/// 跨角色待办一行。Auto = true 的是由商务单阶段 / 内容计划缺失推导出来的，
/// 没有 Id、不能勾选完成：底层条件修好后它自己会消失。
/// </summary>
public class TodoDto
{
    /// <summary>
    /// 人工待办的主键；Auto = true 时为空 Guid。
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// 稳定标识，Auto 待办用于前端 key（manual 待办也用 Id 生成同一个字段）。
    /// </summary>
    public string Key { get; set; } = string.Empty;

    public bool Auto { get; set; }

    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// 负责角色标识。
    /// </summary>
    public string OwnerRole { get; set; } = string.Empty;

    /// <summary>
    /// 负责角色中文名，例如「财务」。
    /// </summary>
    public string OwnerRoleLabel { get; set; } = string.Empty;

    /// <summary>
    /// 紧急度文案，例如「今日处理」「需补全」。
    /// </summary>
    public string Urgency { get; set; } = string.Empty;

    public string Tone { get; set; } = "default";

    public string Href { get; set; } = "/";

    /// <summary>
    /// 来源标识，人工待办为空；从首页信号生成的形如 signal:decline-&lt;accountId&gt;。
    /// </summary>
    public string SourceKey { get; set; } = string.Empty;

    public string? DueDate { get; set; }

    public string Status { get; set; } = "open";

    public string CreatedBy { get; set; } = string.Empty;

    public string CreatedAt { get; set; } = string.Empty;

    public string? DoneAt { get; set; }

    public string DoneBy { get; set; } = string.Empty;
}

public class TodoListDto
{
    public List<TodoDto> Items { get; set; } = new();

    /// <summary>
    /// 未完成条数（含自动待办），用于首页角标。
    /// </summary>
    public int OpenCount { get; set; }
}

public class TodoListRequestDto
{
    public bool IncludeDone { get; set; }

    public int Take { get; set; }
}

public class CompleteTodoRequestDto
{
    public Guid TodoId { get; set; }
}

public class SaveTodoRequestDto
{
    public string Title { get; set; } = string.Empty;

    public string OwnerRole { get; set; } = string.Empty;

    public string Priority { get; set; } = string.Empty;

    /// <summary>
    /// yyyy-MM-dd，留空表示不设截止日。
    /// </summary>
    public string? DueDate { get; set; }

    public string Href { get; set; } = "/";

    /// <summary>
    /// 来源标识（可选）。传了就按它做幂等：同一条未完成的来源记录不会重复创建。
    /// </summary>
    public string? SourceKey { get; set; }
}
