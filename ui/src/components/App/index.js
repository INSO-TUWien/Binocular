import styles from './app.css';
import Sidebar from '../Sidebar';
// import ConfigButton from '../ConfigButton';
import ConfigDialog from '../ConfigDialog';
import ProgressBar from '../ProgressBar';
import Notifications from '../notifications';
import { connect } from 'react-redux';

const mapStateToProps = state => {
  return {
    visualization: state.visualizations[state.activeVisualization]
  };
};

const mapDispatchToProps = () => ({});

const App = connect(mapStateToProps, mapDispatchToProps)(props => {
  const ChartComponent = props.visualization.ChartComponent;

  return (
    <div className={styles.app}>
      <Sidebar />
      <div className={styles.chartPanel}>
        <ProgressBar />
        <ChartComponent />
      </div>
      <Notifications />
      {/*<ConfigButton />*/}
      <ConfigDialog />
    </div>
  );
});

export default App;
