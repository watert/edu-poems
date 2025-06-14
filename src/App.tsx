// import { useState } from 'react'
import './App.css'
// import data from './data.json'
import { convertPinyinTones } from './convertPinyinTones'
import { poemsMarkdown } from './poems-md';
import { parsePoems } from './parse-chinese-poem';
import _ from 'lodash';
import { useSetState } from 'react-use';
import { css, cx } from '@emotion/css';
import { marked } from 'marked';

const data = parsePoems(poemsMarkdown)
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
function convertTextToRubyHtml(
    text: string,
    replacer?: (rubyText: string) => string
): string {
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


function App() {
  // const [count, setCount] = useState(0)
  const [state, setState] = useSetState<any>();
  const tags = _(data).map('tags').flatten().countBy().toPairs()
    .filter(r => r[1] > 1)
    .sortBy(r => -r[1])
    .value();
  const authors = _(data).map('author').countBy().toPairs()
    .filter(r => r[1] > 1)
    .sortBy(r => -r[1])
    .value()
  const toggleState = (value: string, field = 'tags') => {
    setState((prev) => {
      let { [field]: list = [] } = prev;
      list = list.includes(value) ? list.filter(r => r !== value) : list.concat(value);
      return { ...prev, [field]: list }
    })
  }
  let finalData = [...data];
  if (state.tags?.length) {
    finalData = data.filter(row => {
      return (row.tags || []).some(tag => state.tags.includes(tag));
    });
  }
  if (state.authors?.length) {
    finalData = finalData.filter(row => {
      return (state.authors || []).includes(row.author);
    });
  }
  return (
    <div className={cx('page-poems', css`
      hr { opacity: .3; }
    `)}>
      <h1 className='font-bold text-4xl'>Poems</h1>
      <div className='tags flex flex-wrap gap-x-2 leading-[1.5em] mb-2'>
        <b>标签:</b>
        {tags.map(([tag, count]) => {
          const isActive = (state.tags || []).includes(tag);
          return (
            <span key={tag} onClick={() => toggleState(tag)}
              className={cx('tag-item hover:opacity-70 cursor-pointer', isActive && ' text-blue-500')}
            >{tag} ({count})</span>
          );
        })}
      </div>
      <div className='tags flex flex-wrap gap-x-2 leading-[1.5em] mb-2'>
        <b>作者:</b>
        {authors.map(([item, count]) => {
          const isActive = (state.authors || []).includes(item);
          return (
            <span key={item} onClick={() => toggleState(item, 'authors')}
              className={cx('tag-item hover:opacity-70 cursor-pointer', isActive && ' text-blue-500')}
            >{item} ({count})</span>
          );
        })}
      </div>
      <hr className='my-4' />

      {finalData.map(row => {
        const { index, desc, tags, title, author, content } = row;
        const isLast = finalData.indexOf(row) === finalData.length - 1;
        const html = marked.parse(
          convertTextToRubyHtml(content, mark => convertPinyinTones(mark)).replace(/\n/gm, '\n\n'),
          { gfm: true, breaks: true },
        );
        return (
          <>
            <div key={title} className='poem-item my-8 md:flex'>
              <div className='max-w-[36em]'>
                <h2 className='font-bold text-xl mb-4'>{index}. {title} <span className='text-[0.8em]'> - {author}</span></h2>
                <div className='leading-[2em] text-lg' dangerouslySetInnerHTML={{ __html: html }} />
              </div>
              <div className='mt-4 md:ml-4'>
                <p className='mb-2 opacity-60'>{tags.map(r => `#${r}`).join(' ')}</p>
                <p className='max-w-[320px]' dangerouslySetInnerHTML={{ __html: desc }} />
              </div>
            </div>
            {!isLast && <hr />}
          </>
        )
      })}
    </div>
  )
}

export default App
