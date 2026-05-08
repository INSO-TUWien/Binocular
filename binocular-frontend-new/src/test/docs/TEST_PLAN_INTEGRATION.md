# Integration Tests

**Test ID convention**: `I{file_index}.{test_index}` — all integration tests share a single `I` prefix. No backend required for any of these tests. Tests are organized into `redux/` and `plugins/` subdirectories.

**Framework**: Vitest + jsdom
**DB adapter** (where applicable): `pouchdb-memory` — no file I/O, no network

**Setup notes**:
- Call `localStorage.clear()` in `beforeEach` and `afterEach` — reducers read `localStorage` during their `initialState` factory, so the store must be created *after* clearing or seeding storage.
- Use `createSagaMiddleware()` (not `runSaga`) for saga tests to mirror real app wiring.

---

## I1 — Redux store + actionsMiddleware
**File**: `src/test/integration/redux/storeWithActionsMiddleware.test.ts`
**Sources**: `src/redux/middleware/actions/actionsMiddleware.ts`, `src/redux/reducer/general/actionsReducer.ts`

Verifies that `actionsMiddleware` intercepts every dispatched action (except `setLastAction` itself) and records it in `actionsReducer.lastAction`.

| # | Description | Input | Expected output |
|---|---|---|---|
| I1.1 | Fresh store has `lastAction === undefined` | create store | `actions.lastAction` is `undefined` |
| I1.2 | Dispatching any action records its type | dispatch `{ type: 'test/foo' }` | `lastAction === 'test/foo'` |
| I1.3 | `setLastAction` itself does not recurse | dispatch `setLastAction(...)` | no infinite loop; `lastAction` set to dispatched value |
| I1.4 | Second dispatch overwrites `lastAction` | dispatch two actions | `lastAction` equals type of second action |
| I1.5 | Object payload is preserved in `actions.payload` | dispatch action with object payload | `actions.payload` deep-equals the dispatched payload |
| I1.6 | RTK slice action creator produces correct `lastAction` type | dispatch `addDataPlugin(...)` | `lastAction === 'settings/addDataPlugin'` |

---

## I2 — settingsReducer + localStorage persistence
**File**: `src/test/integration/redux/settingsLocalStorage.test.ts`
**Source**: `src/redux/reducer/settings/settingsReducer.ts`

Verifies round-trip: every mutation writes to `localStorage` (`settingsStateV1`), and a new store created after the mutation hydrates from that persisted state.

| # | Description | Input | Expected output |
|---|---|---|---|
| I2.1 | Fresh store writes initial state to `localStorage` | create store | `localStorage['settingsStateV1']` exists with `dataPlugins: []` |
| I2.2 | Store hydrates from pre-seeded `localStorage` | seed key before creating store | `settings.database.dataPlugins` matches seeded data |
| I2.3 | `addDataPlugin` (no id) assigns `id: 1` and persists | dispatch `addDataPlugin` | `plugin.id === 1`; `localStorage` updated |
| I2.4 | First added plugin is automatically default | dispatch `addDataPlugin` | `plugin.isDefault === true`; `defaultDataPluginItemId` set |
| I2.5 | Second added plugin is not default | dispatch `addDataPlugin` twice | second plugin has `isDefault === false` |
| I2.6 | `addDataPlugin` with existing id performs upsert | dispatch with existing id | list length unchanged; name updated |
| I2.7 | `removeDataPlugin` removes entry and persists | dispatch `removeDataPlugin` | `dataPlugins` length 0; `localStorage` updated |
| I2.8 | `setDataPluginAsDefault` marks exactly one plugin | add two plugins; set second as default | exactly one plugin has `isDefault === true` |
| I2.9 | `clearSettingsStorage` removes `localStorage` key | dispatch `clearSettingsStorage` | `localStorage.getItem('settingsStateV1') === null` |
| I2.10 | `setGeneralSettings` persists new value | dispatch with `gridSize: large` | `localStorage` and state both reflect new value |
| I2.11 | Removing the default plugin promotes the first remaining plugin to default | add two plugins; remove default | remaining plugin has `isDefault === true`; `defaultDataPluginItemId` updated |
| I2.12 | Removing the only (default) plugin clears `defaultDataPluginItemId` | add one plugin; remove it | `dataPlugins` empty; `defaultDataPluginItemId === undefined` |
| I2.13 | Removing a non-default plugin leaves the default unchanged | add two plugins; remove non-default | `defaultDataPluginItemId` unchanged; remaining plugin still `isDefault === true` |

