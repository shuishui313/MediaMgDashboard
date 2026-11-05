using App.Api.Utilities;
using Contracts.Domain.Database;
using Xunit;

namespace App.Api.Tests.Tests
{
    /// <summary>
    /// 审计的标识 → 中文名映射是筛选下拉与历史记录可读性的基础，漏一个就会出现英文标识直接暴露给用户。
    /// </summary>
    public class AuditCatalogTests
    {
        [Fact]
        public void EveryActionHasChineseLabel()
        {
            foreach (var action in AuditAction.All)
            {
                var label = AuditAction.Label(action);

                Assert.False(string.IsNullOrWhiteSpace(label));
                Assert.NotEqual(action, label);
            }
        }

        [Fact]
        public void EveryTargetTypeHasChineseLabel()
        {
            foreach (var target in AuditTargetType.All)
            {
                var label = AuditTargetType.Label(target);

                Assert.False(string.IsNullOrWhiteSpace(label));
                Assert.NotEqual(target, label);
            }
        }

        [Fact]
        public void UnknownValuesFallBackToRawInput()
        {
            Assert.Equal("custom.action", AuditAction.Label("custom.action"));
            Assert.Equal("custom-target", AuditTargetType.Label("custom-target"));
        }

        [Fact]
        public void ChangeIsBuiltWithReadableValues()
        {
            var change = AuditText.NewChange("Stage", "阶段", "线索", "报价中");

            Assert.Equal("Stage", change.Field);
            Assert.Equal("阶段", change.Label);
            Assert.Equal("线索", change.Before);
            Assert.Equal("报价中", change.After);
        }

        [Theory]
        [InlineData(0, "未报价")]
        [InlineData(-100, "未报价")]
        [InlineData(48000, "CNY 48,000")]
        public void FormatsMoney(decimal amount, string expected)
        {
            Assert.Equal(expected, AuditText.Money(amount, "CNY"));
        }

        [Fact]
        public void FormatsEmptyValuesExplicitly()
        {
            Assert.Equal("未填写", AuditText.Text("  "));
            Assert.Equal("未设置", AuditText.Date(null));
            Assert.Equal("未评分", AuditText.Score(null));
            Assert.Equal("未指定平台", AuditText.Platforms(Array.Empty<string>()));
        }

        [Fact]
        public void FormatsPlatformsWithSeparator()
        {
            Assert.Equal("douyin、xiaohongshu", AuditText.Platforms(new[] { "douyin", "xiaohongshu" }));
        }

        [Theory]
        [InlineData("connected", "已授权")]
        [InlineData("manual", "手工录入")]
        [InlineData("paused", "已停用")]
        [InlineData("error", "同步异常")]
        [InlineData(null, "未知")]
        public void TranslatesAccountStatus(string? status, string expected)
        {
            Assert.Equal(expected, AuditText.AccountStatus(status));
        }

        [Fact]
        public void RetentionIsNinetyDays()
        {
            Assert.Equal(90, AuditRecorder.RetentionDays);
        }
    }
}
