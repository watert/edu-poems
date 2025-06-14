import { marked } from "marked";
import { parseMarkdownBlocks } from "./parseMarkdownBlocks";
import _ from "lodash";

export type Poem = {
  index: number;
  title: string;
  author: string;
  content: string;
  desc: string;
  tags: string[];
};

/**
// Example Usage:
const inputText = `
## 4. 《咏鹅》 - 骆宾王
鹅(é)鹅鹅，曲项向天歌。
白毛浮绿水，红掌拨(bō)清波。
* **描述**: 大白鹅弯着脖子唱歌，用红脚丫在绿水里划船玩~
* **标签**: 动物, 童趣, 颜色
## 5. 《风》 - 李峤
解落三秋叶，能开二月花(huā)。
过江千尺浪，入竹万竿斜(xié)。
* **描述**: 风是魔法师！能吹落树叶，也能让花开，还能在竹林里跳舞~
* **标签**: 自然, 四季, 力量
`;
const parsedPoems = parsePoems(inputText);
console.log(JSON.stringify(parsedPoems, null, 2));

 * @returns 
 */



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
  replacer?: (rubyText: string) => string
): string {
  const regex = /([\u4e00-\u9fa5]+)\(([^)]+)\)/g;
  const htmlOutput = text.replace(
    regex,
    (match, chineseWord, rubyTextContent) => {
      const rubyLen = rubyTextContent.split(" ").length;
      const prefix = chineseWord.slice(0, -rubyLen);
      chineseWord = chineseWord.slice(-rubyLen);
      const processedRubyText = replacer
        ? replacer(rubyTextContent)
        : rubyTextContent;
      return `${prefix}<ruby>${chineseWord}<rp>(</rp><rt>${processedRubyText}</rt><rp>)</rp></ruby>`;
    }
  );

  // 将两个或更多空格替换为 <br> 标签，实现换行效果
  return htmlOutput.replace(/ {2,}/g, "<br>");
}

export function parsePoems(text: string, 
  options: {
    remainAttrItems?: boolean;
    marked?: any;
  } = {}): Poem[] {
  
  return parseMarkdownBlocks(text).map((block, index) => {
    let title = block.title, author = '';
    const titleTokens = marked.lexer(title, options.marked);
    if (titleTokens[0]?.type === 'list' && titleTokens.length === 1) {
      index = titleTokens[0].start;
      title = titleTokens[0].items[0].text;
      // console.log('item', titleTokens[0].items[0]);
    } else {
      const match = title.match(/^([\d+.]+)\s?/);
      if (match) {
        index = parseFloat(match[1]);
        title = title.replace(match[0], '');
      }
    }
    const titleParts = title.split(/\s-\s/);
    if (titleParts.length === 2) {
      [title, author] = titleParts.map(r => r.trim());
    }
    // console.log('titleTokens', titleTokens);
    let { attrs, content } = block;
    const descKey = _.findKey(attrs, (v, k) => {
      return ['desc', '描述'].includes(k);
    }) || 'desc';
    const tagsKey = _.findKey(attrs, (v, k) => {
      return ['tags', '标签'].includes(k);
    }) || 'tags';
    const desc = attrs[descKey];
    let tags: any = attrs[tagsKey] || '';
    tags = tags.split(',').map(r => r.trim());
    attrs = _.omit(attrs, [descKey, tagsKey]);
    const html = convertTextToRubyHtml(content);
    return { index, title, author, attrs, content, desc, tags, html };
  })
}
