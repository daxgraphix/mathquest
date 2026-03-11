import React, { useState, useEffect, useRef } from 'react';

interface OnScreenKeyboardProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  onSkip?: () => void;
  placeholder?: string;
  disabled?: boolean;
  inputClassName?: string;
  buttonClassName?: string;
}

const OnScreenKeyboard: React.FC<OnScreenKeyboardProps> = ({
  value,
  onChange,
  onSubmit,
  onSkip,
  placeholder = '?',
  disabled = false,
  inputClassName = '',
  buttonClassName = ''
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const numberKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;
      
      // Prevent default for our handled keys to avoid conflicts
      if (e.key === 'Enter' || e.key === 'Backspace' || e.key === 'Escape' || /^\d$/.test(e.key)) {
        e.preventDefault();
      }
      
      if (e.key === 'Enter' && onSubmit) {
        const mockEvent = { preventDefault: () => {} } as React.FormEvent;
        onSubmit(mockEvent);
      } else if (e.key === 'Backspace') {
        onChange(value.slice(0, -1));
        setPressedKey('backspace');
        setTimeout(() => setPressedKey(null), 100);
      } else if (e.key === 'Escape') {
        setIsFocused(false);
        inputRef.current?.blur();
      } else if (/^\d$/.test(e.key)) {
        if (value.length < 10) {
          onChange(value + e.key);
          setPressedKey(e.key);
          setTimeout(() => setPressedKey(null), 100);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [value, onChange, onSubmit, disabled]);

  const handleKeyPress = (key: string) => {
    if (disabled) return;
    
    setPressedKey(key);
    setTimeout(() => setPressedKey(null), 120);

    if (key === 'backspace') {
      onChange(value.slice(0, -1));
    } else if (key === 'clear') {
      onChange('');
    } else if (key === 'submit') {
      // Create a mock event to pass to onSubmit
      const mockEvent = {
        preventDefault: () => {}
      } as React.FormEvent;
      onSubmit?.(mockEvent);
    } else {
      if (value.length < 10) {
        onChange(value + key);
      }
    }
  };

  const handleInputFocus = () => {
    setIsFocused(true);
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      const activeElement = document.activeElement;
      if (activeElement?.closest('.keyboard-wrapper')) {
        return;
      }
      setIsFocused(false);
    }, 150);
  };

  return (
    <div className={`flex flex-col items-center gap-4 w-full max-w-lg mx-auto ${disabled ? 'opacity-60' : ''}`}>
      {/* Input Display */}
      <div className="relative w-full">
        <div className={`
          relative bg-slate-900 rounded-2xl border-3 transition-all duration-300 overflow-hidden
          shadow-2xl
          ${isFocused ? 'border-cyan-400 shadow-lg shadow-cyan-400/30' : 'border-slate-700'}
        `}>
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ''))}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder={placeholder}
            disabled={disabled}
            className={`
              w-full px-8 py-6 text-center text-4xl font-bold tracking-widest
              bg-transparent text-white placeholder-gray-500
              outline-none rounded-2xl font-mono
              ${inputClassName}
            `}
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
          />
          {value && !disabled && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800/80 border border-slate-600 hover:bg-red-500/80 hover:border-red-500 hover:text-white text-gray-400 transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Keyboard Container */}
      <div className={`keyboard-wrapper w-full bg-slate-900/95 rounded-3xl p-4 border border-slate-700/50 shadow-2xl ${disabled ? 'pointer-events-none' : ''}`}>
        {/* Number Row */}
        <div className="grid grid-cols-10 gap-2 mb-3">
          {numberKeys.map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleKeyPress(num)}
              disabled={disabled}
              className={`
                aspect-square rounded-xl font-bold text-2xl
                bg-gradient-to-b from-slate-700 to-slate-800 border-2 border-slate-600
                hover:from-slate-600 hover:to-slate-700 hover:border-slate-500
                active:from-slate-800 active:to-slate-900
                text-white shadow-lg transition-all duration-100
                ${pressedKey === num ? 'scale-95 bg-slate-900 border-slate-500' : 'hover:-translate-y-1 hover:shadow-xl'}
                ${value.includes(num) ? 'ring-2 ring-cyan-400/50' : ''}
                ${buttonClassName}
              `}
            >
              {num}
            </button>
          ))}
        </div>

        {/* Action Row */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleKeyPress('backspace')}
            disabled={disabled}
            className={`
              flex-[2] h-14 rounded-xl font-semibold text-sm
              bg-gradient-to-b from-slate-700 to-slate-800 border-2 border-slate-600
              hover:from-slate-600 hover:to-slate-700 hover:border-slate-500
              active:from-slate-800 active:to-slate-900
              text-gray-300 shadow-lg transition-all duration-100
              ${pressedKey === 'backspace' ? 'scale-95 bg-slate-900' : 'hover:-translate-y-1 hover:shadow-xl'}
              flex items-center justify-center gap-2
              ${buttonClassName}
            `}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 17 4 12 9 7"></polyline>
              <path d="M20 18v-2a4 4 0 0 0-4-4H4"></path>
            </svg>
            BACK
          </button>
          
          <button
            type="button"
            onClick={() => handleKeyPress('clear')}
            disabled={disabled}
            className={`
              flex-1 h-14 rounded-xl font-semibold text-sm
              bg-gradient-to-b from-slate-700 to-slate-800 border-2 border-slate-600
              hover:from-slate-600 hover:to-slate-700 hover:border-slate-500
              active:from-slate-800 active:to-slate-900
              text-gray-300 shadow-lg transition-all duration-100
              ${pressedKey === 'clear' ? 'scale-95 bg-slate-900' : 'hover:-translate-y-1 hover:shadow-xl'}
              ${buttonClassName}
            `}
          >
            CLEAR
          </button>
          
          {onSkip && (
            <button
              type="button"
              onClick={onSkip}
              disabled={disabled}
              className={`
                flex-1 h-14 rounded-xl font-semibold text-sm
                bg-gradient-to-b from-orange-600 to-orange-700 border-2 border-orange-500
                hover:from-orange-500 hover:to-orange-600 hover:border-orange-400
                active:from-orange-700 active:to-orange-800
                text-white shadow-lg transition-all duration-100
                ${buttonClassName}
              `}
            >
              SKIP
            </button>
          )}
          
          <button
            type="button"
            onClick={() => handleKeyPress('submit')}
            disabled={disabled || !value}
            className={`
              flex-[3] h-14 rounded-xl font-bold text-lg
              bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400
              disabled:from-slate-700 disabled:to-slate-800 disabled:opacity-50
              text-white shadow-lg shadow-cyan-500/20 hover:shadow-xl active:scale-95
              transition-all duration-150 flex items-center justify-center gap-2
              ${buttonClassName}
            `}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            SUBMIT
          </button>
        </div>
      </div>

      {/* Hint */}
      {isFocused && !disabled && (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <kbd className="px-2 py-1 bg-slate-800 rounded border border-slate-700 text-gray-400">0-9</kbd>
          <span>type</span>
          <span className="text-slate-600">•</span>
          <kbd className="px-2 py-1 bg-slate-800 rounded border border-slate-700 text-gray-400">Enter</kbd>
          <span>submit</span>
          <span className="text-slate-600">•</span>
          <kbd className="px-2 py-1 bg-slate-800 rounded border border-slate-700 text-gray-400">Esc</kbd>
          <span>unfocus</span>
        </div>
      )}
    </div>
  );
};

export default OnScreenKeyboard;
