interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateVideoPrompt(values: Record<string, string>): ValidationResult {
  const errors: Record<string, string> = {};
  
  // Required fields
  if (!values.subject?.trim()) {
    errors.subject = 'Subject is required';
  }
  
  if (!values.action?.trim()) {
    errors.action = 'Action is required';
  }
  
  if (!values.cameraShot) {
    errors.cameraShot = 'Camera shot is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// Helper function to generate the final Veo 3 prompt
export function generateVeoPrompt(template: string, values: Record<string, string>): string {
  // Start with the basic template
  let prompt = `Create a video with the following details:

Subject: ${values.subject}
Action: ${values.action}`;

  // Add mood and color palette if provided
  if (values.mood) {
    prompt += `\nMood: ${values.mood}`;
  }
  if (values.colorPalette) {
    prompt += `\nColor Palette: ${values.colorPalette}`;
  }

  // Add camera and composition details
  prompt += '\n\nComposition:';
  if (values.cameraShot) {
    prompt += `\n- Camera Shot: ${values.cameraShot}`;
  }
  if (values.cameraMovement) {
    prompt += `\n- Camera Movement: ${values.cameraMovement}`;
  }
  if (values.composition) {
    prompt += `\n- Shot Details: ${values.composition}`;
  }

  // Add style details
  if (values.videoStyleSelect || values.videoStyleDetail) {
    prompt += '\n\nVisual Style:';
    if (values.videoStyleSelect) {
      prompt += `\n- Style: ${values.videoStyleSelect}`;
    }
    if (values.videoStyleDetail) {
      prompt += `\n- Style Details: ${values.videoStyleDetail}`;
    }
  }

  // Add lighting details
  if (values.lightingSelect || values.lightingDetail) {
    prompt += '\n\nLighting:';
    if (values.lightingSelect) {
      prompt += `\n- Type: ${values.lightingSelect}`;
    }
    if (values.lightingDetail) {
      prompt += `\n- Details: ${values.lightingDetail}`;
    }
  }

  // Add audio description if provided
  if (values.audioDescription) {
    prompt += `\n\nAudio: ${values.audioDescription}`;
  }

  // Add additional details if provided
  if (values.additionalDetails) {
    prompt += `\n\nAdditional Details: ${values.additionalDetails}`;
  }

  return prompt;
}
