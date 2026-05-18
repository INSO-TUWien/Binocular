# React Component Tests

**Framework**: Vitest + React Testing Library (`@testing-library/react`)
**Test environment**: jsdom
**Test ID convention**: `C{file_index}.{test_index}`

## Testing strategy per component type

| Type | Approach |
|---|---|
| Dumb/presentational | Render with props, assert DOM output and callback calls |
| Redux-connected | Wrap in `<Provider store={configureStore(...)}>`, dispatch actions, assert DOM |
| D3 components | Assert SVG container renders; skip internal D3 canvas details |
| Dialog/modal | Assert open/closed states, button interactions |

---

## C1 — `dataPluginQuickSelect`
**File**: `src/test/component/dataPluginQuickSelect/dataPluginQuickSelect.test.tsx`
**Source**: `src/components/dataPluginQuickSelect/dataPluginQuickSelect.tsx`

Redux-connected `<select>`. Reads `settings.database.dataPlugins`.

| # | Description | Setup | Expected |
|---|---|---|---|
| C1.1 | Renders a `<select>` element | store with plugins | `<select>` present |
| C1.2 | Renders one `<option>` per data plugin | store with 3 plugins | 3 option elements |
| C1.3 | Pre-selects the currently active plugin | `selected` prop matches plugin id | that option is selected |
| C1.4 | Calls `onChange` with the selected plugin when user picks | change select | `onChange` called with plugin object |
| C1.5 | Select is disabled when `dataPlugins` list is empty | store with `dataPlugins: []` | `<select disabled>` |
| C1.6 | Each option has background color from plugin palette | store with coloured plugins | `style` attribute on option contains color |

---

## C2 — `notificationController`
**File**: `src/test/component/notificationController/notificationController.test.tsx`
**Source**: `src/components/notificationController/notificationController.tsx`

Connected to `notificationsReducer`. Renders a toast list; each toast has an icon, text, and click-to-dismiss handler.

| # | Description | Setup | Expected |
|---|---|---|---|
| C2.1 | Renders nothing when notification list is empty | store with `notificationList: []` | no `[role="alert"]` elements |
| C2.2 | Renders one toast per notification | store with 2 notifications | 2 alert elements |
| C2.3 | Displays notification text | notification with `text: 'Build failed'` | `'Build failed'` visible |
| C2.4 | Renders correct indicator for `error` type | `type: AlertType.error` | alert has `alert-error` class |
| C2.5 | Renders correct indicator for `success` type | `type: AlertType.success` | alert has `alert-success` class |
| C2.6 | Renders correct indicator for `warning` type | `type: AlertType.warning` | alert has `alert-warning` class |
| C2.7 | Renders correct indicator for `info` type | `type: AlertType.information` | alert has `alert-info` class |
| C2.8 | Clicking a toast dispatches `removeNotification` after 1 s | click, advance timers 1.1 s | notification removed from store |
| C2.9 | Auto-dismisses after 10 seconds | dispatch notification, advance 11.1 s | notification removed from store |
| C2.10 | Multiple notifications dismissed independently | 2 toasts, click one | only that notification removed |

---

## C3 — `settingsDialog`
**File**: `src/test/component/settingsDialog/settingsDialog.test.tsx`
**Source**: `src/components/settingsDialog/settingsDialog.tsx`

Tab switcher with "General" and "Database" tabs.

| # | Description | Setup | Expected |
|---|---|---|---|
| C3.1 | "General" tab content is visible by default | render | General content present |
| C3.2 | "Database" tab content is hidden initially | render | Database content absent |
| C3.3 | Clicking "Database" tab shows Database content | click Database tab | Database content present |
| C3.4 | Clicking back to "General" tab hides Database content | switch to Database, click General | General visible, Database hidden |
| C3.5 | Active tab has visual indicator (`tab-active` class on General initially) | render | General tab element has `tab-active` class |

---

## C4 — `setupDialog`
**File**: `src/test/component/setupDialog/setupDialog.test.tsx`
**Source**: `src/components/setupDialog/setupDialog.tsx`

Multi-step wizard (pages 1–5: Start → Database → Authors → Dashboard → Summary). Uses local `page` state.

| # | Description | Setup | Expected |
|---|---|---|---|
| C4.1 | Renders page 1 (Start) by default | render | `page-start` testid present, `page-database` absent |
| C4.2 | Clicking "Next" advances to page 2 | render, click Next | `page-database` testid present |
| C4.3 | Clicking "Back" on page 2 returns to page 1 | advance to page 2, click Back | `page-start` testid present |
| C4.4 | "Back" button is absent on page 1 | render | no button with text `/back/i` |
| C4.5 | Clicking through all 5 pages reaches the Summary page | click Next 4 times | `page-summary` testid present |
| C4.6 | Clicking "Save" on last page dispatches `initializeDashboardState` | navigate to page 5, click Save | `store.getState().dashboard.initialized === true` |
| C4.7 | "Cancel" button is present | render | button with text `/cancel/i` in DOM |
| C4.8 | Progress indicator shows step elements for all 5 pages | render | `setupStep1`–`setupStep5` all in DOM |

---

## C5 — `StackedAreaChart`
**File**: `src/test/component/stackedAreaChart/StackedAreaChart.test.tsx`
**Source**: `src/components/stackedAreaChart/StackedAreaChart.tsx`

D3-driven visualization. Tests focus on mount/unmount and edge-case data, not D3 internals.

| # | Description | Setup | Expected |
|---|---|---|---|
| C5.1 | Renders an `<svg>` element | render with width/height/data | at least one `<svg>` in DOM |
| C5.2 | SVG has the supplied width and height | `width: 800, height: 400` | `svg[width]='800'`, `svg[height]='400'` |
| C5.3 | Does not throw for empty `data` array | `data: []` | no error thrown, `<svg>` present |
| C5.4 | Does not throw for empty `palette` | `palette: {}` | no error thrown |
| C5.5 | Renders some SVG structure (at least a `<g>` child) | render with valid data | `svg g` elements present |
| C5.6 | Unmounts cleanly (no uncaught exceptions) | render then `unmount()` | no throw |

---

## C6 — `stackedAreaChart/utils`
**File**: `src/test/component/stackedAreaChart/utils.test.ts`
**Source**: `src/components/stackedAreaChart/utils.ts`

Pure utility functions for the StackedAreaChart component.

### `splitPositiveNegativeData(data, side)`

