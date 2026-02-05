import React, { useRef, useEffect, useState } from 'react';

interface Metadata {
  title: string;
  artist: string;
  album: string;
  art: string;
}

interface PlayerViewProps {
  metadata: Metadata;
  analyser: AnalyserNode | null;
}

const PlayerView: React.FC<PlayerViewProps> = ({ metadata, analyser }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(false);
    const t = setTimeout(() => setIsReady(true), 10);
    return () => clearTimeout(t);
  }, [metadata.title, metadata.artist, metadata.album]);

  useEffect(() => {
    if (!canvasRef.current || !analyser) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    let animationId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const renderFrame = () => {
      animationId = requestAnimationFrame(renderFrame);
      analyser.getByteFrequencyData(dataArray);

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const barCount = 64;
      const barWidth = width / barCount;
      
      for (let i = 0; i < barCount; i++) {
        const val = dataArray[i];
        const barHeight = (val / 255) * height * 0.7;

        const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
        gradient.addColorStop(0, 'rgba(157, 121, 2, 0.0)');
        gradient.addColorStop(0.3, 'rgba(157, 121, 2, 0.05)');
        gradient.addColorStop(1, 'rgba(157, 121, 2, 0.25)');

        ctx.fillStyle = gradient;
        
        const x = i * barWidth;
        const y = height - barHeight;
        
        ctx.fillRect(x + 2, y, barWidth - 4, barHeight);
      }
    };

    renderFrame();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [analyser]);

  return (
    <div className="relative h-full w-full flex flex-col justify-end pb-4 md:pb-6 overflow-hidden">
      {/* Visualizer Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <canvas 
          ref={canvasRef} 
          className="w-full h-full opacity-60"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-start justify-end h-full w-full py-2 md:py-4">
        <div 
          className="text-right w-full px-0 space-y-1 md:space-y-2 font-readex mb-2 md:mb-4 flex flex-col items-start"
          style={{
            transition: 'opacity 0.2s ease-out, transform 1.5s cubic-bezier(0.16, 1, 0.3, 1)',
            opacity: isReady ? 0.95 : 0,
            transform: isReady ? 'translateY(0)' : 'translateY(30px)'
          }}
        >
          <h2 className="text-3xl md:text-5xl lg:text-7xl font-light text-white tracking-tight drop-shadow-xl leading-tight w-full text-right mr-6">
            {metadata.album}
          </h2>
          
          <div className="flex flex-col space-y-0.5 w-full items-start">
            <p className="text-xl md:text-3xl lg:text-4xl text-[#9d7902] font-bold drop-shadow-lg leading-tight w-full text-right mr-6">
              {metadata.title}
            </p>
            <p className="text-base md:text-xl text-slate-400 font-light tracking-wide opacity-60 w-full text-right mr-6">
              {metadata.artist}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerView;