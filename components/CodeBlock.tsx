import React, { useState } from "react";

type CodeBlockProps = {
  code: string;
  language?: string;
};

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = "" }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  return (
    <div className="relative my-4">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 bg-white text-gray-700 border border-gray-300 rounded px-2 py-1 text-xs hover:bg-gray-100 transition-all"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
      <pre className="bg-gray-100 text-sm rounded-md overflow-x-auto border border-gray-300">
        <code className={`language-${language} font-mono p-4 block whitespace-pre`}>
          {code}
        </code>
      </pre>
    </div>
  );
};

export default CodeBlock;