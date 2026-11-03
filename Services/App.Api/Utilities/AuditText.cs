using Contracts.Domain.Database;

namespace App.Api.Utilities
{
    /// <summary>
    /// 审计记录里的值格式化。统一在这里做，保证同一字段在 diff 里长得一样
    /// （金额带千分位、空值写「未填写」而不是空白，避免前端把空串渲染成「-」时看不出差异）。
    /// </summary>
    public static class AuditText
    {
        public static string Text(string? value) => string.IsNullOrWhiteSpace(value) ? "未填写" : value.Trim();

        public static string Number(long value) => value.ToString("N0");

        public static string Money(decimal amount, string? currency = null)
        {
            if (amount <= 0) return "未报价";
            var unit = string.IsNullOrWhiteSpace(currency) ? "CNY" : currency.Trim();
            return $"{unit} {amount:N0}";
        }

        public static string Date(DateOnly? value) => value?.ToString("yyyy-MM-dd") ?? "未设置";

        public static string Decimal(double? value, string suffix = "") =>
            value.HasValue ? $"{value.Value:0.##}{suffix}" : "未评分";

        public static string Score(double? value) => value.HasValue ? $"{value.Value:0.#} / 10" : "未评分";

        public static string Platforms(IEnumerable<string>? platforms)
        {
            var list = (platforms ?? Enumerable.Empty<string>()).Where(item => !string.IsNullOrWhiteSpace(item)).ToList();
            return list.Count == 0 ? "未指定平台" : string.Join("、", list);
        }

        public static string AccountStatus(string? status) => status switch
        {
            "connected" => "已授权",
            "manual" => "手工录入",
            "paused" => "已停用",
            "error" => "同步异常",
            _ => string.IsNullOrWhiteSpace(status) ? "未知" : status
        };

        public static string Boolean(bool value) => value ? "是" : "否";

        public static AuditFieldChange NewChange(string field, string label, string before, string after) => new()
        {
            Field = field,
            Label = label,
            Before = before,
            After = after
        };
    }
}
