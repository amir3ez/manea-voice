
import { GoogleGenAI, Modality } from "@google/genai";
import { VoiceName } from "../types";
import { decodeBase64, pcmToWavBlob, calculateDuration } from "../utils/audioUtils";

/**
 * دالة إعادة المحاولة المتقدمة لمعالجة أخطاء الحصة (429)
 */
async function fetchWithRetry<T>(fn: () => Promise<T>, retries = 5, baseDelay = 15000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const errorStr = JSON.stringify(error).toLowerCase();
    const isRateLimit = errorStr.includes('429') || errorStr.includes('resource_exhausted') || errorStr.includes('quota');
    
    if (isRateLimit && retries > 0) {
      console.warn(`[Quota System] إعادة المحاولة خلال ${baseDelay / 1000} ثانية...`);
      await new Promise(resolve => setTimeout(resolve, baseDelay));
      return fetchWithRetry(fn, retries - 1, baseDelay + 5000);
    }
    throw error;
  }
}

export async function generateSpeech(
  text: string, 
  voice: VoiceName, 
  tone: string = "natural",
  rate: number = 1.0,
  pitch: number = 1.0
): Promise<{ blob: Blob; duration: number }> {
  const cleanText = text.trim().substring(0, 1200); 
  if (!cleanText) throw new Error("النص فارغ");

  let styleInstruction = tone;
  if (tone === 'news anchor') {
    styleInstruction = "a professional Arabic news anchor, formal, authoritative, with clear articulation.";
  }

  const prompt = `Perform the following Arabic text as a professional voice artist. Style: ${styleInstruction}. Speed: ${rate}x. Text: ${cleanText}`;

  return fetchWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error("لم يتم استلام بيانات صوتية.");
    }

    const pcmData = decodeBase64(base64Audio);
    // توليد ملف WAV مباشرة من PCM
    const wavBlob = pcmToWavBlob(pcmData, 24000);
    const duration = calculateDuration(pcmData.length, 24000);
    
    return {
      blob: wavBlob,
      duration: duration
    };
  });
}
