import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { FeedbackPanel } from "../components/FeedbackPanel";
import { useSession } from "../context/AccessibilityContext";
import { mockFeedback, questions } from "../data/mockData";

const search = z.object({ i: z.number().min(0).default(0) });

export const Route = createFileRoute("/feedback")({
  validateSearch: (s) => search.parse(s),
  head: () => ({
    meta: [
      { title: "Feedback — PrepAble" },
      { name: "description", content: "Review AI feedback with STAR analysis and recruiter perspective." },
    ],
  }),
  component: FeedbackPage,
});

function FeedbackPage() {
  const session = useSession();
  const navigate = useNavigate();
  const { i } = Route.useSearch();

  if (!session.profile) return <Navigate to="/auth" />;

  const isLast = i >= questions.length - 1;

  return (
    <div className="pa-stack">
      <header>
        <h1>Feedback</h1>
        <p className="pa-muted">
          Your response to question {i + 1} of {questions.length} has been evaluated.
        </p>
      </header>

      <FeedbackPanel feedback={mockFeedback} />

      <div className="pa-row" style={{ justifyContent: "space-between" }}>
        <button
          type="button"
          className="pa-btn secondary"
          onClick={() => navigate({ to: "/interview" })}
        >
          ← Back to interview
        </button>
        {!isLast ? (
          <button
            type="button"
            className="pa-btn"
            onClick={() => navigate({ to: "/feedback", search: { i: i + 1 } })}
          >
            Next Question →
          </button>
        ) : (
          <button
            type="button"
            className="pa-btn"
            onClick={() => navigate({ to: "/report" })}
          >
            View Final Report →
          </button>
        )}
      </div>
    </div>
  );
}
