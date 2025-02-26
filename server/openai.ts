
import MistralClient from '@mistralai/mistralai';
import { SupportedLanguage } from "@shared/schema";

const mistral = new MistralClient({ apiKey: process.env.MISTRAL_API_KEY || "default-key-for-development" });

const SYSTEM_PROMPTS: Record<SupportedLanguage, string> = {
  en: "You are a helpful AI tutor. Respond concisely and clearly to help students learn.",
  hi: "आप एक सहायक AI ट्यूटर हैं। छात्रों को सीखने में मदद करने के लिए संक्षेप में और स्पष्ट रूप से जवाब दें।",
  ta: "நீங்கள் ஒரு உதவிகரமான AI ஆசிரியர். மாணவர்கள் கற்றுக்கொள்ள உதவ சுருக்கமாகவும் தெளிவாகவும் பதிலளிக்கவும்."
};

export async function getAIResponse(message: string, language: SupportedLanguage = "en") {
  try {
    const response = await mistral.chat({
      model: "mistral-7b-instruct",
      messages: [
        { role: "system", content: SYSTEM_PROMPTS[language] },
        { role: "user", content: message }
      ]
    });

    return response.choices[0].message.content || "Sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Mistral API error:", error);
    throw new Error("Failed to get AI response");
  }
}

export async function analyzeFile(content: string, language: SupportedLanguage = "en") {
  try {
    const response = await mistral.chat({
      model: "mistral-7b-instruct",
      messages: [
        {
          role: "system",
          content: `Analyze the following content and provide a summary in ${language}. Focus on key concepts and learning points.`
        },
        { role: "user", content }
      ]
    });

    return response.choices[0].message.content || "Sorry, I couldn't analyze the file.";
  } catch (error) {
    console.error("Mistral API error:", error);
    throw new Error("Failed to analyze file");
  }
}
