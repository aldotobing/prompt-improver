import PromptImprover from "@/components/prompt-improver";

export default function Home() {
  return (
    <main className="w-full min-h-screen p-4 md:p-8 bg-gradient-to-b from-gray-50 to-gray-100 transition-colors duration-300">
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-gray-800 tracking-wide mb-2">
            AI Prompt Improver
          </h1>
          <p className="text-lg text-gray-600">
            Enhance your prompts for better AI responses
          </p>
        </header>
        <PromptImprover />
      </div>
      <footer className="bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 py-4 mt-12">
        <div className="container max-w-4xl mx-auto text-center">
          <hr className="border-gray-300 dark:border-gray-700 mb-4" />
          <p className="text-sm text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-300 transition-colors duration-300">
            Crafted with ❤️ by{" "}
            <span className="font-semibold">Aldo Tobing</span>
          </p>
          <div className="flex justify-center items-center mt-2">
            <a
              href="https://github.com/aldotobing"
              target="_blank"
              rel="noopener noreferrer"
              className="mx-2"
            >
              <img
                src="/assets/img/github-mark.png"
                alt="GitHub"
                className="h-4 w-4 hover:opacity-80 transition-opacity duration-300"
                loading="lazy"
              />
            </a>
            <a
              href="https://twitter.com/aldo_tobing"
              target="_blank"
              rel="noopener noreferrer"
              className="mx-2"
            >
              <img
                src="/assets/img/x.png"
                alt="Twitter"
                className="h-3.5 w-4 hover:opacity-80 transition-opacity duration-300"
                loading="lazy"
              />
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
