# Unit Tests

**Framework**: Vitest
**Test ID convention**: `U{file_index}.{test_index}`

Tests cover pure functions and utility helpers with no DOM, no Redux, and no network. Each test file targets a single source module and imports it directly.

---

## U1 — `authorBehaviour/collaboration/dataConverter`
**File**: `src/test/unit/plugins/visualizationPlugins/authorBehaviour/collaboration/dataConverter.test.ts`
**Source**: `src/plugins/visualizationPlugins/authorBehaviour/collaboration/src/utilities/dataConverter.ts`

### `convertToGraphData(issueAccounts, mrAccounts, settings)`

| # | Description | Input | Expected output |
|---|---|---|---|
| U1.1 | Returns empty nodes and links for empty input | `[]` | `{ nodes: [], links: [] }` |
| U1.2 | Creates one node per account | 2 accounts, no issues | 2 nodes with matching ids |
| U1.3 | Creates a link between two accounts that share an issue | 2 accounts with same issue | 1 link with `value: 1` |
| U1.4 | Increments link value for each shared issue | 2 accounts sharing 2 issues | link `value === 2` |
| U1.5 | Does not create a link when accounts share no issues | 2 accounts with disjoint issues | `links.length === 0` |
| U1.6 | Filters out links below `minEdgeValue` | `minEdgeValue: 2`, link value 1 | `links.length === 0` |
| U1.7 | Filters out links above `maxEdgeValue` | `maxEdgeValue: 2`, link value 3 | `links.length === 0` |
| U1.8 | Assigns connected accounts to the same group | 2 accounts sharing an issue | both nodes have equal `group` |
| U1.9 | Assigns isolated accounts to different groups | 2 accounts with disjoint issues | nodes have different `group` |

---

## U2 — `commits/fileChanges/dataConverter`
**File**: `src/test/unit/plugins/visualizationPlugins/commits/fileChanges/dataConverter.test.ts`
**Source**: `src/plugins/visualizationPlugins/commits/fileChanges/src/utilities/dataConverter.ts`

### `convertCommitDataToMetrics(commits, from, to, gapSize?, burstSize?)`

| # | Description | Input | Expected output |
|---|---|---|---|
| U2.1 | Returns all zeros for an empty commits array | `[]` | `{ mpc: 0, entropy: 0, maxBurst: 0, maxChangeset: 0, avgChangeset: 0 }` |
| U2.2 | Returns all zeros for null input | `null` | same all-zero object |
| U2.3 | Returns non-zero entropy for commits spread across the timeline | 3 commits spread across the year | `entropy > 0` |
| U2.4 | Returns zero entropy for a single commit | 1 commit | `entropy ≈ 0` |
| U2.5 | `mpc` is bounded between 0 and 100 | any valid input | `0 ≤ mpc ≤ 100` |
| U2.6 | Detects a burst of rapid commits | 3 commits within 1 hour | `maxBurst === 3` |
| U2.7 | Returns `maxBurst: 0` when commits are separated by more than gapSize | `gapSize: 1 ms`, 2 far-apart commits | `maxBurst === 0` |
| U2.8 | Computes `maxChangeset` from number of files per commit | commit with 3 files | `maxChangeset === 2` |
| U2.9 | Returns `maxChangeset: 0` when all commits touch 0 or 1 file | commits with 0/1 files | `maxChangeset === 0` |
| U2.10 | Computes `avgChangeset` as mean changeset size | commits with changeset sizes 2 and 4 | `avgChangeset ≈ 3` |
| U2.11 | Handles custom `burstSize` threshold | 2 commits, `burstSize: 3` | `maxBurst === 0` |

### `convertCommitDataToChangesChartData(commits, authors, splitAdditionsDeletions, parameters)`

| # | Description | Input | Expected output |
|---|---|---|---|
| U2.12 | Returns empty result for empty commits array | `[]` | `{ commitChartData: [], commitPalette: {}, commitScale: [] }` |
| U2.13 | `splitAdditionsDeletions=false` → palette key is author signature | 1 author, 1 commit | `"Alice"` in palette, no `"(Additions)"` keys |
| U2.14 | `splitAdditionsDeletions=true` → palette keys contain `"(Additions)"` and `"(Deletions)"` | 1 author, 1 commit | `"(Additions) Alice"` and `"(Deletions) Alice"` in palette |
| U2.15 | `commitScale[1]` is positive when commits have additions | commit with 5 additions | `commitScale[1] > 0` |
| U2.16 | `commitChartData` has one or more time-bucket entries | 1 commit | `commitChartData.length > 0` |

---

## U3 — `expertise/codeExpertise/dbUtils`
**File**: `src/test/unit/plugins/visualizationPlugins/expertise/codeExpertise/dbUtils.test.ts`
**Source**: `src/plugins/visualizationPlugins/expertise/codeExpertise/src/utilities/dbUtils.ts`

### `getHistoryForCommit(commit, allCommits)`

| # | Description | Input | Expected output |
|---|---|---|---|
| U3.1 | Returns only the commit itself for a genesis commit (no parents) | single root commit | `[commit.sha]` |
| U3.2 | Follows a linear chain and returns SHAs sorted newest-first | A→B→C chain, query C | `['ccc', 'bbb', 'aaa']` |
| U3.3 | Includes commits from both branches of a merge | diamond graph, query merge commit | all 4 SHAs present, length 4 |
| U3.4 | Does not duplicate commits already in history | diamond graph | each SHA appears once |
| U3.5 | Result is sorted with newest SHA first | 2-commit chain | first element is the head SHA |

---

## U4 — `issues/burndown/groupIssuesByGranularity`
**File**: `src/test/unit/plugins/visualizationPlugins/issues/burndown/groupIssuesByGranularity.test.ts`
**Source**: `src/plugins/visualizationPlugins/issues/burndown/src/chart/helper/groupIssuesByGranularity.ts`

### `groupIssuesByGranularity(start, end, issues, granularity)`

| # | Description | Input | Expected output |
|---|---|---|---|
| U4.1 | Yields one entry per day plus one final entry for a 3-day range | `start: Jan 1, end: Jan 3, 'day'` | 3 group entries |
| U4.2 | Always yields a final entry at the end date | same start and end date | last entry's `date` equals `end` |
| U4.3 | Assigns sequential ids starting at 0 | 2-day range | `groups[0].id === 0`, `groups[1].id === 1` |
| U4.4 | Includes an issue that is open during the queried date | issue open from May to July, query June | issue in `groups[0].issues` |
| U4.5 | Excludes an issue closed before the queried date | issue closed in March, query June | issue not in `groups[0].issues` |
| U4.6 | Yields one entry per month for a month-granularity range | Jan–Mar range, `'month'` | 3 group entries |

---

## U5 — `issues/burndown/pairUpDataPoints`
**File**: `src/test/unit/plugins/visualizationPlugins/issues/burndown/pairUpDataPoints.test.ts`
**Source**: `src/plugins/visualizationPlugins/issues/burndown/src/chart/helper/pairUpDataPoints.ts`

### `pairUpDataPoints(groups)`

| # | Description | Input | Expected output |
|---|---|---|---|
| U5.1 | Yields no pairs for an empty array | `[]` | iterator is empty |
| U5.2 | Yields no pairs for a single-element array | `[g0]` | iterator is empty |
| U5.3 | Yields one pair for a two-element array | `[g0, g1]` | 1 pair: `[g0, g1]` |
| U5.4 | Yields n-1 pairs for an n-element array | 4 elements | 3 pairs |
| U5.5 | Each pair consists of consecutive elements | `[g0, g1, g2]` | `pairs[0]=[g0,g1]`, `pairs[1]=[g1,g2]` |

---

## U6 — `issues/issuesTimeline/aggregateTimeTrackingData`
**File**: `src/test/unit/plugins/visualizationPlugins/issues/issuesTimeline/aggregateTimeTrackingData.test.ts`
**Source**: `src/plugins/visualizationPlugins/issues/issuesTimeline/src/chart/helper/aggregateTimeTrackingData.ts`

### `aggregateTimeTrackingData(entries)`

| # | Description | Input | Expected output |
|---|---|---|---|
| U6.1 | Returns empty map and `totalTime: 0` for empty input | `[]` | `{ map.size === 0, totalTime === 0 }` |
| U6.2 | Records a single entry correctly | Alice, 2h | `map.get('Alice') === 2`, `totalTime === 2` |
| U6.3 | Accumulates time for the same author | Alice 1h + Alice 3h | `map.get('Alice') === 4` |
| U6.4 | Keeps different authors separate | Alice 2h, Bob 5h | both entries correct, `totalTime === 7` |
| U6.5 | `totalTime` equals the sum of all `timeSpent` values | Alice 1.5h, Bob 2.5h, Alice 1h | `totalTime ≈ 5` |

---

## U7 — `issues/issuesTimeline/groupSimilarLabels`
**File**: `src/test/unit/plugins/visualizationPlugins/issues/issuesTimeline/groupSimilarLabels.test.ts`
**Source**: `src/plugins/visualizationPlugins/issues/issuesTimeline/src/chart/helper/groupSimilarLabels.ts`

### `groupSimilarLabels(labels, epsilon?, minPoints?)`

| # | Description | Input | Expected output |
|---|---|---|---|
| U7.1 | Returns an empty map for empty input | `[]` | `new Map()` |
| U7.2 | Treats an isolated string as noise (placed in `defaultLabelGroupId`) | `['foo'], ε=1, minPts=2` | `foo` in noise group |
| U7.3 | Groups closely related strings into the same cluster | `['bug', 'Bug'], ε=1, minPts=2` | one non-noise cluster containing both |
| U7.4 | Produces separate clusters for clearly different strings | `['bug','Bug','feature','Feature'], ε=1, minPts=2` | ≥ 2 clusters |
| U7.5 | All strings cluster together when epsilon is very large | `['a','bbb','ccccc'], ε=100, minPts=1` | 1 cluster containing all |
| U7.6 | Uses default `ε=3, minPts=2` when not specified | `['bug','bugs','feature']` | `bug` cluster also contains `bugs` |

---

## U8 — `issues/issuesTimeline/initializeLevenshteinDPTable`
**File**: `src/test/unit/plugins/visualizationPlugins/issues/issuesTimeline/initializeLevenshteinDPTable.test.ts`
**Source**: `src/plugins/visualizationPlugins/issues/issuesTimeline/src/chart/helper/initializeLevenshteinDPTable.ts`

### `initializeLevenshteinDPTable(a, b)`

