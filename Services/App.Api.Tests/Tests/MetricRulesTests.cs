using App.Api.Utilities;
using Xunit;

namespace App.Api.Tests.Tests
{
    /// <summary>
    /// 手工录入与 CSV 导入共用这套校验，测试要覆盖「格式 / 未来 / 过旧 / 负数 / 互动超过播放」。
    /// </summary>
    public class MetricRulesTests
    {
        [Fact]
        public void AcceptsToday()
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow).ToString(MetricRules.DateFormat);

            Assert.True(MetricRules.TryParseDate(today, out var parsed, out var error), error);
            Assert.Equal(DateOnly.FromDateTime(DateTime.UtcNow), parsed);
        }

        [Fact]
        public void RejectsMissingDate()
        {
            Assert.False(MetricRules.TryParseDate("  ", out _, out var error));
            Assert.Equal("缺少统计日期。", error);
        }

        [Theory]
        [InlineData("2026/11/04")]
        [InlineData("20261104")]
        [InlineData("2026-13-01")]
        public void RejectsBadFormat(string raw)
        {
            Assert.False(MetricRules.TryParseDate(raw, out _, out var error));
            Assert.Contains("日期格式应为 yyyy-MM-dd", error);
        }

        [Fact]
        public void RejectsFutureDate()
        {
            var future = DateOnly.FromDateTime(DateTime.UtcNow).AddDays(1).ToString(MetricRules.DateFormat);

            Assert.False(MetricRules.TryParseDate(future, out _, out var error));
            Assert.Contains("不能录入未来日期", error);
        }

        [Fact]
        public void RejectsTooOldDate()
        {
            var tooOld = DateOnly.FromDateTime(DateTime.UtcNow).AddYears(-3).ToString(MetricRules.DateFormat);

            Assert.False(MetricRules.TryParseDate(tooOld, out _, out var error));
            Assert.Contains("只接受近两年的数据", error);
        }

        [Fact]
        public void AcceptsCountsWithinViews()
        {
            Assert.Null(MetricRules.ValidateCounts(1000, 100, 20, 5));
        }

        [Fact]
        public void AcceptsZeroViews()
        {
            // 播放为 0 时不做互动数上限校验，否则新号第一天录不进去。
            Assert.Null(MetricRules.ValidateCounts(0, 0, 0, 0));
        }

        [Fact]
        public void RejectsNegativeCounts()
        {
            Assert.Equal("播放、点赞、评论、转发都不能为负。", MetricRules.ValidateCounts(-1, 0, 0, 0));
            Assert.Equal("播放、点赞、评论、转发都不能为负。", MetricRules.ValidateCounts(10, 0, -2, 0));
        }

        [Fact]
        public void RejectsInteractionOverViews()
        {
            Assert.Equal("互动数之和不能超过播放数，请检查是否填错了列。",
                MetricRules.ValidateCounts(100, 80, 30, 10));
        }

        [Fact]
        public void AllowsInteractionEqualToViews()
        {
            Assert.Null(MetricRules.ValidateCounts(100, 60, 30, 10));
        }
    }
}
