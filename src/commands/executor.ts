import { Command } from "./parser";
import { Action } from "@/types/actions";
import { ViewType } from "@/types/model";

export function executeCommand(command: Command, currentViewType: ViewType): Action | null {
  switch (command.type) {
    case "VIEW_TOGGLE":
      return {
        type: "SET_VIEW_TYPE",
        viewType: currentViewType === "forest" ? "path" : "forest",
      };
      
    case "THEME_TOGGLE":
      return {
        type: "TOGGLE_THEME",
      };
      
    case "MODEL_CALL":
      // For now, just log the command
      console.log("Model call:", command);
      return null;
      
    default:
      console.error("Unknown command type:", command);
      return null;
  }
} 