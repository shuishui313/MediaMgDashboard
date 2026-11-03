using System.Globalization;
using App.Api.Accessors;
using App.Api.Utilities;
using App.Api.Utilities.Roles;
using App.ServiceInvoker.Attributes;
using App.ServiceInvoker.Interfaces;
using Contracts.Domain.Database;
using Contracts.Dto;

namespace App.Api.Managers
{
    /// <summary>
    /// 操作审计查询。只读：写入走 <see cref="AuditRecorder"/>，各业务 Manager 在写库成功后调用。
    /// 按权限矩阵只对管理员开放——审计记录里有金额与人员信息，不适合全员可见。
    /// </summary>
    public class AuditManager : IManagerService
    {
        private const int DefaultTake = 50;
        private const int MaxTake = 200;

        private readonly IDatabaseAccessor _databaseAccessor;
        private readonly AuditRecorder _auditRecorder;

        public AuditManager(IDatabaseAccessor databaseAccessor, AuditRecorder auditRecorder)
        {
            _databaseAccessor = databaseAccessor;
            _auditRecorder = auditRecorder;
        }

        [RequireRole(Roles.Admin)]
        public async Task<AuditLogListDto> ListLogs(AuditLogListRequestDto request)
        {
            // 查询顺带清理过期记录：写路径保持轻量，管理端看列表时才有必要全量扫一次。
            var purged = await _auditRecorder.PurgeExpiredAsync();

            var action = request?.Action?.Trim();
            var targetType = request?.TargetType?.Trim();
            var keyword = request?.Keyword?.Trim();
            var take = Math.Clamp(request?.Take ?? DefaultTake, 1, MaxTake);
            var skip = Math.Max(request?.Skip ?? 0, 0);

            var from = ParseDate(request?.FromDate);
            var to = ParseDate(request?.ToDate);

            var logs = (await _databaseAccessor.GetAllDocuments<AuditLog>()).AsEnumerable();

            if (!string.IsNullOrWhiteSpace(action))
            {
                logs = logs.Where(log => string.Equals(log.Action, action, StringComparison.OrdinalIgnoreCase));
            }

            if (!string.IsNullOrWhiteSpace(targetType))
            {
                logs = logs.Where(log => string.Equals(log.TargetType, targetType, StringComparison.OrdinalIgnoreCase));
            }

            if (!string.IsNullOrWhiteSpace(keyword))
            {
                logs = logs.Where(log =>
                    Contains(log.ActorEmail, keyword) ||
                    Contains(log.ActorName, keyword) ||
                    Contains(log.TargetLabel, keyword) ||
                    Contains(log.Summary, keyword));
            }

            // 日期筛选按服务器本地日期比较：库里存 UTC，直接和 DateOnly 比会把 00:00–08:00 的记录算错一天。
            if (from.HasValue)
            {
                logs = logs.Where(log => DateOnly.FromDateTime(log.At.ToLocalTime().DateTime) >= from.Value);
            }

            if (to.HasValue)
            {
                logs = logs.Where(log => DateOnly.FromDateTime(log.At.ToLocalTime().DateTime) <= to.Value);
            }

            var filtered = logs.OrderByDescending(log => log.At).ToList();

            return new AuditLogListDto
            {
                Total = filtered.Count,
                RetentionDays = AuditRecorder.RetentionDays,
                PurgedCount = purged,
                Items = filtered.Skip(skip).Take(take).Select(ToDto).ToList()
            };
        }

        private static AuditLogDto ToDto(AuditLog log)
        {
            var local = log.At.ToLocalTime();
            return new AuditLogDto
            {
                Id = log.Id,
                At = local.ToString("yyyy-MM-dd HH:mm"),
                AtDate = local.ToString("yyyy-MM-dd"),
                ActorEmail = log.ActorEmail,
                ActorName = log.ActorName,
                Action = log.Action,
                ActionLabel = string.IsNullOrWhiteSpace(log.ActionLabel) ? AuditAction.Label(log.Action) : log.ActionLabel,
                TargetType = log.TargetType,
                TargetTypeLabel = AuditTargetType.Label(log.TargetType),
                TargetId = log.TargetId,
                TargetLabel = log.TargetLabel,
                Summary = log.Summary,
                Source = log.Source,
                SourceLabel = SourceLabel(log.Source),
                Detail = log.Detail,
                Changes = (log.Changes ?? new List<AuditFieldChange>()).Select(change => new AuditFieldChangeDto
                {
                    Field = change.Field,
                    Label = change.Label,
                    Before = change.Before,
                    After = change.After
                }).ToList()
            };
        }

        private static string SourceLabel(string source) => source switch
        {
            AuditSource.Feishu => "飞书审批",
            AuditSource.Import => "批量导入",
            AuditSource.Api => "界面操作",
            _ => source
        };

        private static DateOnly? ParseDate(string? value) =>
            DateOnly.TryParseExact((value ?? string.Empty).Trim(), "yyyy-MM-dd", CultureInfo.InvariantCulture,
                DateTimeStyles.None, out var parsed)
                ? parsed
                : null;

        private static bool Contains(string? source, string keyword) =>
            !string.IsNullOrEmpty(source) && source.Contains(keyword, StringComparison.OrdinalIgnoreCase);
    }
}
