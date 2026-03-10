import { GoogleGenAI, Type } from "@google/genai";

const VALID_CATEGORIES = [
  "Electronics", "Phones & Tablets", "Computing", "Gaming", "Fashion", 
  "Health & Beauty", "Home & Kitchen", "Furniture", "Appliances", 
  "Decor", "Bedding & Bath", "Cleaning Supplies", "Garden & Outdoors", 
  "Tools & Home Improvement"
];

export async function generateProductDetails(productName: string, currentCategory: string, imageUrl?: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
  
  const prompt = `Analyze the product name and the provided image (if any) to generate a compelling product description and determine the most appropriate category.
  Product Name: ${productName || 'Unknown'}
  Current Category Hint: ${currentCategory || 'None'}
  
  The description should be around 2-3 sentences, highlighting potential benefits and quality.
  For the category, you MUST choose exactly one from this list: ${VALID_CATEGORIES.join(', ')}.`;

  const parts: any[] = [{ text: prompt }];

  if (imageUrl) {
    if (imageUrl.startsWith('data:image/')) {
      const matches = imageUrl.match(/^data:(image\/[a-zA-Z0-9+]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        parts.push({
          inlineData: {
            mimeType: matches[1],
            data: matches[2]
          }
        });
      }
    } else if (imageUrl.startsWith('http')) {
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        
        const matches = base64Data.match(/^data:(image\/[a-zA-Z0-9+]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          parts.push({
            inlineData: {
              mimeType: matches[1],
              data: matches[2]
            }
          });
        }
      } catch (e) {
        console.warn("Could not fetch image for AI description (CORS or network error):", e);
      }
    }
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING, description: "A 2-3 sentence product description." },
            category: { type: Type.STRING, description: "The most appropriate product category." }
          },
          required: ["description", "category"]
        }
      }
    });

    const result = JSON.parse(response.text?.trim() || "{}");
    return {
      description: result.description || "Failed to generate description.",
      category: result.category || currentCategory
    };
  } catch (error) {
    console.error("AI Generation Error:", error);
    return {
      description: "Error generating description. Please try again.",
      category: currentCategory
    };
  }
}
