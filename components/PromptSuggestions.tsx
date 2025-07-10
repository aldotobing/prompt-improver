import { useState } from "react";
import { Lightbulb, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { PROMPT_SUGGESTIONS } from "./constants";
import { ThemeProps } from "./types";
import { TemplateSelector } from "./TemplateSelector";

interface PromptSuggestionsProps extends ThemeProps {
  onSuggestionClick: (suggestion: string) => void;
  onTemplateSelect?: (template: string) => void;
}

export const PromptSuggestions = ({
  theme,
  onSuggestionClick,
  onTemplateSelect,
}: PromptSuggestionsProps) => {
  const [showAll, setShowAll] = useState(false);
  const visibleSuggestions = showAll ? PROMPT_SUGGESTIONS : PROMPT_SUGGESTIONS.slice(0, 6);

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <Lightbulb
              className={`h-4 w-4 mr-2 ${
                theme === "dark" ? "text-blue-400" : "text-blue-600"
              }`}
            />
            <span
              className={`text-sm font-medium ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Try these examples:
            </span>
          </div>
          
          {PROMPT_SUGGESTIONS.length > 6 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className={`text-xs flex items-center gap-1 ${
                theme === 'dark' 
                  ? 'text-blue-400 hover:text-blue-300' 
                  : 'text-blue-600 hover:text-blue-800'
              }`}
            >
              {showAll ? (
                <>
                  Show less <ChevronUp className="h-3 w-3" />
                </>
              ) : (
                <>
                  Show more <ChevronDown className="h-3 w-3" />
                </>
              )}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {visibleSuggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSuggestionClick(suggestion)}
              className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                theme === "dark"
                  ? "bg-gray-800/80 text-gray-200 hover:bg-blue-900/50 border border-gray-700 hover:border-blue-500 hover:text-white"
                  : "bg-white text-gray-700 hover:bg-blue-50 border border-gray-200 hover:border-blue-400 hover:text-blue-700"
              } shadow-sm truncate`}
              title={suggestion}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
      
      <div>
        <div className="flex items-center mb-2">
          <Sparkles
            className={`h-4 w-4 mr-2 ${
              theme === "dark" ? "text-yellow-400" : "text-yellow-600"
            }`}
          />
          <span
            className={`text-sm font-medium ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Or use a template:
          </span>
        </div>
        <div className="flex items-center gap-2">
          <TemplateSelector 
            onSelect={(template) => onTemplateSelect?.(template)}
            theme={theme} 
          />
          <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
            Customizable starting points
          </span>
        </div>
      </div>
    </div>
  );
};
