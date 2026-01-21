import { useState, useCallback } from "react";

export type PageItem = { pinyin?: string; char?: string };
export type PageData = { title: string; type?: string; value?: string; items?: PageItem[] };
export type DocData = PageData[];
export type NormalizedPageData = { title: string; items: PageItem[] };
export type NormalizedDocData = NormalizedPageData[];

export function normalizePageData(page: PageData): NormalizedPageData {
  if (page.items) return { title: page.title, items: page.items };
  if (page.type === 'pinyin') {
    return { title: page.title, items: (page.value || '').split(',').map(item => ({ pinyin: item || undefined })) };
  }
  if (page.type === 'char') {
    return { title: page.title, items: (page.value || '').split(',').map(item => ({ char: item })) };
  }
  return { title: page.title, items: [] };
}

export function normalizeDocData(doc: DocData): NormalizedDocData {
  return doc.map(normalizePageData);
}

export const DEFAULT_DOC: DocData = [
  { title: '一年级上 汉字 1', type: 'char', value: '一,二,三,上,口,耳,目,手,日,火,田,禾,六,七,八,十,九,王,午,下,去,年,了,子,大,人,可,叶,东,西,竹,马,牙,用,几,四,小,鸟,是,天,女,开,关,先,云,雨,虫,山,水,力' },
  { title: '一年级上 汉字 2', type: 'char', value: '男,土,木,心,尺,本,刀,不,少,中,五,风,立,正,工,厂,门,卫,月,儿,头,里,见,在,我,左,右,和,也,又,才,爸,妈,比,巴,长,公,只,个,多,石,出,来,半,你,有,牛,羊,果,白' },
  { title: '一年级上 拼音 1', type: 'pinyin', value: 'yi1,er4,san1,shang4,kou3,er3,mu4,shou3,ri4,huo3,tian2,he2,liu4,qi1,ba1,jiu3,shi2,wang2,wu3,xia4,qu4,nian2,le5,zi3,da4,ren2,ke3,ye4,dong1,xi1,zhu2,ma3,ya2,yong4,ji3,si4,xiao3,niao3,shi4,tian1,nv3,kai1,guan1,xian1,yun2,yu3,chong2,shan1,shui3,li4' },
  { title: '一年级上 拼音 2', type: 'pinyin', value: 'nan2,tu3,mu4,xin1,chi3,ben3,dao1,bu4,shao3,zhong1,wu3,feng1,li4,zheng4,gong1,chang3,men2,wei4,yue4,er2,tou2,li3,jian4,zai4,wo3,zuo3,you4,he2,ye3,you4,cai2,ba4,ma1,bi3,ba1,chang2,gong1,zhi3,ge4,duo1,shi2,chu1,lai2,ban4,ni3,you3,niu2,yang2,guo3,bai2' },
  { title: 'Test', items: [{ pinyin: 'yi1', char: '一' }, { pinyin: 'er4' }, { char: '三' }] }
];

export const DEFAULT_DOC_TITLE = 'Default';

export function useCharQuizDocs() {
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

  const [currentDoc, setCurrentDoc] = useState<ReturnType<typeof normalizeDocData>>(() => {
    if (currentDocTitle === DEFAULT_DOC_TITLE) return normalizeDocData(DEFAULT_DOC);
    try {
      const stored = localStorage.getItem(`edu-poems-charquiz-${currentDocTitle}`);
      if (stored) return normalizeDocData(JSON.parse(stored));
    } catch {}
    return normalizeDocData(DEFAULT_DOC);
  });

  const saveCurrentDoc = useCallback((doc: NormalizedDocData) => {
    localStorage.setItem(`edu-poems-charquiz-${currentDocTitle}`, JSON.stringify(doc));
    setCurrentDoc(doc);
  }, [currentDocTitle]);

  const saveDocAs = useCallback((newTitle: string, doc: NormalizedDocData) => {
    localStorage.setItem(`edu-poems-charquiz-${newTitle}`, JSON.stringify(doc));
    const newTitles = [...new Set([...docTitles, newTitle])];
    localStorage.setItem('edu-poems-charquiz-docs', JSON.stringify(newTitles));
    setDocTitles(newTitles);
    setCurrentDocTitle(newTitle);
  }, [docTitles]);

  const addNewDoc = useCallback((title: string) => {
    const newDoc: NormalizedDocData = [{ title, items: [] }];
    localStorage.setItem(`edu-poems-charquiz-${title}`, JSON.stringify(newDoc));
    const newTitles = [...docTitles, title];
    localStorage.setItem('edu-poems-charquiz-docs', JSON.stringify(newTitles));
    setDocTitles(newTitles);
    setCurrentDocTitle(title);
    setCurrentDoc(newDoc);
  }, [docTitles]);

  const loadDoc = useCallback((title: string) => {
    if (title === DEFAULT_DOC_TITLE) {
      setCurrentDoc(normalizeDocData(DEFAULT_DOC));
    } else {
      try {
        const stored = localStorage.getItem(`edu-poems-charquiz-${title}`);
        if (stored) {
          setCurrentDoc(normalizeDocData(JSON.parse(stored)));
        } else {
          setCurrentDoc([{ title, items: [] }]);
        }
      } catch {
        setCurrentDoc([{ title, items: [] }]);
      }
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
    setCurrentDoc(normalizeDocData(DEFAULT_DOC));
  }, [docTitles]);

  return { docTitles, currentDocTitle, currentDoc, saveCurrentDoc, saveDocAs, addNewDoc, loadDoc, resetToDefault };
}
