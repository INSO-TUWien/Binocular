'use strict';

export const SWITCH_VISUALIZATION = 'SWITCH_VISUALIZATION';

export const Visualizations = ['ISSUE_IMPACT', 'CODE_OWNERSHIP_RIVER', 'HOTSPOT_DIALS'];


export function switchVisualization( vis ) {
  return { type: SWITCH_VISUALIZATION, id: vis };
}
