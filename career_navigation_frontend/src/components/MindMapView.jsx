import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import colors from '../theme/colors';
import { computeMindMapData, toD3Graph } from '../utils/skillGapAnalysis';

/**
 * PUBLIC_INTERFACE
 * MindMapView
 * Renders an interactive D3.js mind map for current/target roles, skills, gaps, and recommendations.
 *
 * Props:
 * - currentRole: { id, name }
 * - targetRole: { id, name }
 * - analysisData?: { nodes, links } optional precomputed; otherwise derived locally
 */
export default function MindMapView({ currentRole, targetRole, analysisData = null }) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const [expanded, setExpanded] = useState(() => new Set()); // nodes explicitly expanded
  const [dim, setDim] = useState({ w: 0, h: 0 });

  // Derive or compute data
  const rawData = useMemo(() => {
    if (analysisData && analysisData.nodes && analysisData.links) return analysisData;
    return computeMindMapData(currentRole, targetRole);
  }, [analysisData, currentRole, targetRole]);

  // Collapsible behavior: by default show all, but allow collapse on click for branches (domain/skill)
  const visibleGraph = useMemo(() => {
    // If nothing collapsed, return full graph
    if (expanded.size === 0) return toD3Graph(rawData);

    // For simplicity: when a node is collapsed (not in expanded), we hide its children if it's domain/skill
    const allowed = new Set();
    const queue = [];
    // Always include the two role roots
    const roots = (rawData.nodes || []).filter((n) => n.type === 'role-current' || n.type === 'role-target');
    roots.forEach((r) => {
      allowed.add(r.id);
      queue.push(r.id);
    });

    // BFS but stop at non-expanded domain/skill nodes: include node itself, exclude outgoing edges/children
    const nodeById = new Map(rawData.nodes.map((n) => [n.id, n]));
    const outgoing = d3.group(rawData.links, (l) => l.source);

    while (queue.length) {
      const nid = queue.shift();
      const n = nodeById.get(nid);
      const isBranch = n && (n.type === 'domain' || n.type === 'skill');
      const isOpen = expanded.has(nid) || !isBranch;

      if (!isOpen) continue; // collapsed branch, don't traverse children

      const outs = outgoing.get(nid) || [];
      for (const e of outs) {
        allowed.add(e.target);
        queue.push(e.target);
      }
    }

    const nodes = rawData.nodes.filter((n) => allowed.has(n.id));
    const links = rawData.links.filter((l) => allowed.has(l.source) && allowed.has(l.target));
    return toD3Graph({ nodes, links });
  }, [rawData, expanded]);

  // Resize observer to handle container size
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cr = entry.contentRect;
        setDim({ w: cr.width, h: Math.max(420, cr.height) });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // D3 rendering
  useEffect(() => {
    const width = Math.max(600, dim.w || 800);
    const height = Math.max(420, dim.h || 600);

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Root group with zoom/pan
    const gRoot = svg
      .attr('viewBox', [0, 0, width, height])
      .style('background', '#fff')
      .call(
        d3.zoom().scaleExtent([0.2, 3]).on('zoom', (event) => {
          g.attr('transform', event.transform);
        })
      )
      .append('g');

    // Drop shadow filter
    const defs = svg.append('defs');
    const shadow = defs.append('filter').attr('id', 'drop-shadow').attr('height', '130%');
    shadow.append('feGaussianBlur').attr('in', 'SourceAlpha').attr('stdDeviation', 2).attr('result', 'blur');
    shadow.append('feOffset').attr('in', 'blur').attr('dx', 0).attr('dy', 1).attr('result', 'offsetBlur');
    const feMerge = shadow.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'offsetBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    const g = gRoot.append('g');

    // Force layout
    const sim = d3
      .forceSimulation(visibleGraph.nodes)
      .force(
        'link',
        d3
          .forceLink(visibleGraph.links)
          .id((d) => d.id)
          .distance((l) => {
            const rel = l.relation || '';
            if (rel.includes('transition')) return 120;
            if (rel.includes('domain')) return 160;
            if (rel.includes('needs-upskill')) return 100;
            if (rel.includes('breakdown')) return 80;
            return 130;
          })
          .strength(0.6)
      )
      .force('charge', d3.forceManyBody().strength(-260))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius((d) => nodeRadius(d) + 10));

    // Color mapping
    const colorForType = (type) => {
      switch (type) {
        case 'role-current':
          return colors.primary;
        case 'role-target':
          return colors.secondary;
        case 'gap':
          return colors.error;
        case 'recommendation':
          return colors.success;
        case 'domain':
          return colors.domain;
        case 'sub-skill':
          return colors.subSkill;
        case 'skill':
        default:
          return colors.neutralSkill;
      }
    };

    const nodeRadius = (d) => {
      switch (d.type) {
        case 'role-current':
        case 'role-target':
          return 24;
        case 'domain':
          return 18;
        case 'skill':
          return 14;
        case 'gap':
          return 12;
        case 'recommendation':
          return 10;
        case 'sub-skill':
          return 8;
        default:
          return 10;
      }
    };

    // Links
    const link = g
      .append('g')
      .attr('stroke', 'rgba(17,24,39,0.25)')
      .attr('stroke-width', 1.4)
      .selectAll('line')
      .data(visibleGraph.links)
      .enter()
      .append('line');

    // Nodes
    const node = g
      .append('g')
      .selectAll('g.node')
      .data(visibleGraph.nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .style('cursor', (d) => (d.type === 'domain' || d.type === 'skill' ? 'pointer' : 'default'))
      .on('click', function (event, d) {
        // Toggle expand/collapse for branches
        if (d.type === 'domain' || d.type === 'skill') {
          const next = new Set(expanded);
          if (next.has(d.id)) next.delete(d.id);
          else next.add(d.id);
          setExpanded(next);
        }
      });

    node
      .append('circle')
      .attr('r', (d) => nodeRadius(d))
      .attr('fill', (d) => colorForType(d.type))
      .attr('filter', 'url(#drop-shadow)');

    node
      .append('text')
      .text((d) => d.label)
      .attr('x', (d) => nodeRadius(d) + 8)
      .attr('y', 4)
      .attr('font-size', 12)
      .attr('fill', colors.text)
      .attr('pointer-events', 'none');

    // Tooltips via title
    node.append('title').text((d) => `${d.label} [${d.type}]`);

    sim.on('tick', () => {
      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);

      node.attr('transform', (d) => `translate(${d.x},${d.y})`);
    });

    return () => {
      sim.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleGraph, dim.w, dim.h]);

  // Export helpers
  function exportPNG() {
    const svgEl = svgRef.current;
    if (!svgEl) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgEl);
    const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = function () {
      const canvas = document.createElement('canvas');
      canvas.width = svgEl.viewBox.baseVal.width || svgEl.clientWidth || 1200;
      canvas.height = svgEl.viewBox.baseVal.height || svgEl.clientHeight || 800;
      const ctx = canvas.getContext('2d');
      // White background for PNG
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'mindmap.png';
        a.click();
      });
    };
    img.src = url;
  }

  function exportSVG() {
    const svgEl = svgRef.current;
    if (!svgEl) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgEl);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'mindmap.svg';
    a.click();
  }

  // Legend data
  const legendItems = [
    { label: 'Current Role', color: colors.primary },
    { label: 'Target Role', color: colors.secondary },
    { label: 'Domain', color: colors.domain },
    { label: 'Skill', color: colors.neutralSkill },
    { label: 'Sub-skill', color: colors.subSkill },
    { label: 'Gap', color: colors.error },
    { label: 'Recommendation', color: colors.success },
  ];

  return (
    <div>
      <div
        style={{
          background: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: 12,
          boxShadow: colors.shadow,
          padding: 12,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
          marginBottom: 8,
        }}
      >
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ fontWeight: 700, color: colors.primary }}>
            Mind Map: {currentRole?.name || 'Current'} → {targetRole?.name || 'Target'}
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            {legendItems.map((it) => (
              <div key={it.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                  aria-hidden="true"
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 999,
                    background: it.color,
                    boxShadow: '0 0 0 2px rgba(17,24,39,0.06)',
                  }}
                />
                <span style={{ color: colors.text, fontSize: 13 }}>{it.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={exportSVG}
            style={{
              background: colors.secondary,
              color: '#111827',
              padding: '8px 12px',
              borderRadius: 10,
              border: 'none',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(245,158,11,0.25)',
            }}
          >
            Export SVG
          </button>
          <button
            type="button"
            onClick={exportPNG}
            style={{
              background: colors.primary,
              color: '#fff',
              padding: '8px 12px',
              borderRadius: 10,
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(30,58,138,0.25)',
            }}
          >
            Export PNG
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        style={{
          background: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: 12,
          boxShadow: colors.shadow,
          minHeight: 520,
          height: '60vh',
          overflow: 'hidden',
        }}
      >
        <svg ref={svgRef} role="img" aria-label="Mind map graph" width="100%" height="100%" />
      </div>
    </div>
  );
}