| # | Description | Input | Expected output |
|---|---|---|---|
| C6.1 | POSITIVE side keeps positive values and zeroes out negatives | `{ a:10, b:-5 }`, POSITIVE | `a===10, b===0` |
| C6.2 | POSITIVE side keeps zero values (`0 >= 0`) | `{ c:0 }`, POSITIVE | `c===0` |
| C6.3 | NEGATIVE side keeps negative values and zeroes out positives | `{ a:10, b:-5 }`, NEGATIVE | `b===-5, a===0` |
| C6.4 | Preserves the `date` field on every row | any input | `result[0].date === input date` |
| C6.5 | Returns empty array for empty input | `[]` | `[]` |

### `getNonEmptyKeys(keys, data)`

| # | Description | Input | Expected output |
|---|---|---|---|
| C6.6 | Excludes keys where every value is 0 | key always 0 | key not in result |
| C6.7 | Includes keys with at least one value > 0.002 | key with value 1 | key in result |
| C6.8 | Threshold is exclusive: value 0.002 is still filtered | value exactly `0.002` | key excluded |
| C6.9 | Works for negative values (uses `Math.abs`) | key with value `-5` | key included |
| C6.10 | Returns empty when no keys provided | `[], data` | `[]` |

### `getClosestIndex(x, data, xScale)`

| # | Description | Input | Expected output |
|---|---|---|---|
| C6.11 | Returns 0 when x maps to a time before or equal to the first data point | `x=0` | `0` |
| C6.12 | Returns last index when x maps to the rightmost data point | `x=1000` | `data.length - 1` |
| C6.13 | Returns index of nearest data point for a midpoint x | `x=500`, 3-point data | valid index in `[0, length)` |
| C6.14 | Returns 0 for a single-entry dataset | 1-element data, `x=0` | `0` |

### `computeVisibleYDomain(data, brushDomain, palette)`

| # | Description | Input | Expected output |
|---|---|---|---|
| C6.15 | Returns `[0, 1]` when no data falls within the brush domain | brush outside all dates | `[0, 1]` |
| C6.16 | Max of returned domain exceeds the largest stacked positive value | `a:20, b:15` | `max > 35` |
| C6.17 | Min is less than 0 when data has negative values | `a: -10` | `min < 0` |
| C6.18 | Uses padding of 1 when all values are below the visibility threshold (range = 0) | values `0.001` (filtered out) | `max - min ≈ 2` |

---

## C7 — `tabContent/fileListFile` (`FileTreeFile`)
**File**: `src/test/component/tabContent/fileListFile.test.tsx`
**Source**: `src/components/fileTree/fileTreeElements/fileTreeFile/fileTreeFile.tsx`

File entry component in the file tree. Tests checkbox visibility, dispatch of `updateFileListElement`, and `showFileTreeElementInfo`.

| # | Description | Setup | Expected |
|---|---|---|---|
| C7.1 | Renders the file name | `file.name: 'foo.ts'` | `'foo.ts'` visible |
| C7.2 | Checkbox is checked when `file.checked` is true | `checked: true`, `showSelect: true` | checkbox is checked |
| C7.3 | Checkbox is unchecked when `file.checked` is false | `checked: false`, `showSelect: true` | checkbox is unchecked |
| C7.4 | Clicking checkbox calls `onElementSelectionChange` which dispatches `updateFileListElement` | `showSelect: true`; click checkbox | file's `checked` state toggled in store |
| C7.5 | With `showSelect: true` and no `listOnly`, checkbox is rendered | `showSelect: true`, `listOnly: undefined` | checkbox present |
| C7.6 | `listOnly=true` → checkbox NOT rendered | `listOnly: true` | checkbox absent |
| C7.7 | Checking the checkbox dispatches `updateFileListElement` with `checked: true, update: true` | `showSelect: true`; check the checkbox | fileList entry updated in store |
| C7.8 | Clicking element with `listOnly=true` calls `onElementClick` which dispatches `showFileTreeElementInfo` | `listOnly: true`; `onElementClick` provided; click | action with `element` payload dispatched |
| C7.9 | Clicking element without `listOnly` does NOT dispatch `showFileTreeElementInfo` | `listOnly: undefined`; click | action NOT dispatched |

---

## C8 — `tabContent/fileListFolder` (`FileTreeFolder`)
**File**: `src/test/component/tabContent/fileListFolder.test.tsx`
**Source**: `src/components/fileTree/fileTreeElements/fileTreeFolder/fileTreeFolder.tsx`

Recursive folder node in the file tree. Tests fold/unfold dispatch, `listOnly` mode, and checked state.

| # | Description | Setup | Expected |
|---|---|---|---|
| C8.1 | Renders the folder name | `folder.name: 'components'` | `'components'` visible |
| C8.2 | Children are hidden when folder is collapsed (`foldedOut: false`) | collapsed folder with child | child name not visible |
| C8.3 | Children are visible when folder is expanded (`foldedOut: true`) | expanded folder with child | child name visible |
| C8.4 | Folder with `foldedOut: false` shows collapsed state | collapsed | name visible, children hidden |
| C8.5 | Renders nested folder when expanded | parent expanded, child sub-folder | sub-folder name visible |
| C8.6 | `foldedOut=false` → children NOT rendered (extended fixture) | folder with child file; `foldedOut: false` | child file not in DOM |
| C8.7 | `foldedOut=true` → children ARE rendered (extended fixture) | folder with child file; `foldedOut: true` | child file visible |
| C8.8 | Clicking collapsed folder calls `onElementClick` which dispatches `updateFileListElement` with `foldedOut: true` | `onElementClick` provided; `foldedOut: false`; click folder name | spy captures action with `foldedOut: true` |
| C8.9 | Clicking expanded folder calls `onElementClick` which dispatches `updateFileListElement` with `foldedOut: false` | `onElementClick` provided; `foldedOut: true`; click folder name | spy captures action with `foldedOut: false` |
| C8.10 | `listOnly=true` always shows children regardless of `foldedOut=false` | `listOnly: true, foldedOut: false` | children rendered |
| C8.11 | Folder with `id === undefined` has no checkbox when expanded | `foldedOut: true, id: undefined` | checkbox absent |
| C8.12 | Checking folder checkbox calls `onElementSelectionChange` which dispatches `updateFileListElement` | `showSelect: true`; `onElementSelectionChange` provided; check checkbox | spy captures updated checked value |

---

## C9 — `tabContent/fileSearch`
**File**: `src/test/component/tabContent/fileSearch.test.tsx`
**Source**: `src/components/tabs/fileTree/fileSearch/fileSearch.tsx`

Text input for filtering the file tree.

| # | Description | Setup | Expected |
|---|---|---|---|
| C9.1 | Renders a text input | render | `<input>` present |
| C9.2 | Input is empty by default | render with no initial value | `value` is empty string |
| C9.3 | Typing updates the input value | type `'src'` | input shows `'src'` |
| C9.4 | `onChange` callback is called after typing | type `'src'` | `setFileSearch` called with `'src'` |
| C9.5 | Clearing the input calls `onChange` with empty string | type then clear | `setFileSearch` called with `''` |

