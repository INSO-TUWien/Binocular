import React from 'react';
import _ from 'lodash';
import * as chartStyle from './BubbleChart.scss';
import * as d3 from 'd3';
import Legend from '../../../../components/Legend';

export default class BubbleChart extends React.Component {
  constructor(props) {
    super(props);
    this.styles = _.assign({}, chartStyle);

    this.state = {
      componentMounted: false,
      content: this.props.content,
      colors: this.createColorSchema(_.map(this.props.content, 'id')),
      width: 0,
      height: 0
    };
    window.addEventListener('resize', () => this.setState({ width: window.innerWidth, height: window.innerHeight }));
  }

  render() {
    const { activeLegend, content } = this.state;
    const legend = activeLegend ? activeLegend : this.constructLegendsFromContent();

    return (
      <div className={this.styles.chartArea}>
        <svg className={this.styles.chartDrawingArea} ref={svg => (this.svgRef = svg)}>
          <g>
            {this.generateBubbles()}
            {content && content.length > 0 && <Legend x={10} y={10} categories={legend} />}
          </g>
        </svg>
        <div className={this.styles.chartTooltip} ref={div => (this.tooltipRef = div)} />
      </div>
    );
  }

  constructLegendsFromContent() {
    return [
      {
        name: 'Authors',
        subLegend: _.map(this.state.content, c => {
          return {
            name: c.signature,
            style: {
              fill: this.state.colors.get(c.id)
            }
          };
        })
      }
    ];
  }

  constructActiveLegend(stakeholder) {
    const legend = [
      {
        name: stakeholder.signature + ' Activity: ' + stakeholder.activity,
        style: { fill: this.state.colors.get(stakeholder.id) }
      }
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
    if (this.state.componentMounted && this.state.content !== this.props.content) {
      this.setState({
        content: this.props.content,
        colors: this.createColorSchema(_.map(this.props.content, 'id'))
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
    const root = hierarchy({ children: this.state.content }).sum(d => d.activity);
    layout(root);

    const leaves = root.leaves();
    if (leaves.length === 0 || !leaves[0].r) {
      return [];
    }

    return _.map(leaves, (l, i) =>
      <g
        key={`circle_${i}`}
        transform={`translate(${l.x},${l.y})`}
        onMouseEnter={() => this.constructActiveLegend(l.data)}
        onMouseOut={() => this.setState({ activeLegend: null })}>
        <circle fill={this.state.colors.get(l.data.id)} r={l.r} />
      </g>
    );
  }

  createColorSchema(data) {
    return new Map(
      data.map((v, i) => {
        return [v, getColor((i + 1) / data.length)];
      })
    );
  }
}

function getColor(t) {
  t = Math.max(0, Math.min(1, t));
  return (
    'rgb(' +
    Math.max(0, Math.min(255, Math.round(34.61 + t * (1172.33 - t * (10793.56 - t * (33300.12 - t * (38394.49 - t * 14825.05))))))) +
    ', ' +
    Math.max(0, Math.min(255, Math.round(23.31 + t * (557.33 + t * (1225.33 - t * (3574.96 - t * (1073.77 + t * 707.56))))))) +
    ', ' +
    Math.max(0, Math.min(255, Math.round(27.2 + t * (3211.1 - t * (15327.97 - t * (27814 - t * (22569.18 - t * 6838.66))))))) +
    ')'
  );
}
