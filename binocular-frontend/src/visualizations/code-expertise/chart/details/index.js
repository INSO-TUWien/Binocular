import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import _ from 'lodash';
import styles from '../../styles.module.scss';
import { setDetails } from '../../sagas';
import TabCombo from '../../../../components/TabCombo';
import CommitsDetailsList from './CommitDetailsList';

const Details = ({ devData }) => {
  const dispatch = useDispatch();

  const onSelectDev = (dev) => {
    dispatch(setDetails(dev));
  };

  const openInNewTab = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const formatDate = (d) => {
    const date = new Date(d);
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
  };

  //local state
  const [isExpanded, setExpanded] = useState(false);
  const [devDetails, setDevDetails] = useState(null);
  const [devOptions, setDevOptions] = useState([]);
  const [commitSort, setCommitSort] = useState('date');

  //global state
  const globalData = useSelector((state) => state.visualizations.codeExpertise.state.data.data);
  const issueData = globalData ? (globalData.issue ? globalData.issue.issueData : null) : null;
  const selectedDev = useSelector((state) => state.visualizations.codeExpertise.state.config.details);
  const mode = useSelector((state) => state.visualizations.codeExpertise.state.config.mode);

  useEffect(() => {
    if (!devData) {
      return;
    }

    setDevDetails(null);

    if (selectedDev === null) {
      setExpanded(false);
    } else {
      Object.entries(devData).map((item) => {
        const name = item[0];
        const devData = item[1];

        devData.commitsNum = devData.commits.length;
        devData.goodCommitsNum = devData.commits.filter((c) => c.build === 'success').length;
        devData.badCommitsNum = devData.commits.filter((c) => c.build !== null && c.build !== 'success').length;

        if (name === selectedDev) {
          setDevDetails(devData);
          setExpanded(true);
        }
      });
    }
  }, [selectedDev]);

  useEffect(() => {
    if (!devData) {
      return;
    }
    const devOptions = [];
    //placeholder option
    devOptions.push(
      <option key={-1} value={null}>
        Select a Developer
      </option>,
    );

    Object.entries(devData).map((item, index) => {
      const name = item[0];
      const displayName = name.split('<')[0];
      devOptions.push(
        <option key={index} value={name}>
          {displayName}
        </option>,
      );
    });

    setDevOptions(devOptions);
  }, [devData]);

  return (
    <div className={styles.details}>
      <div className={styles.expandButton} onClick={() => setExpanded(!isExpanded)}>
        {isExpanded && '>'}
        {!isExpanded && '<'}
      </div>

      {isExpanded && (
        <div className={styles.content}>
          {/* select dev */}
          <div className={styles.field}>
            <div className="control">
              <label className="label">Selected Developer:</label>
              <div className="select">
                <select value={selectedDev} onChange={(e) => onSelectDev(e.target.value)}>
                  {devOptions}
                </select>
              </div>
            </div>
          </div>

          {issueData && (
            <div className={styles.field}>
              <label className="label">Issue: {issueData.title}</label>

              <div className={styles.generalDetails}>
                <GeneralDetailsData label="Opened" text={formatDate(issueData.createdAt)} />

                <GeneralDetailsData label="Closed" text={issueData.closedAt ? formatDate(issueData.closedAt) : '/'} />

                <button className={styles.button + ' ' + styles.issueButton} onClick={() => openInNewTab(issueData.webUrl)}>
                  Issue Details
                </button>
              </div>
            </div>
          )}

          {selectedDev !== null && devDetails !== null && (
            <div>
              <div className={styles.field}>
                <label className="label">General Info:</label>

                <div className={styles.generalDetails}>
                  <GeneralDetailsData
                    label="E-Mail"
                    text={selectedDev === 'other' ? '/' : selectedDev.substring(selectedDev.indexOf('<') + 1, selectedDev.length - 1)}
                  />

                  <GeneralDetailsData label="Total Lines Added" text={devDetails.additions} />

                  {mode !== 'issues' && (
                    <GeneralDetailsData
                      label="Total Lines Owned"
                      text={
                        devDetails.linesOwned
                          ? `${devDetails.linesOwned} (${((devDetails.linesOwned / devDetails.additions) * 100).toFixed(
                              2,
                            )}% of added lines)`
                          : '0 (0% of added lines)'
                      }
                    />
                  )}

                  <GeneralDetailsData label="Total Commits" text={devDetails.commits.length} />

                  <GeneralDetailsData
                    label="Good Commits"
                    text={`${devDetails.goodCommitsNum} (${((devDetails.goodCommitsNum / devDetails.commitsNum) * 100).toFixed(
                      2,
                    )}% of commits)`}
                  />

                  <GeneralDetailsData
                    label="Bad Commits"
                    text={`${devDetails.badCommitsNum} (${((devDetails.badCommitsNum / devDetails.commitsNum) * 100).toFixed(
                      2,
                    )}% of commits)`}
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className="label">Commits:</label>

                <TabCombo
                  value={commitSort}
                  onChange={(value) => setCommitSort(value)}
                  options={[
                    { label: 'Date', icon: 'calendar', value: 'date' },
                    { label: 'Add.', icon: 'plus', value: 'additions' },
                    { label: 'Del.', icon: 'minus', value: 'deletions' },
                    { label: 'Good', icon: 'check', value: 'good' },
                    { label: 'Bad', icon: 'times', value: 'bad' },
                  ]}
                />

                <div>
                  <CommitsDetailsList commits={devDetails.commits} sort={commitSort} />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Details;

const GeneralDetailsData = ({ label, text }) => {
  return (
    <div className={styles.generalDetailsContainer}>
      <span>{label}:</span>
      <div className={styles.generalDetailsDots}></div>
      <span>{text}</span>
    </div>
  );
};
