"use strict";

import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Promise from 'bluebird';
import _ from 'lodash';

import TabCombo from '../../../components/TabCombo.js';
import FilePicker from './filePicker/index.js';
import styles from "../styles.scss"
import { graphQl } from '../../../utils';
import { endpointUrl } from '../../../utils';
import { setActiveIssue, setMode, setCurrentBranch, setActiveFiles } from '../sagas'

export default () => {

  const dispatch = useDispatch()

  const onSetIssue = (issueId) => {
    dispatch(setActiveIssue(issueId))
  }

  const onSetMode = (mode) => {
    dispatch(setMode(mode))
  }

  const onSetBranch = (branch) => {
    dispatch(setCurrentBranch(branch))
  }

  const resetActiveFiles = () => {
    dispatch(setActiveFiles([]))
  }

  //global state from redux store
  const expertiseState = useSelector((state) => state.visualizations.codeExpertise.state)
  const currentMode = expertiseState.config.mode
  const currentBranch = expertiseState.config.currentBranch
  const activeIssueId = expertiseState.config.activeIssueId
  
  //local state
  let [branchOptions, setBranchOptions] = useState([])
  let [issueOptions, setIssueOptions] = useState([])

  const [files, setFiles] = useState([])


  //run once on initialization
  useEffect(() => {

    //get all branches for branch-select
    Promise.resolve(
      graphQl.query(
        `
      query{
       branches(sort: "ASC"){
          data{branch,active}
        }
      }
      `,
      {}
      ))
    .then(resp => resp.branches.data)
    .then(branches => branches.sort((a,b) => a.branch.localeCompare(b.branch)))
    .then(branches => {
      const temp = []
      //placeholder option
      temp.push(<option key={-1} value={null}>Select a Branch</option>)
      for(const i in branches) {
        temp.push(<option key={i}>{branches[i].branch}</option>)
      }
      setBranchOptions(temp)
    })


    //get all issues for issue-select
    Promise.resolve(
      graphQl.query(
        `
      query{
       issues(sort: "ASC"){
          data{iid, title}
        }
      }
      `,
      {}
      ))
    .then(resp => resp.issues.data)
    .then(issues => {
      const temp = []
      //placeholder option
      temp.push(<option key={-1} value={null}>Select an Issue</option>)
      for(const i of issues) {
        temp.push(<option key={i.iid} value={i.iid}>{'#' + i.iid + ' ' + i.title}</option>)
      }
      setIssueOptions(temp)
    })


  }, []);



  //update files every time the branch changes
  //also reset selected files
  useEffect(() => {
    if(currentBranch) {

      resetActiveFiles()
      
      //get all files for file-select
      Promise.resolve(
        fetch(endpointUrl('files'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            branch: currentBranch
          })
        }).then((resp) => resp.json()))
      .then(resp => resp.files)
      .then(files => {
        console.log(files)
        setFiles(files)
      })
    }
  }, [currentBranch])
  

  
  



  return (
    <div className={styles.configContainer}>
      <form>

        {/* select branch */}
        <div className="field">
          <div className="control">
            <label className="label">Branch:</label>
            <div className="select">
              <select
                value={currentBranch}
                onChange={e => onSetBranch(e.target.value)}>
                {branchOptions}
              </select>
            </div>
          </div>
        </div>
        
        {/* select if commits related to issues or commits related to files should be visualized */}
        <div className="field">
          <div className="control">
            <label className="label">Mode:</label>
            <TabCombo
              value={currentMode}
              onChange={value => onSetMode(value)}
              options={[
                { label: 'Issues', icon: 'ticket-alt', value: 'issues' },
                { label: 'Modules', icon: 'server', value: 'modules' }
              ]}
            />
          </div>
        </div>
        
        
        {/* Only diplay issue searchbar when 'issues' is selected as mode */}
        {currentMode === 'issues' &&
          <div className="field">
            <div className="control">
              <label className="label">Choose an Issue to visualize:</label>
              <div className="select">
                <select
                  value={activeIssueId}
                  onChange={e => onSetIssue(e.target.value)}>
                  {issueOptions}
                </select>
              </div>
            </div>
          </div>
        }


        {/* Only diplay file-picker when 'modules' is selected as mode */}
        {currentMode === 'modules' &&
          <div className="field">
          <div className="control">
            <label className="label">Choose Files and Modules to visualize:</label>

            <FilePicker fileList={files}/>

          </div>
        </div>
        }

      </form>
    </div>
  )
};
