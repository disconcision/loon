import { NodeId, Config, ViewType, Node, ViewState } from './model';

export type NavigationAction =
  | { type: "NAVIGATE_SIBLING"; direction: "prev" | "next"; nodeId: NodeId }
  | { type: "NAVIGATE_VERTICAL"; direction: "up" | "down" }
  | { type: "FOCUS_NODE"; id: NodeId }
  | { type: "FOCUS_COMMAND_BAR" }
  | { type: "SET_VIEW_TYPE"; viewType: ViewType }
  | { type: "TOGGLE_THEME" }
  | { type: "LOAD_VIEW_STATE"; viewState: ViewState };

export type ContentAction =
  | { type: "EDIT_NODE"; id: NodeId; content: string }
  | { type: "RESIZE_NODE"; id: NodeId; height: number }
  | { type: "SET_NODE_EXPANDED"; id: NodeId; expanded: boolean }
  | { type: "LOAD_NODES"; nodes: Map<NodeId, Node> }
  | { type: "CREATE_CHILD_NODE"; parentId: NodeId }
  | { type: "DELETE_NODE"; id: NodeId };

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
    }
  | {
      type: "ADD_MODEL_RESPONSES";
      parentId: NodeId;
      responses: string[];
    }
  | {
      type: "SET_NODE_PENDING";
      nodeId: NodeId;
      isPending: boolean;
    }
  | {
      type: "ADD_PLACEHOLDER_NODE";
      parentId: NodeId;
      nodeId: NodeId;
    }
  | {
      type: "REPLACE_PLACEHOLDER_NODE";
      nodeId: NodeId;
      content: string;
      isError?: boolean;
    };

export type ConfigAction =
  | { type: "SET_API_KEY"; service: string; key: string }
  | { type: "SET_NAVIGATION_CONFIG"; key: keyof Config["navigation"]; value: boolean };

export type Action = 
  | NavigationAction 
  | ContentAction 
  | ModelAction 
  | ConfigAction; 