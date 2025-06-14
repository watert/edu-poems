export function convertPinyinTones(pinyin: string): string {
  const tones: { [key: string]: string[]; } = {
    'a': ['ā', 'á', 'ǎ', 'à', 'a'], 'e': ['ē', 'é', 'ě', 'è', 'e'],
    'i': ['ī', 'í', 'ǐ', 'ì', 'i'], 'o': ['ō', 'ó', 'ǒ', 'ò', 'o'],
    'u': ['ū', 'ú', 'ǔ', 'ù', 'u'], 'v': ['ǖ', 'ǘ', 'ǚ', 'ǜ', 'ü']
  };

  const result: string[] = [];
  pinyin = pinyin.replace(/u:/g, 'v'); // Normalize 'ü'

  for (let i = 0; i < pinyin.length; i++) {
    const char = pinyin[i];
    if (/\d/.test(char)) {
      const toneNum = parseInt(char);
      // 定义拼音声调标注顺序
      const vowelOrder = ['a', 'o', 'e', 'i', 'u', 'v'];
      let targetIndex = -1;
      // 从后往前遍历，找到符合声调标注规则的元音
      for (let j = result.length - 1; j >= 0; j--) {
        const vowelCandidate = result[j].toLowerCase();
        if (vowelCandidate in tones) {
          const currentOrder = vowelOrder.indexOf(vowelCandidate);
          if (targetIndex === -1 || currentOrder < vowelOrder.indexOf(result[targetIndex].toLowerCase())) {
            targetIndex = j;
          }
        }
      }

      if (targetIndex !== -1) {
        const markedVowel = tones[result[targetIndex].toLowerCase()][toneNum - 1];
        result[targetIndex] = result[targetIndex].toLowerCase() === result[targetIndex] ? markedVowel : markedVowel.toUpperCase();
      }
    } else {
      result.push(char);
    }
  }
  return result.join('');
}
