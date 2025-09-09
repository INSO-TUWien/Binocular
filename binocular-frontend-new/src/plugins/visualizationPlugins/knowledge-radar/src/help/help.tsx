function Help() {
  return (
    <>
      <h2>Knowledge Radar Help</h2>
      <h3>Data</h3>
      <p>
        Shows developer expertise levels across packages/files using a radar chart. Only shows packages the selected developer or developers
        have worked on.
      </p>

      <h2>Interaction</h2>
      <div>
        <ul>
          <li>
            <i className="fa fa-mouse-pointer" /> Click package names to navigate deeper into hierarchy.
          </li>
          <li>
            <i className="fa fa-arrow-left" /> Use &quot;back&quot; button to navigate up one level.
          </li>
          <li>
            <i className="fa fa-users" /> Select multiple developers to compare expertise profiles.
          </li>
        </ul>
      </div>
      <h2>Tips</h2>
      <p>Packages with colored borders indicate deeper levels. Distance from center shows expertise level: center = low, edge = high.</p>
    </>
  );
}

export default Help;