| # | Description | Input | Expected output |
|---|---|---|---|
| U8.1 | Returns a table of dimensions `(a.length+1) × (b.length+1)` | `'cat', 'dog'` | 4 rows × 4 columns |
| U8.2 | First row is `[0, 1, 2, … b.length]` | `'cat', 'abcd'` | `table[0] === [0,1,2,3,4]` |
| U8.3 | First column is `[0, 1, 2, … a.length]` | `'abcd', 'cat'` | `table[i][0] === i` for each i |
| U8.4 | All interior cells `(i>0, j>0)` are -1 | `'ab', 'xy'` | `table[i][j] === -1` for i,j > 0 |
| U8.5 | Handles single-character strings | `'a', 'b'` | 2×2 table with `[0,1]` first row, `[1,-1]` second row |

---

## U9 — `issues/issuesTimeline/initializeLevenshteinMatrix`
**File**: `src/test/unit/plugins/visualizationPlugins/issues/issuesTimeline/initializeLevenshteinMatrix.test.ts`
**Source**: `src/plugins/visualizationPlugins/issues/issuesTimeline/src/chart/helper/initializeLevenshteinMatrix.ts`

### `initializeLevenshteinMatrix(strings)`

| # | Description | Input | Expected output |
|---|---|---|---|
| U9.1 | Returns an empty map for empty input | `[]` | `new Map()` |
| U9.2 | Contains an entry for every input string | `['bug','fix','feat']` | all 3 keys present |
| U9.3 | Self-distance is 0 | `['hello']` | `matrix.get('hello').get('hello') === 0` |
| U9.4 | Is symmetric — `distance(a,b) === distance(b,a)` | `['cat','dog']` | equal in both directions |
| U9.5 | Computes correct distance for known pairs | `['kitten','sitting']` | distance === 3 |
| U9.6 | Handles duplicate strings without error | `['bug','bug']` | self-distance 0, no throw |
| U9.7 | Single-element array has only self-distance | `['only']` | inner map has size 1 |

---

## U10 — `issues/issuesTimeline/levenshteinDistance`
**File**: `src/test/unit/plugins/visualizationPlugins/issues/issuesTimeline/levenshteinDistance.test.ts`
**Source**: `src/plugins/visualizationPlugins/issues/issuesTimeline/src/chart/helper/levenshteinDistance.ts`

### `levenshteinDistance(a, b)`

| # | Description | Input | Expected output |
|---|---|---|---|
| U10.1 | Returns 0 for identical strings | `'cat', 'cat'` | `0` |
| U10.2 | Returns `b.length` when `a` is empty | `'', 'abc'` | `3` |
| U10.3 | Returns `a.length` when `b` is empty | `'abc', ''` | `3` |
| U10.4 | Returns 0 for two empty strings | `'', ''` | `0` |
| U10.5 | Returns 1 for a single substitution | `'cat', 'bat'` | `1` |
| U10.6 | Returns 1 for a single insertion | `'cat', 'cats'` | `1` |
| U10.7 | Returns 1 for a single deletion | `'cats', 'cat'` | `1` |
| U10.8 | Calculates the classic kitten→sitting distance | `'kitten', 'sitting'` | `3` |
| U10.9 | Is commutative — `distance(a,b) === distance(b,a)` | `'sunday', 'saturday'` | equal in both directions |
| U10.10 | Handles strings differing only in case | `'Bug', 'bug'` | `1` |

---

## U11 — `ownership/codeOwnership/cryptoUtils`
**File**: `src/test/unit/plugins/visualizationPlugins/ownership/codeOwnership/cryptoUtils.test.ts`
**Source**: `src/plugins/visualizationPlugins/ownership/codeOwnership/src/utils/cryptoUtils.ts`

### `hash(value)`

> Requires `crypto.subtle` — available in jsdom 20+ / Node 19+. Vitest's jsdom environment covers this.

| # | Description | Input | Expected output |
|---|---|---|---|
| U11.1 | Returns a non-empty base64 string | `'hello'` | length > 0, valid base64 |
| U11.2 | Is deterministic — same input produces the same hash | `'hello'` called twice | both results identical |
| U11.3 | Different inputs produce different hashes | `'hello'` vs `'world'` | results differ |
| U11.4 | Empty string resolves without throwing | `''` | resolves to a non-empty string |

---

## U12 — `ownership/codeOwnership/dateUtils`
**File**: `src/test/unit/plugins/visualizationPlugins/ownership/codeOwnership/dateUtils.test.ts`
**Source**: `src/plugins/visualizationPlugins/ownership/codeOwnership/src/utils/dateUtils.ts`

### `formatDate(date, resolution)`

| # | Description | Input | Expected output |
|---|---|---|---|
| U12.1 | `years` resolution returns just the year | `new Date('2023-06-12'), 'years'` | `'2023'` |
| U12.2 | `months` resolution returns month name + year | `new Date('2023-06-12'), 'months'` | `'June 2023'` |
| U12.3 | `months` resolution — January (boundary: first month) | month index 0 | contains `'January'` |
| U12.4 | `months` resolution — December (boundary: last month) | month index 11 | contains `'December'` |
| U12.5 | `weeks` resolution starts with "Week starting at" | `new Date('2023-06-12'), 'weeks'` | starts with `'Week starting at'` |
| U12.6 | `days` resolution starts with the day name | `new Date('2023-06-12'), 'days'` | starts with `'Monday'` |
| U12.7 | Unknown resolution falls back to `toLocaleDateString()` | `date, 'hours'` | equals `date.toLocaleDateString()` |

### `getGranularityDuration(resolution)`

| # | Description | Input | Expected output |
|---|---|---|---|
| U12.8 | `years` returns unit `'year'` and a 1-year duration | `'years'` | `{ unit: 'year', interval: duration(1,'year') }` |
| U12.9 | `months` returns unit `'month'` and a 1-month duration | `'months'` | `unit === 'month'` |
| U12.10 | `weeks` returns unit `'week'` and a 1-week duration | `'weeks'` | `unit === 'week'` |
| U12.11 | `days` returns unit `'day'` and a 1-day duration | `'days'` | `unit === 'day'` |
| U12.12 | Unknown resolution returns `{ interval: 0, unit: '' }` | `'hours'` | `{ interval: 0, unit: '' }` |

### `formatDate` (extended)

| # | Description | Input | Expected output |
|---|---|---|---|
| U12.13 | `years` resolution returns just the 4-digit year | `new Date('2021-08-25'), 'years'` | `'2021'` |
| U12.14 | `months` resolution returns month+year string | `new Date('2021-08-25'), 'months'` | `'August 2021'` |
| U12.15 | `weeks` resolution returns a non-empty string | `new Date('2021-08-23'), 'weeks'` | non-empty string |
| U12.16 | `days` resolution returns a day-level formatted string | `new Date('2021-08-23'), 'days'` | starts with `'Monday'`, contains `','` |
| U12.17 | Unknown resolution `'hours'` falls through without throwing | `date, 'hours'` | equals `date.toLocaleDateString()` |

### `getGranularityDuration` (extended)

| # | Description | Input | Expected output |
|---|---|---|---|
| U12.18 | `years` returns a duration equivalent to 1 year | `'years'` | `isDuration === true`, `as('years') === 1` |
| U12.19 | `months` returns a duration equivalent to 1 month | `'months'` | `as('months') === 1` |
| U12.20 | `weeks` returns a duration equivalent to 1 week | `'weeks'` | `as('weeks') === 1` |
| U12.21 | `days` returns a duration equivalent to 1 day | `'days'` | `as('days') === 1` |
| U12.22 | Unknown resolution `'hours'` — result is defined with `interval === 0` and `unit === ''` | `'hours'` | `{ interval: 0, unit: '' }` |

---

## U13 — `ownership/codeOwnership/ownershipUtils`
**File**: `src/test/unit/plugins/visualizationPlugins/ownership/codeOwnership/ownershipUtils.test.ts`
**Source**: `src/plugins/visualizationPlugins/ownership/codeOwnership/src/utils/ownershipUtils.ts`

### `extractOwnershipFromFileExcludingCommits(fileOwnershipData, commitsToExclude?)`

| # | Description | Input | Expected output |
|---|---|---|---|
| U13.1 | Counts all lines when no commits are excluded | 1 user, 1 hunk `{from:1, to:5}` | `ownedLines: 5` |
| U13.2 | Counts lines across multiple hunks | 1 user, 2 hunks: `{1,3}` and `{10,12}` | `ownedLines: 6` |
| U13.3 | Skips hunks whose `originalCommit` is in the exclude list | 2 hunks on commits `a` and `b`; exclude `[a]` | only hunk `b` counted |
| U13.4 | Returns `ownedLines: 0` when all commits are excluded | all hunks excluded | `ownedLines: 0` |
| U13.5 | Handles multiple users independently | 2 users, each with own hunks | separate `ownedLines` per user |
| U13.6 | Returns empty array for empty input | `[]` | `[]` |
| U13.7 | Default param: no `commitsToExclude` counts everything | omit second arg | all hunks counted |

### `extractFileOwnership(ownershipData, commitsToExclude?)`

| # | Description | Input | Expected output |
|---|---|---|---|
| U13.8 | Uses most-recent commit's ownership for each file | 2 commits touching same file | ownership from newer commit wins |
| U13.9 | Includes files from all commits when disjoint | 2 commits touching different files | both files present in result |
| U13.10 | Keys result by file path | any input | `result['src/foo.ts']` is array of `OwnershipResult` |
| U13.11 | Passes `commitsToExclude` through to inner function | exclude a commit sha | lines from excluded commit not counted |
| U13.12 | Empty `ownershipData` returns empty object | `[]` | `{}` |

---

## U14 — `utils/extractTimeTrackingDataFromNotes`
**File**: `src/test/unit/plugins/visualizationPlugins/utils/extractTimeTrackingDataFromNotes.test.ts`
**Source**: `src/plugins/visualizationPlugins/utils/extractTimeTrackingDataFromNotes.ts`

### `extractTimeTrackingDataFromNotes(notes)`

