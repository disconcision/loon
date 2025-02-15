import { ComponentChildren } from "preact";
import { useReducer, useEffect } from "preact/hooks";
import { StoreContext, initialState } from "./context";
import { reducer } from "./reducer";
import {
  loadNodes,
  saveNodes,
  loadViewState,
  saveViewState,
} from "@/utils/storage";

interface Props {
  children: ComponentChildren;
}

export function StoreProvider({ children }: Props) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load state from IndexedDB on startup
  useEffect(() => {
    Promise.all([loadNodes(), loadViewState()])
      .then(([nodes, viewState]) => {
        if (nodes.size > 0) {
          dispatch({
            type: "LOAD_NODES",
            nodes,
          });
        }
        if (viewState) {
          dispatch({
            type: "LOAD_VIEW_STATE",
            viewState,
          });
        }
      })
      .catch((error) => {
        console.error("Error loading state from IndexedDB:", error);
      });
  }, []);

  // Save nodes to IndexedDB whenever they change
  useEffect(() => {
    saveNodes(state.loom.nodes).catch((error) => {
      console.error("Error saving nodes to IndexedDB:", error);
    });
  }, [state.loom.nodes]);

  // Save view state whenever it changes
  useEffect(() => {
    saveViewState(state.viewState).catch((error) => {
      console.error("Error saving view state to IndexedDB:", error);
    });
  }, [state.viewState]);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}
