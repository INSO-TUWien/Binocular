function Help() {
  return (
    <div className="z-[999]">
      <h2>Commit By File Help</h2>
      <h3>Data</h3>
      <p>
        The commit by file visualization provides an overview of the files changed in a specific commit. It allows users to easily see where
        the main changes are made and how they are distributed across different files. Hovering over the files will show the full file path
        the number of addictions and deletions made in that commit.
      </p>
      <h3>Parameters</h3>
      <div>
        <ul className={'list-disc ml-5'}>
          <li>
            <span className={'font-bold'}>SHA:</span> This lets you manually enter the SHA of the commit you want to visualize.
          </li>
        </ul>
      </div>
      <h3>Mock Data</h3>
      <p>Mock commits have been implemented for the SHAs &quot;1&quot; and &quot;2&quot;.</p>
    </div>
  );
}

export default Help;
