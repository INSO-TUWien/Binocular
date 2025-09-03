import { useEffect, useId, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { DataPluginIssue } from '../../../../interfaces/dataPluginInterfaces/dataPluginIssues.ts';

// Types
export interface NodeType extends d3.SimulationNodeDatum {
  id: string;
  group: string;
  url: string;
  avatarUrl: string;
  name: string;
}

export interface LinkType extends d3.SimulationLinkDatum<NodeType> {
  source: string | NodeType;
  target: string | NodeType;
  value: number;
  issues: DataPluginIssue[];
}

type NetworkData = {
  nodes: NodeType[];
  links: LinkType[];
};

type NetworkChartProps = {
  width: number;
  height: number;
  data: NetworkData;
};

export const NetworkChart = ({ width, height, data }: NetworkChartProps) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipElRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const selectedLinkRef = useRef<LinkType | null>(null);
  const clipId = useId();
  //helper values/constants
  const NODE_IMAGE_SIZE = 30; // px
  /** How many points to sample around each node for the hull*/
  const HULL_EXPANSION_POINTS = 12;
  /** Distance of the sampled expansionPoints to the center of each node*/
  const HULL_RADIUS_OFFSET = NODE_IMAGE_SIZE / 2 + 5;

  const hasData = Boolean(data && data.nodes && data.links);

  useEffect(() => {
    const tooltip = d3
      .select('body')
      .append('div')
      .style('position', 'absolute')
      .style('padding', '6px 10px')
      .style('background', 'rgba(0, 0, 0, 0.75)')
      .style('color', '#fff')
      .style('border-radius', '4px')
      .style('pointer-events', 'auto') // allow clicking
      .style('z-index', '9999')
      .style('font-size', '12px')
      .style('visibility', 'hidden');

    tooltipElRef.current = tooltip.node() as HTMLDivElement;
    return () => {
      tooltip.remove();
    };
  }, []);

  /** on data-change hide chart   */
  useEffect(() => {
    setIsVisible(false);
  }, [data]);

  const colorScale = useMemo(() => {
    return d3
      .scaleOrdinal<string>()
      .domain(Array.from(new Set(data.nodes.map((n) => n.group))))
      .range(d3.schemeTableau10); // more distinct than Category10
  }, [data.nodes]);

  //clip avatars to circles
  useEffect(() => {
    if (!hasData) {
      // nothing to draw; canvas is cleared
      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove();
      return;
    }

    const svg = d3.select<SVGSVGElement, unknown>(svgRef.current!);
    svg.selectAll('*').remove();

    svg
      .append('defs')
      .append('clipPath')
      .attr('id', `avatar-clip-${clipId}`)
      .attr('clipPathUnits', 'userSpaceOnUse')
      .append('circle')
      .attr('r', NODE_IMAGE_SIZE / 2)
      .attr('cx', 0)
      .attr('cy', 0);

    const container = svg.append('g');

    const zoomBehavior = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 7])
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
      });
    svg.call(zoomBehavior);

    const simulation = initializeForceSimulation(data.nodes, data.links, width, height);

    const linkSelection = container
      .append('g')
      .attr('class', 'links')
      .attr('stroke', '#000')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(data.links)
      .enter()
      .append('line')
      .attr('stroke-width', (d) => Math.max(1, Math.sqrt(d.value || 0)))
      .style('cursor', 'pointer')
      .on('mousemove', (event, d) => {
        if (!selectedLinkRef.current) {
          showLinkTooltip(d);
          moveTooltip(...d3.pointer(event, document.body));
        }
      })
      .on('mouseout', () => {
        if (!selectedLinkRef.current) hideTooltip();
      })
      .on('click', (event, d) => {
        event.stopPropagation();
        selectedLinkRef.current = d;
        showLinkTooltip(d);
      });

    const bodyClick = () => {
      if (selectedLinkRef.current) {
        selectedLinkRef.current = null;
        hideTooltip();
      }
    };

    //remove tooltip when click on sth else
    document.body.addEventListener('click', () => {
      bodyClick();
    });

    //draw node groups
    const nodeSelection = container
      .append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(data.nodes)
      .enter()
      .append('g')
      .attr('class', 'node-group')
      .call(
        d3
          .drag<SVGGElement, NodeType>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.003).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          }),
      );

    //append clipped images to each node
    nodeSelection
      .append('image')
      .attr('href', (d) => d.avatarUrl)
      .attr('width', NODE_IMAGE_SIZE)
      .attr('height', NODE_IMAGE_SIZE)
      .attr('x', -NODE_IMAGE_SIZE / 2)
      .attr('y', -NODE_IMAGE_SIZE / 2)
      .attr('clip-path', `url(#avatar-clip-${clipId})`)
      .attr('tabindex', 0)
      .attr('role', 'link')
      .attr('aria-label', (d) => d.name || d.url)
      .style('cursor', 'pointer')
      .on('click', (_event, d) => window.open(d.url, '_blank'))
      .on('keydown', (e, d) => {
        if (e.key === 'Enter' || e.key === ' ') window.open(d.url, '_blank');
      })
      .on('mouseover', (_event, d) => showNodeTooltip(d.name ? d.name : d.url))
      .on('mousemove', (event) => moveTooltip(...d3.pointer(event, document.body)))
      .on('mouseout', () => hideTooltip());

    const hullGroup = container.append('g').attr('class', 'hull-group');

    simulation.on('tick', () => {
      linkSelection
        .attr('x1', (d) => (d.source as NodeType).x!)
        .attr('y1', (d) => (d.source as NodeType).y!)
        .attr('x2', (d) => (d.target as NodeType).x!)
        .attr('y2', (d) => (d.target as NodeType).y!);

      nodeSelection.attr('transform', (d) => `translate(${d.x!}, ${d.y!})`);

      const grouped = d3.group(data.nodes, (d) => d.group);
      const hullData: [string, NodeType[]][] = Array.from(grouped.entries());

      const hullPaths = hullGroup.selectAll<SVGPathElement, [string, NodeType[]]>('.hull').data(hullData, (d) => d[0]);

      hullPaths.join(
        (enter) =>
          enter
            .append('path')
            .attr('class', 'hull')
            .attr('fill', 'none')
            .attr('stroke-width', 2)
            .call((selection) => selection.attr('stroke', (d) => colorScale(d[0])).attr('d', ([, nodes]) => computeHullPath(nodes))),
        (update) =>
          update.call((selection) => selection.attr('stroke', (d) => colorScale(d[0])).attr('d', ([, nodes]) => computeHullPath(nodes))),
        (exit) => exit.remove(),
      );
    });

    simulation.on('end', () => setIsVisible(true));

    return () => {
      simulation.stop();
      svg.on('.zoom', null);
      document.body.removeEventListener('click', bodyClick);
    };

    function initializeForceSimulation(nodes: NodeType[], links: LinkType[], w: number, h: number) {
      return d3
        .forceSimulation<NodeType>(nodes)
        .force(
          'link',
          d3
            .forceLink<NodeType, LinkType>(links)
            .id((n) => n.id)
            .distance(20),
        )
        .force('charge', d3.forceManyBody().strength(10))
        .force('center', d3.forceCenter(w / 2, h / 2))
        .force('collide', d3.forceCollide(HULL_RADIUS_OFFSET + HULL_RADIUS_OFFSET - NODE_IMAGE_SIZE / 2))
        .alphaTarget(0.0005)
        .restart();
    }

    function computeHullPath(nodes: NodeType[]): string {
      //construct set of sample points around each node
      const points: [number, number][] = [];
      nodes.forEach((node) => {
        const cx = node.x ?? 0;
        const cy = node.y ?? 0;
        for (let i = 0; i < HULL_EXPANSION_POINTS; i++) {
          const angle = (2 * Math.PI * i) / HULL_EXPANSION_POINTS;
          const r = HULL_RADIUS_OFFSET * 1.3;
          points.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
        }
      });

      const hull = d3.polygonHull(points);
      if (!hull) return ''; //no hull if fewer than 3 points were sampled

      //smoothing
      const lineGen = d3.line().curve(d3.curveBasisClosed);
      return lineGen(hull) ?? '';
    }
  }, [data, width, height, colorScale, clipId, hasData, HULL_RADIUS_OFFSET]);

  function showLinkTooltip(link: LinkType) {
    if (!tooltipElRef.current) return;
    const tooltip = d3.select(tooltipElRef.current);
    const count = link.value;
    const title = count > 1 ? 'Issues' : 'Issue';
    const issueList = link.issues
      .map(
        (issue) =>
          `<a href="${issue.webUrl}" target="_blank" style="color:lightblue; text-decoration:none;">
             • ${issue.title}
           </a>`,
      )
      .join('<br>');
    tooltip.html(`<strong>${count} shared ${title}:</strong><br>${issueList}`).style('visibility', 'visible');
  }

  function showNodeTooltip(name: string) {
    if (!tooltipElRef.current) return;
    d3.select(tooltipElRef.current).text(name).style('visibility', 'visible');
  }

  function moveTooltip(x: number, y: number) {
    if (!tooltipElRef.current) return;
    d3.select(tooltipElRef.current)
      .style('left', `${x + 10}px`)
      .style('top', `${y + 10}px`);
  }

  function hideTooltip() {
    if (!tooltipElRef.current) return;
    d3.select(tooltipElRef.current).style('visibility', 'hidden');
  }

  return (
    <div style={{ position: 'relative' }}>
      {!isVisible && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: width,
            height: height,
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            zIndex: 1,
          }}>
          Simulating graph layout...
        </div>
      )}
      <>
        <svg ref={svgRef} width={width} height={height} style={{ opacity: isVisible ? 1 : 0, display: 'block' }} />
      </>
    </div>
  );
};
