const Help = () => (
  <>
    <h2>Issue Labels Help</h2>

    <h3>Data</h3>

    <p>
      This chart shows code churn (additions and deletions) over time for commits linked to issues carrying the selected label(s). A commit
      counts towards the chart if it is linked directly to a matching issue, or if it belongs to a merge request that references that issue.
      Commits are only counted once even if reachable through multiple issues or merge requests.
    </p>

    <h3>Parameters</h3>
    <div>
      <ul className={'list-disc ml-5'}>
        <li>
          <span className={'font-bold'}>Labels:</span> Select one or more labels in the settings. An issue only counts if it has all of the
          selected labels. With nothing selected, all issues are included.
        </li>
        <li>
          <span className={'font-bold'}>Show sprints:</span> Overlay the sprints defined in the dashboard onto the chart.
        </li>
      </ul>
    </div>
  </>
);

export default Help;