---

## I3 — dashboardReducer: state grid + localStorage
**File**: `src/test/integration/redux/dashboardStateGrid.test.ts`
**Source**: `src/redux/reducer/general/dashboardReducer.ts`

Verifies that the 40×40 `dashboardState` grid remains consistent with `dashboardItems` across add/move/delete/clear, that collision detection rejects illegal moves, and that `localStorage` (`dashboardStateV1`) is kept in sync.

| # | Description | Input | Expected output |
|---|---|---|---|
| I3.1 | `addDashboardItem` auto-assigns `id: 1` on first item | dispatch `addDashboardItem` | `dashboardItems[0].id === 1` |
| I3.2 | Added 2×2 item marks exactly 4 grid cells | dispatch `addDashboardItem` with `width: 2, height: 2` | 4 grid cells contain the item's id |
| I3.3 | Two items placed sequentially do not share grid cells | add two 2×2 items | no overlapping cells |
| I3.4 | `moveDashboardItem` clears old cells and fills new ones | move item to free area | old cells → 0, new cells → item id |
| I3.5 | `moveDashboardItem` to occupied cell is rejected | try to move onto another item | item position unchanged |
| I3.6 | `deleteDashboardItem` removes item and zeros its cells | dispatch `deleteDashboardItem` | `dashboardItems` empty; cells → 0 |
| I3.7 | `clearDashboard` resets items, count, and all grid cells | add 3 items then clear | `items: []`, `count: 0`, all cells 0 |
| I3.8 | `setDashboardState` rebuilds grid from supplied items | dispatch with 2 positioned items | grid cells match item positions |
| I3.9 | Every mutation persists to `localStorage` | dispatch `addDashboardItem` | `localStorage['dashboardStateV1']` updated |
| I3.10 | Store hydrates `dashboardItems` and count from `localStorage` | seed via store1, create store2 | store2 has same items and count |

---

## I4 — tabsReducer + localStorage
**File**: `src/test/integration/redux/tabsLocalStorage.test.ts`
**Source**: `src/redux/reducer/general/tabsReducer.ts`

Verifies `setTabList` persists to `localStorage` (`tabsStateV1`), the store hydrates from a pre-seeded key on creation, and `clearTabsStorage` removes the key.

| # | Description | Input | Expected output |
|---|---|---|---|
| I4.1 | Fresh store writes empty `tabList` to `localStorage` | create store | `localStorage['tabsStateV1']` has `tabList: []` |
| I4.2 | `setTabList` updates state and persists | dispatch `setTabList([...])` | state and `localStorage` both have 2 tabs |
| I4.3 | Store hydrates `tabList` from pre-seeded `localStorage` | seed key before creating store | `tabs.tabList` matches seeded tabs |
| I4.4 | `clearTabsStorage` removes the `localStorage` key | dispatch `clearTabsStorage` | `localStorage.getItem('tabsStateV1') === null` |
| I4.5 | Second `setTabList` replaces first list entirely | dispatch twice | only items from second dispatch remain |

---

## I5 — refreshMiddleware → REFRESH_PLUGIN dispatch
**File**: `src/test/integration/redux/refreshMiddleware.test.ts`
**Source**: `src/redux/middleware/refresh/refreshMiddleware.ts`

Uses two stores: `globalStore` (spied on) and `localStore` (contains `refreshMiddleware`). Verifies that `progress/setProgress` triggers a `REFRESH_PLUGIN` dispatch on `globalStore`.

| # | Description | Input | Expected output |
|---|---|---|---|
| I5.1 | `progress/setProgress` dispatches `REFRESH_PLUGIN` on `globalStore` | dispatch to `localStore` | `globalStore.dispatch` called with `type: 'REFRESH_PLUGIN'` |
| I5.2 | `REFRESH_PLUGIN` payload carries the configured `pluginId` | configure with `id: 42` | `payload.pluginId === 42` |
| I5.3 | Non-matching actions do not trigger `REFRESH_PLUGIN` | dispatch `some/otherAction` | no `REFRESH_PLUGIN` call on `globalStore` |
| I5.4 | Original action still reaches `next` middleware | dispatch `progress/setProgress` | no error thrown; action processed normally |

