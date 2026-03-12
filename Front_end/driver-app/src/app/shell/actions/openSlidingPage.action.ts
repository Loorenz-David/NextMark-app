import type { ShellStore, SlidingPagePageId, SlidingPagePageParamsMap } from '../domain/shell.types'
import { createStackKey } from '../domain/shell.types'
import { replaceSlidingPageStack } from '../stores/shell.mutations'

export function openSlidingPage<PageId extends SlidingPagePageId>(
  store: ShellStore,
  page: PageId,
  params: SlidingPagePageParamsMap[PageId],
) {
  store.setState((state) => replaceSlidingPageStack(state, [{
    key: createStackKey(page),
    page,
    params,
  }]))
}
