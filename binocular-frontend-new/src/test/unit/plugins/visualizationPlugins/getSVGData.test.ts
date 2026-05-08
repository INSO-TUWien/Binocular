import { describe, it, expect } from 'vitest';

// These 8 files use the children[1].outerHTML pattern (no optional chaining on index access)
const childrenIndexPaths = [
  '../../../../plugins/visualizationPlugins/authorBehaviour/repositoryActivity/src/utilities/utilities',
  '../../../../plugins/visualizationPlugins/authorBehaviour/timeSpent/src/utilities/utilities',
  '../../../../plugins/visualizationPlugins/builds/builds/src/utilities/utilities',
  '../../../../plugins/visualizationPlugins/commits/changes/src/utilities/utilities',
  '../../../../plugins/visualizationPlugins/commits/fileChanges/src/utilities/utilities',
  '../../../../plugins/visualizationPlugins/issues/issues/src/utilities/utilities',
  '../../../../plugins/visualizationPlugins/issues/mergeRequests/src/utilities/utilities',
  '../../../../plugins/visualizationPlugins/simpleVisualizationPlugin/src/utilities/utilities',
];

// These 3 files use a safer find-SVGElement pattern
const svgElementFindPaths = [
  '../../../../plugins/visualizationPlugins/authorBehaviour/collaboration/src/utilities/utilities',
  '../../../../plugins/visualizationPlugins/expertise/codeExpertise/src/utilities/utilities',
  '../../../../plugins/visualizationPlugins/expertise/knowledgeRadar/src/utilities/utilities',
];

const FALLBACK = '<svg xmlns="http://www.w3.org/2000/svg"></svg>';

describe.each(childrenIndexPaths)('getSVGData (children[1] variant) — %s', (modulePath) => {
  it('U46.1 returns fallback SVG when ref.current is null', async () => {
    const { getSVGData } = await import(modulePath);
    expect(getSVGData({ current: null })).toBe(FALLBACK);
  });

  it('U46.2 BUG: throws TypeError when children[1] is absent (missing optional chaining on index)', async () => {
    const { getSVGData } = await import(modulePath);
    const div = document.createElement('div');
    div.appendChild(document.createElement('span'));
    // children[1] is undefined; .outerHTML is accessed without optional chaining → throws
    expect(() => getSVGData({ current: div })).toThrow(TypeError);
  });

  it('U46.3 returns outerHTML of children[1] when present', async () => {
    const { getSVGData } = await import(modulePath);
    const div = document.createElement('div');
    div.appendChild(document.createElement('span'));
    const svg = document.createElement('div');
    div.appendChild(svg);
    expect(getSVGData({ current: div })).toBe(svg.outerHTML);
  });
});

describe.each(svgElementFindPaths)('getSVGData (SVGElement-find variant) — %s', (modulePath) => {
  it('U46.4 returns fallback SVG when ref.current is null', async () => {
    const { getSVGData } = await import(modulePath);
    expect(getSVGData({ current: null })).toBe(FALLBACK);
  });

  it('U46.5 returns fallback SVG when no SVGElement child exists', async () => {
    const { getSVGData } = await import(modulePath);
    const div = document.createElement('div');
    div.appendChild(document.createElement('span'));
    expect(getSVGData({ current: div })).toBe(FALLBACK);
  });

  it('U46.6 returns outerHTML of the first SVGElement child', async () => {
    const { getSVGData } = await import(modulePath);
    const div = document.createElement('div');
    div.appendChild(document.createElement('span'));
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    div.appendChild(svg);
    expect(getSVGData({ current: div })).toBe(svg.outerHTML);
  });
});
