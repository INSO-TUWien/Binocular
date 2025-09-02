import PreviewImage from "../assets/thumbnail.svg";
import Settings, { type CollaborationSettings } from "./settings/settings.tsx";
import type { VisualizationPlugin } from "../../../interfaces/visualizationPlugin.ts";
import Reducer from "./reducer";
import Saga from "./saga";
import Help from "./help/help.tsx";
import { getSVGData } from "./utilities/utilities.ts";
import type { DataPluginAccountIssues } from "../../../interfaces/dataPluginInterfaces/dataPluginAccountsIssues.ts";
import { dataConverter } from "./utilities/dataConverter.ts";
import { VisualizationPluginMetadataCategory } from "../../../interfaces/visualizationPluginInterfaces/visualizationPluginMetadata.ts";
import Chart from "./chart/chart.tsx";

const CollaborationVisualization: VisualizationPlugin<
  CollaborationSettings,
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
  metadata: {
    category: VisualizationPluginMetadataCategory.AuthorBehaviour,
    recommended: false,
    description: "",
  },
  reducer: Reducer,
  saga: Saga,
};
export default CollaborationVisualization;
