import uuid
from datetime import datetime

from services.gemini_client import call_gemini

# In-memory storage for active interview sessions
active_sessions = {}


def get_session(session_id):
    """Return a session by ID."""
    return active_sessions.get(session_id)


def end_session(session_id):
    """Remove a session from memory."""
    return active_sessions.pop(session_id, None)


def build_first_question_prompt(role, experience_level, category):
    return f"""
You are an experienced technical interviewer.

Candidate Role: {role}
Experience Level: {experience_level}
Interview Category: {category or "General"}

Generate ONE professional opening interview question.

Return ONLY the interview question.
"""


def build_followup_prompt(session):
    conversation = ""

    for item in session["conversation"]:
        conversation += f"""
Question: {item['question']}
Answer: {item['answer']}
"""

    return f"""
You are conducting a real interview.

Candidate Role:
{session["role"]}

Experience:
{session["experience_level"]}

Current Topic:
{session["current_topic"]}

Previous Conversation:
{conversation}

Rules:

1. If the last answer deserves deeper discussion and followup_count < 4,
ask ONE follow-up question.

2. Otherwise move to a NEW interview topic.

3. Return ONLY the next interview question.

Do not explain anything.
"""


def start_session(role, experience_level, category_focus=None):
    session_id = str(uuid.uuid4())

    session = {
        "session_id": session_id,
        "role": role,
        "experience_level": experience_level,
        "category_focus": category_focus,
        "current_topic": "Introduction",
        "followup_count": 0,
        "created_at": datetime.utcnow().isoformat(),
        "conversation": []
    }

    prompt = build_first_question_prompt(
        role,
        experience_level,
        category_focus
    )

    first_question = call_gemini(prompt).strip()

    session["conversation"].append({
        "question": first_question,
        "answer": None,
        "topic": "Introduction",
        "is_follow_up": False
    })

    active_sessions[session_id] = session

    return {
        "session_id": session_id,
        "question": first_question,
        "topic": "Introduction"
    }


def generate_next_step(session_id, latest_answer):
    session = get_session(session_id)

    if not session:
        raise ValueError("Session not found.")

    # Save user's answer
    session["conversation"][-1]["answer"] = latest_answer

    prompt = build_followup_prompt(session)

    next_question = call_gemini(prompt).strip()

    # Decide follow-up or new topic
    is_follow_up = session["followup_count"] < 4

    if is_follow_up:
        session["followup_count"] += 1
    else:
        session["followup_count"] = 0
        session["current_topic"] = "Next Topic"

    session["conversation"].append({
        "question": next_question,
        "answer": None,
        "topic": session["current_topic"],
        "is_follow_up": is_follow_up
    })

    return {
        "session_id": session_id,
        "question": next_question,
        "topic": session["current_topic"],
        "is_follow_up": is_follow_up
    }