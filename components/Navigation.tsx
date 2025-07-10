'use client';

import { Moon, Sun } from "lucide-react";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navigation() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const pathname = usePathname();
  const isVideoPage = pathname === '/video-prompt';

  // Handle theme changes
  useEffect(() => {
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
    <nav className="w-full py-4 px-6 flex justify-between items-center border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">AI</span>
          </div>
          <span className="font-bold text-xl">PromptPro</span>
        </Link>
        <div className="hidden md:flex items-center gap-4">
          <Link 
            href="/" 
            className={`text-sm font-medium transition-colors ${
              !isVideoPage 
                ? 'text-purple-600 dark:text-purple-400' 
                : 'text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
            }`}
          >
            Text Prompts
          </Link>
          <Link 
            href="/video-prompt" 
            className={`text-sm font-medium transition-colors ${
              isVideoPage 
                ? 'text-purple-600 dark:text-purple-400' 
                : 'text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
            }`}
          >
            Video Prompts
          </Link>
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
  );
}