---

## C10 — `tabContent/parametersGeneral`
**File**: `src/test/component/tabContent/parametersGeneral.test.tsx`
**Source**: `src/components/tabs/parameters/parametersGeneral/parametersGeneral.tsx`

Presentational component. Receives `parametersGeneral` and `setParametersGeneral` as props.

| # | Description | Setup | Expected |
|---|---|---|---|
| C10.1 | Renders a granularity `<select>` | render with default props | select element present |
| C10.2 | Granularity dropdown shows the current value | `granularity: 'months'` | `'months'` is selected option |
| C10.3 | Changing granularity calls `setParametersGeneral` with new value | change select to `'days'` | callback called with `{ granularity: 'days', … }` |
| C10.4 | Renders an "exclude merge commits" checkbox | any props | checkbox present |
| C10.5 | Checkbox reflects current `excludeMergeCommits` state | `excludeMergeCommits: true` | checkbox is checked |
| C10.6 | Toggling checkbox calls `setParametersGeneral` with inverted value | click checkbox when `excludeMergeCommits: true` | callback called with boolean value |
| C10.7 | All controls are disabled when `disabled` prop is `true` | `disabled: true` | select + checkbox have `disabled` attribute |

---

## C11 — `tabController/tabControllerButton`
**File**: `src/test/component/tabController/tabControllerButton.test.tsx`
**Source**: `src/components/tabMenu/tabControllerButton/tabControllerButton.tsx`

Simple toolbar button.

| # | Description | Setup | Expected |
|---|---|---|---|
| C11.1 | Renders a `<button>` | render with icon prop | `<button>` in DOM |
| C11.2 | Clicking calls the `onClick` prop | click | `onClick` called once |
| C11.3 | Button is not disabled by default (no `disabled` prop support) | render | `<button>` not disabled |
| C11.4 | Renders the passed icon/label (name as alt text) | `name: 'Export'` | `img[alt='Export']` visible |
| C11.5 | `onClick` fires normally (component has no disabled prop) | render, click | `onClick` called |

---

## C12 — `DashboardItem`
**File**: `src/test/component/dashboard/dashboardItem.test.tsx`
**Source**: `src/components/dashboard/dashboardItem/dashboardItem.tsx`

> Mocks: `pluginRegistry.ts` (fake plugin), `dataPluginStorage.ts` (never-resolving promise keeps component in loading state), `fileTreeUtilities.tsx`.
> Event queries: mouseDown on plugin name span (bubbles to interaction bar); DOM child index for resize bars; `getAllByRole('button')` for toolbar buttons.

| # | Description | Setup | Expected |
|---|---|---|---|
| C12.1 | Renders nothing when item has no `x` or `y` | `x: undefined, y: undefined` | `#dashboardItem1` absent |
| C12.2 | Renders the plugin name in the interaction bar | default props | `'TestPlugin'` in DOM |
| C12.3 | Shows "No Data Plugin Selected" before data plugin loads | DataPlugin mock never resolves | text visible |
| C12.4 | mouseDown on interaction bar calls `setDragResizeItem(id, drag)` | mouseDown on name span (bubbles) | called with `(1, DragResizeMode.drag)` |
| C12.5 | mouseDown on top resize bar calls `setDragResizeItem(id, resizeTop)` | `#dashboardItem1.children[3]` | called with `(1, DragResizeMode.resizeTop)` |
| C12.6 | Help panel hidden by default, shown after clicking help button | click `getAllByRole('button')[1]` | panel `display` changes to `'block'` |

---

## C13 — `InformationDialog`
**File**: `src/test/component/informationDialog/informationDialog.test.tsx`
**Source**: `src/components/informationDialog/informationDialog.tsx`

Pure presentational component — renders a `<dialog>` with static structure and a close button.

| # | Description | Setup | Expected |
|---|---|---|---|
| C13.1 | Renders a `<dialog>` element | render | `dialog` element in DOM |
| C13.2 | Dialog has `id="informationDialog"` | render | `document.getElementById('informationDialog')` not null |
| C13.3 | Has an element with id `informationDialogHeadline` | render | element present |
| C13.4 | Has an element with id `informationDialogText` | render | element present |
| C13.5 | Renders a Close button | render | button with text `/close/i` present (uses `getAllByRole` with `hidden: true`) |

---

## C14 — `StatusBarSeparator`
**File**: `src/test/component/statusBarSeparator/statusBarSeparator.test.tsx`
**Source**: `src/components/statusBar/statusBarSeparator/statusBarSeparator.tsx`

Presentational component with conditional rendering based on `direction` prop.

| # | Description | Setup | Expected |
|---|---|---|---|
| C14.1 | `direction="horizontal"` renders a `<span>` | render | `<span>` in DOM |
| C14.2 | `direction="vertical"` renders a `<span>` | render | `<span>` in DOM |
| C14.3 | `direction="diagonal"` renders a `<span>` | render | `<span>` in DOM |
| C14.4 | Unknown direction renders nothing | `direction="unknown"` | no `<span>` in DOM |

---

## C15 — `DotsPattern`
**File**: `src/test/component/svg/dotsPattern.test.tsx`
**Source**: `src/components/svg/patterns/dots.tsx`

Pure SVG `<pattern>` presentational component. Rendered inside a wrapping `<svg>`.

| # | Description | Setup | Expected |
|---|---|---|---|
| C15.1 | Renders a `<pattern>` element | `id='dots', color='red'` | `pattern` element in DOM |
| C15.2 | `<pattern>` has the supplied id | `id='myDots'` | `pattern.id === 'myDots'` |
| C15.3 | `<circle>` has `stroke` set to the supplied color | `color='#ff0000'` | `circle[stroke] === '#ff0000'` |
| C15.4 | `<use>` elements reference the circle by correct href | `id='dots'` | all `use[href] === '#circle_dots'` |

---

## C16 — `HatchPattern`
**File**: `src/test/component/svg/hatchPattern.test.tsx`
**Source**: `src/components/svg/patterns/hatch.tsx`

Pure SVG `<pattern>` presentational component. Rendered inside a wrapping `<svg>`.

| # | Description | Setup | Expected |
|---|---|---|---|
| C16.1 | Renders a `<pattern>` element | `id='hatch', color='blue'` | `pattern` element in DOM |
| C16.2 | `<pattern>` has the supplied id | `id='myHatch'` | `pattern.id === 'myHatch'` |
| C16.3 | `<path>` style has the supplied color as `stroke` | `color='blue'` | `path.style.stroke === 'blue'` |
| C16.4 | `<pattern>` has `width="4"` and `height="4"` | render | `width=4`, `height=4` |

