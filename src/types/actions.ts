import { NodeId, Config } from './model';

export type NavigationAction =
  | { type: "NAVIGATE_SIBLING"; direction: "prev" | "next" }
  | { type: "NAVIGATE_VERTICAL"; direction: "up" | "down" }
  | { type: "FOCUS_NODE"; id: NodeId }
  | { type: "FOCUS_COMMAND_BAR" };

export type ContentAction =
  | { type: "EDIT_NODE"; id: NodeId; content: string }
  | { type: "RESIZE_NODE"; id: NodeId; height: number }
  | { type: "SET_NODE_EXPANDED"; id: NodeId; expanded: boolean };

export type ModelAction =
  | { 
      type: "REQUEST_COMPLETIONS"; 
      parentId: NodeId;
      modelId: string;
      count: number;
    }
  | { 
      type: "COMPLETION_RECEIVED"; 
      parentId: NodeId; 
      content: string;
    }
  | { 
      type: "COMPLETION_ERROR"; 
      parentId: NodeId; 
      error: string;
    };

export type ConfigAction =
  | { type: "SET_API_KEY"; service: string; key: string }
  | { type: "SET_NAVIGATION_CONFIG"; key: keyof Config["navigation"]; value: boolean };

export type Action = 
  | NavigationAction 
  | ContentAction 
  | ModelAction 
  | ConfigAction; 