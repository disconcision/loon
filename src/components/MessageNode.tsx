/** @jsxImportSource preact */
import { Node, NodeId } from "@/types/model";
import { useStore } from "@/store/context";
import { useCallback } from "preact/hooks";

interface Props {
  id: NodeId;
  node: Node;
  hasSiblings: boolean;
}

export function MessageNode({ id, node, hasSiblings }: Props) {
  const { state, dispatch } = useStore();
  const isExpanded = state.viewState.expanded.has(id);
  const isFocused = state.viewState.focus.textBox === id;

  const handleNavigateSibling = useCallback(
    (direction: "prev" | "next") => {
      console.log("Navigate sibling:", direction);
      dispatch({ type: "NAVIGATE_SIBLING", direction });
    },
    [dispatch]
  );

  const handleFocus = useCallback(() => {
    console.log("Focus node:", id);
    dispatch({ type: "FOCUS_NODE", id });
  }, [dispatch, id]);

  const handleExpand = useCallback(() => {
    console.log("Toggle expand:", id, !isExpanded);
    dispatch({ type: "SET_NODE_EXPANDED", id, expanded: !isExpanded });
  }, [dispatch, id, isExpanded]);

  return (
    <div className="message-container">
      <div className="message-controls">
        {hasSiblings && (
          <>
            <button onClick={() => handleNavigateSibling("prev")}>←</button>
            <button onClick={() => handleNavigateSibling("next")}>→</button>
          </>
        )}
        {node.children.length > 0 && (
          <button onClick={handleExpand}>{isExpanded ? "▼" : "▶"}</button>
        )}
      </div>
      <div
        className={`message-node ${isFocused ? "focused" : ""} ${node.message.source}`}
        onClick={handleFocus}
      >
        <div className="message-content">{node.message.content}</div>
      </div>
      <style jsx>{`
        .message-container {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          margin: 4px 0;
        }

        .message-controls {
          display: flex;
          gap: 4px;
          padding-top: 8px; /* Align with message content */
        }

        .message-controls button {
          padding: 2px 6px;
          background: none;
          border: 1px solid #ccc;
          border-radius: 2px;
          cursor: pointer;
          font-family: monospace;
          min-width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .message-controls button:hover {
          background: #f0f0f0;
        }

        .message-node {
          flex: 1;
          padding: 8px;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-family: monospace;
          cursor: pointer;
        }

        .message-node.focused {
          border-color: #000;
        }

        .message-node.human {
          background: #f5f5f5;
        }

        .message-node.model {
          background: #f0f7ff;
        }

        .message-node.system {
          background: #fff0f0;
        }

        .message-content {
          white-space: pre-wrap;
          overflow-wrap: break-word;
        }
      `}</style>
    </div>
  );
}
