import * as d3 from 'd3';
import loadingStyles from '../../css/loading.module.scss';

export default class Loading {
  static insert() {
    d3.select('#loading').remove();

    /*d3
      .select('.loadingContainer')
      .append('div')
      .attr('id', 'loading')
      .html('<div class=' + styles.loaderContainer + '><div class=' + styles.loader + '></div></div>');*/
    d3.select('body')
      .append('div')
      .attr('id', 'loading')
      .html(
        '<div class=' +
          loadingStyles.loaderContainer +
          '>' +
          '<div class=' +
          loadingStyles.loadingBarBack +
          '>' +
          '<div id="loadingBarFront" class=' +
          loadingStyles.loadingBarFront +
          '>' +
          '</div></div>' +
          '<div id="loadingBarText" class="' +
          loadingStyles.loadingBarText +
          '">Loading ...</div>' +
          '</div>',
      );
  }

  static setState(percent, text) {
    console.log('LOADING: ' + percent + '% , ' + text);
    d3.select('#loadingBarFront').style('width', percent + '%');
    d3.select('#loadingBarText').text(text);
  }

  static remove() {
    console.log('LOADING FINISHED');
    d3.select('#loading').remove();
  }

  static setErrorText(text) {
    d3.select('#loading').remove();
    d3.select('.loadingContainer')
      .append('div')
      .attr('id', 'loading')
      .html(
        "<div class='" +
          loadingStyles.loaderContainer +
          ' ' +
          loadingStyles.error +
          "'><div style='font-weight: bold'>Error:</div><div>" +
          text +
          '</div></div>',
      );
  }

  static showBackgroundRefresh(text) {
    d3.select('#backgroundRefreshIndicator').attr('hidden', null);
    d3.select('#backgroundRefreshIndicatorText').text(text);
  }

  static hideBackgroundRefresh() {
    console.log('Backgroundrefresh Finished!');
    d3.select('#backgroundRefreshIndicator').attr('hidden', true);
  }
}
