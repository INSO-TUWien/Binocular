'use strict';

import { connect } from 'react-redux';

import styles from './styles.module.scss';

import LegendCompact from '../../../components/LegendCompact';

const mapStateToProps = (/*state, ownProps*/) => {
  return {};
};

const mapDispatchToProps = (/*dispatch , ownProps*/) => {
  return {};
};

const CIBuildsConfigComponent = (/*props*/) => {
  return (
    <div className={styles.configContainer}>
      <div className={styles.field}>
        <div className="control">
          <LegendCompact text={'Succeeded | Failed | Cancelled'} color={'#26ca3b'} color2={'#e23b41'} color3={'#aaaaaa'} />
        </div>
      </div>
    </div>
  );
};

const CIBuildsConfig = connect(mapStateToProps, mapDispatchToProps)(CIBuildsConfigComponent);

export default CIBuildsConfig;
