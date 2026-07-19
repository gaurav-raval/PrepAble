import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { QuestionCard } from "../components/QuestionCard";
import { AnswerInput } from "../components/AnswerInput";
import { useSession } from "../context/AccessibilityContext";
import { questions } from "../data/mockData";

export const Route = createFileRoute("/interview")({
  head: () => ({
    meta: [
      { title: "Interview — PrepAble" },
      { name: "description", content: "Answer interview questions with Read Aloud, Simplify, STAR guidance, and voice input." },
    ],
  }),
  component: InterviewPage,
});

function InterviewPage() {
  const session = useSession();
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);

  // Reset accessibility usage stats at the start of a new interview.
  useEffect(() => { session.resetUsage(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  if (!session.profile) return <Navigate to="/auth" />;

  const q = questions[index];

  return (
    <div className="pa-stack">
      <QuestionCard question={q} index={index} total={questions.length} />
      <AnswerInput
        key={q.id}
        onSubmit={() => navigate({ to: "/feedback", search: { i: index } })}
      />
      <div className="pa-row" style={{ justifyContent: "space-between" }}>
        <button type="button" className="pa-btn secondary" onClick={() => navigate({ to: "/dashboard" })}>
          ← Back to dashboard
        </button>
        <button type="button" className="pa-btn ghost" onClick={() => setIndex((i) => Math.min(i + 1, questions.length - 1))}>
          Skip question →
        </button>
      </div>
    </div>
  );
}
