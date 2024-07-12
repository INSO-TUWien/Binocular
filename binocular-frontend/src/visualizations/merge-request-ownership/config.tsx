'use-strict';

import React from 'react';
import { connect } from 'react-redux';
import TabCombo from '../../components/TabCombo';
import styles from './styles.module.scss';
import { onlyShowAuthors, setCategory } from './sagas';

interface Props {
  mergeRequestOwnershipState: any;
  setCategory: (category: any) => void;
  setOnlyShowAuthors: (value: boolean) => void;
  onlyShowAuthors: boolean;
}

class ConfigComponent extends React.Component<Props> {
  onClickCategory(category) {
    this.props.setCategory(category);
  }

  onSetOnlyShowAuthors(value) {
    this.props.setOnlyShowAuthors(value);
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
        <div className={styles.field}>
          <input
            id="onlyShowAuthorsSwitch"
            type="checkbox"
            name="onlyShowAuthorsSwitch"
            className={'switch is-rounded is-outlined is-info'}
            value={this.props.mergeRequestOwnershipState.config.onlyShowAuthors}
            onChange={(e) => this.onSetOnlyShowAuthors(e.target.checked)}
          />
          <label htmlFor="onlyShowAuthorsSwitch">Only Show Authors</label>
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
    setOnlyShowAuthors: (value) => dispatch(onlyShowAuthors(value)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ConfigComponent);
