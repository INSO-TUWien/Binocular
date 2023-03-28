import styles from './app.css';
import Sidebar from '../Sidebar';
import HelpButton from '../Help/HelpButton';
import Help from '../Help';
import ProgressBar from '../ProgressBar';
import Notifications from '../notifications';
import React from 'react';
import { connect } from 'react-redux';

const mapStateToProps = (state) => {
  return {
    visualization: state.visualizations[state.activeVisualization],
    showHelp: state.showHelp,
  };
};

const mapDispatchToProps = () => ({});

class App extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      helpPos: 0,
      collapsed: false,
    };
  }

  render() {
    const ChartComponent = this.props.visualization.ChartComponent;
    const HelpComponent = this.props.visualization.HelpComponent;
    const { showHelp } = this.props;
    const { helpPos, collapsed } = this.state;

    return (
      <div className={styles.app}>
        <Sidebar collapsed={collapsed} onToggle={() => this.setState((prevState) => ({ collapsed: !prevState.collapsed }))} />
        <div className={styles.mainPane}>
          <ProgressBar />
          <ChartComponent sidebarOpen={!collapsed} />
          {showHelp ? (
            <Help onResize={(e) => this.setState({ helpPos: e.bounds.height })}>
              <HelpComponent sidebarOpen={!collapsed} />
            </Help>
          ) : (
            ''
          )}
        </div>
        <Notifications />
        <HelpButton y={showHelp ? helpPos : 0} icon={showHelp ? 'times' : 'question'} />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
