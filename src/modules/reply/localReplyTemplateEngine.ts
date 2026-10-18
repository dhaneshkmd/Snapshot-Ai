export interface LocalReplyTemplateResult {
  matched: boolean;
  replyText?: string;
}

/**
 * Level 0 / Level 1 Local Deterministic Reply Generator
 * Handles routine replies (Thank you, Congratulations, Acknowledgements, Simple Acceptance/Refusal)
 * in native Malayalam, Hindi, Tamil, Arabic, Spanish, English with 0 API tokens and 0ms latency.
 */
export function tryGenerateLocalReply(
  commentText: string,
  targetLangCode: string,
  styleId: string,
  position: 'agree' | 'disagree' | 'neutral' | 'partial' | 'question'
): LocalReplyTemplateResult {
  const lower = commentText.toLowerCase().trim();

  // 1. Congratulations
  if (lower.includes('congrats') || lower.includes('congratulation') || lower.includes('proud of you') || lower.includes('great achievement')) {
    if (targetLangCode === 'ml') {
      return { matched: true, replyText: 'വളരെ നന്ദി! ഈ പ്രോത്സാഹനത്തിന് ഹൃദയം നിറഞ്ഞ സന്തോഷം. 🙏✨' };
    }
    if (targetLangCode === 'hi') {
      return { matched: true, replyText: 'बहुत-बहुत धन्यवाद! आपके इन उत्साहवर्धक शब्दों के लिए आभारी हूँ। 🙏✨' };
    }
    if (targetLangCode === 'ta') {
      return { matched: true, replyText: 'மிக்க நன்றி! உங்கள் வாழ்த்துகளுக்கு மனமார்ந்த மகிழ்ச்சி. 🙏✨' };
    }
    if (targetLangCode === 'ar') {
      return { matched: true, replyText: 'شكراً جزيلاً لك! ممتن جداً لكلماتك الطيبة وتشجيعك الرائع. 🙏✨' };
    }
    if (targetLangCode === 'es') {
      return { matched: true, replyText: '¡Muchísimas gracias! Aprecio de corazón tus amables palabras y apoyo. 🙏✨' };
    }
    return { matched: true, replyText: 'Thank you so much! Truly appreciate your kind words and continuous support. 🙏✨' };
  }

  // 2. Thank you / Appreciation
  if (lower.startsWith('thank you') || lower.startsWith('thanks') || lower === 'thanks!' || lower.includes('much appreciated')) {
    if (targetLangCode === 'ml') {
      return { matched: true, replyText: 'സന്തോഷമേ ഉള്ളൂ! എപ്പോഴും സഹായിക്കാൻ കഴിഞ്ഞതിൽ സന്തോഷം. 😊' };
    }
    if (targetLangCode === 'hi') {
      return { matched: true, replyText: 'कोई बात नहीं, यह मेरा सौभाग्य है! मदद करके खुशी हुई। 😊' };
    }
    if (targetLangCode === 'ta') {
      return { matched: true, replyText: 'மகிழ்ச்சி! உங்களுக்கு உதவ முடிந்ததில் மிக்க மகிழ்ச்சி. 😊' };
    }
    if (targetLangCode === 'ar') {
      return { matched: true, replyText: 'على الرحب والسعة دائماً! سعيد جداً بمساعدتك. 😊' };
    }
    if (targetLangCode === 'es') {
      return { matched: true, replyText: '¡Con mucho gusto! Siempre es un placer ayudar. 😊' };
    }
    return { matched: true, replyText: 'You are most welcome! Always happy to help and connect. 😊' };
  }

  // 3. Simple Greetings
  if (lower === 'hi' || lower === 'hello' || lower === 'good morning' || lower === 'hey there') {
    if (targetLangCode === 'ml') {
      return { matched: true, replyText: 'ഹലോ! സുഖമാണെന്ന് കരുതുന്നു. എന്തൊക്കെയുണ്ട് വിശേഷങ്ങൾ? 😊' };
    }
    if (targetLangCode === 'hi') {
      return { matched: true, replyText: 'नमस्ते! आशा है आप सकुशल हैं। सब कैसा चल रहा है? 😊' };
    }
    if (targetLangCode === 'ta') {
      return { matched: true, replyText: 'வணக்கம்! நலம் என்று நம்புகிறேன். எப்படி இருக்கிறீர்கள்? 😊' };
    }
    if (targetLangCode === 'ar') {
      return { matched: true, replyText: 'أهلاً وسهلاً بك! أتمنى أن تكون بأفضل حال. كيف تسير الأمور؟ 😊' };
    }
    if (targetLangCode === 'es') {
      return { matched: true, replyText: '¡Hola! Espero que estés muy bien. ¿Cómo va todo? 😊' };
    }
    return { matched: true, replyText: 'Hello! Hope you are having a wonderful day. Great to connect with you! 😊' };
  }

  // Routine matching didn't trigger, proceed to level 3 (Gemini text generator)
  return { matched: false };
}
