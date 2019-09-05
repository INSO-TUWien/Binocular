import styles from './app.css';
import Sidebar from '../Sidebar';
// import ConfigButton from '../ConfigButton';
import HelpButton from '../Help/HelpButton';
import Help from '../Help';
import ConfigDialog from '../ConfigDialog';
import ProgressBar from '../ProgressBar';
import Notifications from '../notifications';
import React from 'react';
import { connect } from 'react-redux';

const mapStateToProps = state => {
  return {
    visualization: state.visualizations[state.activeVisualization],
    showHelp: state.showHelp
  };
};

const mapDispatchToProps = () => ({});

class App extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      helpPos: 0
    };
  }

  render() {
    const ChartComponent = this.props.visualization.ChartComponent;
    const HelpComponent = this.props.visualization.HelpComponent;

    return (
      <div className={styles.app}>
        <Sidebar />
        <div className={styles.mainPane}>
          <ProgressBar />
          <ChartComponent />
          {this.props.showHelp &&
            <Help onResize={e => this.setState({ helpPos: e.bounds.height })}>
              <HelpComponent />
            </Help>}
        </div>
        <Notifications />
        <HelpButton
          y={this.props.showHelp ? this.state.helpPos : 0}
          icon={this.props.showHelp ? 'times' : 'question'}
        />
        <ConfigDialog />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
