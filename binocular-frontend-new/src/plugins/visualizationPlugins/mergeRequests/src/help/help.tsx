function Help() {
  // TODO remove github only as soon as backend is ready for gitlab
  return (
    <>
      <h2>Merge Requests Help</h2>
      <h3>Data</h3>
      <p>(Github only) The merge requests visualization provides an overview of the merge request statuses.</p>
      <h3>Parameters</h3>
      <div>
        <ul className={'list-disc ml-5'}>
          <li>
            <span className={'font-bold'}>Split Merge Requests per Assignee:</span>
            When enabled, the chart will display separate lines for each assignee, allowing you to see how many merge requests are assigned
            to each user.
          </li>
          <li>
            <span className={'font-bold'}>Breakdown Mode:</span>
            Choose between viewing the total number of merge requests open or open and merged by time interval.
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
