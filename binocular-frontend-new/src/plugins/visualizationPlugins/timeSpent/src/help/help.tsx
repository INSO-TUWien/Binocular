function Help() {
  return (
    <>
      <h2>Builds Help</h2>
      <h3>Data</h3>
      <p>
        The builds visualization provides an overview of the build statuses. It allows users to track the outcomes of builds, including
        successful, failed, and cancelled builds.
      </p>
      <h3>Parameters</h3>
      <div>
        <ul className={'list-disc ml-5'}>
          <li>
            <span className={'font-bold'}>Split Authors per Build:</span> Change the mode of visualization to either show all builds grouped
            by status or split the builds by authors. Negative builds are all builds, which are not successful.
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
