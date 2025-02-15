import { ModelCard } from "@/types/model";

export const defaultCards: Record<string, ModelCard> = {
  go: {
    name: "Llama 3.3 70B Instruct",
    model: "meta-llama/llama-3.3-70b-instruct:free",
    format: "chat",
    endpoint: "https://openrouter.ai/api/v1/chat/completions",
    parameters: {
      temperature: 0.9,
      max_tokens: 18,
    },
  },
}; 