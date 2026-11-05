using App.Api.Utilities;
using Xunit;

namespace App.Api.Tests.Tests
{
    /// <summary>
    /// CSV 解析只服务导入这一个场景，但边界（BOM、引号内逗号 / 换行、行号）都会直接影响运营看到的报错。
    /// </summary>
    public class CsvTableTests
    {
        [Fact]
        public void ReturnsEmptyForEmptyContent()
        {
            Assert.Empty(CsvTable.Parse(string.Empty));
        }

        [Fact]
        public void StripsUtf8Bom()
        {
            var rows = CsvTable.Parse("\uFEFFplatform,account\n douyin ,@a");

            Assert.Equal(2, rows.Count);
            Assert.Equal("platform", rows[0].Fields[0]);
        }

        [Fact]
        public void KeepsCommasInsideQuotes()
        {
            var rows = CsvTable.Parse("a,\"b,c\"");

            Assert.Single(rows);
            Assert.Equal(new[] { "a", "b,c" }, rows[0].Fields);
        }

        [Fact]
        public void UnescapesDoubleQuotes()
        {
            var rows = CsvTable.Parse("a,\"say \"\"hi\"\"\"");

            Assert.Single(rows);
            Assert.Equal("say \"hi\"", rows[0].Fields[1]);
        }

        [Fact]
        public void KeepsNewlinesInsideQuotes()
        {
            var rows = CsvTable.Parse("a,\"line1\nline2\"\nb,2");

            Assert.Equal(2, rows.Count);
            Assert.Equal("line1\nline2", rows[0].Fields[1]);
            Assert.Equal(new[] { "b", "2" }, rows[1].Fields);
        }

        [Fact]
        public void HandlesCrLf()
        {
            var rows = CsvTable.Parse("a,b\r\nc,d\r\n");

            Assert.Equal(2, rows.Count);
            Assert.Equal(new[] { "c", "d" }, rows[1].Fields);
        }

        [Fact]
        public void ReportsPhysicalLineNumbers()
        {
            // 第 1 行是表头，第 2 行数据里含换行，所以下一条数据在第 4 行开头。
            var rows = CsvTable.Parse("h1,h2\n\"a\nb\",2\nc,3");

            Assert.Equal(3, rows.Count);
            Assert.Equal(1, rows[0].LineNumber);
            Assert.Equal(2, rows[1].LineNumber);
            Assert.Equal(4, rows[2].LineNumber);
        }

        [Fact]
        public void SplitsEmptyTrailingField()
        {
            var rows = CsvTable.Parse("a,b,");

            Assert.Single(rows);
            Assert.Equal(3, rows[0].Fields.Length);
            Assert.Equal(string.Empty, rows[0].Fields[2]);
        }
    }
}
