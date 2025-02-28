/** @jsxImportSource preact */
import { Node, NodeId } from "@/types/model";
import { useStore } from "@/store/context";
import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import { themes } from "@/styles/themes";
import "@/styles/message.css";
import { TypingIndicator } from "./TypingIndicator";

interface Props {
  id: NodeId;
  node: Node;
  hasChildren?: boolean;
  isExpanded?: boolean;
}

export function MessageNode({
  id,
  node,
  hasChildren = false,
  isExpanded = false,
}: Props) {
  const { state, dispatch } = useStore();
  const theme = themes[state.viewState.themeMode];
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(node.message.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const contentRef = useRef<HTMLPreElement>(null);
  const isPending = state.pending.has(id);
  const hasFocus =
    state.viewState.focus.type === "tree" &&
    state.viewState.focus.indicatedNode === id;
  const isIndicated = state.viewState.focus.indicatedNode === id;
  const isCurrentPath =
    state.viewState.currentPath[state.viewState.currentPath.length - 1] === id;

  // Update textarea height to match content
  const updateTextareaHeight = useCallback(() => {
    if (textareaRef.current) {
      // First set height to 0 to get the proper scrollHeight
      textareaRef.current.style.height = "0";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, []);

  // Handle entering edit mode
  const enterEditMode = useCallback(() => {
    // Measure content height before switching to edit mode
    const contentHeight = contentRef.current?.offsetHeight;
    setIsEditing(true);
    setEditedContent(node.message.content);
    // After switching to edit mode, set initial textarea height
    requestAnimationFrame(() => {
      if (textareaRef.current && contentHeight) {
        textareaRef.current.style.height = `${contentHeight}px`;
        // Then let it adjust to its content
        updateTextareaHeight();
      }
    });
  }, [node.message.content, updateTextareaHeight]);

  // Handle expanding/collapsing
  const handleExpand = useCallback(() => {
    if (hasChildren) {
      dispatch({ type: "SET_NODE_EXPANDED", id, expanded: !isExpanded });
    }
  }, [dispatch, id, hasChildren, isExpanded]);

  useEffect(() => {
    if (isEditing) {
      // Focus and move cursor to end when entering edit mode
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(
          textareaRef.current.value.length,
          textareaRef.current.value.length
        );
        updateTextareaHeight();
      }
    }
  }, [isEditing, updateTextareaHeight]);

  const handleClick = useCallback(() => {
    if (!isEditing) {
      dispatch({
        type: "SET_FOCUS",
        focus: {
          type: "tree",
          indicatedNode: id,
        },
      });
    }
  }, [dispatch, id, isEditing]);

  const handleDoubleClick = useCallback(() => {
    enterEditMode();
  }, [enterEditMode]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (isEditing) {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          if (editedContent !== node.message.content) {
            dispatch({ type: "EDIT_NODE", id, content: editedContent });
          }
          exitEditMode();
        } else if (e.key === "Escape") {
          e.preventDefault();
          setEditedContent(node.message.content);
          exitEditMode();
        } else if (
          ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)
        ) {
          const textarea = textareaRef.current;
          if (!textarea) return;

          const { selectionStart, selectionEnd, value } = textarea;

          // Check if we should surrender control based on cursor position and key
          const shouldSurrender =
            (e.key === "ArrowUp" && selectionStart === 0) ||
            (e.key === "ArrowDown" && selectionEnd === value.length) ||
            (e.key === "ArrowLeft" && selectionStart === 0) ||
            (e.key === "ArrowRight" && selectionEnd === value.length);

          if (shouldSurrender) {
            e.preventDefault();
            if (editedContent !== node.message.content) {
              dispatch({ type: "EDIT_NODE", id, content: editedContent });
            }
            exitEditMode();
          }
          // Otherwise let the textarea handle the arrow key normally
        }
      }
    },
    [isEditing, node.message.content, editedContent, dispatch, id]
  );

  // Handle exiting edit mode
  const exitEditMode = useCallback(() => {
    setIsEditing(false);
    // Explicitly blur the textarea
    textareaRef.current?.blur();
    // Focus the ViewContainer
    const container = document.querySelector(".view-container");
    if (container instanceof HTMLElement) {
      container.focus();
    }
  }, []);

  const handleBlur = useCallback(() => {
    if (isEditing) {
      setIsEditing(false);
      if (editedContent !== node.message.content) {
        dispatch({ type: "EDIT_NODE", id, content: editedContent });
      }
    }
  }, [dispatch, editedContent, id, node.message.content, isEditing]);

  // Listen for ENTER_EDIT_MODE action
  useEffect(() => {
    if (hasFocus && !isEditing) {
      const handleEditMode = (e: Event) => {
        const customEvent = e as CustomEvent<{ id: NodeId }>;
        if (customEvent.detail?.id === id) {
          enterEditMode();
        }
      };
      window.addEventListener(
        "ENTER_EDIT_MODE",
        handleEditMode as EventListener
      );
      return () =>
        window.removeEventListener(
          "ENTER_EDIT_MODE",
          handleEditMode as EventListener
        );
    }
  }, [hasFocus, isEditing, id, enterEditMode]);

  // Update height when content changes
  useEffect(() => {
    updateTextareaHeight();
  }, [editedContent, updateTextareaHeight]);

  const isPlaceholder = node.message.metadata?.isPlaceholder === true;
  const isError = node.message.metadata?.isError === true;

  // Debug logging
  console.log(`Node ${id}:`, {
    content: node.message.content,
    metadata: node.message.metadata,
    isPlaceholder,
    isPending: state.pending.has(id),
  });

  const sourceLabel = {
    human: "you",
    model: "llm",
    system: "sys",
  }[node.message.source];

  return (
    <div
      className="message-node"
      data-pending={isPending}
      data-focused={hasFocus}
      data-indicated={isIndicated}
      data-source={node.message.source}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
    >
      {isEditing ? (
        <pre className="content">
          {hasChildren && (
            <span className="expander-space">{isExpanded ? "⌄" : "›"}</span>
          )}
          <span className="source-label">{sourceLabel}</span>
          <textarea
            ref={textareaRef}
            value={editedContent}
            onChange={(e) => {
              setEditedContent(e.currentTarget.value);
              updateTextareaHeight();
            }}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="textarea"
          />
        </pre>
      ) : (
        <pre
          ref={contentRef}
          className={`content ${isError ? "error" : ""}`}
          onClick={handleClick}
          onDblClick={handleDoubleClick}
        >
          {hasChildren && (
            <span
              className="expander-space"
              onClick={(e) => {
                e.stopPropagation();
                handleExpand();
              }}
            >
              {isExpanded ? "⌄" : "›"}
            </span>
          )}
          <span className="source-label">{sourceLabel}⚡</span>
          <span className="message-text">
            {isPlaceholder ? <TypingIndicator /> : node.message.content}
          </span>
        </pre>
      )}
      <style jsx>{`
        .message-node {
          position: relative;
          background: ${theme.background};
          transition: background 0.2s;
          border-left: 2px solid transparent;
          line-height: 1.2;
          outline: none;
        }

        .message-node:nth-child(odd) {
          background: ${theme.backgroundAlt};
        }

        .message-node[data-focused="true"] {
          border-left-color: ${theme.accent};
        }

        .message-node[data-indicated="true"]:not([data-focused="true"]) {
          border-left-color: ${theme.textDim};
        }

        .content,
        .textarea {
          margin: 0;
          padding: 0;
          font-family: inherit;
          font-size: inherit;
          white-space: pre-wrap;
          word-wrap: break-word;
          color: ${theme.text};
          width: 100%;
          box-sizing: border-box;
          background: transparent;
          border: none;
          resize: none;
          outline: none;
        }

        .content {
          cursor: pointer;
          display: block;
        }

        .expander-space {
          display: inline-block;
          width: 1ch;
          color: ${theme.textDim};
          cursor: ${hasChildren ? "pointer" : "default"};
          user-select: none;
        }

        .message-text {
          padding: 0 4px;
          min-height: 1.2em;
          display: inline-block;
        }

        .message-text:hover {
          background: ${theme.backgroundAlt2};
        }

        .message-text .typing-indicator {
          display: inline-block;
          padding: 0;
          line-height: inherit;
        }

        .source-label {
          display: inline-block;

          background: ${theme.backgroundAlt2};
          font-weight: 500;
        }

        .message-node[data-source="human"] .source-label {
          color: ${theme.human};
        }

        .message-node[data-source="model"] .source-label {
          color: ${theme.model};
        }

        .message-node[data-source="system"] .source-label {
          color: ${theme.system};
        }

        .message-node[data-pending="true"] .source-label {
          animation: pulse 1.5s ease-in-out infinite;
        }

        .textarea {
          display: inline-block;
          padding: 0 4px;
          margin-left: 0;
          background: ${theme.backgroundAlt2};
          vertical-align: top;
          width: calc(100% - 4em); /* Leave space for the label */
        }

        @keyframes pulse {
          0% {
            opacity: 0.5;
          }
          50% {
            opacity: 0.7;
          }
          100% {
            opacity: 0.5;
          }
        }

        .error {
          color: ${theme.textDim};
        }
      `}</style>
    </div>
  );
}
