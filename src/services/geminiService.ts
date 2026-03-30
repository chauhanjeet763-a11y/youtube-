import { GoogleGenAI, GenerateContentResponse, Modality, Type } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY;

export const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function generateScript(topic: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `Please write a full YouTube script for a video titled "${topic}". 
    
    Structure Requirements:
    * The Hook (0:00-0:45): Start with a counter-intuitive fact or a high-stakes question. Do not start with "Hi guys, welcome back."
    * The Re-Hook: Every 2 minutes, include a transition that teases what is coming up next to maintain retention.
    * The Body: Break the content into 3 clear "Acts" or "Steps." Use simple, punchy sentences.
    * The Outro: A seamless transition to a Call to Action (CTA) that asks the viewer to watch a related video.
    
    Tone: Energetic, witty, and authoritative. 
    Formatting: Use [Visual] brackets to describe what should be happening on screen and [Audio] for the spoken dialogue.`,
    config: {
      systemInstruction: "You are an expert YouTube Scriptwriter specializing in high-retention storytelling. Your goal is to turn complex topics into engaging, conversational scripts that keep viewers watching until the end.",
    },
  });

  return response.text;
}

export async function optimizeMetadata(description: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `I am making a video about "${description}". Provide the following:
    
    1. 5 High-CTR Titles: Use a mix of "Negative Constraint", "Listicle", and "The Transformation".
    2. 3 Thumbnail Concepts: Describe the visual layout, the "hero" image, and the 3–4 words of text that should be on the thumbnail.
    3. SEO Description: A 2-paragraph description. The first paragraph should be keyword-rich for the algorithm; the second should be a summary for the viewer.
    4. Key Tags: Provide 15 relevant tags separated by commas.`,
    config: {
      systemInstruction: "You are a YouTube Growth Consultant. You understand the psychology of \"The Click\" and how to balance curiosity gaps with search intent.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          titles: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "5 High-CTR Titles"
          },
          thumbnailConcepts: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                layout: { type: Type.STRING },
                heroImage: { type: Type.STRING },
                textOverlay: { type: Type.STRING }
              },
              required: ["layout", "heroImage", "textOverlay"]
            },
            description: "3 Thumbnail Concepts"
          },
          seoDescription: {
            type: Type.STRING,
            description: "A 2-paragraph description"
          },
          tags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "15 relevant tags"
          }
        },
        required: ["titles", "thumbnailConcepts", "seoDescription", "tags"]
      }
    },
  });

  return JSON.parse(response.text);
}

export async function generateVideo(prompt: string, aspectRatio: "16:9" | "9:16" = "16:9") {
  // Create a fresh instance for Veo to ensure it uses the latest key from the dialog
  const veoAi = new GoogleGenAI({ apiKey: process.env.API_KEY || API_KEY });
  
  let operation = await veoAi.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      resolution: '1080p',
      aspectRatio: aspectRatio
    }
  });

  return operation;
}

export async function getOperationStatus(operation: any) {
  const veoAi = new GoogleGenAI({ apiKey: process.env.API_KEY || API_KEY });
  return await veoAi.operations.getVideosOperation({ operation });
}
