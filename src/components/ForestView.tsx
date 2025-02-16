/** @jsxImportSource preact */
import { StoreContext } from "@/store/context";
import { useContext, useEffect } from "preact/hooks";
import { themes } from "@/styles/themes";
import { TreeNodeWrapper } from "./TreeNodeWrapper";
import { flattenTree, navigateFrom } from "@/utils/navigation";

function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}

export function ForestView() {
  const { state, dispatch } = useStore();
  const theme = themes[state.viewState.themeMode];
  const { nodes, root } = state.loom;
  const rootNode = nodes.get(root);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle navigation when command bar is not focused
      if (state.viewState.focus.commandBar) return;

      // Get currently selected node
      const selectedNode = state.viewState.focus.selectedNode;
      if (!selectedNode) return;

      // Create flattened view of the tree
      const flattened = flattenTree(nodes, root, state.viewState.expanded);

      let nextNodeId: string | null = null;

      switch (e.key) {
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
            const current = flattened.get(selectedNode);
            if (current?.isExpanded) {
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
            const current = flattened.get(selectedNode);
            if (current?.node.children.length && !current.isExpanded) {
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
  }, [dispatch, nodes, root, state.viewState.expanded, state.viewState.focus]);

  if (!rootNode) return null;

  return (
    <div className="forest-view">
      <div className="content">
        <TreeNodeWrapper id={root} node={rootNode} />
      </div>
      <style jsx>{`
        .forest-view {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid ${theme.border};
        }

        .content {
          flex: 1;
          overflow-y: auto;
        }

        /* TUI-like scrollbar */
        .content::-webkit-scrollbar {
          width: 12px;
        }

        .content::-webkit-scrollbar-track {
          background: ${theme.background};
        }

        .content::-webkit-scrollbar-thumb {
          background: ${theme.border};
          border: 3px solid ${theme.background};
          border-radius: 6px;
        }

        .content::-webkit-scrollbar-thumb:hover {
          background: ${theme.borderBright};
        }
      `}</style>
    </div>
  );
}
