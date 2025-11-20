import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import * as api from "../api";
import SkillsTree from "./SkillsTree.jsx";

// Mock getRole to return predictable required_skills
jest.spyOn(api, "getRole").mockImplementation(async (id) => {
  return {
    id,
    name: "Mock Role",
    description: "Role detail",
    required_skills: [
      { skill_id: 1, skill_name: "Engineering: System Design", level_required: 4, sub_skills: ["Load Balancing", "Caching"] },
      { skill_id: 2, skill_name: "Engineering: APIs", level_required: 3, sub_skills: ["REST", "Auth"] },
    ],
  };
});

describe("SkillsTree", () => {
  test("renders skills after fetching role detail", async () => {
    render(<SkillsTree roleId={123} title="Test Skills" />);
    expect(screen.getByText(/Loading skills/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("System Design")).toBeInTheDocument();
      expect(screen.getByText("APIs")).toBeInTheDocument();
      expect(screen.getAllByText(/req/).length).toBeGreaterThan(0);
    });
  });
});
