import _, { range } from "lodash";
import { useState, useEffect } from "react";
import { A4Page } from "../components/A4Page";
import { PinyinChar, type NavigationEvent } from "../components/PinyinChar";
import { convertPinyinTones } from "../convertPinyinTones";
import { useCharQuizDocs, type NormalizedDocData, type PageItem, type DocTitleItem } from "../services/char-quiz-store";

const SIZE = 64;
const COLOR = "#AAA";

function ConfigPanel({
  docTitles,
  currentDocTitle,
  isModified,
  onSelectDoc,
  onSave,
  onSaveAs,
  onAddNew,
  onReset,
}: {
  docTitles: DocTitleItem[];
  currentDocTitle: string;
  isModified: boolean;
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
            {docTitles.map(item => (
              <option key={item.id} value={item.title}>{item.title}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={onSave} 
            className={`px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 ${!isModified ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!isModified}
          >
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
  const [editableDoc, setEditableDoc] = useState<NormalizedDocData>(currentDoc);
  const [isModified, setIsModified] = useState(false);

  useEffect(() => { setEditableDoc(currentDoc); }, [currentDoc]);

  // 比较两个文档是否相同
  const compareDocs = (doc1: NormalizedDocData, doc2: NormalizedDocData): boolean => {
    return JSON.stringify(doc1) === JSON.stringify(doc2);
  };

  // 当 editableDoc 变化时，更新 isModified 状态
  useEffect(() => {
    setIsModified(!compareDocs(currentDoc, editableDoc));
  }, [editableDoc, currentDoc]);

  const handleItemChange = (pageIndex: number, itemIndex: number, newItem: PageItem) => {
    const newDoc = [...editableDoc];
    const page = { ...newDoc[pageIndex] };
    page.items = [...page.items];
    
    // 确保数组长度足够，避免产生空洞
    while (page.items.length <= itemIndex) {
      page.items.push({});
    }
    
    const chars = newItem.char || '';
    const pinyin = newItem.pinyin || '';
    
    if (chars.length > 1) {
      // 处理多个汉字的情况
      for (let i = 0; i < chars.length; i++) {
        const currentIndex = itemIndex + i;
        
        // 确保数组长度足够
        while (page.items.length <= currentIndex) {
          page.items.push({});
        }
        
        // 插入模式：如果当前索引已有数据，将后面的数据后移
        if (i > 0 && (page.items[currentIndex].char || page.items[currentIndex].pinyin)) {
          // 从后往前移动数据，为新数据腾出空间
          for (let j = page.items.length - 1; j > currentIndex; j--) {
            page.items[j] = page.items[j - 1];
          }
        }
        
        // 设置当前位置的字符（只设置字符，拼音保持为空）
        page.items[currentIndex] = { char: chars[i], pinyin: page.items[currentIndex].pinyin };
      }
    } else {
      // 单个字符的情况，直接替换
      page.items[itemIndex] = newItem;
    }
    
    newDoc[pageIndex] = page;
    setEditableDoc(newDoc);
  };

  const handleNavigate = (pageIndex: number, itemIndex: number, event: NavigationEvent) => {
    console.log('Navigate from:', { pageIndex, itemIndex }, 'Event:', event);
    
    // 计算目标格子索引
    let targetIndex = itemIndex;
    
    switch (event.direction) {
      case 'next':
        targetIndex = itemIndex + 1;
        break;
      case 'prev':
        targetIndex = itemIndex - 1;
        break;
      case 'up':
        targetIndex = itemIndex - 8; // 假设 8x8 网格
        break;
      case 'down':
        targetIndex = itemIndex + 8;
        break;
    }
    
    // 检查目标索引是否有效（0-63）
    if (targetIndex >= 0 && targetIndex < 64) {
      // 构建目标格子的选择器
      const selector = `.char-quiz-page-${pageIndex}-item-${targetIndex}`;
      console.log('Trying to select:', selector);
      
      // 查找目标格子的 DOM 元素
      const targetElement = document.querySelector(selector);
      if (targetElement) {
        // 根据导航方向和当前焦点类型确定目标焦点类型
        let targetFocusType = event.focusType;
        if (event.direction === 'up' && event.focusType === 'pinyin') {
          // 从拼音向上导航，目标为汉字
          targetFocusType = 'char';
        } else if (event.direction === 'down' && event.focusType === 'char') {
          // 从汉字向下导航，目标为拼音
          targetFocusType = 'pinyin';
        }
        
        // 根据目标焦点类型找到对应的可点击元素
        let targetPart;
        if (targetFocusType === 'pinyin') {
          targetPart = targetElement.querySelector('.pinyin-part');
        } else {
          targetPart = targetElement.querySelector('.char-part');
        }
        
        if (targetPart) {
          // 找到内部的可点击元素（EditableBox）
          const editableBox = targetPart.querySelector('.cursor-pointer');
          if (editableBox) {
            // 触发点击事件，使其进入编辑状态
            (editableBox as HTMLElement).click();
            console.log('Clicked target cell:', { pageIndex, targetIndex, focusType: targetFocusType });
          }
        }
      }
    }
  };
  // console.log('editableDoc', editableDoc);

  return (
    <div>
      <ConfigPanel
        docTitles={docTitles}
        currentDocTitle={currentDocTitle}
        isModified={isModified}
        onSelectDoc={loadDoc}
        onSave={() => saveCurrentDoc(editableDoc)}
        onSaveAs={(title) => saveDocAs(title, editableDoc)}
        onAddNew={addNewDoc}
        onReset={resetToDefault}
      />

      <div>
        {editableDoc.map((page, pageIdx) => {
          const pageItems = page.items;

          return (
            <A4Page key={pageIdx} className="px-8" title={page.title} footer={page.title}>
              <div className="flex flex-1 flex-wrap gap-y-4 m-auto content-center items-center justify-center">
                {pageItems.map((item, idx) => {
                  // console.log('item', item);
                  const itemIndex = idx;
                  return (
                    <PinyinChar
                      size={SIZE} strokeColor={COLOR}
                      key={idx}
                      className={`char-quiz-cell char-quiz-page-${pageIdx}-item-${itemIndex}`}
                      char={item.char || ''}
                      pinyin={convertPinyinTones(item.pinyin || '')}
                      editPinyin={item.pinyin || ''}
                      onChange={({ char, pinyin }) => {
                        handleItemChange(pageIdx, itemIndex, { char, pinyin });
                      }}
                      onNavigate={(event) => {
                        handleNavigate(pageIdx, itemIndex, event);
                      }}
                    />
                  );
                })}
                {
                  range(64 - pageItems.length).map((_, idx) => {
                  const itemIndex = pageItems.length + idx;
                  return (
                    <PinyinChar
                      size={SIZE} strokeColor={COLOR}
                      key={`empty-${idx}`}
                      className={`char-quiz-cell char-quiz-page-${pageIdx}-item-${itemIndex}`}
                      char=""
                      pinyin=""
                      onChange={({ char, pinyin }) => {
                        handleItemChange(pageIdx, itemIndex, { char, pinyin });
                      }}
                      onNavigate={(event) => {
                        handleNavigate(pageIdx, itemIndex, event);
                      }}
                    />
                  );
                })}
              </div>
            </A4Page>
          );
        })}
      </div>
    </div>
  );
}
