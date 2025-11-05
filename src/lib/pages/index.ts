import AlarmForm from "./AlarmForm.svelte";
import AlarmList from "./AlarmList.svelte";
import AssetList from "./AssetList.svelte";
import AssetForm from "./AssetForm.svelte";
import Appearance from "./Appearance.svelte";

import NotificationsRounded from "@iconify-svelte/material-symbols/notifications-rounded";
import LabProfileRounded from "@iconify-svelte/material-symbols/lab-profile-rounded";
import DeviceHubRounded from "@iconify-svelte/material-symbols/device-hub-rounded";

export enum PageIndex {
  ALARMS,
  REPORT,
  ASSETS,
  ASSET,
  APPEARANCE,
}

// export enum HiddenPageIndex {
//   ASSET,
// }

// export const hiddenPages = [
//   {
//     title: "Asset",
//     index: HiddenPageIndex.ASSET,
//     icon: DeviceHubRounded,
//     component: AssetForm,
//     roles: ["read:assets"],
//   },
// ];

export const pages = [
  {
    title: "Alarms",
    index: PageIndex.ALARMS,
    icon: NotificationsRounded,
    component: AlarmList,
    roles: ["read:alarms"],
  },
  {
    title: "Report",
    index: PageIndex.REPORT,
    icon: LabProfileRounded,
    component: AlarmForm,
    roles: ["write:alarms"],
  },
  {
    title: "Assets",
    index: PageIndex.ASSETS,
    icon: DeviceHubRounded,
    component: AssetList,
    roles: ["read:assets"],
  },
  {
    title: "Asset",
    index: PageIndex.ASSET,
    icon: DeviceHubRounded,
    component: AssetForm,
    roles: ["read:assets"],
    hidden: true,
  },
  {
    title: "Appearance",
    index: PageIndex.APPEARANCE,
    icon: DeviceHubRounded,
    component: Appearance,
    roles: ["read:assets", "read:alarms"],
    hidden: true,
  },
];