---

## C17 — `TabControllerButtonThemeSwitch`
**File**: `src/test/component/tabControllerButtonThemeSwitch/tabControllerButtonThemeSwitch.test.tsx`
**Source**: `src/components/tabMenu/tabControllerButtonThemeSwitch/tabControllerButtonThemeSwitch.tsx`

No Redux. Props: `{ onChange: (theme: string) => void; theme: string }`. Uses `fireEvent.click` to toggle the uncontrolled checkbox.

| # | Description | Setup | Expected |
|---|---|---|---|
| C17.1 | Renders a checkbox input | `theme='binocularDark'` | `input[type=checkbox]` in DOM |
| C17.2 | Checkbox is checked when `theme='binocularDark'` | `theme='binocularDark'` | `checkbox.defaultChecked === true` |
| C17.3 | Checkbox is unchecked when `theme='binocularLight'` | `theme='binocularLight'` | `checkbox.defaultChecked === false` |
| C17.4 | Clicking the checkbox (unchecked→checked) calls `onChange` with `'binocularDark'` | `fireEvent.click` on unchecked box | `onChange` called with `'binocularDark'` |
| C17.5 | Clicking the checkbox (checked→unchecked) calls `onChange` with `'binocularLight'` | `fireEvent.click` on checked box | `onChange` called with `'binocularLight'` |

---

## C18 — `ContextMenu`
**File**: `src/test/component/contextMenu/contextMenu.test.tsx`
**Source**: `src/components/contextMenu/contextMenu.tsx`

> Presentational dialog. DOM ids required by `showContextMenu()` helper are verified. `HTMLDialogElement.prototype.close` mocked via `vi.fn()`.

| # | Description | Setup | Expected |
|---|---|---|---|
| C18.1 | Renders a `<dialog>` element | render | `dialog` in DOM |
| C18.2 | Dialog has `id="contextMenu"` | render | `getElementById('contextMenu')` not null |
| C18.3 | Contains `id="contextMenuPositionController"` div | render | element present |
| C18.4 | Contains `id="contextMenuContent"` `<ul>` | render | element present |
| C18.5 | Clicking the dialog calls `.close()` on it | `fireEvent.click` on dialog | `close` spy called |
| C18.6 | `onMouseLeave` on the dialog calls `.close()` | fire `mouseleave` on dialog | `dialog.close` called |
| C18.7 | `onContextMenu` calls `e.preventDefault()` | fire `contextmenu` | `preventDefault` called |
| C18.8 | `onMouseLeave` on `#contextMenuPositionController` calls `.close()` | fire `mouseleave` on position controller | `dialog.close` called |

---

## C19 — `InfoTooltip`
**File**: `src/test/component/infoTooltip/infoTooltip.test.tsx`
**Source**: `src/components/infoTooltip/infoTooltip.tsx`

> Presentational dialog. Checks required DOM ids and mouse/context-menu event handling.

| # | Description | Setup | Expected |
|---|---|---|---|
| C19.1 | Renders a div with `id="infoTooltip"` | render with `ref`/`tooltipVisibleFlagRef` props | element present in DOM |
| C19.2 | Div has `id="infoTooltip"` | render | element present |
| C19.3 | Contains `id="infoTooltipPositionController"` | render | element present |
| C19.4 | Contains `id="infoTooltipContent"` | render | element present |
| C19.5 | `onMouseLeave` hides the tooltip after 500ms timeout | fire `mouseleave`; advance timers 600ms | `style.display === 'none'` |
| C19.6 | `onContextMenu` calls `e.preventDefault()` | fire `contextmenu` | `preventDefault` called |
| C19.7 | `onMouseLeave` sets `tooltipVisibleFlagRef.current` to `false` | fire `mouseleave` | flag is `false` |

---

## C20 — `LoadingLocalDatabaseOverlay`
**File**: `src/test/component/loadingLocalDatabaseOverlay/loadingLocalDatabaseOverlay.test.tsx`
**Source**: `src/components/overlayController/overlays/loadingLocalDatabaseOverlay/loadingLocalDatabaseOverlay.tsx`

> Redux-connected. Reads `settings.localDatabaseLoadingState`. Wrapped in `<Provider>` with preloaded state.

| # | Description | Setup | Expected |
|---|---|---|---|
| C20.1 | Renders nothing when state is not loading | `localDatabaseLoadingState: none` | no `dialog` in DOM |
| C20.2 | Renders an open modal when state is loading | `localDatabaseLoadingState: loading` | `dialog[open]` present |
| C20.3 | Modal contains "Loading Local Database" text | state = loading | text visible |

---

## C21 — `TabSection`
**File**: `src/test/component/tabMenu/tabSection.test.tsx`
**Source**: `src/components/tabMenu/tabSection/tabSection.tsx`

> Renders horizontal/vertical container based on `alignment`. Clones children with `orientation` prop.

| # | Description | Setup | Expected |
|---|---|---|---|
| C21.1 | `alignment=top` → renders horizontal container | `alignment: TabAlignment.top` | container div rendered |
| C21.2 | `alignment=left` → renders vertical container | `alignment: TabAlignment.left` | container div rendered |
| C21.3 | `alignment=undefined` → renders horizontal layout | no alignment | container rendered |
| C21.4 | Renders `name` label when provided | `name="My Section"` | text content matches name |
| C21.5 | Clones single child with `orientation='horizontal'` | top alignment, single child | `data-orientation="horizontal"` on child |
| C21.6 | Clones multiple children with orientation | array of children | all children receive orientation |
| C21.7 | `alignment=left` + multiple children → each child gets `orientation='vertical'` | left alignment, 2 children | both spans have `data-orientation="vertical"` |

---

## C22 — `Tab`
**File**: `src/test/component/tabMenu/tab.test.tsx`
**Source**: `src/components/tabMenu/tab/tab.tsx`

> Wraps children in a container div; injects `alignment` prop into `TabSection` children.

| # | Description | Setup | Expected |
|---|---|---|---|
| C22.1 | Renders a container div | render | div in DOM |
| C22.2 | Single non-TabSection child passes through unchanged | plain child | child renders as-is |
| C22.3 | Single TabSection child receives `alignment` prop | TabSection as child | TabSection mounts without error |
| C22.4 | Array with TabSection child injects alignment | array with TabSection | TabSection in array rendered |
| C22.5 | Array with non-TabSection children renders unmodified | array of plain children | both children rendered |

---

---

