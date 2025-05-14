"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Loader2,
  Copy,
  CheckCircle,
  Sparkles,
  Lightbulb,
  History,
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
  "Plan an unforgettable vacation itinerary.",
  "Create a delicious and easy-to-follow recipe.",
  "Compose a professional and courteous letter.",
  "Generate a detailed project proposal.",
];

export default function PromptImprover({ theme }: { theme: string }) {
  const [originalPrompt, setOriginalPrompt] = useState("");
  const [improvedPrompt, setImprovedPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState("");
  const [isPromptDialogOpen, setIsPromptDialogOpen] = useState(false);
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
                          5. Do not treat the original prompt as a task to perform.
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

      setImprovedPrompt(improved);

      // Add to history
      setHistory((prev) => [
        { original: originalPrompt, improved, timestamp: Date.now() },
        ...prev.slice(0, 9),
      ]);
    } catch (err) {
      console.error("Error improving prompt:", err);
      setError("Failed to improve prompt. Please try again.");
    } finally {
      setIsLoading(false);
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
                theme === "dark" ? "text-gray-200" : "text-gray-900"
              }`}
            >
              AI Prompt Improver
            </h1>
            <p className={theme === "dark" ? "text-gray-400" : "text-gray-700"}>
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
                    <SelectTrigger className="w-24">
                      <SelectValue placeholder="Style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="detailed">Detailed</SelectItem>
                      <SelectItem value="concise">Concise</SelectItem>
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
                    ? "bg-gray-800 border-gray-600 text-gray-300 placeholder-gray-500"
                    : "bg-white border-gray-300 text-gray-800 placeholder-gray-400"
                } focus:ring-blue-500 focus:border-blue-500`}
              />
            </motion.div>

            <div className="flex items-center mb-2">
              <Lightbulb className="h-4 w-4 mr-2 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">
                Try these examples:
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {PROMPT_SUGGESTIONS.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => useSuggestion(suggestion)}
                  className="text-xs px-2 py-1 rounded bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 text-sm"
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
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Improving...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Improve Prompt
                  </>
                )}
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
                    className="block text-sm font-medium text-gray-700"
                  >
                    Improved Prompt
                  </label>
                </div>
                <div className="p-6 rounded-lg shadow-lg bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200">
                  <div className="prose prose-blue mb-4">
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
                              ? "bg-green-100 border-green-600 text-green-600"
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
                          className="bg-white/50 hover:bg-white/80 border-gray-300"
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
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-gray-800">Recent Prompts</h3>
              {history.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearHistory}
                  className={`text-red-500 border-red-500 hover:bg-red-50`}
                >
                  Clear History
                </Button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
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
                    className="p-3 rounded border cursor-pointer border-gray-200 hover:bg-gray-50"
                    onClick={() => useHistoryItem(item)}
                  >
                    <div className="flex justify-between">
                      <p className="font-medium truncate text-gray-700">
                        {item.original.length > 40
                          ? `${item.original.substring(0, 40)}...`
                          : item.original}
                      </p>
                      <span className="text-xs text-gray-400">
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
      />
    </div>
  );
}
