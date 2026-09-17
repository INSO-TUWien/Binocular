// Setup for the demo-video suite — owns the localStorage state every recorded scene starts from, independent of the screenshots suite.
// Values currently match screenshots.setup.ts's, but they are separate constants on purpose: change them here to tune the videos
// without touching the docs screenshots. Contains state only — the loaders that use it live in demoDashboardSetup.ts (which imports this).

import type { Page } from '@playwright/test';
import { gotoSeededPage, type SeedState } from '../seedState.ts';

// TODO show filtering of author, date and files. When file filtering is mentioned to deselect large files, it should be shown to change outcome
// ─── Seeded localStorage values ───────────────────────────────────────────────

const DEMO_SETTINGS = JSON.stringify({
  general: { gridSize: 1 },
  initialized: true,
  database: {
    currID: 1,
    defaultDataPluginItemId: 1,
    dataPlugins: [{ id: 1, name: 'Mock Data', color: '#66c2a525', isDefault: true, parameters: {} }],
  },
  localDatabaseLoadingState: 0,
  localDatabaseLoadingMessage: '',
});

// Must stay at exactly 7 entries: tabController.tsx regenerates the whole list (auto-selecting the first tab per side) when the
// length differs from its children count, which would discard this seed. Every scene starts collapsed and opens what it needs on
// camera via openTabIfClosed(); flip `selected` here if a video should instead start with a tab already open.
const DEMO_TABS = JSON.stringify({
  tabList: [
    { displayName: 'Parameters', alignment: 0, selected: false, contentID: 1, position: 0 },
    { displayName: 'Visualizations', alignment: 0, selected: false, contentID: 2, position: 1 },
    { displayName: 'Sprints', alignment: 0, selected: false, contentID: 3, position: 2 },
    { displayName: 'Layouts', alignment: 0, selected: false, contentID: 4, position: 3 },
    { displayName: 'Authors', alignment: 1, selected: false, contentID: 5, position: 4 },
    { displayName: 'File Tree', alignment: 1, selected: false, contentID: 6, position: 5 },
    { displayName: 'Help', alignment: 1, selected: false, contentID: 7, position: 6 },
  ],
});

// The window the mock dataset actually covers — widen it here if a demo scene needs to show more history.
const DEMO_PARAMETERS = JSON.stringify({
  parametersGeneral: { granularity: 'days', excludeMergeCommits: false },
  parametersDateRange: { from: '2026-04-25T16:03:21', to: '2026-07-10T03:01:27' },
});

// DashboardItem only renders once `authors` (authorLists[dataPluginId] in Redux) is defined, so pre-seed an empty list to satisfy that before the tab is opened.
const DEMO_AUTHORS = JSON.stringify({
  authorLists: { '1': [] },
  dragging: false,
  draggingSource: null,
  authorToEdit: undefined,
  dataPluginId: 1,
});

// Pre-populated sprints (7×14 days from Apr 1) so "Show Sprints" toggles have something to overlay on camera.
function buildDemoSprintsState(): string {
  const start = new Date('2026-04-01T00:00:00');
  const lengthDays = 14;
  const amount = 7;
  const sprintList = Array.from({ length: amount }, (_, i) => {
    const startDate = new Date(start);
    startDate.setDate(start.getDate() + i * lengthDays);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + lengthDays);
    return {
      id: i,
      name: `S ${i + 1}`,
      startDate: startDate.toISOString().split('.')[0],
      endDate: endDate.toISOString().split('.')[0],
    };
  });
  return JSON.stringify({ sprintList, currID: amount, sprintToEdit: null });
}

export const DEMO_SPRINTS_STATE = buildDemoSprintsState();

// A reasonable starting size (in fine grid units) — the actual fit gets corrected by resizeToViewableArea() once Authors/Visualizations are both open.
export const DEMO_ITEM_HEIGHT_UNITS = 13 * 2;

function demoSeed(dashboard: string, sprints?: string): SeedState {
  return {
    settings: DEMO_SETTINGS,
    dashboard,
    tabs: DEMO_TABS,
    authors: DEMO_AUTHORS,
    parameters: DEMO_PARAMETERS,
    sprints,
  };
}

// Seeds the demo state, stubs the backend routes, and navigates — the demo suite's entry point into seedState.ts.
export async function gotoDemoDashboard(page: Page, dashboardJson: string, sprintsState?: string): Promise<void> {
  await gotoSeededPage(page, demoSeed(dashboardJson, sprintsState));
}
