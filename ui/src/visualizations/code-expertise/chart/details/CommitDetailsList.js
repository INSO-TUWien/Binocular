import styles from '../../styles.scss';
import CommitDetails from './CommitDetails';

const CommitsDetailsList = ({ commits }) => {

    return(
        <div className={styles.commitDetailsList}>
            {commits.map(c => <CommitDetails commit={c}></CommitDetails>)}
        </div>
    )
}

export default CommitsDetailsList