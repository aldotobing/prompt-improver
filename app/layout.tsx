import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Prompt Improver | Enhance Your Prompts for Better AI Responses",
  description:
    "A web application to help you enhance your prompts for better AI responses. Transform vague ideas into clear, specific instructions and get more effective results from AI models.",
  generator: "Next.js",
  metadataBase: new URL("https://prompt.aldotobing.online"),
  openGraph: {
    title: "AI Prompt Improver",
    description:
      "Enhance your prompts for better AI responses. Transform vague ideas into clear, specific instructions.",
    url: "https://prompt.aldotobing.online",
    siteName: "AI Prompt Improver",
    images: [
      {
        url: "/assets/img/llama.png",
        width: 1200,
        height: 630,
        alt: "AI Prompt Improver",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Prompt Improver",
    description:
      "Enhance your prompts for better AI responses. Transform vague ideas into clear, specific instructions.",
    images: ["/assets/img/llama.png"],
    creator: "@aldo_tobing",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  alternates: {
    canonical: "https://prompt.aldotobing.online",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Aldo Tobing" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  );
}
