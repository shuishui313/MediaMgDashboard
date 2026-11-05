using App.Api.Utilities;
using Contracts.Domain.Database;
using Xunit;

namespace App.Api.Tests.Tests
{
    /// <summary>
    /// 内容计划状态机：顺次推进，任意状态可归档，归档后不可再动。
    /// </summary>
    public class ContentPlanStatusTests
    {
        [Theory]
        [InlineData(ContentPlanStatus.Draft, ContentPlanStatus.Scoring)]
        [InlineData(ContentPlanStatus.Scoring, ContentPlanStatus.Scheduled)]
        [InlineData(ContentPlanStatus.Scheduled, ContentPlanStatus.Published)]
        public void AllowsOnlyNextStep(string from, string to)
        {
            Assert.Null(ContentPlanStatus.ValidateTransition(from, to));
            Assert.Equal(to, PlanStatusText.NextStatus(from));
        }

        [Fact]
        public void RejectsSkippingStatus()
        {
            var error = ContentPlanStatus.ValidateTransition(ContentPlanStatus.Draft, ContentPlanStatus.Published);

            Assert.NotNull(error);
            Assert.Contains("只能推进到下一状态", error);
        }

        [Theory]
        [InlineData(ContentPlanStatus.Draft)]
        [InlineData(ContentPlanStatus.Scoring)]
        [InlineData(ContentPlanStatus.Scheduled)]
        [InlineData(ContentPlanStatus.Published)]
        public void AnyStatusCanBeArchived(string from)
        {
            Assert.Null(ContentPlanStatus.ValidateTransition(from, ContentPlanStatus.Archived));
        }

        [Fact]
        public void ArchivedIsTerminal()
        {
            Assert.Equal("已归档的计划不能再改状态。",
                ContentPlanStatus.ValidateTransition(ContentPlanStatus.Archived, ContentPlanStatus.Published));
            Assert.Null(PlanStatusText.NextStatus(ContentPlanStatus.Archived));
        }

        [Fact]
        public void PublishedHasNoNextStatus()
        {
            Assert.Null(PlanStatusText.NextStatus(ContentPlanStatus.Published));
        }

        [Fact]
        public void SameStatusIsRejected()
        {
            Assert.Equal("状态没有变化。",
                ContentPlanStatus.ValidateTransition(ContentPlanStatus.Draft, ContentPlanStatus.Draft));
        }

        [Fact]
        public void RejectsUnknownStatus()
        {
            Assert.False(ContentPlanStatus.IsValid("reviewed"));
            Assert.Equal("不支持的状态「reviewed」。",
                ContentPlanStatus.ValidateTransition(ContentPlanStatus.Draft, "reviewed"));
        }

        [Fact]
        public void TrimsWhitespaceWhenValidating()
        {
            Assert.True(ContentPlanStatus.IsValid(" scoring "));
        }

        [Theory]
        [InlineData(ContentPlanStatus.Draft, "选题中")]
        [InlineData(ContentPlanStatus.Scoring, "评分中")]
        [InlineData(ContentPlanStatus.Scheduled, "待制作 / 发布")]
        [InlineData(ContentPlanStatus.Published, "已发布")]
        [InlineData(ContentPlanStatus.Archived, "已归档")]
        [InlineData(null, "未知状态")]
        public void LabelsAreStable(string? status, string expected)
        {
            Assert.Equal(expected, PlanStatusText.Label(status));
        }

        [Fact]
        public void FormatsCycleRelativeToToday()
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            Assert.Equal("待排期", PlanStatusText.FormatCycle(null));
            Assert.Equal("今日", PlanStatusText.FormatCycle(today));
            Assert.Equal("明日", PlanStatusText.FormatCycle(today.AddDays(1)));
            Assert.Equal($"{today.AddDays(3):MM-dd}（本周）", PlanStatusText.FormatCycle(today.AddDays(3)));
            Assert.Equal($"{today.AddDays(10):MM-dd}", PlanStatusText.FormatCycle(today.AddDays(10)));
        }
    }
}
