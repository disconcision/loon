/** @jsxImportSource preact */
import { useStore } from "@/store/context";
import { MessageNode } from "./MessageNode";
import { NodeId, Node } from "@/types/model";

function renderNode(
  nodeId: NodeId,
  nodes: Map<NodeId, Node>,
  expanded: Set<NodeId>
): JSX.Element | null {
  const node = nodes.get(nodeId);
  if (!node) return null;

  const parent = node.parent ? nodes.get(node.parent) : null;
  const hasSiblings = parent ? parent.children.length > 1 : false;
  const isExpanded = expanded.has(nodeId);

  return (
    <div key={nodeId} className="tree-node">
      <MessageNode id={nodeId} node={node} hasSiblings={hasSiblings} />
      {isExpanded && node.children.length > 0 && (
        <div className="children">
          {node.children.map((childId) => renderNode(childId, nodes, expanded))}
        </div>
      )}
      <style jsx>{`
        .tree-node {
          margin: 4px 0;
        }
        .children {
          margin-left: 24px;
          border-left: 1px solid #eee;
          padding-left: 24px;
        }
      `}</style>
    </div>
  );
}

export function ForestView() {
  const { state } = useStore();
  const { nodes, root } = state.loom;

  return (
    <div className="forest-view">
      {renderNode(root, nodes, state.viewState.expanded)}
      <style jsx>{`
        .forest-view {
          padding: 60px 48px 16px; /* Top padding for command bar */
          max-width: 800px;
          margin: 0 auto;
        }
      `}</style>
    </div>
  );
}
