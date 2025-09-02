function Help() {
  return (
    <>
      <h2>Collaboration Visualization - Help</h2>

      <p>
        This view shows how authors work together based on shared issues. Each
        picture is an author; lines between them mean they worked on the same
        issue. Thicker lines = more shared work.
      </p>

      <h3>What you’re seeing</h3>
      <ul>
        <li>
          <strong>Authors:</strong> Avatars you can click to open their profile.
        </li>
        <li>
          <strong>Connections:</strong> Lines showing shared issues.
        </li>
        <li>
          <strong>Groups:</strong> Soft, colored outlines that surround related
          people.
        </li>
      </ul>

      <h3>How to use it</h3>
      <ul>
        <li>
          <strong>Zoom &amp; Pan:</strong> Scroll to zoom, drag the background
          to move the view.
        </li>
        <li>
          <strong>Drag authors:</strong> Move nodes to untangle or highlight
          connections.
        </li>
        <li>
          <strong>Hover:</strong> See names or details about shared issues.
        </li>
        <li>
          <strong>Click a connection:</strong> Lock open a tooltip with links to
          the shared issues.
        </li>
        <li>
          <strong>Filter by collaboration strength:</strong> Use the settings to
          hide weaker connections and focus on strong ones.
        </li>
        <li>
          <strong>Filter by date:</strong> Limit the graph to issues created or
          updated within a chosen time range to focus on recent collaboration.
        </li>
      </ul>

      <h3>Tips</h3>
      <ul>
        <li>Thicker lines show closer collaboration.</li>
        <li>
          Clusters of authors inside one outline usually indicate a sub-team.
        </li>
      </ul>
    </>
  );
}

export default Help;
