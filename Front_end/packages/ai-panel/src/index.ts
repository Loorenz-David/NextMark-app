// ─── Runtime UI ──────────────────────────────────────────────────────────────
// Mount AiPanelProvider in the app shell.
// Use useAiPanel() inside the tree. Use AiPanelLauncher as a manual trigger.
export { AiPanelLauncher, AiPanelProvider, useAiPanel } from './AiPanelProvider'

// ─── Host Contract ───────────────────────────────────────────────────────────
// Everything a host application must implement. See src/host-contract.ts for
// the full annotated integration guide.
export type {
  AiMessageContext,
  AiTransportAdapter,
  AiActionHandler,
  AiActionDescriptor,
  AiMessageBlock,
  AiBlockKind,
  AiBlockEntityType,
  AiBlockLayout,
  AiLegacyDataToBlocksMapper,
  AiBlockRenderer,
  AiBlockRendererProps,
  AiPanelConfig,
  AiPanelProviderProps,
  AiPanelController,
  AiPanelLauncherProps,
} from './host-contract'

// ─── Message & Response Types ─────────────────────────────────────────────────
// Useful when implementing transport adapters and response mappers.
export type {
  AiPanelMessage,
  AiPanelResponse,
  AiThreadState,
  AiToolTraceEntry,
  AiPanelTheme,
  AiMessageRole,
  AiToolTraceStatus,
  AiActionVariant,
  AIInteraction,
  AiInteractionKind,
  AiInteractionResponseMode,
  AiInteractionOption,
  AiInteractionField,
  AiInteractionFieldType,
  AiInteractionFieldValidation,
  AiInteractionValidationPattern,
} from './types'

// ─── Interaction Hooks ────────────────────────────────────────────────────────
export { useThreadInteractions } from './hooks/useThreadInteractions'
export type { ThreadInteractionState } from './hooks/useThreadInteractions'
