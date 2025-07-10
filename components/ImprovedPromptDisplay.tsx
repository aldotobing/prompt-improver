import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle, Copy, Sparkles } from "lucide-react";
import { ImprovedPromptDisplayProps } from "./types";
import { useTheme } from "next-themes";
import { renderFormattedResponse } from "@/lib/text-formatter";

export const ImprovedPromptDisplay = ({
  improvedPrompt,
  isCopied,
  onCopy,
  onPromptIt,
}: ImprovedPromptDisplayProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6, duration: 0.5 }}
    >
    <div className="mb-2">
      <label
        htmlFor="improved-prompt"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        Improved Prompt
      </label>
    </div>
    <div className="p-6 rounded-lg shadow-lg border bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 dark:bg-gray-800/90 dark:border-gray-600">
      <div className="prose max-w-none mb-4 prose-blue dark:prose-invert dark:prose-p:text-gray-200 dark:prose-headings:text-gray-100 dark:prose-strong:text-blue-300 dark:prose-em:text-blue-200">
        {renderFormattedResponse(improvedPrompt)}
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
              onClick={onCopy}
              className={`${
                isCopied
                  ? "bg-green-100 border-green-600 text-green-600 dark:bg-green-900/50 dark:border-green-400 dark:text-green-400"
                  : "bg-white/50 hover:bg-white/80 border-gray-300 dark:bg-gray-700/50 dark:hover:bg-gray-700/80 dark:border-gray-500 dark:text-gray-200"
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
              onClick={onPromptIt}
              className="bg-white/50 hover:bg-white/80 border-gray-300 dark:bg-gray-700/50 dark:hover:bg-gray-700/80 dark:border-gray-500 dark:text-gray-200"
            >
              <Sparkles className="mr-1 h-4 w-4" />
              Prompt It
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
    </motion.div>
  );
};