## C23 — `DashboardPreview`
**File**: `src/test/component/dashboard/dashboardPreview.test.tsx`
**Source**: `src/components/dashboard/dashboardPreview/dashboardPreview.tsx`

Pure presentational component. Renders a sized container with one child div per `layout.items` entry. In non-small mode shows `pluginName` and `{width}x{height}`; in small mode shows only `pluginName`.

| # | Description | Setup | Expected |
|---|---|---|---|
| C23.1 | Renders a container div | any layout | `div` in DOM |
| C23.2 | Container uses `20rem` width/height by default | `small` omitted | `style.width === '20rem'`, `style.height === '20rem'` |
| C23.3 | Container uses `15rem` when `small=true` | `small: true` | `style.width === '15rem'`, `style.height === '15rem'` |
| C23.4 | Renders one child div per layout item | layout with 2 items | `outerDiv.children.length === 2` |
| C23.5 | Renders `pluginName` text in non-small mode | `pluginName: 'TestViz'` | `'TestViz'` visible |
| C23.6 | Renders `{width}x{height}` in non-small mode | `width: 8, height: 4` | `'8x4'` visible |
| C23.7 | Does NOT render `{width}x{height}` in small mode | `small: true` | `'8x4'` absent |
| C23.8 | Empty `items` array renders no item divs | `items: []` | `outerDiv.children.length === 0` |

---

## C24 — `DashboardItemPlaceholder`
**File**: `src/test/component/dashboard/dashboardItemPlaceholder.test.tsx`
**Source**: `src/components/dashboard/dashboardItemPlaceholder/dashboardItemPlaceholder.tsx`

Pure presentational. Renders `div#dashboardItem{id}` with `calc(...)`-based inline styles and a label span.

| # | Description | Setup | Expected |
|---|---|---|---|
| C24.1 | Renders div with `id="dashboardItem{id}"` | `item.id: 5` | `getElementById('dashboardItem5')` not null |
| C24.2 | Label span contains `"{pluginName} #{id}"` | `pluginName: 'Chart', id: 3` | text `'Chart #3'` visible |
| C24.3 | `top` style is a `calc(...)` string | any valid item | `style.top` matches `/^calc\(/` |
| C24.4 | `left` style is a `calc(...)` string | any valid item | `style.left` matches `/^calc\(/` |
| C24.5 | Correct percentage for `top` when `rowCount=4, y=2` | `rowCount: 4, y: 2` | `style.top` contains `'50%'` |
| C24.6 | Correct percentage for `left` when `colCount=5, x=1` | `colCount: 5, x: 1` | `style.left` contains `'20%'` |

---

## C25 — `TabDropHint`
**File**: `src/test/component/tabMenu/tabDropHint.test.tsx`
**Source**: `src/components/tabMenu/tabController/tabDropHint/tabDropHint.tsx`

Simple conditional component. `dragState=false` renders nothing; `dragState=true` renders 4 "Drop Here" drop zones.

| # | Description | Setup | Expected |
|---|---|---|---|
| C25.1 | `dragState=false` renders no drop zones | `dragState: false` | 0 `"Drop Here"` elements |
| C25.2 | `dragState=true` renders 4 drop zones | `dragState: true` | 4 `"Drop Here"` elements |
| C25.3 | Switching from `false` to `true` shows drop zones | rerender with `true` | 4 zones appear |

---

## C26 — `ExportDialog`
**File**: `src/test/component/exportDialog/exportDialog.test.tsx`
**Source**: `src/components/exportDialog/exportDialog.tsx`

Redux-connected (reads `state.export`). Wrapped in `<Provider>` with a minimal store containing only the `export` slice.

| # | Description | Store state | Expected |
|---|---|---|---|
| C26.1 | Renders `dialog#exportDialog` | any | `getElementById('exportDialog')` not null |
| C26.2 | Shows heading `"Export"` for `ExportType.all` | `exportType: all` | `'Export'` heading visible |
| C26.3 | Shows heading `"Image Export"` for `ExportType.image` | `exportType: image` | `'Image Export'` visible |
| C26.4 | Shows heading `"Data Export"` for `ExportType.data` | `exportType: data` | `'Data Export'` visible |
| C26.5 | Shows `"Export SVG"` button for `ExportType.image` | `exportType: image` | button with `'Export SVG'` present |
| C26.6 | No `"Export SVG"` button for `ExportType.all` | `exportType: all` | button absent |
| C26.7 | Always renders a `"Close"` button | any | `'Close'` button present |
| C26.8 | `ExportType.all` → "Export" heading visible; "Image Export" and "Data Export" absent | `exportType: all` | only "Export" heading |
| C26.9 | `ExportType.data` → "Data Export" visible; "Export SVG" absent; no preview div | `exportType: data` | heading present; SVG absent |
| C26.10 | `ExportType.image` → "Image Export" + preview + "Export SVG" all visible | `exportType: image` | all three visible |
| C26.11 | Clicking "Export SVG" calls `URL.createObjectURL` once | click Export SVG | `URL.createObjectURL` called once |

---

## C27 — `AddDataPluginCard`
**File**: `src/test/component/settingsDialog/addDataPluginCard.test.tsx`
**Source**: `src/components/settingsDialog/addDataPluginCard/addDataPluginCard.tsx`

Redux-connected (reads/writes `state.settings`). Wrapped in `<Provider>`. Tests plugin card rendering and the "Add" action.

| # | Description | Setup | Expected |
|---|---|---|---|
| C27.1 | Renders a name input field when `file` requirement is set | `requirements.file: true` | input with placeholder `'Name'` present |
| C27.2 | Renders the plugin name as a card title | `name: 'TestPlugin'` | `'TestPlugin'` visible |
| C27.3 | "Add" button is present | default plugin | `role="button" name=/add/i` present |
| C27.4 | Clicking "Add" dispatches `addDataPlugin` and increases `dataPlugins` length | click Add | `settings.database.dataPlugins.length` incremented by 1 |
| C27.5 | File input shown when `file` requirement is set | `requirements.file: true` | `#importStorageFilePicker` present |

---

## C28 — `StatusBar` / StatusBarDataPlugin
**File**: `src/test/component/statusBar/statusBarDataPlugin.test.tsx`
**Source**: `src/components/statusBar/statusBar.tsx`

Redux-connected (reads `state.settings`). `dataPluginStorage.getDataPlugin` mocked to a never-resolving promise so loading state is always shown.

