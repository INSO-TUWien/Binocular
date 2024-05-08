import TabController from './components/tabMenu/tabController/tabController.tsx';
import Tab from './components/tabMenu/tab/tab.tsx';
import appStyles from './app.module.scss';
import StatusBar from './components/statusBar/statusBar.tsx';
import TabMenuContent from './components/tabMenu/tabMenuContent/tabMenuContent.tsx';
import Dashboard from "./components/dashboard/dashboard.tsx";
import TabSection from "./components/tabMenu/tab/tabSection/tabSection.tsx";
function App() {
  return (
    <>
      <div className={appStyles.mainView}>
        <TabController appName={'Binocular'}>
          <Tab displayName={'Parameters'} alignment={'top'}>
            <TabSection>
              <span>Parameter Section 1</span>
            </TabSection>
            <TabSection>
              <span>Parameter Section 2</span>
            </TabSection>
          </Tab>
          <Tab displayName={'Components'} alignment={'top'}>
            <span>Component Tab</span>
          </Tab>
          <Tab displayName={'Sprints'} alignment={'top'}>
            <span>Sprint Tab</span>
          </Tab>
          <Tab displayName={'Authors'} alignment={'right'}>
            <span>Author Tab</span>
          </Tab>
          <Tab displayName={'File Tree'} alignment={'right'}>
            <span>File Tree Tab</span>
          </Tab>
          <TabMenuContent>
            <Dashboard></Dashboard>
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
