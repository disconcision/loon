/** @jsxImportSource preact */
import { themes } from "@/styles/themes";
import { useStore } from "@/store/context";

export function TypingIndicator() {
  const { state } = useStore();
  const theme = themes[state.viewState.themeMode];

  return (
    <div className="typing-indicator">
      <span>•</span>
      <span>•</span>
      <span>•</span>
      <style jsx>{`
        .typing-indicator {
          display: flex;
          gap: 4px;
          justify-content: center;
          padding: 8px;
        }
        span {
          animation: bounce 1s infinite;
          color: ${theme.textDim};
          font-size: 24px;
          line-height: 8px;
        }
        span:nth-child(2) {
          animation-delay: 0.2s;
        }
        span:nth-child(3) {
          animation-delay: 0.4s;
        }
        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-4px);
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
}
