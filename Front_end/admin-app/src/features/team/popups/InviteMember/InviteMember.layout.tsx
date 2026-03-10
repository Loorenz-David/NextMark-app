import { useMemo } from 'react'

import { Field } from '@/shared/inputs/FieldContainer'
import { InputField } from '@/shared/inputs/InputField'
import { InputWarning } from '@/shared/inputs/InputWarning'
import { PopupFooter } from '@/shared/popups/MainPopup/PopupFooter'

import { useInviteMember } from './InviteMember.context'
import { useInviteMemberConfig } from './useInviteMemberConfig'
import { useInviteMemberSetters } from './useInviteMemberSetters'

export const InviteMemberLayout = () => {
  const { formState, warnings, setFormState, handleSave, initialFormRef } = useInviteMember()

  const setters = useInviteMemberSetters({ setFormState, warnings })

  useInviteMemberConfig({ formState, initialFormRef })

  const footerConfig = useMemo(
    () => ({
      saveButton: { label: 'Send invite', action: handleSave },
    }),
    [handleSave],
  )

  return (
    <>
      <form className="flex h-full flex-col gap-4 overflow-y-auto overflow-x-hidden pb-[40px] px-2 scroll-thin">

        <Field label="Email:" required={true}>
          <InputField
            value={formState.target_email}
            onChange={(event) => setters.handleEmail(event?.target?.value ?? '')}
            warningController={warnings.emailWarning}
          />
        </Field>
        {warnings.emailWarning.warning.isVisible && (
          <InputWarning {...warnings.emailWarning.warning} />
        )}

        <Field label="Role name:" required={true}>
          <InputField
            value={formState.user_role_name}
            onChange={(event) => setters.handleRoleName(event?.target?.value ?? '')}
            warningController={warnings.roleNameWarning}
          />
        </Field>
        {warnings.roleNameWarning.warning.isVisible && (
          <InputWarning {...warnings.roleNameWarning.warning} />
        )}

        <Field label="Role id:" required={true}>
          <InputField
            value={formState.user_role_id}
            onChange={(event) => setters.handleRoleId(event?.target?.value ?? '')}
            warningController={warnings.roleIdWarning}
          />
        </Field>
        {warnings.roleIdWarning.warning.isVisible && (
          <InputWarning {...warnings.roleIdWarning.warning} />
        )}
      </form>
      <PopupFooter footerConfig={footerConfig} />
    </>
  )
}
