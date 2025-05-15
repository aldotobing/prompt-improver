"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Copy,
  CheckCircle,
  Sparkles,
  Lightbulb,
  History,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PromptResultDialog } from "./prompt-result-dialog";

type Tab = { id: string; label: string };
type TabsProps = {
  tabs: Tab[];
  activeTab: string;
  setActiveTab: (id: string) => void;
};

const Tabs = ({ tabs, activeTab, setActiveTab }: TabsProps) => (
  <div className="flex border-b border-gray-200 mb-4 px-6">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        onClick={() => setActiveTab(tab.id)}
        className={`py-2 px-4 font-medium text-sm transition-colors duration-200 ${
          activeTab === tab.id
            ? "text-blue-600 border-b-2 border-blue-600"
            : "text-gray-600 hover:text-blue-500"
        }`}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

// Example suggestions
const PROMPT_SUGGESTIONS = [
  "Write a captivating website description.",
  "Craft an engaging short story.",
  "Develop a comprehensive business plan.",
  "Design a modern and memorable logo.",
  "Generate an image of a cat.",
  "Create a delicious and easy-to-follow recipe.",
  "Compose a professional and courteous letter.",
  "Generate a detailed project proposal.",
];

const LoadingStates = [
  "Analyzing prompt...",
  "Enhancing content...",
  "Refining details...",
  "Almost done...",
];

import { isImageGenerationPrompt } from "@/lib/image-prompt-detector";

const ProgressBar = ({ progress }: { progress: number }) => (
  <div className="w-full h-2.5 bg-gray-200/50 rounded-full overflow-hidden relative backdrop-blur-sm">
    <motion.div
      className="h-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 absolute inset-0"
      style={{
        backgroundSize: "200% 100%",
      }}
      initial={{ width: 0, backgroundPosition: "0% 50%" }}
      animate={{
        width: `${progress}%`,
        backgroundPosition: ["0% 50%", "100% 50%"],
      }}
      transition={{
        width: { duration: 0.5, ease: "easeOut" },
        backgroundPosition: {
          duration: 2,
          repeat: Infinity,
          ease: "linear",
        },
      }}
    >
      <motion.div
        className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: "-100%" }}
        animate={{ x: "100%" }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </motion.div>
  </div>
);

const LoadingAnimation = ({ progress }: { progress: number }) => {
  const [loadingStateIndex, setLoadingStateIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingStateIndex((prev) => (prev + 1) % LoadingStates.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="flex items-center justify-center gap-3 h-full px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-3">
        <motion.div
          initial={{ scale: 1 }}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Wand2 className="h-5 w-5 text-blue-400" />
        </motion.div>
        <AnimatePresence mode="wait">
          <motion.span
            key={loadingStateIndex}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.3 }}
            className="text-sm font-medium text-blue-100 min-w-[140px]"
          >
            {LoadingStates[loadingStateIndex]}
          </motion.span>
        </AnimatePresence>
        <div className="w-32">
          <ProgressBar progress={progress} />
        </div>
      </div>
    </motion.div>
  );
};