| # | Description | Store state | Expected |
|---|---|---|---|
| C28.1 | One plugin → one "Loading Data Plugin" element with the plugin's RGBA color as background | 1 plugin with `color: '#ff000022'` | 1 loading div; `background` equals parsed RGBA |
| C28.2 | No plugins → "No DataPlugins Configured" placeholder shown | `dataPlugins: []` | placeholder text present |
| C28.3 | Two plugins → two loading elements each with a distinct background color | 2 plugins with different colors | 2 loading divs; backgrounds differ |

---

## C29 — `DashboardItemPopout`
**File**: `src/test/component/dashboard/dashboardItemPopout.test.tsx`
**Source**: `src/components/dashboard/dashboardItemPopout/dashboardItemPopout.tsx`

`PopoutController` is mocked as a passthrough wrapper with a `data-title` attribute. Tests verify structural rendering without opening a real window.

| # | Description | Setup | Expected |
|---|---|---|---|
| C29.1 | Renders without crashing given minimal valid props | `name, onClosing, onResize, children` | `container` is truthy |
| C29.2 | Plugin name appears in the popout title attribute | `name: 'MyVisualization'` | `data-title` on popout-controller contains `'MyVisualization'` |
| C29.3 | Chart container child is present in the DOM | child `div[data-testid="chart-container"]` | element found |

---

## C30 — `DateRange`
**File**: `src/test/component/tabContent/dateRange.test.tsx`
**Source**: `src/components/tabs/parameters/dataRange/dateRange.tsx`

Pure presentational with callbacks. No Redux. Tests datetime-local inputs and navigation buttons (+M, -M, +Y, -Y via Shift, T).

| # | Description | Setup | Expected |
|---|---|---|---|
| C30.1 | Renders two datetime-local inputs | `disabled: false, defaultDateRange` | ≥2 inputs of type `datetime-local` |
| C30.2 | From input value reflects `parametersDateRange.from` | `from: '2024-01-15T...'` | input value matches `/2024-01-15/` |
| C30.3 | To input value reflects `parametersDateRange.to` | `to: '2024-06-15T...'` | input value matches `/2024-06-15/` |
| C30.4 | Changing from input calls `setParametersDateRange` with updated `from` | fire change on first input | callback called once; `callArg.from` is new value |
| C30.5 | Changing to input calls `setParametersDateRange` with updated `to` | fire change on second input | callback called once; `callArg.to` is new value |
| C30.6 | Clicking "-M" (no Shift) subtracts ~1 month from from/to | click first then second `-M` | `from` → `2023-12`; `to` → `2024-05` |
| C30.7 | Clicking "+M" (no Shift) adds ~1 month to from/to | click first then second `+M` | `from` → `2024-02`; `to` → `2024-07` |
| C30.8 | Holding Shift then clicking "-M" subtracts ~1 year | `keyDown Shift`, click `-Y` | `from` → `2023-01` |
| C30.9 | Holding Shift then clicking "+M" adds ~1 year | `keyDown Shift`, click `+Y` | `from` → `2025-01` |
| C30.10 | Clicking "T" button sets from to today's date | click first `T` | `callArg.from` contains current year |
| C30.11 | `disabled=true` makes both datetime-local inputs disabled | `disabled: true` | both inputs have `disabled` attribute |

---

## C31 — `GeneralSettings`
**File**: `src/test/component/settingsDialog/generalSettings.test.tsx`
**Source**: `src/components/settingsDialog/generalSettings/generalSettings.tsx`

Redux-connected (reads/writes `state.settings`, `state.dashboard`, and several others). `dataPluginStorage` mocked to never-resolving promise.

| # | Description | Setup | Expected |
|---|---|---|---|
| C31.1 | Renders a grid size `<select>` element | default store | `role="combobox"` present |
| C31.2 | Changing grid size select dispatches `setGeneralSettings` and updates store | fire change to `large` | `settings.general.gridSize === SettingsGeneralGridSize.large` |
| C31.3 | "Clear Storage" button is rendered | default store | button with name `/clear storage/i` present |
| C31.4 | "Reload Page" button NOT visible before clearing storage | default store | button absent |
| C31.5 | Clicking "Clear Storage" makes "Reload Page" button appear | click Clear Storage | "Reload Page" button appears |
| C31.6 | "Export Storage" button is present | default store | button with name `/export storage/i` present |
| C31.7 | Invalid JSON in file import shows error message | mock FileReader returning bad JSON | text `/error reading file/i` visible |
| C31.8 | JSON with wrong `storageVersion` shows error message | mock FileReader returning version 9999 | text `/storage version not compatible/i` visible |
| C31.9 | Clicking "Reload Page" calls `location.reload` | stub `location.reload`; click button | mock called once |

---

## C32 — `ConnectedDataPlugins`
**File**: `src/test/component/settingsDialog/connectedDataPlugins.test.tsx`
**Source**: `src/components/settingsDialog/connectedDataPlugins/connectedDataPlugins.tsx`

Redux-connected (reads/writes `state.settings`, `state.files`). `dataPluginStorage` mocked.

| # | Description | Setup | Expected |
|---|---|---|---|
| C32.1 | Empty plugin list shows empty-state text | `dataPlugins: []` | `/no database connections configured/i` visible |
| C32.2 | One plugin — plugin name visible in DOM | `dataPlugins: [basePlugin]` | `'TestPlugin'` visible |
| C32.3 | Plugin with `isDefault: true` shows "Default" badge | `isDefault: true` | `'Default'` text present |
| C32.4 | Plugin with `id === 0` shows "pre-loaded" label | `id: 0` | `'pre-loaded'` present |
| C32.5 | `interactable=true` shows "Set Default" button | `interactable: true` | button present |
| C32.6 | `interactable=false` hides "Set Default" button | `interactable: false` | button absent |
| C32.7 | `id === 0` + `interactable=true` has no "Delete" button | pre-loaded plugin | Delete absent |
| C32.8 | Clicking "Set Default" updates `settings.database.defaultDataPluginItemId` | click Set Default for `id:5` | `defaultDataPluginItemId === 5` |
| C32.9 | Clicking "Delete" on non-file plugin removes it from store | click Delete | plugin with `id:2` gone from `dataPlugins` |

---

## C33 — `StatusBarDataPluginElement`
**File**: `src/test/component/statusBar/statusBarDataPluginElement.test.tsx`
**Source**: `src/components/statusBar/statusBarDataPlugin/statusBarDataPluginElement/statusBarDataPluginElement.tsx`

Redux-connected (reads `ProgressReducer`). Tests socket-status icon and progress bar visibility.

