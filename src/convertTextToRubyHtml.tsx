/**
 * 将包含拼音的文本转换为带有 Ruby 注释的 HTML。
 * 例如："你好(ni3hao3)" 会被转换为 <ruby>你好<rt>ni3 hao3</rt></ruby>
 * 新增支持多字词语，如 "羌笛(qiang1 di2)"。
 *
 * @param text 输入文本，其中汉字词语后的括号内包含拼音。
 * @param replacer (可选) 一个函数，用于在拼音被插入到 <rt> 标签之前对其进行处理。
 * 例如，可以用来将 "ni3 hao3" 转换为 "nǐhǎo"。
 * @returns 包含 Ruby HTML 的格式化字符串。
 */
export function convertTextToRubyHtml(
  text: string,
  replacer?: (rubyText: string) => string): string {
  const regex = /([\u4e00-\u9fa5]+)\(([^)]+)\)/g;
  const htmlOutput = text.replace(regex, (match, chineseWord, rubyTextContent) => {
    const rubyLen = rubyTextContent.split(' ').length;
    const prefix = chineseWord.slice(0, -rubyLen);
    chineseWord = chineseWord.slice(-rubyLen);
    const processedRubyText = replacer ? replacer(rubyTextContent) : rubyTextContent;
    return `${prefix}<ruby>${chineseWord}<rp>(</rp><rt>${processedRubyText}</rt><rp>)</rp></ruby>`;
  });

  // 将两个或更多空格替换为 <br> 标签，实现换行效果
  return htmlOutput.replace(/ {2,}/g, '<br>');
}
