function Help() {
  return (
    <>
      <h2>Collaboration Visualization</h2>

      <p>
        This view shows collaboration between contributors based on shared issues and merge requests. Two people are connected when they are
        both linked to the same issue or merge request — as its <strong>author</strong> or as an <strong>assignee</strong>. The more items
        they share, the thicker the line between them.
      </p>
      <p>
        Enable <em>Include commit message references</em> in settings to also connect contributors via commit messages: if a commit message
        references an issue or merge request (e.g. <code>#42</code> or <code>!15</code>), the commit author is treated as a participant in
        that item and linked to its existing author and assignees.
      </p>

      <h3>What you&apos;re seeing</h3>
      <ul>
        <li>
          <strong>Nodes:</strong> Contributors — click an avatar to open their profile.
        </li>
        <li>
          <strong>Lines:</strong> Shared issues or merge requests between two contributors. Hover to see which ones; click to lock the
          tooltip open with links.
        </li>
        <li>
          <strong>Colored outlines:</strong> Groups of contributors who are all connected to each other (directly or indirectly).
        </li>
      </ul>

      <h3>How to use it</h3>
      <ul>
        <li>
          <strong>Zoom &amp; Pan:</strong> Scroll to zoom, drag the background to pan.
        </li>
        <li>
          <strong>Drag nodes:</strong> Reposition contributors to untangle overlapping connections.
        </li>
        <li>
          <strong>Filter by strength:</strong> Use the settings to set a minimum and maximum number of shared issues, hiding weak or very
          strong connections.
        </li>
        <li>
          <strong>Filter by date:</strong> Limit the graph to issues created within a chosen time range.
        </li>
      </ul>

      <h3>Tips</h3>
      <ul>
        <li>Contributors with no shared issues in the selected range appear as isolated nodes.</li>
        <li>Clusters inside one colored outline typically indicate a sub-team or work area.</li>
      </ul>
    </>
  );
}

export default Help;
