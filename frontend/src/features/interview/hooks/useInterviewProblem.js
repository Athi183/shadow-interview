// Responsibility: convert extension-provided interview query parameters into
// the normalized problem model consumed by the React workspace.

import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

const REQUIRED_PARAMS = ["title", "difficulty", "problemUrl"];

function readParam(searchParams, key) {
  return searchParams.get(key)?.trim() || "";
}

export default function useInterviewProblem() {
  const [searchParams] = useSearchParams();

  return useMemo(() => {
    const title = readParam(searchParams, "title");
    const difficulty = readParam(searchParams, "difficulty");
    const problemUrl = readParam(searchParams, "problemUrl");
    const sessionId = readParam(searchParams, "sessionId");
    const hasRequiredParams = REQUIRED_PARAMS.every((key) => readParam(searchParams, key));

    if (!hasRequiredParams) {
      return {
        isSelected: false,
        title: "No problem selected.",
        difficulty: "Unknown",
        sourceUrl: "",
        sessionId: "",
        tags: ["Awaiting LeetCode problem"],
        description: "Start an interview from the Chrome extension on a LeetCode problem page to load problem context here.",
      };
    }

    return {
      isSelected: true,
      title,
      difficulty,
      sourceUrl: problemUrl,
      sessionId,
      tags: ["LeetCode", difficulty],
      description: "This interview workspace was launched from the detected LeetCode problem. Use the source link for the full statement while practicing your explanation here.",
    };
  }, [searchParams]);
}
