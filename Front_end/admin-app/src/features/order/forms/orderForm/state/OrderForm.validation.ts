import type { OrderFormState, OrderFormWarnings } from './OrderForm.types'

export const useOrderFormValidation = ({
  formState,
  warnings,
}: {
  formState: OrderFormState
  warnings: OrderFormWarnings
}) => {
  const validateForm = () => {
   

    const referenceValid = warnings.referenceWarning.validate(formState.reference_number)
    const firstNameValid = warnings.firstNameWarning.validate(formState.client_first_name)
    const lastNameValid = warnings.lastNameWarning.validate(formState.client_last_name)
    const emailValid = warnings.emailWarning.validate(formState.client_email)
    const primaryPhoneValid = warnings.primaryPhoneWarning.validate(formState.client_primary_phone)
    const addressValid = warnings.addressWarning.validate(formState.client_address)
    const dateRangeValid = warnings.dateRangeWarning.validate({
      earliest_delivery_date: formState.earliest_delivery_date,
      latest_delivery_date: formState.latest_delivery_date,
      preferred_time_start: formState.preferred_time_start,
      preferred_time_end: formState.preferred_time_end,
    })
    const deliveryWindowsValid = warnings.deliveryWindowsWarning.validate({
      earliest_delivery_date: formState.earliest_delivery_date,
      latest_delivery_date: formState.latest_delivery_date,
      preferred_time_start: formState.preferred_time_start,
      preferred_time_end: formState.preferred_time_end,
    })

    return (
      referenceValid &&
      firstNameValid &&
      lastNameValid &&
      emailValid &&
      primaryPhoneValid &&
      addressValid &&
      dateRangeValid &&
      deliveryWindowsValid
    )
  }

  return {
    validateForm,
  }
}
