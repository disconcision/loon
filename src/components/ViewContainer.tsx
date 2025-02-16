/** @jsxImportSource preact */
import { useEffect, useCallback } from "preact/hooks";
import { useStore } from "@/store/context";
import { ForestView } from "./ForestView";
import { PathView } from "./PathView";
import { flattenTree, navigateFrom } from "@/utils/navigation";

export function ViewContainer() {
  const { state, dispatch } = useStore();
  const { viewType } = state.viewState;

  // Handle keyboard shortcut for view switching
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === "v") {
        e.preventDefault(); // Prevent any default browser shortcuts
        dispatch({
          type: "SET_VIEW_TYPE",
          viewType: viewType === "forest" ? "path" : "forest",
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch, viewType]);

  // Handle keyboard navigation and deletion
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle navigation when command bar is not focused
      if (state.viewState.focus.commandBar) return;

      // Get currently selected node
      const selectedNode = state.viewState.focus.selectedNode;
      if (!selectedNode) return;

      const node = state.loom.nodes.get(selectedNode);
      if (!node) return;

      // Create flattened view of the tree
      const flattened = flattenTree(
        state.loom.nodes,
        state.loom.root,
        state.viewState.expanded
      );

      let nextNodeId: string | null = null;

      switch (e.key) {
        case "Delete":
        case "Backspace":
          if (node.parent) {
            e.preventDefault();
            dispatch({ type: "DELETE_NODE", id: selectedNode });
            return;
          }
          break;
        case "ArrowUp":
          e.preventDefault();
          nextNodeId = navigateFrom(selectedNode, { type: "PREV" }, flattened);
          break;
        case "ArrowDown":
          e.preventDefault();
          nextNodeId = navigateFrom(selectedNode, { type: "NEXT" }, flattened);
          break;
        case "ArrowLeft":
          e.preventDefault();
          if (e.metaKey || e.ctrlKey) {
            // Collapse current node if it's expanded
            if (state.viewState.expanded.has(selectedNode)) {
              dispatch({
                type: "SET_NODE_EXPANDED",
                id: selectedNode,
                expanded: false,
              });
            }
          } else {
            // Navigate to parent
            nextNodeId = navigateFrom(
              selectedNode,
              { type: "PARENT" },
              flattened
            );
          }
          break;
        case "ArrowRight":
          e.preventDefault();
          if (e.metaKey || e.ctrlKey) {
            // Expand current node if it has children
            if (
              node.children.length &&
              !state.viewState.expanded.has(selectedNode)
            ) {
              dispatch({
                type: "SET_NODE_EXPANDED",
                id: selectedNode,
                expanded: true,
              });
            }
          } else {
            // Navigate to first child if expanded
            nextNodeId = navigateFrom(
              selectedNode,
              { type: "FIRST_CHILD" },
              flattened
            );
          }
          break;
      }

      if (nextNodeId) {
        dispatch({ type: "FOCUS_NODE", id: nextNodeId });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch, state]);

  // Handle clicks on the container to focus nodes
  const handleContainerClick = useCallback(
    (e: MouseEvent) => {
      // Only handle clicks on the container itself, not its children
      if (e.target === e.currentTarget) {
        // If command bar is focused, or no node is selected, focus a node
        if (
          state.viewState.focus.commandBar ||
          !state.viewState.focus.selectedNode
        ) {
          const nodeToFocus =
            state.viewState.focus.selectedNode || state.loom.root;
          dispatch({ type: "FOCUS_NODE", id: nodeToFocus });
        }
      }
    },
    [
      dispatch,
      state.viewState.focus.commandBar,
      state.viewState.focus.selectedNode,
      state.loom.root,
    ]
  );

  return (
    <div className="view-container" onClick={handleContainerClick}>
      {viewType === "forest" ? <ForestView /> : <PathView />}
      <style jsx>{`
        .view-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0; /* Allow container to shrink */
          cursor: default;
        }
      `}</style>
    </div>
  );
}
