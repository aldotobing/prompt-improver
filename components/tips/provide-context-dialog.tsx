"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function ProvideContextDialog({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [examples, setExamples] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const loadExamples = async () => {
    if (examples || isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_CLOUDFLARE_AI_URL || "",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [
              {
                role: "user",
                content: `Create a comprehensive guide about providing context in AI prompts, including:

1. Three real-world examples comparing prompts with and without proper context
2. Guidelines for what context to include (audience, purpose, technical level, etc.)
3. How to structure context effectively (order, priority, relevance)
4. Tips for different domains (programming, writing, design)

Format the response in Markdown with clear sections, bullet points, and examples.`,
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data?.[0]?.response?.response?.trim();

      if (!content) {
        throw new Error("Invalid AI response format.");
      }

      setExamples(content);
    } catch (err) {
      console.error("Error loading examples:", err);
      setExamples("Failed to load examples. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto backdrop-blur-xl bg-white/80 dark:bg-gray-950/80 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg transition-all duration-300 ease-in-out">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center text-xl font-semibold">
            <span className="mr-3 text-2xl" role="img" aria-label="Magnifying Glass">
              🔍
            </span>
            Provide Context in Your Prompts
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600 dark:text-gray-300">
            Learn how to give AI the background information it needs
          </DialogDescription>
        </DialogHeader>        <div className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : examples ? (
            <div className="prose dark:prose-invert prose-blue max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {examples}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <button
                onClick={loadExamples}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Load Examples
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
