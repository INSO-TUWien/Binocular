import { ReactElement, useEffect, useState } from 'react';
import tabControllerStyles from './tabController.module.scss';
import tabHandleStyles from './tabHandle.module.scss';
import TabDropHint from './tabDropHint/tabDropHint.tsx';
import Tab from '../tab/tab.tsx';
import TabMenuContent from '../tabMenuContent/tabMenuContent.tsx';
import TabControllerButton from '../tabControllerButton/tabControllerButton.tsx';
import { TabType } from '../../../types/general/tabType.ts';
import { AppDispatch, RootState, useAppDispatch } from '../../../redux';
import { useSelector } from 'react-redux';
import { setTabList } from '../../../redux/general/tabsReducer.ts';
import _ from 'lodash';

interface TabContents {
  [id: number]: ReactElement;
}

function TabController(props: {
  children: ReactElement<{ children: ReactElement[] | ReactElement; displayName: string; alignment: string }>[];
  appName: string;
}) {
  const dispatch: AppDispatch = useAppDispatch();
  const tabList = useSelector((state: RootState) => state.tabs.tabList);

  const [tabContents, setTabContents] = useState<TabContents>({});

  const [dragState, setDragState] = useState(false);

  const [tabMenuContent] = useState(props.children.filter((child) => child.type === TabMenuContent)[0]);

  const tabBarTopCollapsed = tabList.filter((tab: TabType) => tab.alignment === 'top' && tab.selected).length === 0;
  const tabBarRightCollapsed = tabList.filter((tab: TabType) => tab.alignment === 'right' && tab.selected).length === 0;
  const tabBarBottomCollapsed = tabList.filter((tab: TabType) => tab.alignment === 'bottom' && tab.selected).length === 0;
  const tabBarLeftCollapsed = tabList.filter((tab: TabType) => tab.alignment === 'left' && tab.selected).length === 0;

  const tabCountRight = tabList.filter((tab: TabType) => tab.alignment === 'right').length;
  const tabCountBottom = tabList.filter((tab: TabType) => tab.alignment === 'bottom').length;
  const tabCountLeft = tabList.filter((tab: TabType) => tab.alignment === 'left').length;

  useEffect(() => {
    const [newTabList, tabContents] = generateTabs(props.children);
    setTabContents(tabContents);
    if (tabList.length !== newTabList.length) {
      dispatch(setTabList(newTabList));
    }
  }, [props.children]);

  /*
  The Tab view gets rendered in a 3-part process.
  At first, the backgrounds for every side get rendered depending on if the sides have an active tab selected.
  Next, all the handles for each tab are getting generated.
  Last the content for the active tabs is getting rendered above the backgrounds.
  This is necessary because the Handles overlap the backgrounds,
  but the content of each tab overlaps the handles,
  so the content cant be rendered as part of the backgrounds directly.
   */

  return (
    <div className={tabControllerStyles.tabController}>
      <TabDropHint dragState={dragState}></TabDropHint>
      <>
        <div
          className={tabControllerStyles.content}
          style={{
            top: `calc(${tabControllerStyles.tabBarThickness} + ${tabControllerStyles.tabContentThicknessHorizontal} * ${tabBarTopCollapsed ? 0 : 1} + 4px)`,
            left: `calc(${tabControllerStyles.tabBarThickness} * ${tabCountLeft > 0 || dragState ? 1 : 0} + ${tabControllerStyles.tabContentThicknessVertical} * ${tabBarLeftCollapsed ? 0 : 1} + 4px)`,
            height: `calc(100% - ${tabControllerStyles.tabContentThicknessHorizontal} * ${(tabBarTopCollapsed ? 0 : 1) + (tabBarBottomCollapsed ? 0 : 1)} - ${tabControllerStyles.tabBarThickness} * ${tabCountBottom > 0 || dragState ? 2 : 1} - 10px)`,
            width: `calc(100% -  ${tabControllerStyles.tabContentThicknessVertical} * ${(tabBarLeftCollapsed ? 0 : 1) + (tabBarRightCollapsed ? 0 : 1)} - ${tabControllerStyles.tabBarThickness} * ${(tabCountLeft > 0 || dragState ? 1 : 0) + (tabCountRight > 0 || dragState ? 1 : 0)} - 8px)`,
          }}>
          {tabMenuContent}
        </div>
      </>
      <>
        {/*Background for all tabs. This has to be rendered before the tab handle for each tab and the content for each tab*/}
        <div
          className={
            tabControllerStyles.tabContentBackgroundTop + (tabBarTopCollapsed ? ' ' + tabControllerStyles.tabContentCollapsed : '')
          }></div>
        <div
          className={
            tabControllerStyles.tabContentBackgroundRight + (tabBarRightCollapsed ? ' ' + tabControllerStyles.tabContentCollapsed : '')
          }
          style={{
            top: `calc(${tabControllerStyles.tabBarThickness} + ${tabControllerStyles.tabContentThicknessHorizontal} * ${tabBarTopCollapsed ? 0 : 1} + 4px)`,
            height: `calc(100% - ${tabControllerStyles.tabContentThicknessHorizontal} * ${(tabBarTopCollapsed ? 0 : 1) + (tabBarBottomCollapsed ? 0 : 1)} - ${tabControllerStyles.tabBarThickness} * ${tabCountBottom > 0 ? 2 : 1} - 10px)`,
          }}></div>
        <div
          className={
            tabControllerStyles.tabContentBackgroundBottom + (tabBarBottomCollapsed ? ' ' + tabControllerStyles.tabContentCollapsed : '')
          }></div>
        <div
          className={
            tabControllerStyles.tabContentBackgroundLeft + (tabBarLeftCollapsed ? ' ' + tabControllerStyles.tabContentCollapsed : '')
          }
          style={{
            top: `calc(${tabControllerStyles.tabBarThickness} + ${tabControllerStyles.tabContentThicknessHorizontal} * ${tabBarTopCollapsed ? 0 : 1} + 4px)`,
            height: `calc(100% - ${tabControllerStyles.tabContentThicknessHorizontal} * ${(tabBarTopCollapsed ? 0 : 1) + (tabBarBottomCollapsed ? 0 : 1)} - ${tabControllerStyles.tabBarThickness} * ${tabCountBottom > 0 ? 2 : 1} - 10px)`,
          }}></div>
      </>
      <>
        {/*Handles for all tabs. Here all the handles for all the tabs get rendered */}
        <div
          id={'tabBarTop'}
          className={tabControllerStyles.tabBar + ' ' + tabControllerStyles.tabBarHorizontal + ' ' + tabControllerStyles.tabBarTop}
          onDragOver={(event) => {
            event.stopPropagation();
            event.preventDefault();
          }}
          onDrop={(event) => {
            moveTab(event.dataTransfer.getData('text/plain'), 'top', tabList, (tabs) => dispatch(setTabList(tabs)), setDragState);
          }}>
          <div className={tabControllerStyles.appName}>{props.appName}</div>

          {tabList
            .filter((tab: TabType) => tab.alignment === 'top')
            .sort((tabA: TabType, tabB: TabType) => tabA.position - tabB.position)
            .map((tab: TabType) => generateHandle(tab, tabList, (tabs) => dispatch(setTabList(tabs)), setDragState))}
        </div>
        <div
          id={'tabBarRight'}
          className={tabControllerStyles.tabBar + ' ' + tabControllerStyles.tabBarVertical + ' ' + tabControllerStyles.tabBarRight}
          style={{
            top: `calc(${tabControllerStyles.tabBarThickness} + ${tabControllerStyles.tabContentThicknessHorizontal} * ${tabBarTopCollapsed ? 0 : 1} + 4px)`,
            height: `calc(100% - ${tabControllerStyles.tabContentThicknessHorizontal} * ${(tabBarTopCollapsed ? 0 : 1) + (tabBarBottomCollapsed ? 0 : 1)} - ${tabControllerStyles.tabBarThickness} * ${tabCountBottom > 0 ? 2 : 1} - 10px)`,
          }}
          onDragOver={(event) => {
            event.stopPropagation();
            event.preventDefault();
          }}
          onDrop={(event) => {
            moveTab(event.dataTransfer.getData('text/plain'), 'right', tabList, (tabs) => dispatch(setTabList(tabs)), setDragState);
          }}>
          {tabList
            .filter((tab: TabType) => tab.alignment === 'right')
            .sort((tabA: TabType, tabB: TabType) => tabA.position - tabB.position)
            .map((tab: TabType) => generateHandle(tab, tabList, (tabs) => dispatch(setTabList(tabs)), setDragState))}
        </div>
        <div
          id={'tabBarBottom'}
          className={tabControllerStyles.tabBar + ' ' + tabControllerStyles.tabBarHorizontal + ' ' + tabControllerStyles.tabBarBottom}
          onDragOver={(event) => {
            event.stopPropagation();
            event.preventDefault();
          }}
          onDrop={(event) => {
            moveTab(event.dataTransfer.getData('text/plain'), 'bottom', tabList, (tabs) => dispatch(setTabList(tabs)), setDragState);
          }}>
          {tabList
            .filter((tab: TabType) => tab.alignment === 'bottom')
            .sort((tabA: TabType, tabB: TabType) => tabA.position - tabB.position)
            .map((tab: TabType) => generateHandle(tab, tabList, (tabs) => dispatch(setTabList(tabs)), setDragState))}
        </div>
        <div
          id={'tabBarLeft'}
          className={tabControllerStyles.tabBar + ' ' + tabControllerStyles.tabBarVertical + ' ' + tabControllerStyles.tabBarLeft}
          style={{
            top: `calc(${tabControllerStyles.tabBarThickness} + ${tabControllerStyles.tabContentThicknessHorizontal} * ${tabBarTopCollapsed ? 0 : 1} + 4px)`,
            height: `calc(100% - ${tabControllerStyles.tabContentThicknessHorizontal} * ${(tabBarTopCollapsed ? 0 : 1) + (tabBarBottomCollapsed ? 0 : 1)} - ${tabControllerStyles.tabBarThickness} * ${tabCountBottom > 0 ? 2 : 1} - 10px)`,
          }}
          onDragOver={(event) => {
            event.stopPropagation();
            event.preventDefault();
          }}
          onDrop={(event) => {
            moveTab(event.dataTransfer.getData('text/plain'), 'left', tabList, (tabs) => dispatch(setTabList(tabs)), setDragState);
          }}>
          {tabList
            .filter((tab: TabType) => tab.alignment === 'left')
            .sort((tabA: TabType, tabB: TabType) => tabA.position - tabB.position)
            .map((tab: TabType) => generateHandle(tab, tabList, (tabs) => dispatch(setTabList(tabs)), setDragState))}
        </div>
      </>
      <>
        {/*Content for all tabs. Here all the content for all active tabs get rendered */}
        <div className={tabControllerStyles.tabContentTop + (tabBarTopCollapsed ? ' ' + tabControllerStyles.tabContentCollapsed : '')}>
          {
            tabList
              .filter((tab: TabType) => tab.alignment === 'top' && tab.selected)
              .map((tab: TabType, i: number) => {
                if (tabContents[tab.contentID] === undefined) {
                  return;
                }
                return (
                  <Tab key={'tabTop' + i} displayName={tab.displayName} alignment={'top'}>
                    {tabContents[tab.contentID].props.children}
                  </Tab>
                );
              })[0]
          }
        </div>
        <div
          className={tabControllerStyles.tabContentRight + (tabBarRightCollapsed ? ' ' + tabControllerStyles.tabContentCollapsed : '')}
          style={{
            top: tabBarTopCollapsed
              ? tabControllerStyles.tabBarThickness
              : `calc(${tabControllerStyles.tabBarThickness} + ${tabControllerStyles.tabContentThicknessHorizontal} + 4px)`,
            height: tabBarTopCollapsed
              ? `calc(100% - 4px - ${tabControllerStyles.tabBarThickness} * 2)`
              : tabBarBottomCollapsed
                ? `calc(calc(100% - 4px  - ${tabControllerStyles.tabBarThickness} * 2 - ${tabControllerStyles.tabContentThicknessHorizontal})`
                : `calc(calc(100% - 4px  - ${tabControllerStyles.tabBarThickness} * 2 - ${tabControllerStyles.tabContentThicknessHorizontal} * 2)`,
          }}>
          {
            tabList
              .filter((tab: TabType) => tab.alignment === 'right' && tab.selected)
              .map((tab: TabType, i: number) => {
                if (tabContents[tab.contentID] === undefined) {
                  return;
                }
                return (
                  <Tab key={'tabRight' + i} displayName={tab.displayName} alignment={'right'}>
                    {tabContents[tab.contentID].props.children}
                  </Tab>
                );
              })[0]
          }
        </div>
        <div
          className={tabControllerStyles.tabContentBottom + (tabBarBottomCollapsed ? ' ' + tabControllerStyles.tabContentCollapsed : '')}>
          {
            tabList
              .filter((tab: TabType) => tab.alignment === 'bottom' && tab.selected)
              .map((tab: TabType, i: number) => {
                if (tabContents[tab.contentID] === undefined) {
                  return;
                }
                return (
                  <Tab key={'tabBottom' + i} displayName={tab.displayName} alignment={'bottom'}>
                    {tabContents[tab.contentID].props.children}
                  </Tab>
                );
              })[0]
          }
        </div>
        <div
          className={tabControllerStyles.tabContentLeft + (tabBarLeftCollapsed ? ' ' + tabControllerStyles.tabContentCollapsed : '')}
          style={{
            top: tabBarTopCollapsed
              ? tabControllerStyles.tabBarThickness
              : `calc(${tabControllerStyles.tabBarThickness} + ${tabControllerStyles.tabContentThicknessHorizontal} + 4px)`,
            height: tabBarTopCollapsed
              ? `calc(100% - 4px - ${tabControllerStyles.tabBarThickness} * 2)`
              : tabBarBottomCollapsed
                ? `calc(calc(100% - 4px  - ${tabControllerStyles.tabBarThickness} * 2 - ${tabControllerStyles.tabContentThicknessHorizontal})`
                : `calc(calc(100% - 4px  - ${tabControllerStyles.tabBarThickness} * 2 - ${tabControllerStyles.tabContentThicknessHorizontal} * 2)`,
          }}>
          {
            tabList
              .filter((tab: TabType) => tab.alignment === 'left' && tab.selected)
              .map((tab: TabType, i: number) => {
                if (tabContents[tab.contentID] === undefined) {
                  return;
                }
                return (
                  <Tab key={'tabLeft' + i} displayName={tab.displayName} alignment={'left'}>
                    {tabContents[tab.contentID].props.children}
                  </Tab>
                );
              })[0]
          }
        </div>
      </>
      <>
        {/*Additional Buttons. Here additional buttons like Settings or export get rendered that get displayed in the top right corner */}
        <div className={tabControllerStyles.tabBar + ' ' + tabControllerStyles.tabBarHorizontal + ' ' + tabControllerStyles.tabBarTopRight}>
          {props.children.filter((child) => child.type === TabControllerButton)}
        </div>
      </>
    </div>
  );
}