---

## I6 — Changes saga + reducer + MockData
**File**: `src/test/integration/plugins/commitChangesSaga.test.ts`
**Sources**: `src/plugins/visualizationPlugins/commits/changes/src/`, `src/plugins/dataPlugins/mockData/src/`

Tests the full `setDateRange` / `REFRESH` → saga → `MockData.commits.getAll()` → store update flow. MockData always returns the same 11 hardcoded commits regardless of date range.

| # | Description | Input | Expected output |
|---|---|---|---|
| I6.1 | Fresh store has `dataState: EMPTY` | create store | `plugin.dataState === DataState.EMPTY` |
| I6.2 | `dataState` transitions to `FETCHING` before `getAll` resolves | dispatch `setDateRange`; capture mid-saga state | captured state is `DataState.FETCHING` |
| I6.3 | `dataState` reaches `COMPLETE` after saga finishes | dispatch `setDateRange` | `dataState === DataState.COMPLETE` |
| I6.4 | `commits` array is non-empty after saga | dispatch `setDateRange` | `commits.length > 0` |
| I6.5 | Each commit has `sha`, `date`, and `stats` fields | dispatch `setDateRange` | all commits have required fields |
| I6.6 | Second `setDateRange` re-fetches and reaches `COMPLETE` again | dispatch twice | `COMPLETE` reached after each dispatch |
| I6.7 | MockData always returns exactly 11 commits | dispatch `setDateRange` | `commits.length === 11` |
| I6.8 | Rapid `REFRESH` dispatches are throttled to ≤1 fetch per 5s | dispatch `REFRESH` 3× quickly | `getAll` called exactly once |

---

## I7 — MockData → dataConverter pipeline
**File**: `src/test/integration/plugins/mockDataToDataConverter.test.ts`
**Sources**: `src/plugins/dataPlugins/mockData/src/`, two `dataConverter.ts` utilities

Verifies that real MockData output can be piped through each `dataConverter` without errors and produces valid, non-NaN chart-ready data. No Redux involved.

| # | Description | Input | Expected output |
|---|---|---|---|
| I7.1 | `commits.getAll()` resolves to a non-empty array | call with 2024 date range | `length > 0`; first item has `sha` and `date` |
| I7.2 | `accountsIssues.getAll()` resolves to a non-empty array | call `getAll()` | `length > 0`; first item has `id` and `issues` |
| I7.3 | `convertCommitDataToMetrics` returns valid metrics with no `NaN` | pipe commits through converter | object has `mpc`, `entropy`, `maxBurst`, etc.; no `NaN` values |
| I7.4 | `convertToGraphData` returns nodes and links with no `NaN` | pipe accounts through converter | `nodes.length > 0`; no `NaN` in `node.group` |
| I7.5 | No exception thrown when piping commits through converter | call pipeline end-to-end | promise resolves without throwing |

---

## I8 — PouchDB data plugin collections
**File**: `src/test/integration/plugins/pouchDbCollections.test.ts`
**Source**: `src/plugins/dataPlugins/pouchDB/src/`

Verifies that each collection method returns the correct shape and count when the in-memory PouchDB is pre-seeded with fixture documents. Also verifies date-range filtering on commits.

| # | Description | Input | Expected output |
|---|---|---|---|
| I8.1 | `commits.getAll()` returns all seeded commit docs | seed 3 commit docs | array of length 3 with correct `sha` and `date` fields |
| I8.2 | `commits.getAll(from, to)` filters by date range | seed commits inside and outside range | only in-range commits returned |
| I8.3 | `files.getAll()` returns all seeded file docs | seed 2 files | array of length 2 with correct shape |
| I8.4 | `issues.getAll()` returns all seeded issue docs | seed 2 issues | array of length 2 with correct shape |
| I8.5 | `builds.getAll()` returns all seeded build docs | seed 1 build | array of length 1 |
| I8.6 | `accounts.getAll()` returns all seeded account docs | seed 2 accounts | array of length 2 |
| I8.7 | Empty DB returns empty array for every collection | no seed | `length === 0` for commits, files, issues, builds, accounts |
| I8.8 | `general.getIndexer()` returns PouchDB indexer identifiers | call `getIndexer()` | `vcs`, `its`, `ci` all equal `'PouchDB'` |

