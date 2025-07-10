import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { History, Trash2 } from "lucide-react";
import { HistoryItem, ThemeProps } from "./types";

interface HistoryTabProps extends ThemeProps {
  history: HistoryItem[];
  onUseHistoryItem: (item: HistoryItem) => void;
  onClearHistory: () => void;
}

export const HistoryTab = ({
  theme,
  history,
  onUseHistoryItem,
  onClearHistory,
}: HistoryTabProps) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-medium">Prompt History</h3>
      {history.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearHistory}
          className={`flex items-center gap-1 ${
            theme === "dark"
              ? "text-red-400 hover:bg-red-900/20"
              : "text-red-600 hover:bg-red-100"
          }`}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Clear All
        </Button>
      )}
    </div>

    {history.length === 0 ? (
      <div
        className={`flex flex-col items-center justify-center py-12 px-4 text-center rounded-lg border-2 border-dashed ${
          theme === "dark"
            ? "border-gray-700 text-gray-400"
            : "border-gray-200 text-gray-500"
        }`}
      >
        <History className="h-10 w-10 mb-2 opacity-50" />
        <p className="text-sm">No prompt history yet</p>
        <p className="text-xs mt-1">
          Your improved prompts will appear here
        </p>
      </div>
    ) : (
      <div className="space-y-3">
        {history.map((item, index) => (
          <motion.div
            key={item.timestamp}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`p-3 rounded-lg cursor-pointer transition-colors ${
              theme === "dark"
                ? "bg-gray-800/50 hover:bg-gray-700/70"
                : "bg-white border hover:bg-gray-50"
            }`}
            onClick={() => onUseHistoryItem(item)}
          >
            <p
              className={`text-sm font-medium mb-1 line-clamp-1 ${
                theme === "dark" ? "text-gray-200" : "text-gray-800"
              }`}
            >
              {item.original}
            </p>
            <p
              className={`text-xs line-clamp-2 ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {item.improved}
            </p>
            <div
              className={`text-xs mt-2 ${
                theme === "dark" ? "text-gray-500" : "text-gray-400"
              }`}
            >
              {new Date(item.timestamp).toLocaleString()}
            </div>
          </motion.div>
        ))}
      </div>
    )}
  </div>
);