/**
 * Generates the tabs with all information necessary for further displaying
 * @param children list of children of the tab controller with when possible of the type Tab
 */
function generateTabs(
  children: React.ReactElement<{
    children: React.ReactElement[] | React.ReactElement;
    displayName: string;
    alignment: string;
  }>[],
): [TabType[], TabContents] {
  const firstFound = [false, false, false, false];
  let tabOrder = 0;

  let id = 0;
  const tabContents: TabContents = {};
  const tabList = children
    .filter((child) => child.type === Tab)
    .map((tab) => {
      const selected =
        (tab.props.alignment === 'top' && !firstFound[0]) ||
        (tab.props.alignment === 'right' && !firstFound[1]) ||
        (tab.props.alignment === 'bottom' && !firstFound[2]) ||
        (tab.props.alignment === 'left' && !firstFound[3]);
      if (selected) {
        switch (tab.props.alignment) {
          case 'right':
            firstFound[1] = true;
            break;
          case 'bottom':
            firstFound[2] = true;
            break;
          case 'left':
            firstFound[3] = true;
            break;
          default:
            firstFound[0] = true;
            break;
        }
      }
      id++;
      tabContents[id] = tab;
      return {
        displayName: tab.props.displayName,
        alignment: tab.props.alignment,
        selected: selected,
        contentID: id,
        position: tabOrder++,
      };
    });

  return [tabList, tabContents];
}

