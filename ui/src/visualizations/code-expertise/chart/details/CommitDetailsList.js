import styles from '../../styles.scss';
import CommitDetails from './CommitDetails';

const CommitsDetailsList = ({ commits, date }) => {

    const dateString = (new Date(date)).toLocaleDateString()

    return(
        <div className={styles.commitsDetailsListContainer}>
            <label>{dateString}</label>
            <div className={styles.commitDetailsList}>
                {commits.map(c => <CommitDetails commit={c}></CommitDetails>)}
            </div>
        </div>
        
    )
}

export default CommitsDetailsList