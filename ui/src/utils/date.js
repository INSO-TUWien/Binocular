'use strict';

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

//Formats the date for the tooltip
export function formatDate(date, resolution) {
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
    'December'
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
      return '';
  }
}
