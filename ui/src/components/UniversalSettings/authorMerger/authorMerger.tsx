'use strict';

import * as React from 'react';
import styles from './authorMerger.module.scss';
import { Author, Committer, Palette } from '../../../types/authorTypes';

interface Props {
  apply: (mergedAuthorList: Author[], otherAuthors: Committer[], selectedAuthors: string[]) => void;
  close: () => void;
  committers: string[];
  mergedAuthorList: Author[];
  other: Committer[];
  palette: Palette;
  selectedAuthors: string[];
}
interface CommiterList {
  mainCommitter: string;
  committers: Array<{ signature: string; color: string }>;
  color: string;
}

export default (props: Props) => {
  const [committers, setCommitters] = React.useState(props.mergedAuthorList);
  const [selectedAuthors, setSelectedAuthors] = React.useState(props.selectedAuthors);
  const [other, setOther] = React.useState(props.other);

  const generateCommitterList = () => {
    const newCommitterList: Array<CommiterList> = [];
    for (const committer of props.committers) {
      newCommitterList.push({
        mainCommitter: committer,
        committers: [{ signature: committer, color: props.palette[committer] }],
        color: props.palette[committer],
      });
    }
    return newCommitterList;
  };

  const addCommitterToCommitter = (primary: string, secondary: string) => {
    if (primary !== secondary) {
      let newCommitters = [...committers];
      const committerToAdd = newCommitters.filter((c) => c.mainCommitter === secondary)[0];

      newCommitters = newCommitters
        .filter((c) => c.mainCommitter !== secondary)
        .map((c) => {
          if (c.mainCommitter === primary) {
            for (const cToAdd of committerToAdd.committers) {
              c.committers.push(cToAdd);
            }
          }
          return c;
        });
      let newSelectedAuthors = [...selectedAuthors];
      if (newSelectedAuthors.includes(secondary)) {
        newSelectedAuthors = newSelectedAuthors.filter((sA) => sA !== secondary);
      }
      setCommitters(newCommitters);
      setSelectedAuthors(newSelectedAuthors);
    }
  };

  const addCommitterToOther = (committer: string) => {
    const newOther = [...other];
    let newCommitters = committers;
    const committerToAdd = newCommitters.filter((c: Author) => c.mainCommitter === committer)[0];
    newCommitters = newCommitters.filter((c: Author) => c.mainCommitter !== committer);
    for (const cToAdd of committerToAdd.committers) {
      newOther.push(cToAdd);
    }
    let newSelectedAuthors = selectedAuthors;
    if (newSelectedAuthors.includes(committer)) {
      newSelectedAuthors = newSelectedAuthors.filter((sA: string) => sA !== committer);
    }
    setCommitters(newCommitters);
    setOther(newOther);
    setSelectedAuthors(newSelectedAuthors);
  };

  const removeCommitterFromOther = (committer: string) => {
    let newOther = [...other];
    const newCommitters = [...committers];
    const committerToRemove = other.filter((c: Committer) => c.signature === committer)[0];
    newCommitters.push({
      mainCommitter: committerToRemove.signature,
      committers: [{ signature: committerToRemove.signature, color: props.palette[committer] }],
      color: props.palette[committer],
    });
    newOther = newOther.filter((c: Committer) => c.signature !== committerToRemove.signature);
    setCommitters(newCommitters);
    setOther(newOther);
  };

  return (
    <div className={styles.authorMerger}>
      <div className={styles.backgroundBlur} onClick={props.close}>
        <div
          className={styles.authorMergerContainer}
          onClick={(event) => {
            event.stopPropagation();
          }}>
          <div className={styles.authorMergerScroll}>
            <h1>Drag and drop Author over other to merge them!</h1>
            <button
              className={'button'}
              onClick={() => {
                setCommitters(generateCommitterList());
                setOther([]);
              }}>
              Reset
            </button>
            <hr />
            {committers.map((committer: Author) => {
              return (
                <div key={'authorMerger' + committer.mainCommitter} className={styles.committerRow}>
                  <div
                    draggable={'true'}
                    id={committer.mainCommitter}
                    className={styles.committerContainer + ' ' + styles.dragAndDrop}
                    style={{ background: committer.color }}
                    onDrop={(e: any) => {
                      e.target.classList.remove(styles.authorMergerContainerDragOver);
                      addCommitterToCommitter(e.target.id, e.dataTransfer.getData('Text'));
                    }}
                    onDragOver={(e: any) => {
                      e.target.classList.add(styles.authorMergerContainerDragOver);
                      e.preventDefault();
                    }}
                    onDragLeave={(e: any) => {
                      e.target.classList.remove(styles.authorMergerContainerDragOver);
                    }}
                    onDragStart={(e: any) => {
                      e.dataTransfer.setData('Text', e.target.id);
                    }}>
                    {committer.committers.map((individualCommitter: Committer) => {
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
                    style={{ borderColor: props.palette['other'] }}
                    onClick={() => {
                      addCommitterToOther(committer.mainCommitter);
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
                style={{ background: props.palette['other'] }}>
                {other.map((individualCommitter: Committer) => {
                  return (
                    <div key={'authorMergerIndividual' + individualCommitter.signature} className={styles.individualCommitter}>
                      <span className={styles.individualCommitterColor} style={{ background: individualCommitter.color }}></span>
                      <span className={styles.individualCommitterText}>{individualCommitter.signature}</span>
                      <button
                        className={'button ' + styles.removeButton}
                        onClick={() => {
                          removeCommitterFromOther(individualCommitter.signature);
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
                props.close();
              }}>
              Close
            </button>
            <button
              className={'button ' + styles.accentButton}
              onClick={() => {
                props.apply(committers, other, selectedAuthors);
              }}>
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