| # | Description | Setup | Expected |
|---|---|---|---|
| C33.1 | `id === 0` (pre-loaded) renders "pre-loaded" badge | `preloadedPluginConfig` | `'pre-loaded'` visible |
| C33.2 | `id !== 0` renders `"<name> #<id>"` — no pre-loaded badge | `basePluginConfig` | `'TestPlugin #1'` visible; `'pre-loaded'` absent |
| C33.3 | Socket status Idle → idle icon present | default store | `getAllByAltText('idle').length > 0` |
| C33.4 | Socket status Connected → connected state reflected in store | dispatch `setConnectionStatus(Connected)` | store state is Connected; idle alt still present |
| C33.5 | Socket status Disconnected → disconnected state reflected in store | dispatch `setConnectionStatus(Disconnected)` | store state is Disconnected |
| C33.6 | `progressUpdate.useAutomaticUpdate: true` → `<progress>` elements rendered | config with `useAutomaticUpdate: true` | `querySelectorAll('progress').length > 0` |
| C33.7 | `progressUpdate` not set → no progress bars; description text rendered | config without progressUpdate + `mockDataPlugin` | 0 progress elements; description text visible |

---

## C34 — `PopoutController`
**File**: `src/test/component/dashboard/popoutController.test.tsx`
**Source**: `src/components/dashboard/dashboardItemPopout/popoutController/popoutController.tsx`

No Redux. `window.open` spied to return a mock window object. Tests window lifecycle without a real browser.

| # | Description | Setup | Expected |
|---|---|---|---|
| C34.1 | `window.open` called on mount | render | `window.open` called; first arg `=== ''` |
| C34.2 | `window.open` called with `props.title` as second arg | `title: 'My Popout Title'` | second arg `=== 'My Popout Title'` |
| C34.3 | `window.open` returns null → `onError` called | mock returns `null` | `onError` called once |
| C34.4 | Component renders nothing to main DOM | render | `container.firstChild === null` |
| C34.5 | `beforeunload` event on the popout window fires `onClosing` | retrieve registered listener; call it | `onClosing` called |

---

## C35 — `DashboardItemSettings`
**File**: `src/test/component/dashboard/dashboardItemSettings.test.tsx`
**Source**: `src/components/dashboard/dashboardItemSettings/dashboardItemSettings.tsx`

Redux-connected (reads `state.settings`). Tests heading, Refresh/Delete buttons, and conditional toggles.

| # | Description | Setup | Expected |
|---|---|---|---|
| C35.1 | Heading contains `"TestViz (#42)"` | `item.pluginName: 'TestViz', item.id: 42` | `<h2>` has text `'TestViz (#42)'` |
| C35.2 | Clicking "Refresh" calls `onClickRefresh` | click button | callback called once |
| C35.3 | Clicking "Delete" calls `onClickDelete` | click button | callback called once |
| C35.4 | Toggling "Ignore Global Parameters" checkbox calls `setIgnoreGlobalParameters(true)` | click checkbox | callback called with `true` |
| C35.5 | "Automatic Update" toggle shown when `selectedDataPlugin.parameters.progressUpdate.useAutomaticUpdate === true`; absent when `selectedDataPlugin` is undefined | two render passes | toggle present/absent accordingly |

---

## C36 — `VisualizationOverview`
**File**: `src/test/component/tabContent/visualizationOverview.test.tsx`
**Source**: `src/components/tabs/visualizations/visualizationSelector/visualizationOverview/visualizationOverview.tsx`

`VisualizationSelectorDragButton` and `VisualizationFilter` mocked. Results queried via `data-testid="viz-button"` because the dialog is initially closed (hidden from accessibility tree).

| # | Description | Setup | Expected |
|---|---|---|---|
| C36.1 | After render with empty search, at least one viz-button is present | default render | `queryAllByTestId('viz-button').length > 0` |
| C36.2 | After typing `"ZZZZZ_NO_MATCH"` into search input, no `<h2>` headings rendered | filter by no-match string | `queryAllByRole('heading', { level: 2 }).length === 0` |
| C36.3 | After typing `"Changes"`, only matching plugins visible — no non-matching buttons | filter by `'Changes'` | matching buttons > 0; non-matching buttons === 0 |

---

## C37 — `AddSprint`
**File**: `src/test/component/tabContent/addSprint.test.tsx`
**Source**: `src/components/tabs/sprints/addSprint/addSprint.tsx`

Redux-connected (reads/writes `state.sprints`). `AddSprintDialog` mocked. `dialog#addSprintDialog` created and appended in `beforeEach`.

| # | Description | Setup | Expected |
|---|---|---|---|
| C37.1 | "Add Sprint" button is present in the DOM | default render | `getByRole('button', { name: /add sprint/i })` found |
| C37.2 | Clicking "Add Sprint" dispatches `sprintToEdit(null)` and calls `showModal` | click button | `store.getState().sprints.sprintToEdit === null`; `showModal` called |

---

## C38 — `DatabaseSettings`
**File**: `src/test/component/settingsDialog/databaseSettings.test.tsx`
**Source**: `src/components/settingsDialog/databaseSettings/databaseSettings.tsx`

Redux-connected (reads `state.settings`, `state.files`). `ConnectedDataPlugins` and `AddDataPluginCard` mocked. `dataPluginStorage` mocked.

| # | Description | Setup | Expected |
|---|---|---|---|
| C38.1 | "Add Database Connection:" heading is rendered | `dataPlugins: []` | heading text present |
| C38.2 | When store contains one plugin, `DataPluginStorage.addDataPlugin` is called once on mount with that plugin | `dataPlugins: [plugin]` | `addDataPlugin` called once with the plugin |

---

## C39 — `FileTreeElementInfoDialog`
**File**: `src/test/component/tabContent/fileTreeElementInfoDialog.test.tsx`
**Source**: `src/components/fileTree/fileTreeElementInfoDialog/fileTreeElementInfoDialog.tsx`

Full store with 12 reducers. `fileTreeUtilities` and `contextMenuHelper` mocked. `dialog#fileTreeElementInfoDialog` appended in `beforeEach`.

| # | Description | Setup | Expected |
|---|---|---|---|
| C39.1 | `selectedFileTreeElement` undefined → no name heading, no type/path content; two Close buttons always present | `selectedFileTreeElement: undefined` | `#informationDialogHeadline` null; two Close buttons |
| C39.2 | File element → name as heading; path; link to webUrl | `makeFile()` | `<h>` with `'readme.md'`; path `'src/readme.md'`; link to webUrl |
| C39.3 | `foldedOut: false` → "folded in" badge; `foldedOut: true` → "folded out" badge | two separate renders | correct badge visible in each case |
| C39.4 | `checked: false` → "unchecked" badge; `checked: true` → "checked" badge | two separate renders | correct badge visible in each case |
| C39.5 | Folder element → "Folder Content" visible; Path heading and webUrl link absent | `makeFolder()` | `'Folder Content'` present; no Path; no link |

