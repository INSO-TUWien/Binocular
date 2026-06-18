function Help() {
  return (
    <>
      <h2>Change Frequency</h2>
      <p>
        The Change Frequency visualization displays the hierarchy of the codebase, showing how frequently files and modules are modified.
        This helps identify the most active parts of the codebase over time.
      </p>
      <h3>How to Use This Visualization</h3>
      <div>
        <ul className={'list-disc ml-5'}>
          <li>
            <span className={'font-bold'}>Date Range:</span> Use the date range selectors at the top to select a time frame. Only changes
            that occurred within this time frame will be shown.
          </li>
          <li>
            <span className={'font-bold'}>Directory Navigation:</span> Click either on the modules in the Directory tab or on the data
            points in the visualization to navigate through the codebase hierarchy. Use the breadcrumb navigation at the top to return to
            parent directories.
          </li>
          <li>
            <span className={'font-bold'}>Color Indicators:</span> The color bar next to each file or module or the color of the datapoint
            in the visualization indicates the ratio of additions to deletions:
            <ul className={'list-disc ml-5'}>
              <li>
                <span style={{ color: '#ff1a1a' }}>Red</span> - Mostly deletions
              </li>
              <li>
                <span style={{ color: '#ffcc00' }}>Yellow</span> - Equal additions and deletions
              </li>
              <li>
                <span style={{ color: '#2ecc40' }}>Green</span> - Mostly additions
              </li>
            </ul>
          </li>
        </ul>
      </div>
      <h3>Understanding the Data</h3>
      <p>For each file or module, the visualization shows:</p>
      <div>
        <ul className={'list-disc ml-5'}>
          <li>
            <span className={'font-bold'}>First modification:</span> The date of the first commit that modified this file or module.
          </li>
          <li>
            <span className={'font-bold'}>Last modification:</span> The date of the last commit that modified this file or module.
          </li>
          <li>
            <span className={'font-bold'}>Total additions:</span> The number of lines added across all commits.
          </li>
          <li>
            <span className={'font-bold'}>Total deletions:</span> The number of lines removed across all commits.
          </li>
          <li>
            <span className={'font-bold'}>Commit count:</span> How many commits modified this file or module.
          </li>
          <li>
            <span className={'font-bold'}>Modification ownership:</span> Who has modified this file or module and how many additions and
            deletions they have made.
          </li>
        </ul>
      </div>
    </>
  );
}

export default Help;
