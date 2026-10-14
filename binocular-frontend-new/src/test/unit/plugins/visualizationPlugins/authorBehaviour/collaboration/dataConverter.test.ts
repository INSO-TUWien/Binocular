import { describe, it, expect } from 'vitest';
import { convertToGraphData } from '../../../../../../plugins/visualizationPlugins/authorBehaviour/collaboration/src/utilities/dataConverter';
import type { DataPluginAccountIssues } from '../../../../../../plugins/interfaces/dataPluginInterfaces/dataPluginAccountsIssues';
import type { DataPluginIssue } from '../../../../../../plugins/interfaces/dataPluginInterfaces/dataPluginIssues';
import type { CollaborationSettings } from '../../../../../../plugins/visualizationPlugins/authorBehaviour/collaboration/src/settings/settings';

const settings: CollaborationSettings = {
  minEdgeValue: 1,
  maxEdgeValue: Infinity,
  visualizationStyle: 'linear',
  showSprints: false,
};

function makeIssue(id: string): DataPluginIssue {
  return {
    id,
    iid: 1,
    title: '',
    description: '',
    state: 'open',
    webUrl: '',
    createdAt: '',
    closedAt: null,
    labels: [],
    author: null,
    assignee: null,
    assignees: [],
    notes: [],
    commits: [],
    mergeRequests: [],
  };
}

function makeAccount(id: string, issues: DataPluginIssue[]): DataPluginAccountIssues {
  return { id, login: id, name: id, avatarUrl: '', url: '', issues };
}

describe('convertToGraphData', () => {
  it('U1.1 returns empty nodes and links for empty input', () => {
    const result = convertToGraphData([], [], settings);
    expect(result.nodes).toHaveLength(0);
    expect(result.links).toHaveLength(0);
  });

  it('U1.2 creates one node per account', () => {
    const accounts = [makeAccount('alice', []), makeAccount('bob', [])];
    const result = convertToGraphData(accounts, [], settings);
    expect(result.nodes).toHaveLength(2);
    expect(result.nodes.map((n) => n.id)).toContain('alice');
    expect(result.nodes.map((n) => n.id)).toContain('bob');
  });

  it('U1.3 creates a link between two accounts that share an issue', () => {
    const issue = makeIssue('issue-1');
    const accounts = [makeAccount('alice', [issue]), makeAccount('bob', [issue])];
    const result = convertToGraphData(accounts, [], settings);
    expect(result.links).toHaveLength(1);
    expect(result.links[0].value).toBe(1);
  });

  it('U1.4 increments link value for each shared issue', () => {
    const i1 = makeIssue('issue-1');
    const i2 = makeIssue('issue-2');
    const accounts = [makeAccount('alice', [i1, i2]), makeAccount('bob', [i1, i2])];
    const result = convertToGraphData(accounts, [], settings);
    expect(result.links[0].value).toBe(2);
  });

  it('U1.5 does not create a link when accounts share no issues', () => {
    const accounts = [makeAccount('alice', [makeIssue('a')]), makeAccount('bob', [makeIssue('b')])];
    const result = convertToGraphData(accounts, [], settings);
    expect(result.links).toHaveLength(0);
  });

  it('U1.6 filters out links below minEdgeValue', () => {
    const issue = makeIssue('issue-1');
    const accounts = [makeAccount('alice', [issue]), makeAccount('bob', [issue])];
    const strictSettings: CollaborationSettings = { ...settings, minEdgeValue: 2, maxEdgeValue: Infinity };
    const result = convertToGraphData(accounts, [], strictSettings);
    // link value is 1, below minEdgeValue 2 → filtered out
    expect(result.links).toHaveLength(0);
  });

  it('U1.7 filters out links above maxEdgeValue', () => {
    const issues = [makeIssue('i1'), makeIssue('i2'), makeIssue('i3')];
    const accounts = [makeAccount('alice', issues), makeAccount('bob', issues)];
    const cappedSettings: CollaborationSettings = { ...settings, minEdgeValue: 1, maxEdgeValue: 2 };
    const result = convertToGraphData(accounts, [], cappedSettings);
    // link value is 3, above maxEdgeValue 2 → filtered
    expect(result.links).toHaveLength(0);
  });

  it('U1.8 assigns connected accounts to the same group', () => {
    const issue = makeIssue('issue-1');
    const accounts = [makeAccount('alice', [issue]), makeAccount('bob', [issue])];
    const result = convertToGraphData(accounts, [], settings);
    const aliceGroup = result.nodes.find((n) => n.id === 'alice')!.group;
    const bobGroup = result.nodes.find((n) => n.id === 'bob')!.group;
    expect(aliceGroup).toBe(bobGroup);
  });

  it('U1.9 assigns isolated accounts to different groups', () => {
    const accounts = [makeAccount('alice', [makeIssue('a')]), makeAccount('bob', [makeIssue('b')])];
    const result = convertToGraphData(accounts, [], settings);
    const aliceGroup = result.nodes.find((n) => n.id === 'alice')!.group;
    const bobGroup = result.nodes.find((n) => n.id === 'bob')!.group;
    expect(aliceGroup).not.toBe(bobGroup);
  });
});
