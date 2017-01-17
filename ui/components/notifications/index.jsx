'use strict';

import { connect } from 'react-redux';
import Notifications from './Notifications.jsx';
import { removeNotification } from '../../actions.jsx';

const mapStateToProps = (state = [], ownProps) => {
  return {
    notifications: state.notifications
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onCloseNotification: id => dispatch( removeNotification(id) )
  };
};

export default connect( mapStateToProps, mapDispatchToProps )( Notifications );
