import _ from "lodash";
import { marked } from "marked";
import { splitBy } from "./splitBy";

export type MdBlock = {
  headLevel: number;
  title: string;
  content: string;
  attrs: {
    [key: string]: string;
  };
};

/**
example:
```md
## 4. 《咏鹅》 - 骆宾王  
鹅(é)鹅鹅，曲项向天歌。  
白毛浮绿水，红掌拨(bō)清波。  
* **描述**: 大白鹅弯着脖子唱歌，用红脚丫在绿水里划船玩~  
* **标签**: 动物, 童趣, 颜色  
```
returns:
[{
  "content": "鹅(é)鹅鹅，曲项向天歌。\n白毛浮绿水，红掌拨(bō)清波。",
  "headLevel": 2,
  "title": "4. 《咏鹅》 - 骆宾王",
  "attrs": {
    "描述": "大白鹅弯着脖子唱歌，用红脚丫在绿水里划船玩~",
    "标签": "动物, 童趣, 颜色",
  },
}]
 * 
 */
export function parseMarkdownBlocks(
  markdown: string,
  options: {
    remainAttrItems?: boolean;
    marked?: any;
  } = {}
): MdBlock[] {
  const { remainAttrItems } = options;
  
  const mdOpts = { gfm: true, ...options.marked || {} };
  const tokens = marked.lexer(markdown, mdOpts);
  let chunks = splitBy(tokens, (t) => t.type === 'heading') as any[];
  chunks = chunks.map((chunk) => {
    return chunk.filter(r => r.raw.trim());
  });
  chunks = chunks.reduce((acc, block, idx) => {
    let lastItem: any = _.last(acc.data);
    if (block[0]?.type === 'heading') {
      lastItem = {
        headLevel: block[0].depth,
        title: block[0].text,
        headBlock: block,
      };
      acc.data.push(lastItem);
    } else if (lastItem) {
      lastItem.children = block;
    } else if (!lastItem) {
      // lastItem = { children: block };
    }
    return acc;
  }, { data: [] as any[] } as any).data;

  chunks = chunks.map((block) => {
    let attrs = {};
    const lists = block?.children?.filter((t) => t.type === 'list');
    if (lists) {
      console.log('lists', lists, lists[0].items?.[0]);
      const parseAttrItem = (row) => {
        const startChar = (row.tokens[1]?.text || '').trim().slice(0, 1);
        if (![":", "："].includes(startChar)) return row;
        const value = row.tokens[1].text.slice(1).trim();
        const key = row.tokens[0].text;
        attrs[key] = value;
        row.attr = [key, value];
        return row;
      };
      lists.forEach((list) => {
        list.items = list.items.flatMap(r => r.tokens || []).map(parseAttrItem);
        if (!remainAttrItems) {
          list.items = list.items.filter((r) => !r.attr);
        }
      });
    }
    const content = block?.children?.filter((row) => {
      if (row.type === 'list' && !row.items?.length) return false;
      return true;
    }).map(r => r.raw).join('\n');
    return { ..._.omit(block, 'headBlock', 'children'), content, attrs };
  });
  return chunks;
}
