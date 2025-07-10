"use client";

import { useState, useEffect } from "react";
import PromptImprover from "@/components/prompt-improver";
import { Moon, Sun, Github, Twitter } from "lucide-react";
import { motion } from "framer-motion";
import { BeSpecificDialog } from "@/components/tips/be-specific-dialog";
import { ProvideContextDialog } from "@/components/tips/provide-context-dialog";
import { UseExamplesDialog } from "@/components/tips/use-examples-dialog";

export default function Home() {
  const [theme, setTheme] = useState<'light' | 'dark'>("light");

  // Handle theme changes
  useEffect(() => {
    // Set light mode as default
    const savedTheme = localStorage.getItem("theme");
    const initialTheme = (savedTheme === 'light' || savedTheme === 'dark') ? savedTheme : 'light';
    
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-950 text-gray-800 dark:text-gray-100 transition-colors duration-500">
      {/* Navigation */}
      <nav className="w-full py-4 px-6 flex justify-between items-center border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">AI</span>
            </div>
            <span className="font-bold text-xl">PromptPro</span>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <a 
              href="/" 
              className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              Text Prompts
            </a>
            <a 
              href="/video-prompt" 
              className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline transition-colors"
            >
              Video Prompts
            </a>
          </div>
        </div>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </nav>

      <main className="flex-grow max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12 w-full">
        {/* Header */}
        <header className="mb-8 md:mb-12 text-center animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
            AI Prompt Improver
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Transform ordinary prompts into powerful instructions that generate
            exceptional AI responses
          </p>

          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <FeatureBadge icon="✨" text="Enhance clarity" />
            <FeatureBadge icon="🎯" text="Improve specificity" />
            <FeatureBadge icon="🧠" text="Optimize context" />
          </div>
        </header>

        {/* Main Content */}
        <section className="animate-fade-in-slow bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 mb-8">
          <PromptImprover theme={theme} />
        </section>

        {/* Prompt Writing Tips Section */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
              Master the Art of Prompt Writing
            </h2>
            <motion.p
              className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto relative"
              initial={{ cursor: "default" }}
              whileHover={{ cursor: "pointer" }}
            >
              Unlock the full potential of AI with these expert tips.{" "}
              <motion.span
                initial={{ opacity: 0.8 }}
                animate={{
                  opacity: [0.8, 1, 0.8],
                  scale: [1, 1.02, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
                className="inline-flex items-center text-black dark:text-purple-400"
              >
                <span className="md:hidden block mb-2">
                  Tap the cards below to learn more
                </span>
                <span className="hidden md:inline">
                  Click each card to dive deeper into prompt{" "}
                  <motion.span className="line-through">
                    engineering
                  </motion.span>{" "}
                  techniques{" "}
                </span>
                <motion.span
                  animate={{
                    x: [0, 3, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                  className="hidden md:inline-block ml-1"
                >
                  👆
                </motion.span>
              </motion.span>
            </motion.p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <TipCard
              title="Be Specific"
              description="Include precise details about the format, tone, and desired outcome of your response."
            />
            <TipCard
              title="Provide Context"
              description="Give relevant background information to help the AI understand your needs better."
            />
            <TipCard
              title="Use Examples"
              description="Include examples of what good or bad responses might look like."
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-6 px-4 mt-auto">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <p className="text-center md:text-left mb-4 md:mb-0">
            Crafted with ❤️ by{" "}
            <span className="font-medium text-gray-800 dark:text-white">
              Aldo Tobing
            </span>
          </p>

          <div className="flex gap-4 items-center">
            <SocialLink
              href="https://github.com/aldotobing"
              icon={<Github size={18} />}
              label="GitHub"
            />
            <SocialLink
              href="https://twitter.com/aldo_tobing"
              icon={<Twitter size={18} />}
              label="Twitter"
            />
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureBadge({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full flex items-center gap-2 text-sm">
      <span>{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function TipCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });

  // Get icon based on title
  const getIcon = (title: string) => {
    switch (title) {
      case "Be Specific":
        return "🎯";
      case "Provide Context":
        return "🔍";
      case "Use Examples":
        return "💡";
      default:
        return "✨";
    }
  };

  // Get the appropriate dialog component
  const DialogComponent = (() => {
    switch (title) {
      case "Be Specific":
        return BeSpecificDialog;
      case "Provide Context":
        return ProvideContextDialog;
      case "Use Examples":
        return UseExamplesDialog;
      default:
        return null;
    }
  })();

  const handleClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setClickPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsDialogOpen(true);
  };

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.03, y: -5 }}
        whileTap={{ scale: 0.98 }}
        className="group relative overflow-hidden bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 cursor-pointer"
        onClick={handleClick}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-purple-500/5 dark:from-purple-500/10 dark:via-blue-500/10 dark:to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <motion.div
          className="absolute -right-2 -top-2 bg-purple-500/10 dark:bg-purple-500/20 w-20 h-20 rounded-full blur-2xl group-hover:bg-purple-500/20 dark:group-hover:bg-purple-500/30 transition-all duration-300"
          initial={{ scale: 0.8, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ repeat: Infinity, duration: 3, repeatType: "reverse" }}
        />
        <div className="relative z-10">
          <motion.span
            className="text-3xl mb-5 block transform-gpu"
            whileHover={{ scale: 1.2, rotate: [0, -10, 10, -10, 0] }}
            role="img"
            aria-label={title}
          >
            {getIcon(title)}
          </motion.span>
          <h3 className="font-bold text-xl mb-3 text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
            {title}
          </h3>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300 group-hover:text-gray-800 dark:group-hover:text-gray-200">
            {description}
          </p>
          <div className="mt-4 flex items-center text-purple-600 dark:text-purple-400 text-sm font-medium opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
            Learn more <span className="ml-1">→</span>
          </div>
        </div>
      </motion.div>

      {DialogComponent && (
        <DialogComponent
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          clickPosition={clickPosition}
        />
      )}
    </>
  );
}

function SocialLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      aria-label={label}
    >
      {icon}
    </a>
  );
}
