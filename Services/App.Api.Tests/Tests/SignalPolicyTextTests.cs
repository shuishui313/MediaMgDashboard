using App.Api.Utilities;
using Contracts.Domain.Database;
using Xunit;

namespace App.Api.Tests.Tests
{
    /// <summary>
    /// 阈值文案是首页与设置页共用的，改文案时最容易出现「设置页写 7 天、首页写 14 天」。
    /// 这里只锁结构性内容：天数切分与关键数字都必须来自入参。
    /// </summary>
    public class SignalPolicyTextTests
    {
        private static SignalThresholdConfig Config() => new()
        {
            BreakoutMultiplier = 2.5,
            BreakoutMinViews = 10000,
            DeclineThresholdPercent = 40,
            LowInteractionRatePercent = 2,
            StaleDays = 5
        };

        [Fact]
        public void IncludesConfiguredNumbers()
        {
            var text = SignalPolicyText.Describe(7, Config());

            Assert.Contains("2.5 倍", text);
            Assert.Contains("10,000", text);
            Assert.Contains("40%", text);
            Assert.Contains("2%", text);
            Assert.Contains("近 5 天没有日记录", text);
        }

        [Fact]
        public void SplitsRangeIntoTwoHalves()
        {
            Assert.Contains("前 3 天与后 4 天", SignalPolicyText.Describe(7, Config()));
            Assert.Contains("前 5 天与后 5 天", SignalPolicyText.Describe(10, Config()));
        }

        [Fact]
        public void KeepsPreviewDaysAtOneWeek()
        {
            // 设置页预览固定 7 天，首页用实际区间；改这个常量要同时看两处文案。
            Assert.Equal(7, SignalPolicyText.PreviewDays);
        }

        [Fact]
        public void NeverMentionsForecasting()
        {
            // 验收标准里写了「不预估」，文案不能出现暗示预测的词。
            var text = SignalPolicyText.Describe(7, Config());

            Assert.DoesNotContain("预测", text);
            Assert.Contains("不预估", text);
        }
    }
}
