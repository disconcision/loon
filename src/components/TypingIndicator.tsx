/** @jsxImportSource preact */
import { themes } from "@/styles/themes";
import { useStore } from "@/store/context";

export function TypingIndicator() {
  const { state } = useStore();
  const theme = themes[state.viewState.themeMode];

  return (
    <span className="typing-indicator">
      typing...
      <style jsx>{`
        .typing-indicator {
          color: ${theme.textDim};
          animation: ellipsis-animation 2s infinite;
        }

        @keyframes ellipsis-animation {
          0% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.7;
          }
          100% {
            opacity: 0.3;
          }
        }
      `}</style>
    </span>
  );
}
