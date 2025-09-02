import Chart from "./chart/chart.tsx";
import PreviewImage from "../assets/thumbnail.svg";
import Settings, { SettingsType } from "./settings/settings.tsx";
import { VisualizationPlugin } from "../../../interfaces/visualizationPlugin.ts";
import Reducer from "./reducer";
import Saga from "./saga";
import Help from "./help/help.tsx";
import { getSVGData } from "./utilities/utilities.ts";
import { DataPluginAccountIssues } from "../../../interfaces/dataPluginInterfaces/dataPluginAccountsIssues.ts";
import { dataConverter } from "./utilities/dataConverter.ts";

const CollaborationVisualization: VisualizationPlugin<
  SettingsType,
  DataPluginAccountIssues
> = {
  name: "Collaboration",
  chartComponent: Chart,
  settingsComponent: Settings,
  helpComponent: Help,
  defaultSettings: {
    minEdgeValue: 1,
    maxEdgeValue: 99,
  },
  // @ts-ignore
  dataConverter,
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
