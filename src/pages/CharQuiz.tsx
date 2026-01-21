import _, { range } from "lodash";
import { useState, useEffect, useCallback } from "react";
import { A4Page } from "../components/A4Page";
import { PinyinChar } from "../components/PinyinChar";
import { convertPinyinTones } from "../convertPinyinTones";

const STORAGE_KEY = 'edu-poems-charquiz-data';

export type PageItemType = 
  | { title: string; type: string; value: string; }
  | { title: string; items?: { pinyin?: string; char?: string }[] }

const DEFAULT_PAGES: PageItemType[] = [
  { title: '一年级上 汉字 1', type: 'char', value: '一,二,三,上,口,耳,目,手,日,火,田,禾,六,七,八,十,九,王,午,下,去,年,了,子,大,人,可,叶,东,西,竹,马,牙,用,几,四,小,鸟,是,天,女,开,关,先,云,雨,虫,山,水,力' },
  { title: '一年级上 汉字 2', type: 'char', value: '男,土,木,心,尺,本,刀,不,少,中,五,风,立,正,工,厂,门,卫,月,儿,头,里,见,在,我,左,右,和,也,又,才,爸,妈,比,巴,长,公,只,个,多,石,出,来,半,你,有,牛,羊,果,白' },
  { title: '一年级上 拼音 1', type: 'pinyin', value: 'yi1,er4,san1,shang4,kou3,er3,mu4,shou3,ri4,huo3,tian2,he2,liu4,qi1,ba1,jiu3,shi2,wang2,wu3,xia4,qu4,nian2,le5,zi3,da4,ren2,ke3,ye4,dong1,xi1,zhu2,ma3,ya2,yong4,ji3,si4,xiao3,niao3,shi4,tian1,nv3,kai1,guan1,xian1,yun2,yu3,chong2,shan1,shui3,li4' },
  { title: '一年级上 拼音 2', type: 'pinyin', value: 'nan2,tu3,mu4,xin1,chi3,ben3,dao1,bu4,shao3,zhong1,wu3,feng1,li4,zheng4,gong1,chang3,men2,wei4,yue4,er2,tou2,li3,jian4,zai4,wo3,zuo3,you4,he2,ye3,you4,cai2,ba4,ma1,bi3,ba1,chang2,gong1,zhi3,ge4,duo1,shi2,chu1,lai2,ban4,ni3,you3,niu2,yang2,guo3,bai2' },
  { title: 'Test', items: [{ pinyin: 'yi1', char: '一' }, { pinyin: 'er4' }, { char: '三' }] }
];

const SIZE = 64;
const COLOR = "#AAA";

type PageData = { title: string; type?: string; value?: string; items?: { pinyin?: string; char?: string }[] };

function usePagesData() {
  const [pages, setPages] = useState<PageData[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    return DEFAULT_PAGES;
  });

  const savePages = useCallback((newPages: PageData[]) => {
    setPages(newPages);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPages));
  }, []);

  const resetToDefault = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setPages(DEFAULT_PAGES);
  }, []);

  return { pages, savePages, resetToDefault };
}

function ConfigPanel({
  pages,
  currentPageIndex,
  onSelectPage,
  onSave,
  onDuplicate,
  onAddNew,
  onReset,
}: {
  pages: PageData[];
  currentPageIndex: number;
  onSelectPage: (index: number) => void;
  onSave: () => void;
  onDuplicate: () => void;
  onAddNew: (title: string) => void;
  onReset: () => void;
}) {
  const [newTitle, setNewTitle] = useState('');

  return (
    <div className="print:hidden p-4 bg-gray-100 border-b mb-4">
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <span className="font-bold">页面:</span>
          <select
            value={currentPageIndex}
            onChange={(e) => onSelectPage(Number(e.target.value))}
            className="border rounded px-2 py-1 min-w-[160px]"
          >
            {pages.map((page, idx) => (
              <option key={idx} value={idx}>{page.title}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={onSave} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
            Save
          </button>
          <button onClick={onDuplicate} className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">
            Duplicate
          </button>
          <button onClick={onReset} className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-500">
            Reset
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="新页面标题"
            className="border rounded px-2 py-1"
          />
          <button
            onClick={() => newTitle.trim() && onAddNew(newTitle.trim())}
            className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
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
  const { pages, savePages, resetToDefault } = usePagesData();
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [editablePages, setEditablePages] = useState<PageData[]>(pages);

  useEffect(() => { setEditablePages(pages); }, [pages]);

  const currentPage = editablePages[currentPageIndex];

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

  const handleItemChange = (itemIndex: number, newItem: { pinyin?: string; char?: string }) => {
    const newPages = [...editablePages];
    const page = { ...newPages[currentPageIndex] };

    if (page.items) {
      page.items = [...page.items];
      page.items[itemIndex] = newItem;
    } else {
      const items = getItems(page);
      page.items = [...items];
      page.items[itemIndex] = newItem;
    }

    newPages[currentPageIndex] = page;
    setEditablePages(newPages);
  };

  const handleSave = () => {
    savePages(editablePages);
    alert('已保存!');
  };

  const handleDuplicate = () => {
    const currentTitle = currentPage.title;
    const newTitle = `Copy of ${currentTitle}`;
    const newPage: PageData = {
      title: newTitle,
      items: editablePages[currentPageIndex].items || getItems(editablePages[currentPageIndex]),
    };
    const newPages = [...editablePages, newPage];
    savePages(newPages);
    setCurrentPageIndex(newPages.length - 1);
    alert(`已复制为: ${newTitle}`);
  };

  const handleAddNew = (title: string) => {
    const newPage: PageData = { title, items: [] };
    const newPages = [...editablePages, newPage];
    savePages(newPages);
    setCurrentPageIndex(newPages.length - 1);
    alert(`已创建新页面: ${title}`);
  };

  const items = getItems(currentPage);

  return (
    <div>
      <ConfigPanel
        pages={editablePages}
        currentPageIndex={currentPageIndex}
        onSelectPage={setCurrentPageIndex}
        onSave={handleSave}
        onDuplicate={handleDuplicate}
        onAddNew={handleAddNew}
        onReset={resetToDefault}
      />

      <div>
        {editablePages.map((page, pageIdx) => {
          const pageItems = getItems(page);
          const isCurrent = pageIdx === currentPageIndex;

          return (
            <div key={pageIdx} className={isCurrent ? '' : 'print:hidden'}>
              <A4Page className="px-8" title={page.title} footer={page.title}>
                <div className="flex flex-1 flex-wrap gap-y-4 m-auto content-center items-center justify-center">
                  {pageItems.map((item, idx) => (
                    <PinyinChar
                      size={SIZE} strokeColor={COLOR}
                      key={idx}
                      char={item.char || ''}
                      pinyin={item.pinyin || ''}
                      onChange={({ char, pinyin }) => {
                        if (isCurrent) {
                          handleItemChange(idx, { char, pinyin });
                        }
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
