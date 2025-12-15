import type { DataPluginCommit } from '../../../../interfaces/dataPluginInterfaces/dataPluginCommits';
import type { DataPluginBuild } from '../../../../interfaces/dataPluginInterfaces/dataPluginBuilds';
import type { DataPluginIssue } from '../../../../interfaces/dataPluginInterfaces/dataPluginIssues';
import type { DataPluginMergeRequest } from '../../../../interfaces/dataPluginInterfaces/dataPluginMergeRequests';
import type { DataPluginNote } from '../../../../interfaces/dataPluginInterfaces/dataPluginNotes';
import type { DataPluginBranch } from '../../../../interfaces/dataPluginInterfaces/dataPluginBranches';

export interface CalendarHeatmapProps {
  data: Array<{ date: Date; value: number; tooltip?: string }>;
  startDate: Date;
  endDate: Date;
  minCellSize?: number;
  color?: string;
  cellPadding?: number;
  onCellClick?: ((cell: HeatmapCell) => void) | null;
  showLegend?: boolean;
  legendTitle?: string;
  width?: number;
  height?: number;
}

export interface HeatmapProps {
  data: HeatmapCell[];
  rowLabels: string[];
  colLabels: string[];
  minCellSize?: number;
  color?: string;
  cellPadding?: number;
  scaleHorizontal?: boolean;
  scaleVertical?: boolean;
  onCellClick?: ((cell: HeatmapCell) => void) | null;
  showLegend?: boolean;
  legendTitle?: string;
  containerWidth?: number;
  containerHeight?: number;
}
export interface HeatmapCell {
  row: number;
  col: number;
  value: number;
  tooltip?: string;
  metadata?: any; // TODO define a proper type here
}

export type AnyActivityDataPlugin =
  | DataPluginCommit
  | DataPluginBuild
  | DataPluginIssue
  | DataPluginMergeRequest
  | DataPluginNote
  | DataPluginBranch;

export function isDataPluginCommit(d: any): d is DataPluginCommit {
  return d && typeof d === 'object' && 'sha' in d && 'messageHeader' in d && 'stats' in d;
}
