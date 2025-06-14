
export function splitBy(arr: any[], by: any, opts = { excludeSplitter: false }) {
  return arr.reduce((acc: { result: any[]; lastIdx: number; }, item, idx) => {
    let { result, lastIdx } = acc;
    const isLast = idx === (arr.length - 1);
    if (by(item)) { // is heading
      // console.log('by', item.raw, arr.slice(lastIdx, isLast ? undefined : idx + 1).map(r => r.raw))
      result.push(arr.slice(lastIdx, isLast ? undefined : idx));
      lastIdx = idx + 1;
      if (!opts.excludeSplitter) {
        result.push([item]);
      }
      // return { result, lastIdx };
    }
    if (isLast) {
      result.push(arr.slice(lastIdx));
    }
    return { result, lastIdx };
  }, { result: [] as any[], lastIdx: 0 }).result;
}
