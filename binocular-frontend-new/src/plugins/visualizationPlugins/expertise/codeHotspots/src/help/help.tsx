function Help() {
  return (
    <>
      <h2>Code Hotspots</h2>
      The Code Hotpots visualization visualizes hotspots within the development history of a specific file. To view a file select one from
      the file tree at the left. It is also possible to select the branch the version of the file shown gets pulled from. As default the
      branch that was checked out during indexing is selected. The Heatmap then gets generated based on the heatmap type selected.
      <h3>Heatmap Types</h3>
      <h4>Commits</h4>
      The commits heatmap shows a heatmap based on the commits a file went through its development history. It enables to quickly discover
      which commits had the most impact on a file or specific row. The columns hereby list all the commits. Hover over them to get more
      information to a specific commit or view other files that got changed in the same commit. The commit tooltip also allows to switch the
      code view to the state of the commit.
      <h4>Issues</h4>
      <div role="alert" className="alert alert-error">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>Work in Progress!</span>
      </div>
      <h4>Authors</h4>
      <div role="alert" className="alert alert-error">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>Work in Progress!</span>
      </div>
      <h3>Gitlab</h3>
      For visualizing private gitlab repositories it is necessary to add the{' '}
      <span className="badge badge-primary badge-xs">server url</span>, the <span className="badge badge-primary badge-xs">project id</span>{' '}
      (Example Format: [Group Name]/[SubgroupName]/[ProjectName]) and your <span className="badge badge-primary badge-xs">api key</span> so
      that the sourcecode can be requested.
    </>
  );
}

export default Help;
