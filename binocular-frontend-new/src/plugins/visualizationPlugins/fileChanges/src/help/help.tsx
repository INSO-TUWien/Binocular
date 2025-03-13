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
            the mean period of change on the chart, indicating the timeframes
            with the most activity (across the entire project). This metric ranges from 0 to 100 and is
            calculated as the weighted sum of changes across timeframes: ∑(i *
            (changes in timeframe i / total changes)), where i ranges from 0 to
            100. A higher value means the majority of changes were made in a more recent timeframe.
          </li>
        </ul>
      </div>
    </>
  );
}

export default Help;
