import PropTypes from 'prop-types';
import styles from './app.css';
import Sidebar from '../Sidebar';
import ConfigButton from '../ConfigButton';
import ConfigDialog from '../ConfigDialog';
import ProgressBar from '../ProgressBar';
import CodeOwnershipRiver from '../visualizations/code-ownership-river';

const App = () =>
  <div className={styles.app}>
    <Sidebar />
    <div className={styles.chartPanel}>
      <ProgressBar />
      <CodeOwnershipRiver />
    </div>
    <ConfigButton />
    <ConfigDialog />
  </div>;

App.propTypes = {
  children: PropTypes.object
};

export default App;
