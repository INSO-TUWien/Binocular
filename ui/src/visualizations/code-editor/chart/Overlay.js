import React from 'react';
import styles from '../styles.scss';
import OverlayPlotter from './OverlayPlotter';

export default class Overlay extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [12, 5, 6, 6, 9, 10],
      width: '100%',
      splittedWidth: ['1.5%', '98.5%'],
      lineHeight: ['0.2em'],
      linePos: ['0.8em'],
      height: '2em',
      id: 'overlay',
      renderRows: false,
      codeLines: [],
      selectedPlotOptions: []
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data.codeLines) {
      this.state.codeLines = nextProps.data.codeLines;
      this.state.selectedPlotOptions = nextProps.data.selectedPlotOptions;
      this.state.renderRows = true;
    } else {
      this.state.renderRows = false;
    }
  }

  render() {
    if (this.state.renderRows) {
      return (
        <div className={styles.codeOverlay} id={this.state.id}>
          {this.createRows(this.state.codeLines.length)}
        </div>
      );
    }
    return null;
  }

  createRows(rowCount) {
    const rows = [];
    for (let i = 0; i < rowCount; i++) {
      const id = 'overlayItem_' + i;
      rows.push(
        <div key={id} id={id} className={styles.codeOverlayItem}>
          <OverlayPlotter
            id={id}
            codeLine={this.state.codeLines[i]}
            overlayOptions={this.state.selectedPlotOptions}
            width={this.state.width}
            splittedWidth={this.state.splittedWidth}
            lineHeight={this.state.lineHeight}
            height={this.state.height}
          />
        </div>
      );
    }
    return rows;
  }
}
