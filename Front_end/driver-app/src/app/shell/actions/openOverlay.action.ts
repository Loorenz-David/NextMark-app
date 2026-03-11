import type { OverlayPageId, OverlayPageParamsMap, ShellStore } from '../domain/shell.types'
import { createStackKey } from '../domain/shell.types'
import { replaceOverlayStack } from '../stores/shell.mutations'

export function openOverlay<PageId extends OverlayPageId>(
  store: ShellStore,
  page: PageId,
  params: OverlayPageParamsMap[PageId],
) {
  store.setState((state) => replaceOverlayStack(state, [{
    key: createStackKey(page),
    page,
    params,
  }]))
}
