import React from 'react';
import styles from './tree.css';
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
        <TreeNode node={this.state.tree} props = {this.props}></TreeNode>
      </ul>
    );
  }
}

class TreeNode extends React.PureComponent {
  render() {
    if (this.props.node !== null && this.props.node !== []) {
      this.props.node.sort((a, b) => (a.children > b.children ? 1 : -1)).reverse(); //sort by amount of children (files or subfolders)
      return (
        this.props.node.map(x => {
          if (x.children.length === 0) {
            return <li>{x.name}</li>;
          } else {
            return (
              <div>
                <button>{x.name}</button>
                <ul className={styles.nested}>
                <TreeNode node={x.children} />
                </ul>
              </div>
            );
          }
      })
      );
    }
    return <div>Test</div>;
  }
}
