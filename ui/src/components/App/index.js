import styles from './app.css';
import Sidebar from '../Sidebar';
import ConfigButton from '../ConfigButton';
import ConfigDialog from '../ConfigDialog';
import ProgressBar from '../ProgressBar';
import Notifications from '../notifications';
import CodeOwnershipRiver from '../../visualizations/code-ownership-river';
import IssueImpact from '../../visualizations/issue-impact';
import { connect } from 'react-redux';

const mapStateToProps = state => {
  return {
    activeVisualization: state.activeVisualization
  };
};

const mapDispatchToProps = () => ({});

const App = connect(mapStateToProps, mapDispatchToProps)(props =>
  <div className={styles.app}>
    <Sidebar />
    <div className={styles.chartPanel}>
      <ProgressBar />
      {props.activeVisualization === 'CODE_OWNERSHIP_RIVER' && <CodeOwnershipRiver />}
      {props.activeVisualization === 'ISSUE_IMPACT' && <IssueImpact />}
    </div>
    <Notifications />
    {/*<ConfigButton />*/}
    <ConfigDialog />
  </div>
);

export default App;
