export interface PromptTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  template: string;
  generationPrompt?: string; // Optional prompt to generate dynamic content
  tags: string[];
  author?: string;
  rating?: number;
  usageCount?: number;
}

export interface TemplateCategory {
  id: string;
  name: string;
  icon: string;
}
