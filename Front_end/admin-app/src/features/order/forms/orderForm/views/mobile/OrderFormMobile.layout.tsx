import { OrderFormFooter } from '../../components/OrderFormFooter'
import { OrderFormFields } from '../../components/OrderFormFields'
import { OrderFormHeader } from '../../components/OrderFormHeader'
import { OrderFormItemsPanel } from '../../components/OrderFormItemsPanel'
import type { OrderFormLayoutModel } from '../../OrderForm.layout.model'
import type { OrderFormExternalFlow } from '../../flows/orderFormExternalRealtime.flow'

export const OrderFormMobileLayout = ({
  model,
  externalFlow,
}: {
  model: OrderFormLayoutModel
  externalFlow: OrderFormExternalFlow
}) => {
  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-y-auto scroll-thin overflow-x-hidden pb-28">
      <div className="relative flex w-full min-h-0 flex-col bg-[var(--color-page)]">
        <OrderFormHeader
          label={model.label}
          operationType={model.formState.operation_type}
          isMobile={true}
          onSelectOperationType={model.formSetters.handleOperationType}
          onClose={model.closeController.requestClose}
        />

        <OrderFormFields model={model} compact={true} />
      </div>

      <OrderFormItemsPanel model={model} compact={true} />

      {!model.isItemEditorOpen ? (
        <OrderFormFooter
          onSendForm={externalFlow.handleSendForm}
          onSaveOrder={model.handleSave}
          onDeleteOrder={
            model.mode === 'edit'
              ? () => {
                  void model.handleDelete()
                }
              : undefined
          }
          sendDisabled={externalFlow.employeeUserId <= 0}
          isMobile={true}
        />
      ) : null}
    </div>
  )
}
