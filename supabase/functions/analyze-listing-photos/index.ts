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
    const { images } = await req.json(); // Expecting { images: ["base64string...", ...] }

    if (!images || images.length === 0) {
      throw new Error("No images provided");
    }

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) throw new Error("API Key not configured");

    const ai = new GoogleGenAI({ apiKey });

    // Prepare parts: Text prompt + Images
    const parts = [
      { text: "Analyze these images for a rental listing. Return a JSON object." },
      ...images.map((b64: string) => ({
        inlineData: {
          mimeType: 'image/jpeg',
          data: b64
        }
      }))
    ];

    // Use Gemini 3 Flash for fast multimodal analysis
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING, description: "A catchy title for the item" },
                category: { type: Type.STRING, description: "The most fitting category (Vehicle, Electronics, etc)" },
                condition_rating: { type: Type.INTEGER, description: "1 to 10 scale of visual condition" },
                features: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of visible features" },
                detected_defects: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Visible scratches or damage" },
                color: { type: Type.STRING }
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