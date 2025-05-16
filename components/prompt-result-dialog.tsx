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

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CopyButton } from "./ui/copy-button";
import { Progress } from "./ui/progress";
import { renderFormattedResponse } from "@/lib/text-formatter";

interface PromptResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prompt: string;
  theme: string;
  type?: "text" | "image";
}

export function PromptResultDialog({
  open,
  onOpenChange,
  prompt,
  theme,
  type = "text",
}: PromptResultDialogProps) {
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  // New state to track which API provided the result
  const [usedApiProvider, setUsedApiProvider] = useState<
    "deepseek" | "cloudflare_text" | "cloudflare_image" | null
  >(null);

  const generateResult = async () => {
    let additionalString =
      "\nIf the prompt is asking for a story, return a third-person narrative.\n" +
      "For all other prompts, respond directly in first-person point of view.\n" +
      "Only return the response. Do not include comments, explanations, or unnecessary statements.\n";

    setIsLoading(true);
    setError("");
    setProgress(0);
    setUsedApiProvider(null); // Reset API provider at the start of generation

    // Progress simulation
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
        const response = await fetch(
          process.env.NEXT_PUBLIC_CLOUDFLARE_AI_IMG_URL || "",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt }),
          }
        );

        if (!response.ok) {
          throw new Error("Image generation failed");
        }

        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        setResult(`![Generated Image](${imageUrl})`);
        setUsedApiProvider("cloudflare_image"); // Set provider for image
        return;
      }

      // Step 1: coba DeepSeek API
      let deepseekResponse = await fetch(
        process.env.NEXT_PUBLIC_CLOUDFLARE_DEEPSEEK_AI_URL || "",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt: prompt + additionalString }),
        }
      );

      if (!deepseekResponse.ok) {
        // kalau gagal, fallback ke Cloudflare AI
        throw new Error("DeepSeek API failed, fallback");
      }

      let deepseekData = await deepseekResponse.json();
      if (!deepseekData?.text) {
        throw new Error("DeepSeek returned no text, fallback");
      }

      setProgress(100);
      setResult(deepseekData.text);
      setUsedApiProvider("deepseek"); // Set provider for DeepSeek
    } catch (err) {
      // Step 2: fallback ke Cloudflare AI
      try {
        const cfResponse = await fetch(
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
                  content: prompt + additionalString,
                },
              ],
            }),
          }
        );

        if (!cfResponse.ok) {
          throw new Error(`Cloudflare AI error: ${cfResponse.status}`);
        }

        const cfData = await cfResponse.json();
        const generatedResult = cfData?.[0]?.response?.response?.trim();

        if (!generatedResult) {
          throw new Error("Invalid Cloudflare AI response");
        }

        setProgress(100);
        setResult(generatedResult);
        setUsedApiProvider("cloudflare_text"); // Set provider for Cloudflare text AI
      } catch (fallbackErr) {
        setError(
          "Failed to generate result with both DeepSeek and Cloudflare AI."
        );
        // usedApiProvider remains null if both fail
      }
    } finally {
      clearInterval(progressInterval);
      setIsLoading(false);
    }
  };

  // Update word count when result changes
  useEffect(() => {
    if (result && type === "text") {
      // Only calculate for text type
      setWordCount(result.split(/\s+/).filter(Boolean).length);
    } else {
      setWordCount(0);
    }
  }, [result, type]); // Added type to dependency array

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setResult("");
      setError("");
      setUsedApiProvider(null); // Reset API provider when dialog closes
    }
  }, [open]);

  // Generate result when dialog opens
  useEffect(() => {
    if (open && prompt && !result && !isLoading) {
      generateResult();
    }
  }, [open, prompt]); // Removed result and isLoading from deps to avoid re-triggering on internal state change if needed, kept original for now

  const renderContent = () => {
    if (type === "image") {
      const imageMatch = result.match(/!\[.*?\]\((.*?)\)/);
      const imageUrl = imageMatch ? imageMatch[1] : null;

      return (
        <div className="space-y-4">
          <div
            className={`flex items-center gap-2 ${
              theme === "dark" ? "text-gray-300" : "text-gray-600"
            }`}
          >
            <ImageIcon className="w-5 h-5" />
            <span className="text-sm font-medium">Generated Image</span>
          </div>
          <div
            className={`p-4 rounded-lg ${
              theme === "dark" ? "bg-gray-800/50" : "bg-gray-50"
            }`}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Generated"
                className="w-full h-auto rounded-lg shadow-lg"
              />
            ) : (
              <div
                className={`text-center p-4 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Image is being generated...
              </div>
            )}
          </div>
        </div>
      );
    }
    return (
      <div
        className={`prose max-w-none ${
          theme === "dark"
            ? "prose-invert prose-p:text-gray-100 prose-headings:text-gray-100 prose-strong:text-blue-300 prose-em:text-blue-200"
            : "prose-blue prose-p:leading-relaxed prose-headings:text-gray-700"
        }`}
      >
        {renderFormattedResponse(result)}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`max-w-3xl max-h-[80vh] overflow-y-auto border shadow-lg ${
          theme === "dark"
            ? "bg-gray-900/95 backdrop-blur-sm border-gray-700"
            : "bg-white/80 backdrop-blur-sm border-gray-200/50"
        }`}
      >
        <DialogHeader>
          <DialogTitle
            className={`text-2xl font-bold tracking-tight ${
              theme === "dark"
                ? "text-blue-100"
                : "bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            }`}
          >
            {type === "image" ? "Image Generation Prompt" : "AI Response"}
          </DialogTitle>
          <DialogDescription
            className={theme === "dark" ? "text-gray-300" : "text-gray-600"}
          >
            {type === "image"
              ? "Optimized prompt for image generation"
              : "Generated response for your prompt"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          <div
            className={`p-6 rounded-2xl border transition-all duration-200 ${
              theme === "dark"
                ? "bg-gray-900/90 border-gray-700 hover:bg-gray-800"
                : "bg-gray-50/50 border-gray-100 backdrop-blur-sm hover:bg-gray-50/80"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MessageSquare
                  className={`w-4 h-4 ${
                    theme === "dark" ? "text-blue-400" : "text-blue-600"
                  }`}
                />
                <h3
                  className={`text-sm font-semibold ${
                    theme === "dark" ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  Improved Prompt
                </h3>
              </div>
              <CopyButton text={prompt} theme={theme} />
            </div>
            <p
              className={
                theme === "dark"
                  ? "text-gray-200 leading-relaxed"
                  : "text-gray-700 leading-relaxed"
              }
            >
              {prompt}
            </p>
          </div>
          <div
            className={`p-6 rounded-2xl border transition-all duration-200 ${
              theme === "dark"
                ? "bg-gray-900/90 border-gray-700"
                : "bg-white border-gray-100"
            } shadow-sm`}
          >
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col items-center justify-center py-12"
                >
                  {/* Loading UI remains the same */}
                  <div className="space-y-6 w-full max-w-md mx-auto">
                    <div className="relative">
                      <div
                        className={`absolute inset-0 rounded-full blur-xl animate-pulse ${
                          theme === "dark" ? "bg-blue-900/20" : "bg-blue-100/50"
                        }`}
                      ></div>
                      <div
                        className={`relative flex items-center gap-3 px-6 py-3 rounded-full border shadow-sm ${
                          theme === "dark"
                            ? "bg-gray-800/90 backdrop-blur-sm border-gray-600"
                            : "bg-white/80 backdrop-blur-sm border-gray-100"
                        }`}
                      >
                        {" "}
                        <div className="flex items-center gap-2">
                          <Loader2
                            className={`h-5 w-5 animate-spin ${
                              theme === "dark"
                                ? "text-blue-400"
                                : "text-blue-500"
                            }`}
                          />
                          {type === "image" && (
                            <ImageIcon
                              className={`h-5 w-5 ${
                                theme === "dark"
                                  ? "text-blue-400"
                                  : "text-blue-500"
                              }`}
                            />
                          )}
                        </div>
                        <span
                          className={`animate-pulse ${
                            theme === "dark"
                              ? "text-gray-300 font-medium"
                              : "text-gray-600 font-medium"
                          }`}
                        >
                          {type === "image"
                            ? "Generating image..."
                            : "Crafting your response..."}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Progress
                        value={progress}
                        className={`h-1 ${
                          theme === "dark" ? "bg-gray-800" : "bg-gray-100"
                        }`}
                      />
                      <p
                        className={`text-sm text-center ${
                          theme === "dark" ? "text-gray-500" : "text-gray-400"
                        }`}
                      >
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
                  {/* Error UI remains the same */}
                  <div
                    className={`flex flex-col items-center space-y-4 ${
                      theme === "dark" ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    <div
                      className={`p-4 rounded-full ${
                        theme === "dark"
                          ? "bg-red-950/50 text-red-400"
                          : "bg-red-50 text-red-500"
                      }`}
                    >
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <div className="text-center space-y-2">
                      <p className="font-medium">Error Occurred</p>
                      <p
                        className={
                          theme === "dark"
                            ? "text-gray-400 text-sm"
                            : "text-gray-500 text-sm"
                        }
                      >
                        {error}
                      </p>
                      <p
                        className={`text-xs ${
                          theme === "dark" ? "text-gray-500" : "text-gray-400"
                        }`}
                      >
                        Try refreshing or check your connection
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateResult}
                    className={`transition-all duration-200 ${
                      theme === "dark"
                        ? "border-gray-700 hover:border-gray-600 hover:bg-gray-800/80 text-gray-300"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
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
                  <div className="flex items-center justify-between mb-2">
                    {
                      type === "text" && result ? (
                        <p
                          className={`text-sm ${
                            theme === "dark" ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {wordCount} words
                        </p>
                      ) : (
                        <div />
                      ) /* Placeholder to keep layout if CopyButton is to the right */
                    }
                    <CopyButton text={result} theme={theme} />
                  </div>
                  {renderContent()}
                  {/* MODIFIED ATTRIBUTION SECTION */}
                  {!isLoading && result && usedApiProvider && (
                    <div
                      className={`flex items-center gap-2 pt-4 border-t ${
                        theme === "dark" ? "border-gray-700" : "border-gray-100"
                      }`}
                    >
                      <div
                        className={`p-2 rounded-full ${
                          theme === "dark" ? "bg-blue-900/20" : "bg-blue-50"
                        }`}
                      >
                        <img
                          src="/assets/img/ai.png"
                          alt="LLaMA Logo"
                          className="w-5 h-5 object-contain"
                        />
                      </div>
                      <span
                        className={`text-xs ${
                          theme === "dark" ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {usedApiProvider === "deepseek" &&
                          "Generated using DeepSeek-V3 AI."}
                        {usedApiProvider === "cloudflare_text" &&
                          "Generated using CF Meta LLaMA (llama-4-scout-17b-16e-instruct) for testing purposes."}
                        {usedApiProvider === "cloudflare_image" &&
                          "Image generated using CF /stable-diffusion-xl-base-1.0."}
                      </span>
                    </div>
                  )}
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
                className={`group transition-all duration-200 ${
                  theme === "dark"
                    ? "border-gray-600 hover:border-gray-500 hover:bg-gray-800"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
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
