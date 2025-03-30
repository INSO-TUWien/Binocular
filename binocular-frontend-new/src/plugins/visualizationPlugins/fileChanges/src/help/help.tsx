function Help() {
  return (
    <>
      <h2>File Changes Help</h2>
      <h3>Data</h3>
      <p>
        The File Changes visualization is designed to show how often a file was
        changed over time. It can display the amount of changes per commit.
      </p>
      <h3>Parameters</h3>
      <div>
        <ul className={"list-disc ml-5"}>
          <li>
            <span className={"font-bold"}>File:</span> Select the file that
            should be displayed.
          </li>
          <li>
            <span className={"font-bold"}>Split Additions and Deletions:</span>{" "}
            Change the mode of the visualization to either show all changes or
            split the changes into additions and deletions while additions are
            displayed in the positive direction and deletions in the negative
            direction.
          </li>
          <li>
            <span className={"font-bold"}>Visualization Style:</span> Change the
            style of how the lines are calculated into either curved (default),
            stepped or linear.
          </li>
          <li>
            <span className={"font-bold"}>Show Sprints:</span> Overlay the in
            the dashboard defined sprints onto the chart.
          </li>
          <li>
            <span className={"font-bold"}>Show Extra Metrics:</span> Displays
            additional metrics
          </li>
        </ul>
      </div>
      <h3>Metrics (in Metrics View)</h3>
      <div>
        <ul className={"list-disc ml-5"}>
          <li>
            <strong>Mean Period of Change (MPC):</strong> Represents the
            weighted sum of changes over time, indicating when most changes
            occurred. Range: [0, 100].
          </li>
          <li>
            <strong>Entropy:</strong> Measures the unpredictability of changes,
            with higher values indicating more evenly distributed changes.
            Range: [0, log2(total commits)].
          </li>
          <li>
            <strong>MaxBurst:</strong> The maximum number of consecutive changes
            within a short period, showing intense modification bursts. Range:
            [1, total commits].
          </li>
          <li>
            <strong>MaxChangeset:</strong> The highest number of files changed
            together in a single commit, indicating large-scale changes. Range:
            [0, max files changed in a commit].
          </li>
          <li>
            <strong>AvgChangeset:</strong> The average number of files modified
            alongside a given file per commit, providing insight into
            co-changes. Range: [0, max files changed in a commit].
          </li>
        </ul>
      </div>
    </>
  );
}

export default Help;
