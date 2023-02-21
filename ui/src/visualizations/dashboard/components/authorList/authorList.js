'use strict';

import React from 'react';
import styles from './authorList.scss';
import loadingAnimation from './loadingAnimaiton.scss';

export default class AuthorList extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      checkedAuthors: [],
    };
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (nextProps.selectedAuthors.length > 0) {
      this.setState({ checkedAuthors: nextProps.selectedAuthors });
    }
  }

  render() {
    return this.props.authorList.length > 0 && this.props.palette !== undefined ? (
      <div className={styles.authorList}>
        <button
          className={'button'}
          onClick={() => {
            const checkedAuthors = this.state.checkedAuthors;
            this.props.authorList.forEach((author) => {
              if (!checkedAuthors.includes(author.mainCommitter)) {
                checkedAuthors.push(author.mainCommitter);
              }
            });
            if (!checkedAuthors.includes('others')) {
              checkedAuthors.push('others');
            }
            this.setState({ checkedAuthors: checkedAuthors });
            this.props.selectionChanged(checkedAuthors);
            this.forceUpdate();
          }}>
          Check All
        </button>
        <table>
          <tbody>
            {this.props.authorList.map((author) => {
              return (
                <tr key={author.mainCommitter} className={'checkbox ' + styles.authorRow} style={{ background: author.color }}>
                  <td>
                    <input
                      type={'checkbox'}
                      checked={this.state.checkedAuthors.includes(author.mainCommitter)}
                      onChange={(event) => {
                        let checkedAuthors = this.state.checkedAuthors;
                        if (event.target.checked) {
                          checkedAuthors.push(author.mainCommitter);
                        } else {
                          checkedAuthors = checkedAuthors.filter((a) => a !== author.mainCommitter);
                        }
                        this.setState({ checkedAuthors: checkedAuthors });
                        this.props.selectionChanged(checkedAuthors);
                        this.forceUpdate();
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
        {this.props.otherAuthors.length > 0 ? (
          <div>
            <hr />
            <h2>Other:</h2>
            <table>
              <tbody>
                <tr className={'checkbox ' + styles.authorRow} style={{ background: this.props.palette['other'] }}>
                  <td>
                    <input
                      type={'checkbox'}
                      checked={this.state.checkedAuthors.includes('others')}
                      onChange={(event) => {
                        let checkedAuthors = this.state.checkedAuthors;
                        if (event.target.checked) {
                          checkedAuthors.push('others');
                        } else {
                          checkedAuthors = checkedAuthors.filter((a) => a !== 'others');
                        }
                        this.setState({ checkedAuthors: checkedAuthors });
                        this.props.selectionChanged(checkedAuthors);
                        this.forceUpdate();
                      }}
                    />
                  </td>
                  <td>
                    {this.props.otherAuthors.map((committer) => {
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
  }
}
