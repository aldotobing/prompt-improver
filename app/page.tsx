"use client";

import { SetStateAction, useState } from "react";
import { CopyButton } from "../components/CopyButton";
import {
  improvePromptHelper,
  sendDirectlyHelper,
  sendToAIHelper,
} from "./lib/prompt-helpers";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Sparkles, Send, MessageCircle, Zap } from "lucide-react";

export async function POST(request: Request) {
  // Enable CORS
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // Load sensitive data from environment variables
  const NEXT_PUBLIC_CLOUDFLARE_AI_URL =
    process.env.NEXT_PUBLIC_NEXT_PUBLIC_CLOUDFLARE_AI_URL;
  const NEXT_PUBLIC_CLOUDFLARE_AI_TOKEN =
    process.env.NEXT_PUBLIC_CLOUDFLARE_AI_TOKEN;

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Missing prompt" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

    // Create the prompt for the AI
    const aiPrompt = `You are an expert prompt engineer. 
    Analyze and enhance the following prompt while strictly preserving its original intent, 
    context, tone, and language (English, Indonesian, or other). 
    Return only the improved version of the prompt without any explanation, 
    preamble, formatting, commentary, or additional content:\n\n"${prompt}"`;

    console.log("Sending to Cloudflare Workers AI:", aiPrompt);

    // Send to Cloudflare Workers AI with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      if (!NEXT_PUBLIC_CLOUDFLARE_AI_URL || !NEXT_PUBLIC_CLOUDFLARE_AI_TOKEN) {
        throw new Error("Cloudflare AI environment variables are not set");
      }
      const response = await fetch(NEXT_PUBLIC_CLOUDFLARE_AI_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${NEXT_PUBLIC_CLOUDFLARE_AI_TOKEN}`,
        },
        body: JSON.stringify({ prompt: aiPrompt }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          "Workers AI response not OK:",
          response.status,
          errorText
        );

        // If we get an error, fall back to local improvement
        console.log("Falling back to local prompt improvement");
        const locallyImprovedPrompt = fallbackImprovePrompt(prompt);

        return new Response(
          JSON.stringify({
            originalPrompt: prompt,
            improvedPrompt: locallyImprovedPrompt,
            note: "Used fallback improvement due to API error",
          }),
          {
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          }
        );
      }

      const data = await response.json();
      console.log("Workers AI response:", JSON.stringify(data));

      // Check if the response has the expected format
      if (!data.result || !data.result.response) {
        console.error("Unexpected response format:", data);
        throw new Error("Unexpected response format from Workers AI");
      }

      const improvedPrompt = data.result.response;

      return new Response(
        JSON.stringify({
          originalPrompt: prompt,
          improvedPrompt,
        }),
        {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        throw new Error("Request to Workers AI timed out after 30 seconds");
      }
      throw fetchError;
    }
  } catch (error) {
    console.error("Error improving prompt:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to improve prompt",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
}

/**
 * Fallback prompt improvement function if the API fails
 */
function fallbackImprovePrompt(originalPrompt: string): string {
  let improved = originalPrompt.trim();

  // Check if this is an image generation request
  const isImageRequest =
    improved.toLowerCase().includes("picture") ||
    improved.toLowerCase().includes("image") ||
    improved.toLowerCase().includes("photo") ||
    improved.toLowerCase().includes("draw");

  if (isImageRequest) {
    // Special handling for image generation requests
    if (!improved.includes("detailed") && !improved.includes("high quality")) {
      improved +=
        " in high quality, with attention to detail, proper composition, and lighting.";
    }
    return improved;
  }

  // Add general quality improvements
  if (!improved.includes("detailed") && !improved.includes("specific")) {
    improved = `Please provide a detailed and specific response to the following: ${improved}`;
  }

  return improved;
}

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [improvedPrompt, setImprovedPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [activeTab, setActiveTab] = useState("improve");

  // Reset improvedPrompt when prompt is changed
  const handlePromptChange = (e: {
    target: { value: SetStateAction<string> };
  }) => {
    setPrompt(e.target.value);
    setImprovedPrompt(""); // Reset improved prompt
  };

  // Wrappers for helpers
  const improvePrompt = () =>
    improvePromptHelper({
      prompt,
      setLoading,
      setError,
      setNote,
      setImprovedPrompt,
    });

  const sendDirectly = () =>
    sendDirectlyHelper({ prompt, setLoading, setError, setAiResponse });

  const sendToAI = () =>
    sendToAIHelper({
      prompt,
      improvedPrompt,
      setLoading,
      setError,
      setAiResponse,
    });

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
            AI Prompt Improver
          </h1>
          <p className="mt-3 text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Enhance your prompts for better AI responses. Transform vague ideas
            into clear, specific instructions.
          </p>
        </div>

        {error && (
          <Alert
            variant="destructive"
            className="mb-6 border-l-4 border-red-500 dark:border-red-400 shadow-lg animate-in fade-in slide-in-from-top duration-300"
          >
            <AlertCircle className="h-5 w-5 text-red-500" />
            <AlertTitle className="font-semibold">Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {note && (
          <Alert className="mb-6 border-l-4 border-blue-500 dark:border-blue-400 shadow-lg bg-blue-50 dark:bg-blue-900/20 animate-in fade-in slide-in-from-top duration-300">
            <Zap className="h-5 w-5 text-blue-500" />
            <AlertTitle className="font-semibold">Note</AlertTitle>
            <AlertDescription>{note}</AlertDescription>
          </Alert>
        )}

        <Tabs
          defaultValue="improve"
          onValueChange={setActiveTab}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transition-all"
        >
          <TabsList className="grid grid-cols-2 bg-gray-200 dark:bg-gray-700 p-1 rounded-t-xl">
            <TabsTrigger
              value="improve"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 dark:data-[state=active]:from-blue-700 dark:data-[state=active]:to-blue-800 data-[state=active]:shadow-inner rounded-xl text-gray-800 dark:text-gray-200 transition-all duration-300 ease-in-out hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Improve Prompt
            </TabsTrigger>
            <TabsTrigger
              value="chat"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 dark:data-[state=active]:from-purple-700 dark:data-[state=active]:to-purple-800 data-[state=active]:shadow-inner rounded-xl text-gray-800 dark:text-gray-200 transition-all duration-300 ease-in-out hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat with AI
            </TabsTrigger>
          </TabsList>

          {/* Improve Tab */}
          <TabsContent value="improve">
            <Card className="border-0 shadow-none">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 pb-4">
                <CardTitle className="flex items-center text-xl font-bold">
                  <Sparkles className="w-5 h-5 mr-2 text-blue-500" />
                  Prompt Improver
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Enter a vague prompt and get a clearer, more specific version
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6 pt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Original Prompt
                  </label>
                  <Textarea
                    placeholder="e.g., 'write a story about space'"
                    value={prompt}
                    onChange={handlePromptChange} // Updated here
                    rows={4}
                    className="w-full resize-none border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>

                {improvedPrompt && (
                  <div className="animate-in fade-in duration-500 space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Improved Prompt
                    </label>

                    <div className="relative p-4 pb-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 text-gray-800 dark:text-gray-100 shadow-sm">
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                          <span>Improving...</span>
                        </div>
                      ) : (
                        improvedPrompt
                      )}

                      {/* Tombol Copy dipindahkan setelah konten */}
                      <CopyButton text={improvedPrompt} />
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex flex-col sm:flex-row gap-3 bg-gray-50 dark:bg-gray-800/50 pt-4 pb-6 px-6">
                <Button
                  onClick={improvePrompt}
                  disabled={loading || !prompt.trim()}
                  className="w-full sm:w-1/2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                      Improving...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Improve Prompt
                    </span>
                  )}
                </Button>
                <Button
                  onClick={sendDirectly}
                  disabled={loading || !prompt.trim()}
                  variant="outline"
                  className="w-full sm:w-1/2 border-blue-300 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Directly
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat">
            <Card className="border-0 shadow-none">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 pb-4">
                <CardTitle className="flex items-center text-xl font-bold">
                  <MessageCircle className="w-5 h-5 mr-2 text-purple-500" />
                  Chat with AI
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Send your improved prompt to the AI model
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6 pt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Prompt to Send
                  </label>
                  <Textarea
                    value={improvedPrompt || prompt}
                    onChange={(e) =>
                      improvedPrompt
                        ? setImprovedPrompt(e.target.value)
                        : setPrompt(e.target.value)
                    }
                    rows={4}
                    className="w-full resize-none border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  />
                </div>

                {aiResponse && (
                  <div className="animate-in fade-in duration-500">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      AI Response
                    </label>
                    <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 text-gray-800 dark:text-gray-100 shadow-sm max-h-80 overflow-y-auto whitespace-pre-wrap scrollbar-thin scrollbar-thumb-purple-300 dark:scrollbar-thumb-purple-700">
                      {aiResponse}
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter className="bg-gray-50 dark:bg-gray-800/50 pt-4 pb-6 px-6">
                <Button
                  onClick={sendToAI}
                  disabled={
                    loading || (!prompt.trim() && !improvedPrompt.trim())
                  }
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Send className="w-4 h-4 mr-2" />
                      Send to AI
                    </span>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
        <div className="mt-10 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Get clearer, more effective AI responses with better prompts</p>
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
      </div>
    </main>
  );
}
