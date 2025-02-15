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

  // Get the current suggestion's completion text
  const currentSuggestion = suggestions[selectedIndex]?.text || "";
  const ghostText = currentSuggestion.startsWith(userText)
    ? currentSuggestion.slice(userText.length)
    : "";

  // Update suggestions when user typed text changes
  useEffect(() => {
    setSuggestions(getSuggestions(userText));
    setSelectedIndex(0);
  }, [userText]);

  const handleFocus = useCallback(() => {
    dispatch({ type: "FOCUS_COMMAND_BAR" });
  }, [dispatch]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
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
        case "Escape":
          e.preventDefault();
          setSuggestions([]);
          break;
      }
    },
    [suggestions, ghostText, currentSuggestion]
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
        const action = executeCommand(parsedCommand, state.viewState.viewType);
        if (action) {
          dispatch(action);
        }
        setUserText("");
        setSuggestions([]);
      }
    },
    [userText, dispatch, state.viewState.viewType]
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
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
        }

        .command-bar {
          padding: 8px;
          background: ${theme.surface};
          border-bottom: 1px solid ${theme.border};
          transition: all 0.2s;
        }

        .command-bar.focused {
          background: ${theme.surfaceSelected};
          border-bottom-color: ${theme.borderSelected};
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
          color: ${isFocused ? "transparent" : theme.text};
          caret-color: ${theme.text};
          background: transparent;
          border: 1px solid ${theme.border};
          border-radius: 4px;
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
          background: ${theme.surface};
          border: 1px solid ${theme.border};
          border-top: none;
          border-radius: 0 0 4px 4px;
          max-height: 200px;
          overflow-y: auto;
        }

        .suggestion {
          padding: 8px 12px;
          cursor: pointer;
          transition: all 0.2s;
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
