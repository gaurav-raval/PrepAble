// Mock data for PrepAble - centralized so no component hardcodes values.

export type Category = "HR" | "Technical" | "Behavioral" | "Situational";
export type Difficulty = "Easy" | "Medium" | "Hard";

export interface Question {
  id: string;
  category: Category;
  difficulty: Difficulty;
  text: string;
  simplified: string;
}

export const categories: { key: Category; title: string; description: string }[] = [
  { key: "HR", title: "HR Questions", description: "General interview questions about you and your fit." },
  { key: "Technical", title: "Technical Questions", description: "Role-specific technical and problem solving." },
  { key: "Behavioral", title: "Behavioral Questions", description: "Past experiences using the STAR method." },
  { key: "Situational", title: "Situational Questions", description: "Hypothetical scenarios and decision making." },
];

export const questions: Question[] = [
  {
    id: "q1",
    category: "Behavioral",
    difficulty: "Medium",
    text: "Describe a situation in which you demonstrated leadership.",
    simplified: "Tell me about a time when you led a team or helped people finish a task.",
  },
  {
    id: "q2",
    category: "Behavioral",
    difficulty: "Medium",
    text: "Tell me about a time you resolved a conflict within your team.",
    simplified: "Share a story about helping two teammates stop disagreeing.",
  },
  {
    id: "q3",
    category: "HR",
    difficulty: "Easy",
    text: "What motivates you to perform well in a challenging environment?",
    simplified: "What keeps you going when work is hard?",
  },
  {
    id: "q4",
    category: "Situational",
    difficulty: "Hard",
    text: "How would you handle a tight deadline with limited resources?",
    simplified: "If you had very little time and few tools, how would you finish the job?",
  },
  {
    id: "q5",
    category: "Technical",
    difficulty: "Medium",
    text: "Explain a technical project you are most proud of and your role in it.",
    simplified: "Pick a tech project you liked. Say what you built and what you did.",
  },
];

export interface Feedback {
  scores: {
    relevance: number;
    clarity: number;
    professionalism: number;
    starStructure: number;
    overall: number; // /100
  };
  star: { Situation: boolean; Task: boolean; Action: boolean; Result: boolean };
  strengths: string[];
  improvements: string[];
  recruiter: { strength: string; concern: string };
  improvedAnswer: string;
}

export const mockFeedback: Feedback = {
  scores: { relevance: 8, clarity: 7, professionalism: 9, starStructure: 6, overall: 80 },
  star: { Situation: true, Task: true, Action: true, Result: false },
  strengths: [
    "Clear explanation of the project context",
    "Confident tone and steady pacing",
    "Relevant, role-appropriate example",
  ],
  improvements: [
    "Add measurable results (numbers, %, timeframe)",
    "Close with the STAR 'Result' step",
    "Mention business or user impact",
  ],
  recruiter: {
    strength: "Strong ownership of the project — you clearly drove the outcome.",
    concern: "The answer stopped before the measurable result. Recruiters look for impact.",
  },
  improvedAnswer:
    "In my final year, our team was building a campus event app (Situation). I was the lead on the notifications system (Task). I designed the schema, wired the push service, and wrote a fallback for offline devices (Action). As a result, notifications reached 92% of users within 30 seconds, and app engagement grew by 40% over the semester (Result).",
};

export interface Report {
  overall: number;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
}

export const mockReport: Report = {
  overall: 82,
  strengths: ["Communication", "Project explanation", "Consistent pacing"],
  improvements: ["Confidence in openings", "Closing with results", "Using STAR fully"],
  recommendations: [
    "Practice STAR responses for behavioral interviews.",
    "Record yourself and review pacing and clarity.",
    "Prepare 2–3 measurable outcomes for each project story.",
  ],
};

export const experienceOptions = ["Fresher", "1–3 Years", "3–5 Years", "5+ Years"] as const;
export type Experience = (typeof experienceOptions)[number];

// ---------- Resume mock ----------
export interface ResumeInsights {
  name: string;
  headline: string;
  skills: string[];
  projects: { title: string; description: string }[];
  education: string[];
  certifications: string[];
}

export const mockResumeInsights: ResumeInsights = {
  name: "Alex Rivera",
  headline: "Aspiring Frontend Developer · Final-year CS student",
  skills: ["JavaScript", "React", "TypeScript", "Python", "SQL", "Tailwind CSS", "Git", "REST APIs"],
  projects: [
    { title: "Campus Events App", description: "React + Node app used by 1,200 students to browse and RSVP to events." },
    { title: "Accessible Chart Library", description: "Open-source charts with screen-reader and keyboard support." },
    { title: "AI Study Buddy", description: "Chat interface over course notes with citations and summarisation." },
  ],
  education: ["B.Sc. Computer Science — State University (2022–2026)"],
  certifications: ["Meta Front-End Developer Certificate", "IBM Python for Data Science"],
};

export const resumeQuestionTypes = [
  "HR",
  "Technical",
  "Project-Based",
  "Behavioral",
  "Resume Follow-Up",
  "Role Fit",
] as const;
export type ResumeQuestionType = (typeof resumeQuestionTypes)[number];
