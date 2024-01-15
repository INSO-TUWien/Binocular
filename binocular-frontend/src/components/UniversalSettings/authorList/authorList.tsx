'use strict';

import * as React from 'react';
import styles from './authorList.module.scss';
import loadingAnimation from './loadingAnimaiton.module.scss';
import { Author, Committer, Palette } from '../../../types/authorTypes';

interface Props {
  palette: Palette;
  authorList: Author[];
  otherAuthors: Committer[];
  selectedAuthors: string[];
  selectionChanged: (checkedAuthors: string[]) => void;
}

export default (props: Props) => {
  const [checkedAuthors, setCheckedAuthors] = React.useState(props.selectedAuthors);
  React.useEffect(() => {
    if (props.selectedAuthors.length > 0) {
      setCheckedAuthors(props.selectedAuthors);
    }
  }, [props.selectedAuthors]);

  return props.authorList.length > 0 && props.palette !== undefined ? (
    <div className={styles.authorList}>
      <button
        className={'button'}
        onClick={() => {
          const newCheckedAuthors: string[] = [];
          if (props.authorList.length + props.otherAuthors.length > props.selectedAuthors.length - 1) {
            props.authorList.forEach((author: { mainCommitter: string }) => {
              if (!newCheckedAuthors.includes(author.mainCommitter)) {
                newCheckedAuthors.push(author.mainCommitter);
              }
            });
            if (!newCheckedAuthors.includes('others')) {
              newCheckedAuthors.push('others');
            }
          }
          setCheckedAuthors(newCheckedAuthors);
          props.selectionChanged(newCheckedAuthors);
        }}>
        {props.authorList.length > props.selectedAuthors.length - 1 ? 'Check All' : 'Uncheck All'}
      </button>
      <div className={styles.authorListScrollContainer}>
        <table>
          <tbody>
            {props.authorList.map((author: { mainCommitter: string; color: string; committers: Committer[] }) => {
              return (
                <tr key={author.mainCommitter} className={'checkbox ' + styles.authorRow} style={{ background: author.color }}>
                  <td>
                    <input
                      type={'checkbox'}
                      checked={checkedAuthors.includes(author.mainCommitter)}
                      onChange={(event) => {
                        const newCheckedAuthors = event.target.checked
                          ? [...checkedAuthors, author.mainCommitter]
                          : checkedAuthors.filter((a: React.Key) => a !== author.mainCommitter);
                        setCheckedAuthors(newCheckedAuthors);
                        props.selectionChanged(newCheckedAuthors);
                      }}
                    />
                  </td>
                  <td>
                    {author.committers.map((committer) => {
                      return (
                        <div key={'individual' + committer.signature}>
                          <table className={styles.individualCommitter}>
                            <tbody>
                              <tr>
                                <td className={styles.individualCommitterColor} style={{ background: committer.color }}></td>
                                <td className={styles.individualCommitterText}>{committer.signature}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      );
                    })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {props.otherAuthors.length > 0 ? (
        <div>
          <hr />
          <h2>Other:</h2>
          <table>
            <tbody>
              <tr className={'checkbox ' + styles.authorRow} style={{ background: props.palette['other'] }}>
                <td>
                  <input
                    type={'checkbox'}
                    checked={checkedAuthors.includes('others')}
                    onChange={(event) => {
                      const newCheckedAuthors = event.target.checked
                        ? [...checkedAuthors, 'others']
                        : checkedAuthors.filter((a: string) => a !== 'others');
                      setCheckedAuthors(newCheckedAuthors);
                      props.selectionChanged(newCheckedAuthors);
                    }}
                  />
                </td>
                <td>
                  {props.otherAuthors.map((committer: { signature: string; color: string }) => {
                    return (
                      <div key={'individual' + committer.signature}>
                        <table className={styles.individualCommitter}>
                          <tbody>
                            <tr>
                              <td className={styles.individualCommitterColor} style={{ background: committer.color }}></td>
                              <td className={styles.individualCommitterText}>{committer.signature}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    );
                  })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        ''
      )}
    </div>
  ) : (
    <div>
      <div>Loading Authors</div>
      <div className={loadingAnimation.loading}>
        <div className={loadingAnimation.loading_line_wrapper}>
          <div className={loadingAnimation.loading_line}>
            <div className={loadingAnimation.loading_line_inner + ' ' + loadingAnimation.loading_line_inner__1}></div>
            <div className={loadingAnimation.loading_line_inner + ' ' + loadingAnimation.loading_line_inner__2}></div>
          </div>
        </div>
      </div>
    </div>
  );
};
