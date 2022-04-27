import React from 'react';
import styles from './FileSelection.scss';
import _ from 'lodash';
import { checkAllChildrenSelected } from '../../sagas/fileTreeOperations';

export default class FileSelection extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { onSetFilteredFile, onSetFileFilterMode, files } = this.props;

    return (
      <div>
        <label className="label">Files & Modules</label>
        <button className={styles.modeButton} onClick={() => onSetFileFilterMode('EXCLUDE')}>
          All
        </button>
        <button className={styles.modeButton} onClick={() => onSetFileFilterMode('INCLUDE')}>
          Clear
        </button>
        <div className={styles.fileSelection}>
          {_.map(files, (file, i) => <FileTreeNode level={0} key={`n_${i}`} node={file} onSetFilteredFile={f => onSetFilteredFile(f)} />)}
        </div>
      </div>
    );
  }
}

class FileTreeNode extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false
    };
  }

  render() {
    const { node, level, onSetFilteredFile } = this.props;
    const hasChildren = node.children && node.children.length > 0;
    const folderIcon = this.state.expanded ? 'fa-folder-open' : 'fa-folder';

    return (
      ((node.type === 'folder' && hasChildren) || node.type === 'file') &&
      <div className={level === 0 ? styles.rootLevel : styles.subLevel}>
        <button className={`${styles.treeNode} ${hasChildren ? styles.folderTreeNode : styles.fileTreeNode}`}>
          <div className={styles.nodeHeader}>
            <label className="checkbox">
              <input
                className="checkbox"
                type="checkbox"
                checked={checkAllChildrenSelected(node)}
                onChange={event => {
                  console.log(event.target.checked);
                  onSetFilteredFile({
                    node: node,
                    selected: event.target.checked
                  });
                }}
              />
            </label>
            {hasChildren
              ? <FolderContent
                  icon={folderIcon}
                  name={node.name}
                  expanded={this.state.expanded}
                  onClick={() => this.setState({ expanded: !this.state.expanded })}
                />
              : <FileContent name={node.name} />}
          </div>
        </button>
        {hasChildren &&
          this.state.expanded &&
          <div className="nodeChildren">
            {_.map(node.children, (child, i) =>
              <FileTreeNode key={`n_${i}`} onSetFilteredFile={f => onSetFilteredFile(f)} level={level + 1} node={child} />
            )}
          </div>}
      </div>
    );
  }
}

const FolderContent = props => {
  return (
    <div className={styles.nodeHeaderContent} onClick={() => props.onClick()}>
      <span className={`fa ${props.icon} ${styles.nodeIcon} `} />
      {props.name}
      <span className={`fa ${props.expanded ? 'fa-caret-up' : 'fa-caret-down'} ${styles.folderCaret}`} />
    </div>
  );
};

const FileContent = props => {
  return (
    <div className={styles.nodeHeaderContent}>
      <span className={`fa fa-file ${styles.nodeIcon} `} />
      {props.name}
    </div>
  );
};
