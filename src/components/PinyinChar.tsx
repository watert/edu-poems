import React, { useState, useRef, useEffect } from 'react';

interface PinyinCharProps {
  pinyin?: string;
  editPinyin?: string;
  char?: string;
  size?: number;
  strokeColor?: string;
  onChange?: ({ char, pinyin }: { char: string; pinyin: string }) => void;
}

const EditableBox = ({
  displayValue,
  editValue,
  size,
  strokeColor,
  isPinyin,
  onChange,
}: {
  displayValue: string;
  editValue: string;
  size: number;
  strokeColor: string;
  isPinyin: boolean;
  onChange: (val: string) => void;
}) => {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(editValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setInputValue(editValue); }, [editValue]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleSubmit = () => {
    setEditing(false);
    if (inputValue !== editValue) onChange(inputValue);
  };

  const height = Math.round(size * (isPinyin ? 0.4 : 1));

  if (editing) {
    return (
      <div className="relative" style={{ width: size, height }}>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleSubmit}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          className="absolute inset-0 w-full h-full text-center border border-blue-400 rounded outline-none bg-white/90"
          style={{
            fontSize: isPinyin ? height * 0.6 : size * 0.7,
            fontFamily: isPinyin ? undefined : "'KaiTi', 'Kai', 'STKaiti', 'SimKai', serif",
            fontWeight: isPinyin ? 500 : 600,
          }}
        />
      </div>
    );
  }

  return (
    <div
      className="cursor-pointer hover:bg-red-50 rounded transition-colors"
      onClick={() => setEditing(true)}
    >
      {isPinyin ? (
        <svg width={size} height={height} viewBox={`0 0 ${size} ${height}`} style={{ display: 'block' }}>
          <rect x="0.5" y="0.5" width={size - 1} height={height - 1} fill="none" stroke={strokeColor} strokeWidth="1" />
          <line x1="0" y1={height / 3} x2={size} y2={height / 3} stroke={strokeColor} strokeDasharray="3 2" strokeWidth="0.5" />
          <line x1="0" y1={(height / 3) * 2} x2={size} y2={(height / 3) * 2} stroke={strokeColor} strokeDasharray="3 2" strokeWidth="0.5" />
          <text x="50%" y="42%" fill="#333" textAnchor="middle" dominantBaseline="central" fontSize={height * 0.65} fontWeight={500}>{displayValue}</text>
        </svg>
      ) : (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
          <rect x="0.5" y="0.5" width={size - 1} height={size - 1} fill="none" stroke={strokeColor} strokeWidth="1" />
          <line x1={size / 2} y1="0.5" x2={size / 2} y2={size - 0.5} stroke={strokeColor} strokeDasharray="4 3" />
          <line x1="0.5" y1={size / 2} x2={size - 0.5} y2={size / 2} stroke={strokeColor} strokeDasharray="4 3" />
          <line x1="0" y1="0" x2={size} y2={size} stroke={strokeColor} strokeDasharray="4 3" opacity="0.4" />
          <line x1={size} y1="0" x2="0" y2={size} stroke={strokeColor} strokeDasharray="4 3" opacity="0.4" />
          <text x="50%" y="50%" dy=".1em" dominantBaseline="middle" textAnchor="middle" fontSize={size * 0.8} fontWeight={600} fontFamily="'KaiTi', 'Kai', 'STKaiti', 'SimKai', serif" fill="#000">{displayValue}</text>
        </svg>
      )}
    </div>
  );
};

export const PinyinChar: React.FC<PinyinCharProps> = ({
  pinyin = "",
  editPinyin,
  char = "",
  size = 48,
  strokeColor = "#F66",
  onChange,
}) => {
  const handleCharChange = (newChar: string) => {
    onChange?.({ char: newChar.slice(0, 1), pinyin: editPinyin || pinyin });
  };

  const handlePinyinChange = (newPinyin: string) => {
    onChange?.({ char: char.slice(0, 1), pinyin: newPinyin });
  };

  return (
    <div className='flex flex-col items-center -ml-[1px]'>
      <div className='-mb-[1px]'>
        <EditableBox displayValue={pinyin} editValue={editPinyin || pinyin} size={Math.ceil(size * 1.33)} strokeColor={strokeColor} isPinyin={true} onChange={handlePinyinChange} />
      </div>
      <EditableBox displayValue={char.slice(0, 1)} editValue={char.slice(0, 1)} size={size} strokeColor={strokeColor} isPinyin={false} onChange={handleCharChange} />
    </div>
  );
};