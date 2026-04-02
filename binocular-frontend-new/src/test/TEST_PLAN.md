# Frontend Test Plan

**Framework**: Vitest + jsdom
**Test ID convention**: `U{file_index}.{test_index}` for unit tests, `C{file_index}.{test_index}` for component tests.
File indices are assigned in alphabetical order within each category.

---

# Unit Tests

---

## U1 — `authorBehaviour/collaboration/dataConverter`
**File**: `src/test/unit/plugins/visualizationPlugins/authorBehaviour/collaboration/dataConverter.test.ts`
**Source**: `src/plugins/visualizationPlugins/authorBehaviour/collaboration/src/utilities/dataConverter.ts`

### `convertIssuesToGraphData(accounts, settings)`

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

## U55 — `utils/dataPluginStorage`
**File**: `src/test/unit/utils/dataPluginStorage.test.ts`
**Source**: `src/utils/dataPluginStorage.ts`

> Static cache wrapper over `pluginRegistry.dataPlugins`. `pluginRegistry` mocked via `vi.hoisted` + `vi.mock`. Static cache reset in `beforeEach`.

| # | Description | Input | Expected |
|---|---|---|---|
| U55.1 | `addDataPlugin` is a no-op when `id` is undefined | `{ id: undefined, name: 'FakeName', ... }` | `init` not called; cache empty |
| U55.2 | `addDataPlugin` calls `init` on the matched plugin class | `{ id: 1, name: 'FakeName', ... }` | `mockInit` called once |
| U55.3 | `addDataPlugin` stores instance under `name+id` key | `{ id: 7, name: 'FakeName', ... }` | `cache['FakeName7']` is `FakePlugin` instance |
| U55.4 | `addDataPlugin` passes apiKey, endpoint, fileName, progressUpdate to `init` | `params: { apiKey: 'k', endpoint: 'u', fileName: 'f.json' }` | `init('k', 'u', { name: 'f.json', file: undefined, dbObjects: undefined }, undefined)` |
| U55.5 | `addDataPlugin` does nothing when no plugin class matches the name | `{ id: 1, name: 'Unknown', ... }` | cache stays empty |
| U55.6 | `getDataPlugin` returns `undefined` when `id` is undefined | `{ id: undefined, ... }` | `undefined` |
| U55.7 | `getDataPlugin` creates and returns a plugin instance on cache miss | `{ id: 1, name: 'FakeName', ... }` | returns `FakePlugin` instance |
| U55.8 | `getDataPlugin` returns `undefined` when no plugin class matches | `{ id: 1, name: 'NoSuchPlugin', ... }` | `undefined` |
| U55.9 | `getDataPlugin` stores the created instance under `name+id` key | `{ id: 2, name: 'FakeName', ... }` | `cache['FakeName2']` is `FakePlugin` |
| U55.10 | `getDataPlugin` returns the cached instance from a prior `addDataPlugin` without re-calling `init` | `addDataPlugin` then `getDataPlugin` with same descriptor | same instance; `init` called exactly once |

---

## U56 — `utils/json-utils`
**File**: `src/test/unit/utils/jsonUtils.test.ts`
**Source**: `src/utils/json-utils.ts`

> Pure functions, no external dependencies. Tests exercise all branches of `compressJson` and `decompressJson` via the public API.

