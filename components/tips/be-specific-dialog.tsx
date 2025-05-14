"use client";

import { useEffect, useState } from "react";
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

export function BeSpecificDialog({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [examples, setExamples] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && !examples && !isLoading) {
      loadExamples();
    }
  }, [isOpen, examples, isLoading]);

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
                content: `Create a detailed guide about being specific in prompts, including:

1. Three concrete examples of vague prompts vs specific prompts
2. A checklist of elements to include for specificity (format, style, length, tone, etc.)
3. Common mistakes to avoid
4. Best practices for different types of content (code, writing, images)

Format the response in Markdown with clear sections, bullet points, and examples. 
Ensure the result is tidy and well-structured and proper line break and format.`,
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto backdrop-blur-xl bg-white/80 dark:bg-gray-950/80 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg transition-all duration-300 ease-in-out">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center text-xl font-semibold">
            <span className="mr-3 text-2xl" role="img" aria-label="Target">
              🎯
            </span>
            Be Specific in Your Prompts
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600 dark:text-gray-300">
            Learn how to write detailed and precise prompts that get better
            results
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : (
            examples && (
              <div className="prose dark:prose-invert prose-blue max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {examples}
                </ReactMarkdown>
              </div>
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
