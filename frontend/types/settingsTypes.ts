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
  // NEW: Support for toggle switches
  value?: boolean;
  toggleSwitch?: () => void;
}

export interface SettingsSection {
  title: string;
  items: SettingsItemType[];
}
