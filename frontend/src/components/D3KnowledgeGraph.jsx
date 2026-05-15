import React, { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { generateMacroData } from '../utils/graphDataUtils';
import { candidateStore } from '../utils/candidateStore';

/**
 * D3.js force-directed knowledge graph (project doc: D3 visualization).
 */
const D3KnowledgeGraph = ({ width = 800, height = 520, searchQuery = '', graphData }) => {
  const svgRef = useRef(null);
  const simRef = useRef(null);
  const [internalData, setInternalData] = React.useState(() => generateMacroData());

  useEffect(() => {
    return candidateStore.subscribe(() => setInternalData(generateMacroData()));
  }, []);

  const data = graphData || internalData;

  const filtered = useMemo(() => {
    // If graphData is passed from parent, it's already filtered/dimmed
    if (graphData) return graphData;

    if (!searchQuery) return data;
    const q = searchQuery.toLowerCase();
    const match = new Set(
      data.nodes.filter(n => n.label.toLowerCase().includes(q)).map(n => n.id),
    );
    return {
      nodes: data.nodes.map(n => ({ ...n, _dim: !match.has(n.id) })),
      links: data.links
    };
  }, [data, searchQuery, graphData]);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const nodes = filtered.nodes.map(n => ({ ...n }));
    const links = filtered.links.map(l => ({
      source: typeof l.source === 'object' ? l.source.id : l.source,
      target: typeof l.target === 'object' ? l.target.id : l.target,
    }));

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(90))
      .force('charge', d3.forceManyBody().strength(-220))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => Math.sqrt(d.val || 10) * 2.2));

    simRef.current = simulation;

    const link = svg.append('g')
      .attr('stroke', 'rgba(128,128,128,0.2)')
      .attr('stroke-width', 1.5)
      .selectAll('line')
      .data(links)
      .join('line');

    const node = svg.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .style('cursor', 'pointer')
      .call(
        d3.drag()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
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

    node.append('circle')
      .attr('r', d => Math.sqrt(d.val || 10) * 1.6)
      .attr('fill', d => (d._dim ? 'rgba(128,128,128,0.2)' : d.color))
      .attr('stroke', d => (d._dim ? 'transparent' : 'rgba(255,255,255,0.25)'))
      .attr('stroke-width', 1.5);

    node.append('text')
      .text(d => d.label)
      .attr('x', d => Math.sqrt(d.val || 10) * 1.6 + 4)
      .attr('y', 4)
      .attr('font-size', '10px')
      .attr('fill', d => (d._dim ? 'var(--text-muted)' : 'var(--text-primary)'))
      .attr('font-family', 'Inter, sans-serif');

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);
      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    return () => simulation.stop();
  }, [filtered, width, height]);

  return (
    <svg
      ref={svgRef}
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: 'block', background: 'transparent' }}
    />
  );
};

export default D3KnowledgeGraph;