| # | Description | Input | Expected output |
|---|---|---|---|
| U14.1 | Returns empty array for `null` input | `null` | `[]` |
| U14.2 | Returns empty array for `undefined` input | `undefined` | `[]` |
| U14.3 | Returns empty array when no note matches a time-tracking pattern | non-tracking notes | `[]` |
| U14.4 | `"added Xh"` note produces a positive `timeSpent` entry in hours | `'added 2h of time spent …'` | `timeSpent === 2` |
| U14.5 | `"added Xh Ym"` parses both hours and minutes | `'added 1h 30m …'` | `timeSpent ≈ 1.5` |
| U14.6 | `"added Xm"` parses minutes only | `'added 30m …'` | `timeSpent ≈ 0.5` |
| U14.7 | `"subtracted Xh"` produces a negative `timeSpent` entry | `'subtracted 1h …'` | `timeSpent === -1` |
| U14.8 | `"deleted Xh of spent time"` produces a negative entry | `'deleted 2h …'` | `timeSpent === -2` |
| U14.9 | `"deleted -Xh of spent time"` (double-negative) produces a positive entry | `'deleted -2h …'` | `timeSpent === 2` |
| U14.10 | `"removed time spent"` documents reversed-processing behavior | add then remove, same issue | addition still lands in result |
| U14.11 | Accumulates multiple add notes | 2 add notes | result has 2 entries |

---

## U15 — `redux/reducer/general/dashboardReducer`
**File**: `src/test/unit/redux/reducer/general/dashboardReducer.test.ts`
**Source**: `src/redux/reducer/general/dashboardReducer.ts`

> All tests use a 10×10 test grid and clear `localStorage` in `beforeEach`.

### `addDashboardItem`

| # | Description | Expected outcome |
|---|---|---|
| U15.1 | Places the item and adds it to `dashboardItems` | `dashboardItems.length === 1` |
| U15.2 | Increments `dashboardItemCount` | count goes from 0 to 1 |
| U15.3 | Marks grid cells with the item id | cells at item's x/y filled with item id |
| U15.4 | Clears `placeableItem` after placement | `placeableItem === undefined` |
| U15.5 | Sets `initialized: true` | `initialized === true` |

### `moveDashboardItem`

| # | Description | Expected outcome |
|---|---|---|
| U15.6 | Updates item position when target space is free | item's `x`, `y` updated |
| U15.7 | Clears old cells and fills new cells after move | old cells = 0, new cells = item id |
| U15.8 | Does not move when target space is occupied by another item | item position unchanged |

### `deleteDashboardItem`

| # | Description | Expected outcome |
|---|---|---|
| U15.9 | Removes the item from `dashboardItems` | list length reduced by 1 |
| U15.10 | Clears item's cells in `dashboardState` | previously filled cells = 0 |
| U15.11 | Leaves sibling items' cells untouched | sibling item cells still correct |

### `clearDashboard`

| # | Description | Expected outcome |
|---|---|---|
| U15.12 | Resets `dashboardItems` to `[]` | `dashboardItems.length === 0` |
| U15.13 | Resets `dashboardState` to all-zero grid | every cell is 0 |
| U15.14 | Resets `dashboardItemCount` to 0 | `dashboardItemCount === 0` |

### `setDashboardState`

| # | Description | Expected outcome |
|---|---|---|
| U15.15 | Assigns sequential ids starting at 1 | first item id = 1, second = 2 |
| U15.16 | Fills `dashboardState` grid correctly for each item | cells within item bounds hold item id |
| U15.17 | Sets `initialized: true` | `initialized === true` |

### `placeDashboardItem` / `updateDashboardItem`

| # | Description | Expected outcome |
|---|---|---|
| U15.18 | `placeDashboardItem` sets `placeableItem` and `initialized` | `placeableItem` equals payload, `initialized === true` |
| U15.19 | `updateDashboardItem` replaces matching item in the list | item's fields reflect payload |

---

## U16 — `redux/reducer/general/notificationsReducer`
**File**: `src/test/unit/redux/reducer/general/notificationsReducer.test.ts`
**Source**: `src/redux/reducer/general/notificationsReducer.ts`

### `addNotification`

| # | Description | Input | Expected output |
|---|---|---|---|
| U16.1 | Appends notification to list | empty state + action | `notificationList.length === 1` |
| U16.2 | Assigns `currID` as the notification id | `currID: 5` | notification gets `id: 5` |
| U16.3 | Increments `currID` after each add | add twice | `currID === 2` |
| U16.4 | Multiple notifications accumulate | add 3 | list length 3 |

### `removeNotification`

| # | Description | Input | Expected output |
|---|---|---|---|
| U16.5 | Removes notification with matching id | add then remove by id | `notificationList` empty |
| U16.6 | Does not remove other notifications | 2 items, remove one | remaining item still present |
| U16.7 | No-op when id does not exist | remove id 99 from empty state | list unchanged |

---

## U17 — `redux/reducer/general/tabsReducer`
**File**: `src/test/unit/redux/reducer/general/tabsReducer.test.ts`
**Source**: `src/redux/reducer/general/tabsReducer.ts`

> Uses `vi.spyOn(Storage.prototype, ...)` to verify localStorage interaction.

### `setTabList`

| # | Description | Expected outcome |
|---|---|---|
| U17.1 | Replaces `tabList` with provided array | `tabList` equals payload |
| U17.2 | Replaces a non-empty list with a new one | old entries gone, new entries present |
| U17.3 | Persists the new state to `localStorage` | `localStorage.setItem` called |

### `clearTabsStorage`

| # | Description | Expected outcome |
|---|---|---|
| U17.4 | Calls `localStorage.removeItem` | `removeItem` spy was called |

---

## U18 — `redux/reducer/parameters/parametersReducer`
**File**: `src/test/unit/redux/reducer/parameters/parametersReducer.test.ts`
**Source**: `src/redux/reducer/parameters/parametersReducer.ts`

> Uses `vi.spyOn(Storage.prototype, ...)` to verify localStorage interaction.

### `setParametersGeneral`

| # | Description | Expected outcome |
|---|---|---|
| U18.1 | Updates `parametersGeneral` | `state.parametersGeneral` equals payload |
| U18.2 | Persists to `localStorage` | `setItem` spy called |

### `setParametersDateRange`

| # | Description | Expected outcome |
|---|---|---|
| U18.3 | Updates `parametersDateRange` | `state.parametersDateRange` equals payload |
| U18.4 | Persists to `localStorage` | `setItem` spy called |

### `clearParametersStorage`

| # | Description | Expected outcome |
|---|---|---|
| U18.5 | Calls `localStorage.removeItem` | `removeItem` spy called |

---

## U19 — `exportReducer`
**File**: `src/test/unit/redux/reducer/export/exportReducer.test.ts`
**Source**: `src/redux/reducer/export/exportReducer.ts`

| # | Description | Expected outcome |
|---|---|---|
| U19.1 | `setExportType` updates `exportType` | `state.exportType === ExportType.image` |
| U19.2 | `setExportType` overwrites a previous value | second dispatch wins |
| U19.3 | `setExportSVGData` stores an SVG string | `state.exportSVGData === svg` |
| U19.4 | `setExportName` sets the filename | `state.exportName === 'my-chart'` |
| U19.5 | `setExportName` overwrites a previous name | second dispatch wins |

---

## U20 — Exception classes
**File**: `src/test/unit/plugins/visualizationPlugins/ownership/codeOwnership/exceptions.test.ts`
**Source**: `src/plugins/visualizationPlugins/ownership/codeOwnership/src/utils/exception/`

| # | Description | Expected outcome |
|---|---|---|
| U20.1 | `RuntimeException` is an `instanceof Error` | `e instanceof Error` |
| U20.2 | `message` is set correctly | `e.message === 'test message'` |
| U20.3 | `name` is set to the provided value | `e.name === 'MyName'` |
| U20.4 | `code` is set when provided | `e.code === 42` |
| U20.5 | `code` is `undefined` when omitted | `e.code === undefined` |
| U20.6 | `InvalidArgumentException` is `instanceof RuntimeException` | passes |
| U20.7 | `InvalidArgumentException.name === 'InvalidArgumentException'` | passes |
| U20.8 | `InvalidArgumentException` propagates `code` | `e.code === 99` |
| U20.9 | `NoImplementationException` is `instanceof RuntimeException` | passes |
| U20.10 | `NoImplementationException.name === 'NoImplementationException'` | passes |

---

## U21 — `findAuthorWithMaxSpentTime`
**File**: `src/test/unit/plugins/visualizationPlugins/issues/issuesTimeline/findAuthorWithMaxSpentTime.test.ts`
**Source**: `src/plugins/visualizationPlugins/issues/issuesTimeline/src/chart/helper/findAuthorWithMaxSpentTime.ts`

| # | Description | Expected outcome |
|---|---|---|
| U21.1 | Returns `''` for empty map | `''` |
| U21.2 | Returns the only entry's key for a single-entry map | `'Alice'` |
| U21.3 | Returns the key with the highest value | `'Bob'` |
| U21.4 | When values are equal, result is one of the tied keys | in `['Alice', 'Bob']` |

---

## U22 — `groupIntoTracks`
**File**: `src/test/unit/plugins/visualizationPlugins/issues/issuesTimeline/groupIntoTracks.test.ts`
**Source**: `src/plugins/visualizationPlugins/issues/issuesTimeline/src/chart/helper/groupIntoTracks.ts`

| # | Description | Expected outcome |
|---|---|---|
| U22.1 | Returns empty array for empty issues | `[]` |
| U22.2 | Single issue goes into a single track | `tracks.length === 1` |
| U22.3 | Two non-overlapping sequential issues stay in one track | `tracks.length === 1, tracks[0].length === 2` |
| U22.4 | Two overlapping issues split into two tracks | `tracks.length === 2` |
| U22.5 | Issue without `closedAt` uses `maxDate` for overlap check | `tracks.length === 2` |

---

## U23 — `groupMergeRequests`
**File**: `src/test/unit/plugins/visualizationPlugins/issues/issuesTimeline/groupMergeRequests.test.ts`
**Source**: `src/plugins/visualizationPlugins/issues/issuesTimeline/src/chart/helper/groupMergeRequests.ts`

| # | Description | Expected outcome |
|---|---|---|
| U23.1 | Returns empty array for empty input | `[]` |
| U23.2 | MRs in the same month land in one group | `groups.length === 1` |
| U23.3 | MRs in different months land in separate groups | `groups.length === 2` |
| U23.4 | Multiple MRs in same month are all in that group | `groups[0].length === 4` |
| U23.5 | Returns one sub-array per distinct month | `groups.length === 3` |

---

## U24 — `accountsReducer`
**File**: `src/test/unit/redux/reducer/data/accountsReducer.test.ts`
**Source**: `src/redux/reducer/data/accountsReducer.ts`

> Uses `localStorage.clear()` in `beforeEach`.

