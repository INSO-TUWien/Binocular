'use strict';

import { connect } from 'react-redux';
import {
  setResolution,
  setShowIssues,
  setSelectedAuthors,
  setShowCIChart,
  setShowIssueChart,
  setSelectedModules,
  setSelectedLanguages,
  setChartAttribute
} from './sagas';
import TabCombo from '../../components/TabCombo.js';
import styles from './styles.scss';

import CheckboxLegend from '../../components/CheckboxLegend';

const mapStateToProps = state => {
  const languageModuleRiverState = state.visualizations.languageModuleRiver.state;

  return {
    committers: languageModuleRiverState.data.data.committers,
    resolution: languageModuleRiverState.config.chartResolution,
    riverAttribute: languageModuleRiverState.config.chartAttribute,
    showIssues: languageModuleRiverState.config.showIssues,
    attributes: languageModuleRiverState.data.data.attributes,
    languages: languageModuleRiverState.data.data.languages,
    modules: languageModuleRiverState.data.data.modules,
    selectedAuthors: languageModuleRiverState.config.selectedAuthors,
    selectedLanguages: languageModuleRiverState.config.selectedLanguages,
    selectedModules: languageModuleRiverState.config.selectedModules,
    showCIChart: languageModuleRiverState.config.showCIChart,
    showIssueChart: languageModuleRiverState.config.showIssueChart
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return Object.assign(
    {
      onClickResolution: resolution => dispatch(setResolution(resolution)),
      onClickAttribute: resolution => dispatch(setChartAttribute(resolution)),
      onClickIssues: showIssues => dispatch(setShowIssues(showIssues)),
      onClickAuthors: selected => dispatch(setSelectedAuthors(selected)),
      onClickLanguages: selected => dispatch(setSelectedLanguages(selected)),
      onClickModules: selected => dispatch(setSelectedModules(selected)),
      onClickShowCIChart: showCIChart => dispatch(setShowCIChart(showCIChart)),
      onClickShowIssueChart: showIssueChart => dispatch(setShowIssueChart(showIssueChart))
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
            title="Authors:"
            split={true}
            otherCommitters={overflow.authors}
          />
        </div>
        {props.riverAttribute === 'languages'
          ? <div className={styles.field}>
              <CheckboxLegend
                palette={palette.languages}
                onClick={props.onClickLanguages.bind(this)}
                title="Available Languages:"
                explanation={'Number of lines per Language'}
                split={false}
                otherCommitters={overflow.languages}
              />
            </div>
          : props.riverAttribute === 'modules'
            ? <div className={styles.field}>
                <CheckboxLegend
                  palette={palette.modules}
                  onClick={props.onClickLanguages.bind(this)}
                  title="Available Modules:"
                  explanation={'Number of lines per Modules'}
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
