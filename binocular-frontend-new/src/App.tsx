import TabController from './components/tabMenu/tabController/tabController.tsx';
import Tab from './components/tabMenu/tab/tab.tsx';
import appStyles from './app.module.scss';
import StatusBar from './components/statusBar/statusBar.tsx';
import TabMenuContent from './components/tabMenu/tabMenuContent/tabMenuContent.tsx';
import Dashboard from './components/dashboard/dashboard.tsx';
import TabSection from './components/tabMenu/tab/tabSection/tabSection.tsx';
import ParametersDateRange from './components/tabs/parameters/parametersDateRange/parametersDateRange.tsx';
import ParametersGeneral from './components/tabs/parameters/parametersGeneral/parametersGeneral.tsx';
import InformationDialog from './components/informationDialog/informationDialog.tsx';
import VisualizationSelector from './components/tabs/components/visualizationSelector/visualizationSelector.tsx';
import AuthorList from './components/tabs/authors/authorList/authorList.tsx';
import OtherAuthors from './components/tabs/authors/otherAuthors/otherAuthors.tsx';
import TabControllerButton from './components/tabMenu/tabControllerButton/tabControllerButton.tsx';
import SettingsGray from './assets/settings_gray.svg';
import ExportGray from './assets/export_gray.svg';
import ExportDialog from './components/exportDialog/exportDialog.tsx';
import SettingsDialog from './components/settingsDialog/settingsDialog.tsx';

function App() {
  return (
    <>
      <div className={appStyles.mainView}>
        <TabController appName={'Binocular'}>
          <TabControllerButton
            onClick={() => {
              (document.getElementById('exportDialog') as HTMLDialogElement).showModal();
            }}
            icon={ExportGray}
            name={'Export'}
            animation={'jump'}></TabControllerButton>
          <TabControllerButton
            onClick={() => {
              (document.getElementById('settingsDialog') as HTMLDialogElement).showModal();
            }}
            icon={SettingsGray}
            name={'Settings'}
            animation={'rotate'}></TabControllerButton>
          <Tab displayName={'Parameters'} alignment={'top'}>
            <TabSection name={'Date Range'}>
              <ParametersDateRange></ParametersDateRange>
            </TabSection>
            <TabSection name={'General'}>
              <ParametersGeneral></ParametersGeneral>
            </TabSection>
          </Tab>
          <Tab displayName={'Components'} alignment={'top'}>
            <TabSection name={'Visualization Selector'}>
              <VisualizationSelector></VisualizationSelector>
            </TabSection>
          </Tab>
          <Tab displayName={'Sprints'} alignment={'top'}>
            <span>Sprint Tab</span>
          </Tab>
          <Tab displayName={'Authors'} alignment={'right'}>
            <TabSection name={'Authors'}>
              <AuthorList></AuthorList>
            </TabSection>
            <TabSection name={'Other'}>
              <OtherAuthors></OtherAuthors>
            </TabSection>
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
      <button className={appStyles.settingsButton}></button>
      <InformationDialog></InformationDialog>
      <ExportDialog></ExportDialog>
      <SettingsDialog></SettingsDialog>
    </>
  );
}

export default App;
