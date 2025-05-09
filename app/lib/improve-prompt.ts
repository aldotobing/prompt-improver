/**
 * Simple prompt improvement function that applies basic rules to enhance prompts
 */
export function improvePrompt(originalPrompt: string): string {
  let improved = originalPrompt.trim()

  // Check if this is an image generation request
  const isImageRequest =
    improved.toLowerCase().includes("picture") ||
    improved.toLowerCase().includes("image") ||
    improved.toLowerCase().includes("photo") ||
    improved.toLowerCase().includes("draw") ||
    improved.toLowerCase().includes("generate") ||
    (improved.toLowerCase().includes("create") &&
      (improved.toLowerCase().includes("landscape") ||
        improved.toLowerCase().includes("portrait") ||
        improved.toLowerCase().includes("illustration")))

  if (isImageRequest) {
    // Special handling for image generation requests
    if (
      !improved.toLowerCase().startsWith("create") &&
      !improved.toLowerCase().startsWith("generate") &&
      !improved.toLowerCase().startsWith("make")
    ) {
      improved = `Create ${improved}`
    }

    // Add details for landscape/scene requests
    if (improved.toLowerCase().includes("landscape")) {
      if (!improved.includes("detailed")) {
        improved +=
          " with detailed foreground elements, middle ground, and background. Include lighting effects and atmospheric perspective."
      }
    }

    // Add details for portrait/character requests
    else if (improved.toLowerCase().includes("portrait") || improved.toLowerCase().includes("person")) {
      if (!improved.includes("detailed")) {
        improved += " with attention to facial features, expression, lighting, and background context."
      }
    }

    // General image quality improvements
    else if (!improved.includes("detailed") && !improved.includes("high quality")) {
      improved += " in high quality, with attention to detail, proper composition, and lighting."
    }

    return improved
  }

  // If prompt is too short, expand it
  if (improved.length < 10) {
    improved = `Please provide a detailed response about ${improved}`
  }

  // Add specificity to vague prompts
  if (improved.toLowerCase().includes("write") && !improved.includes("words")) {
    improved = improved.replace(/write/i, "Write a detailed 500-word")
  }

  // Add structure to story requests
  if (improved.toLowerCase().includes("story")) {
    improved += " Include a beginning, middle, and end with a compelling character arc."
  }

  // Add specificity to explanation requests
  if (improved.toLowerCase().includes("explain") || improved.toLowerCase().includes("how to")) {
    improved += " Provide step-by-step instructions with examples."
  }

  // Add specificity to comparison requests
  if (improved.toLowerCase().includes("compare") || improved.toLowerCase().includes("difference")) {
    improved += " Include a detailed analysis of similarities and differences, with specific examples."
  }

  // Format for code requests
  if (
    improved.toLowerCase().includes("code") ||
    improved.toLowerCase().includes("program") ||
    improved.toLowerCase().includes("function")
  ) {
    improved += " Include comments explaining the code, and provide a usage example."
  }

  // Add clarity to opinion requests
  if (improved.toLowerCase().includes("opinion") || improved.toLowerCase().includes("think about")) {
    improved += " Provide a balanced perspective with supporting arguments and counterarguments."
  }

  // Ensure the prompt ends with a question mark if it's a question
  if (improved.includes("?") && !improved.trim().endsWith("?")) {
    improved = improved.replace(/\?/, "? ")
  }

  // Add general quality improvements (only for non-image requests)
  if (!improved.includes("detailed") && !improved.includes("specific")) {
    improved = `Please provide a detailed and specific response to the following: ${improved}`
  }

  return improved
}
