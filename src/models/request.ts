import { Node, ModelCard, Source } from "@/types/model";

type ChatMessage = {
  role: "you" | "assistant" | "system";
  content: string;
};

// Convert our source types to chat roles
function sourceToRole(source: Source): ChatMessage["role"] {
  switch (source) {
    case "human": return "you";
    case "model": return "assistant";
    case "system": return "system";
  }
}

// Format messages for completion (string concat)
function formatCompletion(nodes: Node[]): string {
  return nodes.map(node => {
    const prefix = node.message.source === "system" ? "" : `${node.message.source}: `;
    return `${prefix}${node.message.content}\n`;
  }).join("\n");
}

// Format messages for chat
function formatChat(nodes: Node[]): ChatMessage[] {
  return nodes.map(node => ({
    role: sourceToRole(node.message.source),
    content: node.message.content,
  }));
}

export async function requestCompletion(
  nodes: Node[],
  card: ModelCard,
  apiKey?: string
): Promise<string | null> {
  // If no API key, just log the prompt
  if (!apiKey) {
    console.log("No API key provided. Would have sent the following prompt:");
    if (card.format === "chat") {
      console.log("Chat messages:", formatChat(nodes));
    } else {
      console.log("Completion prompt:", formatCompletion(nodes));
    }
    return null;
  }

  // Prepare the request body based on format
  const body = {
    model: card.model,
    messages: formatChat(nodes),
    ...card.parameters,
  };

  // Log the prompt being sent
  console.log("Sending request with messages:", body.messages);

  try {
    const response = await fetch(card.endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": window.location.origin,
        "X-Title": "Loon",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error("API Error:", {
        status: response.status,
        statusText: response.statusText,
        data: errorData
      });
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Received response data:", data);  // Log the full response

    // Check if the response has the expected structure
    if (!data || !data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
      console.error("Invalid response format:", data);
      throw new Error("Invalid response format from API");
    }

    const firstChoice = data.choices[0];
    if (!firstChoice.message || typeof firstChoice.message.content !== 'string') {
      console.error("Invalid message format in choice:", firstChoice);
      throw new Error("Invalid message format in API response");
    }

    return firstChoice.message.content;
  } catch (error) {
    console.error("Error making model request:", error);
    throw error; // Re-throw to handle in the executor
  }
} 