import { useState, useCallback } from "react";

export type PageItem = { pinyin?: string; char?: string };
export type PrevPageData = { title: string; type?: string; value?: string; items?: PageItem[] };
export type DocPagesData = PrevPageData[];
export type DocDataType = 'pinyin-hanzi' | 'hanzi' | 'words';
export type PageData = { id: string; title: string; type: DocDataType; data: DocPagesData };
export type DocData = PageData[];
export type NormalizedPageData = { title: string; items: PageItem[] };
export type NormalizedDocData = NormalizedPageData[];
export type DocTitleItem = { id: string; title: string };
export type StoredDocTitles = (DocTitleItem | string)[];

export function generateId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return (timestamp + random).substring(0, 16);
}

export function normalizePrevPageData(page: PrevPageData): NormalizedPageData {
  if (page.items) return { title: page.title, items: page.items };
  if (page.type === 'pinyin') {
    return { title: page.title, items: (page.value || '').split(',').map(item => ({ pinyin: item || undefined })) };
  }
  if (page.type === 'char') {
    return { title: page.title, items: (page.value || '').split(',').map(item => ({ char: item })) };
  }
  return { title: page.title, items: [] };
}

export function normalizeDocPagesData(doc: DocPagesData): NormalizedDocData {
  return doc.map(normalizePrevPageData);
}

export function normalizePageData(page: PageData): NormalizedDocData {
  if (page.type === 'pinyin-hanzi') {
    return normalizeDocPagesData(page.data);
  }
  return [];
}

export function normalizeDocData(doc: DocData): NormalizedDocData {
  return doc.flatMap(normalizePageData);
}

export const DEFAULT_DOC: DocData = [
  {
    id: 'default',
    title: '默认词库',
    type: 'pinyin-hanzi',
    data: [
      { title: '一年级上 汉字 1', type: 'char', value: '一,二,三,上,口,耳,目,手,日,火,田,禾,六,七,八,十,九,王,午,下,去,年,了,子,大,人,可,叶,东,西,竹,马,牙,用,几,四,小,鸟,是,天,女,开,关,先,云,雨,虫,山,水,力' },
      { title: '一年级上 汉字 2', type: 'char', value: '男,土,木,心,尺,本,刀,不,少,中,五,风,立,正,工,厂,门,卫,月,儿,头,里,见,在,我,左,右,和,也,又,才,爸,妈,比,巴,长,公,只,个,多,石,出,来,半,你,有,牛,羊,果,白' },
      { title: '一年级上 拼音 1', type: 'pinyin', value: 'yi1,er4,san1,shang4,kou3,er3,mu4,shou3,ri4,huo3,tian2,he2,liu4,qi1,ba1,jiu3,shi2,wang2,wu3,xia4,qu4,nian2,le5,zi3,da4,ren2,ke3,ye4,dong1,xi1,zhu2,ma3,ya2,yong4,ji3,si4,xiao3,niao3,shi4,tian1,nv3,kai1,guan1,xian1,yun2,yu3,chong2,shan1,shui3,li4' },
      { title: '一年级上 拼音 2', type: 'pinyin', value: 'nan2,tu3,mu4,xin1,chi3,ben3,dao1,bu4,shao3,zhong1,wu3,feng1,li4,zheng4,gong1,chang3,men2,wei4,yue4,er2,tou2,li3,jian4,zai4,wo3,zuo3,you4,he2,ye3,you4,cai2,ba4,ma1,bi3,ba1,chang2,gong1,zhi3,ge4,duo1,shi2,chu1,lai2,ban4,ni3,you3,niu2,yang2,guo3,bai2' },
      { title: 'Test', items: [{ pinyin: 'yi1', char: '一' }, { pinyin: 'er4' }, { char: '三' }] }
    ]
  }
];

export const DEFAULT_DOC_TITLE = 'Default';

