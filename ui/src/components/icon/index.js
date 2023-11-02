import styles from './icon.css';
import cx from 'classnames';
import PropTypes from 'prop-types';

const Icon = (props) => {
  const icon = `fa-${props.name}`;

  return (
    <span className={styles.icon}>
      <i className={cx('fa', icon)} />
    </span>
  );
};

Icon.propTypes = {
  name: PropTypes.string.isRequired,
};

export default Icon;
