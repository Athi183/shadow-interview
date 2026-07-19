// Responsibility: keep static interview workspace content separate from UI components.

import { CURRENT_INTERVIEW_STAGE, INTERVIEW_STAGES } from "../features/interview/constants/interviewStages";

export const liveInterview = {
  currentStage: "Initial Approach",
  aiQuestion:
    "You mentioned starting with brute force and then moving toward a hash map. What invariant would your hash map maintain as you scan the array?",
  candidateResponse:
    "I would store each number I have seen with its index, then for each new number check whether the complement already exists.",
  recentEvents: [
    { id: "started", timestamp: "00:00", type: "INTERVIEW_STARTED", title: "Interview Started", detail: "Workspace opened with LeetCode problem context." },
    { id: "loaded", timestamp: "00:08", type: "PROBLEM_LOADED", title: "Problem Loaded", detail: "Two Sum detected from LeetCode." },
    { id: "approach", timestamp: "00:45", type: "CANDIDATE_MESSAGE", title: "Candidate explained brute force", detail: "Initial reasoning compared nested loops with a hash map direction." },
    { id: "optimized", timestamp: "02:15", type: "OPTIMIZATION_DETECTED", title: "Candidate switched to HashMap", detail: "Reasoning analyzer detected an optimization attempt." },
    { id: "complexity", timestamp: "03:40", type: "AI_RESPONSE", title: "AI challenged time complexity", detail: "Interviewer asked the candidate to justify the expected runtime." },
  ],
};

export const transcriptSegments = [
  { timestamp: "00:08", speaker: "You", text: "I would start by understanding the constraints and expected complexity." },
  { timestamp: "00:18", speaker: "You", text: "A nested loop works, but it repeats work for every pair." },
  { timestamp: "00:31", speaker: "You", text: "A hash map lets me find the complement in constant time on average." },
];

export const interviewStages = INTERVIEW_STAGES;

export const currentInterviewStage = CURRENT_INTERVIEW_STAGE;

export const timelineEvents = liveInterview.recentEvents;
