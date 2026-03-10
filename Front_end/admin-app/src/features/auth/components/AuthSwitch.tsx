import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { BasicButton } from '@/shared/buttons/BasicButton'

const tabs = [
  { label: 'Login', path: '/auth/login' },
  { label: 'Register', path: '/auth/register' },
]

export function AuthSwitch() {
  const location = useLocation()
  const navigate = useNavigate()

  const activePath = useMemo(() => {
    if (location.pathname.includes('/auth/register')) {
      return '/auth/register'
    }
    return '/auth/login'
  }, [location.pathname])

  return (
    <div className="flex w-full items-center justify-between rounded-full border border-[var(--color-border)] bg-white p-1 shadow-sm">
      {tabs.map((tab) => {
        const isActive = activePath === tab.path
        return (
          <BasicButton
            key={tab.path}
            params={{
              type: 'button',
              variant: isActive ? 'darkGray' : 'ghost',
              onClick: () => navigate(tab.path),
              className: `flex-1 rounded-full ${isActive ? '' : 'text-[var(--color-muted)]'}`,
            }}
          >
            {tab.label}
          </BasicButton>
        )
      })}
    </div>
  )
}
