import { Command } from "./parser";
import { Action } from "@/types/actions";
import { ViewType, Node, NodeId, Model } from "@/types/model";
import { defaultCards } from "@/models/cards";
import { requestCompletion } from "@/models/request";

export function executeCommand(
  command: Command,
  nodeId: NodeId,
  state: Model,
  dispatch: (action: Action) => void
): Action | null {
  switch (command.type) {
    case "VIEW_TOGGLE":
      return {
        type: "SET_VIEW_TYPE",
        viewType: state.viewState.viewType === "forest" ? "path" : "forest",
      };
      
    case "THEME_TOGGLE":
      return {
        type: "TOGGLE_THEME",
      };
      
    case "MODEL_CALL": {
      const card = defaultCards[command.model];
      if (!card) {
        console.error(`Unknown model: ${command.model}`);
        return null;
      }

      // Get API key from localStorage
      const apiKey = localStorage.getItem("openrouter_key") || undefined;
      
      // Get the indicated node
      const selectedNodeId = nodeId;
      if (!selectedNodeId) {
        console.error("No node selected for model call");
        return null;
      }

      // Build path to selected node
      const pathToSelected: Node[] = [];
      let currentId: NodeId | undefined = selectedNodeId;
      
      while (currentId) {
        const node = state.loom.nodes.get(currentId);
        if (!node) break;
        pathToSelected.unshift(node);
        currentId = node.parent;
      }

      const count = command.count || 1;
      const placeholderIds: string[] = [];

      // Create placeholder nodes immediately
      for (let i = 0; i < count; i++) {
        const placeholderId = crypto.randomUUID();
        placeholderIds.push(placeholderId);
        dispatch({
          type: "ADD_PLACEHOLDER_NODE",
          parentId: selectedNodeId,
          nodeId: placeholderId,
        });
      }

      // Start the request(s) in the background
      (async () => {
        try {
          for (let i = 0; i < count; i++) {
            const response = await requestCompletion(pathToSelected, card, apiKey);
            if (response) {
              console.log(`Received response ${i + 1}/${count}:`, response);
              
              // Replace placeholder with actual response
              dispatch({
                type: "REPLACE_PLACEHOLDER_NODE",
                nodeId: placeholderIds[i],
                content: response,
              });
            } else {
              // Replace placeholder with error message
              dispatch({
                type: "REPLACE_PLACEHOLDER_NODE",
                nodeId: placeholderIds[i],
                content: "Failed to get response from model",
                isError: true,
              });
            }
          }
        } catch (error) {
          console.error("Error getting completions:", error);
          // Replace remaining placeholders with error messages
          for (let i = 0; i < count; i++) {
            dispatch({
              type: "REPLACE_PLACEHOLDER_NODE",
              nodeId: placeholderIds[i],
              content: "Error: " + (error instanceof Error ? error.message : String(error)),
              isError: true,
            });
          }
        }
      })();
      
      return null;
    }

    case "ADD_KEY": {
      localStorage.setItem("openrouter_key", command.key);
      console.log("API key added");
      return null;
    }

    case "CLEAR_KEY": {
      localStorage.removeItem("openrouter_key");
      console.log("API key removed");
      return null;
    }
      
    default:
      console.error("Unknown command type:", command);
      return null;
  }
} 