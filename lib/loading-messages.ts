// Initial loading messages when starting text generation
export const INITIAL_MESSAGES_TEXT: string[] = [
  "Initializing AI models...",
  "Analyzing your request...",
  "Selecting the best AI for your task...",
  "Preparing response generation...",
];

// Initial loading messages when starting image generation
export const INITIAL_MESSAGES_IMAGE: string[] = [
  "Preparing image generation pipeline...",
  "Analyzing visual requirements...",
  "Initializing Stable Diffusion XL...",
  "Loading image generation models...",
];

// Messages for image generation process
export const IMAGE_GENERATION_MESSAGES: string[] = [
  "Generating your image with Stable Diffusion XL...",
  "Creating visual elements based on your prompt...",
  "Refining image details and composition...",
  "Applying final artistic touches...",
  "Optimizing image quality...",
];

// Messages for Google Gemini model
export const GEMINI_MESSAGES: string[] = [
  "Engaging Google Gemini for your request...",
  "Gemini is analyzing your prompt...",
  "Processing with Google's latest AI technology...",
  "Gemini is crafting a thoughtful response...",
  "Finalizing Gemini's response...",
];

// Messages for DeepSeek model
export const DEEPSEEK_MESSAGES: string[] = [
  "Connecting to DeepSeek's advanced AI...",
  "DeepSeek is processing your request...",
  "Analyzing with DeepSeek's 128K context...",
  "Compiling comprehensive response...",
  "Finalizing DeepSeek's insights...",
];

// Messages for Cloudflare's LLaMA model
export const CLOUDFLARE_LLAMA_MESSAGES: string[] = [
  "Initializing Meta's LLaMA model...",
  "LLaMA is processing your request...",
  "Generating response with LLaMA's capabilities...",
  "Fetching results from Cloudflare AI network...",
  "Finalizing LLaMA's output...",
];

export const DEFAULT_INITIAL_MESSAGE_TEXT: string = "Initializing AI...";
export const DEFAULT_INITIAL_MESSAGE_IMAGE: string =
  "Preparing image generator...";