| # | Description | Input | Expected |
|---|---|---|---|
| U56.1 | `compressJson` plain collection strips `_key` | `[{ _id: 'commits/x', _key: 'x', _rev: '_r' }]` | no `_key` in result |
| U56.2 | `compressJson` plain collection strips `_rev` | same | no `_rev` in result |
| U56.3 | `compressJson` plain collection removes collection prefix from `_id` | `_id: 'commits/abc'` | `_id: 'abc'` |
| U56.4 | `compressJson` plain collection preserves other fields | `{ sha: 'abc' }` | `sha` unchanged |
| U56.5 | `compressJson` plain collection handles empty input | `[]` | `[]` |
| U56.6 | `decompressJson` plain collection restores collection prefix to `_id` | `[{ _id: 'abc' }]`, collection `'commits'` | `_id: 'commits/abc'` |
| U56.7 | `decompressJson` skips decompression when `_id` already contains `/` | `[{ _id: 'commits/abc' }]` | returned unchanged |
| U56.8 | `decompressJson` plain collection handles empty input | `[]` | `[]` |
| U56.9 | `compressJson` simple connection strips `_from` prefix | `_from: 'commits/a'`, collection `'commits-files'` | `_from: 'a'` |
| U56.10 | `compressJson` simple connection strips `_to` prefix | `_to: 'files/b'` | `_to: 'b'` |
| U56.11 | `decompressJson` simple connection restores `_from` prefix | `_from: 'a'`, collection `'commits-files'` | `_from: 'commits/a'` |
| U56.12 | `decompressJson` simple connection restores `_to` prefix | `_to: 'b'` | `_to: 'files/b'` |
| U56.13 | `compressJson` registered 3-part connection strips `_from` | `_from: 'commits-files/cf1'`, collection `'commits-files-users'` | `_from: 'cf1'` |
| U56.14 | `compressJson` registered 3-part connection strips `_to` | `_to: 'users/u1'` | `_to: 'u1'` |
| U56.15 | `compressJson` unregistered 3-part connection leaves `_from` untouched | collection `'foo-bar-baz'` | `_from` unchanged |
| U56.16 | `compressJson` unregistered 3-part connection leaves `_to` untouched | collection `'foo-bar-baz'` | `_to` unchanged |
| U56.17 | `decompressJson` registered 3-part restores `_from` via connections map | collection `'commits-files-users'` | `_from: 'commits-files/cf1'` |
| U56.18 | `decompressJson` registered 3-part restores `_to` via connections map | collection `'commits-files-users'` | `_to: 'users/u1'` |
| U56.19 | `compressJson` ownership hunks renames `originalCommit` → `oc` | hunk with `originalCommit: 'sha1'` | `oc: 'sha1'`; no `originalCommit` |
| U56.20 | `compressJson` ownership hunks encodes lines as `"from,to"` strings | `lines: [{ from: 1, to: 5 }]` | `lines: ['1,5']` |
| U56.21 | `decompressJson` ownership hunks renames `oc` → `originalCommit` | `oc: 'sha1'` | `originalCommit: 'sha1'`; no `oc` |
| U56.22 | `decompressJson` ownership hunks decodes strings to `{ from, to }` | `lines: ['1,5']` | `lines: [{ from: '1', to: '5' }]` |
| U56.23 | Roundtrip plain collection restores `_id` prefix; drops `_key`/`_rev` | compress then decompress | `_id` restored; no `_key`/`_rev` |
| U56.24 | Roundtrip simple connection restores `_from` and `_to` | compress then decompress `'commits-files'` | `_from: 'commits/a'`; `_to: 'files/b'` |
| U56.25 | Roundtrip registered 3-part restores all fields including hunks | compress then decompress `'commits-files-users'` | `_from`, `_to`, `originalCommit`, `lines` all restored |

---

## Unit test file locations (utils/)

```
src/test/unit/utils/
├── dataPluginStorage.test.ts    (U55)
└── jsonUtils.test.ts            (U56)
```

---

# React Component Tests

**Framework**: Vitest + React Testing Library (`@testing-library/react`)
**Test environment**: jsdom
**Test ID convention**: `C{file_index}.{test_index}` (alphabetical file order)

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

Multi-step wizard (pages 1–4). Uses local `page` state.

| # | Description | Setup | Expected |
|---|---|---|---|
| C4.1 | Renders page 1 (Start) by default | render | `page-start` testid present, `page-database` absent |
| C4.2 | Clicking "Next" advances to page 2 | render, click Next | `page-database` testid present |
| C4.3 | Clicking "Back" on page 2 returns to page 1 | advance to page 2, click Back | `page-start` testid present |
| C4.4 | "Back" button is absent on page 1 | render | no button with text `/back/i` |
| C4.5 | Clicking through all 4 pages reaches the Summary page | click Next 3 times | `page-summary` testid present |
| C4.6 | Clicking "Save" on last page dispatches `initializeDashboardState` | navigate to page 4, click Save | `store.getState().dashboard.initialized === true` |
| C4.7 | "Cancel" button is present | render | button with text `/cancel/i` in DOM |
| C4.8 | Progress indicator shows step elements for all 4 pages | render | `setupStep1`–`setupStep4` all in DOM |

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
| I7.4 | `convertIssuesToGraphData` returns nodes and links with no `NaN` | pipe accounts through converter | `nodes.length > 0`; no `NaN` in `node.group` |
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
| I20.3 | `accounts` array is non-empty after saga | dispatch `setDateRange` | `accounts.length > 0` |
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
