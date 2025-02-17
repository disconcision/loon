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
    const handleViewSwitch = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === "v") {
        e.preventDefault(); // Prevent any default browser shortcuts
        dispatch({
          type: "SET_VIEW_TYPE",
          viewType: viewType === "forest" ? "path" : "forest",
        });
      }
    };

    window.addEventListener("keydown", handleViewSwitch);
    return () => window.removeEventListener("keydown", handleViewSwitch);
  }, [dispatch, viewType]);

  // Handle keyboard navigation and deletion
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Only handle navigation when command bar is not focused
      if (state.viewState.focus.type === "command") return;

      // Get currently indicated node
      const selectedNode = state.viewState.focus.indicatedNode;
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
        case "Enter":
          if (!e.shiftKey) {
            e.preventDefault();
            dispatch({ type: "CREATE_CHILD_NODE", parentId: selectedNode });
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
            // Enter edit mode if not expanded or no children
            if (
              !node.children.length ||
              !state.viewState.expanded.has(selectedNode)
            ) {
              dispatch({ type: "ENTER_EDIT_MODE", id: selectedNode });
              return;
            }
            // Otherwise navigate to first child if expanded
            nextNodeId = navigateFrom(
              selectedNode,
              { type: "FIRST_CHILD" },
              flattened
            );
          }
          break;
      }

      if (nextNodeId) {
        dispatch({
          type: "SET_FOCUS",
          focus: { type: "tree", indicatedNode: nextNodeId },
        });
      }
    },
    [dispatch, state]
  );

  // Handle clicks on the container to focus nodes
  const handleContainerClick = useCallback(
    (e: MouseEvent) => {
      // Only handle clicks on the container itself, not its children
      if (e.target === e.currentTarget) {
        // If command bar is focused, focus back on the tree
        if (state.viewState.focus.type === "command") {
          const nodeToFocus =
            state.viewState.currentPath[state.viewState.currentPath.length - 1];
          dispatch({
            type: "SET_FOCUS",
            focus: { type: "tree", indicatedNode: nodeToFocus },
          });
        }
        // Ensure container has focus for keyboard events
        (e.currentTarget as HTMLElement).focus();
      }
    },
    [dispatch, state.viewState.focus.type, state.viewState.currentPath]
  );

  return (
    <div
      className="view-container"
      onClick={handleContainerClick}
      onKeyDown={handleKeyDown}
      tabIndex={0} // Make container focusable
      style={{ outline: "none" }} // Hide focus ring
    >
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
