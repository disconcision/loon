import { createContext } from "preact";
import { useContext } from "preact/hooks";
import { Model, NodeId } from "@/types/model";
import { Action } from "@/types/actions";
import { generateDummyData } from "@/utils/dummy";

// Initial state with dummy data for development
const initialState: Model = {
  loom: {
    nodes: generateDummyData(),
    root: "root",
  },
  viewState: {
    viewType: "forest",
    themeMode: "dark",
    currentPath: ["root"],
    expanded: new Set(["root", "post1", "post2", "post3"]),
    focus: {
      commandBar: false,
      selectedNode: null,
    },
  },
  config: {
    apiKeys: {},
    modelCards: {
      go: {
        endpoint: "https://openrouter.ai/api/v1/chat/completions",
        parameters: {
          temperature: 0.7,
          maxTokens: 1000,
        },
        headers: {},
        rateLimit: {
          requestsPerMinute: 50,
        },
      },
    },
    navigation: {
      circularSiblings: true,
    },
  },
  pending: new Set(),
};

// Create the context
export const StoreContext = createContext<{
  state: Model;
  dispatch: (action: Action) => void;
}>({
  state: initialState,
  dispatch: () => {
    console.warn("StoreContext not initialized");
  },
});

// Custom hook for accessing the store
export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}

export { initialState };
