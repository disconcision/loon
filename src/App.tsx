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
      if (e.key === " " && !state.viewState.focus.commandBar) {
        const now = Date.now();
        if (now - lastSpacePress.current < 300) {
          // 300ms threshold for double-press
          e.preventDefault();
          dispatch({ type: "FOCUS_COMMAND_BAR" });
        }
        lastSpacePress.current = now;
      }

      // Escape to focus command bar when nodes are focused
      if (
        e.key === "Escape" &&
        !state.viewState.focus.commandBar &&
        state.viewState.focus.selectedNode
      ) {
        e.preventDefault();
        dispatch({ type: "FOCUS_COMMAND_BAR" });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    dispatch,
    state.viewState.focus.commandBar,
    state.viewState.focus.selectedNode,
  ]);

  return (
    <div className="app">
      <ViewContainer />
      <CommandBar />
      <style>{`
        body {
          margin: 0;
          background: ${theme.background};
        }
      `}</style>
      <style jsx>{`
        .app {
          min-height: 100vh;
          height: 100vh; /* Ensure it takes full viewport height */
          display: flex;
          flex-direction: column;
          background: ${theme.background};
          color: ${theme.text};
          transition: all 0.2s;
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
