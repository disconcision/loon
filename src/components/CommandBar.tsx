/** @jsxImportSource preact */
import { useStore } from "@/store/context";
import { useCallback, useState } from "preact/hooks";
import { themes } from "@/styles/themes";

export function CommandBar() {
  const { state, dispatch } = useStore();
  const [command, setCommand] = useState("");
  const isFocused = state.viewState.focus.commandBar;
  const theme = themes[state.viewState.themeMode];

  const handleFocus = useCallback(() => {
    dispatch({ type: "FOCUS_COMMAND_BAR" });
  }, [dispatch]);

  const handleSubmit = useCallback(
    (e: Event) => {
      e.preventDefault();

      // Basic command parsing for now
      const match = command.match(/^@(\w+)(?:\s+(\d+))?$/);
      if (match) {
        const [, modelId, countStr] = match;
        const count = parseInt(countStr || "4", 10);

        const currentNode =
          state.viewState.currentPath[state.viewState.currentPath.length - 1];
        dispatch({
          type: "REQUEST_COMPLETIONS",
          parentId: currentNode,
          modelId,
          count: Math.min(count, 8),
        });

        setCommand("");
      }
    },
    [command, dispatch, state.viewState.currentPath]
  );

  return (
    <form
      onSubmit={handleSubmit}
      className={`command-bar ${isFocused ? "focused" : ""}`}
    >
      <input
        type="text"
        value={command}
        onInput={(e) => setCommand((e.target as HTMLInputElement).value)}
        onFocus={handleFocus}
        placeholder="Enter command (e.g. @go 4)"
      />
      <style jsx>{`
        .command-bar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          padding: 8px;
          background: ${theme.surface};
          border-bottom: 1px solid ${theme.border};
          transition: all 0.2s;
        }

        .command-bar.focused {
          background: ${theme.surfaceSelected};
          border-bottom-color: ${theme.borderSelected};
        }

        input {
          width: 100%;
          padding: 8px;
          font-family: monospace;
          font-size: 14px;
          color: ${theme.text};
          background: ${theme.surface};
          border: 1px solid ${theme.border};
          border-radius: 4px;
          outline: none;
          transition: all 0.2s;
        }

        input:focus {
          background: ${theme.surfaceSelected};
          border-color: ${theme.borderSelected};
        }

        input::placeholder {
          color: ${theme.textDim};
        }
      `}</style>
    </form>
  );
}
