/** @jsxImportSource preact */
import { StoreContext } from "@/store/context";
import { useContext } from "preact/hooks";
import { themes } from "@/styles/themes";
import { PathNodeWrapper } from "./PathNodeWrapper";
import { NodeId } from "@/types/model";

function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}

export function PathView() {
  const { state } = useStore();
  const theme = themes[state.viewState.themeMode];
  const { nodes } = state.loom;

  return (
    <div className="path-view">
      <div className="content">
        {state.viewState.currentPath.map((nodeId: NodeId) => {
          const node = nodes.get(nodeId);
          if (!node) return null;
          return <PathNodeWrapper key={nodeId} id={nodeId} node={node} />;
        })}
      </div>
      <style jsx>{`
        .path-view {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid ${theme.border};
        }

        .content {
          flex: 1;
          overflow-y: auto;
        }

        /* TUI-like scrollbar */
        .content::-webkit-scrollbar {
          width: 12px;
        }

        .content::-webkit-scrollbar-track {
          background: ${theme.background};
        }

        .content::-webkit-scrollbar-thumb {
          background: ${theme.border};
          border: 3px solid ${theme.background};
          border-radius: 6px;
        }

        .content::-webkit-scrollbar-thumb:hover {
          background: ${theme.borderBright};
        }
      `}</style>
    </div>
  );
}
