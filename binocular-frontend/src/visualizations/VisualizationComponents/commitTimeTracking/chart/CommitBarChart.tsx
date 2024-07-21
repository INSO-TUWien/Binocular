import * as React from "react";
import * as d3 from "d3";
import styles from "../styles.module.scss";

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

  constructor(props: Props | Readonly<Props>) {
    super(props);

    this.colorDomain = props.colorDomain;
    this.defaultColor = props.defaultColor;
    this.colorPalette = props.colorPalette;
    this.dimensions = props.dimensions;

    this.state = {
      content: props.content,
      componentMounted: false,
      displayTooltip: props.displayTooltip,
      page: 0
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
    return (
      <div className={styles.chartContainer} ref={(div) => (this.divRef = div)}></div>
    );
  }

  loadChart() {
    if (!this.state.content || !this.divRef) {
      return;
    }
    const width = ((visualViewport?.width ?? 1920) - 511 - 40 - 30) * (this.state.content.commitData.slice(50 * this.state.page, 50 + 50 * this.state.page).length / 50.0);
    const nodeChartHeight = this.state.content.nodeChart ? 40 : 0;
    const numberOfBarcharts = this.state.content.upperChart && this.state.content.lowerChart ? 2 : 1;
    // 25 is for nav, 427 is the default value for a normal screen.
    const height = ((visualViewport?.height ?? 919) - nodeChartHeight - 25 - 20) / numberOfBarcharts;

    const mainDiv = d3.select(this.divRef).html("");
    // Upper chart
    if (this.state.content.upperChart) {
      this.drawChart(mainDiv, width, height, {top: 40, right: 30, bottom: 0, left: 40}, false);
    }

    // Nodes
    if (this.state.content.nodeChart) {
      this.drawNodes(mainDiv, width);
    }


    // Lower chart
    if (this.state.content.lowerChart) {
      this.drawChart(mainDiv, width, height, {top: 0, right: 30, bottom: 40, left: 40}, true);
    }

    this.drawNavigation(mainDiv, Math.ceil(this.state.content.commitData.length / 50.0));
  }

  drawChart(mainDiv: d3.Selection<HTMLDivElement, unknown, null, undefined>, width: number, height:number, margin: Margin, showUpsideDown: boolean) {
    const chartData = !showUpsideDown ? this.state.content.upperChart.slice(this.state.page * 50, 50 + this.state.page * 50)
      : this.state.content.lowerChart.slice(this.state.page * 50, 50 + this.state.page * 50);
    const svg = this.createSVG(mainDiv, !showUpsideDown ? 'upperChart' : 'lowerChart', margin, height);
    const x = this.createXAxis(chartData, width);
    const y = this.createYAxis(chartData, height, showUpsideDown);
    const colorScale = this.createColorScale(this.colorDomain, this.defaultColor, this.colorPalette);

    this.appendBars(svg, chartData, x, y, colorScale, showUpsideDown, height);
  }

  drawNodes(mainDiv: d3.Selection<HTMLDivElement, unknown, null, undefined>, width: number) {
    const svg = this.createSVG(mainDiv,'nodeChart', { top: 5, right: 30, bottom: 5, left: 40 }, 40);
    const x = this.createXAxis(this.state.content.nodeChart.slice(this.state.page * 50, 50 + this.state.page * 50), width);

    const nodes =svg.selectAll(".node")
      .data(this.state.content.nodeChart.slice(this.state.page * 50, 50 + this.state.page * 50))
      .enter()
      .append("circle")
      .attr("class", "node")
      .attr("cx", d => ((x(d.ticks) ?? 0) + x.bandwidth() / 2))
      .attr("cy", 20 - Math.min(15, x.bandwidth() / 2) / 3)
      .attr("r", Math.min(15, x.bandwidth() / 2));

    if (this.state.displayTooltip) {
      const tooltip = mainDiv
          .append("div")
          .attr("class", "tooltip")
          .style("position", "absolute")
          .style("background", "#f0f0f0")
          .style("color", '#333')
          .style("border", "1px solid #000")
          .style("padding", "10px")
          .style("display", "none")
          .style("border-radius", "10px")
          .style("opacity", 0.9);
      nodes.on("click", (event, d) => this.state.displayTooltip(event,this.state.content.commitData.find(data => data.date.toString() == d.ticks), tooltip));

      d3.select(document).on("click", event => {
        const target = event.target;
        if (!target.closest(".node") && !target.closest(".tooltip")) {
          tooltip.style("display", "none");
        }
      });
    }
  }

  drawNavigation(mainDiv: d3.Selection<HTMLDivElement, unknown, null, undefined>, numberOfPages: number) {
    //Height of navigation
    const height = 25;

    const navigationDiv = mainDiv.append("div")
      .attr("id", "navigation")
      .attr("height", height)
      .style("margin", '10px 0px 10px 10px');

    const svgLeftArrow = navigationDiv
      .append("svg")
      .attr("width", 25)
      .attr("height", height);

    if (this.state.page > 0 && numberOfPages > 1) {
      svgLeftArrow.append("path")
        .attr("d", "M20,0 L20,25 L0,12.5 Z")
        .attr("class", "arrowhead")
        .on("click", () => this.setState({ page: this.state.page - 1})
        );
    }

    const inputDiv = navigationDiv
      .append("div")
      .attr("style", `vertical-align: top; width: 75; height: ${height}; display: inline`);

    const input = inputDiv
      .append("input")
      .attr("type", "text")
      .attr("style", `text-align: center;font-size: 16px; width: 20; height: ${height}`)
      .attr('value', this.state.page + 1)
      .on("change", (e) => {
        if (isNaN(e.target.value)) {
          e.target.value = "";
        }
        if (+e.target.value > 0 && +e.target.value <= numberOfPages) {
          this.setState({ page: + e.target.value - 1});
        }
      });

    const pageNumber = inputDiv
      .append("span")
      .attr("style", `width: 20; height: ${height}`)
      .html(`/${numberOfPages}`);

    const svgRightArrow = navigationDiv
      .append("svg")
      .attr("width", 25)
      .attr("height", height);

    if (this.state.page + 1 < numberOfPages) {
      svgRightArrow.append("path")
        .attr("d", "M5,0 L5,25 L25,12.5 Z")
        .attr("class", "arrowhead")
        .on("click", () => this.setState({page: this.state.page + 1}));
    }
  }

  createXAxis(data: chartData[], width: number) {
    return d3.scaleBand()
      .domain(data.map(d => d.ticks))
      .range([0, width])
      .padding(0.1);
  }

  createYAxis(data: chartData[], height: number, showUpsideDown: boolean) {
    height -= !showUpsideDown ? 0 : 40;
    return d3.scaleLinear()
      .domain([0, d3.max(data, d => d.barHeight) || 0])
      .nice()
      .range(!showUpsideDown ? [height, 0] : [0, height]);
  }

  createColorScale(domain: string[], defaultValue: string, colors: string[]) {
    return d3.scaleOrdinal()
      .domain(domain)
      .unknown(defaultValue)
      .range(colors);
  }

  createSVG(mainDiv: d3.Selection<HTMLDivElement, unknown, null, undefined>, selector: string, margin: Margin, height: number) {
    return mainDiv
      .append("svg")
      .attr("width", '100%')
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
  }

  appendBars(svg: d3.Selection<SVGGElement, unknown, null, any>,
             data: chartData[],
             x: d3.ScaleBand<string>,
             y: d3.ScaleLinear<number, number>,
             colorScale: d3.ScaleOrdinal<string, unknown, string>,
             showUpsideDown: boolean,
             height: number) {
    height -= !showUpsideDown ? 0 : 40;
    svg.append("g")
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.ticks)!)
      .attr("y", d => !showUpsideDown ? y(d.barHeight) : 0)
      .attr("width", x.bandwidth())
      .attr("height", d => !showUpsideDown ? height - y(d.barHeight) : y(d.barHeight))
      .attr("fill", d => colorScale(d.color) as string)
      .attr("opacity", "0.7")
      .on("mouseover", function() {
        d3.select(this).style("opacity", 1);
      })
      .on("mouseout", function() {
        d3.select(this).style("opacity", 0.7);
      });
  }
}
