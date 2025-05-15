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
import { renderFormattedResponse } from "@/lib/text-formatter";

export function ProvideContextDialog({
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
                content: `Create a concise guide on providing context in AI prompts, formatted in Markdown. Include:

    1.  Examples:
        *   Three examples showing a prompt without context, the same prompt with added context, and an explanation of the improvement.
    2.  Context Guidelines:
        *   Key elements: target audience, project goals, required expertise, desired outcome, background info.
    3.  Structure:
        *   Best practices for organizing context: logical order, priority, relevance, length optimization, clear separation of background vs requirements.
    4.  Domain-Specific Tips:
        *   Context needs for programming, writing, design, documentation, and data analysis.

    Use clear Markdown with headings, bullet points, before/after examples, and consistent formatting. Add line breaks between sections.`,
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
            <span
              className="mr-3 text-2xl"
              role="img"
              aria-label="Magnifying Glass"
            >
              🔍
            </span>
            Provide Context in Your Prompts
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600 dark:text-gray-300">
            Learn how to give AI the background information it needs
          </DialogDescription>
        </DialogHeader>{" "}
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
                  Preparing your context guide...
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Loading tips and examples to help you provide better context
                  in your prompts
                </p>
              </div>
            </div>
          ) : examples ? (
            <div className="prose dark:prose-invert prose-blue max-w-none">
              {renderFormattedResponse(examples)}
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
