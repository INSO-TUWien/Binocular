import React, { useState, useEffect } from "react";
import styles from '../../styles.scss';


const CommitDetails = ({ commit }) => {

    const [isExpanded, setExpanded] = useState(false)

    let ciIcon = null
    let ciText = null
    let colorClass = styles.commitDetailsNeutral

    if(!commit.build) {
        ciIcon = <i className={'fa fa-minus'}/>
        ciText = 'No CI-Data found'
    } else {
        if(commit.build === 'success') {
            ciIcon = <i className={'fa fa-check'}/>
            ciText = 'CI passed'
            colorClass = styles.commitDetailsGood
        }
        else {
            ciIcon = <i className={'fa fa-times'}/>
            ciText = 'CI failed'
            colorClass = styles.commitDetailsBad
        }
    }

    const date = new Date(commit.date)
    const dateString = `Committed on ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`

    const shaShort = commit.sha.substring(0,7)

    if(isExpanded) {
        return (
            <div key={commit.sha}>
                <div
                className={styles.commitDetailsExpanded + ' ' + colorClass}
                onClick={() => setExpanded(!isExpanded)}>
                    
                    <div>
                        <span>{ciIcon} </span>
                        <span> {ciText}</span>
                    </div>
                    

                    <div className={styles.stats}>
                        <span className={styles.deletions}>{commit.stats.deletions} deletions</span>, <span className={styles.additions}>{commit.stats.additions} additions</span>
                    </div>

                    <div>
                        <label>Message:</label>
                        <p>{commit.message}</p>
                    </div>

                    <div>
                        <label>Sha: </label>
                        <span>{commit.sha}</span>
                    </div>

                    
                    <div className={styles.dateAndLink}>
                        <p>{dateString}</p>
                        <button className={styles.button + ' ' + styles.monospaced}>Details</button>
                    </div>
                    
                </div>
            </div>
            
        )
    }

    return (
        <div key={commit.sha}>
        <div
        className={styles.commitDetails + ' ' + colorClass}
        onClick={() => setExpanded(!isExpanded)}
        key={commit.sha}>
            
            <div className={styles.ciIcon}>
                {ciIcon}
            </div>

            <div className={styles.stats}>
                <span className={styles.deletions}>-{commit.stats.deletions}</span> | <span className={styles.additions}>+{commit.stats.additions}</span>
                
            </div>

            <div className={styles.commitMessage}>
                <span>{commit.message}</span>
            </div>
            

            <div className={styles.link}>
                <button className={styles.button + ' ' + styles.monospaced}>{shaShort}</button>
            </div>
            
            
        </div>
        </div>
        
    )




}

export default CommitDetails