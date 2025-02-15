/** @jsxImportSource preact */
import { useEffect } from "preact/hooks";
import { StoreProvider } from "@/store/provider";
import { CommandBar } from "@/components/CommandBar";
import { ViewContainer } from "@/components/ViewContainer";
import { useStore } from "@/store/context";
import { themes } from "@/styles/themes";

function AppContent() {
  const { state, dispatch } = useStore();
  const theme = themes[state.viewState.themeMode];

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Theme toggle: Alt/Cmd + \
      if ((e.altKey || e.metaKey) && e.key === "\\") {
        e.preventDefault();
        dispatch({ type: "TOGGLE_THEME" });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch]);

  return (
    <div className="app">
      <CommandBar />
      <ViewContainer />
      <style jsx global>{`
        body {
          margin: 0;
          background: ${theme.background};
        }
      `}</style>
      <style jsx>{`
        .app {
          min-height: 100vh;
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
