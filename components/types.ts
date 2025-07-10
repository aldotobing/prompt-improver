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

export interface ThemeProps {
  theme: 'light' | 'dark';
}

export interface SuggestionHandler {
  (suggestion: string): void;
}

export interface PromptImproverProps extends ThemeProps {}

export interface PromptInputProps extends ThemeProps {
  originalPrompt: string;
  setOriginalPrompt: (prompt: string) => void;
  promptStyle: string;
  setPromptStyle: (style: string) => void;
  inputRef?: React.RefObject<HTMLTextAreaElement | null>;
}

export interface PromptSuggestionsProps extends ThemeProps {
  onSuggestionClick: (suggestion: string) => void;
}

export interface ImprovedPromptDisplayProps {
  improvedPrompt: string;
  isCopied: boolean;
  onCopy: () => void;
  onPromptIt: () => void;
  onTemplateSelect?: (template: string) => void;
  theme: 'light' | 'dark';
}

export interface HistoryTabProps extends ThemeProps {
  history: HistoryItem[];
  onUseHistoryItem: (item: HistoryItem) => void;
  onClearHistory: () => void;
}
