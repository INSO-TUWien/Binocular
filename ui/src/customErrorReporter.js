import PropTypes from 'prop-types';
import Redbox from 'redbox-react';

const customErrorReporter = ({ error }) => {
  console.error(error);
  return <Redbox error={error} />;
};

customErrorReporter.propTypes = {
  error: PropTypes.instanceOf(Error).isRequired,
};

export default customErrorReporter;
