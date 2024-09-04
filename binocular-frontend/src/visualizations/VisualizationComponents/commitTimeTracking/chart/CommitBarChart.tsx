import * as React from 'react';
import * as d3 from 'd3';
import styles from '../styles.module.scss';

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
  displayStatistics: (
    statisticsWindow: any,
    statisticsSettings: any,
    setState: any,
    colorDomain: any,
    colorPalette: any,
  ) => void | undefined;
  axisTitles: string[];
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
  private readonly axisTitles: string[];
  private readonly displayStatistics: (
    statisticsWindow: any,
    statisticsSettings: any,
    setState: any,
    colorDomain: any,
    colorPalette: any,
  ) => void | undefined;

  constructor(props: Props | Readonly<Props>) {
    super(props);
    this.displayStatistics = props.displayStatistics;
    this.colorDomain = props.colorDomain;
    this.defaultColor = props.defaultColor;
    this.colorPalette = props.colorPalette;
    this.dimensions = props.dimensions;
    this.axisTitles = props.axisTitles;

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
      (this.divRef?.getBoundingClientRect().width - 80 - 30) *
      (this.state.content.commitData.slice(40 * this.state.page, 40 + 40 * this.state.page).length / 40.0);
    const nodeChartHeight = this.state.content.nodeChart ? 40 : 0;
    const numberOfBarcharts = this.state.content.upperChart && this.state.content.lowerChart ? 2 : 1;
    // 25 is for navigation, 20 for it's margin and 427 is the default value for a normal screen.
    const height = ((visualViewport?.height ?? 919) - nodeChartHeight - 25 - 20) / numberOfBarcharts;

    const mainDiv = d3.select(this.divRef).html('');
    if (this.state.content.upperChart) {
      this.drawChart(mainDiv, width, height, { top: 40, right: 30, bottom: 0, left: 80 }, false, this.axisTitles[0]);
    }

    if (this.state.content.nodeChart) {
      this.drawNodes(mainDiv, width);
    }

    if (this.state.content.lowerChart) {
      this.drawChart(mainDiv, width, height, { top: 0, right: 30, bottom: 40, left: 80 }, true, this.axisTitles[1]);
    }

    this.drawNavigation(mainDiv, Math.ceil(this.state.content.commitData.length / 40.0));
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
      toggleDivArrow.attr('d', 'M8,15 L18,5 L28,15 Z');
      statisticsWindow.style('display', 'flex');
    } else {
      toggleDiv.style('top', '-5px');
      toggleDivArrow.attr('d', 'M8,10 L18,20 L28,10 Z');
      statisticsWindow.style('display', 'none');
    }
    toggleDiv.on('click', () => {
      this.setState({ showStatistics: !showStatistics });
    });

    this.displayStatistics(statisticsWindow, this.state.statisticsSettings, this.setState.bind(this), this.colorDomain, this.colorPalette);
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
    axisTitle: string,
  ) {
    const chartData = !showUpsideDown
      ? this.state.content.upperChart.slice(this.state.page * 40, 40 + this.state.page * 40)
      : this.state.content.lowerChart.slice(this.state.page * 40, 40 + this.state.page * 40);
    const svg = this.createSVG(mainDiv, !showUpsideDown ? 'upperChart' : 'lowerChart', margin, height);
    const x = this.createXAxis(chartData, width);
    const y = this.createYAxis(this.state.content[!showUpsideDown ? 'upperChart' : 'lowerChart'], height, showUpsideDown);
    const colorScale = this.createColorScale(this.colorDomain, this.defaultColor, this.colorPalette);

    this.appendBars(svg, chartData, x, y, colorScale, showUpsideDown, height);
    svg
      .append('g')
      .attr('transform', `translate(${-10},0)`)
      .call(d3.axisLeft(y).tickFormat((y) => (y * 1).toFixed()))
      .call((g) => g.select('.domain').remove())
      .call((g) =>
        g
          .append('text')
          .attr('x', -50)
          .attr('y', height / 2)
          .attr('fill', 'currentColor')
          .style('writing-mode', 'vertical-rl')
          .style('font-size', '20px')
          .attr('text-anchor', 'middle')
          .text(axisTitle),
      );
  }

  drawNodes(mainDiv: d3.Selection<HTMLDivElement, unknown, null, undefined>, width: number) {
    const svg = this.createSVG(mainDiv, 'nodeChart', { top: 0, right: 30, bottom: 0, left: 80 }, 40);
    const x = this.createXAxis(this.state.content.nodeChart.slice(this.state.page * 40, 40 + this.state.page * 40), width);

    svg
      .append('rect')
      .attr('x', -5)
      .attr('y', 20 - Math.min(15, x.bandwidth() * 0.5) / 4)
      .attr('height', Math.min(15, x.bandwidth() * 0.5) / 2)
      .attr('width', width + 10);

    const blackNodes = svg
      .selectAll('.blackNodes')
      .data(this.state.content.nodeChart.slice(this.state.page * 40, 40 + this.state.page * 40))
      .enter()
      .append('circle')
      .attr('class', 'node')
      .attr('cx', (d) => (x(d.ticks) ?? 0) + x.bandwidth() / 2)
      .attr('cy', 20)
      .attr('r', Math.min(15, x.bandwidth() * 0.4));

    const whiteNodes = svg
      .selectAll('.whiteNode')
      .data(this.state.content.nodeChart.slice(this.state.page * 40, 40 + this.state.page * 40))
      .enter()
      .append('circle')
      .attr('class', 'node')
      .attr('fill', 'white')
      .attr('cx', (d) => (x(d.ticks) ?? 0) + x.bandwidth() / 2)
      .attr('cy', 20)
      .attr('r', Math.min(7.5, x.bandwidth() * 0.2));

    if (this.state.displayTooltip) {
      const tooltip = mainDiv.append('div').attr('class', styles.tooltip);
      blackNodes.on('click', (event, d) =>
        this.state.displayTooltip(
          event,
          this.state.content.commitData.find((data) => data.date.toString() === d.ticks),
          tooltip,
        ),
      );

      whiteNodes.on('click', (event, d) =>
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
