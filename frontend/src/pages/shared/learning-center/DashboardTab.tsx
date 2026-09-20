import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, BookText, CheckCircle2, Clock, PenTool, Plus, Sparkles, Trophy, Highlighter } from 'lucide-react';
import type { Document } from '../../../types/chat';
import { cn } from '../../../utils/cn';
import { MOCK_ACHIEVEMENTS, MOCK_STATS, MOCK_TASKS } from './mockData';

interface DashboardTabProps {
  mainDoc?: Document;
  otherDocs: Document[];
  onStudy: (docId: string) => void;
  onOpenUpload: () => void;
}

const DashboardTab: React.FC<DashboardTabProps> = ({
  mainDoc,
  otherDocs,
  onStudy,
  onOpenUpload,
}) => {
  return (
    <div className="space-y-16 animate-in fade-in duration-1000">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b-2 border-lab-text/5 pb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Highlighter className="w-5 h-5 text-lab-accent2" />
            <span className="text-xs font-black text-lab-accent2 uppercase tracking-[0.2em]">我的成长手账</span>
          </div>
          <h2 className="text-5xl font-black tracking-tight leading-tight">
            嗨，<span className="relative inline-block">
              小詹同学
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="absolute bottom-2 left-0 h-3 bg-lab-accent/20 -z-10"
              />
            </span>！✨
          </h2>
          <p className="text-lab-text/40 text-lg font-bold">
            今天想在哪个知识海洋里遨游呢？
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex gap-4">
            {MOCK_STATS.slice(0, 2).map((stat, i) => (
              <div key={i} className={cn("px-6 py-4 rounded-[2.5rem] flex flex-col items-center justify-center border-2 border-dashed border-lab-text/5", stat.bg)}>
                <span className="text-2xl font-black">{stat.value}<small className="text-xs ml-0.5">{stat.unit}</small></span>
                <span className="text-[10px] font-bold text-lab-text/30 uppercase">{stat.label}</span>
              </div>
            ))}
          </div>
          <button
            onClick={onOpenUpload}
            className="w-16 h-16 rounded-full bg-lab-accent text-white flex items-center justify-center shadow-2xl shadow-lab-accent/30 hover:scale-110 active:scale-95 transition-all group"
          >
            <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform" />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-7 space-y-12">
          <div className="relative group">
            <div className="absolute top-[-15px] left-1/2 -translate-x-1/2 w-24 h-8 bg-lab-accent/20 rotate-1 z-20 backdrop-blur-sm border border-white/30" />

            {mainDoc ? (
              <div
                onClick={() => onStudy(mainDoc.id)}
                className="bg-white p-6 pb-20 shadow-2xl rotate-[-1deg] hover:rotate-0 transition-all duration-500 cursor-pointer group"
              >
                <div className="aspect-[4/3] w-full bg-[#EAE7DF] rounded-sm overflow-hidden relative">
                  <img
                    src={`https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=cozy_reading_corner_with_books_and_warm_light_cartoon_illustration&image_size=landscape_4_3`}
                    alt="Reading"
                    className="w-full h-full object-cover opacity-80 mix-blend-multiply group-hover:scale-105 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-6 left-8 text-white">
                    <h3 className="text-3xl font-black mb-2">{mainDoc.name}</h3>
                    <div className="flex items-center gap-2 text-xs font-bold opacity-80">
                      <Clock className="w-4 h-4" />
                      <span>上次读到 第 12 页</span>
                    </div>
                  </div>
                </div>
                <div className="mt-8 px-4 flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-xs font-black text-lab-text/20 uppercase tracking-widest">正在探索的领域</p>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-lab-accent rounded-full animate-pulse" />
                      <span className="text-lg font-black text-lab-accent">继续这趟旅程</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-lab-bg flex items-center justify-center group-hover:bg-lab-accent group-hover:text-white transition-colors">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white p-12 text-center border-4 border-dashed border-lab-bg rotate-1">
                <BookOpen className="w-16 h-16 text-lab-text/10 mx-auto mb-6" />
                <h4 className="text-xl font-bold opacity-40">还没选好课本呢</h4>
                <button onClick={onOpenUpload} className="mt-6 text-lab-accent font-black border-b-2 border-lab-accent pb-1">点击去选一本吧</button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <h4 className="text-sm font-black text-lab-text/30 uppercase tracking-[0.2em] px-2">最近读过</h4>
            <div className="flex flex-wrap gap-4">
              {otherDocs.map((doc, i) => (
                <div
                  key={doc.id}
                  onClick={() => onStudy(doc.id)}
                  className={cn(
                    "px-6 py-4 bg-white shadow-md hover:shadow-xl transition-all cursor-pointer flex items-center gap-3 border-b-4",
                    i % 2 === 0 ? "border-lab-accent -rotate-1" : "border-lab-accent2 rotate-1"
                  )}
                >
                  <BookText className="w-4 h-4 text-lab-text/30" />
                  <span className="text-sm font-bold truncate max-w-[150px]">{doc.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-12">
          <div className="relative">
            <div className="absolute top-[-10px] right-4 w-12 h-10 bg-lab-warning/30 -rotate-2 z-10 backdrop-blur-sm" />
            <div className="bg-[#FFF9E6] p-8 shadow-xl rotate-1 min-h-[300px] flex flex-col">
              <h4 className="text-xl font-black mb-8 flex items-center gap-2">
                <PenTool className="w-5 h-5 text-lab-warning" />
                今日小计划
              </h4>
              <div className="space-y-6 flex-1">
                {MOCK_TASKS.map(task => (
                  <div key={task.id} className="flex items-start gap-4 group">
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all mt-0.5",
                      task.completed ? "bg-lab-warning border-lab-warning text-white" : "border-lab-text/10 group-hover:border-lab-warning/30"
                    )}>
                      {task.completed && <CheckCircle2 className="w-4 h-4" />}
                    </div>
                    <span className={cn(
                      "text-md font-bold transition-all",
                      task.completed ? "text-lab-text/20 line-through italic" : "text-lab-text/70"
                    )}>
                      {task.text}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-lab-warning/20 text-xs font-bold text-lab-warning/60 italic text-right">
                —— 记得打勾哦！
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-sm font-black text-lab-text/30 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              荣誉集邮册
            </h4>
            <div className="grid grid-cols-3 gap-6">
              {MOCK_ACHIEVEMENTS.map((ach, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center group cursor-help"
                  style={{ transform: `rotate(${ach.rotate})` }}
                >
                  <div className={cn(
                    "w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all group-hover:scale-110 border-4 border-white",
                    ach.bg
                  )}>
                    <ach.icon className={cn("w-10 h-10", ach.color)} />
                  </div>
                  <span className="mt-3 text-[10px] font-black text-lab-text/40 bg-white px-2 py-0.5 rounded-full shadow-sm">{ach.label}</span>
                </div>
              ))}
              <div className="w-20 h-20 rounded-full border-4 border-dashed border-lab-text/5 flex items-center justify-center text-lab-text/5 rotate-[-5deg]">
                <Plus className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="relative pt-8 group">
            <motion.div
              animate={{
                y: [0, -8, 0],
                rotate: [-8, -6, -8]
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -left-8 z-20 w-30 h-30 flex items-center justify-center group-hover:rotate-0 transition-transform duration-500"
            >
              <div className="absolute inset-4 bg-gradient-to-br from-white to-[#E8F3F4] rounded-[2.5rem] shadow-[0_12px_40px_rgba(127,179,183,0.15)] border-[6px] border-white" />

              <div className="relative w-full h-full p-6 flex items-center justify-center overflow-hidden">
                <img
                  src="/gumda.png"
                  style={{
                    WebkitMaskImage: 'radial-gradient(circle, black 50%, transparent 90%)',
                    maskImage: 'radial-gradient(circle, black 50%, transparent 90%)'
                  }}
                  className="w-full h-full object-contain mix-blend-multiply opacity-95 filter contrast-[1.05]"
                  alt="木木"
                />
              </div>

              <div className="absolute top-2 right-2">
                <Sparkles className="w-6 h-6 text-lab-warning animate-pulse" />
              </div>
            </motion.div>

            <div className="relative bg-gradient-to-br from-white to-[#E8F3F4] p-10 rounded-[3.5rem] border-2 border-lab-accent/10 shadow-xl shadow-lab-accent/5 overflow-hidden">
              <div className="absolute top-2 left-6 text-8xl font-serif text-lab-accent/5 pointer-events-none select-none">“</div>

              <div className="relative z-10 pl-14 pt-2">
                <p className="text-lg font-black leading-relaxed text-lab-accent/80 italic font-rounded">
                  书本是通往未来的梯子，每爬上一级，你都能看到更广阔的风景。
                </p>
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-1 bg-lab-accent/20 rounded-full" />
                    <span className="text-[10px] font-black text-lab-accent/40 uppercase tracking-[0.2em]">来自木木的鼓励</span>
                  </div>
                  <Sparkles className="w-6 h-6 text-lab-accent/20 animate-pulse" />
                </div>
              </div>

              <div className="absolute bottom-[-10px] left-20 w-6 h-6 bg-white rotate-45 border-r-2 border-b-2 border-lab-accent/10" />

              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-lab-accent/5 rounded-full blur-3xl group-hover:scale-150" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardTab;

