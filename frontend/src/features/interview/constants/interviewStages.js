// Responsibility: define canonical interview states shared by interview UI.

export const INTERVIEW_STAGES = [
  { id: "INTRODUCTION", label: "Introduction" },
  { id: "PROBLEM_UNDERSTANDING", label: "Problem Understanding" },
  { id: "INITIAL_APPROACH", label: "Initial Approach" },
  { id: "IMPLEMENTATION", label: "Implementation" },
  { id: "OPTIMIZATION", label: "Optimization" },
  { id: "EDGE_CASES", label: "Edge Cases" },
  { id: "COMPLEXITY_ANALYSIS", label: "Complexity Analysis" },
  { id: "WRAP_UP", label: "Wrap Up" },
];

export const CURRENT_INTERVIEW_STAGE = "INITIAL_APPROACH";
