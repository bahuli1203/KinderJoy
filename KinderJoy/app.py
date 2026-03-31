"""
KinderJoy – Python Flask Backend
Emotion-aware AI response server for children aged 6-14.

Requirements:
    pip install flask flask-cors google-generativeai

Run:
    python app.py
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json

app = Flask(__name__)
CORS(app)  # Allow frontend to call from any origin

# ─────────────────────────────────────────────
#  FALLBACK RESPONSES (used when no AI API key)
# ─────────────────────────────────────────────
FALLBACK_RESPONSES = {
    "happy": {
        "emotion": "Happy",
        "message": "You are absolutely glowing today! ✨ That happy energy is SO contagious! Keep spreading those good vibes — the world needs your smile!",
        "activity": "Let us do a 30-second dance challenge! Move, jump, wiggle — anything goes! Press the Dance button! 🕺"
    },
    "sad": {
        "emotion": "Sad",
        "message": "Hey… it is okay to feel sad sometimes 💙 I am right here with you. You are not alone, and you are doing great just by sharing how you feel.",
        "activity": "Let us play Find 5 Blue Things Around You — go look! It is a sneaky mood-lifter! 🔵"
    },
    "angry": {
        "emotion": "Angry",
        "message": "Wow, that anger is real and totally valid! 💪 Let us release it the fun way — no one gets hurt and it actually feels AMAZING!",
        "activity": "Tap to POP all the balloons before they escape! Let that frustration out safely! 🎈💥"
    },
    "nervous": {
        "emotion": "Nervous",
        "message": "That nervous feeling just means you care 😊 You have absolutely got this! Let us calm your mind together with a simple trick that really works.",
        "activity": "Try the 5-4-3-2-1 Calm Game — name 5 things you see, 4 you feel, 3 you hear… it works like magic! 🌿"
    },
    "tired": {
        "emotion": "Tired",
        "message": "Rest is super important — you are not being lazy, you are recharging your superpowers! 🔋 Let us take a few slow, cozy breaths together.",
        "activity": "Follow the Breathing Circle — breathe in as it grows, breathe out as it shrinks. So peaceful and calming! 🫧"
    },
    "bored": {
        "emotion": "Bored",
        "message": "Boredom is just your brain asking for adventure! 🚀 I have got the perfect silly challenge to shake things up — trust me, it is ridiculous and fun!",
        "activity": "Get a Random Fun Challenge! Act like a robot, speak in slow motion, or something even sillier — let us go! 🤖🎲"
    }
}

# ─────────────────────────────────────────────
#  AI PROMPT TEMPLATE
# ─────────────────────────────────────────────
AI_PROMPT = """You are a friendly emotional support assistant for children aged 6–14.

Your job:
1. Understand the child's emotion: {emotion}
2. Respond in a simple, friendly, encouraging tone.
3. Suggest ONE small activity or game based on their emotion.
4. Keep responses short (2–3 lines max).
5. Never sound like a teacher. Sound like a fun buddy.

Output ONLY valid JSON in this exact format:
{{
  "emotion": "<detected emotion>",
  "message": "<short supportive message, 1-2 sentences>",
  "activity": "<fun activity or mini game idea, 1 sentence>"
}}

The emotion is: {emotion}
"""


def get_ai_response(emotion: str) -> dict:
    """
    Try to get an AI response using Google Gemini.
    Falls back to hardcoded responses if the API key is missing or fails.
    """
    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")

    if not api_key:
        # No API key set — use fallback
        return FALLBACK_RESPONSES.get(emotion, FALLBACK_RESPONSES["bored"])

    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)

        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = AI_PROMPT.format(emotion=emotion)

        response = model.generate_content(prompt)
        text = response.text.strip()

        # Clean up markdown code fences if present
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
            text = text.strip()

        data = json.loads(text)
        return data

    except ImportError:
        print("google-generativeai not installed. Using fallback.")
        return FALLBACK_RESPONSES.get(emotion, FALLBACK_RESPONSES["bored"])
    except Exception as e:
        print(f"AI error: {e}. Using fallback.")
        return FALLBACK_RESPONSES.get(emotion, FALLBACK_RESPONSES["bored"])


# ─────────────────────────────────────────────
#  ROUTES
# ─────────────────────────────────────────────

@app.route("/")
def home():
    return jsonify({
        "app": "KinderJoy",
        "version": "1.0.0",
        "status": "running",
        "message": "KinderJoy backend is alive! 🧠🎮"
    })


@app.route("/api/respond", methods=["POST"])
def respond():
    """
    POST /api/respond
    Body: { "emotion": "happy" | "sad" | "angry" | "nervous" | "tired" | "bored" }
    Returns: { "emotion": "...", "message": "...", "activity": "..." }
    """
    data = request.get_json(silent=True) or {}
    emotion = data.get("emotion", "").lower().strip()

    valid_emotions = ["happy", "sad", "angry", "nervous", "tired", "bored"]

    if emotion not in valid_emotions:
        return jsonify({
            "error": "Invalid emotion. Use one of: " + ", ".join(valid_emotions)
        }), 400

    result = get_ai_response(emotion)

    return jsonify(result)


@app.route("/api/emotions", methods=["GET"])
def list_emotions():
    """GET /api/emotions — lists all supported emotions and their fallback responses."""
    return jsonify({
        "emotions": list(FALLBACK_RESPONSES.keys()),
        "responses": FALLBACK_RESPONSES
    })


@app.route("/api/health", methods=["GET"])
def health():
    """Health check endpoint."""
    api_key_set = bool(
        os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    )
    return jsonify({
        "status": "ok",
        "ai_enabled": api_key_set,
        "mode": "gemini-ai" if api_key_set else "fallback"
    })


# ─────────────────────────────────────────────
#  ENTRY POINT
# ─────────────────────────────────────────────
if __name__ == "__main__":
    print("\n" + "="*50)
    print("  KinderJoy Backend Starting...")
    print("="*50)

    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if api_key:
        print("  [OK] Gemini AI key found -- AI responses enabled!")
    else:
        print("  [!] No GEMINI_API_KEY found -- using fallback responses.")
        print("  Tip: set GEMINI_API_KEY environment variable to enable AI")

    print("  Server: http://localhost:5000")
    print("  API:    http://localhost:5000/api/respond")
    print("="*50 + "\n")


    app.run(debug=True, host="0.0.0.0", port=5000)
