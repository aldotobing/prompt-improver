export const isImageGenerationPrompt = (prompt: string): boolean => {
  const imageKeywords = [
    // English keywords for direct image creation
    "draw",
    "generate image",
    "create image",
    "design image",
    "make image",
    "create picture",
    "generate picture",
    "create illustration",
    "generate illustration",
    "create artwork",
    "design logo",
    "create logo",
    "make a photo",
    "generate photo",
    "create photo",
    "image of",
    "picture of",
    "photo of",
    "dalle",
    "midjourney",
    "stable diffusion",

    // Advanced image generation patterns
    "visually accurate",
    "highly detailed image",
    "generate an image that",
    "produce a high-quality image",
    "create a visual",
    "design a visual",
    "photorealistic",
    "render",
    "realistic image",
    "digital art",
    "artistic rendering",
    "visual representation",
    "visual concept",
    "high resolution",
    "high-resolution",
    "8k",
    "4k",
    "ultra hd",

    // Style-specific keywords
    "cinematic",
    "artistic style",
    "photography style",
    "camera angle",
    "lighting effect",

    // Indonesian keywords
    "gambar",
    "buat gambar",
    "bikin gambar",
    "desain gambar",
    "membuat gambar",
    "buat foto",
    "bikin foto",
    "membuat foto",
    "buat ilustrasi",
    "bikin ilustrasi",
    "membuat ilustrasi",
    "buat karya seni",
    "desain logo",
    "buat logo",
    "bikin logo",
    "gambar dari",
    "foto dari",
  ];

  const lowerPrompt = prompt.toLowerCase();

  // First check for exact keyword matches
  const hasKeyword = imageKeywords.some((keyword) =>
    lowerPrompt.includes(keyword.toLowerCase())
  );

  // Additional checks for common image generation patterns
  const commonPatterns = [
    /\b(create|generate|produce|make)\s+.*?\b(visual|image|picture|photo|artwork|illustration)\b/i,
    /\b(detailed|high[- ]quality|photorealistic)\s+.*?\b(visual|image|picture|photo|artwork|illustration)\b/i,
    /\b(render|design|draw)\s+.*?\b(scene|concept|composition|artwork|visual)\b/i,
  ];

  const hasPattern = commonPatterns.some((pattern) => pattern.test(prompt));

  return hasKeyword || hasPattern;
};
