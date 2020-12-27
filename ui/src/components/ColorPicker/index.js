'use strict';

import PropTypes from 'prop-types';
import React from 'react';
import { SketchPicker } from 'react-color';
import styles from './styles.scss';

export default class ColorPicker extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      displayColorPicker: this.props.displayColorPicker,
      color: this.props.color,
    };

    this.handleClick = this.handleClick.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  /**
   * Handles a click of the small color icon of the ColorPicker.
   * Inverts the displayColorPicker property of the state and
   * additionally emits the provided setDisplayColorPicker function of the parent if provided.
   * If the ColorPicker is shown, then it will be hidden and vice versa.
   */
  handleClick() {
    this.setState({ displayColorPicker: !this.state.displayColorPicker });
    if (this.props.setDisplayColorPicker) {
      this.props.setDisplayColorPicker(this.state.displayColorPicker);
    }
  }

  /**
   * Handles the close event of the ColorPicker.
   * Sets the displayColorPicker property in the state to false and
   * additionally emits the provided setDisplayColorPicker function of the parent if provided.
   */
  handleClose() {
    this.setState({ displayColorPicker: false });
    if (this.props.setDisplayColorPicker) {
      this.props.setDisplayColorPicker(this.state.displayColorPicker);
    }
  }

  /**
   * Handles color changes of the ColorPicker.
   * Sets the color property in the state of the ColorPicker and
   * additionally emits the provided setColor function of the parent.
   *
   * @param color new color which was selected
   */
  handleChange(color) {
    this.setState({ color: color.hex });
    this.props.setColor(color.hex);
  }

  render() {
    return (
      <div className={styles.container}>
        {/* shows a small square with the current selected color */}
        <div className={styles.swatch} onClick={this.handleClick}>
          <div
            className={styles.color}
            style={{
              background: `${this.state.color}`,
            }}
          />
        </div>
        {/* if the displayColorPicker property in the state is set, */}
        {/* the ColorPicker (SketchPicker) will be shown, otherwise it is hidden*/}
        {this.state.displayColorPicker && (
          <div className={styles.popover}>
            <div className={styles.cover} onClick={this.handleClose} />
            <SketchPicker color={this.state.color} onChange={this.handleChange} />
          </div>
        )}
      </div>
    );
  }
}

ColorPicker.propTypes = {
  displayColorPicker: PropTypes.bool.isRequired,
  color: PropTypes.any.isRequired,
  setColor: PropTypes.func.isRequired,
  setDisplayColorPicker: PropTypes.func,
};
