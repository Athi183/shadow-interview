// Responsibility: keep static Milestone 2 interview content separate from UI components.

export const problem = {
  title: "Two Sum",
  difficulty: "Easy",
  tags: ["Array", "Hash Table"],
  description:
    "Given an array of integers and a target value, return the indices of two numbers whose sum equals the target.",
};

export const chatMessages = [
  {
    id: "welcome",
    role: "interviewer",
    content:
      "Welcome to your mock interview. I'll evaluate your reasoning, communication, and problem-solving process. I won't reveal solutions directly, but I'll challenge your thinking just like a real interviewer would. Let's begin—tell me your first approach before writing any code.",
  },
  {
    id: "candidate",
    role: "candidate",
    content:
      "I would first clarify whether the input can contain duplicates, then compare a brute-force approach with a hash map solution before choosing the right trade-off.",
  },
];

export const transcriptSegments = [
  { timestamp: "00:08", speaker: "You", text: "I would start by understanding the constraints and expected complexity." },
  { timestamp: "00:18", speaker: "You", text: "A nested loop works, but it repeats work for every pair." },
  { timestamp: "00:31", speaker: "You", text: "A hash map lets me find the complement in constant time on average." },
];

export const interviewSteps = [
  "Introduction",
  "Problem Analysis",
  "Implementation",
  "Optimization",
  "Edge Cases",
  "Wrap Up",
];
