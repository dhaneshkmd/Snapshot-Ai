import { detectCommentLanguage } from './commentLanguageDetector';
import { LanguageOption } from '../languages/languageData';

export interface DetectedComment {
  id: string;
  author: string;
  text: string;
  platform?: string;
  timestamp?: string;
  likes?: string;
  language: LanguageOption;
  isMainPost?: boolean;
}

export interface ConversationContext {
  platform: string;
  mainPostText?: string;
  comments: DetectedComment[];
  selectedCommentId: string;
}

/**
 * Extracts and structures comment blocks from raw OCR text
 */
export function extractCommentsFromOCR(rawText: string): ConversationContext {
  const lines = (rawText || '')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // Detect platform hint
  let platform = 'Social Media';
  const lowerAll = rawText.toLowerCase();
  if (lowerAll.includes('linkedin') || lowerAll.includes('• 1st') || lowerAll.includes('• 2nd') || lowerAll.includes('like • reply')) {
    platform = 'LinkedIn';
  } else if (lowerAll.includes('twitter') || lowerAll.includes('@') || lowerAll.includes('retweet') || lowerAll.includes('repost')) {
    platform = 'X / Twitter';
  } else if (lowerAll.includes('reddit') || lowerAll.includes('r/') || lowerAll.includes('u/') || lowerAll.includes('upvote')) {
    platform = 'Reddit';
  } else if (lowerAll.includes('youtube') || lowerAll.includes('subscribed') || lowerAll.includes('subscribers') || lowerAll.includes('views')) {
    platform = 'YouTube';
  } else if (lowerAll.includes('instagram') || lowerAll.includes('reel') || lowerAll.includes('view replies')) {
    platform = 'Instagram';
  } else if (lowerAll.includes('whatsapp') || lowerAll.includes('online') || lowerAll.includes('last seen') || lowerAll.includes('typing...')) {
    platform = 'WhatsApp / Chat';
  } else if (lowerAll.includes('facebook') || lowerAll.includes('share') || lowerAll.includes('write a comment')) {
    platform = 'Facebook';
  }

  const comments: DetectedComment[] = [];
  let currentAuthor = '';
  let currentBuffer: string[] = [];

  // Patterns indicating a comment author or header
  const isAuthorLine = (line: string): boolean => {
    // e.g. "John Doe:", "@alex_smith:", "Sarah Connor • 2h", "u/tech_guru"
    if (/^@[a-zA-Z0-9_.-]+[:]?$/.test(line)) return true;
    if (/^[A-Z][a-zA-Z0-9_\s]{2,25}[:]$/.test(line)) return true;
    if (/^u\/[a-zA-Z0-9_-]+/.test(line)) return true;
    if (line.includes('• 1st') || line.includes('• 2nd') || line.includes('• 3rd')) return true;
    if (/^[A-Z][a-zA-Z\s]{2,25}\s+•\s+\d+[smhdwy]/.test(line)) return true;
    return false;
  };

  const isUiNoise = (line: string): boolean => {
    const l = line.toLowerCase();
    return (
      l === 'like' ||
      l === 'reply' ||
      l === 'share' ||
      l === 'send' ||
      l === 'view replies' ||
      l === 'view more comments' ||
      l === 'see translation' ||
      l === 'comment' ||
      l === 'reactions'
    );
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (isUiNoise(line)) {
      continue;
    }

    if (isAuthorLine(line)) {
      // Flush previous comment
      if (currentBuffer.length > 0) {
        const text = currentBuffer.join(' ').trim();
        if (text.length > 3) {
          comments.push({
            id: `c_${comments.length + 1}`,
            author: currentAuthor || `User ${comments.length + 1}`,
            text,
            platform,
            language: detectCommentLanguage(text),
          });
        }
        currentBuffer = [];
      }
      currentAuthor = line.replace(/[:•].*$/, '').trim();
      continue;
    }

    currentBuffer.push(line);
  }

  // Flush remaining buffer
  if (currentBuffer.length > 0) {
    const text = currentBuffer.join(' ').trim();
    if (text.length > 3) {
      comments.push({
        id: `c_${comments.length + 1}`,
        author: currentAuthor || `Comment ${comments.length + 1}`,
        text,
        platform,
        language: detectCommentLanguage(text),
      });
    }
  }

  // Fallback: If no distinct author-separated comments detected, break paragraphs into comment items
  if (comments.length === 0 && rawText.trim().length > 0) {
    const paragraphs = rawText
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 5);

    if (paragraphs.length > 0) {
      paragraphs.forEach((p, idx) => {
        comments.push({
          id: `c_${idx + 1}`,
          author: idx === 0 ? 'Main Post / Author' : `Comment ${idx}`,
          text: p,
          platform,
          isMainPost: idx === 0,
          language: detectCommentLanguage(p),
        });
      });
    } else {
      // Single block
      comments.push({
        id: 'c_1',
        author: 'Post Comment',
        text: rawText.trim(),
        platform,
        language: detectCommentLanguage(rawText),
      });
    }
  }

  const selectedCommentId = comments.length > 0 ? comments[0].id : '';

  return {
    platform,
    mainPostText: comments.length > 1 ? comments[0].text : undefined,
    comments,
    selectedCommentId,
  };
}
