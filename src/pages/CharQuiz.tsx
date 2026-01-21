import _, { range } from "lodash";
import { useState, useEffect, useCallback } from "react";
import { A4Page } from "../components/A4Page";
import { PinyinChar } from "../components/PinyinChar";
import { convertPinyinTones } from "../convertPinyinTones";

type PageData = { title: string; type?: string; value?: string; items?: { pinyin?: string; char?: string }[] };
type DocData = PageData[];

const DEFAULT_DOC: DocData = [
  { title: '一年级上 汉字 1', type: 'char', value: '一,二,三,上,口,耳,目,手,日,火,田,禾,六,七,八,十,九,王,午,下,去,年,了,子,大,人,可,叶,东,西,竹,马,牙,用,几,四,小,鸟,是,天,女,开,关,先,云,雨,虫,山,水,力' },
  { title: '一年级上 汉字 2', type: 'char', value: '男,土,木,心,尺,本,刀,不,少,中,五,风,立,正,工,厂,门,卫,月,儿,头,里,见,在,我,左,右,和,也,又,才,爸,妈,比,巴,长,公,只,个,多,石,出,来,半,你,有,牛,羊,果,白' },
  { title: '一年级上 拼音 1', type: 'pinyin', value: 'yi1,er4,san1,shang4,kou3,er3,mu4,shou3,ri4,huo3,tian2,he2,liu4,qi1,ba1,jiu3,shi2,wang2,wu3,xia4,qu4,nian2,le5,zi3,da4,ren2,ke3,ye4,dong1,xi1,zhu2,ma3,ya2,yong4,ji3,si4,xiao3,niao3,shi4,tian1,nv3,kai1,guan1,xian1,yun2,yu3,chong2,shan1,shui3,li4' },
  { title: '一年级上 拼音 2', type: 'pinyin', value: 'nan2,tu3,mu4,xin1,chi3,ben3,dao1,bu4,shao3,zhong1,wu3,feng1,li4,zheng4,gong1,chang3,men2,wei4,yue4,er2,tou2,li3,jian4,zai4,wo3,zuo3,you4,he2,ye3,you4,cai2,ba4,ma1,bi3,ba1,chang2,gong1,zhi3,ge4,duo1,shi2,chu1,lai2,ban4,ni3,you3,niu2,yang2,guo3,bai2' },
  { title: 'Test', items: [{ pinyin: 'yi1', char: '一' }, { pinyin: 'er4' }, { char: '三' }] }
];

const DEFAULT_DOC_TITLE = 'Default';

const SIZE = 64;
const COLOR = "#AAA";

function useCharQuizDocs() {
  const [docTitles, setDocTitles] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('edu-poems-charquiz-docs');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    return [DEFAULT_DOC_TITLE];
  });

  const [currentDocTitle, setCurrentDocTitle] = useState<string>(() => {
    return docTitles[0] || DEFAULT_DOC_TITLE;
  });

  const [currentDoc, setCurrentDoc] = useState<DocData>(() => {
    if (currentDocTitle === DEFAULT_DOC_TITLE) return DEFAULT_DOC;
    try {
      const stored = localStorage.getItem(`edu-poems-charquiz-${currentDocTitle}`);
      if (stored) return JSON.parse(stored);
    } catch {}
    return DEFAULT_DOC;
  });

  const saveCurrentDoc = useCallback((doc: DocData) => {
    localStorage.setItem(`edu-poems-charquiz-${currentDocTitle}`, JSON.stringify(doc));
    setCurrentDoc(doc);
  }, [currentDocTitle]);

  const saveDocAs = useCallback((newTitle: string, doc: DocData) => {
    localStorage.setItem(`edu-poems-charquiz-${newTitle}`, JSON.stringify(doc));
    const newTitles = [...new Set([...docTitles, newTitle])];
    localStorage.setItem('edu-poems-charquiz-docs', JSON.stringify(newTitles));
    setDocTitles(newTitles);
    setCurrentDocTitle(newTitle);
  }, [docTitles]);

  const addNewDoc = useCallback((title: string) => {
    const newDoc: DocData = [{ title, items: [] }];
    localStorage.setItem(`edu-poems-charquiz-${title}`, JSON.stringify(newDoc));
    const newTitles = [...docTitles, title];
    localStorage.setItem('edu-poems-charquiz-docs', JSON.stringify(newTitles));
    setDocTitles(newTitles);
    setCurrentDocTitle(title);
    setCurrentDoc(newDoc);
  }, [docTitles]);

  const loadDoc = useCallback((title: string) => {
    if (title === DEFAULT_DOC_TITLE) {
      setCurrentDoc(DEFAULT_DOC);
    } else {
      try {
        const stored = localStorage.getItem(`edu-poems-charquiz-${title}`);
        if (stored) setCurrentDoc(JSON.parse(stored));
      } catch {}
    }
    setCurrentDocTitle(title);
  }, []);

  const resetToDefault = useCallback(() => {
    docTitles.forEach(t => {
      if (t !== DEFAULT_DOC_TITLE) localStorage.removeItem(`edu-poems-charquiz-${t}`);
    });
    localStorage.removeItem('edu-poems-charquiz-docs');
    setDocTitles([DEFAULT_DOC_TITLE]);
    setCurrentDocTitle(DEFAULT_DOC_TITLE);
    setCurrentDoc(DEFAULT_DOC);
  }, [docTitles]);

  return { docTitles, currentDocTitle, currentDoc, saveCurrentDoc, saveDocAs, addNewDoc, loadDoc, resetToDefault };
}