| # | Description | Expected outcome |
|---|---|---|
| U24.1 | `setAccountList` adds new accounts for the given `dataPluginId` | list length 2 |
| U24.2 | `setAccountList` auto-assigns incrementing `localId` | `localId` values 1, 2 |
| U24.3 | `setAccountList` removes accounts no longer in payload | removed account absent |
| U24.4 | `setAccountList` persists to localStorage | `setItem` called |
| U24.5 | `setAccountsDataPluginId` updates `dataPluginId` | `state.dataPluginId === 42` |
| U24.6 | `setAccountsDataPluginId` persists to localStorage | `setItem` called |
| U24.7 | `clearAccountsStorage` calls `localStorage.removeItem` | `removeItem` called |

---

## U25 — `sprintsReducer`
**File**: `src/test/unit/redux/reducer/data/sprintsReducer.test.ts`
**Source**: `src/redux/reducer/data/sprintsReducer.ts`

> Mocks `document.getElementById('addSprintDialog')` for `sprintToEdit` action.

| # | Description | Expected outcome |
|---|---|---|
| U25.1 | `setSprints` replaces sprint list | new list in state |
| U25.2 | `setSprints` persists to localStorage | `setItem` called |
| U25.3 | `addSprint` assigns `currID` as sprint's `id` | `sprint.id === 5` |
| U25.4 | `addSprint` increments `currID` | `currID === 1` |
| U25.5 | `addSprint` persists to localStorage | `setItem` called |
| U25.6 | `deleteSprint` removes matching sprint | removed sprint absent |
| U25.7 | `deleteSprint` leaves other sprints intact | other sprint present |
| U25.8 | `sprintToEdit` sets `state.sprintToEdit` and calls `showModal()` | both asserted |
| U25.9 | `saveSprint` updates the sprint in the list | name updated |
| U25.10 | `saveSprint` clears `state.sprintToEdit` | `null` |
| U25.11 | `clearSprintStorage` calls `localStorage.removeItem` | `removeItem` called |
| U25.12 | `saveSprint` with unknown ID — sprint list unchanged | list length 1; original sprint untouched |
| U25.13 | `deleteSprint` with unknown ID — sprint list unchanged | list length 1; original sprint untouched |
| U25.14 | `addSprint` twice — second sprint ID is greater than first (auto-increment) | `secondId > firstId` |

---

## U26 — `authorsReducer`
**File**: `src/test/unit/redux/reducer/data/authorsReducer.test.ts`
**Source**: `src/redux/reducer/data/authorsReducer.ts`

> Uses `localStorage.clear()` in `beforeEach`.

| # | Description | Expected outcome |
|---|---|---|
| U26.1 | `setDragging` updates `dragging` flag | `dragging === true` |
| U26.2 | `moveAuthorToOther` sets `parent = 0` for the target author | `a.parent === 0` |
| U26.3 | `moveAuthorToOther` also sets `parent = 0` for children | child `parent === 0` |
| U26.4 | `resetAuthor` sets `parent = -1` for the target author | `a.parent === -1` |
| U26.5 | `setParentAuthor` sets the parent relationship | `a.parent === 1` |
| U26.6 | `setParentAuthor` ignores self-assignment | parent unchanged |
| U26.7 | `checkAllAuthors` sets all `selected = true` | all true |
| U26.8 | `uncheckAllAuthors` sets all `selected = false` | all false |
| U26.9 | `switchAuthorSelection` toggles `selected` on target and children | both toggled |
| U26.10 | `clearAuthorsStorage` calls `localStorage.removeItem` | `removeItem` called |
| U26.11 | `setParentAuthor` self-reference — leaves parent unchanged | `a.parent === -1` |
| U26.12 | `assignAccount` — assigning account X to author B removes it from author A | author B gets account; author A loses it |
| U26.13 | `setAuthorList` dispatched twice with identical data — no duplicate authors | list length remains 2 |
| U26.14 | `switchAllAuthorSelection` — all-unselected list → all become selected | all `selected === true` |
| U26.15 | `switchAllAuthorSelection` — all-selected list → all become unselected | all `selected === false` |
| U26.16 | `moveAuthorToOther` — author AND its children all get `parent = 0` | parent and both children have `parent === 0` |

---

## U27 — `filesReducer`
**File**: `src/test/unit/redux/reducer/data/filesReducer.test.ts`
**Source**: `src/redux/reducer/data/filesReducer.ts`

> Mocks `writeFileListToStorage` via `vi.mock(...)`.

| # | Description | Expected outcome |
|---|---|---|
| U27.1 | `loadState` loads all fields from payload | all fields set |
| U27.2 | `setFileList` stores tree, list, count under `dataPluginId` | each keyed correctly |
| U27.3 | `setFileList` calls `writeFileListToStorage` | mock called once |
| U27.4 | `setFilesDataPluginId` updates `dataPluginId` | `state.dataPluginId === 7` |
| U27.5 | `setFilesDataPluginId` calls `writeFileListToStorage` | mock called once |
| U27.6 | `updateFileListElement` (update=true) toggles `checked` on matching files | `checked === false` |
| U27.7 | `updateFileListElement` (update=false) does not touch `fileList` | `checked` unchanged |
| U27.8 | `checkAllFiles` sets `checked = true` for every file | all true |
| U27.9 | `uncheckAllFiles` sets `checked = false` for every file | all false |
| U27.10 | `removeFileList` deletes entries for the given id | all three maps cleaned |
| U27.11 | `updateFileListElement` update=false — tree node changes but flat fileList remains unchanged | `fileLists` entry unchanged; tree child updated |
| U27.12 | `switchAllFileSelection` — inverts all checked states (checked→unchecked, unchecked→checked) | both states swapped |
| U27.13 | `removeFileList` — removes only target plugin entry, leaving other plugins intact | plugin 1 removed; plugin 2 still present |

---

## U28 — `layoutReducer`
**File**: `src/test/unit/redux/reducer/general/layoutReducer.test.ts`
**Source**: `src/redux/reducer/general/layoutReducer.ts`

| # | Description | Expected outcome |
|---|---|---|
| U28.1 | `addCustomLayout` appends layout to `customLayouts` | length 1 |
| U28.2 | `addCustomLayout` auto-assigns `id` from `customLayoutCount` | `id === 3` |
| U28.3 | `addCustomLayout` increments `customLayoutCount` | `count === 1` |
| U28.4 | `addCustomLayout` persists to localStorage | `setItem` called |
| U28.5 | `saveChanges` updates layout with matching id | name updated |
| U28.6 | `saveChanges` does not affect other layouts | other name unchanged |
| U28.7 | `deleteCustomLayout` removes layout with matching id | removed layout absent |
| U28.8 | `deleteCustomLayout` persists to localStorage | `setItem` called |

---

## U29 — `settingsReducer`
**File**: `src/test/unit/redux/reducer/settings/settingsReducer.test.ts`
**Source**: `src/redux/reducer/settings/settingsReducer.ts`

> Mocks `distinct-colors` via `vi.mock(...)`.

| # | Description | Expected outcome |
|---|---|---|
| U29.1 | `setGeneralSettings` replaces `general` field | `gridSize` updated |
| U29.2 | `setGeneralSettings` persists to localStorage | `setItem` called |
| U29.3 | `addDataPlugin` (no id) appends with auto-assigned id | `id` defined |
| U29.4 | `addDataPlugin` (no id) sets `isDefault = true` for the first plugin | `isDefault === true` |
| U29.5 | `addDataPlugin` (no id) assigns color from mocked `distinctColors` | color starts with `#` |
| U29.6 | `addDataPlugin` (existing id) updates plugin in-place, list length unchanged | length 1, name updated |
| U29.7 | `removeDataPlugin` removes plugin with matching id | absent from list |
| U29.8 | `setDataPluginAsDefault` sets `isDefault = true` only on the matching plugin | one true, others false |
| U29.9 | `initializeSettingsState` sets `initialized = true` | `initialized === true` |
| U29.10 | `setLocalDatabaseLoadingState` updates the loading state enum | enum value set |
| U29.11 | `setLocalDatabaseLoadingMessage` updates the loading message string | message set |
| U29.12 | `clearSettingsStorage` calls `localStorage.removeItem` | `removeItem` called |

---

## U30 — `highlightDropArea`
**File**: `src/test/unit/components/dashboard/highlightDropArea.test.ts`
**Source**: `src/components/dashboard/dashboardHelper.ts`

> Tests the boolean return value only. DOM `?.classList` calls are no-ops when elements are absent.

| # | Description | Expected outcome |
|---|---|---|
| U30.1 | Empty grid returns `true` | `true` |
| U30.2 | Cell occupied by the moving item itself returns `true` | `true` |
| U30.3 | Cell occupied by a different item returns `false` | `false` |
| U30.4 | Occupied cell outside the drop area returns `true` | `true` |
| U30.5 | Multiple conflicting cells return `false` | `false` |

---

## U31 — `showContextMenu`
**File**: `src/test/unit/components/contextMenu/showContextMenu.test.ts`
**Source**: `src/components/contextMenu/contextMenuHelper.ts`

> Sets up the 3 required DOM elements in `beforeEach`; mocks `window.innerWidth/Height` and `showModal`.

| # | Description | Expected outcome |
|---|---|---|
| U31.1 | `y < innerHeight/2` → `top` set, `bottom` `'auto'` | `top === '90px'` |
| U31.2 | `y >= innerHeight/2` → `bottom` set, `top` `'auto'` | `bottom` computed correctly |
| U31.3 | `x < innerWidth/2` → `left` set, `right` `'auto'` | `left === '190px'` |
| U31.4 | `x >= innerWidth/2` → `right` set, `left` `'auto'` | `right` computed correctly |
| U31.5 | Creates one `<li>` per option | 3 options → 3 `<li>` elements |
| U31.6 | Sets option label text correctly | `span.textContent === 'Delete'` |
| U31.7 | Sets icon `src` when icon is provided | `img.src` contains `'trash.svg'` |
| U31.8 | Does not set `src` when icon is `null` | `img.getAttribute('src')` is null |
| U31.9 | Clicking option span invokes the option function | mock `fn` called once |
| U31.10 | Calls `showModal()` on the dialog | spy called |

---

## U32 — `showInfoTooltip`
**File**: `src/test/unit/components/infoTooltip/showInfoTooltip.test.ts`
**Source**: `src/components/infoTooltip/infoTooltipHelper.tsx`

> Signature: `showInfoTooltip(ref, tooltipVisibleFlagRef, x, y, content)`. Positioning uses `body.clientHeight/clientWidth`. DOM structure is a `<div>` (not `<dialog>`).

