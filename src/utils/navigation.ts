import { Node, NodeId } from "@/types/model";

// Represents a node in the flattened view
export interface FlattenedNode {
  id: NodeId;
  depth: number;
  node: Node;
  isExpanded: boolean;
  isVisible: boolean;
  visualIndex: number;  // Position in the flattened list
}

// Create a map of flattened nodes from the tree structure
export function flattenTree(
  nodes: Map<NodeId, Node>,
  rootId: NodeId,
  expandedNodes: Set<NodeId>
): Map<NodeId, FlattenedNode> {
  const flattened = new Map<NodeId, FlattenedNode>();
  let visualIndex = 0;

  function traverse(id: NodeId, depth: number, isVisible: boolean) {
    const node = nodes.get(id);
    if (!node) return;

    const isExpanded = expandedNodes.has(id);
    
    flattened.set(id, {
      id,
      depth,
      node,
      isExpanded,
      isVisible,
      visualIndex: visualIndex++,
    });

    // Only traverse children if node is expanded
    if (isExpanded) {
      node.children.forEach(childId => {
        traverse(childId, depth + 1, isVisible);
      });
    }
  }

  traverse(rootId, 0, true);
  return flattened;
}

// Get the next visible node in the flattened list
export function getNextVisibleNode(
  currentId: NodeId,
  flattened: Map<NodeId, FlattenedNode>
): NodeId | null {
  const current = flattened.get(currentId);
  if (!current) return null;

  // Find the node with the next highest visual index
  let minHigherIndex = Infinity;
  let nextNodeId: NodeId | null = null;

  for (const [id, node] of flattened) {
    if (node.visualIndex > current.visualIndex && node.visualIndex < minHigherIndex && node.isVisible) {
      minHigherIndex = node.visualIndex;
      nextNodeId = id;
    }
  }

  return nextNodeId;
}

// Get the previous visible node in the flattened list
export function getPrevVisibleNode(
  currentId: NodeId,
  flattened: Map<NodeId, FlattenedNode>
): NodeId | null {
  const current = flattened.get(currentId);
  if (!current) return null;

  // Find the node with the next lowest visual index
  let maxLowerIndex = -1;
  let prevNodeId: NodeId | null = null;

  for (const [id, node] of flattened) {
    if (node.visualIndex < current.visualIndex && node.visualIndex > maxLowerIndex && node.isVisible) {
      maxLowerIndex = node.visualIndex;
      prevNodeId = id;
    }
  }

  return prevNodeId;
}

// Get the parent node
export function getParentNode(
  currentId: NodeId,
  flattened: Map<NodeId, FlattenedNode>
): NodeId | null {
  const current = flattened.get(currentId);
  if (!current || !current.node.parent) return null;
  return current.node.parent;
}

// Get the first child node
export function getFirstChildNode(
  currentId: NodeId,
  flattened: Map<NodeId, FlattenedNode>
): NodeId | null {
  const current = flattened.get(currentId);
  if (!current || !current.isExpanded || current.node.children.length === 0) return null;
  return current.node.children[0];
}

// Navigation action types
export type NavigationDirection = 
  | { type: "NEXT" }
  | { type: "PREV" }
  | { type: "PARENT" }
  | { type: "FIRST_CHILD" };

// Main navigation function
export function navigateFrom(
  currentId: NodeId,
  direction: NavigationDirection,
  flattened: Map<NodeId, FlattenedNode>
): NodeId | null {
  switch (direction.type) {
    case "NEXT":
      return getNextVisibleNode(currentId, flattened);
    case "PREV":
      return getPrevVisibleNode(currentId, flattened);
    case "PARENT":
      return getParentNode(currentId, flattened);
    case "FIRST_CHILD":
      return getFirstChildNode(currentId, flattened);
  }
} 