import { PromptTemplate } from "@/types/template";

// Dummy data for template variables
export const templateDummyData: Record<string, Record<string, string>> = {
  "content-1": {
    topic: "The Future of AI in Everyday Life",
    wordCount: "1500",
    point1: "AI in smart home devices",
    point2: "AI in healthcare applications",
    point3: "AI in personal productivity"
  },
  "code-1": {
    language: "javascript",
    code: "function add(a, b) {\n  return a + b;\n}",
    concerns: "error handling and edge cases"
  },
  "creative-1": {
    genre: "sci-fi",
    setting: "a distant space colony",
    characters: "a rogue AI and a retired astronaut"
  },
  "analysis-1": {
    topic: "renewable energy adoption",
    timePeriod: "last decade",
    metrics: "cost reduction and efficiency improvements"
  },
  "education-1": {
    topic: "quantum computing",
    educationLevel: "high school",
    numberOfExamples: "3"
  },
  "veo-1": {
    subject: "a futuristic cityscape in 2150",
    action: "flying cars zooming between holographic skyscrapers, people wearing AR glasses, drones delivering packages",
    composition: "aerial tracking shot moving forward through the city, dynamic camera movement with smooth transitions",
    cameraShot: "Wide Shot",
    cameraMovement: "Drone",
    videoStyleSelect: "Cinematic",
    lightingSelect: "Low Key",
    videoStyleDetail: "Cyberpunk, Blade Runner inspired, neon lights, rain-soaked streets, high-tech atmosphere",
    lightingDetail: "nighttime, neon reflections on wet pavement, contrasting colors of blue and purple, volumetric lighting",
    audio: "sci-fi ambient music with deep bass, futuristic city hum, distant engine sounds, occasional electronic beeps",
    mood: "futuristic, high-tech, slightly dystopian",
    colorPalette: "deep blues, electric purples, neon pinks, dark blacks"
  },
  "veo-2": {
    subject: "a premium wireless earbud set with active noise cancellation",
    action: "showcasing its sleek design, comfortable fit, and advanced features in various usage scenarios",
    composition: "360-degree product rotation, close-ups of key features, hands-free demonstration, side-by-side size comparison",
    cameraShot: "Close-up",
    cameraMovement: "Dolly",
    videoStyleSelect: "Commercial",
    lightingSelect: "Studio Light",
    videoStyleDetail: "clean, modern, high-tech aesthetic with a focus on product details",
    lightingDetail: "bright, even studio lighting with subtle rim lighting to highlight product contours",
    audio: "upbeat electronic background music, subtle product interaction sounds, clear voiceover highlighting features",
    mood: "premium, innovative, high-tech",
    colorPalette: "sleek blacks, metallic accents, clean whites with pops of brand color",
    keyFeatures: "active noise cancellation, 30-hour battery life, water resistance, touch controls, crystal clear audio",
    additionalDetails: "Show the earbuds being used during workouts, commuting, and in work environments."
  },
  "veo-3": {
    subject: "a friendly humanoid robot exploring an ancient forest",
    action: "discovering wildlife, interacting with animals, learning about nature with childlike wonder",
    composition: "steady tracking shots following the robot, close-ups of its expressions, wide shots showing the environment",
    cameraShot: "Medium Full Shot",
    cameraMovement: "Steadicam",
    videoStyleSelect: "Animation",
    lightingSelect: "Golden Hour",
    videoStyleDetail: "Pixar-style 3D animation, vibrant colors, soft lighting, cinematic quality",
    lightingDetail: "golden hour sunlight filtering through trees, soft volumetric light rays, warm color temperature",
    audio: "peaceful forest ambiance, birds chirping, leaves rustling, gentle robotic whirring sounds, soft piano soundtrack",
    mood: "wholesome, adventurous, heartwarming",
    colorPalette: "lush greens, warm sunlight yellows, earthy browns, clear blue sky",
    storyConcept: "a curious robot's first encounter with nature",
    character: "a small, round robot with expressive digital eyes and a curious personality",
    setting: "an ancient, magical forest with bioluminescent plants and friendly woodland creatures",
    animationStyle: "3D animation with a soft, painterly aesthetic",
    additionalDetails: "Include moments of wonder and discovery as the robot learns about the forest ecosystem. Show the changing light as the day progresses to sunset."
  },
  "veo-4": {
    subject: "a space explorer on an alien planet",
    action: "surveying the landscape, collecting samples, encountering strange lifeforms",
    composition: "wide establishing shots of the alien world, POV shots from the explorer's helmet, close-ups of discoveries",
    cameraShot: "Extreme Wide Shot",
    cameraMovement: "Pan",
    videoStyleSelect: "Cinematic",
    lightingSelect: "Natural Light",
    videoStyleDetail: "photorealistic sci-fi, high detail, cinematic quality, IMAX-style visuals",
    lightingDetail: "dual suns casting long shadows, atmospheric haze, vibrant alien plant bioluminescence",
    audio: "breathing inside the helmet, atmospheric wind sounds, alien creature calls, subtle electronic equipment beeps",
    mood: "awe-inspiring, mysterious, adventurous",
    colorPalette: "violet skies, orange terrain, glowing blues and greens, metallic spacesuit accents",
    storyConcept: "humanity's first contact with an alien ecosystem",
    character: "a determined astronaut-scientist on a solo mission of discovery",
    setting: "an Earth-like exoplanet with low gravity, floating landmasses, and crystalline vegetation",
    animationStyle: "photorealistic with subtle sci-fi elements",
    additionalDetails: "Show the contrast between the vast alien landscape and the small human figure. Include moments of tension and wonder as the explorer makes first contact with the planet's lifeforms.",
    keyFeatures: "alien flora and fauna, advanced exploration equipment, dynamic weather patterns"
  },
  "veo-5": {
    subject: "a street performer in a bustling European city square",
    action: "performing an elaborate dance routine with fire, interacting with the crowd, collecting tips",
    composition: "dynamic camera movements, crowd reactions, slow-motion for dramatic moments, POV shots from the audience",
    cameraShot: "Medium Shot",
    cameraMovement: "Handheld",
    videoStyleSelect: "Documentary",
    lightingSelect: "Golden Hour",
    videoStyleDetail: "documentary-style, slightly desaturated with warm tones, cinematic shallow depth of field",
    lightingDetail: "golden hour sunlight, warm street lamps, flickering fire light, soft shadows",
    audio: "live street performance music, crowd reactions, crackling fire, cobblestone footsteps, distant city sounds",
    mood: "vibrant, energetic, cultural",
    colorPalette: "warm oranges, deep reds, golden yellows, stone grays",
    storyConcept: "a day in the life of a passionate street performer",
    character: "a charismatic fire dancer with a mysterious past",
    setting: "historic European city square with cobblestone streets and ancient architecture",
    animationStyle: "live-action with subtle color grading",
    additionalDetails: "Capture the energy of the performance and the crowd's reactions. Include close-ups of the performer's expressions and the fire's movement. Show the transition from daylight to evening as the performance becomes more intense.",
    keyFeatures: "fire dancing, crowd interaction, cultural atmosphere, urban setting"
  }
};