| # | Description | Expected outcome |
|---|---|---|
| U32.1 | `y < clientHeight/2` → `top` set, `bottom` `'auto'` | `top === '90px'` |
| U32.2 | `y >= clientHeight/2` → `bottom` set, `top` `'auto'` | `bottom` computed correctly |
| U32.3 | `x < clientWidth/2` → `left` set, `right` `'auto'` | `left === '190px'` |
| U32.4 | `x >= clientWidth/2` → `right` set, `left` `'auto'` | `right` computed correctly |
| U32.5 | Renders `<h1>` with correct headline | `h1.innerText === 'Overview'` |
| U32.6 | Renders `<p>` with correct body text | `p.innerText === 'Shows commits...'` |
| U32.7 | No `<p>` element when `textContent` is omitted | `p` absent |
| U32.8 | Sets `tooltipVisibleFlagRef.current` to `true` | flag is `true` |
| U32.9 | Sets `style.display` to `'block'` | `display === 'block'` |
| U32.10 | Clears previous content before rendering new content | only 1 `<h1>` present after second call |
| U32.11 | Returns early when `ref.current` is `null` | no throw; flag stays `false` |

---

## U33 — `issues/issues/dataConverter`
**File**: `src/test/unit/plugins/visualizationPlugins/issues/issues/dataConverter.test.ts`
**Source**: `src/plugins/visualizationPlugins/issues/issues/src/utilities/dataConverter.ts`

| # | Description |
|---|---|
| U33.1 | Returns empty result for empty array |
| U33.2 | `breakdown:false` — opened issue produces positive `Opened` count |
| U33.3 | `breakdown:false` — closed issue produces negative `Closed` count |
| U33.4 | `breakdown:true` — `Open` count increments on open, decrements on close |
| U33.5 | Scale `[0]` ≤ 0, `[1]` > 0 for opened issues |
| U33.6 | `splitIssuesPerAuthor:true` — keys prefixed with `"Opened Issues"` or `"Open Issues"` |
| U33.7 | Unassigned issue (no assignee) creates key containing `"unassigned"` |
| U33.8 | `splitIssuesPerAuthor:true` with 2 issues from 2 different authors → 2 separate series in chartData |
| U33.9 | `splitIssuesPerAuthor:false` with 2 issues from 2 authors → 1 combined series using bare status keys |
| U33.10 | Issue with `assignee=null` and `assignees=[]` → placed in `"unassigned"` bucket |
| U33.11 | `breakdown:true` causes `Open` key; `breakdown:false` causes `Opened`/`Closed` keys |
| U33.12 | Author with `parent === -1` is included as a top-level root author (keyed by own gitSignature) |
| U33.13 | Author with `parent === 0` is treated as belonging to `"others"` group |

---

## U34 — `issues/mergeRequests/dataConverter`
**File**: `src/test/unit/plugins/visualizationPlugins/issues/mergeRequests/dataConverter.test.ts`
**Source**: `src/plugins/visualizationPlugins/issues/mergeRequests/src/utilities/dataConverter.ts`

| # | Description |
|---|---|
| U34.1 | Returns empty result for empty array |
| U34.2 | `breakdown:false, state:'MERGED'` → negative `Merged` count |
| U34.3 | `breakdown:false, state:'CLOSED'` → negative `Closed` count |
| U34.4 | `breakdown:true` → `Open` count positive when MR is open |
| U34.5 | Scale `[1]` > 0 for opened MRs |
| U34.6 | `splitMergeRequestsPerAuthor:true` → palette keys include `"Opened/Merged/Closed Merge Requests {name}"` |
| U34.7 | `splitMergeRequestsPerAuthor:true` → palette does NOT contain bare `"Opened"` key |
| U34.8 | `splitMergeRequestsPerAuthor:true, breakdown:true` → palette key is `"Open Merge Requests {name}"` |
| U34.9 | `state:MERGED` → negative `Merged` count in chartData; `scale[0] < 0` |
| U34.10 | `state:CLOSED` → negative `Closed` count in chartData; `scale[0] < 0` |
| U34.11 | `state:OPENED`, not merged/closed → positive `Opened` count; `scale[1] > 0` |
| U34.12 | `splitMergeRequestsPerAuthor:true`, assignee with `user===null` → `"account not assigned"` bucket |

---

## U35 — `builds/builds/dataConverter`
**File**: `src/test/unit/plugins/visualizationPlugins/builds/builds/dataConverter.test.ts`
**Source**: `src/plugins/visualizationPlugins/builds/builds/src/utilities/dataConverter.ts`

| # | Description |
|---|---|
| U35.1 | Returns empty result for empty array |
| U35.2 | Success build lands in correct time bucket |
| U35.3 | `splitBuildsPerAuthor:false` — failed builds are negated |
| U35.4 | `splitBuildsPerAuthor:true` — keys include `"builds"` substring |
| U35.5 | Scale `[1]` > 0 for success builds |
| U35.6 | Unknown status (e.g. `pending`) is mapped to `"others"` — `"pending"` never appears as a chart key |
| U35.7 | Build with `status: failed` has a negative chart value |
| U35.8 | Build with `status: cancelled` has a negative chart value |
| U35.9 | Build with `status: success` has a positive chart value |
| U35.10 | `splitBuildsPerAuthor:true`, author with `selected=false` — no data beyond the `0.001` placeholder for that author |

---

## U36 — `commits/changes/dataConverter`
**File**: `src/test/unit/plugins/visualizationPlugins/commits/changes/dataConverter.test.ts`
**Source**: `src/plugins/visualizationPlugins/commits/changes/src/utilities/dataConverter.ts`

| # | Description |
|---|---|
| U36.1 | Returns empty result for empty array |
| U36.2 | Commits are bucketed by `date` field |
| U36.3 | `splitAdditionsDeletions:false` — author name appears as key |
| U36.4 | `splitAdditionsDeletions:true` — `(Additions)` and `(Deletions)` keys appear |
| U36.5 | BUG: `excludeMergeCommits:true` with all-merge input crashes (no empty-check after filter) |
| U36.6 | Scale `[1]` ≥ 0 and `[0]` ≤ 0 for `splitAdditionsDeletions:true` |
| U36.7 | `excludeMergeCommits:true` — merge commit absent from output; only normal commit contributes |
| U36.8 | `excludeMergeCommits:false` — merge commit IS included; `totalAlice === 23` (additions+deletions) |
| U36.9 | `fileList` undefined — falls back to commit-level stats; no crash; chartData non-empty |
| U36.10 | All files have `checked=false` — no file-level contributions for author; `totalAlice === 0` |
| U36.11 | Per-file stats mode — file-level additions/deletions used (not commit-level); `totalAlice === 10` |
| U36.12 | Aggregate stats mode — commit without file data uses commit totals; `totalAlice === 12` |
| U36.13 | `splitAdditionsDeletions:true` — additions positive, deletions negative in chart |
| U36.14 | `splitAdditionsDeletions:true` — separate `(Additions)` and `(Deletions)` series exist; no bare author key |
| U36.15 | `splitAdditionsDeletions:false` — single combined series; bare author key present, no `(Additions)`/`(Deletions)` prefix |
| U36.16 | Author with `parent === -1` keyed by own gitSignature; correct totals (`additions + deletions`) |

---

## U37 — `authorBehaviour/timeSpent/dataConverter`
**File**: `src/test/unit/plugins/visualizationPlugins/authorBehaviour/timeSpent/dataConverter.test.ts`
**Source**: `src/plugins/visualizationPlugins/authorBehaviour/timeSpent/src/utilities/dataConverter.ts`

| # | Description |
|---|---|
| U37.1 | Returns empty result for empty array |
| U37.2 | BUG: notes with no time-tracking match crash (no empty-check after `extractTimeTrackingDataFromNotes`) |
| U37.3 | `splitTimePerIssue:true` — chart keys include issue title |
| U37.4 | `splitTimePerIssue:false` — author-name or `"others"` key appears |
| U37.5 | Scale `[1]` ≥ 0 when time is spent |
| U37.6 | `splitSpentRemoved:true, splitTimePerIssue:false` — palette keys contain `"(Spent)"` and `"(Removed)"` |
| U37.7 | `breakdown:true, splitSpentRemoved:false, splitTimePerIssue:false` — palette keys contain `"(Total)"` |
| U37.8 | `splitSpentRemoved:true, splitTimePerIssue:true` — palette keys contain `"(Spent)"` and `"(Removed)"` for issue |

---

## U38 — `expertise/knowledgeRadar/dataConverter`
**File**: `src/test/unit/plugins/visualizationPlugins/expertise/knowledgeRadar/dataConverter.test.ts`
**Source**: `src/plugins/visualizationPlugins/expertise/knowledgeRadar/src/utilities/dataConverter.ts`

| # | Description |
|---|---|
| U38.1 | `extractTouchedFiles` — returns empty set for empty commits |
| U38.2 | `extractTouchedFiles` — returns files from matching developer |
| U38.3 | `extractTouchedFiles` — ignores commits from other developers |
| U38.4 | `calculateExpertiseBrowserScores` — returns empty array for empty commits |
| U38.5 | `calculateExpertiseBrowserScores` — filters out merge commits |
| U38.6 | `calculateExpertiseBrowserScores` — ownership score = dev commits / total commits |
| U38.7 | `buildPackageHierarchy` — empty map → empty array |
| U38.8 | `buildPackageHierarchy` — flat path produces single root package with correct score |
| U38.9 | `buildPackageHierarchy` — nested path produces 3-level hierarchy |
| U38.10 | `buildPackageHierarchy` — parent score is aggregated from children when parent score is 0 |

---

## U39 — `authorBehaviour/repositoryActivity/types`
**File**: `src/test/unit/plugins/visualizationPlugins/authorBehaviour/repositoryActivity/types.test.ts`
**Source**: `src/plugins/visualizationPlugins/authorBehaviour/repositoryActivity/src/utilities/types.ts`

