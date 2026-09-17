# Binocular Demo Category — Commits (Changes, Sum Commits, File Changes, Commit By File, Change Frequency)

**Estimated runtime: ~370s (~6.2min)**
**Self-contained** — does not assume the core script or any other category video played first.
Covers every plugin registered under `VisualizationPluginMetadataCategory.Commits`. Code Hotspots
(Expertise) and the Examples plugins are out of scope for the category split — see
`playwright.config.ts`/`demo-category-expertise.test.ts` comments for why.

Grounded in:
`binocular-frontend-new/src/plugins/visualizationPlugins/commits/changes/src/{settings/settings.tsx,utilities/dataConverter.ts,help/help.tsx}`,
`.../commits/sumCommits/src/{utilities/dataConverter.ts,help/help.tsx}`,
`.../commits/fileChanges/src/{settings/settings.tsx,utilities/dataConverter.ts,help/help.tsx}`,
`.../commits/commitByFile/src/{chart/commitByFileViz.tsx,help/help.tsx}`,
`.../changeFrequency/src/{utilities/hierarchy.ts,help/help.tsx}`,
`binocular-backend/core/provider/git.js`, `binocular-backend/models/models/Commit.ts`.

---

## Changes (~85s)

**[on screen: Binocular open, full-viewport Changes chart]**

> This is Binocular's Changes view — a running record of every addition and deletion made to the
> codebase, broken down by author, over time.

**[cue: point out the stacked area chart — colored bands, one per author]**

> By default it's one stacked area per author, showing combined change volume per time bucket.

**[cue: open the chart's settings panel → toggle "Split Additions and Deletions" on]**

> Flip Split Additions and Deletions on, and each author's band splits into additions rising
> above the axis and deletions falling below it — so you can tell whether someone's mostly
> writing new code or cutting it down.

**[cue: change "Visualization Style" dropdown from curved → stepped]**

> Visualization Style switches the interpolation between the plotted points — purely a
> readability choice, the underlying numbers don't change.

**[cue: hover over one author's tall band]**

> The natural read: the taller someone's band, the more they "did" that period.

**[cue: hold on the chart, no further action]**

> Worth being careful with that. Binocular's indexer walks each commit's file tree by path, with
> no rename detection — so renaming a file with zero actual content change gets recorded as one
> commit deleting the *entire old file* and adding back the *entire new one*. A tall band can mean
> "did a lot of real work" or "renamed a big file" — the chart alone won't tell you which.

## Sum Commits (~70s)

**[on screen: full-viewport Sum Commits chart — one ranked bar per author]**

> Sum Commits gives you the flip side of Changes: instead of change volume spread over time, it's
> a single ranked bar per author, sized by how many commits they've pushed in total.

**[cue: open settings → toggle "Show Mean" on]**

> Show Mean draws a dashed line at the average commit count across everyone — an instant sense of
> who's above or below the middle of the pack.

**[cue: toggle "Show other authors" on]**

> Show other authors folds anyone not on your author list into a single black "others" bar,
> instead of just dropping them silently.

**[cue: fill "Top N Authors" with 3]**

> Top N Authors trims the bar chart down to just the leaders — set it to 3 and you're only
> looking at your three most active committers.

**[cue: hover the tallest bar]**

> The obvious read: whoever's bar is tallest has contributed the most.

**[cue: hold on the chart]**

> That's a commit-count leaderboard, not a size-of-contribution one — the bar height is a literal
> count from `_.countBy`, with no weighting for how large or small each commit was. Someone who
> makes fifty one-line commits ranks above someone who makes five enormous ones. And the "Avg
> Commits per week" figure you'd see on a bar's detail view is anchored to *that author's own*
> first-to-last commit span, not a shared time window — so an author who committed once, went
> quiet for eight months, then committed again gets a long span diluting their average, while
> someone active in a tight burst looks disproportionately higher, even with fewer total commits.

## File Changes (~75s)

**[on screen: full-viewport File Changes chart for a preselected file]**

> File Changes is Changes zoomed all the way into a single file — pick any file in the repo and
> see just its own addition/deletion history over time.

**[cue: open settings → toggle "Show extra Metrics" on]**

> Show extra Metrics reveals a row of summary numbers for this file: Mean Period of Change,
> Entropy, MaxBurst, MaxChangeset, and AvgChangeset.

**[cue: change "Visualization Style" dropdown to linear]**

> Visualization Style is the same curved/stepped/linear cosmetic choice as everywhere else in
> Binocular.

**[cue: point at a high-entropy, scattered-looking history vs. hovering a MaxBurst spike]**

> Here's a real read those extra metrics support: high Entropy with a low MaxBurst means many
> small, scattered edits over time, while a low-entropy chart with one big MaxBurst spike means
> this file mostly sat still and then got one focused, intense rewrite.

**[cue: hold on the metrics row]**

> One thing those metrics can't see: a rename. The chart matches hunks to this file by its
> *current* exact path,  so if this file used to live somewhere
> else and got renamed partway through its life, every commit from before the rename is invisible
> to the file selector entirely. A file that's actually years old can look, by these metrics, like
> it was only just created — Entropy and Mean Period of Change both understate its true lifetime
> activity whenever a rename severs the path history.

## Commit By File (~60s)

**[on screen: full-viewport Commit By File treemap for a single commit]**

> Commit By File flips the axis again: instead of one file across many commits, it's every file
> touched by a single commit, sized by how much of that commit's total diff each one accounts for.

**[cue: hover the largest segment, then a small one]**

> Segment size here is a share of one commit's total change — `changeRatio` is that file's
> additions-plus-deletions divided by the *whole commit's* additions-plus-deletions, so it says
> nothing about how important that file is to the codebase overall, only how much of *this one
> commit* landed there.

## Change Frequency (~90s)

**[on screen: full-viewport Change Frequency hierarchy view]**

> Change Frequency turns the whole repository into a navigable hierarchy — drill from root
> folders down into individual files, colored by whether that path leans toward additions or
> deletions.

**[cue: click "Directory", then click into "frontend", then "src" — breadcrumb updates each time]**

> Clicking into a folder in the Directory drawer (or the breadcrumb at the top) walks you down the
> file tree one level at a time, and the color and size of what you land on update to that
> narrower scope.

**[cue: point at a large, brightly colored top-level folder]**

> The natural read: a directory's size and color tell you where the most (or most lopsided)
> activity is happening.

**[cue: hold on the chart]**

> Two things worth knowing about how that's built. First, a directory's stats are just the sum of
> every file underneath it — so one enormous, frequently-touched file can make an entire folder
> look "hot" even if every other file inside it barely changes. Second, "average changes per
> commit" at the directory level divides total changes by the count of *unique commits that
> touched anything under that folder* — so a single sweeping commit that touches fifty files in
> one directory (say, a repo-wide reformat) still only counts once in that denominator, making the
> average look far higher than it would if you counted per-file.

---

**[END CATEGORY — ≈370s]**
