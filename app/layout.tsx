import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "AI Prompt Improver - Optimize Your AI Prompts for Better Results",
    template: "%s | AI Prompt Improver"
  },
  description:
    "Transform your AI interactions with our free AI prompt optimization tool. Enhance prompts for ChatGPT, Claude, and other AI models with improved clarity, specificity, and context. Get better AI responses instantly.",
  applicationName: "AI Prompt Improver",
  authors: [{ name: "Aldo Tobing" }],
  generator: "Next.js",
  keywords: [
    "AI prompt optimizer",
    "ChatGPT prompts",
    "Claude prompts",
    "AI prompt engineering",
    "prompt improvement tool",
    "better AI responses",
    "AI prompt generator",
    "prompt optimization",
    "AI interactions",
    "prompt engineering guide",
    "AI prompt tips",
    "improve AI prompts",
    "AI prompt examples",
    "effective AI prompts",
    "AI prompt best practices",
    "free AI tools",
    "AI prompt builder",
    "conversational AI",
    "LLM prompts",
    "artificial intelligence prompts"
  ],
  referrer: "origin-when-cross-origin",
  creator: "Aldo Tobing",
  publisher: "Aldo Tobing",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://prompt.aldotobing.online"),
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://prompt.aldotobing.online",
    siteName: "AI Prompt Improver",
    title: "AI Prompt Improver - Optimize Your AI Prompts for Better Results",
    description:
      "Transform your AI interactions with our free AI prompt optimization tool. Enhance prompts for ChatGPT, Claude, and other AI models with improved clarity, specificity, and context.",
    images: [
      {
        url: "/assets/img/prompt.png",
        width: 1200,
        height: 630,
        alt: "AI Prompt Improver - Optimize Your Prompts for Better AI Responses",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@aldo_tobing",
    creator: "@aldo_tobing",
    title: "AI Prompt Improver - Optimize Your AI Prompts for Better Results",
    description:
      "Transform your AI interactions with our free AI prompt optimization tool. Enhance prompts for ChatGPT, Claude, and other AI models.",
    images: [
      {
        url: "/assets/img/prompt.png",
        width: 1200,
        height: 630,
        alt: "AI Prompt Improver - Optimize Your Prompts for Better AI Responses",
      },
    ],
  },

  category: "Technology",
  classification: "AI Tools",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "AI Prompt Improver",
              "description": "Transform your AI interactions with our free AI prompt optimization tool. Enhance prompts for ChatGPT, Claude, and other AI models with improved clarity, specificity, and context.",
              "url": "https://prompt.aldotobing.online",
              "applicationCategory": "ProductivityApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "author": {
                "@type": "Person",
                "name": "Aldo Tobing"
              },
              "publisher": {
                "@type": "Person",
                "name": "Aldo Tobing"
              },
              "datePublished": "2024-01-01",
              "dateModified": new Date().toISOString().split('T')[0],
              "inLanguage": "en",
              "isAccessibleForFree": true,
              "screenshot": "https://prompt.aldotobing.online/assets/img/prompt.png"
            })
          }}
        />
        
        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "AI Prompt Improver",
              "url": "https://prompt.aldotobing.online",
              "logo": "https://prompt.aldotobing.online/assets/img/prompt.png",
              "founder": {
                "@type": "Person",
                "name": "Aldo Tobing"
              },
              "sameAs": [
                "https://twitter.com/aldo_tobing",
                "https://github.com/aldotobing"
              ]
            })
          }}
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}