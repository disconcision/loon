/** @jsxImportSource preact */
import { useEffect } from "preact/hooks";
import { useStore } from "@/store/context";
import { ForestView } from "./ForestView";
import { PathView } from "./PathView";

export function ViewContainer() {
  const { state, dispatch } = useStore();
  const { viewType } = state.viewState;

  // Handle keyboard shortcut for view switching
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Support both Alt (Windows) and Option/Command (Mac)
      if ((e.altKey || e.metaKey) && e.key.toLowerCase() === "v") {
        e.preventDefault(); // Prevent any default browser shortcuts
        console.log(
          "Switching view type:",
          viewType === "forest" ? "path" : "forest"
        );
        dispatch({
          type: "SET_VIEW_TYPE",
          viewType: viewType === "forest" ? "path" : "forest",
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch, viewType]);

  return viewType === "forest" ? <ForestView /> : <PathView />;
}
