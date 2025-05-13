// Helper types and functions for prompt improvement and AI chat
import type React from "react";

type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

const NEXT_PUBLIC_CLOUDFLARE_AI_URL = process.env.NEXT_PUBLIC_CLOUDFLARE_AI_URL;
const NEXT_PUBLIC_CLOUDFLARE_AI_TOKEN =
  process.env.NEXT_PUBLIC_CLOUDFLARE_AI_TOKEN;

export interface ImprovePromptHelperArgs {
  prompt: string;
  setLoading: SetState<boolean>;
  setError: SetState<string>;
  setNote: SetState<string>;
  setImprovedPrompt: SetState<string>;
}

export async function improvePromptHelper({
  prompt,
  setLoading,
  setError,
  setNote,
  setImprovedPrompt,
}: ImprovePromptHelperArgs) {
  if (!prompt.trim()) return;
  setLoading(true);
  setError("");
  setNote("");
  try {
    if (!NEXT_PUBLIC_CLOUDFLARE_AI_URL) {
      throw new Error("Cloudflare AI URL is not defined");
    }

    const response = await fetch(NEXT_PUBLIC_CLOUDFLARE_AI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${NEXT_PUBLIC_CLOUDFLARE_AI_TOKEN}`,
      },
      body: JSON.stringify({ prompt }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || data.details || "Failed to improve prompt");
    }
    setImprovedPrompt(data.improvedPrompt);
    if (data.note) {
      setNote(data.note);
    }
  } catch (error) {
    console.error("Error:", error);
    setError(error instanceof Error ? error.message : String(error));
  } finally {
    setLoading(false);
  }
}

export interface SendDirectlyHelperArgs {
  prompt: string;
  setLoading: SetState<boolean>;
  setError: SetState<string>;
  setAiResponse: SetState<string>;
}

export async function sendDirectlyHelper({
  prompt,
  setLoading,
  setError,
  setAiResponse,
}: SendDirectlyHelperArgs) {
  if (!prompt.trim()) return;
  setLoading(true);
  setError("");
  try {
    if (!NEXT_PUBLIC_CLOUDFLARE_AI_URL) {
      throw new Error("Cloudflare AI URL is not defined");
    }
    const response = await fetch(NEXT_PUBLIC_CLOUDFLARE_AI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${NEXT_PUBLIC_CLOUDFLARE_AI_TOKEN}`,
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(
        data.error || data.details || "Failed to get AI response"
      );
    }
    if (!data.tasks || !data.tasks[0] || !data.tasks[0].response) {
      throw new Error("Unexpected response format from AI");
    }
    setAiResponse(data.tasks[0].response);
  } catch (error) {
    console.error("Error:", error);
    setError(error instanceof Error ? error.message : String(error));
  } finally {
    setLoading(false);
  }
}

export interface SendToAIHelperArgs {
  prompt: string;
  improvedPrompt: string;
  setLoading: SetState<boolean>;
  setError: SetState<string>;
  setAiResponse: SetState<string>;
}

export async function sendToAIHelper({
  prompt,
  improvedPrompt,
  setLoading,
  setError,
  setAiResponse,
}: SendToAIHelperArgs) {
  if (!improvedPrompt.trim() && !prompt.trim()) return;
  setLoading(true);
  setError("");
  try {
    const promptToSend = improvedPrompt.trim() || prompt.trim();
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: promptToSend }],
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(
        data.error || data.details || "Failed to get AI response"
      );
    }
    if (!data.tasks || !data.tasks[0] || !data.tasks[0].response) {
      throw new Error("Unexpected response format from AI");
    }
    setAiResponse(data.tasks[0].response);
  } catch (error) {
    console.error("Error:", error);
    setError(error instanceof Error ? error.message : String(error));
  } finally {
    setLoading(false);
  }
}