export const defaultTemplates: PromptTemplate[] = [
  {
    id: "content-1",
    title: "Blog Post Outline",
    description: "Generate a structured outline for a blog post",
    category: "writing",
    template: `I need a blog post outline about {topic}. The post should be approximately {wordCount} words and cover these key points:
- {point1}
- {point2}
- {point3}

Please provide a clear structure with H2 and H3 headings.`,
    generationPrompt: `Generate a blog post outline. The topic is "{topic}" with {wordCount} words. Key points to cover:
1. {point1}
2. {point2}
3. {point3}

Return only the outline with H2 and H3 headings, no additional text.`,
    tags: ["blogging", "outline", "content"],
  },
  {
    id: "code-1",
    title: "Code Review",
    description: "Get feedback on your code",
    category: "coding",
    template: `Please review this {language} code for best practices, potential bugs, and performance improvements:

\`\`\`{language}
{code}
\`\`\`

I'm particularly concerned about {concerns}.`,
    generationPrompt: `Generate a code review for this {language} code. Focus on:
1. Best practices
2. Potential bugs
3. Performance improvements
4. {concerns}

Code to review:
\`\`\`{language}
{code}
\`\`\`

Provide a detailed review with specific suggestions.`,
    tags: ["code", "review", "debugging"],
  },
  {
    id: "creative-1",
    title: "Story Starter",
    description: "Generate a creative writing prompt",
    category: "creative",
    template: `I need a creative writing prompt with these elements:
- Genre: {genre}
- Main Character: {character}
- Setting: {setting}
- Conflict: {conflict}

Please provide an engaging prompt that includes all these elements.`,
    generationPrompt: `Create a creative writing prompt with these specifications:
- Genre: {genre}
- Main Character: {character}
- Setting: {setting}
- Central Conflict: {conflict}

Make it engaging and thought-provoking.`,
    tags: ["writing", "creativity", "storytelling"],
  },
  {
    id: "marketing-1",
    title: "Product Description",
    description: "Create an engaging product description",
    category: "marketing",
    template: `Write a compelling product description for {productName} with these key features:
- {feature1}
- {feature2}
- {feature3}

Target audience: {audience}
Tone: {tone} (e.g., professional, casual, enthusiastic)`,
    generationPrompt: `Create a {tone} product description for {productName} targeting {audience}.

Key Features:
- {feature1}
- {feature2}
- {feature3}

Make it engaging and highlight benefits, not just features.`,
    tags: ["marketing", "ecommerce", "copywriting"],
  },
  {
    id: "education-1",
    title: "Educational Explanation",
    description: "Generate an educational explanation",
    category: "education",
    template: `I need an explanation of {topic} suitable for {educationLevel} students. 
    Please include {numberOfExamples} examples to illustrate the concepts.`,
    generationPrompt: `Create an educational explanation about {topic} for {educationLevel} students.
    Include {numberOfExamples} clear examples that help illustrate the concepts.
    Use simple language and engaging analogies where appropriate.`,
    tags: ["education", "learning", "explanation"],
  },
  {
    id: "veo-1",
    title: "Veo 3 Video Prompt",
    description: "Generate a detailed prompt for Veo 3 video generation",
    category: "video",
    template: `Create a video of {subject} where {action}. 
    Composition: {composition}
    Style: {style}
    Lighting: {lighting}
    Audio: {audio}`,
    generationPrompt: `Generate a detailed Veo 3 video prompt with these specifications:
    - Subject & Action: {subject} {action}
    - Composition: {composition}
    - Visual Style: {style}
    - Lighting & Atmosphere: {lighting}
    - Audio Requirements: {audio}
    
    Make the prompt detailed and specific, ensuring it will produce high-quality, coherent video output with Veo 3. Include camera movements, shot types, and any other relevant cinematography details.`,
    tags: ["video", "veo3", "content-creation"],
  },
  {
    id: "veo-2",
    title: "Veo 3 Product Showcase",
    description: "Create a product showcase video with Veo 3",
    category: "video",
    template: `Create a product showcase video featuring {product} that highlights {keyFeatures}.
    Composition: {composition}
    Style: {style}
    Lighting: {lighting}
    Audio: {audio}`,
    generationPrompt: `Generate a professional product showcase video prompt for Veo 3 with these details:
    - Product: {product}
    - Key Features: {keyFeatures}
    - Composition: {composition}
    - Visual Style: {style}
    - Lighting: {lighting}
    - Audio: {audio}
    
    The video should be engaging, highlight the product's best features, and be suitable for marketing purposes. Include smooth camera movements and professional lighting.`,
    tags: ["video", "veo3", "marketing", "product"],
  },
  {
    id: "veo-3",
    title: "Veo 3 Animated Story",
    description: "Create an animated story with Veo 3",
    category: "video",
    template: `Create an animated video about {storyConcept}.
    Main Character: {character}
    Setting: {setting}
    Animation Style: {style}
    Mood: {mood}
    Audio: {audio}`,
    generationPrompt: `Generate a detailed animated story prompt for Veo 3 with these elements:
    - Story Concept: {storyConcept}
    - Main Character: {character}
    - Setting: {setting}
    - Animation Style: {style}
    - Mood: {mood}
    - Audio: {audio}
    
    Create a compelling narrative that works well in a short video format. Include descriptions of character movements, scene transitions, and any important visual elements. The animation should be consistent with the specified style.`,
    tags: ["video", "veo3", "animation", "storytelling"],
  },
  {
    id: "veo-4",
    title: "Veo 3 Space Exploration",
    description: "Create a space exploration video with Veo 3",
    category: "video",
    template: `Create a space exploration video featuring {subject} where {action}.
    Composition: {composition}
    Style: {style}
    Lighting: {lighting}
    Audio: {audio}`,
    generationPrompt: `Generate a detailed space exploration video prompt for Veo 3 with these specifications:
    - Subject & Action: {subject} {action}
    - Composition: {composition}
    - Visual Style: {style}
    - Lighting & Atmosphere: {lighting}
    - Audio Requirements: {audio}
    
    Create an immersive space exploration experience. Include details about the alien environment, any lifeforms, and the explorer's equipment. The scene should feel scientifically plausible yet visually stunning.`,
    tags: ["video", "veo3", "sci-fi", "space"],
  },
  {
    id: "veo-5",
    title: "Veo 3 Cultural Performance",
    description: "Capture a cultural performance with Veo 3",
    category: "video",
    template: `Create a video of {subject} where {action}.
    Composition: {composition}
    Style: {style}
    Lighting: {lighting}
    Audio: {audio}`,
    generationPrompt: `Generate a detailed cultural performance video prompt for Veo 3 with these specifications:
    - Subject & Action: {subject} {action}
    - Composition: {composition}
    - Visual Style: {style}
    - Lighting & Atmosphere: {lighting}
    - Audio Requirements: {audio}
    
    Capture the energy and emotion of the performance. Include details about the setting, the performer's movements, and the audience's reactions. The video should transport viewers to the location and make them feel like they're part of the experience.`,
    tags: ["video", "veo3", "culture", "performance"],
  },
];

export const templateCategories = [
  { id: "all", name: "All Templates", icon: "📋" },
  { id: "writing", name: "Writing", icon: "✍️" },
  { id: "coding", name: "Coding", icon: "💻" },
  { id: "analysis", name: "Analysis", icon: "📊" },
  { id: "creative", name: "Creative", icon: "🎨" },
];
