import React, { useRef, useEffect, useState } from 'react';

interface Metadata {
  title: string;
  artist: string;
  album: string;
  art: string;
}

interface BottomBarProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  activeTab: 'player' | 'schedule' | 'about';
  onTabChange: (tab: 'player' | 'schedule' | 'about') => void;
  metadata: Metadata;
  analyser: AnalyserNode | null;
}

const BottomBar: React.FC<BottomBarProps> = ({ 
  isPlaying, 
  onTogglePlay,
  activeTab,
  onTabChange,
  metadata,
  analyser
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(false);
    // Faster trigger for state change
    const t = setTimeout(() => setIsReady(true), 10);
    return () => clearTimeout(t);
  }, [metadata.title, metadata.artist, metadata.album]);

  useEffect(() => {
    if (!canvasRef.current || !analyser || !isPlaying) {
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    let animationId: number;

    const renderWaves = () => {
      animationId = requestAnimationFrame(renderWaves);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = 2;
      const barGap = 2;
      const barCount = Math.floor(canvas.width / (barWidth + barGap));
      
      for (let i = 0; i < barCount; i++) {
        const index = Math.floor((i / barCount) * (bufferLength / 2));
        const val = dataArray[index] || 0;
        const percent = val / 255;
        const barHeight = Math.max(2, percent * canvas.height * 0.9);
        
        ctx.fillStyle = '#9d7902';
        const x = i * (barWidth + barGap);
        const y = (canvas.height - barHeight) / 2;
        
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 1);
        ctx.fill();
      }
    };

    renderWaves();
    return () => cancelAnimationFrame(animationId);
  }, [analyser, isPlaying]);

  return (
    <div className="fixed bottom-6 md:bottom-12 left-0 right-0 z-50 flex justify-center px-4">
      <div className="border border-white/10 rounded-[2.5rem] p-2 md:p-3 shadow-2xl flex items-center justify-between backdrop-blur-3xl relative overflow-visible w-full max-w-2xl">
        
        {/* وحدة التحكم الصوتي الموحدة */}
        <div 
          onClick={() => onTabChange('player')}
          className={`group flex flex-1 items-center gap-3 min-w-0 cursor-pointer p-1 rounded-[2rem] transition-all hover:bg-white/5 ${activeTab === 'player' ? 'bg-white/[0.03]' : ''}`}
        >
          {/* حاوية زر التشغيل */}
          <div className="relative flex flex-col items-center shrink-0">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onTogglePlay();
              }}
              className={`w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-full flex items-center justify-center transition-all duration-500 transform active:scale-95 shadow-lg border border-white/5 ${
                isPlaying 
                  ? 'bg-white/10 text-[#9d7902]' 
                  : 'bg-[#9d7902] text-black shadow-[#9d7902]/20 hover:scale-[1.02]'
              }`}
              aria-label={isPlaying ? "إيقاف" : "تشغيل"}
            >
              {isPlaying ? (
                <svg viewBox="0 0 24 24" className="w-5 h-5 md:w-6 md:h-6 fill-current" xmlns="http://www.w3.org/2000/svg">
                  <rect x="6" y="5" width="3.5" height="14" rx="1.5" />
                  <rect x="14.5" y="5" width="3.5" height="14" rx="1.5" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="w-6 h-6 md:w-7 md:h-7 fill-current transform rotate-180 mr-0.5" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19.58 10.37L7.33 2.1c-.42-.28-.9-.42-1.39-.42-.51 0-1.01.15-1.44.45-.84.58-1.34 1.54-1.34 2.57v14.6c0 1.03.5 1.99 1.34 2.57.43.3 1.01.45 1.52.45.42 0 .83-.1 1.22-.32l12.25-8.27c.7-.47 1.12-1.27 1.12-2.13s-.42-1.66-1.12-2.13z" />
                </svg>
              )}
            </button>
          </div>

          {/* نصوص البث والموجات */}
          <div 
            className="flex flex-col flex-1 min-w-0 overflow-hidden"
            style={{
              transition: 'opacity 0.15s ease-out',
              opacity: isReady ? 1 : 0
            }}
          >
            <div className="overflow-hidden whitespace-nowrap mb-1">
              <div className="animate-ticker">
                <span className="text-[10px] md:text-xs text-[#9d7902] font-black ml-4">{metadata.album}</span>
                <span className="text-[10px] md:text-xs text-white font-bold ml-4">{metadata.title}</span>
                <span className="text-[10px] md:text-xs text-slate-400 ml-4">{metadata.artist}</span>
                <span className="text-[10px] md:text-xs text-[#9d7902] font-black ml-4">{metadata.album}</span>
                <span className="text-[10px] md:text-xs text-white font-bold ml-4">{metadata.title}</span>
                <span className="text-[10px] md:text-xs text-slate-400 ml-4">{metadata.artist}</span>
              </div>
            </div>
            
            <div className="h-4 md:h-5 w-full opacity-60">
              <canvas 
                ref={canvasRef} 
                width={300} 
                height={20} 
                className="w-full h-full"
              />
            </div>
          </div>
        </div>

        {/* أزرار التنقل الإضافية */}
        <div className="flex items-center gap-1 md:gap-2 mr-2 pl-2 shrink-0 border-r border-white/10">
          <button 
            onClick={() => onTabChange('schedule')}
            className={`flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full transition-all duration-300 ${activeTab === 'schedule' ? 'text-[#9d7902] bg-white/10 shadow-inner' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            title="الجدول"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>

          <button 
            onClick={() => onTabChange('about')}
            className={`flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full transition-all duration-300 ${activeTab === 'about' ? 'text-[#9d7902] bg-white/10 shadow-inner' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            title="عن الإذاعة"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>

      </div>
    </div>
  );
};

export default BottomBar;