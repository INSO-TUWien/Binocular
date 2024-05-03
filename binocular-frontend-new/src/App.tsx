import TabController from './components/tabMenu/tabController/tabController.tsx';
import Tab from './components/tabMenu/tab/tab.tsx';
import appStyles from './app.module.scss';
import StatusBar from './components/statusBar/statusBar.tsx';
function App() {
  return (
    <>
      <div className={appStyles.mainView}>
        <TabController appName={'Binocular'}>
          <Tab displayName={'Parameters'} defaultAlignment={'top'}></Tab>
          <Tab displayName={'Components'} defaultAlignment={'top'}></Tab>
          <Tab displayName={'Sprints'} defaultAlignment={'top'}></Tab>
          <Tab displayName={'Authors'} defaultAlignment={'right'}></Tab>
          <Tab displayName={'File Tree'} defaultAlignment={'right'}></Tab>
        </TabController>
      </div>
      <div className={appStyles.statusBar}>
        <StatusBar
          vcsIndexer={'VCS Placeholder'}
          itsIndexer={'ITS Placeholder'}
          ciIndexer={'CI Placeholder'}
          repository={'Repository Placeholder'}></StatusBar>
      </div>
    </>
  );
}

export default App;
