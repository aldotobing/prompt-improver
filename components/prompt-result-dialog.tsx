import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, MessageSquare, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PromptResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prompt: string;
}

export function PromptResultDialog({
  open,
  onOpenChange,
  prompt,
}: PromptResultDialogProps) {
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const generateResult = async () => {
    setIsLoading(true);
    setError("");
    try {
      //   console.log("Generating result for prompt:", prompt); // Debug log
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
                content: prompt,
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      //   console.log("API Response:", data); // Debug log

      const generatedResult = data?.[0]?.response?.response?.trim();

      if (!generatedResult) {
        throw new Error("Invalid AI response format.");
      }

      setResult(generatedResult);
    } catch (err) {
      //   console.error("Error generating result:", err);
      setError("Failed to generate result. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setResult("");
      setError("");
    }
  }, [open]);

  // Generate result when dialog opens
  useEffect(() => {
    if (open && prompt && !result && !isLoading) {
      generateResult();
    }
  }, [open, prompt]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI Response
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            Generated response for your prompt
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          <div className="p-6 rounded-2xl bg-gray-50/50 border border-gray-100 backdrop-blur-sm transition-all duration-200 hover:bg-gray-50/80">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-medium text-gray-700">Your Prompt</h3>
            </div>
            <p className="text-gray-600 leading-relaxed">{prompt}</p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm transition-all duration-200">
            <h3 className="text-sm font-medium text-gray-700 mb-4">
              AI Response:
            </h3>
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col items-center justify-center py-12"
                >
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-blue-100/50 blur-xl animate-pulse"></div>
                    <div className="relative flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full border border-gray-100 shadow-sm">
                      <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                      <span className="text-gray-600 font-medium">
                        Crafting your response...
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mt-4">
                    This will only take a moment
                  </p>
                </motion.div>
              ) : error ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center py-8"
                >
                  <div className="inline-block p-4 rounded-full bg-red-50 text-red-500 mb-4">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateResult}
                    className="border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div className="prose prose-blue max-w-none prose-p:leading-relaxed prose-headings:text-gray-700">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {result}
                    </ReactMarkdown>
                  </div>
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                    <div className="p-2 rounded-full bg-blue-50">
                      <img
                        src="/assets/img/llama.png"
                        alt="LLaMA Logo"
                        className="w-5 h-5 object-contain"
                      />
                    </div>
                    <span className="text-xs text-gray-400">
                      Generated using Meta LLaMA
                      (llama-4-scout-17b-16e-instruct) for testing purposes.
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {!isLoading && result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-end"
            >
              <Button
                variant="outline"
                onClick={generateResult}
                className="group border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
              >
                <RefreshCw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                Regenerate
              </Button>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
