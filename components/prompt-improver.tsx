"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isImageGenerationPrompt } from "@/lib/image-prompt-detector";
import TurnstileWidget from "./TurnstileWidget";

// Import components
import { Tabs } from "./Tabs";
import { PromptInput } from "./PromptInput";
import { PromptSuggestions } from "./PromptSuggestions";
import { ImprovedPromptDisplay } from "./ImprovedPromptDisplay";
import { HistoryTab } from "./HistoryTab";
import { LoadingAnimation } from "./LoadingAnimation";

// Import types and constants
import { HistoryItem } from "./types";
import { TABS } from "./constants";

// Import dialog
import { PromptResultDialog } from "./prompt-result-dialog";

export default function PromptImprover() {
  const [originalPrompt, setOriginalPrompt] = useState("");
  const [improvedPrompt, setImprovedPrompt] = useState("");
  const [modelUsed, setModelUsed] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState("");
  const [isPromptDialogOpen, setIsPromptDialogOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [promptType, setPromptType] = useState<"text" | "image">("text");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState("editor");
  const [promptStyle, setPromptStyle] = useState("detailed");
  const [showTurnstile, setShowTurnstile] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const verificationToken = useRef<string>('');
  const verificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTurnstileVerify = (token: string) => {
    setVerificationStatus('verifying');
    verificationToken.current = token;
    setIsVerified(true);
    setError('');
    
    // Clear any existing timeout
    if (verificationTimeoutRef.current) {
      clearTimeout(verificationTimeoutRef.current);
    }
    
    // Add a small delay to show the verifying state
    verificationTimeoutRef.current = setTimeout(() => {
      setVerificationStatus('success');
      // Proceed with the improvement after a short delay to show success state
      setTimeout(() => {
        setShowTurnstile(false);
        processImprovePrompt();
      }, 500);
    }, 1000);
  };

  const handleTurnstileError = () => {
    setVerificationStatus('error');
    setError("Verification failed. Please try again.");
    
    // Reset after showing error
    setTimeout(() => {
      setShowTurnstile(false);
      setIsVerified(false);
      setVerificationStatus('idle');
    }, 2000);
  };

  const handleTurnstileExpire = () => {
    setVerificationStatus('error');
    setError("Verification expired. Please complete the challenge again.");
    
    // Reset after showing error
    setTimeout(() => {
      setShowTurnstile(false);
      setIsVerified(false);
      setVerificationStatus('idle');
    }, 2000);
  };

  // Update the history tab label with the current count
  const tabs = TABS.map((tab) => {
    const label = typeof tab.label === 'function' 
      ? tab.label(tab.id === 'history' ? history.length : 0)
      : tab.label;
    return {
      ...tab,
      label,
    };
  });

  const improvePrompt = async () => {
    if (!originalPrompt.trim()) {
      setError("Please enter a prompt to improve");
      return;
    }
    
    // Show Turnstile verification if not already verified
    if (!isVerified || !verificationToken.current) {
      setVerificationStatus('idle');
      setShowTurnstile(true);
      
      // Set a timeout to handle cases where user doesn't complete verification
      if (verificationTimeoutRef.current) {
        clearTimeout(verificationTimeoutRef.current);
      }
      
      verificationTimeoutRef.current = setTimeout(() => {
        if (!isVerified) {
          setVerificationStatus('error');
          setError("Verification timed out. Please try again.");
          setShowTurnstile(false);
        }
      }, 180000); // 3 minutes timeout
      
      return;
    }
    
    // If already verified, proceed with the improvement
    await processImprovePrompt();
  };
  
  const callGeminiAPI = async (prompt: string): Promise<{text: string, model: string}> => {
    if (!process.env.NEXT_PUBLIC_AI_PROXY_ENDPOINT) {
      throw new Error("AI Proxy endpoint is not configured");
    }

    const model = 'gemini-2.5-flash';
    const response = await fetch(process.env.NEXT_PUBLIC_AI_PROXY_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: `You are an expert prompt engineer.

        Transform the ORIGINAL PROMPT below into a sharper, fully-structured prompt while *strictly* preserving its original intent, context, tone, and language (English, Indonesian, or any other).

        ${
          promptStyle === "detailed"
            ? `Rewrite the original prompt to make it more structured, detailed, and comprehensive, while still concise and focused.

              Apply advanced prompt engineering principles:
              - Be specific (replace vague instructions with precise ones).
              - Provide relevant context (if already implied in the original).
              - Clarify goals and constraints explicitly.
              - Include an example only if the original prompt contains or implies one.
              - Add more necessary detail.

              IMPORTANT:
              - Do NOT explain anything. 
              - Do NOT include a format or section labels like "Context", "Task", etc.
              - DO return the improved prompt as a single paragraph or bullet-form instruction.
              - Preserve the original language (English, Indonesian, etc).`
            : "Make the prompt concise and focused while maintaining clarity."
        }

        NOTE — global rules (apply to all styles):
        1. Do not interpret the prompt or expand on it. Just rewrite it.
        2. Output the improved prompt only; no explanations.
        3. Give an example only if it already exists or is clearly required.
        4. Do not treat the original prompt as a task to perform.\n
        ORIGINAL PROMPT:
        """${prompt}"""`,
        model: model
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    if (!data.ok || !data.text) {
      throw new Error('Failed to get valid response from Gemini API');
    }

    return { text: data.text, model };
  };

  const callCloudflareAI = async (prompt: string): Promise<{text: string, model: string}> => {
    const model = 'cloudflare-ai';
    const response = await fetch(process.env.NEXT_PUBLIC_CLOUDFLARE_AI_URL || "", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: `You are an expert prompt engineer.

            Transform the ORIGINAL PROMPT below into a sharper, fully-structured prompt while *strictly* preserving its original intent, context, tone, and language (English, Indonesian, or any other).

            ${
              promptStyle === "detailed"
                ? `Rewrite the original prompt to make it more structured, detailed, and comprehensive, while still concise and focused.

                  Apply advanced prompt engineering principles:
                  - Be specific (replace vague instructions with precise ones).
                  - Provide relevant context (if already implied in the original).
                  - Clarify goals and constraints explicitly.
                  - Include an example only if the original prompt contains or implies one.
                  - Add more necessary detail.

                  IMPORTANT:
                  - Do NOT explain anything. 
                  - Do NOT include a format or section labels like "Context", "Task", etc.
                  - DO return the improved prompt as a single paragraph or bullet-form instruction.
                  - Preserve the original language (English, Indonesian, etc).`
                : "Make the prompt concise and focused while maintaining clarity."
            }

            NOTE — global rules (apply to all styles):
            1. Do not interpret the prompt or expand on it. Just rewrite it.
            2. Output the improved prompt only; no explanations.
            3. Give an example only if it already exists or is clearly required.
            4. Do not treat the original prompt as a task to perform.\n
            ORIGINAL PROMPT:
            \"\"\"${prompt}\"\"\``,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Cloudflare AI error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.result?.response || data.choices?.[0]?.message?.content || '';
    return { text, model };
  };

  const processImprovePrompt = async () => {
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
      // Try Gemini API first, fall back to Cloudflare AI if it fails
      let result;
      try {
        result = await callGeminiAPI(originalPrompt);
      } catch (geminiError) {
        console.warn('Gemini API failed, falling back to Cloudflare AI:', geminiError);
        result = await callCloudflareAI(originalPrompt);
      }
      
      const improved = result.text;
      setModelUsed(result.model);

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
    <div className="w-full min-h-screen p-4 sm:p-8 transition-colors duration-300 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-white dark:bg-gray-800/50 rounded-lg shadow-sm">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center mb-6"
        >
          <Sparkles className="mr-2 h-6 w-6 text-blue-600 dark:text-blue-400" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-blue-100">
              AI Prompt Improver
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Transform vague prompts into clear, specific, and effective
              instructions
            </p>
          </div>
        </motion.div>
        
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        
        {activeTab === "editor" ? (
          <div className="space-y-6">
            <PromptInput
              originalPrompt={originalPrompt}
              setOriginalPrompt={setOriginalPrompt}
              promptStyle={promptStyle}
              setPromptStyle={setPromptStyle}
              inputRef={inputRef}
            />

            <PromptSuggestions
              onSuggestionClick={useSuggestion}
              onTemplateSelect={(template) => {
                setOriginalPrompt(template);
                setTimeout(() => {
                  if (inputRef.current) {
                    inputRef.current.focus();
                  }
                }, 100);
              }}
            />

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-red-500 dark:text-red-400"
              >
                {error}
              </motion.p>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="space-y-4"
            >
              {/* Cloudflare Turnstile - Only show when needed */}
              <AnimatePresence>
                {showTurnstile && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="w-full overflow-hidden"
                  >
                    <div className="w-full flex flex-col items-center space-y-4">
                      <div className="text-center max-w-md">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Security Verification</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">
                          {verificationStatus === 'verifying' 
                            ? 'Verifying your request...'
                            : verificationStatus === 'success'
                            ? '✓ Verification complete!'
                            : 'Please complete the security check to continue. This helps us prevent automated requests.'}
                        </p>
                      </div>
                      <div className="w-full flex justify-center">
                        <TurnstileWidget 
                          onVerify={handleTurnstileVerify}
                          onError={handleTurnstileError}
                          onExpire={handleTurnstileExpire}
                          className="w-full max-w-[300px]"
                        />
                      </div>
                      {verificationStatus === 'error' && (
                        <div className="text-center">
                          <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                            Verification failed. The security check expired or encountered an error.
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Please complete the verification again to continue.
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                onClick={improvePrompt}
                disabled={isLoading || !originalPrompt.trim()}
                className={`w-full h-[52px] bg-blue-600 hover:bg-blue-700 text-white font-semibold relative overflow-hidden ${
                  !originalPrompt.trim() ? 'opacity-70' : ''
                } ${showTurnstile ? 'mt-4' : ''}`}
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
              <ImprovedPromptDisplay
                improvedPrompt={improvedPrompt}
                isCopied={isCopied}
                onCopy={copyToClipboard}
                onPromptIt={() => setIsPromptDialogOpen(true)}
                model={modelUsed || undefined}
                onTemplateSelect={(template) => {
                  setOriginalPrompt(template);
                  // Set focus to the input field after a small delay to ensure it's rendered
                  setTimeout(() => {
                    if (inputRef.current) {
                      inputRef.current.focus();
                    }
                  }, 100);
                }}
              />
            )}
          </div>
        ) : (
          <div className="mt-6">
            <HistoryTab
              history={history}
              onUseHistoryItem={useHistoryItem}
              onClearHistory={clearHistory}
            />
          </div>
        )}
      </div>
      
      <PromptResultDialog
        open={isPromptDialogOpen}
        onOpenChange={setIsPromptDialogOpen}
        prompt={improvedPrompt}
        type={promptType}
      />
    </div>
  );
}
