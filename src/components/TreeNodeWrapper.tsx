/** @jsxImportSource preact */
import { Node, NodeId } from "@/types/model";
import { useStore } from "@/store/context";
import { useCallback } from "preact/hooks";
import { themes } from "@/styles/themes";
import { MessageNode } from "./MessageNode";

interface Props {
  id: NodeId;
  node: Node;
  depth?: number;
}

export function TreeNodeWrapper({ id, node, depth = 0 }: Props) {
  const { state, dispatch } = useStore();
  const theme = themes[state.viewState.themeMode];
  const isExpanded = state.viewState.expanded.has(id);

  const handleExpand = useCallback(() => {
    dispatch({ type: "SET_NODE_EXPANDED", id, expanded: !isExpanded });
  }, [dispatch, id, isExpanded]);

  return (
    <div className="tree-node-wrapper">
      <div className="node-row">
        <div className="message-container">
          <MessageNode id={id} node={node} />
        </div>
        {node.children.length > 0 && (
          <button
            className="expand-button"
            onClick={handleExpand}
            style={{ color: theme.textDim }}
          >
            {isExpanded ? "▼" : "▶"}
          </button>
        )}
      </div>
      {isExpanded && node.children.length > 0 && (
        <div className="children">
          {node.children.map((childId) => {
            const childNode = state.loom.nodes.get(childId);
            if (!childNode) return null;
            return (
              <TreeNodeWrapper
                key={childId}
                id={childId}
                node={childNode}
                depth={depth + 1}
              />
            );
          })}
        </div>
      )}
      <style jsx>{`
        .tree-node-wrapper {
          margin: 0;
        }

        .node-row {
          display: flex;
          align-items: flex-start;
        }

        .message-container {
          flex: 1;
          min-width: 0;
        }

        .expand-button {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0 4px;
          font-size: 12px;
          line-height: inherit;
          transition: color 0.2s;
          flex-shrink: 0;
        }

        .children {
          margin-left: ${depth === 0 ? 8 : 4}px;
          padding-left: 8px;
          border-left: 1px solid ${theme.border};
        }
      `}</style>
    </div>
  );
}
