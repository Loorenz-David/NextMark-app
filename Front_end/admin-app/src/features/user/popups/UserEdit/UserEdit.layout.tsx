import { useMemo } from 'react'

import { Field } from '@/shared/inputs/FieldContainer'
import { InputField } from '@/shared/inputs/InputField'
import { InputWarning } from '@/shared/inputs/InputWarning'
import { PopupFooter } from '@/shared/popups/MainPopup/PopupFooter'
import { PhoneField } from '@/shared/inputs/PhoneField/PhoneField'
import { normalizePhone } from '@/shared/data-validation/phoneValidation'

import { useUserEdit } from './UserEdit.context'
import { useUserEditConfig } from './useUserEditConfig'
import { useUserEditSetters } from './useUserEditSetters'

export const UserEditLayout = () => {
  const { formState, warnings, setFormState, handleSave, initialFormRef } = useUserEdit()

  const setters = useUserEditSetters({
    setFormState,
    warnings,
  })

  useUserEditConfig({ formState, initialFormRef })

  const footerConfig = useMemo(
    () => ({
      saveButton: { label: 'Save', action: handleSave },
    }),
    [handleSave],
  )

  return (
    <>
      <form className="flex h-full flex-col gap-4 overflow-y-auto overflow-x-hidden pb-[40px] px-2 scroll-thin">
        <Field label="Username:" required={true}>
          <InputField
            value={formState.username}
            onChange={setters.handleUsername}
            warningController={warnings.usernameWarning}
          />
        </Field>
        {warnings.usernameWarning.warning.isVisible && (
          <InputWarning {...warnings.usernameWarning.warning} />
        )}

        <Field label="Email:" required={true}>
          <InputField
            value={formState.email}
            onChange={setters.handleEmail}
            warningController={warnings.emailWarning}
          />
        </Field>
        {warnings.emailWarning.warning.isVisible && (
          <InputWarning {...warnings.emailWarning.warning} />
        )}

        <Field label="Phone:">
          <PhoneField
              phoneNumber={ normalizePhone(formState.phone_number)  }
              onChange={ setters.handlePhone }
          />
        </Field>

        <Field label="Change password:" required={true}>
          <InputField
            value={formState.password}
            onChange={setters.handlePassword}
            type="password"
            warningController={warnings.passwordWarning}
          />
        </Field>
        {warnings.passwordWarning.warning.isVisible && (
          <InputWarning {...warnings.passwordWarning.warning} />
        )}

        <Field label="Confirm new password:" required={true}>
          <InputField
            value={formState.password_confirmation}
            onChange={setters.handlePasswordConfirmation}
            type="password"
            warningController={warnings.passwordConfirmationWarning}
          />
        </Field>
        {warnings.passwordConfirmationWarning.warning.isVisible && (
          <InputWarning {...warnings.passwordConfirmationWarning.warning} />
        )}
      </form>
      <PopupFooter footerConfig={footerConfig} />
    </>
  )
}
