import { motion } from 'framer-motion'
import { BasicButton } from '@/shared/buttons/BasicButton'
interface PropsConfirmCloseOverlay{
    onConfirm: ()=> void,
    onCancel: ()=> void,
    message?: string
}

export const ConfirmActionPopup = ({ onConfirm, onCancel, message }: PropsConfirmCloseOverlay) => {
  return (
    <motion.div className="absolute inset-0 z-20 flex items-center justify-center popup-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onCancel}
    >
      <div className="rounded-xl bg-white p-7 flex flex-col gap-5">
        <p className="text-lg"> {
        message 
        ? message 
        :"Are you sure you want to perform that action? "
        }
        </p>

        <div className="mt-4 flex gap-4 justify-end">
            <BasicButton params={{
              variant:'primary',
              className:"py-3 px-5",
              onClick:onConfirm
              }}>
                  Yes
              </BasicButton>
          <BasicButton params={{
            variant:'secondary',
            className:"py-3 px-5 shadow-md",
            onClick:onCancel
            }}>
                No
            </BasicButton>
        </div>
      </div>
    </motion.div>
  )
}