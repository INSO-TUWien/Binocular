import type { MappedDataPluginIssue } from '../types';

export const groupIntoTracks = ([head, ...tail]: MappedDataPluginIssue[]) => {
  if (!head) {
    return [];
  }

  // Initialize tracks with the first issue in the list.
  // Simplifies the for-of loop
  const tracks: MappedDataPluginIssue[][] = [[head]];
  for (const issue of tail) {
    // Search for a track, that can hold the current issue.
    const openTrack = tracks.find((track) =>
      // A track is considered open, if none of the issues it holds overlaps with the new issue.
      track.every((ti) => !issue.createdAt.isBetween(ti.createdAt, ti.closedAt) && !issue.closedAt.isBetween(ti.createdAt, ti.closedAt)),
    );

    // If a track was found, append the issue.
    if (openTrack) {
      openTrack.push(issue);
      continue;
    }

    // Otherwise open a new track.
    tracks.push([issue]);
  }

  return tracks;
};
