export interface InputWarningState {
  message?: string
  isVisible: boolean
}

export function InputWarning({ message, isVisible }: InputWarningState) {
  if (!isVisible || !message) {
    return null
  }

  return <span className="text-xs font-medium text-red-600 bg-red-50 border border-red-300  py-1 px-3 rounded-xl w-full">{message}</span>
}
