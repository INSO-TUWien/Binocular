import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux'
import styles from '../../styles.scss'
import { setDetails } from '../../sagas'
import CommitsDetailsList from "./CommitDetailsList";

const Details = () => {

    const dispatch = useDispatch()

    const onSelectDev = (dev) => {
        dispatch(setDetails(dev))
    }

    //local state
    const [isExpanded, setExpanded] = useState(false)
    const [devDetails, setDevDetails] = useState(null)
    const [devOptions, setDevOptions] = useState([])

    //global state
    const allDevData = useSelector((state) => state.visualizations.codeExpertise.state.data.data.devData)
    const selectedDev = useSelector((state) => state.visualizations.codeExpertise.state.config.details)

    useEffect(() => {
        setDevDetails(null)

        if(selectedDev == null) {
            setExpanded(false)
            
        } else {
            Object.entries(allDevData).map(item => {
                const name = item[0]
                const devData = item[1]
                
                if(name == selectedDev) {
                    setDevDetails(devData)
                    setExpanded(true)
                }
            })
        }
    }, [selectedDev, allDevData])

    useEffect(() => {
        const devOptions = []
        //placeholder option
        devOptions.push(<option key={-1} value={null}>Select a Developer</option>)

        Object.entries(allDevData).map((item, index) => {
            const name = item[0]
            const displayName = name.split('<')[0]
            devOptions.push(<option key={index} value={name}>{displayName}</option>)
        })

        setDevOptions(devOptions)
    }, [allDevData])

    return(
        <div className={styles.details}>
            <div className={styles.expandButton} onClick={() => setExpanded(!isExpanded)}>
                {isExpanded && '>'}
                {!isExpanded && '<'}
            </div>

            {isExpanded && selectedDev !== null && devDetails !== null &&

                <div className={styles.content}>

                    {/* select branch */}
                    <div className={styles.field}>
                        <div className="control">
                        <label className="label">Selected Developer:</label>
                        <div className="select">
                            <select
                            value={selectedDev}
                            onChange={e => onSelectDev(e.target.value)}>
                            {devOptions}
                            </select>
                        </div>
                        </div>
                    </div>

                    <div className={styles.field}>
                        <label className="label">General Info:</label>

                        <div className={styles.generalDetails}>

                            <GeneralDetailsData
                            label='E-Mail'
                            text={selectedDev.substring((selectedDev.indexOf('<')+1), (selectedDev.length-1))}/>

                            <GeneralDetailsData
                            label='Total Additions'
                            text={devDetails.additions}/>

                            <GeneralDetailsData
                            label='Total Commits'
                            text={devDetails.commits.length}/>

                            <GeneralDetailsData
                            label='Good Commits'
                            text={devDetails.commits.filter(c => c.build == 'success').length}/>

                            <GeneralDetailsData
                            label='Bad Commits'
                            text={devDetails.commits.filter(c => c.build != null && c.build != 'success').length}/>
                        </div>
                    </div>


                    <div className={styles.field}>
                        <label className="label">Commits:</label>

                        <div>
                            <CommitsDetailsList commits={devDetails.commits.sort((a,b) => (new Date(b.date)) - (new Date(a.date)))}/>
                        </div>
                        
                    </div>

                </div>

            }

        </div>
    )
}

export default Details


const GeneralDetailsData = ({ label, text }) => {

    return (
        <div className={styles.generalDetailsContainer}>
            <span className={styles.generalDetailsLabel}>{label}:</span>
            <div className={styles.generalDetailsDots}></div>
            <span>{text}</span>
        </div>
    )

    return (
        <div>
            <label>{label}:</label>
            <p>{text}</p>
        </div>
    )
}