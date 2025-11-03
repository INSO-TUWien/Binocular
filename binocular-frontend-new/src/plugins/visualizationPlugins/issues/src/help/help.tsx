function Help() {
  return (
    <>
      <h2>Issues Help</h2>
      <h3>Data</h3>
      <p>
        The Issues visualization displays the number of issues assigned to each assignee over time. It helps track workload distribution and
        identify trends in issue assignments.
      </p>
      <h3>Parameters</h3>
      <div>
        <ul className={'list-disc ml-5'}>
          <li>
            <span className={'font-bold'}>Split Issues per Assignee:</span>
            When enabled, the chart will display separate lines for each assignee, allowing you to see how many issues are assigned to each
          </li>
          <li>
            <span className={'font-bold'}>Breakdown Mode:</span> Choose between viewing the total number of issues assigned to each assignee
            or the current number of issues
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
