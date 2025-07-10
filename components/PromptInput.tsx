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
  originalPrompt,
  setOriginalPrompt,
  promptStyle,
  setPromptStyle,
  inputRef,
}: Omit<PromptInputProps, 'theme'>) => (
  <div className="space-y-4">
    <div>
      <div className="flex justify-between items-center mb-2">
        <label
          htmlFor="original-prompt"
          className="block text-sm font-medium text-gray-800 dark:text-gray-300"
        >
          Original Prompt
        </label>
        <div className="flex gap-2">
          <label htmlFor="prompt-style" className="sr-only">
            Prompt Style
          </label>
          <Select value={promptStyle} onValueChange={setPromptStyle}>
            <SelectTrigger
              className="w-24 bg-white border-gray-300 text-gray-800 dark:bg-gray-800/90 dark:border-gray-600 dark:text-gray-200 dark:ring-offset-gray-900"
            >
              <SelectValue placeholder="Style" />
            </SelectTrigger>
            <SelectContent
              className="bg-white border-gray-300 text-gray-800 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
            >
              <SelectItem
                value="detailed"
                className="focus:bg-gray-100 dark:focus:bg-gray-700 dark:focus:text-gray-100"
              >
                Detailed
              </SelectItem>
              <SelectItem
                value="concise"
                className="focus:bg-gray-100 dark:focus:bg-gray-700 dark:focus:text-gray-100"
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
        className="min-h-[120px] bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800/90 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
      />
    </div>
  </div>
);
