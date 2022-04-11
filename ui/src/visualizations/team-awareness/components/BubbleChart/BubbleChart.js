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
      width: this.props.width || 0,
      height: this.props.height || 0
    };
    window.addEventListener('resize', () => this.visualizeChart());
  }

  render() {
    const legend = [
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

    /*
              <ChartLegend
            title="Authors"
            x={15}
            y={15}
            colors={this.state.colors}
            content={this.state.content}
            ref={legend => (this.legendRef = legend)}
          />
             <Legend x={10} y={10} categories={categories} />
     */

    return (
      <div className={this.styles.chartArea}>
        <svg className={this.styles.chartDrawingArea} ref={svg => (this.svgRef = svg)}>
          <g className="chartBubbleArea" ref={area => (this.bubbleAreaRef = area)} />
          <Legend x={10} y={10} categories={legend} />
        </svg>
        <div className={this.styles.chartTooltip} ref={div => (this.tooltipRef = div)} />
      </div>
    );
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

    const bubbleArea = d3.select(this.bubbleAreaRef);
    bubbleArea.selectAll('a').remove();

    const { clientWidth, clientHeight } = this.svgRef;
    const layout = d3.pack().size([clientWidth, clientHeight]);
    const root = d3.hierarchy({ children: this.state.content }).sum(d => d.activity);
    layout(root);

    const leaf = bubbleArea.selectAll('a').data(root.leaves()).join('a').attr('transform', d => `translate(${d.x},${d.y})`);
    leaf.append('title').text(d => `${d.data.signature}\nActivity: ${d.data.activity}`);
    leaf.append('circle').attr('fill', d => this.state.colors.get(d.data.id)).attr('r', d => {
      return d.r;
    });
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
