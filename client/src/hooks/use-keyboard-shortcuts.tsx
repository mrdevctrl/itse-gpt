import { useEffect } from "react";

interface UseKeyboardShortcutsProps {
  onFocusInput?: () => void;
  onSendMessage?: () => void;
  onNewChat?: () => void;
}

export function useKeyboardShortcuts({
  onFocusInput,
  onSendMessage,
  onNewChat,
}: UseKeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isCtrlOrCmd = event.ctrlKey || event.metaKey;

      if (isCtrlOrCmd && event.key === 'k') {
        event.preventDefault();
        onFocusInput?.();
      }

      if (isCtrlOrCmd && event.key === 'Enter') {
        event.preventDefault();
        onSendMessage?.();
      }

      if (isCtrlOrCmd && event.key === 'n') {
        event.preventDefault();
        onNewChat?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onFocusInput, onSendMessage, onNewChat]);
}
