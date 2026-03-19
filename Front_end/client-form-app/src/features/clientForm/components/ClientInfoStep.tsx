import { useClientForm } from '../context/useClientForm'
import { StepButton } from './StepButton'

export const ClientInfoStep = () => {
  const { data, setField, next } = useClientForm()

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-base font-semibold text-white/90">Client Information</h2>
        <p className="text-sm text-white/46">Enter the client's full name.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-white/46">First name</span>
          <div className="custom-field-container">
            <input
              className="custom-input"
              value={data.client_first_name}
              onChange={(e) => setField('client_first_name', e.target.value)}
              placeholder="First name"
            />
          </div>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-white/46">Last name</span>
          <div className="custom-field-container">
            <input
              className="custom-input"
              value={data.client_last_name}
              onChange={(e) => setField('client_last_name', e.target.value)}
              placeholder="Last name"
            />
          </div>
        </label>
      </div>

      <div className="flex justify-end">
        <StepButton
          label="Next"
          onClick={next}
          disabled={!data.client_first_name.trim() || !data.client_last_name.trim()}
        />
      </div>
    </div>
  )
}
