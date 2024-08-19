/**
 * PROPS
 */
export interface BubbleChartProps {
  paddings: BubbleChartPadding;
}

export interface HierarchicalBubbleChartProps extends BubbleChartProps {
  data: HierarchicalDataPointNode;
  handleSubgroupClick: (node: d3.HierarchyCircularNode<HierarchicalDataPointNode>) => void;
  handleDoubleClick: () => void;
}

export interface CoordinateBubbleChartProps extends BubbleChartProps {
  data: CoordinateDataPoint[];
  showXAxis: boolean;
  showYAxis: boolean;
}

/**
 * STATES
 */
export interface BubbleChartState {
  tooltipX: number;
  tooltipY: number;
  tooltipVisible: boolean;
  tooltipData: ToolTipData[];
}

export interface HierarchicalBubbleChartState extends BubbleChartState {
  data: HierarchicalDataPointNode;
}

export interface CoordinateBubbleChartState extends BubbleChartState {
  data: CoordinateDataPoint[];
}

/**
 * DATAPOINTS
 */

export interface BubbleChartDataPoint {
  size: number;
  tooltipData: ToolTipData[];
}

export interface CoordinateDataPoint extends BubbleChartDataPoint {
  x: number;
  y: number;
  originalX: number;
  originalY: number;
  color: string;
}

export interface HierarchicalDataPoint extends BubbleChartDataPoint {
  identifier: string;
  subgroupPath: string;
}

/**
 * NODES
 */

export interface HierarchicalDataPointNode {
  subgroupName: string;
  subgroupPath: string;
  datapoint?: HierarchicalDataPoint;
  isRoot?: boolean;
  children: HierarchicalDataPointNode[];
}

/**
 * LAYOUT
 */

export interface BubbleChartPadding {
  top: number;
  left: number;
  bottom: number;
  right: number;
}

export interface BubbleChartWindowSpecs {
  height: number;
  width: number;
  paddings: BubbleChartPadding;
}

/**
 * D3
 */

export interface CoordinateBubbleChartScales {
  x: any;
  y: any;
  radius: any;
}

/**
 * TOOLTIP
 */

export interface ToolTipData {
  label: string;
  value: string | number;
}
