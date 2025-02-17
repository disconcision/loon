/** @jsxImportSource preact */
import { useEffect, useRef } from "preact/hooks";
import { StoreProvider } from "@/store/provider";
import { CommandBar } from "@/components/CommandBar";
import { ViewContainer } from "@/components/ViewContainer";
import { useStore } from "@/store/context";
import { themes } from "@/styles/themes";

function AppContent() {
  const { state, dispatch } = useStore();
  const theme = themes[state.viewState.themeMode];
  const lastSpacePress = useRef<number>(0);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Theme toggle: Alt/Cmd + \
      if ((e.altKey || e.metaKey) && e.key === "\\") {
        e.preventDefault();
        dispatch({ type: "TOGGLE_THEME" });
      }

      // Double-space to focus command bar
      if (e.key === " " && state.viewState.focus.type === "tree") {
        const now = Date.now();
        if (now - lastSpacePress.current < 300) {
          // 300ms threshold for double-press
          e.preventDefault();
          dispatch({
            type: "SET_FOCUS",
            focus: {
              type: "command",
              indicatedNode: state.viewState.focus.indicatedNode,
            },
          });
        }
        lastSpacePress.current = now;
      }

      // Escape to toggle focus between command bar and tree
      if (e.key === "Escape") {
        e.preventDefault();
        dispatch({
          type: "SET_FOCUS",
          focus: {
            type: state.viewState.focus.type === "command" ? "tree" : "command",
            indicatedNode: state.viewState.focus.indicatedNode,
          },
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch, state.viewState.focus]);

  return (
    <div className="app">
      <ViewContainer />
      <CommandBar />
      <style>{`
        body {
          margin: 0;
          background: ${theme.background};
          overflow: hidden; /* Prevent body scrolling */
        }
      `}</style>
      <style jsx>{`
        .app {
          min-height: 100vh;
          height: 100vh;
          display: grid;
          grid-template-rows: 1fr auto;
          background: ${theme.background};
          color: ${theme.text};
          transition: all 0.2s;
          overflow: hidden; /* Prevent app-level scrolling */
        }
      `}</style>
    </div>
  );
}
export function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
