import {  useMemo, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

import { BackArrowIcon2 } from '@/assets/icons'
import { apiClient } from '@/lib/api/ApiClient'

import type { SectionKey } from '../registry/sectionRegistry'

type SettingsSections = {
  key: SectionKey | "no-section"
  label: string
  sections?: SettingsSections[]
}

const SETTINGS_ROUTE_MAP: Record<SectionKey, string> = {
  'user.main': '/settings/profile',
  'team.main': '/settings/team',
  'team.invitations': '/settings/team/invitations',
  'integrations.main': '/settings/integrations',
  'integrations.status': '/settings/integrations/status',
  'messages.main': '/settings/messages',
  'settings.configuration': '/settings',
  'item.main': '/settings/items',
  'vehicle.main': '/settings/vehicles',
  'warehouse.main': '/settings/warehouses',
  'externalForm.access': '/settings/external-form',
  'printDocument.main': '/settings/print-templates/item',
  'emailMessage.main': '/settings/messages/email',
  'smsMessage.main': '/settings/messages/sms',
  
}

const SETTINGS_SECTIONS:SettingsSections[] = [
  { key: 'user.main', label: 'Profile' },
  { key: 'team.main', label: 'Team' ,sections:[
    {key:'team.main', label:'Memebers'},
    {key:'team.invitations', label:'Invitations'}
  ]},
  { key: 'integrations.main', label: 'External Integrations' },
  { key: 'messages.main', label: 'Message Automations' },
  {
    key: 'no-section',
    label: 'Configuration',
    sections: [
      { key: 'item.main', label: 'Items' },
      // { key: 'vehicle.main', label: 'Vehicles' },
      // { key: 'warehouse.main', label: 'Warehouses' },
      { key: 'printDocument.main', label: 'Print Templates' },
    ],
  },
  { key: 'externalForm.access', label: 'External Form' },
]

export const SettingsDesktopView = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [expandedKey, setExpandedKey] = useState<SectionKey | "no-section" | null>(null)

  const sidebarOptions = useMemo(() => SETTINGS_SECTIONS, [])

  const handleSelectSection = (key: SectionKey | 'no-section') => {
    if (key === "no-section") return
    navigate(SETTINGS_ROUTE_MAP[key])
  }

  const handleToggleSection = (option: SettingsSections) => {
    
    if( option.key && option.key !== "no-section"){
      handleSelectSection(option.key)
    }
    if (!option.sections?.length) {
      return
    }
    setExpandedKey((current) => (current === option.key ? null : option.key))
  }

  const handleLogout = () => {
    apiClient.clearSession()
    navigate('/auth/login', { replace: true })
  }
 

  return (
    <div className="flex h-full w-full">
      <aside className="h-full w-64 min-w-64 border-r border-[var(--color-border)] bg-white px-4 py-6 flex flex-col">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="w-full flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] cursor-pointer"
        >
          <BackArrowIcon2 className="h-4 w-4" />
          Back
        </button>

        <div className="mt-6 flex flex-col gap-2 flex-1">
          {sidebarOptions.map((option) => (
            <div key={option.key} className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => handleToggleSection(option)}
                className="flex w-full items-center justify-between cursor-pointer rounded-lg px-3 py-2 text-left text-sm text-[var(--color-text)] hover:bg-[var(--color-muted)]/10"
              >
                {option.label}
              </button>
              <AnimatePresence>
                {expandedKey === option.key && option.sections?.length ? (
                  <motion.div
                    className="flex flex-col flex-1 gap-1 pl-4"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                  >
                    {option.sections.map((subSection) => (
                      <button
                        key={subSection.key}
                        type="button"
                        onClick={() => handleSelectSection(subSection.key)}
                        className="flex w-full items-center justify-between cursor-pointer rounded-lg px-3 py-2 text-left text-xs text-[var(--color-muted)] hover:bg-[var(--color-muted)]/10"
                      >
                        {subSection.label}
                      </button>
                    ))}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-[var(--color-border)]">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-between cursor-pointer rounded-lg px-3 py-2 text-left text-sm text-[var(--color-text)] hover:bg-[var(--color-muted)]/10"
          >
            Log out
          </button>
        </div>
      </aside>

      <main className="flex min-h-0 flex-1 overflow-hidden">
        <AnimatePresence >
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}

            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="flex h-full w-full min-h-0 flex-col"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
