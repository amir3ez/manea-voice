
import React, { useState, useRef, useEffect } from 'react';
import { VoiceOption } from '../types';
import { generateSpeech } from '../services/geminiTTS';

interface VoiceCardProps {
  voice: VoiceOption;
  isSelected: boolean;
  onSelect: (voice: VoiceOption) => void;
}

const VoiceCard: React.FC<VoiceCardProps> = ({ voice, isSelected, onSelect }) => {
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isCached, setIsCached] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const cacheRef = useRef<{
    blob: Blob | null;
    url: string | null;
  }>({ blob: null, url: null });

  useEffect(() => {
    return () => {
      if (cacheRef.current.url) {
        URL.revokeObjectURL(cacheRef.current.url);
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const handlePreview = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isPreviewing && audioRef.current) {
      audioRef.current.pause();
      setIsPreviewing(false);
      return;
    }
    
    setIsPreviewing(true);

    try {
      let activeUrl = cacheRef.current.url;

      if (!activeUrl || !cacheRef.current.blob) {
        const previewText = `أهلاً بك، أنا ${voice.name.split(' ')[0]}. أقدم لك تجربة صوتية فريدة.`;
        const { blob } = await generateSpeech(previewText, voice.id, "natural");
        
        activeUrl = URL.createObjectURL(blob);
        cacheRef.current = { blob, url: activeUrl };
        setIsCached(true);
      }
      
      const audio = new Audio(activeUrl);
      audioRef.current = audio;
      
      audio.onended = () => {
        setIsPreviewing(false);
      };

      audio.onerror = () => {
        setIsPreviewing(false);
      };

      await audio.play();
    } catch (error: any) {
      console.error("Preview failed:", error);
      setIsPreviewing(false);
      // تنبيه بسيط عند فشل المعاينة بسبب القيوط
      if (error.message?.includes('429')) {
          alert("لا يمكن إجراء المعاينة حالياً بسبب ضغط الاستخدام. يرجى المحاولة لاحقاً.");
      }
    }
  };

  const clearCache = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (cacheRef.current.url) {
      URL.revokeObjectURL(cacheRef.current.url);
    }
    cacheRef.current = { blob: null, url: null };
    setIsCached(false);
    if (audioRef.current) audioRef.current.pause();
    setIsPreviewing(false);
  };

  return (
    <div 
      onClick={() => onSelect(voice)}
      className={`relative p-5 rounded-2xl cursor-pointer transition-all duration-500 overflow-hidden group ${
        isSelected 
        ? 'bg-gradient-to-br from-amber-500/20 to-amber-900/10 border-amber-500/60 ring-1 ring-amber-500/20 shadow-lg shadow-amber-500/10' 
        : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/60'
      } border`}
    >
      {isCached && (
        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
          <span className="text-[8px] font-bold text-zinc-500 uppercase">جاهز</span>
          <button 
            onClick={clearCache}
            className="ml-1 p-0.5 hover:text-red-500 transition-colors"
            title="مسح التخزين"
          >
            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className="flex items-center gap-4 relative z-10">
        <div className={`relative shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all duration-500 group-hover:scale-105 ${
          isSelected ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/40' : 'bg-zinc-800 text-zinc-400'
        }`}>
          🎙️
          <div className={`absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-tighter ${
            isSelected ? 'bg-black text-amber-500' : 'bg-zinc-700 text-zinc-300'
          }`}>
            {voice.gender === 'male' ? 'MALE' : 'FEMALE'}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div>
              <h3 className={`font-bold text-lg leading-tight transition-colors ${isSelected ? 'text-amber-400' : 'text-zinc-100'}`}>
                {voice.name}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                  isSelected ? 'bg-amber-500/20 text-amber-300' : 'bg-zinc-800 text-zinc-500'
                }`}>
                  {voice.style}
                </span>
              </div>
            </div>
            
            <button 
              onClick={handlePreview}
              disabled={isPreviewing && !audioRef.current}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                isPreviewing 
                ? 'bg-amber-500 text-black shadow-inner shadow-black/20' 
                : isSelected 
                  ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-black' 
                  : 'bg-zinc-800 text-zinc-500 hover:text-white hover:bg-zinc-700'
              }`}
            >
              {isPreviewing ? (
                <div className="flex gap-0.5 items-center">
                  <div className="w-1 h-3 bg-current animate-[bounce_0.6s_infinite_0s]"></div>
                  <div className="w-1 h-3 bg-current animate-[bounce_0.6s_infinite_0.1s]"></div>
                  <div className="w-1 h-3 bg-current animate-[bounce_0.6s_infinite_0.2s]"></div>
                </div>
              ) : (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      <p className={`mt-4 text-xs leading-relaxed transition-colors line-clamp-2 ${
        isSelected ? 'text-zinc-300' : 'text-zinc-500'
      }`}>
        {voice.description}
      </p>

      <div className={`absolute bottom-0 left-0 h-0.5 transition-all duration-700 ${
        isSelected ? 'bg-amber-500 w-full' : 'bg-transparent w-0'
      }`}></div>
    </div>
  );
};

export default VoiceCard;
