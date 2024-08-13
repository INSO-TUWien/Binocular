'use-strict';

import React from 'react';
import * as styles from './styles.module.scss';
import { connect, useDispatch } from 'react-redux';
import TabCombo from '../../components/TabCombo';
import { setActiveFiles, setCategory, setGrouping } from './sagas';
import Filepicker from '../../components/Filepicker';

interface Props {
  codeReviewMetricsState: any;
  setGrouping: (group: any) => void;
  setCategory: (category: any) => void;
  setActiveFiles: (files: any) => void;
}

class ConfigComponent extends React.Component<Props> {
  onClickGrouping(group) {
    this.props.setGrouping(group);
  }

  onClickCategory(category) {
    this.props.setCategory(category);
  }

  onSetActiveFiles(files) {
    this.props.setActiveFiles(files);
  }

  render() {
    return (
      <div className={styles.configContainer}>
        <div className="field">
          <h2>Grouping</h2>
          <div className="control">
            <TabCombo
              options={[
                { label: 'Users', icon: 'user', value: 'user' },
                { label: 'Files', icon: 'file', value: 'file' },
              ]}
              value={this.props.codeReviewMetricsState.config.grouping}
              onChange={(value) => this.onClickGrouping(value)}
            />
          </div>
        </div>
        {this.props.codeReviewMetricsState.config.grouping === 'user' && (
          <div className="field">
            <h2>Category</h2>
            <TabCombo
              options={[
                { label: 'Comments', icon: '', value: 'comment' },
                { label: 'Reviews', icon: '', value: 'review' },
              ]}
              value={this.props.codeReviewMetricsState.config.category}
              onChange={(value) => this.onClickCategory(value)}
            />
          </div>
        )}
        {this.props.codeReviewMetricsState.config.grouping === 'file' && (
          <div className="field">
            <Filepicker
              fileList={this.props.codeReviewMetricsState.data.data.fileList}
              globalActiveFiles={this.props.codeReviewMetricsState.config.globalActiveFiles}
              setActiveFiles={(files) => this.onSetActiveFiles(files)}
            />
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  codeReviewMetricsState: state.visualizations.codeReviewMetrics.state,
});

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {
    setGrouping: (group) => dispatch(setGrouping(group)),
    setCategory: (category) => dispatch(setCategory(category)),
    setActiveFiles: (files) => dispatch(setActiveFiles(files)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ConfigComponent);
