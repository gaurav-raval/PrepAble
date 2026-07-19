import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { ReportSummary } from "../components/ReportSummary";
import { useSession } from "../context/AccessibilityContext";
import { mockReport } from "../data/mockData";

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "Report — PrepAble" },
      { name: "description", content: "Your full interview report with strengths, improvement areas and recommendations." },
    ],
  }),
  component: ReportPage,
});

function ReportPage() {
  const session = useSession();
  const navigate = useNavigate();

  if (!session.profile) return <Navigate to="/auth" />;

  return (
    <div className="pa-stack">
      <header>
        <h1>Your interview report</h1>
        <p className="pa-muted">A summary of your practice session, {session.profile.name}.</p>
      </header>

      <ReportSummary report={mockReport} />

      <div className="pa-row" style={{ justifyContent: "flex-end" }}>
        <button
          type="button"
          className="pa-btn secondary"
          onClick={() => navigate({ to: "/dashboard" })}
        >
          Practice again
        </button>
      </div>
    </div>
  );
}
