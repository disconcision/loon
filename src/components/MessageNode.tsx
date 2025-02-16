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
}

export function MessageNode({ id, node }: Props) {
  const { state, dispatch } = useStore();
  const theme = themes[state.viewState.themeMode];
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(node.message.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const contentRef = useRef<HTMLPreElement>(null);
  const isPending = state.pending.has(id);
  const isSelected = state.viewState.focus.selectedNode === id;

  // Update textarea height to match content
  const updateTextareaHeight = useCallback(() => {
    if (textareaRef.current && contentRef.current) {
      // First set height to 0 to get the proper scrollHeight
      textareaRef.current.style.height = "0";
      textareaRef.current.style.height = `${contentRef.current.offsetHeight}px`;
    }
  }, []);

  // Handle entering edit mode
  const enterEditMode = useCallback(() => {
    setIsEditing(true);
    setEditedContent(node.message.content);
  }, [node.message.content]);

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
      dispatch({ type: "FOCUS_NODE", id });
    }
  }, [dispatch, id, isEditing]);

  const handleDoubleClick = useCallback(() => {
    enterEditMode();
  }, [enterEditMode]);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    if (editedContent !== node.message.content) {
      dispatch({ type: "EDIT_NODE", id, content: editedContent });
    }
  }, [dispatch, editedContent, id, node.message.content]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (isEditing) {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          textareaRef.current?.blur();
        } else if (e.key === "Escape") {
          e.preventDefault();
          setEditedContent(node.message.content);
          textareaRef.current?.blur();
        }
      } else if (isSelected) {
        // Handle navigation when not editing
        if (e.key === "ArrowRight") {
          e.preventDefault();
          enterEditMode();
        } else if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          // Create new child node
          dispatch({ type: "CREATE_CHILD_NODE", parentId: id });
        }
      }
    },
    [isEditing, isSelected, enterEditMode, node.message.content, dispatch, id]
  );

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
      data-selected={isSelected}
      data-source={node.message.source}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
      tabIndex={0}
    >
      {isEditing ? (
        <pre className="content">
          <span className="source-label">{sourceLabel}:</span>
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
          <span className="source-label">{sourceLabel}:</span>
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

        .message-node[data-selected="true"] {
          border-left-color: ${theme.accent};
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
          min-height: 1.2em;
        }

        .content {
          cursor: pointer;
          display: block;
        }

        .message-text {
          padding: 0 4px;
        }

        .message-text:hover {
          background: ${theme.backgroundAlt2};
        }

        .source-label {
          display: inline-block;
          padding: 0 4px;
          background: ${theme[node.message.source]};
          color: ${theme.textDim};
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
