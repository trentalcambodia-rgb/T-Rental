import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenAI, Type } from "https://esm.sh/@google/genai@0.1.1";

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { images, expected_item_name, expected_serial } = await req.json();

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    const ai = new GoogleGenAI({ apiKey });

    // Prompt construction
    const promptText = `
      I am sending photos of a ${expected_item_name} for rental verification.
      Expected Serial (if visible): ${expected_serial || 'Unknown'}.
      
      Perform these checks:
      1. Quality Check: Are photos clear?
      2. Identity Check: Does it look like the correct item?
      3. Damage Check: List any NEW or OBVIOUS damage.
    `;

    const parts = [
      { text: promptText },
      ...images.map((b64: string) => ({
        inlineData: {
          mimeType: 'image/jpeg',
          data: b64
        }
      }))
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                approved: { type: Type.BOOLEAN, description: "True if photos are clear and item matches description" },
                confidence_score: { type: Type.NUMBER, description: "0.0 to 1.0 confidence in verification" },
                issues_found: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING }, 
                    description: "List of problems (e.g. 'Photo 2 too blurry', 'Scratch on screen')" 
                },
                serial_match: { type: Type.BOOLEAN, description: "True if serial number matches" }
            }
        }
      }
    });

    return new Response(response.text, {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});