function ConfigPanel({
  docTitles,
  currentDocTitle,
  onSelectDoc,
  onSave,
  onSaveAs,
  onAddNew,
  onReset,
}: {
  docTitles: string[];
  currentDocTitle: string;
  onSelectDoc: (title: string) => void;
  onSave: () => void;
  onSaveAs: (title: string) => void;
  onAddNew: (title: string) => void;
  onReset: () => void;
}) {
  const [newTitle, setNewTitle] = useState('');

  return (
    <div className="print:hidden p-4 bg-gray-100 border-b mb-4">
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <span className="font-bold">文档:</span>
          <select
            value={currentDocTitle}
            onChange={(e) => onSelectDoc(e.target.value)}
            className="border rounded px-2 py-1 min-w-[160px]"
          >
            {docTitles.map(title => (
              <option key={title} value={title}>{title}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={onSave} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
            Save
          </button>
          <button
            onClick={() => newTitle.trim() && onSaveAs(newTitle.trim())}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
            disabled={!newTitle.trim()}
          >
            Save As
          </button>
          <button onClick={onReset} className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500">
            Reset
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="新文档标题"
            className="border rounded px-2 py-1"
          />
          <button
            onClick={() => newTitle.trim() && onAddNew(newTitle.trim())}
            className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
            disabled={!newTitle.trim()}
          >
            Add New
          </button>
        </div>
      </div>

      <div className="mt-3 text-sm text-gray-600">
        <p>💡 提示: pinyin 支持 "yi1" 格式 (字母 + 声调数字 1-4)，会自动转换声调符号</p>
        <p>点击格子可编辑拼音或汉字，修改后点击 Save 保存</p>
      </div>
    </div>
  );
}

export function PageCharQuiz() {
  const { docTitles, currentDocTitle, currentDoc, saveCurrentDoc, saveDocAs, addNewDoc, loadDoc, resetToDefault } = useCharQuizDocs();
  const [editableDoc, setEditableDoc] = useState<DocData>(currentDoc);

  useEffect(() => { setEditableDoc(currentDoc); }, [currentDoc]);

  const getItems = (page: PageData): { pinyin?: string; char?: string }[] => {
    if (page.items) return page.items;
    if (page.type === 'pinyin') {
      return (page.value || '').split(',').map(item => ({ pinyin: convertPinyinTones(item) }));
    }
    if (page.type === 'char') {
      return (page.value || '').split(',').map(item => ({ char: item }));
    }
    return [];
  };

  const handleItemChange = (pageIndex: number, itemIndex: number, newItem: { pinyin?: string; char?: string }) => {
    const newDoc = [...editableDoc];
    const page = { ...newDoc[pageIndex] };

    if (page.items) {
      page.items = [...page.items];
      page.items[itemIndex] = newItem;
    } else {
      const items = getItems(page);
      page.items = [...items];
      page.items[itemIndex] = newItem;
    }

    newDoc[pageIndex] = page;
    setEditableDoc(newDoc);
  };

  return (
    <div>
      <ConfigPanel
        docTitles={docTitles}
        currentDocTitle={currentDocTitle}
        onSelectDoc={loadDoc}
        onSave={() => saveCurrentDoc(editableDoc)}
        onSaveAs={(title) => saveDocAs(title, editableDoc)}
        onAddNew={addNewDoc}
        onReset={resetToDefault}
      />

      <div>
        {editableDoc.map((page, pageIdx) => {
          const pageItems = getItems(page);

          return (
            <A4Page key={pageIdx} className="px-8" title={page.title} footer={page.title}>
              <div className="flex flex-1 flex-wrap gap-y-4 m-auto content-center items-center justify-center">
                {pageItems.map((item, idx) => (
                  <PinyinChar
                    size={SIZE} strokeColor={COLOR}
                    key={idx}
                    char={item.char || ''}
                    pinyin={item.pinyin || ''}
                    onChange={({ char, pinyin }) => {
                      handleItemChange(pageIdx, idx, { char, pinyin });
                    }}
                  />
                ))}
                {range(64 - pageItems.length).map((_, idx) => (
                  <PinyinChar
                    size={SIZE} strokeColor={COLOR}
                    key={`empty-${idx}`} char="" pinyin=""
                  />
                ))}
              </div>
            </A4Page>
          );
        })}
      </div>
    </div>
  );
}
