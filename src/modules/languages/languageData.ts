export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  isRtl?: boolean;
  region: 'Indian' | 'Global';
  popular?: boolean;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  // Top Popular / Indian Languages
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', region: 'Global', popular: true },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳', region: 'Indian', popular: true },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', region: 'Indian', popular: true },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳', region: 'Indian', popular: true },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳', region: 'Indian', popular: true },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', isRtl: true, region: 'Global', popular: true },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', region: 'Global', popular: true },
  
  // Other Major Indian Languages
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳', region: 'Indian' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳', region: 'Indian' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳', region: 'Indian' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳', region: 'Indian' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳', region: 'Indian' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', isRtl: true, region: 'Indian' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', flag: '🇮🇳', region: 'Indian' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', flag: '🇮🇳', region: 'Indian' },

  // Major International Languages
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', region: 'Global', popular: true },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', region: 'Global', popular: true },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', region: 'Global' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', region: 'Global' },
  { code: 'zh', name: 'Chinese (Simplified)', nativeName: '简体中文', flag: '🇨🇳', region: 'Global' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', region: 'Global' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', region: 'Global' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', region: 'Global' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', region: 'Global' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', region: 'Global' },
  { code: 'fa', name: 'Persian / Farsi', nativeName: 'فارسی', flag: '🇮🇷', isRtl: true, region: 'Global' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', region: 'Global' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪', region: 'Global' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱', region: 'Global' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳', region: 'Global' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭', region: 'Global' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦', region: 'Global' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷', region: 'Global' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱', isRtl: true, region: 'Global' },
];

export const DEFAULT_LANGUAGE = SUPPORTED_LANGUAGES[0]; // English

export function getLanguageByCode(code: string): LanguageOption {
  const found = SUPPORTED_LANGUAGES.find((l) => l.code.toLowerCase() === code.toLowerCase());
  return found || DEFAULT_LANGUAGE;
}
