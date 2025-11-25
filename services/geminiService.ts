import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult } from "../types";

// Initialize Gemini Client
// NOTE: API Key is expected to be in process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelId = "gemini-2.5-flash";

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    hasPrice: {
      type: Type.BOOLEAN,
      description: "True if a price tag (usually in Euros/€) is clearly visible in the image.",
    },
    brand: {
      type: Type.STRING,
      description: "The brand name of the product (e.g., Chanel, Hermes, LV).",
    },
    productName: {
      type: Type.STRING,
      description: "The name or type of the product.",
    },
    priceEuro: {
      type: Type.NUMBER,
      description: "The numeric price value found on the tag. If multiple prices, prefer the final/discounted one. Ignore currency symbols.",
    },
    sku: {
      type: Type.STRING,
      description: "The model number, reference number, or SKU found on the tag.",
    },
  },
  required: ["hasPrice", "brand", "productName", "priceEuro", "sku"],
};

export const analyzeImage = async (base64Image: string, mimeType: string): Promise<AnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: "Analyze this image for product details. specifically looking for a price tag. Extract the Brand, Product Name, SKU/Reference Number, and Price (in Euros). If no price is clearly visible, mark hasPrice as false.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from Gemini");
    }

    const data = JSON.parse(text) as AnalysisResult;
    return data;
  } catch (error) {
    console.error("Error analyzing image:", error);
    // Return a default error object to prevent app crash
    return {
      hasPrice: false,
      brand: "Unknown",
      productName: "Unknown",
      priceEuro: 0,
      sku: "Unknown",
    };
  }
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the Data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};