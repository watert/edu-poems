import React from 'react';

interface PinyinCharProps {
  pinyin?: string;
  char?: string;
  size?: number;
  strokeColor?: string;
}

/**
 * 拼音格子组件 (四线三格)
 */
const PinyinBox = ({ text, size, strokeColor = "#FF0000" }: { text: string; size: number; strokeColor?: string }) => {
  const height = Math.round(size * 0.4);
  const dashArray = "3 2";

  return (
    <svg width={size} height={height} viewBox={`0 0 ${size} ${height}`} style={{ display: 'block' }}>
      {/* 外框 */}
      <rect x="0.5" y="0.5" width={size - 1} height={height - 1} fill="none" stroke={strokeColor} strokeWidth="1" />
      {/* 内部虚线 */}
      <line x1="0" y1={height / 3} x2={size} y2={height / 3} stroke={strokeColor} strokeDasharray={dashArray} strokeWidth="0.5" />
      <line x1="0" y1={(height / 3) * 2} x2={size} y2={(height / 3) * 2} stroke={strokeColor} strokeDasharray={dashArray} strokeWidth="0.5" />
      {/* 文本 */}
      <text
        x="50%" y="42%" fill="#333"
        textAnchor="middle" dominantBaseline="central"
        fontSize={height * 0.65} fontWeight={500}
      >
        {text}
      </text>
    </svg>
  );
};

/**
 * 田字格组件 (米字虚线)
 */
const CharBox = ({ char, size, strokeColor = "#FF0000" }: { char: string; size: number; strokeColor?: string }) => {
  const dashArray = "4 3";

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
      {/* 外框 */}
      <rect x="0.5" y="0.5" width={size - 1} height={size - 1} fill="none" stroke={strokeColor} strokeWidth="1" />
      {/* 十字虚线 */}
      <line x1={size / 2} y1="0.5" x2={size / 2} y2={size - 0.5} stroke={strokeColor} strokeDasharray={dashArray} />
      <line x1="0.5" y1={size / 2} x2={size - 0.5} y2={size / 2} stroke={strokeColor} strokeDasharray={dashArray} />
      {/* 米字斜虚线 */}
      <line x1="0" y1="0" x2={size} y2={size} stroke={strokeColor} strokeDasharray={dashArray} opacity="0.4" />
      <line x1={size} y1="0" x2="0" y2={size} stroke={strokeColor} strokeDasharray={dashArray} opacity="0.4" />
      {/* 汉字 */}
      <text
        x="50%"
        y="50%"
        dy=".1em"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize={size * 0.8} fontWeight={600}
        fontFamily="'KaiTi', 'Kai', 'STKaiti', 'SimKai', serif"
        fill="#000"
      >
        {char}
      </text>
    </svg>
  );
};

/**
 * 主组件: PinyinChar
 */
export const PinyinChar: React.FC<PinyinCharProps> = ({ 
  pinyin = "", 
  char = "", 
  size = 48,
  strokeColor = "#F66"
}) => {
  return (
    <div className='flex flex-col items-center -ml-[1px]'>
      <div className='-mb-[1px]'>
        <PinyinBox text={pinyin} size={Math.ceil(size * 1.33)} strokeColor={strokeColor} />
      </div>
      <CharBox char={char.slice(0, 1)} size={size} strokeColor={strokeColor} />
    </div>
  );
};