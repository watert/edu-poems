import { cx, css } from "@emotion/css";
import _ from "lodash";
import { marked } from "marked";
import { useSetState } from "react-use";
import { convertPinyinTones } from "../convertPinyinTones";
import { convertTextToRubyHtml, parsePoems } from "../parse-chinese-poem";
import { poemsMarkdown } from '../poems-md';

let data = parsePoems(poemsMarkdown)
data = _.sortBy(data, r => r.count_total_strokes)

export function PagePoems() {
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
  console.log('finalData', finalData);
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
        const { index, desc, tags, title, author, content, count_total_strokes } = row;
        const isLast = finalData.indexOf(row) === finalData.length - 1;
        const html = marked.parse(
          convertTextToRubyHtml(content, mark => convertPinyinTones(mark)).replace(/\n/gm, '\n\n'),
          { gfm: true, breaks: true },
        );
        return (
          <>
            <div key={title} className='poem-item my-8 md:flex'>
              <div className='max-w-[36em]'>
                <h2 className='font-bold text-xl mb-4'>{index}. {title} {author && <span className='text-[0.8em]'> - {author}</span>}</h2>
                <div className='leading-[2em] text-lg' dangerouslySetInnerHTML={{ __html: html }} />
              </div>
              <div className='mt-4 md:ml-4'>
                <p className='mb-2 opacity-60'>(总笔画数: {count_total_strokes}){' '} {tags.map(r => `#${r}`).join(' ')}</p>
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