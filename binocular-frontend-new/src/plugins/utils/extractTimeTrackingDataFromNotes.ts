import type { DataPluginAccount } from '../interfaces/dataPluginInterfaces/dataPluginAccounts';
import type { DataPluginIssue } from '../interfaces/dataPluginInterfaces/dataPluginIssues';
import type { DataPluginMergeRequest } from '../interfaces/dataPluginInterfaces/dataPluginMergeRequests';
import type { DataPluginNote } from '../interfaces/dataPluginInterfaces/dataPluginNotes';

export interface TimeTrackingData {
  author: DataPluginAccount;
  timeSpent: number;
  createdAt: string;
  issue: DataPluginIssue | null;
  mergeRequest: DataPluginMergeRequest | null;
}

export function convertTime(timeString: string) {
  const timeParts = timeString.split(' ');
  let time = 0;
  timeParts.forEach((part) => {
    if (part.endsWith('h')) {
      time += parseInt(part.substring(0, part.length - 1)) * 60 * 60;
    }
    if (part.endsWith('m')) {
      time += parseInt(part.substring(0, part.length - 1)) * 60;
    }
    if (part.endsWith('2')) {
      time += parseInt(part.substring(0, part.length - 1));
    }
  });
  return time;
}

export function extractTimeTrackingDataFromNotes(notes: DataPluginNote[]) {
  let timeTrackingData: TimeTrackingData[] = [];
  if (notes !== undefined && notes !== null) {
    [...notes].reverse().forEach((note) => {
      const timeAddedNote = /^added ([0-9a-z ]+) of time spent.*/.exec(note.body);
      const timeSubtractedNote = /^subtracted ([0-9a-z ]+) of time spent.*/.exec(note.body);
      const timeDeletedNote = /^deleted ([0-9a-z ]+) of spent time.*/.exec(note.body);
      const timeSubtractedDeletedNote = /^deleted -([0-9a-z ]+) of spent time.*/.exec(note.body);
      const removedTimeSpentNote = /^removed time spent.*/.exec(note.body);

      if (timeAddedNote) {
        timeTrackingData.push({
          author: note.author,
          timeSpent: convertTime(timeAddedNote[1]) / 3600,
          createdAt: note.createdAt,
          issue: note.issue,
          mergeRequest: note.mergeRequest,
        });
      } else if (timeSubtractedNote) {
        timeTrackingData.push({
          author: note.author,
          timeSpent: -convertTime(timeSubtractedNote[1]) / 3600,
          createdAt: note.createdAt,
          issue: note.issue,
          mergeRequest: note.mergeRequest,
        });
      } else if (timeDeletedNote) {
        timeTrackingData.push({
          author: note.author,
          timeSpent: -convertTime(timeDeletedNote[1]) / 3600,
          createdAt: note.createdAt,
          issue: note.issue,
          mergeRequest: note.mergeRequest,
        });
      } else if (timeSubtractedDeletedNote) {
        timeTrackingData.push({
          author: note.author,
          timeSpent: convertTime(timeSubtractedDeletedNote[1]) / 3600,
          createdAt: note.createdAt,
          issue: note.issue,
          mergeRequest: note.mergeRequest,
        });
      } else if (removedTimeSpentNote) {
        if (note.issue) {
          timeTrackingData = timeTrackingData.filter((item) => item.issue?.id !== note.issue?.id);
        } else if (note.mergeRequest) {
          timeTrackingData = timeTrackingData.filter((item) => item.mergeRequest?.id !== note.mergeRequest?.id);
        }
      }
    });
  }
  return timeTrackingData;
}
