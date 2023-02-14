'use strict';

import React from 'react';
import styles from './authorMerger.scss';

export default class AuthorMerger extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      palette: props.palette,
      allCommitters: props.committers,
      committers: this.generateCommittersList(props.committers, props.palette),
    };
  }

  generateCommittersList(committers, palette) {
    const committersList = [];
    for (const committer of committers) {
      committersList.push({
        mainCommitter: committer,
        committers: [{ signature: committer, color: palette[committer] }],
        color: palette[committer],
      });
    }
    console.log(committersList);
    return committersList;
  }

  addCommitterToOther(primary, secondary) {
    if (primary !== secondary) {
      let committerList = this.state.committers;
      const committerToAdd = committerList.filter((c) => c.mainCommitter === secondary)[0];

      committerList = committerList
        .filter((c) => c.mainCommitter !== secondary)
        .map((c) => {
          if (c.mainCommitter === primary) {
            for (const cToAdd of committerToAdd.committers) {
              c.committers.push(cToAdd);
            }
          }
          return c;
        });
      this.setState({ committers: committerList });
    }
  }

  render() {
    return (
      <div className={styles.authorMerger}>
        <div className={styles.backgroundBlur} onClick={this.props.close}>
          <div
            className={styles.authorMergerContainer}
            onClick={(event) => {
              event.stopPropagation();
            }}>
            <h1>Drag and drop Author over other to merge them!</h1>
            <button
              className={'button'}
              onClick={() => {
                this.setState({ committers: this.generateCommittersList(this.state.allCommitters, this.state.palette) });
              }}>
              Reset
            </button>
            <hr />
            {this.state.committers.map((committer) => {
              return (
                <div
                  id={committer.mainCommitter}
                  className={styles.committerDragDropContainer}
                  style={{ background: committer.color }}
                  onDrop={(e) => {
                    e.target.classList.remove(styles.authorMergerContainerDragOver);
                    this.addCommitterToOther(e.target.id, e.dataTransfer.getData('Text'));
                  }}
                  onDragOver={(e) => {
                    e.target.classList.add(styles.authorMergerContainerDragOver);
                    e.preventDefault();
                  }}
                  onDragLeave={(e) => {
                    e.target.classList.remove(styles.authorMergerContainerDragOver);
                  }}
                  onDragStart={(e) => {
                    e.dataTransfer.setData('Text', e.target.id);
                  }}>
                  {committer.committers.map((individualCommitter) => {
                    return (
                      <div className={styles.individualCommitter}>
                        <span className={styles.individualCommitterColor} style={{ background: individualCommitter.color }}></span>
                        <span className={styles.individualCommitterText}>{individualCommitter.signature}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}
