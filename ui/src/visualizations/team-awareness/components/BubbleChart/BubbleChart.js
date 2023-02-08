import React from 'react';
import _ from 'lodash';
import styles from './BubbleChart.scss';
import * as d3 from 'd3';
import Legend from '../../../../components/Legend';

export default class BubbleChart extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      componentMounted: false,
      content: this.props.content,
      width: 0,
      height: 0,
    };
    window.addEventListener('resize', () => this.setState({ width: window.innerWidth, height: window.innerHeight }));
    console.log(this.state);
  }

  render() {
    const { activeLegend, content } = this.state;
    const legend = activeLegend ? activeLegend : this.constructLegendsFromContent();

    return (
      <div className={styles.chartArea}>
        <svg className={styles.chartDrawingArea} ref={(svg) => (this.svgRef = svg)}>
          <g>
            {this.generateBubbles()}
            {content && content.length > 0 && <Legend x={10} y={50} categories={legend} />}
          </g>
        </svg>
        <div className={styles.chartTooltip} ref={(div) => (this.tooltipRef = div)} />
      </div>
    );
  }

  constructLegendsFromContent() {
    return [
      {
        name: 'Authors',
        subLegend: _.map(this.state.content, (c) => {
          return {
            name: c.signature,
            style: {
              fill: this.props.colors.get(c.id),
            },
          };
        }),
      },
    ];
  }

  constructActiveLegend(stakeholder) {
    const legend = [
      {
        name: stakeholder.signature + ' Activity: ' + stakeholder.activity,
        style: { fill: this.props.colors.get(stakeholder.id) },
      },
    ];

    this.setState({ activeLegend: legend });
  }

  componentDidMount() {
    this.setState({ componentMounted: true });
  }

  componentWillUnmount() {
    this.setState({ componentMounted: false });
  }
  // eslint-disable-next-line no-unused-vars
  componentDidUpdate(prevProps, prevState, snapshot) {
    const { componentMounted, content } = this.state;
    if (componentMounted && content !== this.props.content) {
      this.setState({
        content: this.props.content,
      });
    }
  }

  generateBubbles() {
    if (!this.svgRef) {
      return [];
    }

    const { hierarchy, pack } = d3;
    const { clientWidth, clientHeight } = this.svgRef;

    const layout = pack().size([clientWidth, clientHeight]);
    const root = hierarchy({ children: this.state.content }).sum((d) => d.activity);
    layout(root);

    const leaves = root.leaves();
    if (leaves.length === 0 || !leaves[0].r) {
      return [];
    }

    return _.map(leaves, (l, i) => {
      return (
        <g
          key={`circle_${i}`}
          transform={`translate(${l.x},${l.y})`}
          onMouseEnter={() => this.constructActiveLegend(l.data)}
          onMouseOut={() => this.setState({ activeLegend: null })}>
          <circle
            fill={this.props.colors.get(l.data.id)}
            stroke={this.props.highlightedStakeholders.includes(l.data.id) ? '#c0392b' : 'none'}
            strokeWidth={5}
            r={l.r}
          />
        </g>
      );
    });
  }
}
