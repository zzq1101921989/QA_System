import React, { useState } from 'react';
import { 
  BookOpen, Plus, Trash2, BookText, Loader2, Sparkles, ArrowRight, 
  Clock, Calendar, LayoutGrid, Settings, LogOut, ChevronRight,
  Trophy, CheckCircle2, Star, Zap, Target, Flame, GraduationCap,
  TrendingUp, Compass, StickyNote, PenTool, Highlighter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDocuments } from '../../hooks/useDocuments';
import { UploadModal } from '../Chat/common/UploadModal';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Document } from '../../types/chat';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 假数据：学习统计
const MOCK_STATS = [
  { label: '累计时长', value: '12.5', unit: 'h', icon: Clock, color: 'text-lab-accent', bg: 'bg-[#E8F3F4]' },
  { label: '连续打卡', value: '7', unit: '天', icon: Flame, color: 'text-lab-accent2', bg: 'bg-[#FEF3EB]' },
  { label: '已读课本', value: '4', unit: '本', icon: BookOpen, color: 'text-lab-warning', bg: 'bg-[#FFF9E6]' },
];

// 假数据：成就勋章
const MOCK_ACHIEVEMENTS = [
  { icon: Zap, label: '初露锋芒', color: 'text-yellow-500', bg: 'bg-yellow-50', rotate: '-6deg' },
  { icon: Star, label: '知识达人', color: 'text-blue-500', bg: 'bg-blue-50', rotate: '4deg' },
  { icon: Trophy, label: '学习标兵', color: 'text-purple-500', bg: 'bg-purple-50', rotate: '-3deg' },
];

// 假数据：每日任务
const MOCK_TASKS = [
  { id: 1, text: '阅读《语文》第4页', completed: true },
  { id: 2, text: '向精灵提问一个问题', completed: false },
  { id: 3, text: '坚持学习 30 分钟', completed: false },
];

interface DocumentsPageProps {
  defaultTab?: 'dashboard' | 'shelf' | 'settings';
}

