import styles from './app.css';
import Sidebar from '../Sidebar';
// import ConfigButton from '../ConfigButton';
import HelpButton from '../Help/HelpButton';
import Help from '../Help';
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
  const HelpComponent = props.visualization.HelpComponent;

  return (
    <div className={styles.app}>
      <Sidebar />
      <div className={styles.mainPane}>
        <ProgressBar />
        <ChartComponent />
        <Help>
          <HelpComponent />
        </Help>
      </div>
      <Notifications />
      <HelpButton />
      {/*<ConfigButton />*/}
      <ConfigDialog />
    </div>
  );
});

export default App;
