'use-strict';

import React from 'react';
import * as styles from './styles.module.scss';
import { connect } from 'react-redux';
import TabCombo from '../../components/TabCombo';
import { File, setCategory, setFile, setGrouping, setPath } from './sagas';
import FileBrowser from '../legacy/code-hotspots/components/fileBrowser/fileBrowser';

interface Props {
  codeReviewMetricsState: any;
  setGrouping: (group: any) => void;
  setCategory: (category: any) => void;
  setPath: (path: string) => void;
  setFile: (file: string) => void;
  fileBrowserProps: FileBrowserProps;
}

interface FileBrowserProps {
  files: File[];
}

class ConfigComponent extends React.Component<Props> {
  onClickGrouping(group) {
    this.props.setGrouping(group);
  }

  onClickCategory(category) {
    this.props.setCategory(category);
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
            <FileBrowser
              files={this.props.codeReviewMetricsState.data.data.files}
              props={this.props}
              highlights={this.props.codeReviewMetricsState.config.path}
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
    onSetPath: (path) => dispatch(setPath(path)),
    onSetFile: (file) => dispatch(setFile(file)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ConfigComponent);
