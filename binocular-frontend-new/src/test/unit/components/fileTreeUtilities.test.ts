import { describe, it, expect, beforeAll, vi } from 'vitest';
import { FileTreeElementTypeType } from '../../../types/data/fileListType';
import type { FileTreeElementType } from '../../../types/data/fileListType';
import type { DataPluginFile } from '../../../plugins/interfaces/dataPluginInterfaces/dataPluginFiles';
import type { JSX } from 'react';

// Mock DataPluginStorage to prevent pluginRegistry → PouchDB initialization from hanging in jsdom
vi.mock('../../../utils/dataPluginStorage', () => ({ default: {} }));

// Mock DataPluginStorage to prevent pluginRegistry → PouchDB initialization from hanging in jsdom
vi.mock('../../../utils/dataPluginStorage', () => ({ default: {} }));

// Stub OPFS before module loads
vi.stubGlobal('navigator', {
  storage: {
    getDirectory: vi.fn().mockRejectedValue(new Error('OPFS not available')),
  },
});

let generateFileTree: (files: DataPluginFile[]) => FileTreeElementType[];
let filterFileTree: (fileTree: FileTreeElementType, search: string) => FileTreeElementType;
let formatName: (searchTerm: string | undefined, name: string) => JSX.Element[];

beforeAll(async () => {
  const mod = await import('../../../components/fileTree/utils/fileTreeUtilities');
  generateFileTree = mod.generateFileTree;
  filterFileTree = mod.filterFileTree;
  formatName = mod.formatName;
});

function makeFile(path: string): DataPluginFile {
  return { path, webUrl: '', maxLength: 0 };
}

describe('generateFileTree', () => {
  it('U40.1 empty files array → empty tree', () => {
    const result = generateFileTree([]);
    expect(result).toEqual([]);
  });

  it('U40.2 single flat file produces one File node', () => {
    const result = generateFileTree([makeFile('index.ts')]);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('index.ts');
    expect(result[0].type).toBe(FileTreeElementTypeType.File);
  });

  it('U40.3 nested path a/b.ts produces folder a containing file b.ts', () => {
    const result = generateFileTree([makeFile('src/index.ts')]);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe(FileTreeElementTypeType.Folder);
    expect(result[0].name).toBe('src');
    expect(result[0].children).toHaveLength(1);
    expect(result[0].children![0].name).toBe('index.ts');
  });

  it('U40.4 two files in same folder share one folder node', () => {
    const result = generateFileTree([makeFile('src/a.ts'), makeFile('src/b.ts')]);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('src');
    expect(result[0].children).toHaveLength(2);
  });

  it('U40.5 files at different roots produce separate root nodes', () => {
    const result = generateFileTree([makeFile('src/a.ts'), makeFile('lib/b.ts')]);
    expect(result).toHaveLength(2);
    const names = result.map((r) => r.name);
    expect(names).toContain('src');
    expect(names).toContain('lib');
  });
});

describe('filterFileTree', () => {
  function makeTree(): FileTreeElementType {
    return {
      name: '/',
      type: FileTreeElementTypeType.Folder,
      id: 0,
      checked: true,
      foldedOut: true,
      isRoot: true,
      children: [
        {
          name: 'src',
          type: FileTreeElementTypeType.Folder,
          id: 1,
          checked: true,
          foldedOut: false,
          isRoot: false,
          children: [
            {
              name: 'index.ts',
              id: 2,
              type: FileTreeElementTypeType.File,
              checked: true,
              foldedOut: false,
              isRoot: false,
              element: { path: 'src/index.ts', webUrl: '', maxLength: 0 },
            },
            {
              name: 'utils.ts',
              id: 3,
              type: FileTreeElementTypeType.File,
              checked: true,
              foldedOut: false,
              isRoot: false,
              element: { path: 'src/utils.ts', webUrl: '', maxLength: 0 },
            },
          ],
        },
      ],
    };
  }

  it('U40.6 filter matching path returns file', () => {
    const result = filterFileTree(makeTree(), 'index');
    expect(result.children).toHaveLength(1); // src folder
    expect(result.children![0].children).toHaveLength(1); // only index.ts
    expect(result.children![0].children![0].name).toBe('index.ts');
  });

  it('U40.7 filter with no match removes all files, empty folder removed', () => {
    const result = filterFileTree(makeTree(), 'notfound');
    // src folder should be removed (no children match)
    expect(result.children).toHaveLength(0);
  });

  it('U40.8 filter matching all files returns all', () => {
    const result = filterFileTree(makeTree(), '.ts');
    expect(result.children![0].children).toHaveLength(2);
  });

  it('U40.9 leaf node (no children) returns unchanged', () => {
    const leaf: FileTreeElementType = {
      name: 'file.ts',
      id: 1,
      type: FileTreeElementTypeType.File,
      checked: true,
      foldedOut: false,
      isRoot: false,
      element: { path: 'file.ts', webUrl: '', maxLength: 0 },
    };
    const result = filterFileTree(leaf, 'anything');
    expect(result).toBe(leaf); // same reference
  });
});

