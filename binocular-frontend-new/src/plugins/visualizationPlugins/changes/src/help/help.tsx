function Help() {
  return (
    <>
      <h2>Changes Help</h2>
      <h3>Data</h3>
      <p>
        The changes visualization is designed to show an overview of all the additions and deletions that were done to the repository by the
        individual authors. It can both display the absolut amount of all changes per author per time period or split into additions and
        deletions.
      </p>
      <h3>Parameters</h3>
      <div>
        <ul className={'list-disc ml-5'}>
          <li>
            <span className={'font-bold'}>Split Additions and Deletions:</span> Change the mode of the visualization to either show all
            changes or split the changes into additions and deletions while additions are displayed in the positive direction and deletions
            in the negative direction.
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
