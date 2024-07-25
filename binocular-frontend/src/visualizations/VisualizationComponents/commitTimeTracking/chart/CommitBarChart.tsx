import * as React from 'react';
import * as d3 from 'd3';
import styles from '../styles.module.scss';
import { arc } from 'd3';
import { keys } from 'lodash';

interface Props {
  content: {
    commitData: any[];
    upperChart: chartData[];
    nodeChart: chartData[];
    lowerChart: chartData[];
  };
  dimensions: number[];
  colorDomain: string[];
  defaultColor: string;
  colorPalette: string[];
  displayTooltip: (event: any, d: any, tooltip: any) => void | undefined;
  statistics: any;
  branches: string[];
  authors: string[];
}

interface State {
  content: {
    commitData: any[];
    upperChart: chartData[];
    nodeChart: chartData[];
    lowerChart: chartData[];
  };
  displayTooltip: (event: any, d: any, window: d3.Selection<HTMLDivElement, unknown, null, any> | undefined) => void | undefined;
  componentMounted: boolean;
  page: number;
  showStatistics: boolean;
  statisticsSettings: { branch: string; author: string; metric: string };
}

interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface chartData {
  ticks: string;
  barHeight: number;
  color: string;
}

export default class CommitBarChart extends React.Component<Props, State> {
  private divRef: HTMLDivElement | null | undefined;
  private readonly colorDomain: string[];
  private readonly defaultColor: string;
  private readonly colorPalette: string[];
  private readonly dimensions: number[];
  private readonly statistics: any;
  private readonly branches: string[];
  private readonly authors: string[];

  constructor(props: Props | Readonly<Props>) {
    super(props);
    this.statistics = props.statistics;
    this.colorDomain = props.colorDomain;
    this.defaultColor = props.defaultColor;
    this.colorPalette = props.colorPalette;
    this.dimensions = props.dimensions;
    this.branches = props.branches;
    this.authors = props.authors;

    this.state = {
      content: props.content,
      componentMounted: false,
      displayTooltip: props.displayTooltip,
      page: 0,
      showStatistics: false,
      statisticsSettings: { branch: 'All branches', author: 'All authors', metric: 'number' },
    };
    window.addEventListener('resize', () => this.componentDidUpdate());
  }

  componentDidMount() {
    //Needed to restrict d3 to only access DOM when the component is already mounted
    this.setState({ componentMounted: true });
  }

  componentWillUnmount() {
    this.setState({ componentMounted: false });
  }

  //Draw chart after it updated
  componentDidUpdate() {
    //Only update the chart if there is data for it and the component is mounted.
    //it is not currently in a zoom transition (d3 requirement)
    if (this.state.componentMounted && this.props.content) {
      this.loadChart();
    }
  }

  render() {
    return <div className={styles.chartContainer} ref={(div) => (this.divRef = div)}></div>;
  }

  loadChart() {
    if (!this.state.content || !this.divRef) {
      return;
    }
    const width =
      ((visualViewport?.width ?? 1920) - 511 - 40 - 30) *
      (this.state.content.commitData.slice(50 * this.state.page, 50 + 50 * this.state.page).length / 50.0);
    const nodeChartHeight = this.state.content.nodeChart ? 40 : 0;
    const numberOfBarcharts = this.state.content.upperChart && this.state.content.lowerChart ? 2 : 1;
    // 25 is for nav, 427 is the default value for a normal screen.
    const height = ((visualViewport?.height ?? 919) - nodeChartHeight - 25 - 20) / numberOfBarcharts;

    const mainDiv = d3.select(this.divRef).html('');
    // Upper chart
    if (this.state.content.upperChart) {
      this.drawChart(mainDiv, width, height, { top: 40, right: 30, bottom: 0, left: 40 }, false);
    }

    // Nodes
    if (this.state.content.nodeChart) {
      this.drawNodes(mainDiv, width);
    }

    // Lower chart
    if (this.state.content.lowerChart) {
      this.drawChart(mainDiv, width, height, { top: 0, right: 30, bottom: 40, left: 40 }, true);
    }

    this.drawNavigation(mainDiv, Math.ceil(this.state.content.commitData.length / 50.0));
    this.drawLegend(mainDiv);
    this.drawStatistics(mainDiv);
  }

