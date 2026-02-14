
import { VoiceName, VoiceOption } from './types';

export const VOICES: VoiceOption[] = [
  {
    id: VoiceName.CHARON,
    name: 'شاهين (Shahine)',
    description: 'صوت رخيم وفخم، يجسد الوقار والاحترافية. مثالي للتعليق الوثائقي والنشرات الإخبارية الكبرى.',
    gender: 'male',
    style: 'رخيم / إخباري فخم'
  },
  {
    id: VoiceName.ZEPHYR,
    name: 'دانة (Dana)',
    description: 'نبرة هادئة، رقيقة وواضحة جداً. خيارك الأول للروايات الأدبية والكتب الصوتية الملهمة.',
    gender: 'female',
    style: 'هادئ / روائي ناعم'
  },
  {
    id: VoiceName.FENRIR,
    name: 'جاسر (Jasser)',
    description: 'صوت شبابي قوي، حاد ومؤثر. يعطي طابع القوة والجدية للمشاريع التعليمية والتقنية.',
    gender: 'male',
    style: 'قوي / تعليمي جاد'
  },
  {
    id: VoiceName.KORE,
    name: 'ليان (Layan)',
    description: 'صوت دافئ ومقنع، يتميز بنبرة تسويقية جذابة. مثالي للإعلانات والبودكاست الحواري.',
    gender: 'female',
    style: 'دافئ / تسويقي جذاب'
  },
  {
    id: VoiceName.PUCK,
    name: 'ماجد (Majed)',
    description: 'نبرة شبابية حيوية، مليئة بالحماس والود. مناسب جداً للمحتوى الترفيهي ووسائل التواصل الاجتماعي.',
    gender: 'male',
    style: 'حيوي / شبابي مرح'
  },
  {
    id: VoiceName.CHARON,
    name: 'سلطان (Sultan)',
    description: 'أداء ملكي واثق، يتميز بنبرة عميقة وسلطوية. مثالي للخطابات الرسمية والتعليق الصوتي الفاخر.',
    gender: 'male',
    style: 'سلطوي / فخم جداً'
  },
  {
    id: VoiceName.ZEPHYR,
    name: 'نادية (Nadia)',
    description: 'صوت إذاعي مشرق ومتحمس. يتميز بمخارج حروف دقيقة جداً تجعله مثالياً للإعلانات الإذاعية السريعة.',
    gender: 'female',
    style: 'متحمس / إذاعي'
  },
  {
    id: VoiceName.FENRIR,
    name: 'فيصل (Faisal)',
    description: 'نبرة احترافية هادئة تمزج بين الثقة واللطف. خيار مثالي لأنظمة الرد الآلي المتقدمة والعروض التقديمية.',
    gender: 'male',
    style: 'متزن / احترافي'
  },
  {
    id: VoiceName.KORE,
    name: 'سلمى (Salma)',
    description: 'صوت تعليمي ناعم وصبور، يوفر تجربة استماع مريحة جداً للشروحات الطويلة والمنصات التعليمية.',
    gender: 'female',
    style: 'تعليمي / ناعم'
  }
];
