// components/TemplateSelector.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { defaultTemplates, templateCategories, templateDummyData } from "@/constants/promptTemplates";
import { PromptTemplate } from "@/types/template";
import { Loader2, ChevronDown } from "lucide-react";

interface TemplateSelectorProps {
  onSelect: (template: string) => void;
}

// Helper function to replace placeholders in a string
const replacePlaceholders = (str: string, values: Record<string, string>): string => {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replace(new RegExp(`\\{${key}\\}`, 'g'), value),
    str
  );
};

export function TemplateSelector({ onSelect }: TemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const filteredTemplates = selectedCategory === "all" 
    ? defaultTemplates 
    : defaultTemplates.filter(t => t.category === selectedCategory);

  const callCloudflareAI = async (prompt: string): Promise<string> => {
    // First try DeepSeek AI
    let deepseekResponse = await fetch(
      process.env.NEXT_PUBLIC_CLOUDFLARE_DEEPSEEK_AI_URL || "",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      }
    );

    if (deepseekResponse.ok) {
      const data = await deepseekResponse.json();
      if (data?.text) {
        // Return just the generated content without any extra text
        return data.text.trim();
      }
    }
    
    // Fallback to Cloudflare Text AI if DeepSeek fails
    console.log('Falling back to Cloudflare Text AI');
    const cloudflareResponse = await fetch(
      process.env.NEXT_PUBLIC_CLOUDFLARE_AI_URL || "",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `You are a prompt generator. Generate a complete, ready-to-use prompt based on this template structure. Replace all placeholders with relevant, specific details to create a functional prompt. Return ONLY the final prompt with NO additional text or explanations.

Template structure:
${prompt}`
            },
          ],
        }),
      }
    );

    if (!cloudflareResponse.ok) {
      throw new Error(`API request failed with status ${cloudflareResponse.status}`);
    }

    const fallbackData = await cloudflareResponse.json();
    const responseText = fallbackData?.[0]?.response?.response?.trim() || '';
    
    // Clean up the response to remove any extra text
    return responseText.replace(/^(Generated from ".*?" template:\n\n|Here's your .*?:\n\n)/i, '').trim();
  };

  const handleTemplateClick = async (template: PromptTemplate) => {
    setIsGenerating(template.id);
    setError(null);
    
    try {
      // Get dummy data for this template to fill placeholders
      const data = templateDummyData[template.id] || {};
      
      // Use the generation prompt if available, otherwise use the template
      const prompt = replacePlaceholders(
        template.generationPrompt || template.template,
        data
      );
      
      // Call the AI API to generate the content
      const aiResponse = await callCloudflareAI(prompt);
      
      // Store the raw AI response (without any extra formatting)
      const response = aiResponse;
      
      setGeneratedContent(prev => ({
        ...prev,
        [template.id]: response
      }));
      
      // Auto-close after a delay if user doesn't interact
      setTimeout(() => {
        if (isGenerating === template.id) {
          onSelect(response);
          setIsGenerating(null);
        }
      }, 3000);
      
    } catch (err) {
      console.error("Error generating content:", err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      
      // Fallback to template with placeholders replaced
      const content = replacePlaceholders(
        template.generationPrompt || template.template, 
        templateDummyData[template.id] || {}
      );
      
      setGeneratedContent(prev => ({
        ...prev,
        [template.id]: `Error: ${errorMessage}\n\nFallback template with placeholders filled:\n\n${content}`
      }));
    } finally {
      setIsGenerating(null);
    }
  };

  const handleUseGenerated = (content: string) => {
    onSelect(content);
    setIsGenerating(null);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between bg-white border-gray-300 hover:bg-gray-50 dark:bg-gray-800/80 dark:border-gray-600 dark:hover:bg-gray-700/80"
        >
          <span className="text-gray-700 dark:text-gray-200">
            Select a template
          </span>
          <ChevronDown
            className="ml-2 h-4 w-4 text-gray-500 dark:text-gray-400"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="start">
        <div className={`p-4 border-b border-gray-200 dark:border-gray-700`}>
          <h3 className="font-medium mb-2">Prompt Templates</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {templateCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 text-sm ${
                  category.id === selectedCategory
                    ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                {category.icon} {category.name}
              </button>
            ))}
          </div>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {error && (
            <div className="p-4 text-red-500 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md m-2">
              {error}
            </div>
          )}
          {filteredTemplates.length > 0 ? (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTemplates.map((template) => (
                <li key={template.id}>
                  <div className="relative">
                    <button
                      onClick={() => handleTemplateClick(template)}
                      disabled={isGenerating === template.id}
                      className={`w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                        isGenerating === template.id ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">{template.title}</h4>
                        {isGenerating === template.id && (
                          <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {template.description}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {template.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </button>
                    
                    {generatedContent[template.id] && (
                      <div className="mt-2 p-3 text-sm bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                        <div className="max-h-40 overflow-y-auto mb-2 whitespace-pre-wrap">
                          {generatedContent[template.id]}
                        </div>
                        <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <button 
                            onClick={() => setGeneratedContent(prev => {
                              const newContent = {...prev};
                              delete newContent[template.id];
                              return newContent;
                            })}
                            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          >
                            Dismiss
                          </button>
                          <button
                            onClick={() => handleUseGenerated(generatedContent[template.id])}
                            className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                          >
                            Use This
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-gray-500">
              No templates found in this category.
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}