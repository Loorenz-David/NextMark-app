import { TimeIcon } from "@mui/x-date-pickers";

type Props ={
    timeContainerClass?: string
    iconClass?: string
    textClass?: string
    from:string
    to:string
}

export const TimeRangeCard = ({
    timeContainerClass,
    iconClass,
    textClass,
    from,
    to
}:Props) => {

    
    return ( 
    <div className={`flex w-full gap-2 ${timeContainerClass ?? defaultTimeContainerClass}`}>
        <TimeIcon className={iconClass ?? defaultIconClass}/>
        <span className={textClass ?? defaultTextClass}>
            {from} - {to}
        </span>
    </div> 
    );
}
 
const defaultIconClass = 'max-h-5 max-w-5 text-blue-700'
const defaultTimeContainerClass = 'bg-blue-50 py-2 px-2 items-center rounded-sm'
const defaultTextClass = 'text-blue-800 text-xs font-semibold'
