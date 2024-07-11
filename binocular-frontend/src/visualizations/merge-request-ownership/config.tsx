'use-strict';

import React from 'react';
import { connect } from 'react-redux';
import TabCombo from '../../components/TabCombo';
import styles from './styles.module.scss';
import { setCategory } from './sagas';

interface Props {
  mergeRequestOwnershipState: any;
  setCategory: (category: any) => void;
}

class ConfigComponent extends React.Component<Props> {
  onClickCategory(category) {
    this.props.setCategory(category);
  }

  render() {
    return (
      <div className={styles.configContainer}>
        <div className={styles.field}>
          <h2>Category</h2>
          <div className="control">
            <TabCombo
              options={[
                { label: 'Assignees', icon: 'bell', value: 'assignees' },
                { label: 'Reviewers', icon: 'pen-to-square', value: 'reviewers' },
              ]}
              value={this.props.mergeRequestOwnershipState.config.category}
              onChange={(value) => this.onClickCategory(value)}
            />
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  mergeRequestOwnershipState: state.visualizations.mergeRequestOwnership.state,
});

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {
    setCategory: (category) => dispatch(setCategory(category)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ConfigComponent);
