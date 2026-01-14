import type { Moment } from 'moment';
import type { MappedDataPluginIssue } from '../types';

export const groupIntoTracks = (issues: MappedDataPluginIssue[], maxDate: Moment) => {
  const tracks: MappedDataPluginIssue[][] = [];

  for (const issue of issues) {
    // Search for a track, that can hold the current issue.
    const openTrack = tracks.find((track) =>
      // A track is considered open, if none of the issues it holds overlaps with the new issue.
      track.every(
        (ti) => !issue.createdAt.isBetween(ti.createdAt, ti.closedAt) && !(issue.closedAt ?? maxDate).isBetween(ti.createdAt, ti.closedAt),
      ),
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
