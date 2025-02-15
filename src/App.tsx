/** @jsxImportSource preact */
import { StoreProvider } from "@/store/provider";
import { CommandBar } from "@/components/CommandBar";
import { ForestView } from "@/components/ForestView";

export function App() {
  return (
    <StoreProvider>
      <div className="app">
        <CommandBar />
        <ForestView />
        <style jsx>{`
          .app {
            min-height: 100vh;
            background: #fff;
          }
        `}</style>
      </div>
    </StoreProvider>
  );
}