/**
 * Helper Function to generate the click and draggable handle of each tab
 * @param tab Tab object that includes all necessary information about a tab
 * @param tabList List of all tabs
 * @param setTabList Set reducer function for a list of all tabs
 * @param setDragState Set reducer Function for drag and drop reducer of tabs
 */
function generateHandle(
  tab: TabType,
  tabList: TabType[],
  setTabList: (newTabList: TabType[]) => void,
  setDragState: (dragState: boolean) => void,
) {
  return (
    <div
      key={tab.displayName}
      draggable={true}
      id={'tab_' + tab.displayName}
      className={
        (tab.alignment === 'left' || tab.alignment === 'right'
          ? tabHandleStyles.tabHandle + ' ' + tabHandleStyles.tabHandleVertical
          : tabHandleStyles.tabHandle) +
        (tab.selected
          ? ' ' +
            (tab.alignment === 'right'
              ? tabHandleStyles.tabHandleSelectedVertical
              : tab.alignment === 'bottom'
                ? tabHandleStyles.tabHandleSelectedBottom
                : tab.alignment === 'left'
                  ? tabHandleStyles.tabHandleSelectedVertical
                  : tabHandleStyles.tabHandleSelectedTop)
          : '')
      }
      onClick={() => {
        setTabList(
          tabList.map((listTab) => {
            const localListTab = _.clone(listTab); //necessary because of reducer behavior of making ListTab read-only
            if (localListTab.alignment === tab.alignment) {
              if (localListTab.displayName === tab.displayName) {
                localListTab.selected = !listTab.selected;
                document.getElementById('tab_' + localListTab.displayName)?.classList.add(tabHandleStyles.tabHandleSelected);
              } else {
                localListTab.selected = false;
                document.getElementById('tab_' + localListTab.displayName)?.classList.remove(tabHandleStyles.tabHandleSelected);
              }
            }
            return localListTab;
          }),
        );
      }}
      onDragStart={(event) => {
        console.log(`Dragging: ${tab.displayName}`);
        setDragState(true);
        event.dataTransfer.clearData();
        event.dataTransfer.setData('text/plain', tab.displayName);
      }}
      onDragEnd={(event) => {
        setDragState(false);
        event.dataTransfer.clearData();
      }}
      onDragOver={(event) => {
        event.stopPropagation();
        event.preventDefault();
      }}
      onDragEnter={() => {
        document.getElementById('tab_' + tab.displayName)?.classList.add(tabHandleStyles.tabHandleSwitch);
      }}
      onDragLeave={() => {
        document.getElementById('tab_' + tab.displayName)?.classList.remove(tabHandleStyles.tabHandleSwitch);
      }}
      onDrop={(event) => {
        event.stopPropagation();
        document.getElementById('tab_' + tab.displayName)?.classList.remove(tabHandleStyles.tabHandleSwitch);
        switchTabs(event.dataTransfer.getData('text/plain'), tab.displayName, tabList, setTabList, setDragState);
      }}>
      {tab.displayName}
    </div>
  );
}

