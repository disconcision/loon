/** @jsxImportSource preact */
import { useStore } from "@/store/context";
import { MessageNode } from "./MessageNode";

export function PathView() {
  const { state } = useStore();
  const { nodes } = state.loom;
  const currentPath = state.viewState.currentPath;

  return (
    <div className="path-view">
      {currentPath.map((nodeId) => {
        const node = nodes.get(nodeId);
        if (!node) return null;

        const parent = node.parent ? nodes.get(node.parent) : null;
        const hasSiblings = parent ? parent.children.length > 1 : false;

        return (
          <MessageNode
            key={nodeId}
            id={nodeId}
            node={node}
            hasSiblings={hasSiblings}
          />
        );
      })}
      <style jsx>{`
        .path-view {
          padding: 60px 48px 16px; /* Top padding for command bar */
          max-width: 800px;
          margin: 0 auto;
        }
      `}</style>
    </div>
  );
}
