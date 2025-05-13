# AI Prompt Improver

A web application to help you enhance your prompts for better AI responses. Transform vague ideas into clear, specific instructions and get more effective results from AI models.

## Features

- **Prompt Improvement:** Enter a vague or unclear prompt and receive a clearer, more specific version.
- **Chat with AI:** Send your improved prompt directly to an AI model and view the response.
- **Fallback Logic:** If the AI service is unavailable, the app uses a local prompt improvement algorithm.
- **Modern UI:** Built with React, Next.js, Tailwind CSS, and shadcn/ui components for a clean and responsive interface.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- [pnpm](https://pnpm.io/) or [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. **Clone the repository:**
   ```cmd
   git clone <your-repo-url>
   cd prompt-improver
   ```
2. **Install dependencies:**

   ```cmd
   pnpm install
   ```

   Or use `npm install` or `yarn install` if you prefer.

3. **Set up environment variables:**

   - Copy `.env.example` to `.env` and fill in the required values for Cloudflare AI integration (if available).

4. **Run the development server:**
   ```cmd
   pnpm dev
   ```
   The app will be available at [http://localhost:3000](http://localhost:3000).

### Build for Production

```cmd
pnpm build
pnpm start
```

## Project Structure

- `app/` - Main Next.js app directory (pages, API routes, helpers)
- `components/` - Reusable UI components
- `public/` - Static assets
- `styles/` - Global styles (Tailwind CSS)
- `lib/` - Utility and helper functions

## Configuration

- **Tailwind CSS**: Configured via `tailwind.config.ts` and `postcss.config.mjs`.
- **TypeScript**: Strict mode enabled, config in `tsconfig.json`.
- **shadcn/ui**: UI components managed via `components.json`.

## Credits

- Crafted by Aldo Tobing
- Uses [shadcn/ui](https://ui.shadcn.com/), [Next.js](https://nextjs.org/), [Tailwind CSS](https://tailwindcss.com/), and [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/)

## License

MIT