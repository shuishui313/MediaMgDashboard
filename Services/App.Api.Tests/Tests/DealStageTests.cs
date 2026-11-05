using App.Api.Utilities;
using Contracts.Domain.Database;
using Xunit;

namespace App.Api.Tests.Tests
{
    /// <summary>
    /// 商务单阶段流转是「只能前进一步」的唯一实现，界面上的按钮和后端校验都依赖它。
    /// 这里把每条边界都钉住，避免以后加阶段时把已结算 / 已丢失的终点一起放开。
    /// </summary>
    public class DealStageTests
    {
        [Theory]
        [InlineData(DealStage.Lead, DealStage.Quoting)]
        [InlineData(DealStage.Quoting, DealStage.PricingReview)]
        [InlineData(DealStage.PricingReview, DealStage.Confirmed)]
        [InlineData(DealStage.Confirmed, DealStage.Delivering)]
        [InlineData(DealStage.Delivering, DealStage.Settled)]
        public void AllowsOnlyNextStep(string from, string to)
        {
            Assert.Null(DealStage.ValidateTransition(from, to));
            Assert.Equal(to, DealStageText.NextStage(from));
        }

        [Fact]
        public void RejectsSkippingStages()
        {
            var error = DealStage.ValidateTransition(DealStage.Lead, DealStage.Confirmed);

            Assert.NotNull(error);
            Assert.Contains("只能推进到下一阶段", error);
        }

        [Fact]
        public void RejectsGoingBackwards()
        {
            var error = DealStage.ValidateTransition(DealStage.Confirmed, DealStage.Quoting);

            Assert.NotNull(error);
            Assert.Contains("只能推进到下一阶段", error);
        }

        [Fact]
        public void SettledIsTerminal()
        {
            var error = DealStage.ValidateTransition(DealStage.Settled, DealStage.Delivering);

            Assert.Equal("已结算的商务单不能再改阶段。", error);
            Assert.Null(DealStageText.NextStage(DealStage.Settled));
        }

        [Theory]
        [InlineData(DealStage.Lead)]
        [InlineData(DealStage.Quoting)]
        [InlineData(DealStage.PricingReview)]
        [InlineData(DealStage.Confirmed)]
        [InlineData(DealStage.Delivering)]
        public void AnyActiveStageCanBeMarkedLost(string from)
        {
            Assert.Null(DealStage.ValidateTransition(from, DealStage.Lost));
        }

        [Fact]
        public void LostCannotMoveForwardWithoutReopening()
        {
            var error = DealStage.ValidateTransition(DealStage.Lost, DealStage.Quoting);

            Assert.NotNull(error);
            Assert.Contains("已丢失", error);
            Assert.Null(DealStageText.NextStage(DealStage.Lost));
        }

        [Fact]
        public void RejectsUnknownStage()
        {
            Assert.False(DealStage.IsValid("won"));
            Assert.Equal("不支持的阶段「won」。", DealStage.ValidateTransition(DealStage.Lead, "won"));
        }

        [Fact]
        public void SameStageIsNoOpAndRejected()
        {
            Assert.Equal("阶段没有变化。", DealStage.ValidateTransition(DealStage.Lead, DealStage.Lead));
        }

        [Theory]
        [InlineData(DealStage.Lead, "线索")]
        [InlineData(DealStage.PricingReview, "待报价审核")]
        [InlineData(DealStage.Settled, "已结算")]
        [InlineData("won", "未知阶段")]
        [InlineData(null, "未知阶段")]
        public void LabelsAreStable(string? stage, string expected)
        {
            Assert.Equal(expected, DealStageText.Label(stage));
        }

        [Theory]
        [InlineData(0, "未报价")]
        [InlineData(-1, "未报价")]
        [InlineData(48000, "¥48,000")]
        public void FormatsAmount(decimal amount, string expected)
        {
            Assert.Equal(expected, DealStageText.FormatAmount(amount, "CNY"));
        }

        [Fact]
        public void NonCnyAmountKeepsCurrencyCode()
        {
            Assert.Equal("USD 1,200", DealStageText.FormatAmount(1200, "USD"));
        }
    }
}
