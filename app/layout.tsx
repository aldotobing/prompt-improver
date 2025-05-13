import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title:
    "AI Prompt Improver | Enhance your prompts for better AI interactions.",
  description:
    "Transform your AI interactions with optimized prompts for clarity, specificity, and context.",
  generator: "v0.dev",
  keywords: [
    "AI prompts",
    "prompt optimization",
    "AI interactions",
    "better AI responses",
  ],
  openGraph: {
    title: "AI Prompt Improver | Optimize Your Prompts",
    description:
      "Transform your AI interactions with optimized prompts for clarity, specificity, and context.",
    url: "https://prompt.aldotobing.online",
    images: [
      {
        url: "/assets/img/llama.png",
        alt: "Prompt Improver Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Prompt Improver | Optimize Your Prompts",
    description:
      "Transform your AI interactions with optimized prompts for clarity, specificity, and context.",
    images: [
      {
        url: "/assets/img/llama.png",
        alt: "Prompt Improver Preview",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
