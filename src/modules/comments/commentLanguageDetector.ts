import { getLanguageByCode, LanguageOption, SUPPORTED_LANGUAGES } from '../languages/languageData';

/**
 * Fast deterministic script and vocabulary detector for comments
 */
export function detectCommentLanguage(text: string): LanguageOption {
  if (!text || text.trim().length === 0) {
    return getLanguageByCode('en');
  }

  // 1. Script-based Unicode block detection (extremely accurate for Indic and Non-Latin scripts)
  if (/[\u0D00-\u0D7F]/.test(text)) return getLanguageByCode('ml'); // Malayalam
  if (/[\u0B80-\u0BFF]/.test(text)) return getLanguageByCode('ta'); // Tamil
  if (/[\u0C00-\u0C7F]/.test(text)) return getLanguageByCode('te'); // Telugu
  if (/[\u0C80-\u0CFF]/.test(text)) return getLanguageByCode('kn'); // Kannada
  if (/[\u0980-\u09FF]/.test(text)) return getLanguageByCode('bn'); // Bengali
  if (/[\u0A80-\u0AFF]/.test(text)) return getLanguageByCode('gu'); // Gujarati
  if (/[\u0A00-\u0A7F]/.test(text)) return getLanguageByCode('pa'); // Punjabi
  if (/[\u0B00-\u0B7F]/.test(text)) return getLanguageByCode('or'); // Odia
  if (/[\u0600-\u06FF]/.test(text)) {
    // Arabic vs Urdu vs Farsi
    if (/[ٹڈڑںےہ]/.test(text)) return getLanguageByCode('ur');
    if (/[پچژگ]/.test(text)) return getLanguageByCode('fa');
    return getLanguageByCode('ar');
  }
  if (/[\u0400-\u04FF]/.test(text)) {
    if (/[іїєґ]/.test(text)) return getLanguageByCode('uk');
    return getLanguageByCode('ru');
  }
  if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) return getLanguageByCode('ja'); // Japanese
  if (/[\uAC00-\uD7AF]/.test(text)) return getLanguageByCode('ko'); // Korean
  if (/[\u4E00-\u9FFF]/.test(text)) return getLanguageByCode('zh'); // Chinese
  if (/[\u0E00-\u0E7F]/.test(text)) return getLanguageByCode('th'); // Thai
  if (/[\u0590-\u05FF]/.test(text)) return getLanguageByCode('he'); // Hebrew
  if (/[\u0370-\u03FF]/.test(text)) return getLanguageByCode('el'); // Greek
  if (/[\u0900-\u097F]/.test(text)) return getLanguageByCode('hi'); // Hindi / Marathi

  // 2. Latin-script vocabulary & accent heuristics
  const lower = text.toLowerCase();

  // Spanish
  if (/[áéíóúñ¿¡]/.test(lower) || /\b(que|por|para|como|bueno|gracias|está|amigo|hola)\b/.test(lower)) {
    return getLanguageByCode('es');
  }
  // French
  if (/[àâçéèêëîïôûù]/.test(lower) || /\b(merci|bonjour|avec|pour|dans|votre|cette|nous)\b/.test(lower)) {
    return getLanguageByCode('fr');
  }
  // German
  if (/[äöüß]/.test(lower) || /\b(nicht|danke|bitte|oder|wenn|aber|sehr|guten)\b/.test(lower)) {
    return getLanguageByCode('de');
  }
  // Portuguese
  if (/[ãõç]/.test(lower) || /\b(obrigado|muito|você|para|com|não)\b/.test(lower)) {
    return getLanguageByCode('pt');
  }

  // Default to English for Latin-script text
  return getLanguageByCode('en');
}
