'use strict';

import { connect } from 'react-redux';
import Notifications from './Notifications';
import { removeNotification } from '../../sagas/notifications';

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
