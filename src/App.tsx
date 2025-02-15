/** @jsxImportSource preact */
import { StoreProvider } from "@/store/provider";
import { CommandBar } from "@/components/CommandBar";
import { ViewContainer } from "@/components/ViewContainer";

export function App() {
  return (
    <StoreProvider>
      <div className="app">
        <CommandBar />
        <ViewContainer />
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
