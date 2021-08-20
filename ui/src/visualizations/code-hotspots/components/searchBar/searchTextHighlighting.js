'use strict';

export default class SearchTextHighlighting {
  static performFileSearchTextHighlighting(searchTerm) {
    const highlightSet = [
      {
        modifier: '-f',
        color: '#4cd964',
        secondary_color: '#def8e2'
      },
      {
        modifier: '-file',
        color: '#4cd964',
        secondary_color: '#def8e2'
      },
      {
        modifier: '-t',
        color: '#ffcc00',
        secondary_color: '#fff7d8'
      },
      {
        modifier: '-type',
        color: '#ffcc00',
        secondary_color: '#fff7d8'
      }
    ];
    return this.performTextHighlighting(searchTerm, highlightSet);
  }

  static performTextHighlighting(searchTerm, highlightSet) {
    let htmlString = searchTerm;
    const searchTermChunks = searchTerm.split(' ');
    for (let i = 0; i < searchTermChunks.length; i++) {
      for (const highlight of highlightSet) {
        if (searchTermChunks[i] === highlight.modifier) {
          if (i < searchTermChunks.length - 1) {
            i++;
            htmlString = htmlString.replace(
              highlight.modifier + ' ' + searchTermChunks[i],
              '<span style="background-color: ' +
                highlight.secondary_color +
                ';border-radius: 2px 2px 0 0 ;color:#222222; overflow: hidden;border-bottom: 2px solid ' +
                highlight.color +
                '">' +
                '<span style="background-color: ' +
                highlight.color +
                ';border-radius: 2px 0 0 0;color:#222222;">' +
                highlight.modifier +
                '</span> ' +
                searchTermChunks[i] +
                '</span>'
            );
          }
        }
      }
    }
    return htmlString;
  }
}
