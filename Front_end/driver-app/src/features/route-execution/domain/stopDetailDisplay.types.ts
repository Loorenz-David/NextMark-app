export type StopDetailHeaderDisplay = {
  streetAddress: string
  stopMeta: string
}

export type StopDetailTerminalStatusDisplay = {
  label: 'Marked as completed' | 'Marked as failed'
  onUndo: () => void
}

export type StopDetailPrimaryActionDisplay = {
  id: 'navigate' | 'failed' | 'completed'
  label: string
  tone: 'navigate' | 'failed' | 'completed'
  onPress?: () => void
}

export type StopDetailInfoRowDisplay = {
  id: 'service-time' | 'order-phone' | 'items' | 'customer' | 'cases'
  label: string
  value: string
  onPress?: () => void
}

export type StopDetailOrderNoteCardDisplay = {
  firstNote: string
  allNotes: string[]
  onPress: (() => void) | null
}

export type StopDetailPageDisplay = {
  header: StopDetailHeaderDisplay
  headerMode: 'primary-actions' | 'terminal-status'
  primaryActions: StopDetailPrimaryActionDisplay[]
  terminalStatus: StopDetailTerminalStatusDisplay | null
  infoRows: StopDetailInfoRowDisplay[]
  orderNoteCard: StopDetailOrderNoteCardDisplay | null
}
