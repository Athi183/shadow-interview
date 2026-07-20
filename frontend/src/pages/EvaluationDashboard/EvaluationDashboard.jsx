// Responsibility: load and display the final interview evaluation dashboard.

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Dashboard, { downloadText } from "../../components/EvaluationDashboard/EvaluationDashboard";
import { fallbackEvaluationReport } from "../../data/evaluationReport";
import { exportInterviewReport, fetchInterviewReport, getStoredSessionId } from "../../services/interviewApi";

export default function EvaluationDashboardPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(fallbackEvaluationReport);
  const sessionId = searchParams.get("sessionId") || getStoredSessionId();
  const problemUrl = report.problem?.url || searchParams.get("problemUrl") || "";

  useEffect(() => {
    if (!sessionId) return;
    fetchInterviewReport(sessionId)
      .then((payload) => setReport(payload.report))
      .catch(() => setReport(fallbackEvaluationReport));
  }, [sessionId]);

  async function downloadJson() {
    if (!sessionId) {
      downloadText("shadow-interview-report.json", JSON.stringify(report, null, 2), "application/json");
      return;
    }
    const exportPayload = await exportInterviewReport(sessionId, "json");
    downloadText("shadow-interview-report.json", exportPayload.content, "application/json");
  }

  async function downloadMarkdown() {
    if (!sessionId) {
      downloadText("shadow-interview-report.md", "# Shadow Interview Report\n", "text/markdown");
      return;
    }
    const exportPayload = await exportInterviewReport(sessionId, "markdown");
    downloadText("shadow-interview-report.md", exportPayload.content, "text/markdown");
  }

  function restartInterview() {
    if (problemUrl) {
      window.location.href = problemUrl;
      return;
    }

    navigate("/interview");
  }

  return (
    <Dashboard
      report={report}
      onDownloadJson={downloadJson}
      onDownloadMarkdown={downloadMarkdown}
      onRestart={restartInterview}
    />
  );
}