---

## I9 — DatabaseLoaders.loadJsonFilesToPouchDB dispatch sequence
**File**: `src/test/integration/plugins/databaseLoaders.test.ts`
**Source**: `src/utils/databaseLoaders.ts`

Verifies the exact sequence of Redux dispatches emitted while loading pre-exported JSON into PouchDB. Uses a real Redux store and spies on `PouchDB.init` / `PouchDB.clearRemains` to avoid loading the full JSON export fixtures from disk.

> **CI note**: `src/db_export/` is gitignored (runtime data). `vitest.config.ts` contains a `dbExportStubPlugin` that intercepts all `db_export/*.json` imports at module resolution time — `metadata.json` resolves to a minimal fixture (`namespace`, `createdAt`); all other collection files resolve to `[]`. No actual export files are needed to run these tests.

| # | Description | Input | Expected output |
|---|---|---|---|
| I9.1 | Dispatches `setLocalDatabaseLoadingState(loading)` before `init` resolves | call `loadJsonFilesToPouchDB(dispatch)` | `localDatabaseLoadingState` is `loading` before `init` completes |
| I9.2 | Dispatches `addDataPlugin` after `init` completes | call `loadJsonFilesToPouchDB` | `settings.database.dataPlugins` contains a new PouchDb entry |
| I9.3 | Dispatches `setLocalDatabaseLoadingState(none)` as loading finishes | call `loadJsonFilesToPouchDB` | `localDatabaseLoadingState` ends at `none` |
| I9.4 | Dispatches `REFRESH_PLUGIN` as the final action | call `loadJsonFilesToPouchDB` | `actions.lastAction === 'REFRESH_PLUGIN'` |
| I9.5 | Skips loading when existing plugin `createdAt` is same or newer | pre-seed `localStorage` with `createdAt >= metadata.createdAt` | `PouchDB.init` not called |
| I9.6 | Calls `PouchDB.clearRemains()` before `init` when existing plugin is stale | existing plugin with older `createdAt` | `clearRemains` called exactly once before `init` |
| I9.7 | Added plugin carries correct `fileName` and `metadata` | call `loadJsonFilesToPouchDB` | `plugin.parameters.fileName === metadata.namespace`; `plugin.metadata.createdAt` is set |

---

## I10 — Offline saga + PouchDB plugin pipeline
**File**: `src/test/integration/plugins/offlineCommitChangesSaga.test.ts`
**Sources**:
- `src/plugins/visualizationPlugins/commits/changes/src/saga/index.ts`
- `src/plugins/visualizationPlugins/commits/changes/src/reducer/index.ts`
- `src/plugins/dataPlugins/pouchDB/src/index.ts`

Mirrors the Changes saga flow (I6) but wired to the real PouchDB plugin backed by `pouchdb-memory`. Confirms the offline path produces the same Redux state transitions.

| # | Description | Input | Expected output |
|---|---|---|---|
| I10.1 | `setDateRange` with seeded commits sets `dataState` to `COMPLETE` | seed commits in memory DB; dispatch `setDateRange` | `dataState === DataState.COMPLETE` |
| I10.2 | `commits` is populated from PouchDB after saga runs | seed 3 commits | `commits.length === 3` |
| I10.3 | `setDateRange` triggers a re-fetch from PouchDB | seed commits with two different dates; dispatch `setDateRange` twice | `commits` updated to match each range |
| I10.4 | Empty PouchDB yields `commits: []` with `COMPLETE` state | no seeded commits; dispatch `setDateRange` | `commits: []`; `dataState === DataState.COMPLETE` |

---

---

## I11 — parametersReducer + localStorage
**File**: `src/test/integration/redux/parametersLocalStorage.test.ts`
**Source**: `src/redux/reducer/parameters/parametersReducer.ts`

Verifies that the parameters reducer reads and writes `parametersStateV1` in localStorage, hydrates state on creation, persists on mutation, and clears on demand.

