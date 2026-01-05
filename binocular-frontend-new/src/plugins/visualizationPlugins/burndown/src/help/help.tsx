const Help = () => (
  <>
    <h2>Burndown Help</h2>

    <h3>Data</h3>

    <p>
      The burndown chart visualization shows the trajectory of the open tickets over time. The visualization displayes an ideal line over
      the selected timespan. The granularity of the selected timespan can be changed in the general parameters.
    </p>

    <h3>Parameters</h3>
    <div>
      <ul className={'list-disc ml-5'}>
        <li>
          <span className={'font-bold'}>Show sprints:</span> Overlay the in the dashboard defined sprints onto the chart. Sprints are
          displayed as rectengulars at the bottom, with vertical lines that denote their borders. They also show aggregated information
          based on the issues within their timeframe.
        </li>
      </ul>
    </div>
  </>
);

export default Help;
