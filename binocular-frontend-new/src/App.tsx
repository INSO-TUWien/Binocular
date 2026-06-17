import Config from './config.ts';
import { Icon } from './components/icon';
import TabController from './components/tabMenu/tabController/tabController.tsx';
import Tab from './components/tabMenu/tab/tab.tsx';
import appStyles from './app.module.scss';
import StatusBar from './components/statusBar/statusBar.tsx';
import TabMenuContent from './components/tabMenu/tabMenuContent/tabMenuContent.tsx';
import Dashboard from './components/dashboard/dashboard.tsx';
import TabSection from './components/tabMenu/tabSection/tabSection.tsx';
import DateRange from './components/tabs/parameters/dataRange/dateRange.tsx';
import ParametersGeneral from './components/tabs/parameters/parametersGeneral/parametersGeneral.tsx';
import VisualizationSelector from './components/tabs/visualizations/visualizationSelector/visualizationSelector.tsx';
import Authors from './components/tabs/authors/authors.tsx';
import TabControllerButton from './components/tabMenu/tabControllerButton/tabControllerButton.tsx';
import { type AppDispatch, type RootState, useAppDispatch } from './redux';
import { useSelector } from 'react-redux';
import { setParametersDateRange, setParametersGeneral } from './redux/reducer/parameters/parametersReducer.ts';
import { recalculateDataPluginColors } from './redux/reducer/settings/settingsReducer.ts';
import SprintView from './components/tabs/sprints/sprintView/sprintView.tsx';
import AddSprint from './components/tabs/sprints/addSprint/addSprint.tsx';
import { ExportType, setExportType } from './redux/reducer/export/exportReducer.ts';
import FileTree from './components/tabs/fileTree/fileTree.tsx';
import HelpGeneral from './components/tabs/help/helpGeneral/helpGeneral.tsx';
import HelpComponents from './components/tabs/help/helpComponents/helpComponents.tsx';
import DataPluginQuickSelect from './components/dataPluginQuickSelect/dataPluginQuickSelect.tsx';
import type { DatabaseSettingsDataPluginType } from './types/settings/databaseSettingsType.ts';
import { setAuthorsDataPluginId } from './redux/reducer/data/authorsReducer.ts';
import { setFilesDataPluginId } from './redux/reducer/data/filesReducer.ts';
import TabControllerButtonThemeSwitch from './components/tabMenu/tabControllerButtonThemeSwitch/tabControllerButtonThemeSwitch.tsx';
import { useEffect, useState } from 'react';
import DatabaseLoaders from './utils/databaseLoaders.ts';
import OverlayController from './components/overlayController/overlayController.tsx';
import { TabAlignment } from './types/general/tabType.ts';
import LayoutSelector from './components/tabs/layouts/layoutSelector/layoutSelector.tsx';
import { loadFileList } from './components/tabs/fileTree/utils/fileListUtilities.tsx';

