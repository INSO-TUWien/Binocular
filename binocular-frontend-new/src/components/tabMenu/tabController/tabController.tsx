import React, { type ReactElement, useEffect, useState } from 'react';
import tabControllerStyles from './tabController.module.scss';
import tabHandleStyles from './tabHandle.module.scss';
import TabDropHint from './tabDropHint/tabDropHint.tsx';
import Tab, { type TabProps } from '../tab/tab.tsx';
import TabMenuContent from '../tabMenuContent/tabMenuContent.tsx';
import TabControllerButton from '../tabControllerButton/tabControllerButton.tsx';
import { TabAlignment, type TabType } from '../../../types/general/tabType.ts';
import { type AppDispatch, type RootState, useAppDispatch } from '../../../redux';
import { useSelector } from 'react-redux';
import { setTabList } from '../../../redux/reducer/general/tabsReducer.ts';
import _ from 'lodash';
import TabControllerButtonThemeSwitch from '../tabControllerButtonThemeSwitch/tabControllerButtonThemeSwitch.tsx';
import { type ContextMenuOption, showContextMenu } from '../../contextMenu/contextMenuHelper.ts';
import { ShowIcon } from '../../icon/icons/ShowIcon';
import { HideIcon } from '../../icon/icons/HideIcon';
import { ArrowUpIcon } from '../../icon/icons/ArrowUpIcon';
import { ArrowRightIcon } from '../../icon/icons/ArrowRightIcon';
import { ArrowDownIcon } from '../../icon/icons/ArrowDownIcon';
import { ArrowLeftIcon } from '../../icon/icons/ArrowLeftIcon';
import { DragDropElementType } from '../../../types/general/dragDropElementType.ts';
import { addNotification } from '../../../redux/reducer/general/notificationsReducer.ts';
import { AlertType } from '../../../types/general/alertType.ts';
import { placeDashboardItem } from '../../../redux/reducer/general/dashboardReducer.ts';
import { Icon } from '../../icon';

interface TabContents {
  [id: number]: ReactElement;
}

export interface TabElementType {
  name: string;
}