/**
 * Moves the tab to a different side
 * @param name Name of the tab
 * @param alignment New alignment of the tab
 * @param tabList List of all tabs
 * @param setTabList Set reducer function for a list of all tabs
 * @param setDragState Set reducer Function for drag and drop reducer of tabs
 */
function moveTab(
  name: string,
  alignment: string,
  tabList: TabType[],
  setTabList: (newTabList: TabType[]) => void,
  setDragState: (dragState: boolean) => void,
) {
  console.log(`Moving tab ${name} to ${alignment}`);
  setDragState(false);
  setTabList(
    tabList.map((tab) => {
      const localTab = _.clone(tab); //necessary because of reducer behavior of making ListTab read-only
      if (localTab.alignment === alignment) {
        localTab.selected = false;
      }
      if (localTab.displayName === name) {
        localTab.alignment = alignment;
        localTab.selected = true;
      }
      return localTab;
    }),
  );
}

/**
 * Switches two tabs with each other
 * @param name Name of the tab that is switched
 * @param targetTabName Name of the other tab with whom the first tab is switched
 * @param tabList List of all tabs
 * @param setTabList Set reducer function for a list of all tabs
 * @param setDragState Set reducer Function for drag and drop reducer of tabs
 */
function switchTabs(
  name: string,
  targetTabName: string,
  tabList: TabType[],
  setTabList: (newTabList: TabType[]) => void,
  setDragState: (dragState: boolean) => void,
) {
  console.log(`Switching tab ${name} with ${targetTabName}`);
  setDragState(false);
  const tab = { ...tabList.filter((t) => t.displayName === name)[0] };
  const targetTab = { ...tabList.filter((t) => t.displayName === targetTabName)[0] };

  setTabList(
    tabList.map((listTab) => {
      if (listTab.displayName === name) {
        listTab.alignment = targetTab.alignment;
        listTab.position = targetTab.position;
        listTab.selected = targetTab.selected;
      }
      if (listTab.displayName === targetTabName) {
        listTab.alignment = tab.alignment;
        listTab.position = tab.position;
        listTab.selected = tab.selected;
      }
      return listTab;
    }),
  );
}

export default TabController;
