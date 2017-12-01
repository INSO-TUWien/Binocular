'use strict';

import { connect } from 'react-redux';

import styles from './styles.scss';

const mapStateToProps = (/*state , ownProps*/) => {
  return {};
};

const mapDispatchToProps = (/*dispatch , ownProps*/) => {
  return {};
};

const HotspotDialsConfigComponent = (/*props*/) => {
  return <div className={styles.configContainer} />;
};

const HotspotDialsConfig = connect(mapStateToProps, mapDispatchToProps)(
  HotspotDialsConfigComponent
);

export default HotspotDialsConfig;
