'use strict';

export interface HightlightElement {
  modifier: string;
  color: string;
  secondary_color: string;
}

export default class SearchTextHighlighting {
  static performFileSearchTextHighlighting(searchTerm: string) {
    const highlightSet = [
      {
        modifier: '-f',
        color: '#4cd964',
        secondary_color: '#def8e2',
      },
      {
        modifier: '-file',
        color: '#4cd964',
        secondary_color: '#def8e2',
      },
      {
        modifier: '-t',
        color: '#ffcc00',
        secondary_color: '#fff7d8',
      },
      {
        modifier: '-type',
        color: '#ffcc00',
        secondary_color: '#fff7d8',
      },
    ];
    return this.performTextHighlighting(searchTerm, highlightSet);
  }

  static performCommitSearchTextHighlighting(searchTerm: string) {
    const highlightSet = [
      {
        modifier: '-m',
        color: '#4cd964',
        secondary_color: '#def8e2',
      },
      {
        modifier: '-message',
        color: '#4cd964',
        secondary_color: '#def8e2',
      },
      {
        modifier: '-s',
        color: '#ffcc00',
        secondary_color: '#fff7d8',
      },
      {
        modifier: '-sha',
        color: '#ffcc00',
        secondary_color: '#fff7d8',
      },
      {
        modifier: '-d',
        color: '#ff9500',
        secondary_color: '#fff7eb',
      },
      {
        modifier: '-developer',
        color: '#ff9500',
        secondary_color: '#fff7eb',
      },
      {
        modifier: '-b',
        color: '#5856d6',
        secondary_color: '#e4e4f8',
      },
      {
        modifier: '-branch',
        color: '#5856d6',
        secondary_color: '#e4e4f8',
      },
      {
        modifier: '-l',
        color: '#007aff',
        secondary_color: '#ebf5ff',
      },
      {
        modifier: '-line',
        color: '#007aff',
        secondary_color: '#ebf5ff',
      },
      {
        modifier: '-lines',
        color: '#007aff',
        secondary_color: '#ebf5ff',
      },
    ];
    return this.performTextHighlighting(searchTerm, highlightSet);
  }

  static performDeveloperSearchTextHighlighting(searchTerm: string) {
    const highlightSet = [
      {
        modifier: '-n',
        color: '#4cd964',
        secondary_color: '#def8e2',
      },
      {
        modifier: '-name',
        color: '#4cd964',
        secondary_color: '#def8e2',
      },
      {
        modifier: '-e',
        color: '#ffcc00',
        secondary_color: '#fff7d8',
      },
      {
        modifier: '-email',
        color: '#ffcc00',
        secondary_color: '#fff7d8',
      },
      {
        modifier: '-l',
        color: '#007aff',
        secondary_color: '#ebf5ff',
      },
      {
        modifier: '-line',
        color: '#007aff',
        secondary_color: '#ebf5ff',
      },
      {
        modifier: '-lines',
        color: '#007aff',
        secondary_color: '#ebf5ff',
      },
    ];
    return this.performTextHighlighting(searchTerm, highlightSet);
  }

  static performIssueSearchTextHighlighting(searchTerm: string) {
    const highlightSet = [
      {
        modifier: '-t',
        color: '#4cd964',
        secondary_color: '#def8e2',
      },
      {
        modifier: '-title',
        color: '#4cd964',
        secondary_color: '#def8e2',
      },
      {
        modifier: '-d',
        color: '#ffcc00',
        secondary_color: '#fff7d8',
      },
      {
        modifier: '-description',
        color: '#ffcc00',
        secondary_color: '#fff7d8',
      },
      {
        modifier: '-i',
        color: '#ff9500',
        secondary_color: '#fff7eb',
      },
      {
        modifier: '-iid',
        color: '#ff9500',
        secondary_color: '#fff7eb',
      },
      {
        modifier: '-l',
        color: '#007aff',
        secondary_color: '#ebf5ff',
      },
      {
        modifier: '-line',
        color: '#007aff',
        secondary_color: '#ebf5ff',
      },
      {
        modifier: '-lines',
        color: '#007aff',
        secondary_color: '#ebf5ff',
      },
    ];
    return this.performTextHighlighting(searchTerm, highlightSet);
  }

  static performTextHighlighting(searchTerm: string, highlightSet: HightlightElement[]) {
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
                '</span>',
            );
          }
        }
      }
    }
    return htmlString;
  }
}
