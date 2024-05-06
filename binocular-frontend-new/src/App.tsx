import TabController from './components/tabMenu/tabController/tabController.tsx';
import Tab from './components/tabMenu/tab/tab.tsx';
import appStyles from './app.module.scss';
import StatusBar from './components/statusBar/statusBar.tsx';
import TabMenuContent from './components/tabMenu/tabMenuContent/tabMenuContent.tsx';
function App() {
  return (
    <>
      <div className={appStyles.mainView}>
        <TabController appName={'Binocular'}>
          <Tab displayName={'Parameters'} defaultAlignment={'top'}>
            <span>Parameter Tab</span>
          </Tab>
          <Tab displayName={'Components'} defaultAlignment={'top'}>
            <span>Component Tab</span>
          </Tab>
          <Tab displayName={'Sprints'} defaultAlignment={'top'}>
            <span>Sprint Tab</span>
          </Tab>
          <Tab displayName={'Authors'} defaultAlignment={'right'}>
            <span>Author Tab</span>
          </Tab>
          <Tab displayName={'File Tree'} defaultAlignment={'right'}>
            <span>File Tree Tab</span>
          </Tab>
          <TabMenuContent>
            <div style={{ border: '2px dashed blue', margin: '5px', width: 'calc(100% - 10px)', height: 'calc(100% - 10px)' }}>Charts</div>
          </TabMenuContent>
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
