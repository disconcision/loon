/** @jsxImportSource preact */
import { Node, NodeId } from "@/types/model";
import { useStore } from "@/store/context";
import { useCallback } from "preact/hooks";
import { themes } from "@/styles/themes";
import { MessageNode } from "./MessageNode";

interface Props {
  id: NodeId;
  node: Node;
}

export function PathNodeWrapper({ id, node }: Props) {
  const { state, dispatch } = useStore();
  const theme = themes[state.viewState.themeMode];

  // Get sibling information
  const parent = node.parent ? state.loom.nodes.get(node.parent) : null;
  const hasSiblings = parent ? parent.children.length > 1 : false;
  const siblingCount = parent ? parent.children.length : 0;
  const siblingIndex = parent ? parent.children.indexOf(id) + 1 : 0;

  const handleNavigateSibling = useCallback(
    (direction: "prev" | "next") => {
      dispatch({ type: "NAVIGATE_SIBLING", direction, nodeId: id });
    },
    [dispatch, id]
  );

  return (
    <div className={`path-node-wrapper ${hasSiblings ? "with-siblings" : ""}`}>
      {hasSiblings && (
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
      <div className="message-container">
        {hasSiblings && siblingCount > 1 && (
          <div className="sibling-count" style={{ color: theme.textDim }}>
            {siblingIndex}/{siblingCount}
          </div>
        )}
        <MessageNode id={id} node={node} />
      </div>
      {hasSiblings && (
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
      <style jsx>{`
        .path-node-wrapper {
          margin: 8px 0;
        }

        .path-node-wrapper:not(.with-siblings) .message-container {
          padding: 0 32px; /* 24px arrow width + 8px gap on each side */
        }

        .path-node-wrapper.with-siblings {
          display: grid;
          grid-template-columns: 24px minmax(0, 1fr) 24px;
          gap: 8px;
        }

        .sibling-controls {
          display: flex;
          align-items: center;
          height: 100%;
        }

        .sibling-controls.left {
          justify-content: flex-start;
        }

        .sibling-controls.right {
          justify-content: flex-end;
        }

        .nav-button {
          background: none;
          border: none;
          font-size: 24px;
          padding: 0;
          cursor: pointer;
          line-height: 1;
          transition: color 0.2s;
        }

        .message-container {
          position: relative;
          width: 100%;
        }

        .sibling-count {
          position: absolute;
          top: 4px;
          right: 8px;
          font-size: 11px;
          font-family: monospace;
          z-index: 1;
        }
      `}</style>
    </div>
  );
}
