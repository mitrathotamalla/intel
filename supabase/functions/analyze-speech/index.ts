import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transcript, question } = await req.json();
    const apiKey = Deno.env.get("LOVABLE_API_KEY");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are an interview coach analyzing a candidate's spoken response. Evaluate the transcript and return a JSON object with these fields:
- fluency_score (0-100): How smooth and natural the speech flows
- grammar_score (0-100): Grammatical correctness
- confidence_score (0-100): How confident the response sounds
- filler_count (integer): Count of filler words like "um", "uh", "like", "you know"
- wpm (integer): Estimated words per minute (assume 60 second response if not specified)
- feedback (string): 2-3 sentences of constructive feedback

Return ONLY valid JSON, no markdown.`,
          },
          {
            role: "user",
            content: `Interview Question: "${question}"\n\nCandidate's Response:\n"${transcript}"`,
          },
        ],
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";
    
    let analysis;
    try {
      analysis = JSON.parse(content.replace(/```json\n?|\n?```/g, "").trim());
    } catch {
      analysis = {
        fluency_score: 50,
        grammar_score: 50,
        confidence_score: 50,
        filler_count: 0,
        wpm: 120,
        feedback: "Unable to analyze the response. Please try again with a longer answer.",
      };
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
