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
import { renderFormattedResponse } from "@/lib/text-formatter";

export function BeSpecificDialog({
  isOpen,
  onClose,
  clickPosition,
}: {
  isOpen: boolean;
  onClose: () => void;
  clickPosition: { x: number; y: number };
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
            // guide: true,
            messages: [
              {
                role: "user",
                content: `Create a concise guide on being specific in prompts, covering:

    1.  **Vague vs. Specific Examples:** Provide 3 examples of vague prompts improved with specificity. Show the original and improved versions.
    2.  **Specificity Checklist:** A checklist for specific prompts, including format, style, length, and tone.
    3.  **Common Mistakes:** Detail frequent prompt mistakes and how to avoid them.
    4.  **Best Practices by Content Type:** Best practices for code, writing, images, etc.

    Format as clear Markdown with sections, bullet points, before/after examples, and consistent formatting. Add line breaks between sections.`,
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
      <DialogContent
        style={
          {
            "--click-x": `${clickPosition.x}px`,
            "--click-y": `${clickPosition.y}px`,
          } as React.CSSProperties
        }
        className="max-w-2xl max-h-[80vh] overflow-y-auto backdrop-blur-xl bg-white/80 dark:bg-gray-950/80 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg transition-all duration-500 ease-out scale-100 opacity-100 animate-in data-[state=open]:animate-scale-up [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-gray-700 [&::-webkit-scrollbar-track]:bg-transparent origin-[var(--click-x)_var(--click-y)]"
      >
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
          {" "}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-12">
              <div className="relative">
                <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
                <div className="absolute inset-0 animate-ping opacity-50 rounded-full bg-blue-500/20"></div>
              </div>
              <div className="text-center space-y-2">
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  Crafting your guide to better prompts...
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Loading tips and examples to help you write more specific and
                  effective prompts
                </p>
              </div>
            </div>
          ) : (
            examples && (
              <div className="prose dark:prose-invert prose-blue max-w-none">
                {renderFormattedResponse(examples)}
              </div>
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
