import { useMobile } from '@/app/contexts/MobileContext'
import type { ReactNode } from 'react'

type PropsPopupBody = {
  children: ReactNode
}
export const PopupBody = ({children}: PropsPopupBody) => {
    const isMobile = useMobile()
    return ( 
        <div className={`flex-1 h-full relative overflow-hidden ${isMobile ? 'py-5 px-2' : ' px-3 py-5'}`}>
            {children}
        </div>
    );
}