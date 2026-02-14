
import React, { useState, useRef, useEffect } from 'react';
import { VOICES } from './constants';
import { VoiceOption, AudioGeneration } from './types';
import VoiceCard from './components/VoiceCard';
import Button from './components/Button';
import { generateSpeech } from './services/geminiTTS';

const App: React.FC = () => {
  const [text, setText] = useState('مرحباً بك في أثير. المنصة العربية الرائدة لتحويل النص إلى كلام بجودة سينمائية.');
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>(VOICES[0]);
  const [tone, setTone] = useState('natural and professional');
  const [speakingRate, setSpeakingRate] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generations, setGenerations] = useState<AudioGeneration[]>([]);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [quotaWait, setQuotaWait] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // تنظيف روابط الـ URL عند مغادرة التطبيق لمنع تسرب الذاكرة
  useEffect(() => {
    return () => {
      generations.forEach(gen => URL.revokeObjectURL(gen.audioUrl));
    };
  }, [generations]);

  const handleGenerate = async () => {
    if (!text.trim() || isGenerating) return;

    setIsGenerating(true);
    setQuotaWait(false);
    
    try {
      if (audioRef.current) audioRef.current.pause();

      const { blob, duration } = await generateSpeech(text, selectedVoice.id, tone, speakingRate, pitch);
      const url = URL.createObjectURL(blob);
      
      const newGeneration: AudioGeneration = {
        id: Math.random().toString(36).substr(2, 9),
        text,
        voice: selectedVoice.id,
        timestamp: Date.now(),
        audioBlob: blob,
        audioUrl: url,
        duration
      };

      setGenerations(prev => [newGeneration, ...prev].slice(0, 50));
      setCurrentAudioUrl(url);
      
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play().catch(() => {});
      }
      
    } catch (error: any) {
      console.error("Generation error:", error);
      const errorStr = JSON.stringify(error).toLowerCase();
      if (errorStr.includes('429') || errorStr.includes('quota')) {
        setQuotaWait(true);
      } else {
        alert("حدث خطأ. يرجى المحاولة مرة أخرى.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadAudio = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen pb-20 bg-[#0a0a0b] text-zinc-100">
      <header className="pt-8 pb-4 px-6 border-b border-white/5 sticky top-0 z-30 glass">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-amber-700 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <div className="relative w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center text-3xl border border-white/5 shadow-xl">🎙️</div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-black text-white tracking-tighter">أثير <span className="text-amber-500 italic">ATHEER</span></h1>
                <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded border border-amber-500/20 font-bold uppercase">المطور</span>
              </div>
              <p className="text-xs text-zinc-600 font-medium tracking-wide">المنصة الاحترافية لتحويل النصوص العربية</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="flex flex-col items-end">
                <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">المحرك الصوتي</span>
                <span className="text-xs font-bold text-green-500 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                  Gemini Flash 2.5 نشط
                </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-8">
          {quotaWait && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-6 animate-pulse">
              <h3 className="text-amber-500 font-bold mb-1 flex items-center gap-2">⚠️ جاري إعادة المحاولة تلقائياً...</h3>
              <p className="text-sm text-zinc-400">لقد تجاوزت الحصة المجانية. انتظر بضع ثوانٍ، سيقوم النظام تلقائياً بتجديد الطلب لك.</p>
            </div>
          )}

          <div className="glass rounded-[2.5rem] p-8 relative border border-white/5 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <span className="bg-amber-500/10 p-2 rounded-xl text-amber-500 text-lg">✍️</span> محرر النصوص
              </h2>
              <div className="flex gap-4 text-xs font-bold">
                <span className={text.length > 1200 ? "text-red-500" : "text-zinc-500"}>{text.length} / 1200</span>
                <button onClick={() => setText("")} className="text-zinc-600 hover:text-red-400 transition-colors uppercase">إفراغ المحرر</button>
              </div>
            </div>
            
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="اكتب النص العربي هنا..."
              className="w-full h-80 bg-transparent border-none text-2xl leading-[1.6] text-zinc-200 placeholder:text-zinc-800 focus:ring-0 resize-none font-medium custom-scrollbar"
            />

            <div className="mt-6 p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <label className="text-zinc-400 font-bold">سرعة الإلقاء</label>
                    <span className="text-amber-500 font-mono font-bold">{speakingRate.toFixed(1)}x</span>
                  </div>
                  <input type="range" min="0.5" max="1.5" step="0.1" value={speakingRate} onChange={(e) => setSpeakingRate(parseFloat(e.target.value))} className="w-full accent-amber-500 h-1 bg-zinc-800 rounded-lg cursor-pointer" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <label className="text-zinc-400 font-bold">نبرة الصوت</label>
                    <span className="text-amber-500 font-mono font-bold">{pitch.toFixed(1)}</span>
                  </div>
                  <input type="range" min="0.8" max="1.2" step="0.05" value={pitch} onChange={(e) => setPitch(parseFloat(e.target.value))} className="w-full accent-amber-500 h-1 bg-zinc-800 rounded-lg cursor-pointer" />
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap gap-6 items-center justify-between">
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-600 font-bold uppercase px-1">نمط الأداء الصوتي</label>
                <select value={tone} onChange={(e) => setTone(e.target.value)} className="bg-zinc-900 text-sm rounded-xl px-4 py-3 border border-zinc-800 text-zinc-300 outline-none focus:border-amber-500 w-64 shadow-inner">
                    <option value="natural and professional">طبيعي واحترافي</option>
                    <option value="news anchor">مذيع إخباري (رسمي)</option>
                    <option value="storytelling and engaging">راوي (قصصي)</option>
                    <option value="warm and friendly">دافئ وودي</option>
                    <option value="dramatic and slow">درامي وبطيء</option>
                </select>
              </div>
              <Button onClick={handleGenerate} isLoading={isGenerating} className="w-full sm:w-auto h-16 px-12 text-xl font-black rounded-2xl">
                {isGenerating ? 'جاري التحويل...' : 'توليد الصوت 🎧'}
              </Button>
            </div>
          </div>

          {currentAudioUrl && (
            <div className="gradient-border glass rounded-[2rem] p-8 flex flex-col items-stretch gap-6 shadow-xl animate-in slide-in-from-bottom duration-500">
              <audio ref={audioRef} controls src={currentAudioUrl} className="w-full accent-amber-500" />
              <div className="flex gap-4">
                <Button className="flex-1" variant="outline" onClick={() => generations[0] && downloadAudio(generations[0].audioUrl, `atheer-audio`)}>💾 حفظ الملف بصيغة WAV</Button>
              </div>
            </div>
          )}

          <div className="space-y-5">
            <h2 className="text-xl font-bold flex items-center gap-3"><span className="text-amber-500">🕒</span> السجل الصوتي</h2>
            <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {generations.length === 0 ? (
                <div className="text-center py-10 border border-white/5 rounded-3xl bg-white/[0.01] text-zinc-700 italic font-medium">ابدأ بتوليد أول مقطع صوتي لك ليظهر هنا</div>
              ) : (
                generations.map((gen) => (
                  <div key={gen.id} className="glass rounded-2xl p-4 flex items-center justify-between border border-white/5 hover:border-amber-500/30 transition-all group">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <button onClick={() => {
                          if (audioRef.current) {
                            audioRef.current.src = gen.audioUrl;
                            audioRef.current.play();
                            setCurrentAudioUrl(gen.audioUrl);
                          }
                      }} className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-black transition-all">▶️</button>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-zinc-200 truncate font-medium">{gen.text}</p>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-tighter">{new Date(gen.timestamp).toLocaleTimeString('ar-EG')}</span>
                            <span className="text-[10px] text-amber-500/60 font-mono">{gen.duration.toFixed(1)}s</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => downloadAudio(gen.audioUrl, `atheer-${gen.id}`)} className="p-2 text-zinc-600 hover:text-amber-500 transition-colors" title="تحميل">⬇️</button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="sticky top-32">
            <h2 className="text-2xl font-black mb-6">المكتبة <span className="text-amber-500">الصوتية</span></h2>
            <div className="space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto pr-2 custom-scrollbar">
              {VOICES.map((voice, idx) => (
                <VoiceCard key={`${voice.id}-${idx}`} voice={voice} isSelected={selectedVoice.id === voice.id && selectedVoice.name === voice.name} onSelect={setSelectedVoice} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
