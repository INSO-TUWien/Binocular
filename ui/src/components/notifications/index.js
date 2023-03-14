'use strict';

import { connect } from 'react-redux';
import Notifications from './Notifications.js';
import { removeNotification } from '../../sagas/notifications.js';

const mapStateToProps = (state = [] /*, ownProps*/) => {
  return {
    notifications: state.notifications,
  };
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {
    onCloseNotification: (id) => dispatch(removeNotification(id)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Notifications);
