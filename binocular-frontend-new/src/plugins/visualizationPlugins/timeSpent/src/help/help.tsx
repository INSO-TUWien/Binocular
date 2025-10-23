function Help() {
  return (
    <>
      <h2>Time Spent Help</h2>
      <h3>Data</h3>
      <p>(Gitlab only) The time spent visualization provides an overview of the time tracked by users on issues.</p>
      <h3>Parameters</h3>
      <div>
        <ul className={'list-disc ml-5'}>
          <li>
            <span className={'font-bold'}>Split Time per Issue:</span>
            When enabled, the chart will display separate lines for each issue, allowing you to see how much time was spent on each issue.
          </li>
          <li>
            <span className={'font-bold'}>Split Spent Removed:</span>
            When enabled, the chart will display separate lines for time spent and time removed.
          </li>
          <li>
            <span className={'font-bold'}>Breakdown Mode:</span>
            Choose between viewing the total time spent or the time spent per time interval.
          </li>
          <li>
            <span className={'font-bold'}>Visualization Style:</span> Change the style of how the lines are calculated into either curved
            (default), stepped or linear.
          </li>
          <li>
            <span className={'font-bold'}>Show Sprints:</span> Overlay the in the dashboard defined sprints onto the chart.
          </li>
        </ul>
      </div>
    </>
  );
}

export default Help;
