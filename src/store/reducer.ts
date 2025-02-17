import { Model } from '@/types/model';
import { Action } from '@/types/actions';

export function reducer(state: Model, action: Action): Model {
  switch (action.type) {
    case 'LOAD_NODES': {
      return {
        ...state,
        loom: {
          ...state.loom,
          nodes: action.nodes,
        },
      };
    }

    case 'LOAD_VIEW_STATE': {
      // Ensure expanded is a Set and not a plain object after deserialization
      const expanded = new Set(action.viewState.expanded);
      return {
        ...state,
        viewState: {
          ...action.viewState,
          expanded,
        },
      };
    }

    case 'NAVIGATE_SIBLING': {
      const currentNode = action.nodeId;
      console.log('NAVIGATE_SIBLING - Current node:', currentNode);

      const parent = state.loom.nodes.get(currentNode)?.parent;
      console.log('NAVIGATE_SIBLING - Parent ID:', parent);
      if (!parent) {
        console.log('NAVIGATE_SIBLING - No parent found, returning');
        return state;
      }

      const parentNode = state.loom.nodes.get(parent);
      console.log('NAVIGATE_SIBLING - Parent node:', parentNode);
      if (!parentNode) {
        console.log('NAVIGATE_SIBLING - Parent node not found, returning');
        return state;
      }

      const siblings = parentNode.children;
      const currentIndex = siblings.indexOf(currentNode);
      console.log('NAVIGATE_SIBLING - Siblings:', siblings);
      console.log('NAVIGATE_SIBLING - Current index:', currentIndex);
      if (currentIndex === -1) {
        console.log('NAVIGATE_SIBLING - Current node not found in siblings, returning');
        return state;
      }

      let newIndex: number;
      if (action.direction === 'next') {
        newIndex = state.config.navigation.circularSiblings
          ? (currentIndex + 1) % siblings.length
          : Math.min(currentIndex + 1, siblings.length - 1);
      } else {
        newIndex = state.config.navigation.circularSiblings
          ? (currentIndex - 1 + siblings.length) % siblings.length
          : Math.max(currentIndex - 1, 0);
      }
      console.log('NAVIGATE_SIBLING - New index:', newIndex);
      console.log('NAVIGATE_SIBLING - New sibling:', siblings[newIndex]);

      // Find the index of the current node in the path
      const pathIndex = state.viewState.currentPath.indexOf(currentNode);
      if (pathIndex === -1) {
        console.log('NAVIGATE_SIBLING - Node not found in current path, returning');
        return state;
      }

      // Create a new path starting with the unchanged prefix up to the navigated node
      const newPath = state.viewState.currentPath.slice(0, pathIndex);

      // Add the new sibling
      const newSiblingId = siblings[newIndex];
      newPath.push(newSiblingId);

      // Follow first child path from the new sibling
      let currentId = newSiblingId;
      while (true) {
        const node = state.loom.nodes.get(currentId);
        if (!node || node.children.length === 0) break;
        currentId = node.children[0];
        newPath.push(currentId);
      }

      console.log('NAVIGATE_SIBLING - New path:', newPath);

      return {
        ...state,
        viewState: {
          ...state.viewState,
          currentPath: newPath,
          focus: { type: "node", id: newSiblingId },
        },
      };
    }

    case 'NAVIGATE_VERTICAL': {
      const currentPath = [...state.viewState.currentPath];
      if (action.direction === 'up') {
        if (currentPath.length > 1) {
          currentPath.pop();
        }
      } else {
        const currentNode = state.loom.nodes.get(currentPath[currentPath.length - 1]);
        if (currentNode && currentNode.children.length > 0) {
          currentPath.push(currentNode.children[0]);
        }
      }

      return {
        ...state,
        viewState: {
          ...state.viewState,
          currentPath,
        },
      };
    }

    case 'SET_FOCUS': {
      return {
        ...state,
        viewState: {
          ...state.viewState,
          focus: action.focus,
        },
      };
    }

    case 'SET_VIEW_TYPE': {
      return {
        ...state,
        viewState: {
          ...state.viewState,
          viewType: action.viewType,
        },
      };
    }

    case 'TOGGLE_THEME': {
      return {
        ...state,
        viewState: {
          ...state.viewState,
          themeMode: state.viewState.themeMode === 'dark' ? 'light' : 'dark',
        },
      };
    }

    case 'EDIT_NODE': {
      const node = state.loom.nodes.get(action.id);
      if (!node) return state;

      // If node has children, create a new sibling
      if (node.children.length > 0) {
        const newId = crypto.randomUUID();
        const parent = node.parent;
        if (!parent) return state;

        const parentNode = state.loom.nodes.get(parent);
        if (!parentNode) return state;

        const newNode = {
          ...node,
          id: newId,
          message: {
            ...node.message,
            content: action.content,
            timestamp: new Date(),
          },
          children: [],
          isEdited: true,
        };

        const nodes = new Map(state.loom.nodes);
        nodes.set(newId, newNode);

        const parentChildren = [...parentNode.children];
        const currentIndex = parentChildren.indexOf(action.id);
        parentChildren.splice(currentIndex + 1, 0, newId);
        nodes.set(parent, {
          ...parentNode,
          children: parentChildren,
        });

        return {
          ...state,
          loom: {
            ...state.loom,
            nodes,
          },
        };
      }

      // If node has no children, edit directly
      const nodes = new Map(state.loom.nodes);
      nodes.set(action.id, {
        ...node,
        message: {
          ...node.message,
          content: action.content,
          timestamp: new Date(),
        },
      });

      return {
        ...state,
        loom: {
          ...state.loom,
          nodes,
        },
      };
    }

    case 'CREATE_CHILD_NODE': {
      const parentNode = state.loom.nodes.get(action.parentId);
      if (!parentNode) return state;

      const newId = crypto.randomUUID();
      const nodes = new Map(state.loom.nodes);

      // Create new child node
      nodes.set(newId, {
        id: newId,
        message: {
          content: "",
          source: "human",
          timestamp: new Date(),
        },
        parent: action.parentId,
        children: [],
        isEdited: false,
      });

      // Update parent's children
      nodes.set(action.parentId, {
        ...parentNode,
        children: [...parentNode.children, newId],
      });

      return {
        ...state,
        loom: {
          ...state.loom,
          nodes,
        },
        viewState: {
          ...state.viewState,
          expanded: new Set([...state.viewState.expanded, action.parentId]),
          focus: { type: "node", id: newId },
        },
      };
    }

    case 'DELETE_NODE': {
      const nodeToDelete = state.loom.nodes.get(action.id);
      if (!nodeToDelete || !nodeToDelete.parent) return state;

      const parentNode = state.loom.nodes.get(nodeToDelete.parent);
      if (!parentNode) return state;

      // Create new nodes map without the deleted node
      const nodes = new Map(state.loom.nodes);
      nodes.delete(action.id);

      // Update parent's children list
      const updatedChildren = parentNode.children.filter(id => id !== action.id);
      nodes.set(nodeToDelete.parent, {
        ...parentNode,
        children: updatedChildren,
      });

      return {
        ...state,
        loom: {
          ...state.loom,
          nodes,
        },
        viewState: {
          ...state.viewState,
          focus: { type: "node", id: nodeToDelete.parent },
        },
      };
    }

    case 'ENTER_EDIT_MODE': {
      // Dispatch a custom event that will be caught by the MessageNode component
      window.dispatchEvent(
        new CustomEvent('ENTER_EDIT_MODE', { detail: { id: action.id } })
      );
      return state;
    }

    case 'SET_NODE_EXPANDED': {
      const expanded = new Set(state.viewState.expanded);
      if (action.expanded) {
        expanded.add(action.id);
      } else {
        expanded.delete(action.id);
      }

      return {
        ...state,
        viewState: {
          ...state.viewState,
          expanded,
        },
      };
    }

    case 'ADD_PLACEHOLDER_NODE': {
      const parentNode = state.loom.nodes.get(action.parentId);
      if (!parentNode) return state;

      const nodes = new Map(state.loom.nodes);

      // Create placeholder node
      nodes.set(action.nodeId, {
        id: action.nodeId,
        message: {
          content: "",
          source: "model",
          timestamp: new Date(),
          metadata: { isPlaceholder: true },
        },
        parent: action.parentId,
        children: [],
        isEdited: false,
      });

      // Update parent's children
      nodes.set(action.parentId, {
        ...parentNode,
        children: [...parentNode.children, action.nodeId],
      });

      // Add to pending set
      const pending = new Set(state.pending);
      pending.add(action.nodeId);

      return {
        ...state,
        loom: {
          ...state.loom,
          nodes,
        },
        pending,
        viewState: {
          ...state.viewState,
          expanded: new Set([...state.viewState.expanded, action.parentId]),
        },
      };
    }

    case 'REPLACE_PLACEHOLDER_NODE': {
      const node = state.loom.nodes.get(action.nodeId);
      if (!node) return state;

      const nodes = new Map(state.loom.nodes);
      nodes.set(action.nodeId, {
        ...node,
        message: {
          content: action.content,
          source: "model",
          timestamp: new Date(),
          metadata: action.isError ? { isError: true } : undefined,
        },
      });

      // Remove from pending set
      const pending = new Set(state.pending);
      pending.delete(action.nodeId);

      return {
        ...state,
        loom: {
          ...state.loom,
          nodes,
        },
        pending,
      };
    }

    default:
      return state;
  }
} 