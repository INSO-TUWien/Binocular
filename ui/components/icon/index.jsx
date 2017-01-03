import React from 'react';

import styles from './icon.css';
import icons from '../../icons';

class Icon extends React.Component {

  render() {
    let icon = icons[this.props.name];

    console.log( icons );
    if( !icon ) {
      console.warn( 'Unknown icon:', this.props.name );
      return (<span />);
    }

    return (
      <span
        className={styles.icon}
        style={
          { fontFamily: icon.fontName }
        }>
        {icon.unicode}
      </span>
    );
  }
};

Icon.propTypes = {
  name: React.PropTypes.string.isRequired
};

export default Icon;
