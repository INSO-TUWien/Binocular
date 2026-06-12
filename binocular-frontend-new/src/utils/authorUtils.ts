import type { AuthorType } from '../types/data/authorType.ts';

/**
 * Returns authors that belong to the "Other" group: direct members (parent === 0)
 * and their children (whose parent's parent === 0). Only selected authors are included.
 */
export function filterOtherAuthors(authorList: AuthorType[]): AuthorType[] {
  const authorById = new Map(authorList.map((a) => [a.id, a]));
  return authorList.filter((a) => {
    if (!a.selected) return false;
    if (a.parent === 0) return true;
    if (a.parent > 0) return authorById.get(a.parent)?.parent === 0;
    return false;
  });
}