| # | Description | Input | Expected output |
|---|---|---|---|
| I11.1 | Fresh store writes initial state to localStorage | create store | `parametersStateV1` exists; `granularity: 'weeks'`, `excludeMergeCommits: false` |
| I11.2 | Store hydrates from pre-seeded localStorage | seed key before creating store | state matches seeded values |
| I11.3 | `setParametersGeneral` updates state and persists | dispatch with `granularity: 'days'` | state and localStorage both updated |
| I11.4 | `setParametersDateRange` updates state and persists | dispatch with `from`/`to` | `parametersDateRange` updated in state and localStorage |
| I11.5 | `clearParametersStorage` removes the localStorage key | dispatch `clearParametersStorage` | `localStorage.getItem('parametersStateV1') === null` |
| I11.6 | `importParametersStorage` writes payload to localStorage | dispatch with `granularity: 'days'` payload | localStorage reflects imported values |
| I11.7 | `importParametersStorage` does NOT update Redux state (Immer no-op) | dispatch `importParametersStorage` | Redux state unchanged — documents `state = action.payload` Immer bug |

---

## I12 — layoutReducer + localStorage
**File**: `src/test/integration/redux/layoutLocalStorage.test.ts`
**Source**: `src/redux/reducer/general/layoutReducer.ts`

Verifies custom dashboard layout creation, id assignment, deletion, and localStorage persistence under `layoutStateV1`.

| # | Description | Input | Expected output |
|---|---|---|---|
| I12.1 | Fresh store writes `{ customLayouts: [], customLayoutCount: 0 }` to localStorage | create store | key exists with empty array and zero count |
| I12.2 | `addCustomLayout` assigns `id = customLayoutCount` before incrementing | dispatch `addCustomLayout` | `layouts[0].id === 0` |
| I12.3 | Two `addCustomLayout` calls assign distinct IDs | dispatch twice | `layouts[0].id !== layouts[1].id` |
| I12.4 | `deleteCustomLayout` removes entry and persists | add then delete | `customLayouts` empty in state and localStorage |
| I12.5 | Store hydrates `customLayouts` from pre-seeded localStorage | seed key before creating store | layouts and count match seeded data |

---

## I13 — notificationsReducer + exportReducer (in-memory)
**File**: `src/test/integration/redux/inMemoryReducers.test.ts`
**Sources**: `src/redux/reducer/general/notificationsReducer.ts`, `src/redux/reducer/export/exportReducer.ts`

Verifies two reducers that do not use localStorage. No `beforeEach` cleanup needed.

| # | Description | Input | Expected output |
|---|---|---|---|
| I13.1 | Fresh notifications store has `notificationList: []` and `currID: 0` | create store | initial values as stated |
| I13.2 | `addNotification` assigns auto-incremented `id` and appends | dispatch with text and type | `notificationList[0].id === 0`; `currID === 1` |
| I13.3 | `removeNotification(id)` removes the matching entry | add two; remove first | list length 1; second item remains |
| I13.4 | Fresh export store has `exportType: all` and `exportName: 'export'` | create store | initial values as stated |
| I13.5 | `setExportType(image)` updates `exportType` | dispatch | `exportType === ExportType.image` |
| I13.6 | `setExportName` and `setExportSVGData` update their fields | dispatch both | name and SVG data updated in state |

---

## I14 — authorsReducer + localStorage
**File**: `src/test/integration/redux/authorsLocalStorage.test.ts`
**Source**: `src/redux/reducer/data/authorsReducer.ts`

Verifies author list management per data-plugin-id. **Do NOT dispatch `editAuthor`** — it calls `showModal()` which crashes in jsdom.

| # | Description | Input | Expected output |
|---|---|---|---|
| I14.1 | Fresh store writes initial state to localStorage | create store | `authorsStateV1` key exists |
| I14.2 | `setAuthorList` stores list under `dataPluginId` and persists | dispatch with 2 authors | list of 2 in state and localStorage |
| I14.3 | `switchAuthorSelection(id)` toggles `selected` for matching author | add author; switch selection | `selected` flips from `false` to `true` |
| I14.4 | `checkAllAuthors` sets all `selected: true` | add 2 authors; dispatch | all authors have `selected === true` |
| I14.5 | `uncheckAllAuthors` sets all `selected: false` | check all; then uncheck all | all authors have `selected === false` |
| I14.6 | `clearAuthorsStorage` removes the localStorage key | dispatch | `localStorage.getItem('authorsStateV1') === null` |

