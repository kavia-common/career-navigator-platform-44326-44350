import React from 'react';
import { render, screen } from '@testing-library/react';
import MindMapView from './MindMapView.jsx';

describe('MindMapView (D3)', () => {
  it('renders SVG without crashing when given roles', () => {
    const currentRole = { id: 'role-current-1', name: 'Developer' };
    const targetRole = { id: 'role-target-1', name: 'Senior Developer' };
    render(<MindMapView currentRole={currentRole} targetRole={targetRole} />);
    const svg = screen.getByRole('img', { name: /mind map graph/i });
    expect(svg).toBeInTheDocument();
  });

  it('handles empty analysisData gracefully', () => {
    const currentRole = { id: 'role-current-1', name: 'Developer' };
    const targetRole = { id: 'role-target-1', name: 'Senior Developer' };
    render(<MindMapView currentRole={currentRole} targetRole={targetRole} analysisData={{ nodes: [], links: [] }} />);
    const svg = screen.getByRole('img', { name: /mind map graph/i });
    expect(svg).toBeInTheDocument();
  });
});
