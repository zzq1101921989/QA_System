import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, FileText } from 'lucide-react';
import type { Message } from '../../../types/chat';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ChatAreaProps {
  messages: Message[];
  isAsking?: boolean;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ messages, isAsking }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex-1 relative overflow-hidden bg-lab-bg">
      {/* ── Battle HUD Background Layer ── */}
      <div className="absolute inset-0 z-0">
        <div className="battle-hud-bg" />
        <div className="battle-hud-scanline" />
        <div className="battle-hud-corners" />
        
        {/* 装饰性准星 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 pointer-events-none opacity-[0.02]">
          <div className="absolute inset-0 border-2 border-lab-accent rounded-full animate-[pulse_4s_infinite]" />
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-lab-accent" />
          <div className="absolute top-0 left-1/2 w-[1px] h-full bg-lab-accent" />
        </div>

        {/* 侧边滚动数据流装饰 */}
        <div className="absolute right-4 top-1/4 bottom-1/4 w-[1px] bg-lab-border/20">
          <div className="absolute top-0 left-0 w-4 h-[1px] bg-lab-accent" />
          <div className="absolute bottom-0 left-0 w-4 h-[1px] bg-lab-accent2" />
        </div>

        {/* 战术读数装饰 */}
        <div className="absolute left-10 top-10 pointer-events-none opacity-[0.05] font-mono text-[8px] leading-tight uppercase tracking-widest">
          STATUS: COMBAT_READY<br />
          SYNC: 100%<br />
          ARMOR: 0.85
        </div>
        <div className="absolute right-10 bottom-10 pointer-events-none opacity-[0.05] font-mono text-[8px] leading-tight uppercase tracking-widest text-right">
          GRID_REF: 04-G<br />
          V-LINK: ESTABLISHED<br />
          ENCRYPT: AES-256
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="relative z-10 h-full overflow-y-auto custom-scrollbar p-4 md:p-8 space-y-6 md:space-y-8"
      >
      <AnimatePresence initial={false}>
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
              "flex gap-4 md:gap-6 max-w-5xl group",
              msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
            )}
          >
            <div className={cn(
              "w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center flex-shrink-0 border-2 overflow-hidden transition-transform group-hover:scale-105",
              msg.role === 'user' 
                ? "bg-lab-panel border-lab-border shadow-sm" 
                : "bg-lab-panel border-lab-accent/50 shadow-[0_0_15px_rgba(27,79,156,0.2)]"
            )}>
              {msg.role === 'user' ? (
                <div className="flex flex-col items-center">
                  <span className="text-[8px] font-mono text-lab-accent font-bold">USER</span>
                  <div className="w-4 h-0.5 bg-lab-accent/30 mt-0.5" />
                </div>
              ) : (
                <img 
                  src="/gumda.png" 
                  alt="AI"
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            <div className={cn(
              "flex flex-col gap-2 max-w-[85%] md:max-w-[80%]",
              msg.role === 'user' ? "items-end" : "items-start"
            )}>
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-3 px-1">
                  <span className="text-[10px] font-display font-bold text-lab-accent tracking-[0.15em]">RX-78-2_OS_READOUT</span>
                  <div className="h-[1px] w-12 bg-lab-accent/20" />
                  <span className="text-[9px] font-mono text-lab-text/30 font-medium">ID: {msg.id.slice(-6)}</span>
                </div>
              )}

              <div className={cn(
                "p-4 md:p-5 text-xs md:text-sm leading-relaxed whitespace-pre-wrap transition-all hud-card hud-notch font-sans font-medium tracking-wide",
                msg.role === 'user' 
                  ? "bg-lab-panel/80 text-lab-text border-lab-accent/10" 
                  : "bg-lab-panel text-lab-text/90 border-lab-accent/30 hud-border-accent"
              )}>
                {msg.content}
              </div>

              {msg.sources && msg.sources.length > 0 && (
                <div className="flex flex-wrap gap-2 items-center px-1">
                  <div className="flex items-center gap-1.5 py-1">
                    <Database className="w-3 h-3 text-lab-warning" />
                    <span className="text-[9px] font-display font-bold text-lab-text/40 uppercase tracking-widest">Data_Assets_Linked:</span>
                  </div>
                  {msg.sources.map((s, i) => (
                    <div key={i} className="flex items-center gap-1.5 px-2 py-0.5 bg-lab-accent/5 border border-lab-accent/10 text-[9px] text-lab-accent font-display font-bold italic hud-notch transition-colors hover:bg-lab-accent/10">
                      <FileText className="w-3 h-3" />
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}
        {isAsking && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 md:gap-4 max-w-4xl"
          >
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center flex-shrink-0 border border-lab-warning/50 overflow-hidden bg-lab-panel shadow-sm">
              <img 
                src="/gumda.png" 
                alt="AI"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col gap-2">
              <div className="p-3 md:p-4 rounded-2xl text-xs md:text-sm leading-relaxed bg-lab-bubble-ai text-lab-bubble-ai-text rounded-tl-none flex items-center gap-2 font-sans font-medium tracking-wide">
                <span className="text-lab-bubble-ai-text/60 italic">AI 正在思考</span>
                <div className="flex gap-1">
                  <motion.div 
                    animate={{ opacity: [0.4, 1, 0.4] }} 
                    transition={{ repeat: Infinity, duration: 1.5, delay: 0 }}
                    className="w-1.5 h-1.5 rounded-full bg-lab-warning shadow-[0_0_4px_var(--clab-warning)]" 
                  />
                  <motion.div 
                    animate={{ opacity: [0.4, 1, 0.4] }} 
                    transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
                    className="w-1.5 h-1.5 rounded-full bg-lab-accent2 shadow-[0_0_4px_var(--clab-accent2)]" 
                  />
                  <motion.div 
                    animate={{ opacity: [0.4, 1, 0.4] }} 
                    transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}
                    className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_4px_#fff]" 
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </div>
);
};
