import _ from "lodash";
import { A4Page } from "../components/A4Page";
import { PinyinChar } from "../components/PinyinChar";
import { convertPinyinTones } from "../convertPinyinTones";

const chars = '一二三上口耳目手日火田禾六七八十九王午下去年了子大人可叶东西竹马牙用几四小鸟是天女开关先云雨虫山水力男土木心尺本刀不少中五风立正工厂门卫月儿头里见在我左右和也又才爸妈比巴长公只个多石出来半你有牛羊果白'.split('');
const pinyins = 'yi1,er4,san1,shang4,kou3,er3,mu4,shou3,ri4,huo3,tian2,he2,liu4,qi1,ba1,jiu3,shi2,wang2,wu3,xia4,qu4,nian2,le5,zi3,da4,ren2,ke3,ye4,dong1,xi1,zhu2,ma3,ya2,yong4,ji3,si4,xiao3,niao3,shi4,tian1,nv3,kai1,guan1,xian1,yun2,yu3,chong2,shan1,shui3,li4,nan2,tu3,mu4,xin1,chi3,ben3,dao1,bu4,shao3,zhong1,wu3,feng1,li4,zheng4,gong1,chang3,men2,wei4,yue4,er2,tou2,li3,jian4,zai4,wo3,zuo3,you4,he2,ye3,you4,cai2,ba4,ma1,bi3,ba1,chang2,gong1,zhi3,ge4,duo1,shi2,chu1,lai2,ban4,ni3,you3,niu2,yang2,guo3,bai2'.split(',');
const SIZE = 64;
const COLOR = "#AAA";
export function PageCharQuiz({}) {
  const pages = [
    { title: '一年级上 汉字 1', type: 'char', value: '一,二,三,上,口,耳,目,手,日,火,田,禾,六,七,八,十,九,王,午,下,去,年,了,子,大,人,可,叶,东,西,竹,马,牙,用,几,四,小,鸟,是,天,女,开,关,先,云,雨,虫,山,水,力'},
    { title: '一年级上 汉字 2', type: 'char', value: '男,土,木,心,尺,本,刀,不,少,中,五,风,立,正,工,厂,门,卫,月,儿,头,里,见,在,我,左,右,和,也,又,才,爸,妈,比,巴,长,公,只,个,多,石,出,来,半,你,有,牛,羊,果,白'},
    { title: '一年级上 拼音 1', type: 'pinyin', value: 'yi1,er4,san1,shang4,kou3,er3,mu4,shou3,ri4,huo3,tian2,he2,liu4,qi1,ba1,jiu3,shi2,wang2,wu3,xia4,qu4,nian2,le5,zi3,da4,ren2,ke3,ye4,dong1,xi1,zhu2,ma3,ya2,yong4,ji3,si4,xiao3,niao3,shi4,tian1,nv3,kai1,guan1,xian1,yun2,yu3,chong2,shan1,shui3,li4'},
    { title: '一年级上 拼音 2', type: 'pinyin', value: 'nan2,tu3,mu4,xin1,chi3,ben3,dao1,bu4,shao3,zhong1,wu3,feng1,li4,zheng4,gong1,chang3,men2,wei4,yue4,er2,tou2,li3,jian4,zai4,wo3,zuo3,you4,he2,ye3,you4,cai2,ba4,ma1,bi3,ba1,chang2,gong1,zhi3,ge4,duo1,shi2,chu1,lai2,ban4,ni3,you3,niu2,yang2,guo3,bai2'}, 
  ];
  return <div>
    {pages.map((page, index) => {
      const items = page.value.split(',');
      return <A4Page className="px-8" key={index} title={page.title} footer={page.title}>
        <div className="flex flex-1 flex-wrap gap-y-4 m-auto content-center items-center justify-center">
          {items.map((item, index) => {
            const isPinyin = page.type === 'pinyin';
            if (isPinyin) {
              item = convertPinyinTones(item);
            }
            const char = isPinyin ? '' : item;
            const pinyin = isPinyin ? item : '';
            return <PinyinChar
              size={SIZE} strokeColor={COLOR}
              key={index} char={char} pinyin={pinyin}
            />;
          })}
          {_.range(64 - items.length).map((_, index) => (
            <PinyinChar
              size={SIZE} strokeColor={COLOR}
              key={index} char="" pinyin=""
            />
          ))}
        </div>
      </A4Page>;
    })}
    {/* <A4Page className="flex flex-wrap gap-y-4">
      {chars.map((char, index) => (
        <PinyinChar size={SIZE} strokeColor={COLOR} key={index} char={char} />
      ))}
      {pinyins.map((pinyin, index) => (
        <PinyinChar size={SIZE} strokeColor={COLOR} key={index} pinyin={convertPinyinTones(pinyin)} />
      ))}
    </A4Page> */}
  </div>;
}