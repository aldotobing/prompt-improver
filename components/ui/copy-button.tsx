import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "./button";

interface CopyButtonProps {
  text: string;
  theme?: string;
}

export function CopyButton({ text, theme }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleCopy}
      className={`h-8 w-8 transition-all duration-200 ${
        theme === "dark"
          ? "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
          : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
      }`}
    >
      {copied ? (
        <Check className="h-4 w-4" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );
}
