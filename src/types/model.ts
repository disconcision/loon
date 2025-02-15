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

// View state tracking
export interface ViewState {
  currentPath: NodeId[];
  expanded: Set<NodeId>;
  focus: {
    commandBar: boolean;
    textBox?: NodeId;
  };
}

// Application configuration
export interface Config {
  apiKeys: Record<string, string>;
  modelCards: Record<string, ModelConfig>;
  navigation: {
    circularSiblings: boolean;
  };
}

// Application state
export interface Model {
  loom: Loom;
  viewState: ViewState;
  config: Config;
  pending: Map<NodeId, number>; // Tracks in-flight completions
} 