| # | Description |
|---|---|
| U39.1 | `isDataPluginCommit` returns true for commit-shaped object |
| U39.2 | `isDataPluginCommit` returns false for build object |
| U39.3 | `isDataPluginBuild` returns true for build-shaped object |
| U39.4 | `isDataPluginBuild` returns false for commit without webUrl |
| U39.5 | `isDataPluginIssue` returns true for issue without mergedAt |
| U39.6 | `isDataPluginIssue` returns false for object with mergedAt |
| U39.7 | `isDataPluginMergeRequest` returns true for object with iid+title+mergedAt |
| U39.8 | BUG: `isDataPluginMergeRequest` returns false for actual DataPluginMergeRequest (no mergedAt field) |
| U39.9 | BUG: `isDataPluginNote` returns false for actual DataPluginNote (no noteableType field) |
| U39.10 | `isDataPluginNote` returns true for object with body+noteableType |
| U39.11 | `isDataPluginBranch` returns true for branch object |
| U39.12 | `isDataPluginBranch` returns false for commit object |
| U39.13 | `getActivityType` — commit → `"commit"` |
| U39.14 | `getActivityType` — build → `"build"` |
| U39.15 | `getActivityType` — issue → `"issue"` |
| U39.16 | `getActivityType` — branch → `"branch"` |
| U39.17 | `getActivityDate` — commit uses `date` field |
| U39.18 | `getActivityDate` — build uses `createdAt` field |
| U39.19 | `formatActivityCounts` — all-zero → `"0 activities"` |
| U39.20 | `formatActivityCounts` — count=1 uses singular |
| U39.21 | `formatActivityCounts` — count=3 uses plural |
| U39.22 | `formatActivityCounts` — multiple types joined by comma |

---

## U40 — `fileTreeUtilities` (`generateFileTree`, `filterFileTree`)
**File**: `src/test/unit/components/fileTreeUtilities.test.ts`
**Source**: `src/components/fileTree/utils/fileTreeUtilities.tsx`
**Note**: Module has top-level `await navigator.storage.getDirectory()`. Uses `vi.stubGlobal` + dynamic `import()` in `beforeAll` to handle OPFS.

| # | Description |
|---|---|
| U40.1 | `generateFileTree` — empty files array → empty tree |
| U40.2 | `generateFileTree` — single flat file → one File node |
| U40.3 | `generateFileTree` — nested path `src/index.ts` → Folder `src` containing File `index.ts` |
| U40.4 | `generateFileTree` — two files in same folder share one folder node |
| U40.5 | `generateFileTree` — files at different roots produce separate root nodes |
| U40.6 | `filterFileTree` — matching search returns only matching file |
| U40.7 | `filterFileTree` — no match removes all files and empty folders |
| U40.8 | `filterFileTree` — search matching all files returns all |
| U40.9 | `filterFileTree` — leaf node (no children) returned unchanged |
| U40.10 | `generateFileTree` — flat file list with no slashes → each file becomes a leaf node at root level |
| U40.11 | `generateFileTree` — single path `src/utils/helper.ts` → root folder `src` containing folder `utils` containing leaf `helper.ts` |
| U40.12 | `generateFileTree` — two paths sharing a folder → one folder node with two children |
| U40.13 | `generateFileTree` — empty input → returns empty array |
| U40.14 | `generateFileTree` — deeply nested path `a/b/c/d/file.ts` → 4 levels of nesting with leaf at bottom |
| U40.15 | `filterFileTree` — search string matches a leaf name → returns subtree containing that leaf |
| U40.16 | `filterFileTree` — search string matches nothing → returns empty children array |
| U40.17 | `filterFileTree` — empty search string → returns entire tree (all items included) |
| U40.18 | `filterFileTree` — search term matches a folder path segment → returns that folder and its matching children |
| U40.19 | `formatName` — match found in middle of name → array with 3 elements (prefix, match, suffix) |
| U40.20 | `formatName` — no match → returns array with one element containing full name |
| U40.21 | `formatName` — match at start of name → first element of split is empty string |

---

## U41 — `authorBehaviour/repositoryActivity/weeklyUtils`
**File**: `src/test/unit/plugins/visualizationPlugins/authorBehaviour/repositoryActivity/weeklyUtils.test.ts`
**Source**: `src/plugins/visualizationPlugins/authorBehaviour/repositoryActivity/src/utilities/weeklyUtils.ts`

### `convertToWeeklyFormat(data, weekStart)`

| # | Description | Input | Expected |
|---|---|---|---|
| U41.1 | Returns 168 cells (24×7) for empty data | `[]`, any weekStart | `chartData.length === 168` |
| U41.2 | All cells have value 0 for empty data | `[]` | every `cell.value === 0` |
| U41.3 | `rowLabels` is always 7 entries | any input | `rowLabels.length === 7` |
| U41.4 | `colLabels` is always 24 entries | any input | `colLabels.length === 24` |
| U41.5 | Commit within week is counted in correct cell | commit on day 0 at hour 9 | cell with `row:0, col:9` has `value === 1` |
| U41.6 | Activity outside the week is excluded | commit 1 day before weekStart | all cells remain 0 |
| U41.7 | Multiple activities in same hour/day sum correctly | 3 commits in same cell | cell `value === 3` |
| U41.8 | Cell `row` equals days-from-weekStart, `col` equals hour | commit on day 2 at hour 14 | `row:2, col:14` has value ≥ 1 |

---

## U42 — `progressReducer`
**File**: `src/test/unit/redux/reducer/general/progressReducer.test.ts`
**Source**: `src/redux/reducer/general/progressReducer.ts`

| # | Description | Expected |
|---|---|---|
| U42.1 | Initial state has `progress.type === ''` | `state.progress.type === ''` |
| U42.2 | Initial `socketConnection.status` is `Idle` | `SocketConnectionStatusType.Idle` |
| U42.3 | `setProgress` replaces entire progress object | `state.progress.type === 'indexing'` |
| U42.4 | `setProgress` can be dispatched twice, last wins | second payload in state |
| U42.5 | `setConnectionStatus` updates `socketConnection` | status updated to Connected |

---

## U43 — `actionsReducer`
**File**: `src/test/unit/redux/reducer/general/actionsReducer.test.ts`
**Source**: `src/redux/reducer/general/actionsReducer.ts`

| # | Description | Expected |
|---|---|---|
| U43.1 | Initial `lastAction` is `undefined` | `state.lastAction === undefined` |
| U43.2 | `setLastAction` sets `lastAction` string | `state.lastAction === 'myAction'` |
| U43.3 | `setLastAction` sets `payload` | `state.payload === 42` |
| U43.4 | Dispatching again overwrites previous values | new action/payload in state |

---

## U44 — `showConfirmationDialog`
**File**: `src/test/unit/components/confirmationDialog/showConfirmationDialog.test.ts`
**Source**: `src/components/confirmationDialog/confirmationDialog.tsx`

> Sets up the 3 required DOM elements in `beforeEach`; mocks `window.innerWidth/Height` and `showModal`.

| # | Description | Expected |
|---|---|---|
| U44.1 | `y < innerHeight/2` → `top` set, `bottom: auto` | `container.style.top` set |
| U44.2 | `y >= innerHeight/2` → `bottom` set, `top: auto` | `container.style.bottom` set |
| U44.3 | `x < innerWidth/2` → `left` set, `right: auto` | `container.style.left` set |
| U44.4 | `x >= innerWidth/2` → `right` set, `left: auto` | `container.style.right` set |
| U44.5 | Displays message text in a `<div>` | `div.textContent === 'Are you sure?'` |
| U44.6 | Renders two buttons with the option labels | two buttons, text matches options |
| U44.7 | Clicking option[0] button invokes its function | mock called once |
| U44.8 | Calls `showModal()` on the dialog | spy called |
| U44.9 | Adds icon `<img>` when option has an icon | `img` element present in button |
| U44.10 | Does not add `<img>` when option icon is `null` | no `<img>` in that button |

---

## U45 — `showDialog` (dialogHelper)
**File**: `src/test/unit/components/informationDialog/showDialog.test.ts`
**Source**: `src/components/informationDialog/dialogHelper.ts`

> Sets up three DOM elements in `beforeEach` and spies on `showModal`.

| # | Description | Expected |
|---|---|---|
| U45.1 | Sets `innerText` of `#informationDialogHeadline` | `element.innerText === 'My headline'` |
| U45.2 | Sets `innerText` of `#informationDialogText` | `element.innerText === 'My text'` |
| U45.3 | Calls `showModal()` on `#informationDialog` | spy called once |

---

## U46 — `getSVGData` (shared across 11 plugin utilities files)
**File**: `src/test/unit/plugins/visualizationPlugins/getSVGData.test.ts`
**Sources**: 9 files use `children[1].outerHTML` pattern; 2 files (`codeExpertise`, `knowledgeRadar`) use a safer SVGElement-find pattern. Tested separately via two `describe.each` blocks.

### `children[1]` variant (9 files)

| # | Description | Input | Expected |
|---|---|---|---|
| U46.1 | Returns fallback SVG when `ref.current` is `null` | `{ current: null }` | `'<svg xmlns="http://www.w3.org/2000/svg"></svg>'` |
| U46.2 | BUG: throws `TypeError` when `children[1]` is absent (missing optional chaining on index access) | div with 1 child | `TypeError` thrown |
| U46.3 | Returns `outerHTML` of `children[1]` when present | div with 2 children | second child's `outerHTML` |

### SVGElement-find variant (`codeExpertise`, `knowledgeRadar`)

| # | Description | Input | Expected |
|---|---|---|---|
| U46.4 | Returns fallback SVG when `ref.current` is `null` | `{ current: null }` | fallback string |
| U46.5 | Returns fallback SVG when no SVGElement child exists | div with only `<span>` | fallback string |
| U46.6 | Returns `outerHTML` of the first SVGElement child | div with `<svg>` child | SVG's `outerHTML` |

---

## U47 — `showLayoutOverview`
**File**: `src/test/unit/components/layoutOverview/showLayoutOverview.test.ts`
**Source**: `src/components/tabs/layouts/layoutOverview/layoutOverviewHelper.ts`

> Sets up `#layoutOverview` and `#layoutOverviewPositionController` in `beforeEach`, mocks `showModal`. `offsetWidth = 0` in jsdom.

| # | Description | Input | Expected |
|---|---|---|---|
| U47.1 | `y < innerHeight/2` → `top` set, `bottom: auto` | `y=200` (H=800) | `top = '180px'`, `bottom = 'auto'` |
| U47.2 | `y >= innerHeight/2` → `bottom` set, `top: auto` | `y=600` | `bottom = '180px'`, `top = 'auto'` |
| U47.3 | `x < innerWidth/2` → `left` set, `right: auto` | `x=200` (W=1000) | `left = '200px'`, `right = 'auto'` |
| U47.4 | `x >= innerWidth/2` → `right` set, `left: auto` | `x=700` | `right = '280px'`, `left = 'auto'` |
| U47.5 | `y=20` edge case: `y-20=0 < 10` → `top` clamped to `10px` | `y=20` | `top = '10px'` |
| U47.6 | Calls `showModal()` on `#layoutOverview` | any call | spy called |

---

