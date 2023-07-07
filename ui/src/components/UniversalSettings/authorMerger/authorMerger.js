'use strict';

import React from 'react';
import styles from './authorMerger.scss';

export default class AuthorMerger extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      palette: props.palette,
      allCommitters: props.committers,
      committers: props.mergedAuthorList,
      selectedAuthors: props.selectedAuthors,
      other: props.other,
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
    return committersList;
  }

  addCommitterToCommitter(primary, secondary) {
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
      let selectedAuthors = this.state.selectedAuthors;
      if (selectedAuthors.includes(secondary)) {
        selectedAuthors = selectedAuthors.filter((sA) => sA !== secondary);
      }
      this.setState({ committers: committerList, selectedAuthors: selectedAuthors });
    }
  }

  addCommitterToOther(committer) {
    const other = this.state.other;
    let committerList = this.state.committers;
    const committerToAdd = committerList.filter((c) => c.mainCommitter === committer)[0];
    committerList = committerList.filter((c) => c.mainCommitter !== committer);
    for (const cToAdd of committerToAdd.committers) {
      other.push(cToAdd);
    }
    let selectedAuthors = this.state.selectedAuthors;
    if (selectedAuthors.includes(committer)) {
      selectedAuthors = selectedAuthors.filter((sA) => sA !== committer);
    }
    this.setState({ committers: committerList, other: other, selectedAuthors: selectedAuthors });
  }

  removeCommitterFromOther(committer) {
    let other = this.state.other;
    const committerList = this.state.committers;
    const committerToRemove = other.filter((c) => c.signature === committer)[0];
    committerList.push({
      mainCommitter: committerToRemove.signature,
      committers: [{ signature: committerToRemove.signature, color: this.state.palette[committer] }],
      color: this.state.palette[committer],
    });
    other = other.filter((c) => c.signature !== committerToRemove.signature);
    this.setState({ committers: committerList, other: other });
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
                this.setState({ committers: this.generateCommittersList(this.state.allCommitters, this.state.palette), other: [] });
              }}>
              Reset
            </button>
            <hr />
            {this.state.committers.map((committer) => {
              return (
                <div key={'authorMerger' + committer.mainCommitter} className={styles.committerRow}>
                  <div
                    draggable={'true'}
                    id={committer.mainCommitter}
                    className={styles.committerContainer + ' ' + styles.dragAndDrop}
                    style={{ background: committer.color }}
                    onDrop={(e) => {
                      e.target.classList.remove(styles.authorMergerContainerDragOver);
                      this.addCommitterToCommitter(e.target.id, e.dataTransfer.getData('Text'));
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
                        <div key={'authorMergerIndividual' + individualCommitter.signature} className={styles.individualCommitter}>
                          <span className={styles.individualCommitterColor} style={{ background: individualCommitter.color }}></span>
                          <span className={styles.individualCommitterText}>{individualCommitter.signature}</span>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    className={'button ' + styles.addToOtherButton}
                    style={{ borderColor: this.state.palette['other'] }}
                    onClick={(e) => {
                      this.addCommitterToOther(committer.mainCommitter);
                    }}>
                    Add to Other
                  </button>
                </div>
              );
            })}
            <hr />
            <h2>Other:</h2>
            <div className={styles.committerRow}>
              <div
                id={'other'}
                className={styles.committerContainer + ' ' + styles.otherContainer}
                style={{ background: this.state.palette['other'] }}>
                {this.state.other.map((individualCommitter) => {
                  return (
                    <div key={'authorMergerIndividual' + individualCommitter.signature} className={styles.individualCommitter}>
                      <span className={styles.individualCommitterColor} style={{ background: individualCommitter.color }}></span>
                      <span className={styles.individualCommitterText}>{individualCommitter.signature}</span>
                      <button
                        className={'button ' + styles.removeButton}
                        onClick={(e) => {
                          this.removeCommitterFromOther(individualCommitter.signature);
                        }}>
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
            <hr />
            <button
              className={'button'}
              onClick={() => {
                this.props.close();
              }}>
              Close
            </button>
            <button
              className={'button ' + styles.applyButton}
              onClick={() => {
                this.props.apply(this.state.committers, this.state.other, this.state.selectedAuthors);
              }}>
              Apply
            </button>
          </div>
        </div>
      </div>
    );
  }
}
