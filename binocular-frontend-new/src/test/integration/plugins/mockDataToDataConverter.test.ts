// I7 — MockData → dataConverter pipeline
//
// Verifies that real MockData output can be piped through each dataConverter
// without errors and produces valid, non-NaN chart-ready data.
// No Redux — pure data-layer integration.
//
// Converters used:
//   - convertCommitDataToMetrics   (commits/fileChanges/src/utilities/dataConverter.ts)
//   - convertToGraphData            (authorBehaviour/collaboration/src/utilities/dataConverter.ts)
//
// convertToChartData from Changes is intentionally excluded because it requires
// a full VisualizationPluginProperties object (authorList, fileList, granularity).

import { describe, it, expect, beforeEach } from 'vitest';

import MockData from '../../../plugins/dataPlugins/mockData/src/index.ts';
import { convertCommitDataToMetrics } from '../../../plugins/visualizationPlugins/commits/fileChanges/src/utilities/dataConverter.ts';
import { convertToGraphData } from '../../../plugins/visualizationPlugins/authorBehaviour/collaboration/src/utilities/dataConverter.ts';

const FROM = '2024-01-01T00:00:00.000Z';
const TO = '2024-12-31T23:59:59.000Z';

describe('I7 — MockData → dataConverter pipeline', () => {
  let plugin: MockData;

  beforeEach(async () => {
    plugin = new MockData();
    await plugin.init();
  });

  // ── I7.1 — MockData commits collection returns non-empty data ─────────────

  it('I7.1 — MockData.commits.getAll() resolves to a non-empty array', async () => {
    const commits = await plugin.commits.getAll(FROM, TO);
    expect(commits.length).toBeGreaterThan(0);
    expect(commits[0]).toHaveProperty('sha');
    expect(commits[0]).toHaveProperty('date');
  });

  // ── I7.2 — MockData accountsIssues collection returns non-empty data ──────

  it('I7.2 — MockData.accountsIssues.getAll() resolves to a non-empty array', async () => {
    const accounts = await plugin.accountsIssues.getAll(FROM, TO);
    expect(accounts.length).toBeGreaterThan(0);
    expect(accounts[0]).toHaveProperty('id');
    expect(accounts[0]).toHaveProperty('issues');
  });

  // ── I7.3 — commits → convertCommitDataToMetrics produces valid metrics ────

  it('I7.3 — convertCommitDataToMetrics returns valid metrics with no NaN values', async () => {
    const commits = await plugin.commits.getAll(FROM, TO);
    const metrics = convertCommitDataToMetrics(commits, FROM, TO);

    expect(metrics).toHaveProperty('mpc');
    expect(metrics).toHaveProperty('entropy');
    expect(metrics).toHaveProperty('maxBurst');
    expect(metrics).toHaveProperty('maxChangeset');
    expect(metrics).toHaveProperty('avgChangeset');

    for (const [key, value] of Object.entries(metrics)) {
      expect(Number.isNaN(value), `${key} should not be NaN`).toBe(false);
      expect(value, `${key} should not be undefined`).toBeDefined();
    }
  });

  // ── I7.4 — accounts → convertIssuesToGraphData produces valid graph ────────

  it('I7.4 — convertToGraphData returns nodes and links with no NaN values', async () => {
    const accounts = await plugin.accountsIssues.getAll(FROM, TO);
    const result = convertToGraphData(accounts, [], {
      minEdgeValue: 1,
      maxEdgeValue: 100,
      visualizationStyle: '',
      showSprints: false,
    });

    expect(result).toHaveProperty('nodes');
    expect(result).toHaveProperty('links');
    expect(result.nodes.length).toBeGreaterThan(0);

    for (const node of result.nodes) {
      expect(node.id).toBeDefined();
      expect(Number.isNaN(Number(node.group))).toBe(false);
    }
  });

  // ── I7.5 — pipeline does not throw for any MockData collection ────────────

  it('I7.5 — no exception thrown when piping MockData commits through convertCommitDataToMetrics', async () => {
    await expect(plugin.commits.getAll(FROM, TO).then((commits) => convertCommitDataToMetrics(commits, FROM, TO))).resolves.not.toThrow();
  });
});
