import { ComponentChildren } from "preact";
import { useReducer } from "preact/hooks";
import { StoreContext, initialState } from "./context";
import { reducer } from "./reducer";

interface Props {
  children: ComponentChildren;
}

export function StoreProvider({ children }: Props) {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}