export function useCharQuizDocs() {
  const [docTitles, setDocTitles] = useState<DocTitleItem[]>(() => {
    try {
      const stored = localStorage.getItem('edu-poems-charquiz-docs');
      if (stored) {
        const parsed = JSON.parse(stored) as StoredDocTitles;
        const converted = parsed.map(item => {
          if (typeof item === 'string') {
            return { id: generateId(), title: item };
          }
          return item;
        });
        // 保存转换后的数据回 localStorage
        localStorage.setItem('edu-poems-charquiz-docs', JSON.stringify(converted));
        return converted;
      }
    } catch {}
    return [{ id: 'default', title: DEFAULT_DOC_TITLE }];
  });

  const [currentDocTitle, setCurrentDocTitle] = useState<string>(() => {
    return docTitles[0]?.title || DEFAULT_DOC_TITLE;
  });

  const [currentDoc, setCurrentDoc] = useState<ReturnType<typeof normalizeDocData>>(() => {
    if (currentDocTitle === DEFAULT_DOC_TITLE) return normalizeDocData(DEFAULT_DOC);
    try {
      const stored = localStorage.getItem(`edu-poems-charquiz-${currentDocTitle}`);
      if (stored) return normalizeDocData(JSON.parse(stored));
    } catch {}
    return normalizeDocData(DEFAULT_DOC);
  });

  const saveCurrentDoc = useCallback((doc: NormalizedDocData) => {
    const docId = generateId();
    const docToStore: DocData = [{
      id: docId,
      title: currentDocTitle,
      type: 'pinyin-hanzi',
      data: doc.map(page => ({ title: page.title, items: page.items }))
    }];
    localStorage.setItem(`edu-poems-charquiz-${currentDocTitle}`, JSON.stringify(docToStore));
    setCurrentDoc(normalizeDocData(docToStore));
  }, [currentDocTitle]);

  const saveDocAs = useCallback((newTitle: string, doc: NormalizedDocData) => {
    const docId = generateId();
    const docToStore: DocData = [{
      id: docId,
      title: newTitle,
      type: 'pinyin-hanzi',
      data: doc.map(page => ({ title: page.title, items: page.items }))
    }];
    localStorage.setItem(`edu-poems-charquiz-${newTitle}`, JSON.stringify(docToStore));
    const existingDoc = docTitles.find(item => item.title === newTitle);
    const newDocTitleItem = existingDoc || { id: generateId(), title: newTitle };
    const newTitles = [...new Set([...docTitles.filter(item => item.title !== newTitle), newDocTitleItem])];
    localStorage.setItem('edu-poems-charquiz-docs', JSON.stringify(newTitles));
    setDocTitles(newTitles);
    setCurrentDocTitle(newTitle);
    setCurrentDoc(normalizeDocData(docToStore));
  }, [docTitles]);

  const addNewDoc = useCallback((title: string) => {
    const docId = generateId();
    const newDoc: DocData = [{
      id: docId,
      title,
      type: 'pinyin-hanzi',
      data: [{ title, items: [] }]
    }];
    localStorage.setItem(`edu-poems-charquiz-${title}`, JSON.stringify(newDoc));
    const newDocTitleItem = { id: generateId(), title };
    const newTitles = [...docTitles, newDocTitleItem];
    localStorage.setItem('edu-poems-charquiz-docs', JSON.stringify(newTitles));
    setDocTitles(newTitles);
    setCurrentDocTitle(title);
    setCurrentDoc(normalizeDocData(newDoc));
  }, [docTitles]);

  const loadDoc = useCallback((title: string, id?: string) => {
    if (title === DEFAULT_DOC_TITLE) {
      setCurrentDoc(normalizeDocData(DEFAULT_DOC));
      // 设置默认文档的 ID 到 querystring
      const url = new URL(window.location.href);
      url.searchParams.set('docId', 'default');
      window.history.pushState({}, '', url.toString());
    } else {
      try {
        const stored = localStorage.getItem(`edu-poems-charquiz-${title}`);
        if (stored) {
          const doc = JSON.parse(stored);
          setCurrentDoc(normalizeDocData(doc));
          // 设置文档的 ID 到 querystring
          const docId = id || doc[0]?.id || generateId();
          const url = new URL(window.location.href);
          url.searchParams.set('docId', docId);
          window.history.pushState({}, '', url.toString());
        } else {
          const docId = id || generateId();
          const emptyDoc: DocData = [{
            id: docId,
            title,
            type: 'pinyin-hanzi',
            data: [{ title, items: [] }]
          }];
          setCurrentDoc(normalizeDocData(emptyDoc));
          // 设置文档的 ID 到 querystring
          const url = new URL(window.location.href);
          url.searchParams.set('docId', docId);
          window.history.pushState({}, '', url.toString());
        }
      } catch {
        const docId = id || generateId();
        const emptyDoc: DocData = [{
          id: docId,
          title,
          type: 'pinyin-hanzi',
          data: [{ title, items: [] }]
        }];
        setCurrentDoc(normalizeDocData(emptyDoc));
        // 设置文档的 ID 到 querystring
        const url = new URL(window.location.href);
        url.searchParams.set('docId', docId);
        window.history.pushState({}, '', url.toString());
      }
    }
    setCurrentDocTitle(title);
  }, []);

  // 根据 ID 加载文档
  const loadDocById = useCallback((id: string) => {
    if (id === 'default') {
      loadDoc(DEFAULT_DOC_TITLE);
      return;
    }
    // 遍历所有文档标题，找到对应的文档
    for (const docTitleItem of docTitles) {
      try {
        const stored = localStorage.getItem(`edu-poems-charquiz-${docTitleItem.title}`);
        if (stored) {
          const doc = JSON.parse(stored);
          if (doc[0]?.id === id) {
            loadDoc(docTitleItem.title, id);
            return;
          }
        }
      } catch {
        // 忽略错误
      }
    }
    // 如果没有找到对应 ID 的文档，加载默认文档
    loadDoc(DEFAULT_DOC_TITLE);
  }, [docTitles, loadDoc]);

  const resetToDefault = useCallback(() => {
    docTitles.forEach(t => {
      if (t.title !== DEFAULT_DOC_TITLE) localStorage.removeItem(`edu-poems-charquiz-${t.title}`);
    });
    localStorage.removeItem('edu-poems-charquiz-docs');
    const defaultDocTitle = [{ id: 'default', title: DEFAULT_DOC_TITLE }];
    setDocTitles(defaultDocTitle);
    setCurrentDocTitle(DEFAULT_DOC_TITLE);
    setCurrentDoc(normalizeDocData(DEFAULT_DOC));
  }, [docTitles]);

  return { docTitles, currentDocTitle, currentDoc, saveCurrentDoc, saveDocAs, addNewDoc, loadDoc, loadDocById, resetToDefault };
}
