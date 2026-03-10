import { BasicButton } from '@/shared/buttons/BasicButton'
import { ConfirmActionButton } from '@/shared/buttons/DeleteButton'

type OrderFormFooterProps = {
  onSendForm: () => void
  onSaveOrder: () => void
  onDeleteOrder?: () => void
  sendDisabled?: boolean
  saveDisabled?: boolean
  isMobile?: boolean
}

export const OrderFormFooter = ({
  onSendForm,
  onSaveOrder,
  onDeleteOrder,
  sendDisabled = false,
  saveDisabled = false,
  isMobile = false,
}: OrderFormFooterProps) => {
  return (
    <footer
      className={`flex w-full items-center  bottom-0 left-0  border-t border-[var(--color-border)] bg-[var(--color-page)] px-6 py-4 z-20 ${
        isMobile ? 'fixed rounded-none' : 'absolute rounded-b-xl'
      }`}
    >
       {onDeleteOrder && (
        <ConfirmActionButton
          onConfirm={onDeleteOrder}
          deleteContent={"Delete"}
          confirmContent={"Confirm Deletion"}
          deleteClassName={"text-sm rounded-md bg-[var(--color-page)] text-red-500 border-[text-red-500] px-2 py-2"}
          confirmClassName={"text-sm rounded-md bg-red-500 py-2 px-2 text-white"}
        />
      )}
      <div className="flex flex-1 justify-end gap-3">
         <BasicButton
            params={{
              variant: 'secondary',
              onClick: onSendForm,
              disabled: sendDisabled,
              className: 'px-5 py-2',
            }}
          >
            Send Form
          </BasicButton>

           <BasicButton
            params={{
              variant: 'primary',
              onClick: onSaveOrder,
              disabled: saveDisabled,
              className: 'px-5 py-2',
            }}
          >
            Save Order
          </BasicButton>

      </div>
    </footer>
  )
}
