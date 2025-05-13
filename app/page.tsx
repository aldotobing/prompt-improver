"use client";

import { useState, useEffect, use } from "react";
import PromptImprover from "@/components/prompt-improver";
import { Moon, Sun, Github, Twitter } from "lucide-react";

export default function Home() {
  const [theme, setTheme] = useState("light");

  // Handle theme changes
  useEffect(() => {
    // Set light mode as default
    const savedTheme = localStorage.getItem("theme") || "light";

    setTheme(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
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
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">AI</span>
          </div>
          <span className="font-bold text-xl">PromptPro</span>
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

        {/* Testimonials / Tips Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Prompt Writing Tips
          </h2>
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
  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      <h3 className="font-bold mb-2">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
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
