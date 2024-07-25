import { Author } from '../../../types/dbTypes';

/**
 * increments the count in the map for every author in authors based on whether they are selected or not
 * provides the possibility to include users who did not contribute to the project, thus not showing up in the allAuthors list
 * @param authors the list of authors to be added
 * @param allAuthors the list containing all authors
 * @param selectedAuthors the list containing all selected authors
 * @param authorMap the map the result is safed to
 * @param onlyShowAuthors whethere or not users that did not contribute to the project should be displayed
 */
export function incrementCollectionForSelectedAuthors(
  authors: Author[],
  allAuthors,
  selectedAuthors,
  authorMap: Map<string, [number, string]>,
  onlyShowAuthors: boolean = false,
): void {
  if (authors.length === 0) {
    return;
  }
  const colors = ['#6cc644', '#bd2c00', '#6e5494'];

  for (const person of authors) {
    let shouldDisplay = false;
    let isContributor = false;
    let col = colors[Math.floor(Math.random() * (2 - 0 + 1) + 0)];

    for (const author of Object.keys(allAuthors)) {
      const authorName = author.split('<')[0].slice(0, -1).replace(/\s+/g, '');
      if (person.login === authorName) {
        isContributor = true;
        col = allAuthors[author];
        if (selectedAuthors.filter((a: string) => a === author).length > 0) {
          shouldDisplay = true;
          break;
        }
      }
    }

    // if the person is not a contributor => add depending on settings
    if (!isContributor) shouldDisplay = !onlyShowAuthors;
    if (!shouldDisplay) continue;

    const [count, color] = authorMap.get(person.login) || [0, col];
    authorMap.set(person.login, [count + 1, color]);
  }
}
