export async function POST(request: Request) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // Load sensitive data from environment variables
  const CLOUDFLARE_AI_URL = process.env.CLOUDFLARE_AI_URL;
  const CLOUDFLARE_AI_TOKEN = process.env.CLOUDFLARE_AI_TOKEN;

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await request.json();

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid Input" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

    // Extract the user message
    const userMessage = messages[0].content;

    console.log("Sending to Cloudflare Workers AI:", userMessage);

    // Use the new Cloudflare Workers AI endpoint
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      if (!CLOUDFLARE_AI_URL || !CLOUDFLARE_AI_TOKEN) {
        throw new Error("Cloudflare AI environment variables are not set");
      }
      const response = await fetch(CLOUDFLARE_AI_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${CLOUDFLARE_AI_TOKEN}`,
        },
        body: JSON.stringify({ prompt: userMessage }),
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
        throw new Error(
          `Workers AI returned status ${response.status}: ${errorText}`
        );
      }

      const data = await response.json();
      console.log("Workers AI response:", JSON.stringify(data));

      // Format the response to match what the frontend expects
      const formattedResponse = {
        tasks: [
          {
            inputs: { messages },
            response: data.result.response,
          },
        ],
      };

      return new Response(JSON.stringify(formattedResponse), {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        throw new Error("Request to Workers AI timed out after 30 seconds");
      }
      throw fetchError;
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
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
