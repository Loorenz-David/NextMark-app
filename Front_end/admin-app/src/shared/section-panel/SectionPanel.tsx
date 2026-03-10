import {useState } from 'react'
import { SectionPanelContext } from './SectionPanelContext'
import { BasicButton } from '@/shared/buttons/BasicButton'
import type {SectionHeaderConfig} from './SectionPanelContext'


type SectionPanelProps = {
    children: React.ReactNode
    onRequestClose?: ()=>void
    parentParams?: { borderLeft?: string, pageClass?:string}
    style?: React.CSSProperties
}


export const SectionPanel = ({
    children,
    parentParams,
    style,
    onRequestClose,
}: SectionPanelProps) => {
    const [ header, setHeader ] = useState<null | SectionHeaderConfig>(null)

    const onClose = ()=>{
        onRequestClose?.();
    }

    return ( 
        <SectionPanelContext.Provider value={{ setHeader, onClose }}>
            <section className=" flex flex-col bg-[var(--color-page)] w-full h-full  flex overflow-hidden "
                style={{borderLeft: parentParams?.borderLeft ?  `2px solid ${parentParams.borderLeft}` : undefined, ...style}}
            >
                {header && (
                    <header className=" flex flex-col w-full    shadow-sm">
                        <div className=" flex items-center justify-between gap-3 border-b border-[var(--color-border)] px-4 py-3">
                            <div className=" flex items-center gap-3 ">
                                {header.icon &&
                                    <div className=" inline-flex items-center justify-center px-3 py-3 bg-[var(--color-muted)]/10 rounded-xl">
                                        {header.icon}
                                    </div>
                                }
                                {header.title && 

                                    <div className="font-semibold text-lg text-[var(--color-muted)]/80">
                                        {header.title}
                                    </div>

                                }
                            </div>
                            {header.closeButton && !header.customHeaderButton && 
                                <BasicButton 
                                    params={{
                                        variant: "text",
                                        onClick: onClose,
                                    }}
                                >
                                    Close
                                </BasicButton>
                            }
                            {header.customHeaderButton && 
                                header?.customHeaderButton
                            }
                        </div>

                    </header>
                )}
                <div className={`h-full w-full flex overflow-y-scroll overflow-x-hidden ${parentParams?.pageClass}`}>
                    {children}
                </div>
            </section>
        </SectionPanelContext.Provider>
     );
}
 
