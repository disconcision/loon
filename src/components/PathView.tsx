/** @jsxImportSource preact */
import { useStore } from "@/store/context";
import { MessageNode } from "./MessageNode";

export function PathView() {
  const { state } = useStore();
  const { nodes } = state.loom;
  const currentPath = state.viewState.currentPath;

  return (
    <div className="path-view">
      {currentPath.map((nodeId, index) => {
        const node = nodes.get(nodeId);
        if (!node) return null;

        // For path view, a node has siblings if its parent has more than one child
        const parent = node.parent ? nodes.get(node.parent) : null;
        const hasSiblings = parent ? parent.children.length > 1 : false;

        return (
          <div key={nodeId} className="path-node">
            <MessageNode id={nodeId} node={node} hasSiblings={hasSiblings} />
          </div>
        );
      })}
      <style jsx>{`
        .path-view {
          padding: 60px 48px 16px; /* Top padding for command bar */
          max-width: 800px;
          margin: 0 auto;
        }
        .path-node {
          margin: 8px 0;
        }
      `}</style>
    </div>
  );
}
