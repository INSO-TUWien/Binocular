import React from 'react';
import styles from '../../styles.module.scss';
import visualizationSelectorStyles from './visualizationSelector.module.scss';

export default class VisualizationSelector extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const { changeMode } = this.props;
    return (
      <span>
        <span>
          <button
            id={'CpVButton'}
            className={'button ' + styles.mg1 + ' ' + styles.button + ' ' + visualizationSelectorStyles.selected}
            onClick={() => {
              changeMode(0);
              document.getElementById('CpVButton').classList.add(visualizationSelectorStyles.selected);
              document.getElementById('CpDButton').classList.remove(visualizationSelectorStyles.selected);
              document.getElementById('CpIButton').classList.remove(visualizationSelectorStyles.selected);
            }}>
            Changes/Version
          </button>
        </span>
        <span>
          <button
            id={'CpDButton'}
            className={'button ' + styles.mg1 + ' ' + styles.button}
            onClick={() => {
              changeMode(1);
              document.getElementById('CpVButton').classList.remove(visualizationSelectorStyles.selected);
              document.getElementById('CpDButton').classList.add(visualizationSelectorStyles.selected);
              document.getElementById('CpIButton').classList.remove(visualizationSelectorStyles.selected);
            }}>
            Changes/Developer
          </button>
        </span>
        <span>
          <button
            id={'CpIButton'}
            className={'button ' + styles.mg1 + ' ' + styles.button}
            onClick={() => {
              changeMode(2);
              document.getElementById('CpVButton').classList.remove(visualizationSelectorStyles.selected);
              document.getElementById('CpDButton').classList.remove(visualizationSelectorStyles.selected);
              document.getElementById('CpIButton').classList.add(visualizationSelectorStyles.selected);
            }}>
            Changes/Issue
          </button>
        </span>
      </span>
    );
  }
}
