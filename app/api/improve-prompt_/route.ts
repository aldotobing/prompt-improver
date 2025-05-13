export async function POST(request: Request) {
  // Enable CORS
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // Load sensitive data from environment variables
  const NEXT_PUBLIC_CLOUDFLARE_AI_URL =
    process.env.NEXT_PUBLIC_CLOUDFLARE_AI_URL;
  const NEXT_PUBLIC_CLOUDFLARE_AI_TOKEN =
    process.env.NEXT_PUBLIC_CLOUDFLARE_AI_TOKEN;

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Missing prompt" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

    // Create the prompt for the AI
    const aiPrompt = `You are an expert prompt engineer. 
    Analyze and enhance the following prompt while strictly preserving its original intent, 
    context, tone, and language (English, Indonesian, or other). 
    Return only the improved version of the prompt without any explanation, 
    preamble, formatting, commentary, or additional content:\n\n"${prompt}"`;

    console.log("Sending to Cloudflare Workers AI:", aiPrompt);

    // Send to Cloudflare Workers AI with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      if (!NEXT_PUBLIC_CLOUDFLARE_AI_URL || !NEXT_PUBLIC_CLOUDFLARE_AI_TOKEN) {
        throw new Error("Cloudflare AI environment variables are not set");
      }
      const response = await fetch(NEXT_PUBLIC_CLOUDFLARE_AI_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${NEXT_PUBLIC_CLOUDFLARE_AI_TOKEN}`,
        },
        body: JSON.stringify({ prompt: aiPrompt }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          "Workers AI response not OK:",
          response.status,
          errorText
        );

        // If we get an error, fall back to local improvement
        console.log("Falling back to local prompt improvement");
        const locallyImprovedPrompt = fallbackImprovePrompt(prompt);

        return new Response(
          JSON.stringify({
            originalPrompt: prompt,
            improvedPrompt: locallyImprovedPrompt,
            note: "Used fallback improvement due to API error",
          }),
          {
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          }
        );
      }

      const data = await response.json();
      console.log("Workers AI response:", JSON.stringify(data));

      // Check if the response has the expected format
      if (!data.result || !data.result.response) {
        console.error("Unexpected response format:", data);
        throw new Error("Unexpected response format from Workers AI");
      }

      const improvedPrompt = data.result.response;

      return new Response(
        JSON.stringify({
          originalPrompt: prompt,
          improvedPrompt,
        }),
        {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        throw new Error("Request to Workers AI timed out after 30 seconds");
      }
      throw fetchError;
    }
  } catch (error) {
    console.error("Error improving prompt:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to improve prompt",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
}

/**
 * Fallback prompt improvement function if the API fails
 */
function fallbackImprovePrompt(originalPrompt: string): string {
  let improved = originalPrompt.trim();

  // Check if this is an image generation request
  const isImageRequest =
    improved.toLowerCase().includes("picture") ||
    improved.toLowerCase().includes("image") ||
    improved.toLowerCase().includes("photo") ||
    improved.toLowerCase().includes("draw");

  if (isImageRequest) {
    // Special handling for image generation requests
    if (!improved.includes("detailed") && !improved.includes("high quality")) {
      improved +=
        " in high quality, with attention to detail, proper composition, and lighting.";
    }
    return improved;
  }

  // Add general quality improvements
  if (!improved.includes("detailed") && !improved.includes("specific")) {
    improved = `Please provide a detailed and specific response to the following: ${improved}`;
  }

  return improved;
}
