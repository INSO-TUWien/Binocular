function Help() {
  return (
    <>
      <h2>Sprints Help</h2>

      <h3>Data</h3>
      <p>
        The sprints visualization provides an overview of the issues and merge requests in a given time frame. It allows users to view these
        issues and merge requests on a timeline. The issues can be colored based on different modes. It is also possible to overlay the
        sprints in the selected time frame.
      </p>

      <p>
        The issues can be colored based on the assignee, the creator, the color of the person that spent the most time (Gitlab only) or the
        assigned labels. If the labels coloring mode is selected, the issues are colored based on their assigned labels. All labels are
        grouped based on their similarity to one another. The levenshtein distance and dbscan are used. There are three possible states a
        issue can have:
        <ol>
          <li>
            <em>No assigned labels:</em> The issue has no background color.
          </li>
          <li>
            <em>One assigned label:</em> The issue has only the color of the assigned label.
          </li>
          <li>
            <em>More than one assigned label:</em> The issue has a striped background that repeats. Each stripe has the color of one of the
            assigend issues.
          </li>
        </ol>
      </p>

      <h3>Parameters</h3>
      <div>
        <ul className={'list-disc ml-5'}>
          <li>
            <span className={'font-bold'}>Show sprints:</span> Overlay the in the dashboard defined sprints onto the chart. Sprints are
            displayed as rectengulars at the bottom, with vertical lines that denote their borders. They also show aggregated information
            based on the issues within their timeframe.
          </li>
          <li>
            <span className={'font-bold'}>Coloring Mode:</span> Change the style of how the issues are colored. The options are author
            (default), assignee, most time spent (Gitlab only) or labels.
          </li>
          <li>
            <span className={'font-bold'}>Max difference between labels:</span> Number of characters that can be different between two
            labels.
          </li>
          <li>
            <span className={'font-bold'}>Min group size:</span> Number of similar labels, so it can be considered a group.
          </li>
        </ul>
      </div>
    </>
  );
}

export default Help;
