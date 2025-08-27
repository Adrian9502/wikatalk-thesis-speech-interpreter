import { FeatherIconName } from "./types";

export interface SettingsItemType {
  id?: string;
  icon: FeatherIconName;
  label: string;
  onPress?: () => void;
  showArrow?: boolean;
  showSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  customIconColor?: string;
}

export interface SettingsSection {
  title: string;
  items: SettingsItemType[];
}
