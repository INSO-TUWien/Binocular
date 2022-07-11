'use strict';

import { connect } from 'react-redux';

import styles from './styles.scss';

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
          <LegendCompact text="Succeeded | Failed" color="#26ca3b" color2="#e23b41" />
        </div>
      </div>
    </div>
  );
};

const CIBuildsConfig = connect(mapStateToProps, mapDispatchToProps)(CIBuildsConfigComponent);

export default CIBuildsConfig;
