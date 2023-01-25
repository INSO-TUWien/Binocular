'use strict';

import { connect } from 'react-redux';
// eslint-disable-next-line no-unused-vars
import React from 'react';
import {
  setResolution,
  setSelectedAuthors,
  setSelectedModules,
  setSelectedLanguages,
  setChartAttribute,
  setHighlightedIssue
} from './sagas';
import TabCombo from '../../../components/TabCombo.js';
import styles from './styles.scss';

import CheckboxLegend from '../../../components/CheckboxLegend';
import SearchBox from '../../../components/SearchBox';
import Promise from 'bluebird';
import { graphQl } from '../../../utils';

const mapStateToProps = state => {
  const languageModuleRiverState = state.visualizations.languageModuleRiver.state;

  return {
    committers: languageModuleRiverState.data.data.committers,
    resolution: languageModuleRiverState.config.chartResolution,
    riverAttribute: languageModuleRiverState.config.chartAttribute,
    attributes: languageModuleRiverState.data.data.attributes,
    languages: languageModuleRiverState.data.data.languages,
    modules: languageModuleRiverState.data.data.modules,
    selectedAuthors: languageModuleRiverState.config.selectedAuthors,
    selectedLanguages: languageModuleRiverState.config.selectedLanguages,
    selectedModules: languageModuleRiverState.config.selectedModules,
    highlightedIssue: languageModuleRiverState.config.highlightedIssue
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return Object.assign(
    {
      onClickResolution: resolution => dispatch(setResolution(resolution)),
      onSetHighlightedIssue: issue => dispatch(setHighlightedIssue(issue)),
      onClickAttribute: resolution => dispatch(setChartAttribute(resolution)),
      onClickAuthors: selected => dispatch(setSelectedAuthors(selected)),
      onClickLanguages: selected => dispatch(setSelectedLanguages(selected)),
      onClickModules: selected => dispatch(setSelectedModules(selected))
    },
    ownProps
  );
};

const LangModRiverConfigComponent = props => {
  const attributeKeys = Object.keys(props.attributes || {}).filter(key => key !== 'offset');
  const palette = attributeKeys.reduce(
    (attributes, key) =>
      Object.assign(attributes, {
        [key]: props.attributes[key].colors.reduce((colors, attribute) => Object.assign(colors, { [attribute.key]: attribute.color }), {})
      }),
    {}
  );

  const overflow = attributeKeys.reduce(
    (attributes, key) =>
      Object.assign(attributes, {
        [key]: props.attributes[key].overflow || 0
      }),
    {}
  );

  return (
    <div className={styles.configContainer}>
      <form className={styles.form}>
        <div className={styles.field}>
          <div className="control">
            <label className="label">General Chart Settings</label>
            <TabCombo
              value={props.resolution}
              options={[
                { label: 'Years', icon: 'calendar-plus', value: 'years' },
                { label: 'Months', icon: 'calendar', value: 'months' },
                { label: 'Weeks', icon: 'calendar-week', value: 'weeks' },
                { label: 'Days', icon: 'calendar-day', value: 'days' }
              ]}
              onChange={value => props.onClickResolution(value)}
            />
          </div>
        </div>
        <div className="field">
          <SearchBox
            placeholder="Highlight issue..."
            renderOption={i => `#${i.iid} ${i.title}`}
            search={text => {
              return Promise.resolve(
                graphQl.query(
                  `
                  query($q: String) {
                    issues(q: $q, sort: "DESC") {
                      data { iid title createdAt closedAt webUrl }
                    }
                  }`,
                  { q: text }
                )
              )
                .then(resp => resp.issues.data)
                .map(i => {
                  i.createdAt = new Date(i.createdAt);
                  i.closedAt = i.closedAt && new Date(i.closedAt);
                  return i;
                });
            }}
            value={props.highlightedIssue}
            onChange={issue => props.onSetHighlightedIssue(issue)}
          />
        </div>
        <div className={styles.field}>
          <label className="label">River Attribute Settings</label>
          <TabCombo
            value={props.riverAttribute}
            options={[
              { label: 'Languages', icon: 'file-code', value: 'languages' },
              { label: 'Modules', icon: 'folder-open', value: 'modules' }
            ]}
            onChange={value => props.onClickAttribute(value)}
          />
        </div>
        <div className={styles.field}>
          <label className="label">Changes</label>
          <CheckboxLegend
            palette={palette.authors}
            onClick={props.onClickAuthors.bind(this)}
            title={`Authors: [${(props.committers || []).length}]`}
            split={true}
            otherCommitters={overflow.authors}
          />
        </div>
        {props.riverAttribute === 'languages'
          ? <div className={styles.field}>
              <CheckboxLegend
                palette={palette.languages}
                onClick={props.onClickLanguages.bind(this)}
                title={`Available Languages: [${(props.languages || []).length}]`}
                explanation={'Number of lines per Language'}
                split={false}
                otherCommitters={overflow.languages}
              />
            </div>
          : props.riverAttribute === 'modules'
            ? <div className={styles.field}>
                <CheckboxLegend
                  palette={palette.modules}
                  onClick={props.onClickModules.bind(this)}
                  title={`Available Modules: [${(props.modules || []).length}]`}
                  explanation={'Number of lines per Module'}
                  split={false}
                  otherCommitters={overflow.modules}
                />
              </div>
            : null}
      </form>
    </div>
  );
};

const LangModRiverConfig = connect(mapStateToProps, mapDispatchToProps)(LangModRiverConfigComponent);

export default LangModRiverConfig;
