// Responsibility: provide a local dashboard fallback until live reports load.

export const fallbackEvaluationReport = {
  overall_score: 78,
  interview_readiness: 74,
  scores: {
    technical_knowledge: 76,
    communication: 82,
    problem_solving: 80,
    code_quality: 72,
    optimization: 84,
    complexity_analysis: 70,
    edge_case_awareness: 68,
  },
  strengths: [
    "Identified an optimization path instead of staying with brute force.",
    "Explained reasoning clearly enough for interviewer follow-up.",
    "Connected the implementation to a hash-map pattern.",
  ],
  weaknesses: [
    "Complexity analysis needs more precise justification.",
    "Edge-case discussion should happen before finalizing implementation.",
  ],
  key_observations: [
    "Optimization attempt detected through transcript and code signals.",
    "Candidate communicated trade-offs but could be more explicit with invariants.",
    "Implementation quality is promising but needs final polish.",
  ],
  recommendations: {
    leetcode_patterns: ["Hash Map Lookup", "Two Pointers", "Sliding Window", "Prefix Sum"],
    topics: ["Complexity analysis", "Edge cases", "Clean implementation practice"],
    difficulty_progression: "Easy timed drills -> Medium pattern recognition -> Medium mock interviews",
    suggested_next_problems: [
      "Contains Duplicate",
      "Valid Anagram",
      "Group Anagrams",
      "Top K Frequent Elements",
      "Longest Substring Without Repeating Characters",
    ],
    four_week_roadmap: [
      { week: "Week 1", focus: "Hash maps and clean explanation", goal: "Solve 8 easy problems while narrating approach aloud." },
      { week: "Week 2", focus: "Complexity and edge cases", goal: "Add time/space analysis and edge-case checklist to every solution." },
      { week: "Week 3", focus: "Medium pattern transfer", goal: "Practice 6 medium problems across hash map and sliding window patterns." },
      { week: "Week 4", focus: "Mock interview pacing", goal: "Run 3 timed mock interviews and review communication gaps." },
    ],
  },
  gpt_feedback: "Your reasoning shows promising pattern recognition. Improve readiness by making invariants, complexity, and edge cases explicit before coding.",
};
