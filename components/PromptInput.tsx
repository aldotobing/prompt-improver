import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PromptInputProps } from "./types";

export const PromptInput = ({
  theme,
  originalPrompt,
  setOriginalPrompt,
  promptStyle,
  setPromptStyle,
  inputRef,
}: PromptInputProps) => (
  <div className="space-y-4">
    <div>
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
          <label htmlFor="prompt-style" className="sr-only">
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
                  theme === "dark" ? "focus:bg-gray-700 focus:text-gray-100" : ""
                }`}
              >
                Detailed
              </SelectItem>
              <SelectItem
                value="concise"
                className={`${
                  theme === "dark" ? "focus:bg-gray-700 focus:text-gray-100" : ""
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
        ref={inputRef}
        value={originalPrompt}
        onChange={(e) => setOriginalPrompt(e.target.value)}
        placeholder="Enter your prompt here..."
        className={`min-h-[120px] ${
          theme === "dark"
            ? "bg-gray-800/90 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
            : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
        }`}
      />
    </div>
  </div>
);
