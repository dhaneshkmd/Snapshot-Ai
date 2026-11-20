export interface EntityItem {
  label: string;
  value: string;
}

export interface SuggestedAction {
  id: string;
  name: string;
  description: string;
  actionPrompt: string;
}

export interface MoreAction {
  category: string;
  name: string;
  actionPrompt: string;
}

export interface AnalysisResult {
  contentType: string;
  detectedIntent: string;
  title: string;
  summary: string;
  entities: EntityItem[];
  magicAction: SuggestedAction;
  suggestedActions: SuggestedAction[];
  moreActions: MoreAction[];
  rawText?: string;
  cleanMarkdown?: string;
  confidence?: number;
}

export interface ActionExecutionResult {
  actionName: string;
  resultText: string;
  executedAt: string;
  transformationChain: string[];
}

export interface HistoryItem {
  id: string;
  title: string;
  contentType: string;
  detectedIntent: string;
  thumbnail: string;
  lastAction: string;
  lastResult: string;
  timestamp: number;
  isFavorite?: boolean;
}

export interface AppSettings {
  autoDeleteScreenshots: boolean;
  theme: 'light' | 'dark' | 'system';
  defaultLanguageCode?: string;
  favoriteReplyStyles?: string[];
  defaultReplyLength?: 'short' | 'medium' | 'detailed';
}
