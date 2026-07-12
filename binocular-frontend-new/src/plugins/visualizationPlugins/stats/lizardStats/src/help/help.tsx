function Help() {
  return (
    <>
      <h2>Lizard Stats Help</h2>
      <h3>Data</h3>
      <p>
        The lizard stats visualization is designed to show a score regarding the maintainability of files in certain folders. It is
        there to help developers to find hard to maintain files easily and show which values are responsible for this score. These scores
        are calculated using a formula and represent how difficult it is to maintain each file. A slidebar gives the option to weight the
        score regarding average score or maximum (worst) score for each file. These maximum scores are determined by the worst value for
        each file, given all the functions in it.
      </p>
      <h3>Amount of files</h3>
      <p>Gives the option to decide how many files should be shown.</p>
      <h3>Weighting slidebar</h3>
      <p>The weighting of the shown lizard score can be chosen with a slidebar, this gives the option to either focus more on the worst file in regards
      to the maximum score or to the average score.</p>
      <h3>File details</h3>
      <p>Clicking on a bar displays additional information about the file data:</p>
      <div>
        <ul className={'list-disc ml-5'}>
          <li>
            <span className={'font-bold'}>File Path:</span> The location of the file in the project.
          </li>
          <li>
            <span className={'font-bold'}>Max Nloc:</span> Maximum amount of lines without any comments (per function).
          </li>
          <li>
            <span className={'font-bold'}>Max Ccn:</span> Maximum amount of cyclomatic dependencies (per function).
          </li>
          <li>
            <span className={'font-bold'}>Max Tokens:</span> Maximum amount of tokens (per function).
          </li>
          <li>
            <span className={'font-bold'}>Max Parameters:</span> Maximum amount of parameters (per function).
          </li>
          <li>
            <span className={'font-bold'}>Max Length:</span> Maximum amount of lines of code (per function).
          </li>
          <li>
            <span className={'font-bold'}>Avg Nloc:</span> Average amount of lines without any comments (per function).
          </li>
          <li>
            <span className={'font-bold'}>Avg Ccn:</span> Average amount of cyclomatic dependencies (per function).
          </li>
          <li>
            <span className={'font-bold'}>Avg Tokens:</span> Average amount of tokens (per function).
          </li>
          <li>
            <span className={'font-bold'}>Avg Parameters:</span> Average amount of parameters (per function).
          </li>
          <li>
            <span className={'font-bold'}>Avg Length:</span> Average amount of lines of code (per function).
          </li>
          <li>
            <span className={'font-bold'}>Function Count:</span> Amount of functions in this file.
          </li>
          <li>
            <span className={'font-bold'}>Max Lizard Score:</span> Maximum lizard score .
          </li>
          <li>
            <span className={'font-bold'}>Avg Lizard Score:</span> Average lizard score.
          </li>
          <li>
            <span className={'font-bold'}>Norm Max Lizard SCore:</span> Normalized maximum lizard score (between 0 and 1).
          </li>
          <li>
            <span className={'font-bold'}>Norm Avg Lizard SCore:</span> Normalized avg lizard score (between 0 and 1).
          </li>
        </ul>
      </div>
    </>
  );
}

export default Help;
