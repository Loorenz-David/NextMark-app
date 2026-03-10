


import { useMobile } from '@/app/contexts/MobileContext'

import { HomeManagersProvider } from '../providers/HomeManagersProvider'
import { HomeOverlays } from '../components/HomeOverlays'



import { HomeDesktopView } from '../views/HomeDesktopView'
import { HomeMobileView } from '../views/HomeMobileView'

export const Home =()=>{

    return (
        <HomeManagersProvider>
            <HomePage />
        </HomeManagersProvider>
    )
}           

export const HomePage = () => {

    const { isMobile } = useMobile()

    return (

      <div className="h-screen overflow-hidden bg-[var(--color-page)] text-[var(--color-text)]">
        <HomeOverlays />
        <div className="flex h-full w-screen flex-col overflow-hidden">   
            {isMobile ? <HomeMobileView/> :  <HomeDesktopView/>}
        </div>
      </div>

     );
}
 
