# @nextmark/ai-panel

Installable AI companion panel package for React applications.

## Host contract

- Provide a transport adapter with `createThread()` and `sendMessage()`
- Provide an optional `resolveAction()` callback for structured AI actions
- Mount `AiPanelProvider` close to the app shell
- Use `useAiPanel()` or `AiPanelLauncher` only through the root barrel

## Notes

- The package owns floating/bottom-sheet UI, transcript rendering, local layout persistence, and action presentation.
- The host app owns transport, auth/session context, and app-specific action handling.
