/**
 * Deterministic Entity Extractor
 * Extracts structured entities (URLs, emails, phones, dates, times, currencies,
 * prices, percentages, stock tickers, order numbers, locations, etc.) using
 * regular expressions and rule-based NLP heuristics with ZERO AI calls.
 */

export interface ExtractedEntities {
  emails: string[];
  urls: string[];
  phones: string[];
  dates: string[];
  times: string[];
  prices: string[];
  percentages: string[];
  tickers: string[];
  orderNumbers: string[];
  locations: string[];
  hashtags: string[];
  handles: string[];
  deadlines: string[];
  meetingLinks: string[];
  companies: string[];
  jobTitles: string[];
  rawEntityList: { label: string; value: string }[];
}

export function extractEntities(text: string): ExtractedEntities {
  const result: ExtractedEntities = {
    emails: [],
    urls: [],
    phones: [],
    dates: [],
    times: [],
    prices: [],
    percentages: [],
    tickers: [],
    orderNumbers: [],
    locations: [],
    hashtags: [],
    handles: [],
    deadlines: [],
    meetingLinks: [],
    companies: [],
    jobTitles: [],
    rawEntityList: [],
  };

  if (!text || text.trim().length === 0) {
    return result;
  }

  // 1. Email Addresses
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
  const emails = Array.from(new Set(text.match(emailRegex) || []));
  result.emails = emails;
  emails.forEach((e) => result.rawEntityList.push({ label: 'Email', value: e }));

  // 2. URLs & Links
  const urlRegex = /\b(?:https?:\/\/|www\.)[^\s<>"'{}|\\^`]+|\b[a-zA-Z0-9-]+\.(?:com|org|io|net|gov|in|co|ai|dev|app)(?:\/[^\s<>"']*)?\b/g;
  const urls = Array.from(new Set(text.match(urlRegex) || []));
  result.urls = urls;
  urls.forEach((u) => result.rawEntityList.push({ label: 'Link', value: u }));

  // 3. Meeting Platforms & Links
  const meetingPlatforms = ['Google Meet', 'Zoom', 'Microsoft Teams', 'Slack', 'Webex', 'Discord', 'meet.google.com'];
  meetingPlatforms.forEach((p) => {
    if (new RegExp(p, 'i').test(text)) {
      result.meetingLinks.push(p);
      result.rawEntityList.push({ label: 'Platform', value: p });
    }
  });

  // 4. Phone Numbers (International, +91, US formats, 10-digit numbers)
  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
  const phones = Array.from(new Set(text.match(phoneRegex) || []));
  result.phones = phones;
  phones.slice(0, 2).forEach((p) => result.rawEntityList.push({ label: 'Phone', value: p }));

  // 5. Prices & Currencies ($, ₹, €, £, USD, INR, EUR, LPA)
  const priceRegex = /(?:[\$₹€£¥]\s*\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|\b\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?\s*(?:USD|INR|EUR|GBP|LPA|lpa|Cr|k|K)\b)/g;
  const prices = Array.from(new Set(text.match(priceRegex) || []));
  result.prices = prices;
  prices.slice(0, 3).forEach((p) => result.rawEntityList.push({ label: 'Price/Amount', value: p }));

  // 6. Percentages (+4.7%, -15%, 50%)
  const percentRegex = /[+-]?\d+(?:\.\d+)?%/g;
  const percentages = Array.from(new Set(text.match(percentRegex) || []));
  result.percentages = percentages;
  percentages.slice(0, 3).forEach((p) => result.rawEntityList.push({ label: 'Change', value: p }));

  // 7. Dates (e.g. 18 October 2026, Oct 12, 2026-10-18, 12/10/2026)
  const dateRegex = /\b(?:\d{4}[-/.]\d{1,2}[-/.]\d{1,2}|\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}|(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember))\s+\d{1,2}(?:st|nd|rd|th)?,?\s*\d{0,4}|\d{1,2}\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember))\s+\d{2,4})\b/gi;
  const dates = Array.from(new Set(text.match(dateRegex) || []));
  result.dates = dates;
  dates.slice(0, 2).forEach((d) => result.rawEntityList.push({ label: 'Date', value: d }));

  // 8. Times (e.g. 3:30 PM, 15:30, 10:00 AM)
  const timeRegex = /\b\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM|am|pm|IST|EST|PST|UTC|GMT)?\b/g;
  const times = Array.from(new Set(text.match(timeRegex) || []));
  result.times = times;
  times.slice(0, 2).forEach((t) => result.rawEntityList.push({ label: 'Time', value: t }));

  // 9. Stock Tickers (NSE: TATAMOTORS, NASDAQ: TSLA, RELIANCE, TATA MOTORS)
  const tickerRegex = /\b(?:NSE|BSE|NASDAQ|NYSE):\s*([A-Za-z0-9_-]+)\b/g;
  const tickerMatches = Array.from(text.matchAll(tickerRegex));
  tickerMatches.forEach((m) => {
    result.tickers.push(m[0]);
    result.rawEntityList.push({ label: 'Ticker', value: m[0] });
  });

  // Common stock symbols if followed by price/percentage
  const commonTickers = ['TATAMOTORS', 'RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'TSLA', 'AAPL', 'NVDA', 'MSFT', 'GOOGL', 'AMZN'];
  commonTickers.forEach((t) => {
    if (new RegExp(`\\b${t}\\b`, 'i').test(text)) {
      result.tickers.push(t);
      result.rawEntityList.push({ label: 'Stock', value: t });
    }
  });

  // 10. Order / Bill / Invoice Numbers
  const orderRegex = /(?:Bill\s*#|Order\s*#|Invoice\s*#|GSTIN:?|Ref\s*#)\s*([A-Za-z0-9_-]+)/gi;
  const orderMatches = Array.from(text.matchAll(orderRegex));
  orderMatches.forEach((m) => {
    result.orderNumbers.push(m[0]);
    result.rawEntityList.push({ label: 'Reference #', value: m[0] });
  });

  // 11. Deadlines
  const deadlineRegex = /(?:apply before|deadline|due date|valid till)[:\s]*([^\n,.]+)/gi;
  const deadlineMatches = Array.from(text.matchAll(deadlineRegex));
  deadlineMatches.forEach((m) => {
    result.deadlines.push(m[1].trim());
    result.rawEntityList.push({ label: 'Deadline', value: m[1].trim() });
  });

  // 12. Hashtags & Handles
  const hashtagRegex = /#\w+/g;
  result.hashtags = Array.from(new Set(text.match(hashtagRegex) || []));

  const handleRegex = /@\w+/g;
  result.handles = Array.from(new Set(text.match(handleRegex) || []));

  // 13. Common Tech & Corporate Locations
  const commonLocations = [
    'Bangalore', 'Bengaluru', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune',
    'San Francisco', 'New York', 'London', 'Singapore', 'Remote', 'Hybrid',
  ];
  commonLocations.forEach((loc) => {
    if (new RegExp(`\\b${loc}\\b`, 'i').test(text)) {
      result.locations.push(loc);
      result.rawEntityList.push({ label: 'Location', value: loc });
    }
  });

  // 14. Common Job Titles
  const jobRoles = [
    'Software Engineer', 'Product Manager', 'Marketing Manager', 'Designer',
    'Data Scientist', 'Developer', 'Lead', 'Executive', 'Analyst', 'VP', 'Director',
  ];
  jobRoles.forEach((role) => {
    if (new RegExp(`\\b${role}\\b`, 'i').test(text)) {
      result.jobTitles.push(role);
      result.rawEntityList.push({ label: 'Role', value: role });
    }
  });

  return result;
}