## U48 — `showVisualizationOverview` + `disableVisualizationOverview`
**File**: `src/test/unit/components/visualizationOverview/showVisualizationOverview.test.ts`
**Source**: `src/components/tabs/visualizations/visualizationSelector/visualizationOverview/visualizationOverviewHelper.ts`

> Same DOM setup pattern as U47 with `#visualizationOverview` and `#visualizationOverviewPositionController`.

| # | Description | Input | Expected |
|---|---|---|---|
| U48.1 | `y < innerHeight/2` → `top` set, `bottom: auto` | `y=200` | `top = '180px'` |
| U48.2 | `y >= innerHeight/2` → `bottom` set, `top: auto` | `y=600` | `bottom = '180px'` |
| U48.3 | `x < innerWidth/2` → `left` set, `right: auto` | `x=200` | `left = '200px'` |
| U48.4 | `x >= innerWidth/2` → `right` set, `left: auto` | `x=700` | `right = '280px'` |
| U48.5 | Calls `showModal()` on `#visualizationOverview` | any call | spy called |
| U48.6 | `disableVisualizationOverview` returns `false` when `pluginOptions` is `undefined` | any filter, `undefined` | `false` |
| U48.7 | Returns `false` when no filter key is `true` | all filter false | `false` |
| U48.8 | Returns `true` when filter `github=true` but plugin `github=false` | mismatch | `true` |
| U48.9 | Returns `false` when filter `github=true` and plugin `github=true` | match | `false` |
| U48.10 | Returns `true` on `pouchDB` key mismatch | `pouchDB` mismatch | `true` |

---

## U49 — `actionsMiddleware`
**File**: `src/test/unit/redux/middleware/actionsMiddleware.test.ts`
**Source**: `src/redux/middleware/actions/actionsMiddleware.ts`

> Intercepts every Redux action: non-`setLastAction` actions are forwarded via `next` AND trigger a `setLastAction` dispatch; `setLastAction` itself is only forwarded.

| # | Description | Expected |
|---|---|---|
| U49.1 | Non-setLastAction: `next` is called once | `next` spy called once |
| U49.2 | Non-setLastAction: `store.dispatch` called with `setLastAction` | dispatch called with `{ action: type, payload }` |
| U49.3 | `setLastAction` itself: `next` called, `store.dispatch` NOT called again | no second dispatch |
| U49.4 | Payload is forwarded correctly inside setLastAction dispatch | `dispatchedPayload.payload === originalPayload` |

---

## U50 — `refreshMiddleware`
**File**: `src/test/unit/redux/middleware/refreshMiddleware.test.ts`
**Source**: `src/redux/middleware/refresh/refreshMiddleware.ts`

> When action type is `'progress/setProgress'`, passes through AND dispatches `REFRESH_PLUGIN` to the global store. All other actions just pass through.

| # | Description | Expected |
|---|---|---|
| U50.1 | `setProgress` action: `next` called | `next` spy called |
| U50.2 | `setProgress` action: `globalStore.dispatch` called with `REFRESH_PLUGIN` | dispatch called with `{ type: 'REFRESH_PLUGIN', payload: { pluginId } }` |
| U50.3 | Unrelated action: `next` called, global dispatch NOT called | no second dispatch |

---

## U51 — `convertToActivityTimelineFormat`
**File**: `src/test/unit/plugins/visualizationPlugins/authorBehaviour/repositoryActivity/activityTimelineUtils.test.ts`
**Source**: `src/plugins/visualizationPlugins/authorBehaviour/repositoryActivity/src/utilities/activityTimelineUtils.ts`

> Groups activities by calendar day, sums counts per type, sorts chronologically.

| # | Description | Expected |
|---|---|---|
| U51.1 | Empty array → empty chartData | `chartData.length === 0` |
| U51.2 | Single activity → one chart entry with `value: 1` | `chartData.length === 1`, `value === 1` |
| U51.3 | Two activities on same day → one entry with `value: 2` | `chartData.length === 1`, `value === 2` |
| U51.4 | Activities on different days → separate entries | `chartData.length === 2` |
| U51.5 | Branch activity without latestCommit (null date) is skipped | entry not in chartData |
| U51.6 | Output is sorted ascending by date | `chartData[0].date < chartData[1].date` |

---

## U52 — `pouchDB/utils` (pure functions only)
**File**: `src/test/unit/plugins/dataPlugins/pouchDB/utils.test.ts`
**Source**: `src/plugins/dataPlugins/pouchDB/src/utils.ts`

> Only the three pure algorithm exports are tested. PouchDB imports are mocked via `vi.mock`.

| # | Description | Expected |
|---|---|---|
| U52.1 | `binarySearchArray` — empty array returns `[]` | `[]` |
| U52.2 | `binarySearchArray` — single match returns array with that element | `[match]` |
| U52.3 | `binarySearchArray` — multiple matches returns all | `[a, b]` |
| U52.4 | `binarySearchArray` — no match returns `[]` | `[]` |
| U52.5 | `binarySearch` — returns the matching element | element found |
| U52.6 | `binarySearch` — returns `null` when not found | `null` |
| U52.7 | `sortByAttributeString` — ascending sorts A → Z | sorted ascending |
| U52.8 | `sortByAttributeString` — descending sorts Z → A | sorted descending |

---

## U53 — `dashboardHelper` (remaining functions)
**File**: `src/test/unit/components/dashboard/dashboardHelper.test.ts`
**Source**: `src/components/dashboard/dashboardHelper.ts`

> Tests `clearHighlightDropArea`, `setDragResizeMode`, and `placeDragIndicator`. CSS module mocked via `vi.mock`.

| # | Description | Function | Expected |
|---|---|---|---|
| U53.1 | Hides drag indicator (display none) | `clearHighlightDropArea` | `ref.current.style.display === 'none'` |
| U53.2 | Removes highlight classes from all cells | `clearHighlightDropArea` | no cells have highlight class |
| U53.3 | No-op when `ref.current` is null | `clearHighlightDropArea` | no error thrown |
| U53.4 | Sets `dragResizeMode.current` to new value | `setDragResizeMode` | `ref.current === newMode` |
| U53.5 | Shows div when mode is non-none | `setDragResizeMode` | `style.display === 'block'` |
| U53.6 | Hides div when mode is none | `setDragResizeMode` | `style.display === 'none'` |
| U53.7 | Sets `display: block` and correct top/left/width/height | `placeDragIndicator` | style properties set as calc strings |
| U53.8 | No-op when `ref.current` is null | `placeDragIndicator` | no error |

---

## U54 — `utils/dataPluginStorage`
**File**: `src/test/unit/utils/dataPluginStorage.test.ts`
**Source**: `src/utils/dataPluginStorage.ts`

> Static cache wrapper over `pluginRegistry.dataPlugins`. `pluginRegistry` mocked via `vi.hoisted` + `vi.mock`. Static cache reset in `beforeEach`.

| # | Description | Input | Expected |
|---|---|---|---|
| U54.1 | `addDataPlugin` is a no-op when `id` is undefined | `{ id: undefined, name: 'FakeName', ... }` | `init` not called; cache empty |
| U54.2 | `addDataPlugin` calls `init` on the matched plugin class | `{ id: 1, name: 'FakeName', ... }` | `mockInit` called once |
| U54.3 | `addDataPlugin` stores instance under `name+id` key | `{ id: 7, name: 'FakeName', ... }` | `cache['FakeName7']` is `FakePlugin` instance |
| U54.4 | `addDataPlugin` passes apiKey, endpoint, fileName, progressUpdate to `init` | `params: { apiKey: 'k', endpoint: 'u', fileName: 'f.json' }` | `init('k', 'u', { name: 'f.json', file: undefined, dbObjects: undefined }, undefined)` |
| U54.5 | `addDataPlugin` does nothing when no plugin class matches the name | `{ id: 1, name: 'Unknown', ... }` | cache stays empty |
| U54.6 | `getDataPlugin` returns `undefined` when `id` is undefined | `{ id: undefined, ... }` | `undefined` |
| U54.7 | `getDataPlugin` creates and returns a plugin instance on cache miss | `{ id: 1, name: 'FakeName', ... }` | returns `FakePlugin` instance |
| U54.8 | `getDataPlugin` returns `undefined` when no plugin class matches | `{ id: 1, name: 'NoSuchPlugin', ... }` | `undefined` |
| U54.9 | `getDataPlugin` stores the created instance under `name+id` key | `{ id: 2, name: 'FakeName', ... }` | `cache['FakeName2']` is `FakePlugin` |
| U54.10 | `getDataPlugin` returns the cached instance from a prior `addDataPlugin` without re-calling `init` | `addDataPlugin` then `getDataPlugin` with same descriptor | same instance; `init` called exactly once |

---

## U55 — `utils/json-utils`
**File**: `src/test/unit/utils/jsonUtils.test.ts`
**Source**: `src/utils/json-utils.ts`

> Pure functions, no external dependencies. Tests exercise all branches of `compressJson` and `decompressJson` via the public API.