function App() {
  // #v-ifdef PRE_CONFIGURE_DB=='pouchdb'
  console.log('BUILD WITH POUCHDB');
  // #v-endif

  const dispatch: AppDispatch = useAppDispatch();
  const parametersGeneral = useSelector((state: RootState) => state.parameters.parametersGeneral);
  const parametersDateRange = useSelector((state: RootState) => state.parameters.parametersDateRange);
  const availableDataPlugins = useSelector((state: RootState) => state.settings.database.dataPlugins);
  const authorsDataPluginId = useSelector((state: RootState) => state.authors.dataPluginId);
  const [authorsDataPlugin, setAuthorsDataPlugin] = useState();

  const settingsInitialized = useSelector((state: RootState) => state.settings.initialized);
  const dashboardInitialized = useSelector((state: RootState) => state.dashboard.initialized);
  const filesInitialized = useSelector((state: RootState) => state.files.initialized);

  useEffect(() => {
    setAuthorsDataPlugin(
      authorsDataPluginId !== undefined
        ? availableDataPlugins.find((dP: DatabaseSettingsDataPluginType) => dP.id === authorsDataPluginId)
        : undefined,
    );
  }, [authorsDataPluginId, availableDataPlugins]);

  const filesDataPluginId = useSelector((state: RootState) => state.files.dataPluginId);
  const filesDataPlugin =
    filesDataPluginId !== undefined
      ? availableDataPlugins.find((dP: DatabaseSettingsDataPluginType) => dP.id === filesDataPluginId)
      : undefined;
  const [theme, setTheme] = useState(
    () =>
      localStorage.getItem(`${Config.localStoragePrefix}theme`) ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'binocularDark' : 'binocularLight'),
  );

  useEffect(() => {
    // #v-ifdef PRE_CONFIGURE_DB=='pouchdb'
    DatabaseLoaders.loadJsonFilesToPouchDB(dispatch)
      .then(() => {
        console.log('POUCHDB LOADED');
      })
      .catch((error) => {
        console.log('ERROR LOADING POUCHDB');
        console.log(error);
      });
    // #v-endif
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const setupDialog: HTMLDialogElement = document.getElementById('setupDialog') as HTMLDialogElement;
    if (!setupDialog.open && (!settingsInitialized || !dashboardInitialized)) {
      setupDialog.showModal();
    }
  }, [settingsInitialized, dashboardInitialized]);

  useEffect(() => {
    if (!filesInitialized) {
      loadFileList(dispatch);
    }
  }, [filesInitialized]);

  return (
    <>
      <div className={appStyles.mainView}>
        <TabController appName={'Binocular'}>
          <TabControllerButtonThemeSwitch
            theme={theme}
            onChange={(theme: string) => {
              localStorage.setItem(`${Config.localStoragePrefix}theme`, theme);
              setTheme(theme);
              requestAnimationFrame(() => dispatch(recalculateDataPluginColors(theme)));
            }}></TabControllerButtonThemeSwitch>
          <TabControllerButton
            onClick={() => {
              dispatch(setExportType(ExportType.all));
              (document.getElementById('exportDialog') as HTMLDialogElement).showModal();
            }}
            icon={<Icon name="export" size="w-full h-full" />}
            name={'Export'}
            animation={'jump'}></TabControllerButton>
          <TabControllerButton
            onClick={() => {
              (document.getElementById('settingsDialog') as HTMLDialogElement).showModal();
            }}
            icon={<Icon name="settings" size="w-full h-full" />}
            name={'Settings'}
            animation={'rotate'}></TabControllerButton>
          <Tab displayName={'Parameters'} alignment={TabAlignment.top}>
            <TabSection name={'Date Range'}>
              <DateRange
                disabled={false}
                parametersDateRange={parametersDateRange}
                setParametersDateRange={(parametersDateRange) => dispatch(setParametersDateRange(parametersDateRange))}></DateRange>
            </TabSection>
            <TabSection name={'General'}>
              <ParametersGeneral
                disabled={false}
                parametersGeneral={parametersGeneral}
                setParametersGeneral={(parametersGeneral) => dispatch(setParametersGeneral(parametersGeneral))}></ParametersGeneral>
            </TabSection>
          </Tab>
          <Tab displayName={'Visualizations'} alignment={TabAlignment.top}>
            <TabSection name={'Visualization Selector'}>
              <VisualizationSelector></VisualizationSelector>
            </TabSection>
          </Tab>
          <Tab displayName={'Sprints'} alignment={TabAlignment.top}>
            <TabSection name={'Sprints'}>
              <SprintView></SprintView>
            </TabSection>
            <TabSection name={'Add Sprint'}>
              <AddSprint></AddSprint>
            </TabSection>
          </Tab>
          <Tab displayName={'Layouts'} alignment={TabAlignment.top}>
            <TabSection name={'Layouts Selector'}>
              <LayoutSelector></LayoutSelector>
            </TabSection>
          </Tab>
          <Tab displayName={'Authors'} alignment={TabAlignment.right}>
            <TabSection name={'Database'}>
              <DataPluginQuickSelect
                selected={authorsDataPlugin}
                onChange={(selectedDataPlugin: DatabaseSettingsDataPluginType) => {
                  if (selectedDataPlugin.id !== undefined) {
                    dispatch(setAuthorsDataPluginId(selectedDataPlugin.id));
                  }
                }}></DataPluginQuickSelect>
            </TabSection>
            <TabSection name={'Authors'}>
              <Authors></Authors>
            </TabSection>
          </Tab>
          <Tab displayName={'File Tree'} alignment={TabAlignment.right}>
            <TabSection name={'Database'}>
              <DataPluginQuickSelect
                selected={filesDataPlugin}
                onChange={(selectedDataPlugin: DatabaseSettingsDataPluginType) => {
                  if (selectedDataPlugin.id !== undefined) {
                    dispatch(setFilesDataPluginId(selectedDataPlugin.id));
                  }
                }}></DataPluginQuickSelect>
            </TabSection>
            <TabSection name={'File Tree'}>
              <FileTree></FileTree>
            </TabSection>
          </Tab>
          <Tab displayName={'Help'} alignment={TabAlignment.right}>
            <TabSection name={'General'}>
              <HelpGeneral></HelpGeneral>
            </TabSection>
            <TabSection name={'Components'}>
              <HelpComponents></HelpComponents>
            </TabSection>
          </Tab>
          <TabMenuContent>
            <Dashboard></Dashboard>
          </TabMenuContent>
        </TabController>
      </div>
      <div className={appStyles.statusBar}>
        <StatusBar></StatusBar>
      </div>
      <div>
        <OverlayController></OverlayController>
      </div>
    </>
  );
}

export default App;
