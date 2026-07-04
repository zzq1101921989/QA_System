import React from 'react';
import { Send } from 'lucide-react';

interface InputBarProps {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  placeholder?: string;
  isMobile?: boolean;
}

export const InputBar: React.FC<InputBarProps> = ({ 
  input, 
  setInput, 
  onSend, 
  placeholder,
  isMobile 
}) => {
  return (
    <div className="p-4 md:p-8 pt-0 flex-shrink-0">
      <div className="max-w-4xl mx-auto relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-lab-accent/20 to-lab-accent2/20 rounded-2xl blur opacity-30 group-focus-within:opacity-100 transition-opacity" />
        <div className="relative flex items-center gap-2 p-2 bg-lab-panel border border-lab-border rounded-2xl focus-within:border-lab-accent/50 transition-all shadow-2xl">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSend()}
            placeholder={placeholder}
            className="flex-1 bg-transparent border-none outline-none px-2 md:px-4 text-xs md:text-sm text-lab-text placeholder:text-lab-text/30"
          />
          <button 
            onClick={onSend}
            disabled={!input.trim()}
            className="w-10 h-10 rounded-xl bg-lab-accent flex items-center justify-center text-lab-bg hover:scale-105 active:scale-95 transition-all disabled:opacity-20 disabled:grayscale disabled:scale-100 flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-2 md:mt-3 flex justify-between px-2">
          <div className="flex gap-2 md:gap-4">
            <span className="text-[8px] md:text-[9px] font-mono text-lab-text/30 uppercase tracking-tighter flex items-center gap-1">
              <div className="w-1 h-1 rounded-full bg-lab-accent" />
              {isMobile ? '24ms' : '响应延迟: 24ms'}
            </span>
            <span className="text-[8px] md:text-[9px] font-mono text-lab-text/30 uppercase tracking-tighter flex items-center gap-1">
              <div className="w-1 h-1 rounded-full bg-lab-accent2" />
              {isMobile ? '1.4k' : 'Token消耗: 1,420/8,192'}
            </span>
          </div>
          {!isMobile && <span className="text-[9px] font-mono text-lab-text/30 uppercase tracking-widest">按下 Enter 发送请求</span>}
        </div>
      </div>
    </div>
  );
};
