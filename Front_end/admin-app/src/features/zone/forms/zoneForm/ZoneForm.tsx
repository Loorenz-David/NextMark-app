import {
  ZoneFormLayout,
  type ZoneFormLayoutProps,
  type ZoneFormFields,
} from "./ZoneForm.layout";

export type ZoneFormFeatureProps = ZoneFormLayoutProps;
export type { ZoneFormFields };

export const ZoneFormFeature = (props: ZoneFormFeatureProps) => {
  return <ZoneFormLayout {...props} />;
};
