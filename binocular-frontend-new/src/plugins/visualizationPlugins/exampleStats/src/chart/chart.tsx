import styles from './chatStyles.module.scss';

function Chart() {
  return (
    <>
      <div className={styles.chartContainer}>
        <div className="stats shadow stats-vertical m-2 w-11/12">
          <div className="stat">
            <div className="stat-title">Commits</div>
            <div className="stat-value text-primary">1000</div>
          </div>

          <div className="stat">
            <div className="stat-title">Issues</div>
            <div className="stat-value text-primary">500</div>
          </div>

          <div className="stat">
            <div className="stat-title">Workflow Runs</div>
            <div className="stat-value text-primary">200</div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Chart;
