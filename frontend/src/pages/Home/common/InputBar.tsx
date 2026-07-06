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
    <div className="p-4 md:p-10 pt-0 flex-shrink-0">
      <div className="max-w-4xl mx-auto relative group">
        {/* 背景战术装饰 */}
        <div className="absolute -top-3 -left-3 w-6 h-6 border-t-2 border-l-2 border-lab-accent/30" />
        <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-2 border-r-2 border-lab-accent2/30" />
        
        <div className="absolute -inset-1 bg-gradient-to-r from-lab-accent/20 via-lab-warning/10 to-lab-accent2/20 rounded-2xl blur-lg opacity-20 group-focus-within:opacity-50 transition-opacity" />
        
        <div className="relative flex flex-col hud-card hud-notch p-1 border-lab-border/60">
          <div className="flex items-center justify-between px-4 py-1.5 border-b border-lab-border/30 bg-lab-bg/30">
            <div className="flex gap-4">
              <span className="text-[8px] font-display text-lab-accent font-bold tracking-tighter uppercase">Console_Input_Active</span>
              <span className="text-[8px] font-display text-lab-text/20 uppercase font-bold">Mode: {placeholder?.includes('针对') ? 'TARGET' : 'SCAN'}</span>
            </div>
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-lab-accent" />
              <div className="w-1 h-1 bg-lab-accent/30" />
              <div className="w-1 h-1 bg-lab-accent/10" />
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-2">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSend()}
              placeholder={placeholder}
              className="flex-1 bg-transparent border-none outline-none px-4 md:px-6 py-3 text-xs md:text-sm text-lab-text placeholder:text-lab-text/20 font-sans font-medium"
            />
            <button 
              onClick={onSend}
              disabled={!input.trim()}
              className="w-12 h-12 rounded-xl bg-lab-warning flex items-center justify-center text-lab-bg hover:scale-105 active:scale-95 transition-all disabled:opacity-10 disabled:grayscale disabled:scale-100 flex-shrink-0 shadow-[0_0_20px_rgba(251,192,45,0.3)]"
            >
              <Send className="w-5 h-5 text-lab-text" />
            </button>
          </div>
        </div>

        <div className="mt-4 flex justify-between px-2">
          <div className="flex gap-6">
            <div className="flex flex-col">
              <span className="text-[7px] font-display text-lab-text/30 uppercase font-bold tracking-wider">Signal_Latency</span>
              <span className="text-[9px] font-mono text-lab-accent font-bold tracking-tight">24.00 MS</span>
            </div>
            <div className="flex flex-col border-l border-lab-border/30 pl-4">
              <span className="text-[7px] font-display text-lab-text/30 uppercase font-bold tracking-wider">Memory_Allocation</span>
              <span className="text-[9px] font-mono text-lab-warning font-bold tracking-tight">1,420 / 8,192 PX</span>
            </div>
          </div>
          {!isMobile && (
            <div className="flex flex-col items-end">
              <span className="text-[7px] font-display text-lab-text/30 uppercase font-bold tracking-wider">Transmission_Key</span>
              <span className="text-[9px] font-mono text-lab-text/40 font-bold uppercase tracking-widest">[ ENTER ]</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
