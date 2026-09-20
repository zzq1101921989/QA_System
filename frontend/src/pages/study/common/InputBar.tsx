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
    <div className="p-4 md:p-8 pt-0 flex-shrink-0 transition-all duration-300">
      <div className="max-w-4xl mx-auto relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-lab-accent/10 via-lab-accent2/10 to-lab-accent/10 rounded-3xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />

        <div className="relative flex flex-col soft-card p-1.5 border-lab-border/80 bg-lab-panel/80 backdrop-blur-md shadow-xl shadow-lab-accent/5 transition-all group-focus-within:border-lab-accent/30 group-focus-within:shadow-lab-accent/10">
          <div className="flex items-center gap-2 p-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSend()}
              placeholder={placeholder || "问问木木吧..."}
              className="flex-1 bg-transparent border-none outline-none px-4 md:px-6 py-4 text-sm md:text-base text-lab-text placeholder:text-lab-text/30 font-rounded font-medium"
            />
            <button
              onClick={onSend}
              disabled={!input.trim()}
              className="w-12 h-12 rounded-2xl bg-lab-accent flex items-center justify-center text-white hover:bg-lab-accent/90 hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale disabled:scale-100 flex-shrink-0 shadow-lg shadow-lab-accent/20"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>

        {!isMobile && (
          <div className="mt-4 flex justify-center">
            <div className="px-4 py-1 rounded-full bg-lab-accent/5 border border-lab-accent/10">
              <span className="text-[10px] text-lab-text/30 font-medium tracking-wide">按下 <span className="font-bold text-lab-text/40">Enter</span> 键发送问题 🚀</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

