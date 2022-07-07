import styles from '../../styles.scss';


const CommitDetails = ({ commit }) => {

    return (
        <div className={styles.commitDetails}>
            
            <div className={styles.date}>
                {commit.date.substring(0,10)}
            </div>

            <div className={styles.stats}>
                <span className={styles.deletions}>-{commit.stats.deletions}</span> | <span className={styles.additions}>+{commit.stats.additions}</span>
                
            </div>

            <div className={styles.message}>
                <span>{commit.message}</span>
            </div>
            

            <div className={styles.link}>
                <button className={styles.button}>{commit.sha.substring(0,7)}</button>
            </div>
            
            
        </div>
    )




}

export default CommitDetails