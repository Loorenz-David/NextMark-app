import { CreateRouteGroupFormFields } from "./components/CreateRouteGroupFormFields";
import { CreateRouteGroupFormFooter } from "./components/CreateRouteGroupFormFooter";

export const CreateRouteGroupFormLayout = () => (
  <>
    <form className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden bg-[var(--color-ligth-bg)] px-4 pb-[88px] pt-4">
      <CreateRouteGroupFormFields />
    </form>
    <CreateRouteGroupFormFooter />
  </>
);
