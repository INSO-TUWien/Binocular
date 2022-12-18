import React from 'react';
import styles from './tree.css';
import Button from 'react-bootstrap/Button';

export default class Tree extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      tree: [],
    };
  }

  componentWillReceiveProps(nextProps, nextContext) {
    this.setState({
      tree: nextProps.files,
    });
  }

  render() {
    return (
      <ul>
        <TreeNode node={this.state.tree} props={this.props}></TreeNode>
      </ul>
    );
  }
}

class TreeNode extends React.PureComponent {
  render() {
    let h = true;
    if (this.props.node !== null && this.props.node !== []) {
      this.props.node.sort((a, b) => (a.children > b.children ? 1 : -1)).reverse(); //sort by amount of children (files or subfolders)
      return (
        this.props.node.map(x => {
          if (x.children.length === 0) {
            if (x.mark !== undefined) {
            if (x.mark === 'Addition') {
                return <li className={styles.addition} key={x.name.toString()}>{x.name}</li>;
              }
              if(x.mark === 'Deletion'){
                return <li className={styles.deletion} key={x.name.toString()}>{x.name}</li>;
              }
              if(x.mark === 'Edit'){
                return <li className={styles.edit} key={x.name.toString()}>{x.name}</li>;
              }
            } else {
            return <li key={x.name.toString()}>{x.name}</li>;
          }

          } else {
            if (x.mark === 'Addition' || x.mark === 'Deletion' || x.mark === 'Edit') {
              return (
                <div key={x.name.toString()}>
                  <Button onClick={event => {
                    const target = event.currentTarget;
                    const panel = target.nextSibling;
                    panel.hidden = !panel.hidden;
                  }
                  }>{x.name}</Button>
                  <ul hidden={false} className={styles.nested}>
                    <TreeNode node={x.children}/>
                  </ul>
                </div>
              );
            }
            else {
              return (
              <div key={x.name.toString()}>
                <Button onClick={event => {
                  const target = event.currentTarget;
                  const panel = target.nextSibling;
                  if (panel.hidden) {
                    panel.hidden = false;
                  } else {
                    panel.hidden = true;
                  }
                }
                }>{x.name}</Button>
                <ul hidden={h} className={styles.nested}>
                  <TreeNode node={x.children}/>
                </ul>
              </div>
            );
          }
          }
      })
      );
    }
  }
}
