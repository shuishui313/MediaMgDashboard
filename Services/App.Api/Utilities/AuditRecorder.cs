using App.Api.Accessors;
using Contracts.Domain.Database;
using Serilog;

namespace App.Api.Utilities
{
    /// <summary>
    /// 写审计记录的唯一入口。业务方法在成功写库后调用，失败不写（避免把被拒绝的操作记成已发生）。
    ///
    /// 两条约定：
    /// 1. 审计写失败不能拖垮业务——这里吞掉异常只记日志；否则数据已提交、接口却 500，会诱导用户重试重复写入。
    /// 2. 只记录白名单字段的前后值，密码 / token / 完整请求体一律不落库。
    /// </summary>
    public class AuditRecorder
    {
        /// <summary>
        /// 保留天数。过期记录在管理端查询时顺带清理（写路径不做清理，避免每次写都全量扫表）。
        /// </summary>
        public const int RetentionDays = 90;

        private readonly IDatabaseAccessor _databaseAccessor;
        private readonly UserContextService _userContextService;

        public AuditRecorder(IDatabaseAccessor databaseAccessor, UserContextService userContextService)
        {
            _databaseAccessor = databaseAccessor;
            _userContextService = userContextService;
        }

        public Task RecordAsync(
            string action,
            string targetType,
            Guid? targetId,
            string targetLabel,
            string summary,
            IEnumerable<AuditFieldChange>? changes = null,
            string source = AuditSource.Api,
            string detail = "")
        {
            var entry = new AuditLog
            {
                At = DateTimeOffset.UtcNow,
                ActorAuthId = _userContextService.UserId ?? string.Empty,
                ActorEmail = _userContextService.UserEmail ?? string.Empty,
                ActorName = _userContextService.UserName ?? string.Empty,
                Action = action,
                ActionLabel = AuditAction.Label(action),
                TargetType = targetType,
                TargetId = targetId?.ToString() ?? string.Empty,
                TargetLabel = targetLabel ?? string.Empty,
                Summary = summary ?? string.Empty,
                Changes = (changes ?? Enumerable.Empty<AuditFieldChange>())
                    .Where(change => change.Before != change.After)
                    .ToList(),
                Source = source,
                Detail = detail ?? string.Empty
            };

            return WriteAsync(entry);
        }

        /// <summary>
        /// 清理超过保留期的记录，返回删除条数。由 AuditManager.ListLogs 调用。
        /// </summary>
        public async Task<int> PurgeExpiredAsync()
        {
            try
            {
                var threshold = DateTimeOffset.UtcNow.AddDays(-RetentionDays);
                var expired = (await _databaseAccessor.GetAllDocuments<AuditLog>())
                    .Where(entry => entry.At < threshold)
                    .ToList();

                foreach (var entry in expired)
                {
                    await _databaseAccessor.DeleteDocument(entry);
                }

                if (expired.Count > 0)
                {
                    Log.Information("Purged {Count} audit logs older than {Days} days.", expired.Count, RetentionDays);
                }

                return expired.Count;
            }
            catch (Exception ex)
            {
                Log.Warning(ex, "Failed to purge expired audit logs.");
                return 0;
            }
        }

        private async Task WriteAsync(AuditLog entry)
        {
            try
            {
                await _databaseAccessor.InsertDocument(entry);
            }
            catch (Exception ex)
            {
                Log.Warning(ex, "Failed to write audit log for action {Action}.", entry.Action);
            }
        }
    }
}
