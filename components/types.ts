export type Tab = { id: string; label: string };

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  setActiveTab: (id: string) => void;
  theme?: 'light' | 'dark';
}

export interface HistoryItem {
  original: string;
  improved: string;
  timestamp: number;
}

// Theme is now handled by next-themes and Tailwind dark mode

export interface SuggestionHandler {
  (suggestion: string): void;
}

export interface PromptImproverProps {}

export interface PromptInputProps {
  originalPrompt: string;
  setOriginalPrompt: (prompt: string) => void;
  promptStyle: string;
  setPromptStyle: (style: string) => void;
  inputRef?: React.RefObject<HTMLTextAreaElement | null>;
}

export interface PromptSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void;
}

export interface ImprovedPromptDisplayProps {
  improvedPrompt: string;
  isCopied: boolean;
  onCopy: () => void;
  onPromptIt: () => void;
  onTemplateSelect?: (template: string) => void;
}

export interface HistoryTabProps {
  history: HistoryItem[];
  onUseHistoryItem: (item: HistoryItem) => void;
  onClearHistory: () => void;
}
