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
    <div className="flex-1 relative overflow-hidden bg-transparent min-h-0 transition-colors duration-500">
      {/* ── Background Decoration ── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-lab-accent/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-lab-accent2/5 rounded-full blur-[120px]" />
      </div>

      <div 
        ref={scrollRef}
        className="relative z-10 h-full overflow-y-auto custom-scrollbar p-4 md:p-8 space-y-8 md:space-y-12"
      >
      <AnimatePresence initial={false}>
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "flex gap-4 md:gap-6 max-w-5xl group",
              msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
            )}
          >
            {/* Avatar */}
            <div className={cn(
              "w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border-2 overflow-hidden transition-all group-hover:scale-110 group-hover:rotate-3 shadow-sm",
              msg.role === 'user' 
                ? "bg-lab-panel border-lab-border" 
                : "bg-lab-accent border-lab-accent shadow-lg shadow-lab-accent/20"
            )}>
              {msg.role === 'user' ? (
                <div className="text-lab-accent font-bold text-sm">我</div>
              ) : (
                <img 
                  src="/gumda.png" 
                  alt="AI"
                  className="w-full h-full object-cover opacity-90"
                />
              )}
            </div>

            <div className={cn(
              "flex flex-col gap-2 max-w-[85%] md:max-w-[75%]",
              msg.role === 'user' ? "items-end" : "items-start"
            )}>
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-2 px-1">
                  <span className="text-[11px] font-semibold text-lab-accent/80 tracking-wide">学习精灵</span>
                  <div className="h-1 w-1 rounded-full bg-lab-accent/30" />
                  <span className="text-[10px] text-lab-text/30 font-medium">刚刚</span>
                </div>
              )}

              <div className={cn(
                "p-5 md:p-6 text-sm md:text-base leading-relaxed whitespace-pre-wrap transition-all soft-card font-rounded font-medium tracking-normal",
                msg.role === 'user' 
                  ? "bg-lab-accent2/10 text-lab-text border-lab-accent2/20 rounded-tr-none" 
                  : "bg-lab-panel text-lab-text/90 border-lab-border rounded-tl-none shadow-xl shadow-lab-accent/5"
              )}>
                {msg.content}
              </div>

              {msg.sources && msg.sources.length > 0 && (
                <div className="flex flex-wrap gap-2 items-center px-1 mt-1">
                  <div className="flex items-center gap-1.5 py-1">
                    <Database className="w-3.5 h-3.5 text-lab-accent2" />
                    <span className="text-[10px] font-bold text-lab-text/40 uppercase tracking-wider">知识来源:</span>
                  </div>
                  {msg.sources.map((s, i) => (
                    <div key={i} className="flex items-center gap-1.5 px-3 py-1 bg-lab-panel border border-lab-border text-[10px] text-lab-accent font-semibold rounded-full transition-all hover:border-lab-accent hover:bg-lab-accent/5 cursor-default">
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
            className="flex gap-4 md:gap-6 max-w-4xl"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border-2 border-lab-accent bg-lab-accent overflow-hidden shadow-lg shadow-lab-accent/20 animate-bounce">
              <img 
                src="/gumda.png" 
                alt="AI"
                className="w-full h-full object-cover opacity-90"
              />
            </div>
            <div className="flex flex-col gap-2">
              <div className="p-5 md:p-6 rounded-3xl rounded-tl-none text-sm md:text-base leading-relaxed bg-lab-panel text-lab-text/60 border border-lab-border shadow-md flex items-center gap-3 font-rounded font-medium">
                <span className="italic">正在为你思考中</span>
                <div className="flex gap-1.5">
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.4, 1, 0.4] }} 
                    transition={{ repeat: Infinity, duration: 1.2, delay: 0 }}
                    className="w-2 h-2 rounded-full bg-lab-accent" 
                  />
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.4, 1, 0.4] }} 
                    transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }}
                    className="w-2 h-2 rounded-full bg-lab-accent2" 
                  />
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.4, 1, 0.4] }} 
                    transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }}
                    className="w-2 h-2 rounded-full bg-lab-warning" 
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