---

## I15 — accountsReducer + localStorage
**File**: `src/test/integration/redux/accountsLocalStorage.test.ts`
**Source**: `src/redux/reducer/data/accountsReducer.ts`

Verifies account list management per data-plugin-id and persistence under `accountsStateV1`.

| # | Description | Input | Expected output |
|---|---|---|---|
| I15.1 | Fresh store writes initial state to localStorage | create store | `accountsStateV1` key exists |
| I15.2 | `setAccountList` stores list under `dataPluginId` and persists | dispatch with 2 accounts | list of 2 in state and localStorage |
| I15.3 | Second `setAccountList` for same `pluginId` replaces the previous list | dispatch twice | only accounts from second dispatch remain |
| I15.4 | `clearAccountsStorage` removes the localStorage key | dispatch | `localStorage.getItem('accountsStateV1') === null` |

---

## I16 — sprintsReducer + localStorage
**File**: `src/test/integration/redux/sprintsLocalStorage.test.ts`
**Source**: `src/redux/reducer/data/sprintsReducer.ts`

Verifies sprint CRUD and persistence under `sprintsStateV1`. **Do NOT dispatch `sprintToEdit`** — it calls `showModal()`. `SprintType` uses `startDate`/`endDate` (not `from`/`to`).

| # | Description | Input | Expected output |
|---|---|---|---|
| I16.1 | Fresh store writes `{ sprintList: [], currID: 0 }` to localStorage | create store | key exists with empty list and zero count |
| I16.2 | `addSprint` assigns `id = currID` before incrementing and persists | dispatch | `sprintList[0].id === 0`; `currID === 1` |
| I16.3 | Two `addSprint` calls assign distinct IDs | dispatch twice | `sprintList[0].id !== sprintList[1].id` |
| I16.4 | `deleteSprint(sprint)` removes the sprint and persists | add then delete | `sprintList` empty in state and localStorage |
| I16.5 | `clearSprintStorage` removes the localStorage key | dispatch | `localStorage.getItem('sprintsStateV1') === null` |

---

## I17 — MockData → 6 convertToChartData functions
**File**: `src/test/integration/plugins/mockDataToConverters.test.ts`
**Sources**: MockData + 6 converter utilities

Extends I7 to cover all six visualization plugin converters. Props are minimal stubs (split flags set to `false`, empty `authorList`).

| # | Description | Input | Expected output |
|---|---|---|---|
| I17.1 | `builds/builds convertToChartData` returns `{ chartData, scale, palette }` with no NaN | MockData builds | all fields present; no NaN in `chartData` |
| I17.2 | `commits/changes convertToChartData` returns same shape with no NaN | MockData commits | all fields present; no NaN |
| I17.3 | `commits/fileChanges convertCommitDataToChangesChartData` returns `{ commitChartData, commitScale, commitPalette }` | MockData commits | all fields present; no NaN in `commitChartData` |
| I17.4 | `issues/issues convertToChartData` returns correct shape with no NaN | MockData issues | all fields present; no NaN |
| I17.5 | `issues/mergeRequests convertToChartData` returns correct shape with no NaN | MockData mergeRequests | all fields present; no NaN |
| I17.6 | `authorBehaviour/timeSpent convertToChartData` returns correct shape with no NaN | MockData notes | all fields present; no NaN |

---

## I18 — issues/issues saga + MockData
**File**: `src/test/integration/plugins/issuesSaga.test.ts`
**Sources**: `src/plugins/visualizationPlugins/issues/issues/src/`, `src/plugins/dataPlugins/mockData/src/`

| # | Description | Input | Expected output |
|---|---|---|---|
| I18.1 | Fresh store has `dataState: EMPTY` | create store | `plugin.dataState === DataState.EMPTY` |
| I18.2 | `dataState` reaches `COMPLETE` after `setDateRange` | dispatch `setDateRange` | `dataState === DataState.COMPLETE` |
| I18.3 | `issues` array is non-empty after saga | dispatch `setDateRange` | `issues.length > 0` |
| I18.4 | Each issue has `iid`, `title`, and `state` fields | dispatch `setDateRange` | all issues have required fields |

---

