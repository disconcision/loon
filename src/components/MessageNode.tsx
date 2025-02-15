/** @jsxImportSource preact */
import { Node, NodeId } from "@/types/model";
import { useStore } from "@/store/context";
import { useCallback } from "preact/hooks";
import { themes } from "@/styles/themes";
import "@/styles/message.css";
import { TypingIndicator } from "./TypingIndicator";

interface Props {
  id: NodeId;
  node: Node;
  hasSiblings: boolean;
}

export function MessageNode({ id, node, hasSiblings }: Props) {
  const { state, dispatch } = useStore();
  const isExpanded = state.viewState.expanded.has(id);
  const isFocused = state.viewState.focus.selectedNode === id;
  const isPathView = state.viewState.viewType === "path";
  const theme = themes[state.viewState.themeMode];

  // Get sibling information
  const parent = node.parent ? state.loom.nodes.get(node.parent) : null;
  const siblingCount = parent ? parent.children.length : 0;
  const siblingIndex = parent ? parent.children.indexOf(id) + 1 : 0;
  const showSiblingControls = isPathView && hasSiblings;

  const handleNavigateSibling = useCallback(
    (direction: "prev" | "next") => {
      console.log("Navigate sibling:", direction, "for node:", id);
      dispatch({ type: "NAVIGATE_SIBLING", direction, nodeId: id });
    },
    [dispatch, id]
  );

  const handleFocus = useCallback(() => {
    console.log("Focus node:", id);
    dispatch({ type: "FOCUS_NODE", id });
  }, [dispatch, id]);

  const handleExpand = useCallback(() => {
    console.log("Toggle expand:", id, !isExpanded);
    dispatch({ type: "SET_NODE_EXPANDED", id, expanded: !isExpanded });
  }, [dispatch, id, isExpanded]);

  const isPlaceholder = node.message.metadata?.isPlaceholder === true;
  const isError = node.message.metadata?.isError === true;

  return (
    <div className="message-container">
      <div
        className={`message-node-wrapper ${showSiblingControls ? "with-siblings" : "without-siblings"}`}
      >
        {showSiblingControls && (
          <div className="sibling-controls left">
            <button
              className="nav-button prev"
              onClick={() => handleNavigateSibling("prev")}
              style={{ color: theme.textDim }}
            >
              ‹
            </button>
          </div>
        )}
        <div
          className={`message-node ${isFocused ? "focused" : ""} ${node.message.source} ${isError ? "error" : ""}`}
          onClick={handleFocus}
          style={{
            background: theme[node.message.source],
            borderColor: isFocused ? theme.borderSelected : "transparent",
          }}
        >
          {showSiblingControls && siblingCount > 1 && (
            <div className="sibling-count" style={{ color: theme.textDim }}>
              {siblingIndex}/{siblingCount}
            </div>
          )}
          <div
            className="message-content"
            style={{ color: isError ? theme.textDim : theme.text }}
          >
            {isPlaceholder ? <TypingIndicator /> : node.message.content}
          </div>
          {state.pending.has(id) && (
            <div className="pending-indicator" style={{ color: theme.textDim }}>
              •••
            </div>
          )}
        </div>
        {showSiblingControls && (
          <div className="sibling-controls right">
            <button
              className="nav-button next"
              onClick={() => handleNavigateSibling("next")}
              style={{ color: theme.textDim }}
            >
              ›
            </button>
          </div>
        )}
      </div>
      {!isPathView && node.children.length > 0 && (
        <button
          className="expand-button"
          onClick={handleExpand}
          style={{ color: theme.textDim }}
        >
          {isExpanded ? "▼" : "▶"}
        </button>
      )}
      <style jsx>{`
        .pending-indicator {
          position: absolute;
          bottom: 4px;
          right: 4px;
          font-size: 14px;
          opacity: 0.7;
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.7;
          }
          100% {
            opacity: 0.3;
          }
        }
        .message-node.error {
          opacity: 0.7;
        }
      `}</style>
    </div>
  );
}
