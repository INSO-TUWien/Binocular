import Chart from "./chart/chart.tsx";
import PreviewImage from "../assets/thumbnail.svg";
import Settings, { SettingsType } from "./settings/settings.tsx";
import { VisualizationPlugin } from "../../../interfaces/visualizationPlugin.ts";
import Reducer from "./reducer";
import Saga from "./saga";
import Help from "./help/help.tsx";
import { getSVGData } from "./utilities/utilities.ts";
import { DataPluginAccount } from "../../../interfaces/dataPluginInterfaces/dataPluginAccount.ts";
import { convertIssuesToGraphData } from "./utilities/dataConverter.ts";

const CollaborationVisualization: VisualizationPlugin<
  SettingsType,
  DataPluginAccount
> = {
  name: "Collaboration",
  chartComponent: Chart,
  settingsComponent: Settings,
  helpComponent: Help,
  defaultSettings: {
    color: "#007AFF",
    minEdgeValue: 1,
    maxEdgeValue: 999,
  },
  dataConverter: convertIssuesToGraphData,
  dataConnectionName: "accountsIssues",
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
  reducer: Reducer,
  saga: Saga,
};
export default CollaborationVisualization;
