import { useEffect, useLayoutEffect, useRef } from "react";
import cnchar from 'cnchar';
import draw from 'cnchar-draw';

let DEFAULT_DATA;
DEFAULT_DATA = {
    "index": 141.1,
    "title": "《论语》十二章 《子在川上曰》",
    "author": "",
    "attrs": {},
    "content": "子在川(chuān)上曰：\"逝(shì)者如斯(sī)夫(fū)，不舍(shě)昼夜(zhòu yè)。\"\n",
    "content_chars": "子在川上曰：\"逝者如斯夫，不舍昼夜。\"\n",
    "count_chars": 14,
    "count_total_strokes": 88,
    "desc": "孔子爷爷看着河水说：\"时间像水流，白天黑夜哗啦啦跑不停呀！\"",
    "tags": [
        "时间",
        "珍惜",
        "自然"
    ],
    "html": "子在<ruby>川<rp>(</rp><rt>chuān</rt><rp>)</rp></ruby>上曰：\"<ruby>逝<rp>(</rp><rt>shì</rt><rp>)</rp></ruby>者如<ruby>斯<rp>(</rp><rt>sī</rt><rp>)</rp></ruby><ruby>夫<rp>(</rp><rt>fū</rt><rp>)</rp></ruby>，不<ruby>舍<rp>(</rp><rt>shě</rt><rp>)</rp></ruby><ruby>昼夜<rp>(</rp><rt>zhòu yè</rt><rp>)</rp></ruby>。\"\n"
};

// const DEFAULT_DATA = {
//     "index": 9,
//     "title": "《登鹳雀楼》",
//     "author": "王之涣",
//     "attrs": {},
//     "content": "白日依山尽，黄河入海流(liú)。\n欲穷千里目，更上一层楼。\n",
//     "content_chars": "白日依山尽，黄河入海流。\n欲穷千里目，更上一层楼。\n",
//     "count_chars": 20,
//     "count_total_strokes": 131,
//     "desc": "想要看得更远吗？那就再爬一层楼吧！就像学习要不断进步~",
//     "tags": [
//         "登高",
//         "哲理",
//         "坚持"
//     ],
//     "html": "白日依山尽，黄河入海<ruby>流<rp>(</rp><rt>liú</rt><rp>)</rp></ruby>。\n欲穷千里目，更上一层楼。\n"
// };


export function convertTextToHanziList(
  text: string,
  replacer?: (rubyText: string) => string
) {
  const regex = /([\u4e00-\u9fa5]+)\(([^)]+)\)|\n/g;
  let match: any, lastIdx = 0;
  let chars: any[] = [];
  while(match = regex.exec(text)) {
    if (!match[1]) {
      lastIdx = match.index + match[0].length;
      chars.push({ text: match[0] });
    }
    let [textItems = '', pinyinItems = ''] = [match[1], match[2]];
    
    pinyinItems = (pinyinItems || '').split(/\s/g);
    const prevText = text.slice(lastIdx, match.index) + textItems.slice(0, 0 - pinyinItems.length);
    chars.push({ text: prevText });
    
    
    lastIdx = match.index + match[0].length;
    textItems = textItems.slice(0 - pinyinItems.length).split('');
    textItems.map((text, idx) => {
      chars.push({ text, pinyin: pinyinItems[idx] });
    });
  }
  return chars.filter(r => r.text);
}

export function AnimatedHanzi({ text }) {
  const ref = useRef<any>(null);
  useLayoutEffect(() => {
    draw(text, { el: ref.current, onComplete: () => {}, });
    console.log('ref', ref.current);
  }, []);
  return <span ref={ref}>{text}</span>
}

export function PagePoemStrokes({ data = DEFAULT_DATA }) {
  const hanziList = convertTextToHanziList(data.content);
  console.log('hanziList', hanziList);
  return <div>
    {hanziList.map((row, idx) => {
      const { text, pinyin } = row;
      if (text === '\n') return <br />
      return <ruby>
        <span><AnimatedHanzi text={text} /></span>
        <rp>(</rp>
        <rt>{pinyin}</rt>
        <rp>)</rp>
      </ruby>
    })}
  </div>;
}