const DocumentsPage: React.FC<DocumentsPageProps> = ({ defaultTab = 'dashboard' }) => {
  const {
    documents,
    isUploading,
    uploadProgress,
    handleFileUpload,
    deleteDocument,
  } = useDocuments();

  const navigate = useNavigate();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<Document | null>(null);

  const handleStudyClick = (docId: string) => {
    navigate(`/study/${docId}`);
  };

  const readyDocs = documents.filter(d => d.status === 'ready');
  const mainDoc = readyDocs[0];
  const otherDocs = readyDocs.slice(1, 5);

  return (
    <div className="flex-1 h-full bg-[#F5F1E9] text-lab-text overflow-hidden font-rounded relative">
      {/* 纸张质感叠加层 */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
      
      {/* 装饰性手绘元素 */}
      <div className="absolute top-10 right-20 w-32 h-32 border-4 border-lab-accent/10 rounded-full border-dashed animate-[spin_20s_linear_infinite] pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-48 h-12 bg-lab-accent2/5 -rotate-3 rounded-full blur-xl pointer-events-none" />

      <div className="h-full overflow-y-auto custom-scrollbar relative z-10">
        <div className="max-w-7xl mx-auto p-8 lg:p-16">
          
          {defaultTab === 'dashboard' ? (
            <div className="space-y-16 animate-in fade-in duration-1000">
              
              {/* 1. 欢迎区：手账页眉风格 */}
              <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b-2 border-lab-text/5 pb-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Highlighter className="w-5 h-5 text-lab-accent2" />
                    <span className="text-xs font-black text-lab-accent2 uppercase tracking-[0.2em]">我的成长手账</span>
                  </div>
                  <h2 className="text-5xl font-black tracking-tight leading-tight">
                    嗨，<span className="relative inline-block">
                      学霸同学
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
                  {/* 统计印章 */}
                  <div className="flex gap-4">
                    {MOCK_STATS.slice(0, 2).map((stat, i) => (
                      <div key={i} className={cn("px-6 py-4 rounded-[2.5rem] flex flex-col items-center justify-center border-2 border-dashed border-lab-text/5", stat.bg)}>
                        <span className="text-2xl font-black">{stat.value}<small className="text-xs ml-0.5">{stat.unit}</small></span>
                        <span className="text-[10px] font-bold text-lab-text/30 uppercase">{stat.label}</span>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => setIsUploadModalOpen(true)}
                    className="w-16 h-16 rounded-full bg-lab-accent text-white flex items-center justify-center shadow-2xl shadow-lab-accent/30 hover:scale-110 active:scale-95 transition-all group"
                  >
                    <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform" />
                  </button>
                </div>
              </header>

              {/* 2. 核心区：自由散落布局 */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                
                {/* 左侧：拍立得高光课本 */}
                <div className="lg:col-span-7 space-y-12">
                  <div className="relative group">
                    {/* 装饰性胶带 */}
                    <div className="absolute top-[-15px] left-1/2 -translate-x-1/2 w-24 h-8 bg-lab-accent/20 rotate-1 z-20 backdrop-blur-sm border border-white/30" />
                    
                    {mainDoc ? (
                      <div 
                        onClick={() => handleStudyClick(mainDoc.id)}
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
                        <button onClick={() => setIsUploadModalOpen(true)} className="mt-6 text-lab-accent font-black border-b-2 border-lab-accent pb-1">点击去选一本吧</button>
                      </div>
                    )}
                  </div>

                  {/* 其他课本：小标签风格 */}
                  <div className="space-y-6">
                    <h4 className="text-sm font-black text-lab-text/30 uppercase tracking-[0.2em] px-2">最近读过</h4>
                    <div className="flex flex-wrap gap-4">
                      {otherDocs.map((doc, i) => (
                        <div 
                          key={doc.id}
                          onClick={() => handleStudyClick(doc.id)}
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

                {/* 右侧：便利贴 & 勋章 */}
                <div className="lg:col-span-5 space-y-12">
                  
                  {/* 每日挑战：便利贴风格 */}
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

                  {/* 成就墙：手绘贴纸风格 */}
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

                  {/* 精灵语录：便条风格 */}
                  <div className="bg-lab-accent/10 p-8 rounded-[3rem] border-2 border-lab-accent/20 relative overflow-hidden group">
                    <div className="relative z-10 space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                         <img src="/gumda.png" className="w-8 h-8 object-cover" alt="精灵" />
                      </div>
                      <p className="text-md font-bold leading-relaxed text-lab-accent italic">
                        “书本是通往未来的梯子，每爬上一级，你都能看到更广阔的风景。”
                      </p>
                    </div>
                    <Sparkles className="absolute bottom-4 right-8 w-12 h-12 text-lab-accent/10 group-hover:scale-125 transition-transform duration-700" />
                  </div>
                </div>

              </div>

            </div>
          ) : defaultTab === 'shelf' ? (
            <div className="space-y-12 animate-in fade-in duration-700">
              <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b-2 border-lab-text/5 pb-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-lab-accent" />
                    <span className="text-xs font-black text-lab-accent uppercase tracking-[0.2em]">课本大本营</span>
                  </div>
                  <h2 className="text-5xl font-black tracking-tight">我的<span className="text-lab-accent">学习书架</span></h2>
                  <p className="text-lab-text/40 text-lg font-bold">每一本书都是一个待发现的新世界。</p>
                </div>
                <button 
                  onClick={() => setIsUploadModalOpen(true)}
                  className="px-10 py-5 rounded-[2.5rem] bg-lab-accent text-white font-black hover:bg-lab-accent/90 transition-all shadow-2xl shadow-lab-accent/20 active:scale-95 flex items-center gap-3"
                >
                  <Plus className="w-6 h-6" />
                  <span>翻开新篇章</span>
                </button>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                {documents.map((doc, i) => (
                  <div
                    key={doc.id}
                    className={cn(
                      "group bg-white p-8 shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer border-b-8",
                      i % 3 === 0 ? "border-lab-accent -rotate-1" : i % 3 === 1 ? "border-lab-accent2 rotate-1" : "border-lab-warning rotate-[-0.5deg]"
                    )}
                    onClick={() => doc.status === 'ready' && handleStudyClick(doc.id)}
                  >
                    <div className="flex items-start justify-between w-full mb-8">
                      <div className="w-16 h-16 rounded-2xl bg-lab-bg flex items-center justify-center text-lab-text/20 group-hover:bg-lab-accent group-hover:text-white transition-all duration-500">
                        <BookText className="w-8 h-8" />
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDocToDelete(doc);
                        }}
                        className="p-3 text-lab-text/10 hover:text-red-400 hover:bg-red-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <h3 className="text-2xl font-black text-lab-text line-clamp-2 mb-6 group-hover:text-lab-accent transition-colors leading-tight min-h-[4rem]">
                      {doc.name}
                    </h3>

                    {doc.status === 'processing' && (
                      <div className="space-y-3 my-8">
                        <div className="flex justify-between items-center text-[10px] font-black text-lab-text/30 uppercase tracking-widest">
                          <span>精灵正在翻阅中...</span>
                          <span>{Math.round(uploadProgress)}%</span>
                        </div>
                        <div className="w-full bg-lab-bg rounded-full h-2 overflow-hidden">
                          <motion.div 
                            className="h-full bg-lab-accent rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-auto pt-6 flex items-center justify-between border-t border-lab-text/5">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-lab-text/20 font-black uppercase tracking-widest mb-1">入架日期</span>
                        <span className="text-xs text-lab-text/40 font-bold">
                          {new Date(doc.createdAt).toLocaleDateString('zh-CN')}
                        </span>
                      </div>
                      
                      {doc.status === 'ready' ? (
                        <div className="flex items-center gap-2 text-lab-accent font-black text-sm group-hover:translate-x-1 transition-transform">
                          <span>去探索</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-amber-500 text-xs font-black uppercase tracking-widest">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>准备中</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-40 animate-in fade-in duration-1000">
              <div className="w-32 h-32 rounded-full border-4 border-dashed border-lab-text/5 flex items-center justify-center mb-10 rotate-12">
                <Settings className="w-12 h-12 text-lab-text/10" />
              </div>
              <h2 className="text-4xl font-black">设置中心</h2>
              <p className="mt-4 font-bold text-lab-text/30 italic">这里还在装修中，精灵晚点再来哦～</p>
            </div>
          )}
        </div>
      </div>

      <UploadModal 
        documents={documents}
        uploadProgress={uploadProgress}
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleFileUpload}
        isUploading={isUploading}
      />

      <AnimatePresence>
        {docToDelete && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDocToDelete(null)}
              className="absolute inset-0 bg-lab-text/30 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative w-full max-w-md bg-white p-12 shadow-2xl overflow-hidden"
              style={{ transform: 'rotate(1deg)' }}
            >
              <div className="absolute top-[-5px] left-1/2 -translate-x-1/2 w-24 h-6 bg-red-400/20 backdrop-blur-sm" />
              <div className="flex flex-col items-center text-center space-y-8">
                <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center border-4 border-white shadow-lg">
                  <Trash2 className="w-10 h-10 text-red-400" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-3xl font-black text-lab-text">要收起这本课本吗？</h3>
                  <p className="text-lab-text/40 font-bold leading-relaxed">
                    确定要把 <span className="text-lab-text">"{docToDelete.name}"</span> 移出书架吗？相关的学习印章也会暂时收起来哦。
                  </p>
                </div>
                <div className="flex w-full gap-4">
                  <button
                    onClick={() => setDocToDelete(null)}
                    className="flex-1 py-5 px-6 bg-lab-bg text-lab-text/30 font-black hover:bg-lab-border transition-all text-xs uppercase tracking-widest"
                  >
                    再读一会儿
                  </button>
                  <button
                    onClick={() => {
                      deleteDocument(docToDelete.id);
                      setDocToDelete(null);
                    }}
                    className="flex-1 py-5 px-6 bg-red-400 text-white font-black hover:bg-red-500 transition-all shadow-xl shadow-red-400/30 text-xs uppercase tracking-widest"
                  >
                    确认移出
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DocumentsPage;