  drawStatistics(mainDiv: d3.Selection<HTMLDivElement, unknown, null, undefined>) {
    const toggleDiv = mainDiv.append('div').attr('class', styles.statisticsToggle);
    const toggleDivArrow = toggleDiv
      .append('svg')
      .attr('class', styles.arrowSvg)
      .append('path')
      .attr('d', 'M10,10 L20,20 L30,10 Z')
      .attr('class', 'arrowhead');
    const statisticsWindow = mainDiv.append('div').attr('class', styles.statisticsWindow);
    const showStatistics = this.state.showStatistics;
    if (showStatistics) {
      toggleDiv.style('top', '220px');
      toggleDivArrow.attr('d', 'M8,20 L18,10 L28,20 Z');
      statisticsWindow.style('display', 'flex');
    } else {
      toggleDiv.style('top', '-5px');
      toggleDivArrow.attr('d', 'M8,10 L18,20 L28,10 Z');
      statisticsWindow.style('display', 'none');
    }
    toggleDiv.on('click', () => {
      this.setState({ showStatistics: !showStatistics });
    });

    const selectDiv = statisticsWindow.append('div').attr('class', styles.selectWrapper);
    const that = this;

    const branchSelect = selectDiv
      .append('div')
      .attr('class', 'select ' + styles.select)
      .append('select')
      .attr('value', this.state.statisticsSettings.branch)
      .on('change', function () {
        const settingsCopy = { ...that.state.statisticsSettings };
        settingsCopy.branch = this.value;
        that.setState({ statisticsSettings: settingsCopy });
      });

    branchSelect
      .selectAll('option')
      .data(['All branches', ...this.branches])
      .enter()
      .append('option')
      .attr('value', (a) => a)
      .text((a) => (a.length <= 22 ? a : a.substring(0, 20) + '...'))
      .each(function (a) {
        if (branchSelect.attr('value') === a) {
          d3.select(this).attr('selected', true);
        }
      });

    const authorSelect = selectDiv
      .append('div')
      .attr('class', 'select ' + styles.select)
      .append('select')
      .attr('value', this.state.statisticsSettings.author)
      .on('change', function () {
        const settingsCopy = { ...that.state.statisticsSettings };
        settingsCopy.author = this.value;
        that.setState({ statisticsSettings: settingsCopy });
      });

    authorSelect
      .selectAll('option')
      .data(['All authors', ...this.authors])
      .enter()
      .append('option')
      .attr('value', (a) => a)
      .text((a) => (a.length <= 22 ? a : a.substring(0, 20) + '...'))
      .each(function (a) {
        if (authorSelect.attr('value') === a) {
          d3.select(this).attr('selected', true);
        }
      });

    const metricSelect = selectDiv
      .append('div')
      .attr('class', 'select ' + styles.select)
      .append('select')
      .attr('value', this.state.statisticsSettings.metric)
      .on('change', function () {
        const settingsCopy = { ...that.state.statisticsSettings };
        settingsCopy.metric = this.value;
        that.setState({ statisticsSettings: settingsCopy });
      });

    const metricOptions = [
      { value: 'number', text: 'Number of commits' },
      { value: 'lines', text: 'Number of line changes' },
      { value: 'timeEstimated', text: 'Time spent (estimated)' },
      { value: 'timeActual', text: 'Time spent (actual)' },
    ];

    metricSelect
      .selectAll('option')
      .data(metricOptions)
      .enter()
      .append('option')
      .attr('value', (a) => a.value)
      .text((a) => a.text)
      .each(function (a) {
        if (metricSelect.attr('value') === a.value) {
          d3.select(this).attr('selected', true);
        }
      });

    const settings = this.state.statisticsSettings;
    const statistics = this.statistics[settings.branch][settings.author][settings.metric];
    const categories = [];
    const total = Object.values<number>(statistics).reduce((prev: number, cur: number) => prev + cur);
    for (const key of Object.keys(statistics)) {
      // @ts-ignore
      categories.push({ name: key, value: statistics[key], ratio: (statistics[key] / total) * 100 });
    }

    if (total === 0) {
      statisticsWindow.append('div').attr('class', styles.noDataDiv).text('No data for this selection');
      return;
    }

    const statisticsDiv = statisticsWindow.append('div').attr('class', styles.statisticsDiv);

    let displayText = '';
    switch (this.state.statisticsSettings.metric) {
      case 'number':
        displayText = `Number of commits: ${total}`;
        break;
      case 'lines':
        displayText = `Number of line changes: ${total} lines`;
        break;
      case 'timeActual':
        displayText = `Time spent (actual): ${total} minutes`;
        break;
      default:
        displayText = `Time spent (estimated): ${total} minutes`;
    }

    statisticsDiv.text(displayText);

    const svg = statisticsDiv.append('svg').attr('class', styles.statisticsSvg).append('g').attr('transform', 'translate(90,90)');
    const pie = d3.pie().value((d) => d.value);
    const pieData = pie(categories);

    const color = d3.scaleOrdinal().domain(this.colorDomain).range(this.colorPalette);

    const arcGenerator = d3.arc().innerRadius(0).outerRadius(90);

    svg
      .selectAll('pieSections')
      .data(pieData)
      .enter()
      .append('path')
      // @ts-ignore
      .attr('d', arcGenerator)
      .attr('fill', (d) => color(d.data.name) as string)
      .attr('stroke', 'black')
      .style('stroke-width', '1px')
      .style('opacity', 0.7)
      .on('mouseover', function () {
        d3.select(this).style('opacity', 1);
      })
      .on('mouseout', function () {
        d3.select(this).style('opacity', 0.7);
      });

    svg
      .selectAll('pieSections')
      .data(pieData)
      .enter()
      .append('text')
      .text((d) => (d.data.ratio === 0 ? '' : Math.round(d.data.ratio * 100) / 100 + '%'))
      .attr('transform', (d) => {
        // @ts-ignore
        const c = arcGenerator.centroid(d);
        const x = c[0];
        const y = c[1];
        const h = Math.sqrt(x * x + y * y);
        return `translate(${(x / h) * 60}, ${(y / h) * 60})`;
      })
      .style('text-anchor', 'middle')
      .style('font-size', 14);
  }

