import React, { useState, useEffect, useRef } from 'react';
import PlayerView from './components/PlayerView';
import ScheduleView from './components/ScheduleView';
import AboutView from './components/AboutView';
import BottomBar from './components/BottomBar';

const STREAM_URL = "https://work.radiowayak.org/listen/quran/radio.mp3";
const API_URL = "https://work.radiowayak.org/api/nowplaying/quran";
const LOGO_URL = "https://b.top4top.io/p_3687edeat1.png";

interface Metadata {
  title: string;
  artist: string;
  album: string;
  art: string;
}

const App: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<'player' | 'schedule' | 'about'>('player');
  const [sleepTime, setSleepTime] = useState<number | null>(null);
  const [hijriDate, setHijriDate] = useState<string>("");
  const [metadata, setMetadata] = useState<Metadata>({
    title: "تحميل البيانات...",
    artist: "أثير التراث",
    album: "أثير التراث",
    art: "https://images.unsplash.com/photo-1584281723930-22d99c569b71?q=80&w=800"
  });
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const sleepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<HTMLElement>(null);
  const scheduleRef = useRef<HTMLElement>(null);
  const aboutRef = useRef<HTMLElement>(null);

  const initAudioTools = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    if (!analyserRef.current && audioRef.current) {
      analyserRef.current = ctx.createAnalyser();
      analyserRef.current.fftSize = 256;
      sourceRef.current = ctx.createMediaElementSource(audioRef.current);
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(ctx.destination);
    }
  };

  const fetchMetadata = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      if (data?.now_playing?.song) {
        const song = data.now_playing.song;
        setMetadata({
          title: song.title || "أثير التراث",
          artist: song.artist || "أثير التراث",
          album: song.album && song.album.trim() !== "" ? song.album : "أثير التراث",
          art: song.art || metadata.art
        });
      }
    } catch (error) {
      console.error("Error fetching metadata:", error);
    }
  };

  // Hijri Date Logic
  useEffect(() => {
    const updateHijri = () => {
      try {
        const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
        setHijriDate(formatter.format(new Date()));
      } catch (e) {
        setHijriDate("");
      }
    };
    
    updateHijri();
    
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
    const msToMidnight = midnight.getTime() - now.getTime();
    
    const timeout = setTimeout(() => {
      updateHijri();
      const interval = setInterval(updateHijri, 24 * 60 * 60 * 1000);
      return () => clearInterval(interval);
    }, msToMidnight);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const audio = new Audio(STREAM_URL);
    audio.crossOrigin = "anonymous";
    audio.preload = "none";
    audioRef.current = audio;
    fetchMetadata();
    const interval = setInterval(fetchMetadata, 15000);

    const observerOptions = {
      root: scrollContainerRef.current,
      threshold: 0.6,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveTab(entry.target.id as any);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    if (playerRef.current) observer.observe(playerRef.current);
    if (scheduleRef.current) observer.observe(scheduleRef.current);
    if (aboutRef.current) observer.observe(aboutRef.current);

    return () => {
      audioRef.current?.pause();
      clearInterval(interval);
      if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (sleepTimerRef.current) {
      clearTimeout(sleepTimerRef.current);
      sleepTimerRef.current = null;
    }

    if (sleepTime !== null && isPlaying) {
      sleepTimerRef.current = setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        setIsPlaying(false);
        setSleepTime(null);
        console.log("Sleep timer triggered: Radio paused.");
      }, sleepTime * 60 * 1000);
    }
  }, [sleepTime, isPlaying]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    initAudioTools();
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.load();
      audioRef.current.play().catch(e => console.error("Playback failed", e));
    }
    setIsPlaying(!isPlaying);
  };

  const cycleSleepTime = () => {
    const options = [null, 15, 30, 45, 60];
    const currentIndex = options.indexOf(sleepTime as any);
    const nextIndex = (currentIndex + 1) % options.length;
    setSleepTime(options[nextIndex] as any);
  };

  const handleTabChange = (tab: 'player' | 'schedule' | 'about') => {
    const refs = {
      player: playerRef,
      schedule: scheduleRef,
      about: aboutRef
    };
    refs[tab].current?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  };

  return (
    <div className="h-screen w-screen relative flex flex-col bg-black overflow-hidden text-slate-100 p-4 md:p-12 font-readex select-none">
      
      {/* طبقة الصورة: تظهر فقط في صفحة الراديو (player) */}
      <div className={`fixed inset-0 z-0 transition-opacity duration-1000 ${activeTab === 'player' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <img 
          src={metadata.art} 
          alt="خلفية الأثير" 
          className={`w-full h-full object-cover transition-all duration-[60s] ease-out blur-[3px] opacity-70 ${isPlaying ? 'scale-110' : 'scale-100'}`} 
        />
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* طبقة الشفافية 10%: تظهر فقط في صفحات الجدول وعن الإذاعة */}
      <div className={`fixed inset-0 z-0 bg-white/[0.1] transition-opacity duration-700 ${activeTab !== 'player' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}></div>

      <main className="flex-1 relative z-10 w-full max-w-6xl mx-auto flex flex-col overflow-hidden h-full">
        <div 
          ref={scrollContainerRef}
          className="flex-1 flex flex-row overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth no-scrollbar relative"
        >
          <section id="player" ref={playerRef} className="w-full h-full snap-center snap-always shrink-0 flex-none relative flex flex-col">
            <header className="flex justify-between items-start w-full z-40 pt-4 md:pt-0 mb-6 shrink-0">
              <div className="flex items-center pt-2 mr-6">
                <img 
                  src={LOGO_URL} 
                  alt="أثير التراث" 
                  className="h-12 sm:h-16 md:h-20 lg:h-24 w-auto block object-contain drop-shadow-2xl cursor-pointer opacity-100 visible"
                  style={{ display: 'block', visibility: 'visible', opacity: 1 }}
                  onClick={() => handleTabChange('player')}
                />
              </div>
              
              <div className="flex flex-col items-end gap-2 md:gap-3">
                {hijriDate && (
                  <div className="mb-1">
                    <span className="text-[10px] md:text-xs font-bold text-[#9d7902] opacity-80">{hijriDate}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 bg-white/5 px-3 md:px-5 py-2 md:py-2.5 rounded-full border border-white/10 backdrop-blur-md">
                  <div className={`w-2 md:w-2.5 h-2 md:h-2.5 rounded-full ${isPlaying ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse' : 'bg-slate-600'} ml-1`}></div>
                  <span className="text-[10px] md:text-sm font-black text-slate-200">بث مباشر</span>
                </div>
                
                <button 
                  onClick={cycleSleepTime}
                  className={`relative flex items-center gap-2 p-2 md:p-2.5 rounded-full transition-all duration-500 border backdrop-blur-md group ${
                    sleepTime ? 'bg-[#9d7902]/20 text-[#9d7902] border-[#9d7902]/30 shadow-lg shadow-[#9d7902]/10 px-4' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {sleepTime ? (
                    <span className="text-[10px] md:text-xs font-black">
                      {`إيقاف بعد ${sleepTime} د`}
                    </span>
                  ) : (
                    <span className="text-[9px] md:text-[10px] font-bold opacity-60 px-1">النوم</span>
                  )}
                </button>
              </div>
            </header>

            <div className="flex-1 flex flex-col justify-end">
              <PlayerView 
                metadata={metadata} 
                analyser={analyserRef.current}
              />
            </div>
          </section>
          
          <section id="schedule" ref={scheduleRef} className="w-full h-full snap-center snap-always shrink-0 flex-none pt-4">
            <ScheduleView />
          </section>
          
          <section id="about" ref={aboutRef} className="w-full h-full snap-center snap-always shrink-0 flex-none pt-4">
            <AboutView />
          </section>
        </div>

        <div className="h-28 md:h-36 shrink-0"></div>
        
        <BottomBar 
          isPlaying={isPlaying} 
          onTogglePlay={togglePlay} 
          activeTab={activeTab}
          onTabChange={handleTabChange}
          metadata={metadata}
          analyser={analyserRef.current}
        />
      </main>
      
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/asfalt-light.png')]"></div>
      
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        #player, #schedule, #about {
          scroll-snap-stop: always;
        }
      `}</style>
    </div>
  );
};

export default App;