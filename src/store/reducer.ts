import { Model, NodeId } from '@/types/model';
import { Action } from '@/types/actions';

export function reducer(state: Model, action: Action): Model {
  switch (action.type) {
    case 'NAVIGATE_SIBLING': {
      const currentNode = state.viewState.currentPath[state.viewState.currentPath.length - 1];
      const parent = state.loom.nodes.get(currentNode)?.parent;
      if (!parent) return state;

      const parentNode = state.loom.nodes.get(parent);
      if (!parentNode) return state;

      const siblings = parentNode.children;
      const currentIndex = siblings.indexOf(currentNode);
      if (currentIndex === -1) return state;

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

      const newPath = [...state.viewState.currentPath];
      newPath[newPath.length - 1] = siblings[newIndex];

      return {
        ...state,
        viewState: {
          ...state.viewState,
          currentPath: newPath,
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
      return {
        ...state,
        viewState: {
          ...state.viewState,
          focus: {
            ...state.viewState.focus,
            commandBar: false,
            textBox: action.id,
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
            textBox: undefined,
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

    // Add other cases as needed...

    default:
      return state;
  }
} 