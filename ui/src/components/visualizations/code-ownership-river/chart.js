'use strict';

import React from 'react';
import Measure from 'react-measure';
import * as d3 from 'd3';
import styles from './styles.scss';
import _ from 'lodash';
import GridLines from './GridLines.js';
import Axis from './Axis.js';
// import ResizeObserver from 'resize-observer-polyfill';

const parseTime = d3.timeParse('%Y-%m-%dT%H:%M:%S.000Z');

export default class CodeOwnershipRiver extends React.Component {
  constructor(props) {
    super(props);

    this.elems = {};
    this.state = {
      dimensions: {
        fullWidth: 0,
        fullHeight: 0,
        width: 0,
        height: 0,
        wMargin: 0,
        hMargin: 0
      },
      transform: d3.zoomIdentity
    };

    this.commits = [];
    this.zoom = d3.zoom().on('zoom', () => this.updateZoom(d3.event));

    this.scales = {
      x: d3.scaleTime().rangeRound([0, 0]).domain([0, 0]),
      y: d3.scaleLinear().rangeRound([0, 0]).domain([0, 0])
    };
  }

  updateZoom(evt) {
    this.setState({ transform: evt.transform });
  }

  updateDimensions(dimensions) {
    const fullWidth = dimensions.width;
    const fullHeight = dimensions.height;
    const wPct = 0.8;
    const hPct = 0.6;

    const width = fullWidth * wPct;
    const height = fullHeight * hPct;
    const wMargin = (fullWidth - width) / 2;
    const hMargin = (fullHeight - height) / 2;

    this.scales.x.rangeRound([0, width]);
    this.scales.y.rangeRound([height, 0]);

    this.setState({
      dimensions: {
        fullWidth,
        fullHeight,
        width,
        height,
        wMargin,
        hMargin
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    const commitData = _.get(nextProps, 'commits.data.commits', []);
    this.commits = _.map(commitData, function(c, i) {
      return _.merge({}, c, { date: parseTime(c.date), commitCount: i + 1 });
    });

    const dateExtent = d3.extent(this.commits, c => c.date);
    const countExtent = d3.extent(this.commits, c => c.commitCount);
    this.scales.x.domain(dateExtent);
    this.scales.y.domain(countExtent);
  }

  render() {
    const dims = this.state.dimensions;

    const translate = `translate(${dims.wMargin}, ${dims.hMargin})`;

    const x = this.state.transform.rescaleX(this.scales.x);
    const y = this.state.transform.rescaleY(this.scales.y);

    const line = d3
      .line()
      .x(c => x(c.date))
      .y(c => y(c.commitCount))
      .defined(c => _.inRange(x(c.date), dims.width) && _.inRange(y(c.commitCount), dims.height));

    return (
      <Measure onMeasure={dims => this.updateDimensions(dims)}>
        <div>
          <svg className={styles.chart} ref={svg => this.elems.svg = svg}>
            <g transform={translate}>
              <GridLines orient="left" scale={y} ticks="10" length={dims.width} />
              <GridLines orient="bottom" scale={x} y={dims.height} length={dims.height} />
              <Axis orient="left" ticks="10" scale={y} />
              <Axis orient="bottom" scale={x} y={dims.height} />
              <path d={line(this.commits)} stroke="black" strokeWidth="1" fill="none" />
            </g>
          </svg>
        </div>
      </Measure>
    );
  }

  componentDidUpdate() {
    const svg = d3.select(this.elems.svg);
    svg.call(this.zoom);
  }
}

// 'use strict';

// import React from 'react';
// import Measure from 'react-measure';
// import * as d3 from 'd3';
// import _ from 'lodash';

// import styles from './styles.scss';
// import Axis from './Axis.js';
// import GridLines from './GridLines.js';

// const parseTime = d3.timeParse('%Y-%m-%dT%H:%M:%S.000Z');

// export default class CodeOwnershipRiver extends React.Component {
//   constructor() {
//     super();

//     this.state = {
//       dimensions: {
//         width: 0,
//         height: 0
//       }
//     };
//   }

//   componentWillReceiveProps(props) {
//     this.updateD3(props);
//   }

//   updateD3(/* props */) {}

//   render() {
//     const commitData = _.get(this.props, 'commits.data.commits', []);
//     const commits = _.map(commitData, function(c, i) {
//       return _.merge({}, c, { date: parseTime(c.date), commitCount: i + 1 });
//     });

//     const fullWidth = this.state.dimensions.width;
//     const fullHeight = this.state.dimensions.height;
//     const wPct = 0.8;
//     const hPct = 0.6;

//     const width = fullWidth * wPct;
//     const height = fullHeight * hPct;
//     const wMargin = (fullWidth - width) / 2;
//     const hMargin = (fullHeight - height) / 2;

//     const translate = `translate(${wMargin}, ${hMargin})`;

//     const x = d3.scaleTime().rangeRound([0, width]).domain(d3.extent(commits, c => c.date));

//     const y = d3
//       .scaleLinear()
//       .rangeRound([height, 0])
//       .domain(d3.extent(commits, c => c.commitCount));

//     const line = d3.line().x(c => x(c.date)).y(c => y(c.commitCount));

//     return (
//       <Measure onMeasure={dimensions => this.setState({ dimensions })}>
//         <div>
//           <svg className={styles.chart}>
//             <g transform={translate}>
//               <GridLines orient="left" scale={y} ticks="10" length={width} />
//               <GridLines orient="bottom" scale={x} y={height} length={height} />
//               <Axis orient="left" ticks="10" scale={y} />
//               <Axis orient="bottom" scale={x} y={height} />
//               <path d={line(commits)} stroke="black" strokeWidth="1" fill="none" />
//             </g>
//           </svg>
//         </div>
//       </Measure>
//     );
//   }
// }