function TabController(props: {
  children: ReactElement<{ children: ReactElement[] | ReactElement; displayName: string; alignment: TabAlignment }>[];
  appName: string;
}) {
  const dispatch: AppDispatch = useAppDispatch();
  const tabList = useSelector((state: RootState) => state.tabs.tabList);

  const [tabContents, setTabContents] = useState<TabContents>({});

  const [dragState, setDragState] = useState(false);

  const [tabMenuContent] = useState(props.children.filter((child) => child.type === TabMenuContent)[0]);

  const tabBarTopCollapsed = tabList.filter((tab: TabType) => tab.alignment === TabAlignment.top && tab.selected).length === 0;
  const tabBarRightCollapsed = tabList.filter((tab: TabType) => tab.alignment === TabAlignment.right && tab.selected).length === 0;
  const tabBarBottomCollapsed = tabList.filter((tab: TabType) => tab.alignment === TabAlignment.bottom && tab.selected).length === 0;
  const tabBarLeftCollapsed = tabList.filter((tab: TabType) => tab.alignment === TabAlignment.left && tab.selected).length === 0;

  const tabCountRight = tabList.filter((tab: TabType) => tab.alignment === TabAlignment.right).length;
  const tabCountBottom = tabList.filter((tab: TabType) => tab.alignment === TabAlignment.bottom).length;
  const tabCountLeft = tabList.filter((tab: TabType) => tab.alignment === TabAlignment.left).length;

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
            console.log(event);
            const transferredData = JSON.parse(event.dataTransfer.getData('text/plain'));
            if (transferredData.dragDropElementType === DragDropElementType.Tab) {
              moveTab(transferredData.tabName, TabAlignment.top, tabList, (tabs) => dispatch(setTabList(tabs)), setDragState);
            }
          }}>
          <div className={tabControllerStyles.appName}>
            <Icon name="logo_text" className={'h-full w-auto'} />
          </div>

          {tabList
            .filter((tab: TabType) => tab.alignment === TabAlignment.top)
            .sort((tabA: TabType, tabB: TabType) => tabA.position - tabB.position)
            .map((tab: TabType) => generateHandle(tab, tabList, (tabs) => dispatch(setTabList(tabs)), setDragState, dispatch))}
        </div>
        <div
          id={'tabBarRight'}
          className={tabControllerStyles.tabBar + ' ' + tabControllerStyles.tabBarVertical + ' ' + tabControllerStyles.tabBarRight}
          style={{
            display: dragState || tabCountRight > 0 ? 'block' : 'none',
            top: `calc(${tabControllerStyles.tabBarThickness} + ${tabControllerStyles.tabContentThicknessHorizontal} * ${tabBarTopCollapsed ? 0 : 1} + 4px)`,
            height: `calc(100% - ${tabControllerStyles.tabContentThicknessHorizontal} * ${(tabBarTopCollapsed ? 0 : 1) + (tabBarBottomCollapsed ? 0 : 1)} - ${tabControllerStyles.tabBarThickness} * ${tabCountBottom > 0 ? 2 : 1} - 10px)`,
          }}
          onDragOver={(event) => {
            event.stopPropagation();
            event.preventDefault();
          }}
          onDrop={(event) => {
            const transferredData = JSON.parse(event.dataTransfer.getData('text/plain'));
            if (transferredData.dragDropElementType === DragDropElementType.Tab) {
              moveTab(transferredData.tabName, TabAlignment.right, tabList, (tabs) => dispatch(setTabList(tabs)), setDragState);
            }
          }}>
          {tabList
            .filter((tab: TabType) => tab.alignment === TabAlignment.right)
            .sort((tabA: TabType, tabB: TabType) => tabA.position - tabB.position)
            .map((tab: TabType) => generateHandle(tab, tabList, (tabs) => dispatch(setTabList(tabs)), setDragState, dispatch))}
        </div>
        <div
          id={'tabBarBottom'}
          className={tabControllerStyles.tabBar + ' ' + tabControllerStyles.tabBarHorizontal + ' ' + tabControllerStyles.tabBarBottom}
          style={{
            display: dragState || tabCountBottom > 0 ? 'block' : 'none',
          }}
          onDragOver={(event) => {
            event.stopPropagation();
            event.preventDefault();
          }}
          onDrop={(event) => {
            const transferredData = JSON.parse(event.dataTransfer.getData('text/plain'));
            if (transferredData.dragDropElementType === DragDropElementType.Tab) {
              moveTab(transferredData.tabName, TabAlignment.bottom, tabList, (tabs) => dispatch(setTabList(tabs)), setDragState);
            }
          }}>
          {tabList
            .filter((tab: TabType) => tab.alignment === TabAlignment.bottom)
            .sort((tabA: TabType, tabB: TabType) => tabA.position - tabB.position)
            .map((tab: TabType) => generateHandle(tab, tabList, (tabs) => dispatch(setTabList(tabs)), setDragState, dispatch))}
        </div>
        <div
          id={'tabBarLeft'}
          className={tabControllerStyles.tabBar + ' ' + tabControllerStyles.tabBarVertical + ' ' + tabControllerStyles.tabBarLeft}
          style={{
            display: dragState || tabCountLeft > 0 ? 'block' : 'none',
            top: `calc(${tabControllerStyles.tabBarThickness} + ${tabControllerStyles.tabContentThicknessHorizontal} * ${tabBarTopCollapsed ? 0 : 1} + 4px)`,
            height: `calc(100% - ${tabControllerStyles.tabContentThicknessHorizontal} * ${(tabBarTopCollapsed ? 0 : 1) + (tabBarBottomCollapsed ? 0 : 1)} - ${tabControllerStyles.tabBarThickness} * ${tabCountBottom > 0 ? 2 : 1} - 10px)`,
          }}
          onDragOver={(event) => {
            event.stopPropagation();
            event.preventDefault();
          }}
          onDrop={(event) => {
            const transferredData = JSON.parse(event.dataTransfer.getData('text/plain'));
            if (transferredData.dragDropElementType === DragDropElementType.Tab) {
              moveTab(transferredData.tabName, TabAlignment.left, tabList, (tabs) => dispatch(setTabList(tabs)), setDragState);
            }
          }}>
          {tabList
            .filter((tab: TabType) => tab.alignment === TabAlignment.left)
            .sort((tabA: TabType, tabB: TabType) => tabA.position - tabB.position)
            .map((tab: TabType) => generateHandle(tab, tabList, (tabs) => dispatch(setTabList(tabs)), setDragState, dispatch))}
        </div>
      </>
      <>
        {/*Content for all tabs. Here all the content for all active tabs get rendered */}
        <div className={tabControllerStyles.tabContentTop + (tabBarTopCollapsed ? ' ' + tabControllerStyles.tabContentCollapsed : '')}>
          {
            tabList
              .filter((tab: TabType) => tab.alignment === TabAlignment.top && tab.selected)
              .map((tab: TabType, i: number) => {
                if (tabContents[tab.contentID] === undefined) {
                  return;
                }
                return (
                  <Tab key={'tabTop' + i} displayName={tab.displayName} alignment={TabAlignment.top}>
                    {(tabContents[tab.contentID].props as TabProps).children}
                  </Tab>
                );
              })[0]
          }
        </div>
        <div
          className={tabControllerStyles.tabContentRight + (tabBarRightCollapsed ? ' ' + tabControllerStyles.tabContentCollapsed : '')}
          style={{
            top: `calc(${tabControllerStyles.tabBarThickness} + ${tabControllerStyles.tabContentThicknessHorizontal} * ${tabBarTopCollapsed ? 0 : 1} + 4px)`,
            height: `calc(100% - ${tabControllerStyles.tabContentThicknessHorizontal} * ${(tabBarTopCollapsed ? 0 : 1) + (tabBarBottomCollapsed ? 0 : 1)} - ${tabControllerStyles.tabBarThickness} * ${tabCountBottom > 0 ? 2 : 1} - 10px)`,
          }}>
          {
            tabList
              .filter((tab: TabType) => tab.alignment === TabAlignment.right && tab.selected)
              .map((tab: TabType, i: number) => {
                if (tabContents[tab.contentID] === undefined) {
                  return;
                }
                return (
                  <Tab key={'tabRight' + i} displayName={tab.displayName} alignment={TabAlignment.right}>
                    {(tabContents[tab.contentID].props as TabProps).children}
                  </Tab>
                );
              })[0]
          }
        </div>
        <div
          className={tabControllerStyles.tabContentBottom + (tabBarBottomCollapsed ? ' ' + tabControllerStyles.tabContentCollapsed : '')}>
          {
            tabList
              .filter((tab: TabType) => tab.alignment === TabAlignment.bottom && tab.selected)
              .map((tab: TabType, i: number) => {
                if (tabContents[tab.contentID] === undefined) {
                  return;
                }
                return (
                  <Tab key={'tabBottom' + i} displayName={tab.displayName} alignment={TabAlignment.bottom}>
                    {(tabContents[tab.contentID].props as TabProps).children}
                  </Tab>
                );
              })[0]
          }
        </div>
        <div
          className={tabControllerStyles.tabContentLeft + (tabBarLeftCollapsed ? ' ' + tabControllerStyles.tabContentCollapsed : '')}
          style={{
            top: `calc(${tabControllerStyles.tabBarThickness} + ${tabControllerStyles.tabContentThicknessHorizontal} * ${tabBarTopCollapsed ? 0 : 1} + 4px)`,
            height: `calc(100% - ${tabControllerStyles.tabContentThicknessHorizontal} * ${(tabBarTopCollapsed ? 0 : 1) + (tabBarBottomCollapsed ? 0 : 1)} - ${tabControllerStyles.tabBarThickness} * ${tabCountBottom > 0 ? 2 : 1} - 10px)`,
          }}>
          {
            tabList
              .filter((tab: TabType) => tab.alignment === TabAlignment.left && tab.selected)
              .map((tab: TabType, i: number) => {
                if (tabContents[tab.contentID] === undefined) {
                  return;
                }
                return (
                  <Tab key={'tabLeft' + i} displayName={tab.displayName} alignment={TabAlignment.left}>
                    {(tabContents[tab.contentID].props as TabProps).children}
                  </Tab>
                );
              })[0]
          }
        </div>
      </>
      <>
        {/*Additional Buttons. Here additional buttons like Settings or export get rendered that get displayed in the top right corner */}
        <div className={tabControllerStyles.tabBar + ' ' + tabControllerStyles.tabBarHorizontal + ' ' + tabControllerStyles.tabBarTopRight}>
          {props.children.filter(
            (child) =>
              React.isValidElement(child) &&
              ((child.type as TabElementType).name === TabControllerButton.name ||
                (child.type as TabElementType).name === TabControllerButtonThemeSwitch.name),
          )}
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
    alignment: TabAlignment;
  }>[],
): [TabType[], TabContents] {
  const firstFound = [false, false, false, false];
  let tabOrder = 0;

  let id = 0;
  const tabContents: TabContents = {};
  const tabList = children
    .filter((child) => React.isValidElement(child) && (child.type as TabElementType).name === Tab.name)
    .map((tab) => {
      const selected =
        (tab.props.alignment === TabAlignment.top && !firstFound[0]) ||
        (tab.props.alignment === TabAlignment.right && !firstFound[1]) ||
        (tab.props.alignment === TabAlignment.bottom && !firstFound[2]) ||
        (tab.props.alignment === TabAlignment.left && !firstFound[3]);
      if (selected) {
        switch (tab.props.alignment) {
          case TabAlignment.right:
            firstFound[1] = true;
            break;
          case TabAlignment.bottom:
            firstFound[2] = true;
            break;
          case TabAlignment.left:
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

function changeTabVisibility(listTab: TabType, tab: TabType, visibility: boolean) {
  const localListTab = _.clone(listTab); //necessary because of reducer behavior of making ListTab read-only
  if (localListTab.alignment === tab.alignment) {
    if (localListTab.displayName === tab.displayName) {
      localListTab.selected = visibility;
      document.getElementById('tab_' + localListTab.displayName)?.classList.add(tabHandleStyles.tabHandleSelected);
    } else {
      localListTab.selected = false;
      document.getElementById('tab_' + localListTab.displayName)?.classList.remove(tabHandleStyles.tabHandleSelected);
    }
  }
  return localListTab;
}

/**
 * Helper Function to generate the click and draggable handle of each tab
 * @param tab Tab object that includes all necessary information about a tab
 * @param tabList List of all tabs
 * @param setTabList Set reducer function for a list of all tabs
 * @param setDragState Set reducer Function for drag and drop reducer of tabs
 * @param dispatch AppDispatch
 */
function generateHandle(
  tab: TabType,
  tabList: TabType[],
  setTabList: (newTabList: TabType[]) => void,
  setDragState: (dragState: boolean) => void,
  dispatch: AppDispatch,
) {
  return (
    <div
      key={tab.displayName}
      draggable={true}
      id={'tab_' + tab.displayName}
      className={
        (tab.alignment === TabAlignment.left || tab.alignment === TabAlignment.right
          ? tabHandleStyles.tabHandle + ' ' + tabHandleStyles.tabHandleVertical
          : tabHandleStyles.tabHandle) +
        (tab.selected
          ? ' ' +
            (tab.alignment === TabAlignment.right
              ? tabHandleStyles.tabHandleSelectedVertical
              : tab.alignment === TabAlignment.bottom
                ? tabHandleStyles.tabHandleSelectedBottom
                : tab.alignment === TabAlignment.left
                  ? tabHandleStyles.tabHandleSelectedVertical
                  : tabHandleStyles.tabHandleSelectedTop)
          : '')
      }
      onClick={() => {
        setTabList(tabList.map((listTab) => changeTabVisibility(listTab, tab, !listTab.selected)));
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();

        const contextMenuOptions: ContextMenuOption[] = [];
        if (tab.selected) {
          contextMenuOptions.push({
            label: 'hide',
            icon: HideIcon,
            function: () => setTabList(tabList.map((listTab) => changeTabVisibility(listTab, tab, false))),
          });
        } else {
          contextMenuOptions.push({
            label: 'show',
            icon: ShowIcon,
            function: () => setTabList(tabList.map((listTab) => changeTabVisibility(listTab, tab, true))),
          });
        }

        const contextMenuOptionMoveTop: ContextMenuOption = {
          label: 'move to top',
          icon: ArrowUpIcon,
          function: () => moveTab(tab.displayName, TabAlignment.top, tabList, setTabList, setDragState),
        };

        const contextMenuOptionMoveRight: ContextMenuOption = {
          label: 'move to right',
          icon: ArrowRightIcon,
          function: () => moveTab(tab.displayName, TabAlignment.right, tabList, setTabList, setDragState),
        };

        const contextMenuOptionMoveBottom: ContextMenuOption = {
          label: 'move to bottom',
          icon: ArrowDownIcon,
          function: () => moveTab(tab.displayName, TabAlignment.bottom, tabList, setTabList, setDragState),
        };

        const contextMenuOptionMoveLeft: ContextMenuOption = {
          label: 'move to left',
          icon: ArrowLeftIcon,
          function: () => moveTab(tab.displayName, TabAlignment.left, tabList, setTabList, setDragState),
        };

        switch (tab.alignment) {
          case TabAlignment.top:
            contextMenuOptions.push(contextMenuOptionMoveRight);
            contextMenuOptions.push(contextMenuOptionMoveBottom);
            contextMenuOptions.push(contextMenuOptionMoveLeft);
            break;
          case TabAlignment.right:
            contextMenuOptions.push(contextMenuOptionMoveTop);
            contextMenuOptions.push(contextMenuOptionMoveBottom);
            contextMenuOptions.push(contextMenuOptionMoveLeft);
            break;
          case TabAlignment.bottom:
            contextMenuOptions.push(contextMenuOptionMoveTop);
            contextMenuOptions.push(contextMenuOptionMoveRight);
            contextMenuOptions.push(contextMenuOptionMoveLeft);
            break;
          case TabAlignment.left:
            contextMenuOptions.push(contextMenuOptionMoveTop);
            contextMenuOptions.push(contextMenuOptionMoveRight);
            contextMenuOptions.push(contextMenuOptionMoveBottom);
            break;
          default:
            break;
        }

        showContextMenu(e.clientX, e.clientY, contextMenuOptions);
      }}
      onDragStart={(event) => {
        console.log(`Dragging: ${tab.displayName}`);
        setDragState(true);
        event.dataTransfer.clearData();
        event.dataTransfer.setData(
          'text/plain',
          JSON.stringify({ dragDropElementType: DragDropElementType.Tab, tabName: tab.displayName }),
        );
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
        const transferredData = JSON.parse(event.dataTransfer.getData('text/plain'));
        if (transferredData.dragDropElementType === DragDropElementType.Tab) {
          switchTabs(transferredData.tabName, tab.displayName, tabList, setTabList, setDragState);
        } else {
          dispatch(placeDashboardItem(undefined));
          dispatch(
            addNotification({
              text: `Dropped Item not a Tab!`,
              type: AlertType.error,
            }),
          );
        }
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
  alignment: TabAlignment,
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
        return { ...listTab, alignment: targetTab.alignment, position: targetTab.position, selected: targetTab.selected };
      }
      if (listTab.displayName === targetTabName) {
        return { ...listTab, alignment: tab.alignment, position: tab.position, selected: tab.selected };
      }
      return listTab;
    }),
  );
}

export default TabController;
