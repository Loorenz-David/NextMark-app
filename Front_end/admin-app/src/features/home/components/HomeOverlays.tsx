
import { AnimatePresence } from 'framer-motion'
import { usePopupManager } from '@/shared/resource-manager/useResourceManager'

export const HomeOverlays = () => {
  const popupManager  = usePopupManager()
 
  return (
    <AnimatePresence>
      {popupManager.renderStack({})}
    </AnimatePresence>
  )
}