## I19 — builds/builds saga + MockData
**File**: `src/test/integration/plugins/buildsSaga.test.ts`
**Sources**: `src/plugins/visualizationPlugins/builds/builds/src/`, `src/plugins/dataPlugins/mockData/src/`

| # | Description | Input | Expected output |
|---|---|---|---|
| I19.1 | Fresh store has `dataState: EMPTY` | create store | `plugin.dataState === DataState.EMPTY` |
| I19.2 | `dataState` reaches `COMPLETE` after `setDateRange` | dispatch `setDateRange` | `dataState === DataState.COMPLETE` |
| I19.3 | `builds` array is non-empty after saga | dispatch `setDateRange` | `builds.length > 0` |
| I19.4 | Each build has `id`, `status`, and `createdAt` fields | dispatch `setDateRange` | all builds have required fields |

---

## I20 — authorBehaviour/collaboration saga + MockData
**File**: `src/test/integration/plugins/collaborationSaga.test.ts`
**Sources**: `src/plugins/visualizationPlugins/authorBehaviour/collaboration/src/`, `src/plugins/dataPlugins/mockData/src/`

The collaboration saga selects via `yield select((root) => root.plugin)` — store registered under key `'plugin'`.

| # | Description | Input | Expected output |
|---|---|---|---|
| I20.1 | Fresh store has `dataState: EMPTY` | create store | `plugin.dataState === DataState.EMPTY` |
| I20.2 | `dataState` reaches `COMPLETE` after `setDateRange` | dispatch `setDateRange` | `dataState === DataState.COMPLETE` |
| I20.3 | `issueAccounts` array is non-empty after saga | dispatch `setDateRange` | `issueAccounts.length > 0` |
| I20.4 | Each account has `id` and `issues` fields | dispatch `setDateRange` | all accounts have required fields |

---

## I21 — authorBehaviour/timeSpent saga + MockData
**File**: `src/test/integration/plugins/timeSpentSaga.test.ts`
**Sources**: `src/plugins/visualizationPlugins/authorBehaviour/timeSpent/src/`, `src/plugins/dataPlugins/mockData/src/`

The timeSpent saga uses a bare `yield select()` — the store must use `reducer: timeSpentReducer` directly (no `plugin` wrapper). State is accessed as `store.getState().dataState`. `DataPluginNote` has no `id` field.

| # | Description | Input | Expected output |
|---|---|---|---|
| I21.1 | Fresh store has `dataState: EMPTY` | create store | `store.getState().dataState === DataState.EMPTY` |
| I21.2 | `dataState` reaches `COMPLETE` after `setDateRange` | dispatch `setDateRange` | `dataState === DataState.COMPLETE` |
| I21.3 | `notes` array is non-empty after saga | dispatch `setDateRange` | `notes.length > 0` |
| I21.4 | Each note has `body`, `createdAt`, and `author` fields | dispatch `setDateRange` | all notes have required fields (no `id` on `DataPluginNote`) |

---

## Integration test file locations

```
src/test/integration/
├── helpers.ts                                (shared utilities)
├── redux/
│   ├── storeWithActionsMiddleware.test.ts    (I1)
│   ├── settingsLocalStorage.test.ts          (I2)
│   ├── dashboardStateGrid.test.ts            (I3)
│   ├── tabsLocalStorage.test.ts              (I4)
│   ├── refreshMiddleware.test.ts             (I5)
│   ├── parametersLocalStorage.test.ts        (I11)
│   ├── layoutLocalStorage.test.ts            (I12)
│   ├── inMemoryReducers.test.ts              (I13)
│   ├── authorsLocalStorage.test.ts           (I14)
│   ├── accountsLocalStorage.test.ts          (I15)
│   └── sprintsLocalStorage.test.ts           (I16)
└── plugins/
    ├── commitChangesSaga.test.ts             (I6)
    ├── mockDataToDataConverter.test.ts       (I7)
    ├── pouchDbCollections.test.ts            (I8)
    ├── databaseLoaders.test.ts               (I9)
    ├── offlineCommitChangesSaga.test.ts      (I10)
    ├── mockDataToConverters.test.ts          (I17)
    ├── issuesSaga.test.ts                    (I18)
    ├── buildsSaga.test.ts                    (I19)
    ├── collaborationSaga.test.ts             (I20)
    └── timeSpentSaga.test.ts                 (I21)
```