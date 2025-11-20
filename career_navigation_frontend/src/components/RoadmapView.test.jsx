import React from 'react';
import { render, screen } from '@testing-library/react';
import RoadmapView from './RoadmapView.jsx';
import { calculateProgress, transformRoleToRoadmap } from '../utils/roadmapUtils';

test('transformRoleToRoadmap builds milestones and dependencies', () => {
  const role = {
    id: 1,
    name: 'Test',
    required_skills: [
      { skill_id: 1, skill_name: 'Skill A', level_required: 2, status: 'Completed', depends_on: [2] },
      { skill_id: 2, skill_name: 'Skill B', level_required: 3, status: 'In Progress' },
    ],
  };
  const roadmap = transformRoleToRoadmap(role);
  expect(roadmap.milestones.length).toBe(2);
  const ids = roadmap.milestones.map((m) => m.id);
  expect(ids).toEqual(expect.arrayContaining(['m-1', 'm-2']));
  // dependency should be m-2 -> m-1
  expect(roadmap.dependencies).toEqual(expect.arrayContaining([{ from: 'm-2', to: 'm-1' }]));
});

test('calculateProgress accounts for statuses', () => {
  const rm = {
    milestones: [
      { id: 'a', status: 'Completed' },
      { id: 'b', status: 'In Progress' },
      { id: 'c', status: 'Not Started' },
    ],
  };
  // (1 + 0.5 + 0) / 3 = 0.5
  expect(calculateProgress(rm)).toBeCloseTo(0.5, 2);
});

test('RoadmapView renders basic structure and empty state without roleId', () => {
  render(<RoadmapView roleId={null} />);
  expect(screen.getByText(/Role Roadmap/i)).toBeInTheDocument();
  expect(screen.getByText(/Select a target role to generate your roadmap/i)).toBeInTheDocument();
});
