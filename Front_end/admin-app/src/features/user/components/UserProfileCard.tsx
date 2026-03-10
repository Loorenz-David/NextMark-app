import { MemberAvatar } from '@/shared/layout/MemberAvatar'
import { BasicButton } from '@/shared/buttons/BasicButton'
import { formatPhone } from '@/shared/data-validation/phoneValidation'
import { capitalize } from '@/shared/utils/capitalizeString'
import type { User } from '../types/user'

type UserProfileCardProps = {
  user: User | null
  onEdit: () => void
}

export const UserSubscriptionCard = () => (
  <div className="relative overflow-hidden rounded-2xl border border-[var(--color-muted)]/20 shadow-sm bg-white p-6 ">
    <div className="absolute right-0 top-0 h-20 w-40 translate-x-10 -translate-y-6 rounded-full bg-[var(--color-muted)]/10" />
    <div className="relative flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Subscription
          </p>
          <p className="mt-2 text-lg font-semibold text-[var(--color-text)]">Starter Plan</p>
          <p className="text-sm text-[var(--color-muted)]">
            Active • Renews monthly
          </p>
        </div>
        <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-muted)]/10 px-3 py-1 text-xs font-semibold text-[var(--color-text)]">
          Current
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--color-muted)]">
        <span>Up to 3 team members</span>
        <span>•</span>
        <span>Basic route optimization</span>
        <span>•</span>
        <span>Email support</span>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-[var(--color-muted)]">Next invoice</p>
          <p className="text-sm text-[var(--color-text)]">$ / month</p>
        </div>
        <BasicButton params={{ variant: 'primary', onClick: () => {} }}>
          Upgrade
        </BasicButton>
      </div>
    </div>
  </div>
)

export const UserProfileCard = ({ user, onEdit }: UserProfileCardProps) => {
  const username = user?.username ?? '—'
  const role = user?.user_role_id ?? '—'
  const email = user?.email ?? '—'
  const phone = formatPhone(user?.phone_number) ?? '—'

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-[var(--color-muted)]/20 shadow-sm bg-white p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <MemberAvatar username={username} className="text-xl" />
          <div>
            <p className="text-lg font-semibold text-[var(--color-text)]">{capitalize(username)}</p>
            <p className="text-xs text-[var(--color-muted)]">Role: {role}</p>
          </div>
        </div>
        <BasicButton
          params={{ variant: 'secondary', onClick: onEdit, ariaLabel: 'Edit profile' }}
        >
          Edit profile
        </BasicButton>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm text-[var(--color-text)]">
        <div>
          <p className="text-xs text-[var(--color-muted)]">Email</p>
          <p>{email}</p>
        </div>
        <div>
          <p className="text-xs text-[var(--color-muted)]">Phone</p>
          <p>{phone}</p>
        </div>
      </div>
    </div>
  )
}
