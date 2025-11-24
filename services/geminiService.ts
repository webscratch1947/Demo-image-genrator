import { GoogleGenAI } from "@google/genai";
import { AspectRatio } from "../types";

const API_KEY = process.env.API_KEY;

// Helper to strip the data URL prefix if present (e.g., "data:image/png;base64,")
const cleanBase64 = (base64Str: string) => {
  if (base64Str.includes(',')) {
    return base64Str.split(',')[1];
  }
  return base64Str;
};

export const generateOrEditImage = async (
  prompt: string, 
  sourceImageBase64: string | null,
  aspectRatio: AspectRatio = AspectRatio.SQUARE
): Promise<string> => {
  if (!API_KEY) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const model = "gemini-2.5-flash-image";

  const parts: any[] = [];

  // If we have a source image, it's an EDIT operation or Image-to-Image generation
  if (sourceImageBase64) {
    parts.push({
      inlineData: {
        mimeType: "image/png", // Assuming PNG/JPEG, API is flexible but mimeType is required
        data: cleanBase64(sourceImageBase64),
      },
    });
  }

  // Add the text prompt
  parts.push({ text: prompt });

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: parts,
      },
      config: {
        // While Aspect Ratio is strictly an `imageConfig` property for generation,
        // passing it for editing might be ignored by the model or supported depending on the specific task.
        // For pure generation, this is essential.
        imageConfig: {
          aspectRatio: aspectRatio, 
        }
      }
    });

    // Parse response for image data
    if (response.candidates && response.candidates.length > 0) {
      const content = response.candidates[0].content;
      if (content && content.parts) {
        for (const part of content.parts) {
          if (part.inlineData && part.inlineData.data) {
            return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
          }
        }
      }
    }
    
    // If no image found, check if there is text (maybe an error description or refusal)
    if (response.text) {
      throw new Error(`The model returned text instead of an image: "${response.text}"`);
    }

    throw new Error("No image was generated. Please try a different prompt.");

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to generate image.");
  }
};