  drawLegend(mainDiv: d3.Selection<HTMLDivElement, unknown, null, undefined>) {
    mainDiv
      .append('div')
      .attr('class', styles.legend)
      .html(`${this.colorDomain.map((c, i) => c + ` <span style="color: ${this.colorPalette[i]};">&#9632;</span>`).join('<br/>')}`);
  }
  drawChart(
    mainDiv: d3.Selection<HTMLDivElement, unknown, null, undefined>,
    width: number,
    height: number,
    margin: Margin,
    showUpsideDown: boolean,
  ) {
    const chartData = !showUpsideDown
      ? this.state.content.upperChart.slice(this.state.page * 50, 50 + this.state.page * 50)
      : this.state.content.lowerChart.slice(this.state.page * 50, 50 + this.state.page * 50);
    const svg = this.createSVG(mainDiv, !showUpsideDown ? 'upperChart' : 'lowerChart', margin, height);
    const x = this.createXAxis(chartData, width);
    const y = this.createYAxis(chartData, height, showUpsideDown);
    const colorScale = this.createColorScale(this.colorDomain, this.defaultColor, this.colorPalette);

    this.appendBars(svg, chartData, x, y, colorScale, showUpsideDown, height);
  }

  drawNodes(mainDiv: d3.Selection<HTMLDivElement, unknown, null, undefined>, width: number) {
    const svg = this.createSVG(mainDiv, 'nodeChart', { top: 5, right: 30, bottom: 5, left: 40 }, 40);
    const x = this.createXAxis(this.state.content.nodeChart.slice(this.state.page * 50, 50 + this.state.page * 50), width);

    const nodes = svg
      .selectAll('.node')
      .data(this.state.content.nodeChart.slice(this.state.page * 50, 50 + this.state.page * 50))
      .enter()
      .append('circle')
      .attr('class', 'node')
      .attr('cx', (d) => (x(d.ticks) ?? 0) + x.bandwidth() / 2)
      .attr('cy', 20 - Math.min(15, x.bandwidth() / 2) / 3)
      .attr('r', Math.min(15, x.bandwidth() / 2));

    if (this.state.displayTooltip) {
      const tooltip = mainDiv.append('div').attr('class', styles.tooltip);
      nodes.on('click', (event, d) =>
        this.state.displayTooltip(
          event,
          this.state.content.commitData.find((data) => data.date.toString() === d.ticks),
          tooltip,
        ),
      );

      d3.select(document).on('click', (event) => {
        const target = event.target;
        if (!target.closest('.node') && !target.closest('.tooltip')) {
          tooltip.style('display', 'none');
        }
      });
    }
  }

  drawNavigation(mainDiv: d3.Selection<HTMLDivElement, unknown, null, undefined>, numberOfPages: number) {
    //Height of navigation
    const height = 25;

    const navigationDiv = mainDiv.append('div').attr('class', styles.navigationDiv);

    const svgLeftArrow = navigationDiv.append('svg').attr('class', styles.arrowSvg);

    if (this.state.page > 0 && numberOfPages > 1) {
      svgLeftArrow
        .append('path')
        .attr('d', 'M20,0 L20,25 L0,12.5 Z')
        .attr('class', 'arrowhead')
        .on('click', () => this.setState({ page: this.state.page - 1 }));
    }

    const inputDiv = navigationDiv.append('div').attr('class', styles.inputDiv);

    inputDiv
      .append('input')
      .attr('type', 'text')
      .attr('class', styles.pageNumberInput)
      .attr('value', this.state.page + 1)
      .on('change', (e) => {
        if (isNaN(e.target.value)) {
          e.target.value = this.state.page + 1;
        }
        if (+e.target.value > 0 && +e.target.value <= numberOfPages) {
          this.setState({ page: +e.target.value - 1 });
        }
      });

    inputDiv.append('span').attr('class', styles.maxPageCount).html(`/${numberOfPages}`);

    const svgRightArrow = navigationDiv.append('svg').attr('class', styles.arrowSvg);

    if (this.state.page + 1 < numberOfPages) {
      svgRightArrow
        .append('path')
        .attr('d', 'M5,0 L5,25 L25,12.5 Z')
        .attr('class', 'arrowhead')
        .on('click', () => this.setState({ page: this.state.page + 1 }));
    }
  }

  createXAxis(data: chartData[], width: number) {
    return d3
      .scaleBand()
      .domain(data.map((d) => d.ticks))
      .range([0, width])
      .padding(0.1);
  }

  createYAxis(data: chartData[], height: number, showUpsideDown: boolean) {
    height -= !showUpsideDown ? 0 : 40;
    return d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.barHeight) || 0])
      .nice()
      .range(!showUpsideDown ? [height, 0] : [0, height]);
  }

  createColorScale(domain: string[], defaultValue: string, colors: string[]) {
    return d3.scaleOrdinal().domain(domain).unknown(defaultValue).range(colors);
  }

  createSVG(mainDiv: d3.Selection<HTMLDivElement, unknown, null, undefined>, selector: string, margin: Margin, height: number) {
    return mainDiv
      .append('svg')
      .attr('width', '100%')
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
  }

  appendBars(
    svg: d3.Selection<SVGGElement, unknown, null, any>,
    data: chartData[],
    x: d3.ScaleBand<string>,
    y: d3.ScaleLinear<number, number>,
    colorScale: d3.ScaleOrdinal<string, unknown, string>,
    showUpsideDown: boolean,
    height: number,
  ) {
    height -= !showUpsideDown ? 0 : 40;
    svg
      .append('g')
      .selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => x(d.ticks)!)
      .attr('y', (d) => (!showUpsideDown ? y(d.barHeight) : 0))
      .attr('width', x.bandwidth())
      .attr('height', (d) => (!showUpsideDown ? height - y(d.barHeight) : y(d.barHeight)))
      .attr('fill', (d) => colorScale(d.color) as string)
      .attr('opacity', '0.7')
      .on('mouseover', function () {
        d3.select(this).style('opacity', 1);
      })
      .on('mouseout', function () {
        d3.select(this).style('opacity', 0.7);
      });
  }
}
