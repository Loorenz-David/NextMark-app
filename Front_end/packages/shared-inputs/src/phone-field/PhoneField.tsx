import { PhoneFieldLayout } from './PhoneField.layout'
import { PhoneFieldProvider } from './PhoneField.provider'
import type { PhoneFieldProps } from './PhoneField.types'

export const PhoneField = ({
  phoneNumber,
  onChange,
  containerClassName,
  containerStyle,
}: PhoneFieldProps) => {
  return (
    <PhoneFieldProvider phoneNumber={phoneNumber} onChange={onChange}>
      <PhoneFieldLayout
        containerClassName={containerClassName}
        containerStyle={containerStyle}
      />
    </PhoneFieldProvider>
  )
}
