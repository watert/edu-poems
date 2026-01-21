import React, { useState, useRef, useEffect } from 'react';

interface PinyinCharProps {
  pinyin?: string;
  editPinyin?: string;
  char?: string;
  size?: number;
  strokeColor?: string;
  onChange?: ({ char, pinyin }: { char: string; pinyin: string }) => void;
  onNavigate?: (event: NavigationEvent) => void;
  className?: string;
}

type NavigationDirection = 'prev' | 'next' | 'up' | 'down';

type NavigationEvent = {
  direction: NavigationDirection;
  focusType: 'pinyin' | 'char';
};

const EditableBox = ({
  displayValue,
  editValue,
  size,
  strokeColor,
  isPinyin,
  onChange,
  onNavigate,
}: {
  displayValue: string;
  editValue: string;
  size: number;
  strokeColor: string;
  isPinyin: boolean;
  onChange: (val: string) => void;
  onNavigate?: (event: NavigationEvent) => void;
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.target as HTMLInputElement;
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    
    // 处理 Tab 键
    if (e.key === 'Tab') {
      e.preventDefault();
      onNavigate?.({
        direction: e.shiftKey ? 'prev' : 'next',
        focusType: isPinyin ? 'pinyin' : 'char',
      });
      return;
    }
    
    // 处理 Enter 键
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
      onNavigate?.({
        direction: 'next',
        focusType: isPinyin ? 'pinyin' : 'char',
      });
      return;
    }
    
    // 检查是否为全选状态（空字符串时不视为全选）
    const isSelectAll = inputValue.length > 0 && start === 0 && end === inputValue.length;
    
    // 处理左右键
    if (e.key === 'ArrowLeft' && start === 0 && !isSelectAll) {
      e.preventDefault();
      onNavigate?.({
        direction: 'prev',
        focusType: isPinyin ? 'pinyin' : 'char',
      });
      return;
    }
    
    if (e.key === 'ArrowRight' && end === inputValue.length && !isSelectAll) {
      e.preventDefault();
      onNavigate?.({
        direction: 'next',
        focusType: isPinyin ? 'pinyin' : 'char',
      });
      return;
    }
    
    // 处理上下键
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      // 如果是上箭头且在汉字部分，切换到拼音部分
      if (e.key === 'ArrowUp' && !isPinyin) {
        // 切换到拼音部分
        const pinyinPart = input.closest('.char-part')?.previousElementSibling as HTMLElement;
        if (pinyinPart) {
          const pinyinBox = pinyinPart.querySelector('.cursor-pointer') as HTMLElement;
          pinyinBox?.click();
        }
      }
      // 如果是下箭头且在拼音部分，切换到汉字部分
      else if (e.key === 'ArrowDown' && isPinyin) {
        // 切换到汉字部分
        const charPart = input.closest('.pinyin-part')?.nextElementSibling as HTMLElement;
        if (charPart) {
          const charBox = charPart.querySelector('.cursor-pointer') as HTMLElement;
          charBox?.click();
        }
      }
      // 否则导航到上下行的格子
      else {
        onNavigate?.({
          direction: e.key === 'ArrowUp' ? 'up' : 'down',
          focusType: isPinyin ? 'pinyin' : 'char',
        });
      }
      return;
    }
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
          onKeyDown={handleKeyDown}
          className="absolute inset-0 w-full h-full text-center border border-blue-400 rounded outline-none bg-white/90 text-black"
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
      className="cursor-pointer hover:bg-green-50 rounded transition-colors"
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

export type { NavigationEvent, NavigationDirection };

export const PinyinChar: React.FC<PinyinCharProps> = ({
  pinyin = "",
  editPinyin,
  char = "",
  size = 48,
  strokeColor = "#F66",
  onChange,
  onNavigate,
  className = "",
}) => {
  const handleCharChange = (newChar: string) => {
    onChange?.({ char: newChar.slice(0, 1), pinyin: editPinyin || pinyin });
  };

  const handlePinyinChange = (newPinyin: string) => {
    onChange?.({ char: char.slice(0, 1), pinyin: newPinyin });
  };

  const handleNavigate = (event: NavigationEvent) => {
    onNavigate?.(event);
  };

  return (
    <div className={`flex flex-col items-center -ml-[1px] ${className}`}>
      <div className='-mb-[1px] pinyin-part'>
        <EditableBox 
          displayValue={pinyin} 
          editValue={editPinyin || pinyin} 
          size={Math.ceil(size * 1.33)} 
          strokeColor={strokeColor} 
          isPinyin={true} 
          onChange={handlePinyinChange}
          onNavigate={handleNavigate}
        />
      </div>
      <div className='char-part'>
        <EditableBox 
          displayValue={char.slice(0, 1)} 
          editValue={char.slice(0, 1)} 
          size={size} 
          strokeColor={strokeColor} 
          isPinyin={false} 
          onChange={handleCharChange}
          onNavigate={handleNavigate}
        />
      </div>
    </div>
  );
};