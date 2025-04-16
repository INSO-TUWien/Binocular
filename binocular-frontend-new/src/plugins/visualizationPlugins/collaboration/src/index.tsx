import Chart from "./chart/chart.tsx";
import PreviewImage from "../assets/thumbnail.svg";
import Settings, { SettingsType } from "./settings/settings.tsx";
import { VisualizationPlugin } from "../../../interfaces/visualizationPlugin.ts";
import { changesSlice } from "./reducer";
import Saga from "./saga";
import Help from "./help/help.tsx";
import { DataPluginIssue } from "../../../interfaces/dataPluginInterfaces/dataPluginIssues.ts";
import { getSVGData } from "./utilities/utilities.ts";

const CollaborationVisualization: VisualizationPlugin<
  SettingsType,
  DataPluginIssue
> = {
  name: "Collaboration",
  chartComponent: Chart,
  settingsComponent: Settings,
  helpComponent: Help,
  defaultSettings: { data: { nodes: [], links: [] }, color: "#007AFF" },
  export: {
    getSVGData: getSVGData,
  },
  capabilities: {
    popoutOnly: false,
    export: true,
  },
  images: {
    thumbnail: PreviewImage,
  },
  reducer: changesSlice.reducer,
  saga: Saga,
};
export default CollaborationVisualization;
