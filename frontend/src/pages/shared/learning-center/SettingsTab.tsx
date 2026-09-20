import React from 'react';
import { Settings } from 'lucide-react';

const SettingsTab: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-40 animate-in fade-in duration-1000">
      <div className="w-32 h-32 rounded-full border-4 border-dashed border-lab-text/5 flex items-center justify-center mb-10 rotate-12">
        <Settings className="w-12 h-12 text-lab-text/10" />
      </div>
      <h2 className="text-4xl font-black">设置中心</h2>
      <p className="mt-4 font-bold text-lab-text/30 italic">这里还在装修中，木木晚点再来哦～</p>
    </div>
  );
};

export default SettingsTab;

