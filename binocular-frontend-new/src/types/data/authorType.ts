import type { UserType } from './userType.ts';

export interface AuthorType {
  user: UserType;
  id: number;
  parent: number;
  color: { main: string; secondary: string };
  selected: boolean;
  displayName?: string;
}

export interface Palette {
  [signature: string]: string;
}

/**
 * Resolves the effective display name for grouping an author in charts.
 * - Standalone authors (parent === -1) use their own display name.
 * - Authors in the "Other" group (parent === 0) resolve to 'others'.
 * - Children of standalone authors resolve to their parent's display name.
 * - Children of "Other" group authors also resolve to 'others'.
 */
export function resolveAuthorName(author: AuthorType, authorList: AuthorType[]): string {
  if (author.parent === -1) {
    return author.displayName || author.user.gitSignature;
  }
  if (author.parent === 0) {
    return 'others';
  }
  const parent = authorList.find((a) => a.id === author.parent);
  if (!parent || parent.parent === 0) {
    return 'others';
  }
  return parent.displayName || parent.user.gitSignature;
}
