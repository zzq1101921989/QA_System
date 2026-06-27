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
}

export const ChatArea: React.FC<ChatAreaProps> = ({ messages }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 space-y-6 md:space-y-8"
    >
      <AnimatePresence initial={false}>
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "flex gap-3 md:gap-4 max-w-4xl",
              msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
            )}
          >
            <div className={cn(
              "w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center flex-shrink-0 border",
              msg.role === 'user' 
                ? "bg-zinc-800 border-zinc-700" 
                : "bg-lab-accent/10 border-lab-accent/20"
            )}>
              {msg.role === 'user' ? (
                <span className="text-[10px] md:text-xs font-bold text-zinc-400">访客</span>
              ) : (
                <Database className="w-4 h-4 md:w-5 md:h-5 text-lab-accent" />
              )}
            </div>
            <div className={cn(
              "flex flex-col gap-2 max-w-[85%] md:max-w-none",
              msg.role === 'user' ? "items-end" : ""
            )}>
              <div className={cn(
                "p-3 md:p-4 rounded-2xl text-xs md:text-sm leading-relaxed",
                msg.role === 'user' 
                  ? "bg-zinc-800 text-white rounded-tr-none" 
                  : "bg-lab-panel text-zinc-200 border border-lab-border rounded-tl-none"
              )}>
                {msg.content}
              </div>
              {msg.sources && msg.sources.length > 0 && (
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-[9px] md:text-[10px] font-bold text-zinc-500 uppercase">参考来源:</span>
                  {msg.sources.map((s, i) => (
                    <div key={i} className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-[8px] md:text-[9px] text-zinc-400 font-mono italic">
                      <FileText className="w-3 h-3" />
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
