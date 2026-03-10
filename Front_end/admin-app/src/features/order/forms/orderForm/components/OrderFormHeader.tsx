import { CloseIcon, SingleOrderIcon } from '@/assets/icons'
import { BasicButton } from '@/shared/buttons/BasicButton'
import { InfoHover } from '@/shared/layout/InfoHover'
import type { OrderOperationTypes } from '@/features/order/types/order'
import { MultiSegmentedCheckboxList } from './MultiSegmentedCheckboxList'
import { ORDER_FORM_HEADER_INFO } from '../info/orderFormHeader.info'

type OrderFormHeaderProps = {
  label: string
  operationType: OrderOperationTypes
  isMobile: boolean
  orderReference?: string
  onSelectOperationType: (value: string | number) => void
  onClose?: () => void
}

const OPERATION_OPTIONS = [
  { label: 'Pickup', value: 'pickup' },
  { label: 'Dropoff', value: 'dropoff' },
] as const

const operationTypeToSelectedValues = (operationType: OrderOperationTypes): string[] => {
  if (operationType === 'pickup_dropoff') return ['pickup', 'dropoff']
  if (operationType === 'pickup') return ['pickup']
  return ['dropoff']
}

const selectedValuesToOperationType = (values: Array<string | number>): OrderOperationTypes => {
  const normalized = values.map(String)
  const hasPickup = normalized.includes('pickup')
  const hasDropoff = normalized.includes('dropoff')

  if (hasPickup && hasDropoff) return 'pickup_dropoff'
  if (hasPickup) return 'pickup'
  if (hasDropoff) return 'dropoff'
  return 'dropoff'
}

export const OrderFormHeader = ({
  label,
  operationType,
  orderReference,
  isMobile,
  onSelectOperationType,
  onClose,
}: OrderFormHeaderProps) => (
  <header
    className={`flex items-center justify-between gap-4 border-b border-[var(--color-border)] ${
      isMobile ? 'px-3 pb-4 pt-4' : 'px-6 py-3'
    }`}
  >
    <div className="flex items-center justify-center rounded-full bg-[var(--color-muted)]/12 p-2">
      <SingleOrderIcon className="h-6 w-6 text-[var(--color-muted)]" />
    </div>

    <div className="flex gap-6">
      <div className="flex flex-col  items-start justify-start">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-[var(--color-text)]">{label}</h3>
          <InfoHover content={ORDER_FORM_HEADER_INFO} />
        </div>
        {orderReference && 
          <span className="text-[10px]">
            {orderReference}
          </span>
        }
      
      </div>
      <div>
        <MultiSegmentedCheckboxList
          options={OPERATION_OPTIONS.map((option) => ({ ...option }))}
          selectedValues={operationTypeToSelectedValues(operationType)}
          onChange={(values) => onSelectOperationType(selectedValuesToOperationType(values))}
          rules={{
            atLeastOneSelected: true,
            fallbackMode: 'switch_to_adjacent',
          }}
          defaultValue="dropoff"
          styleConfig={{
            textSize:'12px',
            buttonPadding:'4px 8px',
            containerBg:'var(--color-border)',
            gap:'4px',
          }}
        />
      </div>

    </div>

    <div className="flex flex-1 items-center justify-end">
      <BasicButton
        params={{
          variant: 'rounded',
          onClick: onClose,
          ariaLabel: 'Close order form',
          style: { border: '1px solid rgb(var(--color-muted-r), 0.4)'  },
        }}
      >
        <CloseIcon className="app-icon h-4 w-4" />
      </BasicButton>
    </div>
  </header>
)
