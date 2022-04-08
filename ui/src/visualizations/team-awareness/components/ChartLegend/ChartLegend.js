import React from 'react';
import styles from './ChartLegend.scss';

const DEFAULT_SQUARE_SIZE = 20;
const DEFAULT_COLOR = '#000000';

export default class ChartLegend extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showContent: false
    };
  }

  // eslint-disable-next-line no-unused-vars
  shouldComponentUpdate(nextProps, nextState, nextContext) {
    const contentVisibilityChanged =
      this.state.showContent || this.state.contentActive !== nextState.showContent || nextState.contentActive;
    const propsChanged = this.props.content !== nextProps.content || this.props.colors !== nextProps.colors;
    return contentVisibilityChanged || propsChanged;
  }

  render() {
    console.log(this.props);
    console.log(this.state);

    const colorOverview = this.createColorsOverview();
    console.log(colorOverview);
    return (
      <g transform={`translate(${this.props.x}, ${this.props.y})`} pointsAtZ={100} className={styles.legend}>
        <g
          onMouseEnter={() => this.setState({ showContent: true, contentActive: false })}
          onMouseLeave={() => this.setState({ showContent: false })}>
          {colorOverview}
          <text x={25} y={1} className={styles.legendTitle}>
            {this.props.title}
          </text>
        </g>
        {(this.state.showContent || this.state.contentActive || true) && this.createContent()}
      </g>
    );
  }

  createColorsOverview() {
    if (
      !this.props.colors ||
      !this.props.content ||
      this.props.content.length === 0 ||
      this.props.content.length !== this.props.colors.size
    ) {
      console.warn('Could not draw legend overview square with given values');
      return <rect key={0} y={-15} height={DEFAULT_SQUARE_SIZE} fill={DEFAULT_COLOR} width={DEFAULT_SQUARE_SIZE} x={0} />;
    }

    const increment = DEFAULT_SQUARE_SIZE / this.props.content.length;
    return this.props.content.map((value, index) => {
      return (
        <rect
          key={index}
          y={-15}
          height={DEFAULT_SQUARE_SIZE}
          width={increment}
          x={increment * index}
          fill={this.props.colors.get(value.id) || DEFAULT_COLOR}
        />
      );
    });
  }

  createContent() {
    return (
      <g
        onMouseEnter={() => this.setState({ contentActive: true, showContent: false })}
        onMouseLeave={() => this.setState({ contentActive: false })}>
        <rect y={5} className={styles.legendContentWrapper} fill={'#0ff000'} />
        {this.createAuthorEntry()}
      </g>
    );
  }

  createAuthorEntry() {
    return [
      <g>
        <rect height={17} width={17} fill={'#0000ff'} x={20} y={5} />
        <text x={40} y={20}>
          Entry laskd poask opakd saok poaskd opaskd opaskd opask dpoasdk{' '}
        </text>
      </g>
    ];
  }
}
