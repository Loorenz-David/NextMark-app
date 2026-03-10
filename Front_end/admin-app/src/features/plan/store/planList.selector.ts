import { useShallow } from "zustand/react/shallow";
import { selectPlanListStats, usePlanListStore } from "./planList.store";



export const usePlanListStats = ()=> usePlanListStore(useShallow(selectPlanListStats))