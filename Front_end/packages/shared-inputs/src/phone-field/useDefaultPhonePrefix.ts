import { useMemo } from 'react'
import { prefixFromTimezone, prefixFromUserTimezone } from './timezonePrefix'

const FALLBACK_PREFIX = '+1'

/**
 * Resolves the best default phone prefix with the following priority:
 *   1. Stored user preference (localStorage)
 *   2. Team timezone  (pass `teamTimezone` from API metadata)
 *   3. Browser / user timezone
 *   4. Hard-coded fallback (+1)
 *
 * Returns a memoised prefix string.
 */
export function useDefaultPhonePrefix(teamTimezone?: string | null): string {
  return useMemo(() => {
    // 1. Stored user preference
    try {
      const stored = window.localStorage.getItem('defaultPhonePrefix')
      if (stored) return stored
    } catch {
      // localStorage unavailable — continue
    }

    // 2. Team timezone
    if (teamTimezone) {
      const p = prefixFromTimezone(teamTimezone)
      if (p) return p
    }

    // 3. User / browser timezone
    const userP = prefixFromUserTimezone()
    if (userP) return userP

    // 4. Fallback
    return FALLBACK_PREFIX
  }, [teamTimezone])
}
