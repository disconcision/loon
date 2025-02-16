/** @jsxImportSource preact */
import { useStore } from "@/store/context";
import { useCallback, useState, useEffect, useRef } from "preact/hooks";
import { themes } from "@/styles/themes";
import { parseCommand, getSuggestions, Suggestion } from "@/commands/parser";
import { executeCommand } from "@/commands/executor";

export function CommandBar() {
  const { state, dispatch } = useStore();
  const [userText, setUserText] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const isFocused = state.viewState.focus.commandBar;
  const theme = themes[state.viewState.themeMode];
  const inputRef = useRef<HTMLInputElement>(null);

  // Get the current suggestion's completion text
  const currentSuggestion = suggestions[selectedIndex]?.text || "";
  const ghostText = currentSuggestion.startsWith(userText)
    ? currentSuggestion.slice(userText.length)
    : "";

  // Focus input when commandBar focus state changes
  useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);

  // Update suggestions when user typed text changes
  useEffect(() => {
    setSuggestions(getSuggestions(userText));
    setSelectedIndex(0);
  }, [userText]);

  const handleFocus = useCallback(() => {
    // Only update commandBar focus, preserve textBox focus
    dispatch({
      type: "FOCUS_COMMAND_BAR",
    });
  }, [dispatch]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Handle Escape regardless of suggestions
      if (e.key === "Escape") {
        e.preventDefault();
        setSuggestions([]);
        // Focus back on the last selected node
        if (state.viewState.currentPath.length > 0) {
          dispatch({
            type: "FOCUS_NODE",
            id: state.viewState.currentPath[
              state.viewState.currentPath.length - 1
            ],
          });
        }
        return;
      }

      if (suggestions.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((i) => (i + 1) % suggestions.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex(
            (i) => (i - 1 + suggestions.length) % suggestions.length
          );
          break;
        case "ArrowRight":
        case "Tab":
          if (ghostText) {
            e.preventDefault();
            setUserText(currentSuggestion);
          }
          break;
        case "Enter":
          if (userText.trim() === "") {
            e.preventDefault();
            setUserText(currentSuggestion);
          }
          break;
      }
    },
    [
      suggestions,
      ghostText,
      currentSuggestion,
      dispatch,
      state.viewState.currentPath,
    ]
  );

  const handleInput = useCallback((e: Event) => {
    const value = (e.target as HTMLInputElement).value;
    setUserText(value);
  }, []);

  const handleSubmit = useCallback(
    (e: Event) => {
      e.preventDefault();

      const parsedCommand = parseCommand(userText.trim());
      if (parsedCommand) {
        // Get nodes in current path
        const pathNodes = state.viewState.currentPath
          .map((id) => state.loom.nodes.get(id))
          .filter(
            (node): node is NonNullable<typeof node> => node !== undefined
          );

        const action = executeCommand(
          parsedCommand,
          state.viewState.viewType,
          pathNodes,
          dispatch,
          state
        );
        if (action) {
          dispatch(action);
        }
        setUserText("");
        setSuggestions([]);

        // Clear focus from command bar
        dispatch({
          type: "FOCUS_NODE",
          id: state.viewState.currentPath[
            state.viewState.currentPath.length - 1
          ],
        });
      }
    },
    [
      userText,
      dispatch,
      state.viewState.viewType,
      state.viewState.currentPath,
      state.loom.nodes,
    ]
  );

  const handleSuggestionClick = useCallback((suggestion: Suggestion) => {
    setUserText(suggestion.text);
  }, []);

  return (
    <div className="command-container">
      <form
        onSubmit={handleSubmit}
        className={`command-bar ${isFocused ? "focused" : ""}`}
      >
        <div className="input-container">
          <input
            ref={inputRef}
            type="text"
            value={userText}
            onInput={handleInput}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            placeholder="Enter command (e.g. view, theme, @go)"
          />
          {isFocused && (
            <div className="ghost-container">
              <span className="ghost-user">{userText}</span>
              <span className="ghost-suggestion">{ghostText}</span>
            </div>
          )}
        </div>
      </form>
      {suggestions.length > 0 && isFocused && (
        <div className="suggestions">
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.text}
              className={`suggestion ${index === selectedIndex ? "selected" : ""}`}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="suggestion-text">{suggestion.displayText}</div>
              <div className="suggestion-description">
                {suggestion.description}
              </div>
            </div>
          ))}
        </div>
      )}
      <style jsx>{`
        .command-container {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 100;
        }

        .command-bar {
          background: ${theme.surface};
          border-top: 1px solid ${theme.border};
          transition: all 0.2s;
        }

        .command-bar.focused {
          background: ${theme.surfaceSelected};
          border-top-color: ${theme.borderSelected};
        }

        .input-container {
          position: relative;
          width: 100%;
        }

        input {
          width: 100%;
          padding: 8px;
          font-family: monospace;
          font-size: 14px;
          color: #e0e0e0;
          caret-color: #e0e0e0;
          background: transparent;
          border-top: 1px solid #404040;
          border-radius: 0px;
          outline: none;
          transition: all 0.2s;
        }

        input:focus {
          border-color: ${theme.borderSelected};
        }

        input::placeholder {
          color: ${theme.textDim};
        }

        .ghost-container {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          padding: 8px;
          font-family: monospace;
          font-size: 14px;
          pointer-events: none;
          white-space: pre;
          overflow: hidden;
          border: 1px solid transparent;
          border-radius: 4px;
        }

        .ghost-user {
          color: ${theme.text};
        }

        .ghost-suggestion {
          color: ${theme.textDim};
          opacity: 0.5;
        }

        .suggestions {
          position: absolute;
          bottom: 100%;
          left: 0;
          right: 0;
          background: ${theme.surface};
          border: 1px solid ${theme.border};
          border-bottom: none;
          border-radius: 4px 4px 0 0;
          max-height: 200px;
          overflow-y: auto;
        }

        .suggestion {
          padding: 2px 8px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          gap: 1ch;
        }

        .suggestion:hover,
        .suggestion.selected {
          background: ${theme.surfaceSelected};
        }

        .suggestion-text {
          color: ${theme.text};
          font-family: monospace;
          font-size: 14px;
        }

        .suggestion-description {
          color: ${theme.textDim};
          font-size: 12px;
          margin-top: 2px;
        }
      `}</style>
    </div>
  );
}
