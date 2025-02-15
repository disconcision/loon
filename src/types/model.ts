// Unique identifiers for nodes in the message tree
export type NodeId = string;

// Message sources - extensible for future tool integration
export type Source = 
  | "human"    // User-entered content
  | "model"    // LLM responses
  | "system";  // System messages (errors, status)

// Core message type
export interface Message {
  content: string;
  source: Source;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

// Node in the message tree
export interface Node {
  id: NodeId;
  message: Message;
  parent?: NodeId;
  children: NodeId[];
  isEdited: boolean;
}

// Main state tree
export interface Loom {
  nodes: Map<NodeId, Node>;
  root: NodeId;
}

// Configuration for model API calls
export interface ModelConfig {
  endpoint: string;
  parameters: {
    temperature: number;
    maxTokens: number;
    [key: string]: unknown;
  };
  headers: Record<string, string>;
  rateLimit?: {
    requestsPerMinute: number;
    tokensPerMinute?: number;
  };
}

export type ViewType = "forest" | "path";
export type ThemeMode = "dark" | "light";

// View state tracking
export interface ViewState {
  viewType: ViewType;
  themeMode: ThemeMode;
  currentPath: NodeId[];  // The full path of visible nodes
  expanded: Set<NodeId>;
  focus: {
    commandBar: boolean;
    selectedNode: NodeId | null;  // The currently selected/focused node
  };
}

// API Configuration
export type ApiConfig = {
  openRouter?: string;
};

// Model format type
export type ModelFormat = "chat" | "completion";

// Model configuration
export interface ModelCard {
  name: string;
  model: string;  // OpenRouter model identifier
  format: ModelFormat;
  endpoint: string;
  parameters: {
    temperature: number;
    max_tokens: number;
    top_p?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
  };
}

// Application configuration
export interface Config {
  apiKeys: ApiConfig;
  modelCards: Record<string, ModelCard>;
  navigation: {
    circularSiblings: boolean;
  };
}

// Application state
export interface Model {
  loom: Loom;
  viewState: ViewState;
  config: Config;
  pending: Set<NodeId>; // Tracks nodes with in-flight requests
} 