describe('generateFileTree (U40)', () => {
  it('U40.10 flat file list with no slashes → each file becomes a leaf node at root level', () => {
    const result = generateFileTree([makeFile('readme.md'), makeFile('package.json')]);
    expect(result).toHaveLength(2);
    result.forEach((node) => {
      expect(node.type).toBe(FileTreeElementTypeType.File);
    });
    const names = result.map((n) => n.name);
    expect(names).toContain('readme.md');
    expect(names).toContain('package.json');
  });

  it('U40.11 single path src/utils/helper.ts → root folder src containing folder utils containing leaf helper.ts', () => {
    const result = generateFileTree([makeFile('src/utils/helper.ts')]);
    expect(result).toHaveLength(1);
    const src = result[0];
    expect(src.name).toBe('src');
    expect(src.type).toBe(FileTreeElementTypeType.Folder);
    expect(src.children).toHaveLength(1);
    const utils = src.children![0];
    expect(utils.name).toBe('utils');
    expect(utils.type).toBe(FileTreeElementTypeType.Folder);
    expect(utils.children).toHaveLength(1);
    expect(utils.children![0].name).toBe('helper.ts');
    expect(utils.children![0].type).toBe(FileTreeElementTypeType.File);
  });

  it('U40.12 two paths sharing a folder → one folder node with two children', () => {
    const result = generateFileTree([makeFile('src/a.ts'), makeFile('src/b.ts')]);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('src');
    expect(result[0].children).toHaveLength(2);
    const childNames = result[0].children!.map((c) => c.name);
    expect(childNames).toContain('a.ts');
    expect(childNames).toContain('b.ts');
  });

  it('U40.13 empty input → returns empty array', () => {
    const result = generateFileTree([]);
    expect(result).toEqual([]);
  });

  it('U40.14 deeply nested path a/b/c/d/file.ts → 4 levels of nesting with leaf at bottom', () => {
    const result = generateFileTree([makeFile('a/b/c/d/file.ts')]);
    expect(result).toHaveLength(1);
    const a = result[0];
    expect(a.name).toBe('a');
    const b = a.children![0];
    expect(b.name).toBe('b');
    const c = b.children![0];
    expect(c.name).toBe('c');
    const d = c.children![0];
    expect(d.name).toBe('d');
    expect(d.children).toHaveLength(1);
    expect(d.children![0].name).toBe('file.ts');
    expect(d.children![0].type).toBe(FileTreeElementTypeType.File);
  });
});

describe('filterFileTree (U40)', () => {
  function makeRootTree(): FileTreeElementType {
    return {
      name: '/',
      type: FileTreeElementTypeType.Folder,
      id: 0,
      checked: true,
      foldedOut: true,
      isRoot: true,
      children: [
        {
          name: 'lib',
          type: FileTreeElementTypeType.Folder,
          id: 1,
          checked: true,
          foldedOut: false,
          isRoot: false,
          children: [
            {
              name: 'alpha.ts',
              id: 2,
              type: FileTreeElementTypeType.File,
              checked: true,
              foldedOut: false,
              isRoot: false,
              element: { path: 'lib/alpha.ts', webUrl: '', maxLength: 0 },
            },
            {
              name: 'beta.ts',
              id: 3,
              type: FileTreeElementTypeType.File,
              checked: true,
              foldedOut: false,
              isRoot: false,
              element: { path: 'lib/beta.ts', webUrl: '', maxLength: 0 },
            },
          ],
        },
      ],
    };
  }

  it('U40.15 search string matches a leaf name → returns subtree containing that leaf', () => {
    const result = filterFileTree(makeRootTree(), 'alpha');
    expect(result.children).toHaveLength(1);
    expect(result.children![0].children).toHaveLength(1);
    expect(result.children![0].children![0].name).toBe('alpha.ts');
  });

  it('U40.16 search string matches nothing → returns empty children array', () => {
    const result = filterFileTree(makeRootTree(), 'zzznomatch');
    expect(result.children).toHaveLength(0);
  });

  it('U40.17 empty search string → returns entire tree (all items included)', () => {
    const result = filterFileTree(makeRootTree(), '');
    expect(result.children).toHaveLength(1);
    expect(result.children![0].children).toHaveLength(2);
  });

  it('U40.18 search term matches a folder path segment → returns that folder and its matching children', () => {
    const result = filterFileTree(makeRootTree(), 'lib');
    // 'lib' appears in both 'lib/alpha.ts' and 'lib/beta.ts' paths
    expect(result.children).toHaveLength(1);
    expect(result.children![0].name).toBe('lib');
    expect(result.children![0].children).toHaveLength(2);
  });
});

describe('formatName (U40)', () => {
  it('U40.19 match found in middle of name → array with 3 elements (prefix, match, suffix)', () => {
    const result = formatName('ello', 'hello world');
    expect(result).toHaveLength(3);
    expect(result[0].props.children).toBe('h');
    expect(result[1].props.children).toBe('ello');
    expect(result[2].props.children).toBe(' world');
  });

  it('U40.20 no match → returns array with one element containing full name', () => {
    const result = formatName('zzz', 'hello world');
    expect(result).toHaveLength(1);
    expect(result[0].props.children).toBe('hello world');
  });

  it('U40.21 match at start of name → first element of split is empty string', () => {
    const result = formatName('hello', 'hello world');
    expect(result).toHaveLength(3);
    expect(result[0].props.children).toBe('');
    expect(result[1].props.children).toBe('hello');
  });
});
