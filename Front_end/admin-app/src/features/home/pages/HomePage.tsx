


import { useMobile } from '@/app/contexts/MobileContext'
import { useBaseControlls } from '@/shared/resource-manager/useResourceManager'

import { HomeManagersProvider } from '../providers/HomeManagersProvider'
import { HomeOverlays } from '../components/HomeOverlays'



import { HomeDesktopView } from '../views/HomeDesktopView'
import { HomeMobileView } from '../views/HomeMobileView'
import type { PayloadBase } from '../types/types'

export const Home =()=>{

    return (
        <HomeManagersProvider>
            <HomePage />
        </HomeManagersProvider>
    )
}           

export const HomePage = () => {

    const { isMobile } = useMobile()
    const baseControlls = useBaseControlls<PayloadBase>()
    const disableAuroraBackground =
      baseControlls.isBaseOpen && baseControlls.payload?.ordersPlanType === 'local_delivery'

    return (

      <div className="admin-app-shell h-screen overflow-hidden bg-[var(--color-page)] text-[var(--color-text)]">
        {!disableAuroraBackground ? (
          <>
            <div className="admin-shell-aurora admin-shell-aurora--one" />
            <div className="admin-shell-aurora admin-shell-aurora--two" />
            <div className="admin-shell-aurora admin-shell-aurora--three" />
          </>
        ) : null}
        <HomeOverlays />
        <div className="relative z-10 flex h-full w-screen flex-col overflow-hidden">
            {isMobile ? <HomeMobileView/> :  <HomeDesktopView/>}
        </div>
      </div>

     );
}
 
