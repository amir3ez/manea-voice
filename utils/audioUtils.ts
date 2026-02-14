
export function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * تحويل بيانات PCM الخام إلى ملف WAV مباشرة عبر إضافة الترويسة (Header)
 * هذا الإجراء أسرع بكثير من المرور عبر AudioBuffer لأنه يتجنب العمليات الحسابية المعقدة
 */
export function pcmToWavBlob(pcmData: Uint8Array, sampleRate: number = 24000): Blob {
  const numChannels = 1;
  const bitDepth = 16;
  const header = new ArrayBuffer(44);
  const view = new DataView(header);

  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  /* RIFF identifier */
  writeString(0, 'RIFF');
  /* file length */
  view.setUint32(4, 36 + pcmData.length, true);
  /* RIFF type */
  writeString(8, 'WAVE');
  /* format chunk identifier */
  writeString(12, 'fmt ');
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw) */
  view.setUint16(20, 1, true);
  /* channel count */
  view.setUint16(22, numChannels, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, numChannels * (bitDepth / 8), true);
  /* bits per sample */
  view.setUint16(34, bitDepth, true);
  /* data chunk identifier */
  writeString(36, 'data');
  /* data chunk length */
  view.setUint32(40, pcmData.length, true);

  return new Blob([header, pcmData], { type: 'audio/wav' });
}

/**
 * حساب المدة الزمنية التقريبية بناءً على حجم بيانات PCM
 */
export function calculateDuration(pcmLength: number, sampleRate: number = 24000): number {
  // PCM 16-bit (2 bytes per sample)
  const samples = pcmLength / 2;
  return samples / sampleRate;
}
