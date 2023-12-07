import React from 'react';
import loadingStyles from '../../css/loading.module.scss';
import 'bulma-switch';

export default class BackgroundRefreshIndicator extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div id={'backgroundRefreshIndicator'} className={loadingStyles.backgroundRefreshIndicator} hidden={true}>
        <div className={loadingStyles.loader} />
        <div id={'backgroundRefreshIndicatorText'} className={loadingStyles.backgroundRefreshIndicatorText}>
          Background Refresh
        </div>
      </div>
    );
  }
}
