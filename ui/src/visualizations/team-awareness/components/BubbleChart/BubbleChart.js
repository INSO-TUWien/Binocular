import React from 'react';
import _ from 'lodash';
import * as chartStyle from './BubbleChart.scss';
import * as d3 from 'd3';
import Legend from '../../../../components/Legend';

export default class BubbleChart extends React.Component {
  constructor(props) {
    super(props);
    this.styles = _.assign({}, chartStyle);
    const { width, height } = this.props;

    this.state = {
      componentMounted: false,
      content: this.props.content,
      colors: this.createColorSchema(_.map(this.props.content, 'id')),
      width: width || 0,
      height: height || 0
    };
    window.addEventListener('resize', () => this.visualizeChart());
  }

  render() {
    const { activeLegend } = this.state;
    const legend = activeLegend ? activeLegend : this.constructLegendsFromContent();

    return (
      <div className={this.styles.chartArea}>
        <svg className={this.styles.chartDrawingArea} ref={svg => (this.svgRef = svg)}>
          <g>
            <g id="chartBubbleArea" className="chartBubbleArea" ref={area => (this.bubbleAreaRef = area)} />
            <Legend x={10} y={10} categories={legend} />
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

  constructActiveLegend(circle) {
    const stakeholder = circle.__data__.data;
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
      this.setState(
        {
          content: this.props.content,
          colors: this.createColorSchema(_.map(this.props.content, 'id'))
        },
        this.visualizeChart
      );
    } else {
      this.visualizeChart();
    }
  }

  visualizeChart() {
    if (!this.state.componentMounted) {
      return;
    }

    const { hierarchy, pack, select } = d3;

    const bubbleArea = select(this.bubbleAreaRef);
    bubbleArea.selectAll('g').remove();

    const { clientWidth, clientHeight } = this.svgRef;
    const layout = pack().size([clientWidth, clientHeight]);
    const root = hierarchy({ children: this.state.content }).sum(d => d.activity);
    layout(root);

    const leaf = bubbleArea.selectAll('g').data(root.leaves()).join('g').attr('transform', d => `translate(${d.x},${d.y})`);
    leaf.append('circle').attr('fill', d => this.state.colors.get(d.data.id)).attr('data', d => d.data.id).attr('r', d => d.r);
    leaf.on('mouseenter', d => this.constructActiveLegend(d.target));
    leaf.on('mouseleave', () => this.setState({ activeLegend: null }));
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
