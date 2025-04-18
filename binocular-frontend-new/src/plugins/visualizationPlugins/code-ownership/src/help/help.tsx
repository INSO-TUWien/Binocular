function Help() {
  return (
    <>
      <h2>Code Ownership Help</h2>
      <h3>Data</h3>
      <p>This chart shows the number of lines owned by each author (y-axis) over time (x-axis), starting with the first commit.</p>

      <h2>Interaction</h2>
      <div>
        <ul>
          <li>
            <i className="fa fa-crosshairs" /> Select an area of the chart to zoom.
          </li>
          <li>
            <i className="fa fa-hand-pointer" /> Doubleclick to reset the viewport.
          </li>
          <li>
            <i className="fa fa-arrow-pointer" /> Hover over an area of the chart to see the amount of lines owned for an author.
          </li>
        </ul>
      </div>

      <h2>Settings</h2>
      <div>
        <ul>
          <li>Use the settings to select branches, (de)select authors and files, and select a timespan for the visualization.</li>
          <li>
            You can switch between absolute and relative mode.
            <ul>
              <li>
                <i className="fa fa-bars" /> Absolute: Show the absolute number of lines each author owns at a specific time.
              </li>
              <li>
                <i className="fa fa-percent" /> Relative: Show the relative ownership of each author compared to the other selected authors.
              </li>
            </ul>
          </li>
        </ul>
      </div>

      <h2>Tips</h2>
      <p>
        Since projects may contain large auto-generated files (like package-lock.json) that may drastically influence ownership, it is
        advised to deselect these files.
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