| # | Description | Input | Expected |
|---|---|---|---|
| U55.1 | `compressJson` plain collection strips `_key` | `[{ _id: 'commits/x', _key: 'x', _rev: '_r' }]` | no `_key` in result |
| U55.2 | `compressJson` plain collection strips `_rev` | same | no `_rev` in result |
| U55.3 | `compressJson` plain collection removes collection prefix from `_id` | `_id: 'commits/abc'` | `_id: 'abc'` |
| U55.4 | `compressJson` plain collection preserves other fields | `{ sha: 'abc' }` | `sha` unchanged |
| U55.5 | `compressJson` plain collection handles empty input | `[]` | `[]` |
| U55.6 | `decompressJson` plain collection restores collection prefix to `_id` | `[{ _id: 'abc' }]`, collection `'commits'` | `_id: 'commits/abc'` |
| U55.7 | `decompressJson` skips decompression when `_id` already contains `/` | `[{ _id: 'commits/abc' }]` | returned unchanged |
| U55.8 | `decompressJson` plain collection handles empty input | `[]` | `[]` |
| U55.9 | `compressJson` simple connection strips `_from` prefix | `_from: 'commits/a'`, collection `'commits-files'` | `_from: 'a'` |
| U55.10 | `compressJson` simple connection strips `_to` prefix | `_to: 'files/b'` | `_to: 'b'` |
| U55.11 | `decompressJson` simple connection restores `_from` prefix | `_from: 'a'`, collection `'commits-files'` | `_from: 'commits/a'` |
| U55.12 | `decompressJson` simple connection restores `_to` prefix | `_to: 'b'` | `_to: 'files/b'` |
| U55.13 | `compressJson` registered 3-part connection strips `_from` | `_from: 'commits-files/cf1'`, collection `'commits-files-users'` | `_from: 'cf1'` |
| U55.14 | `compressJson` registered 3-part connection strips `_to` | `_to: 'users/u1'` | `_to: 'u1'` |
| U55.15 | `compressJson` unregistered 3-part connection leaves `_from` untouched | collection `'foo-bar-baz'` | `_from` unchanged |
| U55.16 | `compressJson` unregistered 3-part connection leaves `_to` untouched | collection `'foo-bar-baz'` | `_to` unchanged |
| U55.17 | `decompressJson` registered 3-part restores `_from` via connections map | collection `'commits-files-users'` | `_from: 'commits-files/cf1'` |
| U55.18 | `decompressJson` registered 3-part restores `_to` via connections map | collection `'commits-files-users'` | `_to: 'users/u1'` |
| U55.19 | `compressJson` ownership hunks renames `originalCommit` → `oc` | hunk with `originalCommit: 'sha1'` | `oc: 'sha1'`; no `originalCommit` |
| U55.20 | `compressJson` ownership hunks encodes lines as `"from,to"` strings | `lines: [{ from: 1, to: 5 }]` | `lines: ['1,5']` |
| U55.21 | `decompressJson` ownership hunks renames `oc` → `originalCommit` | `oc: 'sha1'` | `originalCommit: 'sha1'`; no `oc` |
| U55.22 | `decompressJson` ownership hunks decodes strings to `{ from, to }` | `lines: ['1,5']` | `lines: [{ from: '1', to: '5' }]` |
| U55.23 | Roundtrip plain collection restores `_id` prefix; drops `_key`/`_rev` | compress then decompress | `_id` restored; no `_key`/`_rev` |
| U55.24 | Roundtrip simple connection restores `_from` and `_to` | compress then decompress `'commits-files'` | `_from: 'commits/a'`; `_to: 'files/b'` |
| U55.25 | Roundtrip registered 3-part restores all fields including hunks | compress then decompress `'commits-files-users'` | `_from`, `_to`, `originalCommit`, `lines` all restored |

---

## U56 — `ownership/codeOwnership/dbUtils`
**File**: `src/test/unit/plugins/visualizationPlugins/ownership/codeOwnership/dbUtils.test.ts`
**Source**: `src/plugins/visualizationPlugins/ownership/codeOwnership/src/utils/dbUtils.ts`

| # | Description | Input | Expected |
|---|---|---|---|
| U56.1 | Linear 3-commit chain returns SHA array in descending date order | chain sha1→sha2→sha3, query sha3 | `['sha3', 'sha2', 'sha1']` |
| U56.2 | Genesis commit (no parents) returns only its own SHA | commit with `parents: []` | `['sha-genesis']` |
| U56.3 | Merge commit (2 parents) includes both parent chains | diamond graph, query merge | all 4 SHAs present; merge is first |
| U56.4 | Missing parent SHA throws `TypeError` | parent SHA not in `allCommits` | `expect(...).toThrow(TypeError)` |
| U56.5 | Circular parent references terminate without infinite loop | sha1↔sha2 cycle | does not throw; both SHAs in result |

---

## U57 — `expertise/codeExpertise/calculateOwnershipMetrics`
**File**: `src/test/unit/plugins/visualizationPlugins/expertise/codeExpertise/calculateOwnershipMetrics.test.ts`
**Source**: `src/plugins/visualizationPlugins/expertise/codeExpertise/src/chart/chart.tsx`

| # | Description | Input | Expected |
|---|---|---|---|
| U57.1 | Returns empty totals when both inputs are empty | `ownershipData: []`, `commitsWithBuilds: []` | `currentOwnership: {}`, `totalLinesAdded: {}` |
| U57.2 | Sums additions from a single commit for one developer | one build with `additions: 42` | `totalLinesAdded['Alice'] === 42` |
| U57.3 | Accumulates additions across multiple commits for the same developer | two builds with 10 and 5 additions | `totalLinesAdded['Alice'] === 15` |
| U57.4 | Tracks additions separately per developer | Alice 10, Bob 7 | each has their own total |
| U57.5 | Skips commits with no user without throwing | build with `user: null` | does not throw; `totalLinesAdded` is empty |
| U57.6 | Returns empty ownership when ownershipData is empty | `ownershipData: []` | `currentOwnership: {}` |
| U57.7 | Counts lines owned as `to - from + 1` for a single range | range `[3, 7]` | `currentOwnership['Alice'] === 5` |
| U57.8 | Sums multiple line ranges within a hunk | `[1,3]` and `[10,12]` | `currentOwnership['Alice'] === 6` |
| U57.9 | Tracks ownership separately for multiple owners of the same file | Alice owns lines 1–5, Bob owns 6–8 | Alice=5, Bob=3 |
| U57.10 | Includes all files when fileList is undefined | `fileList: undefined` | file is counted |
| U57.11 | Includes a file when it is checked in fileList | `fileList: [{ path, checked: true }]` | file is counted |
| U57.12 | Excludes a file when it is unchecked in fileList | `fileList: [{ path, checked: false }]` | file is not counted |
| U57.13 | Removes a file from ownership tracking when its action is deleted | add commit then delete commit | `currentOwnership['Alice']` is undefined |
| U57.14 | Later commit replaces earlier ownership for the same file | commit 1: Alice owns 10 lines; commit 2: Bob owns 3 lines | Bob=3, Alice=undefined |
| U57.15 | Accumulates ownership across multiple independent files | Alice owns 5 lines in a.ts and 3 in b.ts | `currentOwnership['Alice'] === 8` |

---

## Unit test file locations

```
src/test/unit/
├── components/
│   ├── confirmationDialog/
│   │   └── showConfirmationDialog.test.ts                              (U44)
│   ├── contextMenu/
│   │   └── showContextMenu.test.ts                                     (U31)
│   ├── dashboard/
│   │   ├── dashboardHelper.test.ts                                     (U53)
│   │   └── highlightDropArea.test.ts                                   (U30)
│   ├── fileTreeUtilities.test.ts                                       (U40)
│   ├── infoTooltip/
│   │   └── showInfoTooltip.test.ts                                     (U32)
│   ├── informationDialog/
│   │   └── showDialog.test.ts                                          (U45)
│   ├── layoutOverview/
│   │   └── showLayoutOverview.test.ts                                  (U47)
│   └── visualizationOverview/
│       └── showVisualizationOverview.test.ts                           (U48)
├── plugins/
│   ├── dataPlugins/
│   │   └── pouchDB/
│   │       └── utils.test.ts                                           (U52)
│   └── visualizationPlugins/
│       ├── authorBehaviour/
│       │   ├── collaboration/
│       │   │   └── dataConverter.test.ts                               (U1)
│       │   ├── repositoryActivity/
│       │   │   ├── activityTimelineUtils.test.ts                       (U51)
│       │   │   ├── types.test.ts                                       (U39)
│       │   │   └── weeklyUtils.test.ts                                 (U41)
│       │   └── timeSpent/
│       │       └── dataConverter.test.ts                               (U37)
│       ├── builds/
│       │   └── builds/
│       │       └── dataConverter.test.ts                               (U35)
│       ├── commits/
│       │   ├── changes/
│       │   │   └── dataConverter.test.ts                               (U36)
│       │   └── fileChanges/
│       │       └── dataConverter.test.ts                               (U2)
│       ├── expertise/
│       │   ├── codeExpertise/
│       │   │   ├── calculateOwnershipMetrics.test.ts                   (U57)
│       │   │   └── dbUtils.test.ts                                     (U3)
│       │   └── knowledgeRadar/
│       │       └── dataConverter.test.ts                               (U38)
│       ├── getSVGData.test.ts                                          (U46)
│       ├── issues/
│       │   ├── burndown/
│       │   │   ├── groupIssuesByGranularity.test.ts                    (U4)
│       │   │   └── pairUpDataPoints.test.ts                            (U5)
│       │   ├── issues/
│       │   │   └── dataConverter.test.ts                               (U33)
│       │   ├── issuesTimeline/
│       │   │   ├── aggregateTimeTrackingData.test.ts                   (U6)
│       │   │   ├── findAuthorWithMaxSpentTime.test.ts                  (U21)
│       │   │   ├── groupIntoTracks.test.ts                             (U22)
│       │   │   ├── groupMergeRequests.test.ts                          (U23)
│       │   │   ├── groupSimilarLabels.test.ts                          (U7)
│       │   │   ├── initializeLevenshteinDPTable.test.ts                (U8)
│       │   │   ├── initializeLevenshteinMatrix.test.ts                 (U9)
│       │   │   └── levenshteinDistance.test.ts                         (U10)
│       │   └── mergeRequests/
│       │       └── dataConverter.test.ts                               (U34)
│       ├── ownership/
│       │   └── codeOwnership/
│       │       ├── cryptoUtils.test.ts                                 (U11)
│       │       ├── dateUtils.test.ts                                   (U12)
│       │       ├── dbUtils.test.ts                                     (U56)
│       │       ├── exceptions.test.ts                                  (U20)
│       │       └── ownershipUtils.test.ts                              (U13)
│       └── utils/
│           └── extractTimeTrackingDataFromNotes.test.ts                (U14)
├── redux/
│   ├── middleware/
│   │   ├── actionsMiddleware.test.ts                                   (U49)
│   │   └── refreshMiddleware.test.ts                                   (U50)
│   └── reducer/
│       ├── data/
│       │   ├── accountsReducer.test.ts                                 (U24)
│       │   ├── authorsReducer.test.ts                                  (U26)
│       │   ├── filesReducer.test.ts                                    (U27)
│       │   └── sprintsReducer.test.ts                                  (U25)
│       ├── export/
│       │   └── exportReducer.test.ts                                   (U19)
│       ├── general/
│       │   ├── actionsReducer.test.ts                                  (U43)
│       │   ├── dashboardReducer.test.ts                                (U15)
│       │   ├── layoutReducer.test.ts                                   (U28)
│       │   ├── notificationsReducer.test.ts                            (U16)
│       │   ├── progressReducer.test.ts                                 (U42)
│       │   └── tabsReducer.test.ts                                     (U17)
│       ├── parameters/
│       │   └── parametersReducer.test.ts                               (U18)
│       └── settings/
│           └── settingsReducer.test.ts                                 (U29)
└── utils/
    ├── dataPluginStorage.test.ts                                       (U54)
    └── jsonUtils.test.ts                                               (U55)
```

---
