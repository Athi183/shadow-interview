// Responsibility: keep static interview workspace content separate from UI components.

import { CURRENT_INTERVIEW_STAGE, INTERVIEW_STAGES } from "../features/interview/constants/interviewStages";

export const chatMessages = [
  {
    id: "welcome",
    role: "interviewer",
    content:
      "Welcome to your mock interview. I'll evaluate your reasoning, communication, and problem-solving process. I won't reveal solutions directly, but I'll challenge your thinking just like a real interviewer would. Let's begin - tell me your first approach before writing any code.",
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

export const interviewStages = INTERVIEW_STAGES;

export const currentInterviewStage = CURRENT_INTERVIEW_STAGE;

export const timelineEvents = [
  { id: "started", timestamp: "00:00", title: "Interview Started", detail: "Workspace opened with LeetCode problem context." },
  { id: "approach", timestamp: "00:45", title: "Candidate explained brute force", detail: "Initial approach compared nested loops with a hash map direction." },
  { id: "challenge", timestamp: "02:10", title: "Interviewer challenged complexity", detail: "Next question focuses on trade-offs before implementation." },
];