export default function PromptImprover({ theme }: { theme: string }) {
  const [originalPrompt, setOriginalPrompt] = useState("");
  const [improvedPrompt, setImprovedPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState("");
  const [isPromptDialogOpen, setIsPromptDialogOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [promptType, setPromptType] = useState<"text" | "image">("text");
  type HistoryItem = { original: string; improved: string; timestamp: number };
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState("editor");
  const [promptStyle, setPromptStyle] = useState("detailed");

  const improvePrompt = async () => {
    if (!originalPrompt.trim()) {
      setError("Please enter a prompt to improve");
      return;
    }

    setError("");
    setIsLoading(true);
    setProgress(0);

    // Determine if this is an image generation prompt
    const isImage = isImageGenerationPrompt(originalPrompt);
    setPromptType(isImage ? "image" : "text");

    // Simulate progress steps
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.random() * 15;
        return next > 90 ? 90 : next;
      });
    }, 500);

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
                content: `You are an expert prompt engineer. 
                          Analyze and enhance the following prompt while strictly preserving its original intent, 
                          context, tone, and language (English, Indonesian, or other). Give direct example.
                          ${
                            promptStyle === "detailed"
                              ? "Make it more structured, detail, comprehensive with clear sections and examples, but keep it concise and not overly long.\n"
                              : "Make the prompt concise and focused while maintaining clarity.\n"
                          }
                          NOTE : 
                          1. Do not interpret the prompt or expand on it. Just rewrite the prompt itself.\n
                          2. Only output the improved version of the prompt, as a single line or paragraph, and nothing else.\n
                          3. Do not include any additional explanations or comments.\n
                          4. Give example only if necessary.\n
                          5. Do not treat the original prompt as a task to perform. \n

                          DO FOR ALL LANGUAGES, NOT JUST ENGLISH.\n
                          
                Original prompt: "${originalPrompt}"`,
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const improved = data?.[0]?.response?.response?.trim();

      if (!improved) {
        throw new Error("Invalid AI response format.");
      }

      clearInterval(progressInterval);
      setProgress(100);

      // Delay setting the improved prompt for a smooth progress bar completion
      setTimeout(() => {
        setImprovedPrompt(improved);
        setHistory((prev) => [
          { original: originalPrompt, improved, timestamp: Date.now() },
          ...prev.slice(0, 9),
        ]);
      }, 500);
    } catch (err) {
      console.error("Error improving prompt:", err);
      clearInterval(progressInterval);
      setProgress(0);
      setError("Failed to improve prompt. Please try again.");
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(improvedPrompt);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  interface SuggestionHandler {
    (suggestion: string): void;
  }

  const useSuggestion: SuggestionHandler = (suggestion) => {
    setOriginalPrompt(suggestion);
  };

  const useHistoryItem = (item: {
    original: any;
    improved: any;
    timestamp?: number;
  }) => {
    setOriginalPrompt(item.original);
    setImprovedPrompt(item.improved);
    setActiveTab("editor");
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <div
      className={`w-full min-h-screen p-4 sm:p-8 transition-colors duration-300 ${
        theme === "dark" ? "bg-gray-900 text-gray-100" : "bg-gray-50"
      }`}
    >
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-0">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center mb-6"
        >
          <Sparkles
            className={`mr-2 h-6 w-6 ${
              theme === "dark" ? "text-blue-400" : "text-blue-600"
            }`}
          />
          <div>
            <h1
              className={`text-2xl font-bold ${
                theme === "dark" ? "text-blue-100" : "text-gray-900"
              }`}
            >
              AI Prompt Improver
            </h1>
            <p className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>
              Transform vague prompts into clear, specific, and effective
              instructions
            </p>
          </div>
        </motion.div>
        <Tabs
          tabs={[
            { id: "editor", label: "Editor" },
            { id: "history", label: `History (${history.length})` },
          ]}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        {activeTab === "editor" ? (
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="flex justify-between items-center mb-2">
                <label
                  htmlFor="original-prompt"
                  className={`block text-sm font-medium ${
                    theme === "dark" ? "text-gray-300" : "text-gray-800"
                  }`}
                >
                  Original Prompt
                </label>
                <div className="flex gap-2">
                  <label htmlFor="prompt-style" className={`sr-only`}>
                    Prompt Style
                  </label>
                  <Select value={promptStyle} onValueChange={setPromptStyle}>
                    <SelectTrigger
                      className={`w-24 ${
                        theme === "dark"
                          ? "bg-gray-800/90 border-gray-600 text-gray-200 ring-offset-gray-900"
                          : "bg-white border-gray-300 text-gray-800"
                      }`}
                    >
                      <SelectValue placeholder="Style" />
                    </SelectTrigger>
                    <SelectContent
                      className={`${
                        theme === "dark"
                          ? "bg-gray-800 border-gray-600 text-gray-200"
                          : "bg-white border-gray-300 text-gray-800"
                      }`}
                    >
                      <SelectItem
                        value="detailed"
                        className={`${
                          theme === "dark"
                            ? "focus:bg-gray-700 focus:text-gray-100"
                            : ""
                        }`}
                      >
                        Detailed
                      </SelectItem>
                      <SelectItem
                        value="concise"
                        className={`${
                          theme === "dark"
                            ? "focus:bg-gray-700 focus:text-gray-100"
                            : ""
                        }`}
                      >
                        Concise
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Textarea
                id="original-prompt"
                placeholder="Enter your original prompt here..."
                value={originalPrompt}
                onChange={(e) => setOriginalPrompt(e.target.value)}
                rows={5}
                className={`w-full border ${
                  theme === "dark"
                    ? "bg-gray-800/90 border-gray-600 text-gray-200 placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-800 placeholder-gray-400"
                } focus:ring-blue-500 focus:border-blue-500`}
              />
            </motion.div>

            <div className="flex items-center mb-2">
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {PROMPT_SUGGESTIONS.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => useSuggestion(suggestion)}
                  className={`text-xs px-2 py-1 rounded transition-colors duration-150 ${
                    theme === "dark"
                      ? "bg-gray-800/80 text-gray-200 hover:bg-gray-700 border-gray-600 hover:text-gray-100 hover:border-gray-500"
                      : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300 hover:border-gray-400"
                  } border`}
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`${
                  theme === "dark" ? "text-red-400" : "text-red-500"
                } text-sm`}
              >
                {error}
              </motion.p>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <Button
                onClick={improvePrompt}
                disabled={isLoading || !originalPrompt.trim()}
                className={`w-full h-[52px] ${
                  theme === "dark"
                    ? "bg-blue-600 hover:bg-blue-500"
                    : "bg-blue-600 hover:bg-blue-700"
                } text-white font-semibold relative overflow-hidden`}
              >
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div
                      key="loading"
                      className="w-full h-full absolute inset-0 flex flex-col items-center justify-center bg-blue-600"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <LoadingAnimation progress={progress} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="default"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center"
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Improve Prompt
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>

            {improvedPrompt && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <div className="mb-2">
                  <label
                    htmlFor="improved-prompt"
                    className={`block text-sm font-medium ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Improved Prompt
                  </label>
                </div>
                <div
                  className={`p-6 rounded-lg shadow-lg border ${
                    theme === "dark"
                      ? "bg-gray-800/90 border-gray-600"
                      : "bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200"
                  }`}
                >
                  <div
                    className={`prose max-w-none mb-4 ${
                      theme === "dark"
                        ? "prose-invert prose-p:text-gray-200 prose-headings:text-gray-100 prose-strong:text-blue-300 prose-em:text-blue-200"
                        : "prose-blue"
                    }`}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {improvedPrompt}
                    </ReactMarkdown>
                  </div>
                  <div className="flex justify-end">
                    <motion.div
                      whileTap={{ scale: 0.9 }}
                      animate={{ scale: isCopied ? 1.1 : 1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={copyToClipboard}
                          className={`${
                            isCopied
                              ? theme === "dark"
                                ? "bg-green-900/50 border-green-400 text-green-400"
                                : "bg-green-100 border-green-600 text-green-600"
                              : theme === "dark"
                              ? "bg-gray-700/50 hover:bg-gray-700/80 border-gray-500 text-gray-200"
                              : "bg-white/50 hover:bg-white/80 border-gray-300"
                          }`}
                        >
                          {isCopied ? (
                            <>
                              <CheckCircle className="mr-1 h-4 w-4" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="mr-1 h-4 w-4" />
                              Copy
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsPromptDialogOpen(true)}
                          className={`${
                            theme === "dark"
                              ? "bg-gray-700/50 hover:bg-gray-700/80 border-gray-500 text-gray-200"
                              : "bg-white/50 hover:bg-white/80 border-gray-300"
                          }`}
                        >
                          <Sparkles className="mr-1 h-4 w-4" />
                          Prompt It
                        </Button>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          <CardContent
            className={
              theme === "dark"
                ? "bg-gray-800/80 border border-gray-700 rounded-lg"
                : ""
            }
          >
            <div className="flex justify-between items-center mb-4">
              <h3
                className={`font-medium ${
                  theme === "dark" ? "text-gray-200" : "text-gray-800"
                }`}
              >
                Recent Prompts
              </h3>
              {history.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearHistory}
                  className={`${
                    theme === "dark"
                      ? "text-red-400 border-red-400 hover:bg-red-950/30"
                      : "text-red-500 border-red-500 hover:bg-red-50"
                  }`}
                >
                  Clear History
                </Button>
              )}
            </div>

            {history.length === 0 ? (
              <div
                className={`text-center py-8 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                <History className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p>No prompt history yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-3 rounded border cursor-pointer transition-colors duration-150 ${
                      theme === "dark"
                        ? "border-gray-700 hover:bg-gray-700/50 text-gray-300"
                        : "border-gray-200 hover:bg-gray-50 text-gray-700"
                    }`}
                    onClick={() => useHistoryItem(item)}
                  >
                    <div className="flex justify-between">
                      <p className="font-medium truncate">
                        {item.original.length > 40
                          ? `${item.original.substring(0, 40)}...`
                          : item.original}
                      </p>
                      <span
                        className={`text-xs ${
                          theme === "dark" ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </div>
      <PromptResultDialog
        open={isPromptDialogOpen}
        onOpenChange={setIsPromptDialogOpen}
        prompt={improvedPrompt}
        theme={theme}
        type={promptType}
      />
    </div>
  );
}
