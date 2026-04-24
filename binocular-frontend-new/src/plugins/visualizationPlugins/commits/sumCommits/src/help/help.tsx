function Help() {
  return (
    <>
      <h2>Sum Commits Help</h2>
      <h3>Data</h3>
      <p>
        The sum commits visualization is designed to show the amount of commits that were pushed to the repository by the individual authors
        and, optionally, external authors. It displays the absolute amount of all commits per author per time period, allowing for easy
        tracking of pushed code. Authors combined in the author list will be displayed as one bar, with multiple colour sections respective
        to each authors colour.
      </p>
      <h3>Parameters</h3>
      <div>
        <ul className={'list-disc ml-5'}>
          <li>
            <span className={'font-bold'}>Show mean:</span> Shows the mean of all pushed commits from every author, represented by a red
            dashed line.
          </li>
          <li>
            <span className={'font-bold'}>Show other authors:</span> Turns displaying of external authors on or off, if any have been added.
            They&#39;re represented by a black bar.
          </li>
        </ul>
      </div>
      <h3>Author details</h3>
      <p>Clicking on a bar displays additional information about an author:</p>
      <div>
        <ul className={'list-disc ml-5'}>
          <li>
            <span className={'font-bold'}>Sum Commits:</span> The sum of commits pushed to the repository with the selected author.
          </li>
          <li>
            <span className={'font-bold'}>Avg Commits per week:</span> Average of all commits pushed by the author in a week.
          </li>
          <li>
            <span className={'font-bold'}>Diff to:</span> Shows the difference to the commits of a selected author.
          </li>
          <li>
            <span className={'font-bold'}>Sum with:</span> Shows the sum of commits by the author and additional selected authors.
          </li>
        </ul>
      </div>
    </>
  );
}

export default Help;
