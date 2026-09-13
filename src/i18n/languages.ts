export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  region: string;
  flag: string;
  speechCode: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  // Indian State Languages
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    region: 'North & Central India (उत्तर भारत)',
    flag: '🇮🇳',
    speechCode: 'hi-IN',
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    region: 'Tamil Nadu (தமிழ்நாடு)',
    flag: '🇮🇳',
    speechCode: 'ta-IN',
  },
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    region: 'Andhra & Telangana (ఆంధ్ర & తెలంగాణ)',
    flag: '🇮🇳',
    speechCode: 'te-IN',
  },
  {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    region: 'Karnataka (ಕರ್ನಾಟಕ)',
    flag: '🇮🇳',
    speechCode: 'kn-IN',
  },
  {
    code: 'ml',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    region: 'Kerala (കേരളം)',
    flag: '🇮🇳',
    speechCode: 'ml-IN',
  },
  {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    region: 'Maharashtra (महाराष्ट्र)',
    flag: '🇮🇳',
    speechCode: 'mr-IN',
  },
  {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    region: 'West Bengal (পশ্চিমবঙ্গ)',
    flag: '🇮🇳',
    speechCode: 'bn-IN',
  },
  {
    code: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    region: 'Gujarat (ગુજરાત)',
    flag: '🇮🇳',
    speechCode: 'gu-IN',
  },
  {
    code: 'pa',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    region: 'Punjab (ਪੰਜਾਬ)',
    flag: '🇮🇳',
    speechCode: 'pa-IN',
  },

  // International Languages
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    region: 'International',
    flag: '🇬🇧',
    speechCode: 'en-US',
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    region: 'España & Latin America',
    flag: '🇪🇸',
    speechCode: 'es-ES',
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    region: 'France & Francophonie',
    flag: '🇫🇷',
    speechCode: 'fr-FR',
  },
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    region: 'Deutschland & Europe',
    flag: '🇩🇪',
    speechCode: 'de-DE',
  },
];
