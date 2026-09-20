import type { LucideIcon } from 'lucide-react';
import { BookOpen, Clock, Flame, Star, Trophy, Zap } from 'lucide-react';

export interface MockStat {
  label: string;
  value: string;
  unit: string;
  icon: LucideIcon;
  color: string;
  bg: string;
}

export interface MockAchievement {
  icon: LucideIcon;
  label: string;
  color: string;
  bg: string;
  rotate: string;
}

export interface MockTask {
  id: number;
  text: string;
  completed: boolean;
}

export const MOCK_STATS: MockStat[] = [
  { label: '累计时长', value: '12.5', unit: 'h', icon: Clock, color: 'text-lab-accent', bg: 'bg-[#E8F3F4]' },
  { label: '连续打卡', value: '7', unit: '天', icon: Flame, color: 'text-lab-accent2', bg: 'bg-[#FEF3EB]' },
  { label: '已读课本', value: '4', unit: '本', icon: BookOpen, color: 'text-lab-warning', bg: 'bg-[#FFF9E6]' },
];

export const MOCK_ACHIEVEMENTS: MockAchievement[] = [
  { icon: Zap, label: '初露锋芒', color: 'text-yellow-500', bg: 'bg-yellow-50', rotate: '-6deg' },
  { icon: Star, label: '知识达人', color: 'text-blue-500', bg: 'bg-blue-50', rotate: '4deg' },
  { icon: Trophy, label: '学习标兵', color: 'text-purple-500', bg: 'bg-purple-50', rotate: '-3deg' },
];

export const MOCK_TASKS: MockTask[] = [
  { id: 1, text: '阅读《语文》第4页', completed: true },
  { id: 2, text: '向木木提问一个问题', completed: false },
  { id: 3, text: '坚持学习 30 分钟', completed: false },
];

