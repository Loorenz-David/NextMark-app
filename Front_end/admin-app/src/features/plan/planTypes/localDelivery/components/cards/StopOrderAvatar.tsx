type Props = {
 stopOrder:number | null
 variant?: 'small' | 'normal'
}
export const StopOrderAvatar = ({
    stopOrder,
    variant = "normal"
    
}: Props) => {

    const classmap = variantMap[variant]

    return ( 
        <div className={`flex bg-blue-100 rounded-full items-center justify-center ${classmap.containerClass}`}>
            <span className={`text-gray-500 font-bold ${classmap.text}`}>
                {stopOrder  ?? '--'}
            </span>
        </div>
    );
}

const variantMap = {
    normal:{
        containerClass:'h-7 w-7',
        text:'text-sm'
    },
    small:{
        containerClass:'h-5 w-5',
        text:'text-[10px]'
    }
}