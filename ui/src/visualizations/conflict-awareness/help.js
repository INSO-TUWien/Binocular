'use strict';

import cx from 'classnames';

import styles from './styles.scss';
import clusteredNodeFilteredImage from './help-images/clusteredNodeFiltered.png';
import clusteredNodeAllImage from './help-images/clusteredNodeAll.png';
import commitSelectedImage from './help-images/commitSelected.png';
import commitFilterInImage from './help-images/commitFilterIn.png';
import commitFilteredOutImage from './help-images/commitFilteredOut.png';
import dependencyCommitImage from './help-images/dependencyCommit.png';
import commitFromIssue from './help-images/commitIssue.png';

export default () => (
  <div className={cx('box', styles.help)}>
    <h1 className="title">Conflict Awareness Help</h1>
    <p>
      This visualization aims to show the divergence between parents and forks and conflicts of
      merges, rebases and cherry-picks. Currently, this visualization only works with GitHub
      repositories.
      <br />
      The graph represent the commit history of the selected repositories. Commits are shown as
      filled nodes and parent-child relationships as edges of the graph. A clustered node groups
      multiple commits such that the graph will be more compacted. Such node contains the number of
      nodes that it holds. Branch references are shown above or below its head node based on the
      chosen layout.
    </p>
    <h2>Config Structure</h2>
    <p>The config is divided in 7 sections.</p>
    <h3>Layout</h3>
    <p>
      Change the layout of the commit graph. The earliest commit is the initial commit and the
      latest commits are the branch heads. The{' '}
      <b>
        <i>Reset Location</i>
      </b>{' '}
      button resets the graph location to its initial position and zoom level.
    </p>
    <h3>Graph Expansion/Compaction</h3>
    <p>
      Branching nodes are commits that do not have only one parent and one child, and commits that
      are heads of branches. The{' '}
      <b>
        <i>Compact all</i>
      </b>{' '}
      button compacts the whole graph. That means that all commits between two branching nodes will
      be grouped into a clustered node. The{' '}
      <b>
        <i>Expand all</i>
      </b>{' '}
      button expands the whole graph. That means all clustered commits will be replaced with the
      actual commit history they hold.
    </p>
    <h3>Base Project</h3>
    <p>
      The section of the base project contains the owner and name of the repository, its branches
      and the chosen color in which its elements should be shown. All elements that can only be
      found in this repository are colored with it. Branches can be included in the graph by
      checking its checkbox or excluded from the graph by unchecking its checkbox.
    </p>
    <h3>Other Project</h3>
    <p>
      The section of the other project contains similar information as the base project section.
      Additionally, the parent or fork repository that should be compared can be selected.
    </p>
    <h3>Combined</h3>
    <p>
      The combined section only contains the color of the elements that can be found in both the
      base project and the other project. This represents the forking point.
    </p>
    <h3>Issue Filter</h3>
    <p>
      The issue filter highlights all commits that are linked to a specific issue. The issue
      selection can be textual or with a selection of a base projects GitHub issue. The textual
      issue filter highlights all commits that contain the search phrase in the commit message (case
      insensitive). The issue filter selection highlights all commits that contain the id of the
      issue in the commit message.
    </p>
    <h3>Filters</h3>
    <p>
      Different filters enable to search the commit history of the selected repositories. Multiple
      filters will be conjuncted which means that the search field will be more restrictive when
      adding a new filter.
    </p>
    <p>
      The{' '}
      <b>
        <i>After</i>
      </b>{' '}
      filter highlights/shows all commits that are committed after a specific date (inclusive).
    </p>
    <p>
      The{' '}
      <b>
        <i>Before</i>
      </b>{' '}
      filter highlights/shows all commits that are committed befor a specific date (inclusive).
    </p>
    <p>
      The{' '}
      <b>
        <i>Committer</i>
      </b>{' '}
      filter highlights all commits from a selected committer.
    </p>
    <p>
      The{' '}
      <b>
        <i>Author</i>
      </b>{' '}
      filter highlights all commits from a specific author.
    </p>
    <p>
      The{' '}
      <b>
        <i>Subtree</i>
      </b>{' '}
      filter highlights/shows all children of a specific commit (inclusive).
    </p>
    <p>
      All filter provide a highlight and show option. The highlight option highlights all commits
      that meet the set filter criteria. The functionality of the show option is split into two. For
      the after, before and subtree filter the show option will remove all commits that do not meet
      the filter criteria. For the author and committer filter, this option will compact the whole
      graph, but will treat the commits of the selected committer or author as branching nodes. The
      expand functionality is disabled in combination with these two filter options.
    </p>
    <h2>Node Highlights</h2>
    <figure style={{ width: '100px', display: 'inline-table', margin: '10px' }}>
      <img src={commitSelectedImage} />
      <figcaption>selected commit</figcaption>
    </figure>
    <figure style={{ width: '100px', display: 'inline-table', margin: '10px' }}>
      <img src={dependencyCommitImage} />
      <figcaption>dependency of a selected commit</figcaption>
    </figure>
    <figure style={{ width: '100px', display: 'inline-table', margin: '10px' }}>
      <img src={commitFromIssue} />
      <figcaption>commit of a selected issue</figcaption>
    </figure>
    <figure style={{ width: '100px', display: 'inline-table', margin: '10px' }}>
      <img src={commitFilterInImage} />
      <figcaption>commit which meet all set filters</figcaption>
    </figure>
    <figure style={{ width: '100px', display: 'inline-table', margin: '10px' }}>
      <img src={commitFilteredOutImage} />
      <figcaption>commit which not meet al set filters</figcaption>
    </figure>
    <figure style={{ width: '150px', display: 'inline-table', margin: '10px' }}>
      <img src={clusteredNodeAllImage} />
      <figcaption>clustered commits - all commits within meet the set filters</figcaption>
    </figure>
    <figure style={{ width: '150px', display: 'inline-table', margin: '10px' }}>
      <img src={clusteredNodeFilteredImage} />
      <figcaption>clustered commits - some commits within meet the set filters</figcaption>
    </figure>
    <h2>Actions</h2>
    <p>
      <b>
        <i>Hover over commit:</i>
      </b>{' '}
      show basic metadata (sha, author & time, committer & time, short message)
    </p>
    <p>
      <b>
        <i>Double click on commit:</i>
      </b>{' '}
      show detailed metadata (sha, commit message, diff)
    </p>
    <p>
      <b>
        <i>Left click on commit:</i>
      </b>{' '}
      select a commit
    </p>
    <p>
      <b>
        <i>Left click on commit + strg key:</i>
      </b>{' '}
      multi-select commits
    </p>
    <p>
      <b>
        <i>Right click on commit:</i>
      </b>{' '}
      copy sha/collapse section
    </p>
    <p>
      <b>
        <i>Right click on clustered commits:</i>
      </b>{' '}
      expand section
    </p>
    <p>
      <b>
        <i>Hover over branch-reference:</i>
      </b>{' '}
      show action + highlight history path
    </p>
    <p>
      <b>
        <i>Click on branch-reference (nothing selected):</i>
      </b>{' '}
      select branch
    </p>
    <p>
      <b>
        <i>Click on branch-reference + commit(s) selected:</i>
      </b>{' '}
      start conflict check: cherry-pick(s)
    </p>
    <p>
      <b>
        <i>Click on branch-reference + strg key + branch selected:</i>
      </b>{' '}
      start conflict check: rebase
    </p>
    <p>
      <b>
        <i>Click on branch-reference + shift key + branch selected:</i>
      </b>{' '}
      start conflict check: merge
    </p>
  </div>
);
