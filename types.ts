
export enum VoiceName {
  ZEPHYR = 'Zephyr',
  KORE = 'Kore',
  PUCK = 'Puck',
  CHARON = 'Charon',
  FENRIR = 'Fenrir'
}

export interface VoiceOption {
  id: VoiceName;
  name: string;
  description: string;
  gender: 'male' | 'female';
  style: string;
}

export interface AudioGeneration {
  id: string;
  text: string;
  voice: VoiceName;
  timestamp: number;
  audioBlob: Blob;
  audioUrl: string; // رابط URL جاهز للاستخدام الفوري
  duration: number;
}