---

## C40 — `OverlayController`
**File**: `src/test/component/overlayController/overlayController.test.tsx`
**Source**: `src/components/overlayController/overlayController.tsx`

All 11 child components mocked with `data-testid` stubs. No Redux required. Tests structural composition.

| # | Description | Setup | Expected |
|---|---|---|---|
| C40.1 | Renders without crashing | mock all 11 children; render | `document.body.firstChild` not null |
| C40.2 | All 11 overlay child components present in the DOM | render | all 11 `data-testid` stubs found in DOM |

---

## C41 — `AuthorList`
**File**: `src/test/component/tabs/authors/authorList.test.tsx`
**Source**: `src/components/tabs/authors/authorList/authorList.tsx`

> `DataPluginStorage.getDataPlugin` mocked to return a never-resolving promise. Both SCSS modules mocked. Tests the `useEffect([configuredDataPlugins])` stale-plugin-reference fix. Uses `await act(async () => { render(...) })` to flush synchronous pre-`await` dispatches.

| # | Description | Setup | Expected |
|---|---|---|---|
| C41.1 | No configured plugins → clears both plugin IDs | `dataPlugins: []`, `authorsDataPluginId: 1` | `authors.dataPluginId === undefined`; `accounts.dataPluginId === undefined` |
| C41.2 | Selected plugin no longer exists → clears both plugin IDs | `dataPlugins: [id=2]`, `authorsDataPluginId: 1` | both IDs cleared to `undefined` |
| C41.3 | Selected plugin still exists → IDs unchanged | `dataPlugins: [id=1]`, `authorsDataPluginId: 1` | `authors.dataPluginId === 1` |

---

## C42 — `EditAuthorDialog`
**File**: `src/test/component/tabs/authors/editAuthorDialog.test.tsx`
**Source**: `src/components/tabs/authors/editAuthorDialog/editAuthorDialog.tsx`

> SCSS module mocked. `authorToEdit` preloaded directly in Redux state (bypasses `editAuthor` reducer which calls `showModal()`, unsupported in jsdom). Tests the `useEffect([accountLists, authorsDataPluginId])` stale-accounts fix via `document.getElementById('allAccounts')` datalist queries.

| # | Description | Setup | Expected |
|---|---|---|---|
| C42.1 | Accounts datalist updates when `authorsDataPluginId` changes | plugin 1 accounts = [Alice], plugin 2 accounts = [Bob]; render; dispatch `setAuthorsDataPluginId(2)` | datalist switches from Alice to Bob |
| C42.2 | Accounts datalist updates when `accountLists` changes for the current plugin | plugin 1 accounts = []; render; dispatch `setAccountList` with [Alice] | datalist goes from 0 to 1 option (Alice) |

---

## Component test file locations

```
src/test/component/
├── contextMenu/
│   └── contextMenu.test.tsx                                       (C18)
├── dashboard/
│   ├── dashboardItem.test.tsx                                     (C12)
│   ├── dashboardItemPlaceholder.test.tsx                          (C24)
│   ├── dashboardItemPopout.test.tsx                               (C29)
│   ├── dashboardItemSettings.test.tsx                             (C35)
│   ├── dashboardPreview.test.tsx                                  (C23)
│   └── popoutController.test.tsx                                  (C34)
├── dataPluginQuickSelect/
│   └── dataPluginQuickSelect.test.tsx                             (C1)
├── exportDialog/
│   └── exportDialog.test.tsx                                      (C26)
├── informationDialog/
│   └── informationDialog.test.tsx                                 (C13)
├── infoTooltip/
│   └── infoTooltip.test.tsx                                       (C19)
├── loadingLocalDatabaseOverlay/
│   └── loadingLocalDatabaseOverlay.test.tsx                       (C20)
├── notificationController/
│   └── notificationController.test.tsx                            (C2)
├── overlayController/
│   └── overlayController.test.tsx                                 (C40)
├── settingsDialog/
│   ├── addDataPluginCard.test.tsx                                 (C27)
│   ├── connectedDataPlugins.test.tsx                              (C32)
│   ├── databaseSettings.test.tsx                                  (C38)
│   ├── generalSettings.test.tsx                                   (C31)
│   └── settingsDialog.test.tsx                                    (C3)
├── setupDialog/
│   └── setupDialog.test.tsx                                       (C4)
├── stackedAreaChart/
│   ├── StackedAreaChart.test.tsx                                  (C5)
│   └── utils.test.ts                                              (C6)
├── statusBar/
│   ├── statusBarDataPlugin.test.tsx                               (C28)
│   └── statusBarDataPluginElement.test.tsx                        (C33)
├── statusBarSeparator/
│   └── statusBarSeparator.test.tsx                                (C14)
├── svg/
│   ├── dotsPattern.test.tsx                                       (C15)
│   └── hatchPattern.test.tsx                                      (C16)
├── tabContent/
│   ├── addSprint.test.tsx                                         (C37)
│   ├── dateRange.test.tsx                                         (C30)
│   ├── fileListFile.test.tsx                                      (C7)
│   ├── fileListFolder.test.tsx                                    (C8)
│   ├── fileSearch.test.tsx                                        (C9)
│   ├── fileTreeElementInfoDialog.test.tsx                         (C39)
│   ├── parametersGeneral.test.tsx                                 (C10)
│   └── visualizationOverview.test.tsx                             (C36)
├── tabController/
│   └── tabControllerButton.test.tsx                               (C11)
├── tabControllerButtonThemeSwitch/
│   └── tabControllerButtonThemeSwitch.test.tsx                    (C17)
├── tabs/
│   └── authors/
│       ├── authorList.test.tsx                                    (C41)
│       └── editAuthorDialog.test.tsx                              (C42)
└── tabMenu/
    ├── tab.test.tsx                                               (C22)
    ├── tabDropHint.test.tsx                                       (C25)
    └── tabSection.test.tsx                                        (C21)
```

---

## Notes

- **Redux-connected components** (C1, C2, C3, C4): Use a pre-configured test store via `configureStore` from Redux Toolkit. Pass it via `<Provider>`.
- **Timers** (C2.8, C2.9): Use `vi.useFakeTimers()` / `vi.advanceTimersByTime()`. Call `vi.useRealTimers()` in `afterEach`.
- **D3 components** (C5): jsdom does not support `SVGElement.getBBox()` or layout. Mock or stub methods that require a real browser layout engine.
- **SCSS modules**: Vitest handles CSS modules via identity proxy — use `data-testid` or element type selectors for assertions, not class names.
- **ResizeObserver**: jsdom does not implement it. A global mock is defined in `setup.ts`
---

---
