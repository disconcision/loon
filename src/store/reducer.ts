import { Model, NodeId } from '@/types/model';
import { Action } from '@/types/actions';

export function reducer(state: Model, action: Action): Model {
  switch (action.type) {
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
          focus: {
            ...state.viewState.focus,
            selectedNode: newSiblingId,
          },
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

    case 'FOCUS_NODE': {
      // Build path to focused node
      const newPath: NodeId[] = [];
      let currentId: NodeId | undefined = action.id;
      
      while (currentId) {
        newPath.unshift(currentId);
        const node = state.loom.nodes.get(currentId);
        currentId = node?.parent;
      }

      return {
        ...state,
        viewState: {
          ...state.viewState,
          currentPath: newPath,
          focus: {
            commandBar: false,
            selectedNode: action.id,
          },
        },
      };
    }

    case 'FOCUS_COMMAND_BAR': {
      return {
        ...state,
        viewState: {
          ...state.viewState,
          focus: {
            ...state.viewState.focus,
            commandBar: true,
          },
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

    case 'ADD_MODEL_RESPONSES': {
      const parentNode = state.loom.nodes.get(action.parentId);
      if (!parentNode) return state;

      const nodes = new Map(state.loom.nodes);
      const newChildren: NodeId[] = [];

      // Create a new node for each response
      action.responses.forEach(content => {
        const newId = crypto.randomUUID();
        nodes.set(newId, {
          id: newId,
          message: {
            content,
            source: "model",
            timestamp: new Date(),
          },
          parent: action.parentId,
          children: [],
          isEdited: false,
        });
        newChildren.push(newId);
      });

      // Update parent's children
      nodes.set(action.parentId, {
        ...parentNode,
        children: [...parentNode.children, ...newChildren],
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
        },
      };
    }

    case 'SET_NODE_PENDING': {
      const pending = new Set(state.pending);
      if (action.isPending) {
        pending.add(action.nodeId);
      } else {
        pending.delete(action.nodeId);
      }
      return {
        ...state,
        pending,
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
          content: "",  // Empty content for placeholder
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

      return {
        ...state,
        loom: {
          ...state.loom,
          nodes,
        },
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

      return {
        ...state,
        loom: {
          ...state.loom,
          nodes,
        },
      };
    }

    // Add other cases as needed...

    default:
      return state;
  }
} 