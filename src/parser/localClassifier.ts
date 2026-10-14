/**
 * Local Rule-Based Screenshot Classifier
 * Categorizes screenshots based on extracted text, keywords, and detected entities.
 * Generates natural phrasing, confidence scores, and suggested actions locally.
 */

import { ExtractedEntities } from './entityExtractor';
import { SuggestedAction, MoreAction } from '../types';

export interface ClassificationResult {
  category: string;
  confidence: number;
  detectedIntent: string;
  title: string;
  summary: string;
  magicAction: SuggestedAction;
  suggestedActions: SuggestedAction[];
  moreActions: MoreAction[];
  isDeterministicActionAvailable?: boolean;
}

export function classifyScreenshot(
  text: string,
  entities: ExtractedEntities
): ClassificationResult {
  const lower = text.toLowerCase();

  // Keyword Score Trackers
  let jobScore = 0;
  let chatScore = 0;
  let stockScore = 0;
  let receiptScore = 0;
  let productScore = 0;
  let eventScore = 0;
  let codeScore = 0;
  let socialScore = 0;

  // 1. Job Scoring
  if (lower.includes('apply') || lower.includes('easy apply')) jobScore += 3;
  if (lower.includes('experience') || lower.includes('years') || lower.includes('yrs')) jobScore += 2;
  if (lower.includes('job') || lower.includes('role') || lower.includes('responsibilities')) jobScore += 2;
  if (lower.includes('full-time') || lower.includes('hybrid') || lower.includes('remote') || lower.includes('salary')) jobScore += 2;
  if (lower.includes('linkedin') || lower.includes('applicants') || lower.includes('hiring')) jobScore += 2;
  if (entities.jobTitles.length > 0) jobScore += 3;
  if (entities.deadlines.length > 0) jobScore += 2;

  // 2. Chat / Conversation Scoring
  if (lower.includes('today') && (lower.includes('pm') || lower.includes('am'))) chatScore += 2;
  if (lower.includes('reply to') || lower.includes('reply...') || lower.includes('type a message')) chatScore += 4;
  if (lower.includes('slack') || lower.includes('whatsapp') || lower.includes('messages') || lower.includes('online')) chatScore += 3;
  if (lower.includes('can you') || lower.includes('please') || lower.includes('thanks') || lower.includes('hey')) chatScore += 2;

  // 3. Stock / Finance Scoring
  if (entities.tickers.length > 0) stockScore += 4;
  if (lower.includes('nse:') || lower.includes('bse:') || lower.includes('nasdaq:')) stockScore += 5;
  if (lower.includes('market open') || lower.includes('day high') || lower.includes('day low') || lower.includes('52w')) stockScore += 4;
  if (entities.percentages.length > 0 && entities.prices.length > 0) stockScore += 3;
  if (lower.includes('tata motors') || lower.includes('reliance') || lower.includes('nifty') || lower.includes('sensex')) stockScore += 4;

  // 4. Receipt / Invoice Scoring
  if (lower.includes('receipt') || lower.includes('invoice') || lower.includes('bill #') || lower.includes('gstin')) receiptScore += 5;
  if (lower.includes('subtotal') || lower.includes('total paid') || lower.includes('tax') || lower.includes('cashier')) receiptScore += 4;
  if (entities.orderNumbers.length > 0) receiptScore += 3;
  if (lower.includes('qty') || lower.includes('items') || lower.includes('balance') || lower.includes('amount')) receiptScore += 2;

  // 5. Product / Shopping Scoring
  if (lower.includes('add to cart') || lower.includes('buy now')) productScore += 5;
  if (lower.includes('prime') || lower.includes('in stock') || lower.includes('free delivery')) productScore += 3;
  if (lower.includes('ratings') || lower.includes('reviews') || lower.includes('amazon')) productScore += 3;
  if (entities.prices.length > 0 && (lower.includes('save') || lower.includes('off'))) productScore += 2;

  // 6. Event / Calendar Scoring
  if (entities.dates.length > 0 && entities.times.length > 0) eventScore += 3;
  if (entities.meetingLinks.length > 0) eventScore += 4;
  if (lower.includes('meeting') || lower.includes('webinar') || lower.includes('calendar') || lower.includes('rsvp')) eventScore += 4;
  if (lower.includes('agenda') || lower.includes('invite') || lower.includes('conference')) eventScore += 2;

  // 7. Code / Error Scoring
  if (lower.includes('typeerror') || lower.includes('syntaxerror') || lower.includes('referenceerror') || lower.includes('uncaught')) codeScore += 5;
  if (lower.includes('stack trace') || lower.includes('at line') || lower.includes('exit status 1') || lower.includes('failed:')) codeScore += 4;
  if (lower.includes('const ') || lower.includes('import ') || lower.includes('function ') || lower.includes('console.log')) codeScore += 3;

  // 8. Social Media Scoring
  if (entities.hashtags.length >= 2 || entities.handles.length >= 2) socialScore += 3;
  if (lower.includes('repost') || lower.includes('retweet') || lower.includes('instagram') || lower.includes('twitter') || lower.includes('tweet')) socialScore += 4;

  // Determine Category Winner
  const scores = [
    { cat: 'job', score: jobScore },
    { cat: 'chat', score: chatScore },
    { cat: 'stock', score: stockScore },
    { cat: 'receipt', score: receiptScore },
    { cat: 'product', score: productScore },
    { cat: 'event', score: eventScore },
    { cat: 'code', score: codeScore },
    { cat: 'social', score: socialScore },
  ].sort((a, b) => b.score - a.score);

  const top = scores[0];

  // If highest score is minimal, classify as Document / Notes
  if (top.score < 2) {
    return {
      category: 'Document & Notes',
      confidence: 0.75,
      detectedIntent: 'Captured notes or text document for reference and extraction.',
      title: 'Document Screenshot',
      summary: 'Contains structured text and notes. Ready for instant local text extraction or AI summarization.',
      magicAction: {
        id: 'extract_text',
        name: '✨ Extract Clean Text (Instant)',
        description: 'Extract and format all visible text with zero AI token cost',
        actionPrompt: 'Extract all text verbatim and clean up formatting.',
      },
      suggestedActions: [
        {
          id: 'extract_text',
          name: 'Extract All Text (Instant)',
          description: 'Copy editable text immediately without using AI',
          actionPrompt: 'Extract and cleanly format all text from the image verbatim.',
        },
        {
          id: 'summarize_bullets',
          name: 'Summarize Key Takeaways',
          description: 'Distill main points into structured bullets',
          actionPrompt: 'Summarize the key takeaways and core ideas into concise bullets.',
        },
        {
          id: 'turn_into_email',
          name: 'Draft Email from Content',
          description: 'Turn document information into a clear outbound email',
          actionPrompt: 'Draft a clear, professional email conveying the main points of this document.',
        },
      ],
      moreActions: [
        { category: 'Text', name: 'Clean Extracted Text', actionPrompt: 'Format cleanly and fix OCR typos.' },
        { category: 'Text', name: 'Explain Simply', actionPrompt: 'Explain this content in plain English.' },
        { category: 'AI Prompt', name: 'Turn into AI Studio Prompt', actionPrompt: 'Create an optimized system prompt based on this text.' },
      ],
    };
  }

  // Specific Categories
  switch (top.cat) {
    case 'job': {
      const role = entities.jobTitles[0] || 'Position';
      const loc = entities.locations[0] || '';
      return {
        category: 'Job Opening',
        confidence: 0.94,
        detectedIntent: `Looks like a job opening for ${role}${loc ? ' in ' + loc : ''}.`,
        title: `${role} Opportunity`,
        summary: 'Job listing detailing qualifications, responsibilities, and application criteria.',
        magicAction: {
          id: 'prepare_application',
          name: '✨ Prepare Application Pitch',
          description: 'Generate high-impact talking points matching the role requirements',
          actionPrompt: 'Create a tailored application pitch and key talking points for this job opening.',
        },
        suggestedActions: [
          {
            id: 'cover_letter',
            name: 'Create Cover Letter',
            description: 'Generate a professional, customized cover letter',
            actionPrompt: 'Write a persuasive, targeted cover letter highlighting relevant achievements for this role.',
          },
          {
            id: 'tailor_resume',
            name: 'Tailor Resume Pitch',
            description: 'Align experience bullets with the listed requirements',
            actionPrompt: 'Draft resume bullet points tailored to the job requirements in this screenshot.',
          },
          {
            id: 'save_job_details',
            name: 'Extract Job Details (Instant)',
            description: 'Extract skills, qualifications, and deadline into notes',
            actionPrompt: 'Extract and structure all job details, qualifications, and deadlines.',
          },
        ],
        moreActions: [
          { category: 'Career', name: 'Generate Interview Questions', actionPrompt: 'Generate top 8 likely interview questions.' },
          { category: 'Career', name: 'Identify Required Skills', actionPrompt: 'Extract required hard and soft skills checklist.' },
          { category: 'Communication', name: 'LinkedIn Connection Message', actionPrompt: 'Write a warm outreach note to the recruiter.' },
          { category: 'Text', name: 'Extract Raw Text', actionPrompt: 'Extract all text verbatim.' },
        ],
      };
    }

    case 'chat': {
      return {
        category: 'Conversation',
        confidence: 0.92,
        detectedIntent: 'Message or chat conversation requiring a response or acknowledgment.',
        title: 'Chat Message',
        summary: 'Conversation thread with inbound question or request.',
        magicAction: {
          id: 'suggest_reply',
          name: '✨ Draft Quick Polite Reply',
          description: 'Generate a warm, clear response acknowledging the message',
          actionPrompt: 'Draft an authentic, polite response answering the request or question.',
        },
        suggestedActions: [
          {
            id: 'professional_reply',
            name: 'Draft Professional Reply',
            description: 'Executive, polished reply suitable for managers or clients',
            actionPrompt: 'Draft a polite, professional reply directly responding to this message.',
          },
          {
            id: 'friendly_reply',
            name: 'Draft Friendly Reply',
            description: 'Casual, concise message suitable for Slack or WhatsApp',
            actionPrompt: 'Draft a friendly, direct reply acknowledging the request.',
          },
          {
            id: 'create_reminder',
            name: 'Extract Action Item & Task',
            description: 'Turn the request into a clear checklist item',
            actionPrompt: 'Extract the core action item or deliverable requested in this message.',
          },
        ],
        moreActions: [
          { category: 'Communication', name: 'Short 1-Sentence Reply', actionPrompt: 'Draft a 1-sentence acknowledgment.' },
          { category: 'Communication', name: 'Follow-up Email', actionPrompt: 'Format message into a structured formal email.' },
          { category: 'Text', name: 'Extract Message Text', actionPrompt: 'Extract all message text.' },
        ],
      };
    }

    case 'stock': {
      const ticker = entities.tickers[0] || 'Market Asset';
      const pct = entities.percentages[0] || '';
      return {
        category: 'Stock / Finance',
        confidence: 0.95,
        detectedIntent: `This appears to be a stock-market chart showing ${ticker} ${pct}.`,
        title: `${ticker} Market Chart`,
        summary: `Market movement indicator showing recent price action and volume levels.`,
        magicAction: {
          id: 'market_note',
          name: '✨ Create Market Analysis Note',
          description: 'Structure ticker, price levels, range, and key observations',
          actionPrompt: 'Summarize key price levels, day range, volume, and factual market observations without financial advice.',
        },
        suggestedActions: [
          {
            id: 'explain_chart',
            name: 'Explain Chart in Plain English',
            description: 'Break down what this chart indicates for non-experts',
            actionPrompt: 'Explain what this stock chart signifies in simple, clear terms.',
          },
          {
            id: 'extract_stock_data',
            name: 'Extract Financial Data (Instant)',
            description: 'Format prices, volume, and changes into structured table',
            actionPrompt: 'Extract all numbers, tickers, prices, and percentages into a neat Markdown table.',
          },
          {
            id: 'social_commentary',
            name: 'Create Market Commentary',
            description: 'Draft a factual market post for LinkedIn or X/Twitter',
            actionPrompt: 'Draft a concise market commentary discussing this price movement.',
          },
        ],
        moreActions: [
          { category: 'Finance', name: 'Create Watchlist Entry', actionPrompt: 'Create a watchlist summary with support and resistance levels.' },
          { category: 'Text', name: 'Summarize Movement', actionPrompt: 'Summarize the day movement in 2 sentences.' },
        ],
      };
    }

    case 'receipt': {
      const order = entities.orderNumbers[0] || '';
      const total = entities.prices[0] || '';
      return {
        category: 'Receipt / Expense',
        confidence: 0.96,
        detectedIntent: `Receipt or bill${total ? ' totaling ' + total : ''} for expense tracking.`,
        title: 'Expense Receipt',
        summary: 'Itemized purchase receipt showing merchant, line items, taxes, and total.',
        magicAction: {
          id: 'save_expense',
          name: '✨ Save Expense Record',
          description: 'Format merchant, date, tax, payment method, and total cleanly',
          actionPrompt: 'Format merchant, date, tax, payment method, and total into a clean expense log.',
        },
        suggestedActions: [
          {
            id: 'export_csv',
            name: 'Export as CSV (Instant)',
            description: 'Convert items, quantities, and prices to spreadsheet CSV',
            actionPrompt: 'Format all line items, quantities, and prices as CSV table format.',
          },
          {
            id: 'accounting_entry',
            name: 'Create Accounting Entry',
            description: 'Generate categorized debit/credit ledger record',
            actionPrompt: 'Generate a standard bookkeeping entry with expense categorization.',
          },
          {
            id: 'extract_receipt_text',
            name: 'Extract All Line Items (Instant)',
            description: 'Copy itemized list and numbers to clipboard',
            actionPrompt: 'Extract all receipt text and line items cleanly.',
          },
        ],
        moreActions: [
          { category: 'Finance', name: 'Summarize Purchase', actionPrompt: 'Summarize merchant, items, and total in 1 sentence.' },
          { category: 'Text', name: 'Clean OCR Text', actionPrompt: 'Clean up all receipt text.' },
        ],
      };
    }

    case 'product': {
      return {
        category: 'Product / Shopping',
        confidence: 0.91,
        detectedIntent: 'Product listing or shopping page under evaluation.',
        title: 'Product Listing',
        summary: 'E-commerce product card detailing price, features, and specs.',
        magicAction: {
          id: 'create_shopping_note',
          name: '✨ Create Product Comparison Note',
          description: 'Extract model, specs, price, and pros/cons',
          actionPrompt: 'Extract product title, price, key features, and generate pros and cons.',
        },
        suggestedActions: [
          {
            id: 'extract_product_details',
            name: 'Extract Product Specs (Instant)',
            description: 'Save model, price, and specs cleanly',
            actionPrompt: 'Extract all product specs, model number, price, and delivery details.',
          },
          {
            id: 'compare_alternatives',
            name: 'Find Competitor Comparisons',
            description: 'Compare with standard market alternatives in this category',
            actionPrompt: 'Analyze this product and list key competing models and value trade-offs.',
          },
          {
            id: 'search_product_later',
            name: 'Save Wishlist Reminder',
            description: 'Create a clean reminder card with product name and price',
            actionPrompt: 'Create a concise wishlist reminder item with price and purchase link if visible.',
          },
        ],
        moreActions: [
          { category: 'Shopping', name: 'Pros and Cons List', actionPrompt: 'Generate a balanced pros and cons list for this product.' },
          { category: 'Text', name: 'Extract Product Text', actionPrompt: 'Extract all visible text.' },
        ],
      };
    }

    case 'event': {
      const dt = entities.dates[0] || 'Upcoming';
      const tm = entities.times[0] || '';
      return {
        category: 'Event & Meeting',
        confidence: 0.93,
        detectedIntent: `Event or meeting invitation scheduled for ${dt}${tm ? ' at ' + tm : ''}.`,
        title: 'Event Invitation',
        summary: 'Calendar invite or event flyer with date, time, and venue details.',
        magicAction: {
          id: 'add_to_calendar',
          name: '✨ Add to Calendar (.ics format)',
          description: 'Generate standard calendar event format ready to import',
          actionPrompt: 'Extract title, start time, end time, location, and description into standard calendar format.',
        },
        suggestedActions: [
          {
            id: 'create_reminder',
            name: 'Create Reminder Note',
            description: 'Save date, time, link, and preparation details',
            actionPrompt: 'Create a clear reminder note with agenda items and preparation requirements.',
          },
          {
            id: 'rsvp_reply',
            name: 'Draft RSVP Reply',
            description: 'Polite confirmation message accepting the invite',
            actionPrompt: 'Draft a polite RSVP reply confirming attendance.',
          },
          {
            id: 'share_event_details',
            name: 'Share Event Summary',
            description: 'Concise summary to send to colleagues or friends',
            actionPrompt: 'Summarize the event title, date, time, and link for quick forwarding.',
          },
        ],
        moreActions: [
          { category: 'Events', name: 'Extract Venue & Address', actionPrompt: 'Extract exact venue or video meeting link.' },
          { category: 'Text', name: 'Extract Event Text', actionPrompt: 'Extract all text verbatim.' },
        ],
      };
    }

    case 'code': {
      return {
        category: 'Code & Technical Error',
        confidence: 0.95,
        detectedIntent: 'Code snippet or software error trace requiring debugging.',
        title: 'Technical Error / Code',
        summary: 'Error traceback or code snippet showing function call and failure message.',
        magicAction: {
          id: 'explain_and_fix',
          name: '✨ Explain Cause & Provide Fix',
          description: 'Identify the exact root cause and generate corrected code',
          actionPrompt: 'Explain the root cause of this error in simple language and provide the corrected code snippet.',
        },
        suggestedActions: [
          {
            id: 'explain_error',
            name: 'Explain Error Simply',
            description: 'Why this error occurs and how to prevent it',
            actionPrompt: 'Explain this error simply and outline step-by-step resolution instructions.',
          },
          {
            id: 'corrected_code',
            name: 'Generate Corrected Code',
            description: 'Drop-in code replacement fixing the bug',
            actionPrompt: 'Provide the clean, corrected code snippet resolving this issue.',
          },
          {
            id: 'copy_trace',
            name: 'Extract Error Text (Instant)',
            description: 'Copy clean error message and stack trace',
            actionPrompt: 'Extract the exact error message and stack trace cleanly for debugging.',
          },
        ],
        moreActions: [
          { category: 'Code', name: 'Create Debug Prompt', actionPrompt: 'Generate a high-context prompt for an IDE assistant.' },
          { category: 'Code', name: 'StackOverflow Question', actionPrompt: 'Format into a minimal reproducible question.' },
        ],
      };
    }

    case 'social': {
      return {
        category: 'Social Media Post',
        confidence: 0.90,
        detectedIntent: 'Social media post, tweet, or community update.',
        title: 'Social Post',
        summary: 'Social media content with engagement, hashtags, or commentary.',
        magicAction: {
          id: 'draft_commentary',
          name: '✨ Create Thoughtful Commentary',
          description: 'Draft insightful opinion or perspective to share',
          actionPrompt: 'Write an insightful commentary or perspective responding to this post.',
        },
        suggestedActions: [
          {
            id: 'repost_with_thoughts',
            name: 'Repost with Added Value',
            description: 'Format key takeaways for your own audience',
            actionPrompt: 'Adapt this post into an engaging LinkedIn or X/Twitter post with 3 key takeaways.',
          },
          {
            id: 'suggest_reply',
            name: 'Suggest Engaging Comment',
            description: 'Smart, engaging comment to post in the replies',
            actionPrompt: 'Write a high-value comment to contribute to this discussion thread.',
          },
          {
            id: 'extract_post_text',
            name: 'Extract Text (Instant)',
            description: 'Copy post copy and hashtags',
            actionPrompt: 'Extract all post text and hashtags cleanly.',
          },
        ],
        moreActions: [
          { category: 'Social', name: 'Generate Hashtags', actionPrompt: 'Generate 10 trending, relevant hashtags.' },
          { category: 'Text', name: 'Summarize Discussion', actionPrompt: 'Summarize the core premise in 2 bullets.' },
        ],
      };
    }

    default:
      return {
        category: 'Screenshot',
        confidence: 0.8,
        detectedIntent: 'Visual screenshot ready for transformation.',
        title: 'Captured Screenshot',
        summary: 'Extracted content ready for action.',
        magicAction: {
          id: 'extract_and_summarize',
          name: '✨ Extract & Summarize (Instant)',
          description: 'Extract all text and key details',
          actionPrompt: 'Extract all text and summarize key points.',
        },
        suggestedActions: [
          {
            id: 'extract_text',
            name: 'Extract Text (Instant)',
            description: 'Copy all visible text directly',
            actionPrompt: 'Extract and format text verbatim.',
          },
          {
            id: 'draft_reply',
            name: 'Draft Reply or Response',
            description: 'Create an appropriate response',
            actionPrompt: 'Draft an authentic reply.',
          },
          {
            id: 'summarize',
            name: 'Summarize Key Points',
            description: 'Create concise takeaways',
            actionPrompt: 'Summarize key points.',
          },
        ],
        moreActions: [],
      };
  }
}
