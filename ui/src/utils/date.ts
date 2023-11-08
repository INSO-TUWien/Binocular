'use strict';

import moment from 'moment';

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

//Formats the date for the tooltip
export function formatDate(date: Date, resolution: string) {
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  switch (resolution) {
    case 'years':
      return '' + date.getFullYear();
    case 'months':
      return '' + monthNames[date.getMonth()] + ' ' + date.getFullYear();
    case 'weeks':
      return 'Week starting at ' + dayNames[date.getDay()] + ', ' + date.toLocaleDateString();
    case 'days':
      return dayNames[date.getDay()] + ', ' + date.toLocaleDateString();
    default:
      return date.toLocaleDateString();
  }
}

/**
 *
 * @param resolution
 * @returns {{unit: string, interval: moment.Duration}|{unit: string, interval: number}}
 */
export function getGranularityDuration(resolution: string) {
  switch (resolution) {
    case 'years':
      return { interval: moment.duration(1, 'year'), unit: 'year' };
    case 'months':
      return { interval: moment.duration(1, 'month'), unit: 'month' };
    case 'weeks':
      return { interval: moment.duration(1, 'week'), unit: 'week' };
    case 'days':
      return { interval: moment.duration(1, 'day'), unit: 'day' };
    default:
      return { interval: 0, unit: '' };
  }
}
