import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle, Copy, Sparkles } from "lucide-react";
import { ImprovedPromptDisplayProps } from "./types";
import { renderFormattedResponse } from "@/lib/text-formatter";

export const ImprovedPromptDisplay = ({
  theme,
  improvedPrompt,
  isCopied,
  onCopy,
  onPromptIt,
}: ImprovedPromptDisplayProps) => (
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
              onClick={onPromptIt}
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
);
