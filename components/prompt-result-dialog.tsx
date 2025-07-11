import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertCircle,
  ImageIcon,
  Loader2,
  MessageSquare,
  RefreshCw,
} from "lucide-react";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CopyButton } from "./ui/copy-button";
import { Progress } from "./ui/progress";
import { renderFormattedResponse } from "@/lib/text-formatter";

import {
  INITIAL_MESSAGES_TEXT,
  INITIAL_MESSAGES_IMAGE,
  GEMINI_MESSAGES,
  DEEPSEEK_MESSAGES,
  CLOUDFLARE_LLAMA_MESSAGES,
  IMAGE_GENERATION_MESSAGES,
  DEFAULT_INITIAL_MESSAGE_TEXT,
  DEFAULT_INITIAL_MESSAGE_IMAGE,
} from "@/lib/loading-messages";

interface PromptResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prompt: string;
  type?: "text" | "image";
}

export function PromptResultDialog({
  open,
  onOpenChange,
  prompt,
  type = "text",
}: PromptResultDialogProps) {
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [usedApiProvider, setUsedApiProvider] = useState<
    "gemini" | "deepseek" | "cloudflare_text" | "cloudflare_image" | null
  >(null);

  const [displayedLoadingMessage, setDisplayedLoadingMessage] = useState(
    type === "image"
      ? DEFAULT_INITIAL_MESSAGE_IMAGE
      : DEFAULT_INITIAL_MESSAGE_TEXT
  );
  const animationIntervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const currentMessageArrayIndexRef = useRef(0);

  const stopLoadingAnimation = () => {
    if (animationIntervalIdRef.current) {
      clearInterval(animationIntervalIdRef.current);
      animationIntervalIdRef.current = null;
    }
  };

  const startLoadingAnimation = (messages: string[]) => {
    stopLoadingAnimation(); // Clear any existing animation

    if (!messages || messages.length === 0) {
      setDisplayedLoadingMessage(
        type === "image" ? "Generating image..." : "Generating text..."
      );
      return;
    }

    currentMessageArrayIndexRef.current = 0;
    setDisplayedLoadingMessage(messages[0]);

    if (messages.length > 1) {
      animationIntervalIdRef.current = setInterval(() => {
        const nextIndex = currentMessageArrayIndexRef.current + 1;

        if (nextIndex < messages.length) {
          currentMessageArrayIndexRef.current = nextIndex;
          setDisplayedLoadingMessage(messages[nextIndex]);
        } else {
          stopLoadingAnimation();
        }
      }, 2000);
    }
  };

  const generateResult = async () => {
    let additionalString =
      "\n\n" +
      "**GENERAL RULES:**\n" +
      "- Respond directly to the prompt.\n" +
      "- Do not include explanations, extra commentary, or formatting notes.\n" +
      "- Use clear, natural language, and maintain professionalism when appropriate.\n\n" +
      "**STORY:**\n" +
      "- If the prompt asks for a story, respond in a third-person narrative.\n" +
      "- Write with emotional depth, character development, and plot.\n\n" +
      "**BUSINESS PLAN / PLANNING:**\n" +
      "- If the prompt asks for a business plan or strategic document, respond in first-person perspective (e.g., “We plan to…”).\n" +
      "- Use headings, subheadings, and structured layout when necessary.\n" +
      "- Include charts, tables, or bullet points when helpful.\n\n" +
      "**LETTER:**\n" +
      "- If the prompt asks to generate a letter, write in first-person narrative (“I” or “We”).\n" +
      "- **Do not include placeholder blocks** like [Your Name], [Date], etc.\n" +
      "- Start directly from the salutation (e.g., “Dear Sir or Madam,”).\n" +
      "- Structure with an intro, body, and closing.\n" +
      "- Use a formal tone unless stated otherwise.\n\n" +
      "**FORMATTING:**\n" +
      "- Include tables if needed.\n" +
      "- Use lists where appropriate.\n";

    setIsLoading(true);
    setError("");
    setProgress(0);
    setUsedApiProvider(null);

    // Start initial loading animation
    startLoadingAnimation(
      type === "image" ? INITIAL_MESSAGES_IMAGE : INITIAL_MESSAGES_TEXT
    );

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 500);

    try {
      if (type === "image") {
        startLoadingAnimation(IMAGE_GENERATION_MESSAGES);
        const response = await fetch(
          process.env.NEXT_PUBLIC_CLOUDFLARE_AI_IMG_URL || "",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt }),
          }
        );
        if (!response.ok) throw new Error("Image generation failed");
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        setResult(`![Generated Image](${imageUrl})`);
        setUsedApiProvider("cloudflare_image");
        return;
      }

      // First try Gemini
      try {
        startLoadingAnimation(GEMINI_MESSAGES); // Use Gemini-specific messages
        const geminiResponse = await fetch(
          process.env.NEXT_PUBLIC_AI_PROXY_ENDPOINT || "",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt: prompt + additionalString,
              model: 'gemini-2.5-flash'
            }),
          }
        );
        if (!geminiResponse.ok) throw new Error("Gemini API failed, falling back to DeepSeek");
        const geminiData = await geminiResponse.json();
        if (!geminiData?.text) throw new Error("Gemini returned no text, falling back to DeepSeek");
        setResult(geminiData.text);
        setUsedApiProvider("gemini");
        return;
      } catch (geminiError) {
        console.warn("Gemini API failed, falling back to DeepSeek:", geminiError);
        
        // Fallback to DeepSeek
        try {
          startLoadingAnimation(DEEPSEEK_MESSAGES);
          const deepseekResponse = await fetch(
            process.env.NEXT_PUBLIC_CLOUDFLARE_DEEPSEEK_AI_URL || "",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ prompt: prompt + additionalString }),
            }
          );
          if (!deepseekResponse.ok) throw new Error("DeepSeek API failed, falling back to Cloudflare LLaMA");
          const deepseekData = await deepseekResponse.json();
          if (!deepseekData?.text) throw new Error("DeepSeek returned no text, falling back to Cloudflare LLaMA");
          setResult(deepseekData.text);
          setUsedApiProvider("deepseek");
          return;
        } catch (deepseekError) {
          console.warn("DeepSeek API failed, falling back to Cloudflare LLaMA:", deepseekError);
          throw new Error("Both Gemini and DeepSeek failed, trying Cloudflare LLaMA");
        }
      }
    } catch (err) {
      if (type === "text") {
        // Fallback for text generation
        try {
          startLoadingAnimation(CLOUDFLARE_LLAMA_MESSAGES);
          const cfResponse = await fetch(
            process.env.NEXT_PUBLIC_CLOUDFLARE_AI_URL || "",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                messages: [
                  { role: "user", content: prompt + additionalString },
                ],
              }),
            }
          );
          if (!cfResponse.ok)
            throw new Error(`Cloudflare AI error: ${cfResponse.status}`);
          const cfData = await cfResponse.json();
          const generatedResult = cfData?.[0]?.response?.response?.trim();
          if (!generatedResult)
            throw new Error("Invalid Cloudflare AI response");
          setResult(generatedResult);
          setUsedApiProvider("cloudflare_text");
        } catch (fallbackErr) {
          setError(
            "Failed to generate result with both DeepSeek and Cloudflare AI."
          );
        }
      } else {
        // Image generation or other errors
        setError(
          err instanceof Error
            ? err.message
            : "An unexpected error occurred during generation."
        );
      }
    } finally {
      clearInterval(progressInterval);
      stopLoadingAnimation();
      setIsLoading(false);
      setProgress(100); // Ensure progress is 100 if not already
    }
  };

  useEffect(() => {
    if (result && type === "text") {
      setWordCount(result.split(/\s+/).filter(Boolean).length);
    } else {
      setWordCount(0);
    }
  }, [result, type]);

  useEffect(() => {
    if (!open) {
      setResult("");
      setError("");
      setUsedApiProvider(null);
      stopLoadingAnimation();
      setDisplayedLoadingMessage(
        type === "image"
          ? DEFAULT_INITIAL_MESSAGE_IMAGE
          : DEFAULT_INITIAL_MESSAGE_TEXT
      );
      setProgress(0); // Reset progress
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, type]); // type added for correct message reset

  useEffect(() => {
    if (open && prompt && !result && !isLoading) {
      // Set initial message correctly before starting animation in generateResult
      setDisplayedLoadingMessage(
        type === "image" ? INITIAL_MESSAGES_IMAGE[0] : INITIAL_MESSAGES_TEXT[0]
      );
      generateResult();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, prompt, type]); // type added to re-trigger if type changes when closed then opened

  const renderContent = () => {
    if (type === "image") {
      const imageMatch = result.match(/!\[.*?\]\((.*?)\)/);
      const imageUrl = imageMatch ? imageMatch[1] : null;

      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <ImageIcon className="w-5 h-5" />
            <span className="text-sm font-medium">Generated Image</span>
          </div>
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Generated"
                className="w-full h-auto rounded-lg shadow-lg"
              />
            ) : (
              <div className="text-center p-4 text-gray-500 dark:text-gray-400">
                Image is being generated...
              </div>
            )}
          </div>
        </div>
      );
    }
    return (
      <div className="prose max-w-none dark:prose-invert dark:prose-p:text-gray-100 dark:prose-headings:text-gray-100 dark:prose-strong:text-blue-300 dark:prose-em:text-blue-200 prose-blue prose-p:leading-relaxed prose-headings:text-gray-700">
        {renderFormattedResponse(result)}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
              {type === "image" ? "Image Generation" : "Text Generation"} Result
            </DialogTitle>
            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generating...</span>
              </div>
            )}
          </div>
        </DialogHeader>
        <div className="space-y-6 mt-6">
          {/* ... (Improved Prompt section remains the same) */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Improved Prompt</h3>
            <p className="text-gray-800 dark:text-gray-200">{prompt}</p>
          </div>

          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {type === "image" ? "Generated Image" : "Generated Text"}
              </h3>
              {!isLoading && usedApiProvider && (
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                    {usedApiProvider === 'gemini' && 'Google Gemini'}
                    {usedApiProvider === 'deepseek' && 'DeepSeek-v3'}
                    {usedApiProvider === 'cloudflare_text' && 'Meta LLaMA'}
                    {usedApiProvider === 'cloudflare_image' && 'Stable Diffusion XL'}
                  </span>
                  <div className="relative group">
                    <CopyButton 
                      text={result} 
                      theme={document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
                    />
                    <div className="absolute left-1/2 -translate-x-1/2 -bottom-8 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      Copy to clipboard
                    </div>
                  </div>
                </div>
              )}
            </div>
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col items-center justify-center py-12"
                >
                  <div className="space-y-6 w-full max-w-md mx-auto text-center">
                    {" "}
                    {/* Centered text */}
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full blur-xl bg-blue-900/20 dark:bg-blue-900/20" />
                      <div className="relative flex items-center justify-center gap-3 px-6 py-3 rounded-full border shadow-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-600">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin text-blue-400 dark:text-blue-400" />
                          {type === "image" && (
                            <ImageIcon className="h-5 w-5 text-blue-400 dark:text-blue-400" />
                          )}
                        </div>
                        <span className="text-sm min-h-[1.25em] text-gray-700 dark:text-gray-300 font-medium">
                          {displayedLoadingMessage}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Progress
                        value={progress}
                        className="h-1 bg-gray-200 dark:bg-gray-800"
                      />
                      <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                        This will only take a moment
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : error ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center py-8"
                >
                  <div className="flex flex-col items-center space-y-4 text-gray-600 dark:text-gray-300">
                    <div className="p-4 rounded-full border border-gray-100 dark:border-gray-700">
                      <div className="p-2 rounded-full bg-blue-50 dark:bg-blue-900/20">
                        <img
                          src="/assets/img/ai.png"
                          alt="LLaMA Logo"
                          className="w-5 h-5 object-contain"
                        />
                      </div>
                      <div className="text-sm text-red-500 dark:text-red-400">
                        {error}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {usedApiProvider === "gemini" &&
                          "Generated using Google Gemini as the primary AI."}
                        {usedApiProvider === "deepseek" &&
                          "Generated using DeepSeek-v3 AI as a fallback."}
                        {usedApiProvider === "cloudflare_text" &&
                          "Generated using Meta LLaMA (llama-4-scout-17b-16e-instruct) as a final fallback."}
                        {usedApiProvider === "cloudflare_image" &&
                          "Image generated using Stable Diffusion XL."}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                renderContent()
              )}
            </AnimatePresence>
          </div>

          {/* Single Regenerate button at the bottom */}
          {!isLoading && result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700"
            >
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {usedApiProvider === "gemini" && "Using Google Gemini"}
                {usedApiProvider === "deepseek" && "Fell back to DeepSeek-v3 AI"}
                {usedApiProvider === "cloudflare_text" && "Using Meta LLaMA as final fallback"}
                {usedApiProvider === "cloudflare_image" && "Image generated with Stable Diffusion XL"}
              </div>
              <Button
                variant="outline"
                onClick={generateResult}
                className="group transition-all duration-200 border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-800"
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
