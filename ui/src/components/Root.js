import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import App from '../components/App';

const Root = props => (
  <Provider store={props.store}>
    <Router>
      <Route exact path="/" component={App} />
    </Router>
  </Provider>
);

Root.propTypes = {
  store: PropTypes.object.isRequired
};

export default Root;
