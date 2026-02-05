import React from 'react';

const programs = [
  { time: '٠٠', name: 'تحت الإنشاء' },
  { time: '٠١', name: 'تحت الإنشاء' },
  { time: '٠٢', name: 'تحت الإنشاء' },
  { time: '٠٣', name: 'تحت الإنشاء' },
  { time: '٠٤', name: 'تحت الإنشاء' },
  { time: '٠٥', name: 'تحت الإنشاء' },
];

const ScheduleView: React.FC = () => {
  return (
    <div className="h-full w-full flex flex-col pt-6 px-4 md:px-0 font-readex overflow-hidden">
      <div className="mb-8 border-r-4 border-[#9d7902] pr-6 shrink-0">
        <h2 className="text-2xl md:text-4xl font-black text-white tracking-tighter">جدول البرامج</h2>
        <p className="text-[#9d7902] text-xs md:text-lg font-bold mt-2">خارطة الأثير اليومية</p>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {programs.map((prog, idx) => (
            <div 
              key={idx} 
              className="group relative flex items-center justify-between border border-white/5 rounded-3xl p-6 transition-all backdrop-blur-md"
            >
              <div className="flex items-center gap-6">
                <div className="text-2xl font-black text-[#9d7902]/40 group-hover:text-[#9d7902] transition-colors">
                  {prog.time}
                </div>
                <div className="flex flex-col">
                  <h3 className="text-xl md:text-2xl font-bold text-slate-200">
                    {prog.name}
                  </h3>
                  <span className="text-slate-500 text-xs mt-1">قريباً بإذن الله</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScheduleView;