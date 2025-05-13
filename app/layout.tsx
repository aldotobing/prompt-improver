import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title:
    "AI Prompt Improver | Enhance your prompts for better AI interactions.",
  description: "Enhance your prompts for better AI interactions.",
  generator: "v0.dev",
  openGraph: {
    title: "Prompt Improver",
    description: "Enhance your prompts for better AI interactions.",
    url: "https://prompt.aldotobing.online",
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
