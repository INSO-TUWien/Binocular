'use strict';

export function extractTimeTrackingDataFromNotes(notes) {
  let timeTrackingData = [];
  if (notes !== undefined && notes !== null) {
    [...notes].reverse().forEach((note) => {
      const timeAddedNote = /^added ([0-9a-z ]+) of time spent.*/.exec(note.body);
      const timeSubtractedNote = /^subtracted ([0-9a-z ]+) of time spent.*/.exec(note.body);
      const timeDeletedNote = /^deleted ([0-9a-z ]+) of spent time.*/.exec(note.body);
      const timeSubtractedDeletedNote = /^deleted -([0-9a-z ]+) of spent time.*/.exec(note.body);
      const removedTimeSpentNote = /^removed time spent.*/.exec(note.body);

      const byAuthorName = /^ \*By (.*) on.*/.exec(note.body.split('\n\n')[1]);

      if (timeAddedNote) {
        timeTrackingData.push({
          authorName: byAuthorName ? byAuthorName[1] : note.author.name,
          timeSpent: convertTime(timeAddedNote[1]) / 3600,
          createdAt: note.created_at,
        });
      } else if (timeSubtractedNote) {
        timeTrackingData.push({
          authorName: byAuthorName ? byAuthorName[1] : note.author.name,
          timeSpent: -convertTime(timeSubtractedNote[1]) / 3600,
          createdAt: note.created_at,
        });
      } else if (timeDeletedNote) {
        timeTrackingData.push({
          authorName: byAuthorName ? byAuthorName[1] : note.author.name,
          timeSpent: -convertTime(timeDeletedNote[1]) / 3600,
          createdAt: note.created_at,
        });
      } else if (timeSubtractedDeletedNote) {
        timeTrackingData.push({
          authorName: byAuthorName ? byAuthorName[1] : note.author.name,
          timeSpent: convertTime(timeSubtractedDeletedNote[1]) / 3600,
          createdAt: note.created_at,
        });
      } else if (removedTimeSpentNote) {
        timeTrackingData = [];
      }
    });
  }
  return timeTrackingData;
}

export function aggregateTimeTrackingData(timeTrackingData) {
  const aggregatedTimeTrackingData = {};
  let totalTime = 0;
  timeTrackingData.forEach((event) => {
    if (aggregatedTimeTrackingData[event.authorName] === undefined) {
      aggregatedTimeTrackingData[event.authorName] = event.timeSpent;
    } else {
      aggregatedTimeTrackingData[event.authorName] += event.timeSpent;
    }
    totalTime += event.timeSpent;
  });
  return { aggregatedTimeTrackingData, totalTime };
}

function convertTime(timeString) {
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

export function convertToTimeString(hours) {
  return parseInt(hours) + 'h ' + Math.round(((60 * (hours % 1) + Number.EPSILON) * 100) / 100) + 'min';
}
