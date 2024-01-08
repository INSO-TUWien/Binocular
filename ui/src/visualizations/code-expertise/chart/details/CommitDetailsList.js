import styles from '../../styles.module.scss';
import CommitDetails from './CommitDetails';
import _ from 'lodash';

const CommitsDetailsList = ({ commits, sort }) => {
  if (sort === 'date') {
    const result = [];

    Object.entries(
      _.groupBy(
        commits.sort((a, b) => new Date(b.date) - new Date(a.date)),
        (commit) => commit.date.substring(0, 10),
      ),
    ).map((item, index) => {
      const date = item[0];
      const commits = item[1];
      const dateString = new Date(date).toLocaleDateString();
      result.push(
        <div className={styles.commitsDetailsListContainer} key={index}>
          <label>{dateString}</label>
          <div className={styles.commitDetailsList}>
            {commits.map((c, index) => (
              <CommitDetails commit={c} key={index}></CommitDetails>
            ))}
          </div>
        </div>,
      );
    });

    return result;
  } else {
    let commitsToDisplay = commits;

    if (sort === 'additions') commitsToDisplay = commits.sort((a, b) => b.stats.additions - a.stats.additions);
    else if (sort === 'deletions') commitsToDisplay = commits.sort((a, b) => b.stats.deletions - a.stats.deletions);
    else if (sort === 'good') commitsToDisplay = commits.sort((a, b) => (b.build === 'success') - (a.build === 'success'));
    else if (sort === 'bad') {
      commitsToDisplay = commits.sort((a, b) => (b.build !== null && b.build !== 'success') - (a.build !== null && a.build !== 'success'));
    }

    commitsToDisplay = commitsToDisplay.map((c, index) => {
      return (
        <div className={styles.commitDetailsList} key={index}>
          <CommitDetails commit={c}></CommitDetails>
        </div>
      );
    });

    return <div>{commitsToDisplay}</div>;
  }
};

export default CommitsDetailsList;
