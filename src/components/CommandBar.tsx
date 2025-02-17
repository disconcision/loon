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
  const isFocused = state.viewState.focus.type === "command";
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
    dispatch({
      type: "SET_FOCUS",
      focus: {
        type: "command",
        indicatedNode: state.viewState.focus.indicatedNode,
      },
    });
  }, [dispatch, state.viewState.focus.indicatedNode]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Handle Escape regardless of suggestions
      if (e.key === "Escape") {
        e.preventDefault();
        setSuggestions([]);
        // Focus back on the tree
        dispatch({
          type: "SET_FOCUS",
          focus: {
            type: "tree",
            indicatedNode: state.viewState.focus.indicatedNode,
          },
        });
        // Ensure ViewContainer gets keyboard focus
        const container = document.querySelector(".view-container");
        if (container instanceof HTMLElement) {
          container.focus();
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
      state.viewState.focus.indicatedNode,
    ]
  );

  const handleInput = useCallback((e: Event) => {
    const value = (e.target as HTMLInputElement).value;
    setUserText(value);
  }, []);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!userText.trim()) return;

    // Get the currently indicated node
    const indicatedNode = state.viewState.focus.indicatedNode;
    if (!indicatedNode) return;

    const command = parseCommand(userText.trim());
    if (!command) return;

    // Clear input and focus
    setUserText("");
    dispatch({
      type: "SET_FOCUS",
      focus: {
        type: "tree",
        indicatedNode,
      },
    });

    // Execute command
    await executeCommand(command, indicatedNode, state, dispatch);
  };

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
            placeholder={isFocused ? "" : "[☰] enter command"}
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
                » {suggestion.description}
              </div>
            </div>
          ))}
        </div>
      )}
      <style jsx>{`
        .command-container {
          background: ${theme.surface};
          border-top: 1px solid ${theme.border};
          position: relative; /* For suggestions positioning */
        }

        .command-bar {
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
          padding: 0 8px;
          height: 24px; /* Fixed height for TUI consistency */
          font-family: monospace;
          color: ${theme.text};
          caret-color: ${theme.text};
          background: transparent;
          border: none;
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
          padding: 0 8px;
          height: 24px;
          line-height: 24px;
          font-family: monospace;
          pointer-events: none;
          white-space: pre;
          overflow: hidden;
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
          z-index: 100;
        }

        .suggestion {
          padding: 0 8px;
          height: 24px;
          line-height: 24px;
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
        }

        .suggestion-description {
          color: ${theme.textDim};
          font-family: monospace;
        }
      `}</style>
    </div>
  );
}
