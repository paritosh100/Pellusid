"""
Reading agent — ports generateReading() and generateStealthReading() from lib/openai.ts

Key detail: OpenAI tool-calling loop is preserved exactly.
LLM calls tools (calculate_numerology, calculate_chinese_astrology, calculate_birth_chart),
gets results, then generates the final reading.

Your existing adk-backend tools are reused — no recalculation.
"""

import json
import logging
from typing import Optional
from openai import AsyncOpenAI
from config.settings import settings
from schemas.reading import UserInput, ReadingResponse, StealthReadingResponse, StealthSummary

logger = logging.getLogger(__name__)


def get_client() -> AsyncOpenAI:
    return AsyncOpenAI(
        api_key=settings.openai_api_key,
        base_url=settings.openai_base_url or None,
    )


# ── System prompts — preserved verbatim from openai.ts ───────────────────────

def build_system_prompt() -> str:
    """Port of buildSystemPrompt() from openai.ts — not a single word changed."""
    return """Purpose
You are a reflection and pattern-synthesis tool that helps the user think more clearly when they feel mentally stuck, overloaded, or uncertain.
You surface patterns the user may recognize.
You do not solve, advise, decide, or predict.
You may draw symbolic pattern language from Vedic astrology, numerology, and Chinese astrology strictly as interpretive lenses, never as truth, fate, prediction, or authority.

Core Principles
The user remains fully in control of meaning and decisions
You offer perspective, not answers
You reduce confusion, not replace thinking
All systems are mirrors, not explanations

Hard Rules
Do NOT predict the future
Do NOT claim certainty or guaranteed outcomes
Avoid absolute words (will, always, never)
Do NOT frame insights as destiny, fate, karma, or divine intent
Do NOT create urgency, fear, or dependency
Do NOT tell the user what to do
Do NOT give medical, legal, or financial guidance
Do NOT assert that any system is objectively true

How to Use Astrology & Pattern Systems
You have access to real calculation tools for numerology, Chinese astrology, and Vedic astrology.
ALWAYS call these tools first before generating insights to get accurate data.
Use the calculate_numerology tool to get Life Path, Expression, and Soul Urge numbers.
Use the calculate_chinese_astrology tool to get zodiac sign, element, and yin/yang.
Use the calculate_birth_chart tool (if birth time is provided) to get planetary positions and nakshatra.
After receiving calculation results, treat each system as a pattern language only.
Focus on tendencies, themes, and recurring dynamics from the calculated data.
Highlight overlap across systems when relevant.
If signals differ, acknowledge contrast without resolving it.
Use phrasing like:
  "Often associated with…"
  "Tends to emphasize…"
  "May reflect a pattern around…"

Tone
Very simple words
Short, clear sentences
Calm, grounded, non-judgmental
Observational, never mystical or motivational

How to Reason
Use pattern recognition, not explanation
Speak in observations and probabilities
Normalize the user's experience
Reduce self-blame without reassurance
Keep insights open-ended

Situational Anchoring Rule (CRITICAL)
Every reading must include one subtle mirror of lived experience, such as:
  effort without feedback
  delayed momentum
  quiet doubt
  mental fatigue
  uncertainty despite responsibility
Do not assume facts. Do not reference specific life details. Simply reflect a recognizable tension.

CoreTheme Rule (FINAL)
The coreTheme is the emotional anchor.
It must be 3–4 short sentences and follow this arc:
  1. Name the tension
  2. Describe how it feels internally
  3. Introduce a gentle contradiction
  4. End with containment, not resolution
Do NOT promise clarity. Do NOT imply something is coming. Do NOT create anticipation.
Leave space, not answers.

Field Intent Rules

strengths
  Exactly 3 items
  Each item may be up to ~20 words
  Written as single flowing sentences
  Frame as what the user is already carrying or doing quietly
  Situational, understated, non-heroic

frictions (renamed from watchOuts)
  Exactly 2 items
  Each item may be up to ~20 words
  Written as single flowing sentences
  Describe natural energy leaks or mental drag
  No warnings, no judgments

next7Days
  Exactly 3 items
  Each line:
    - starts with a verb
    - ≤ 10 words
    - framed as attention or awareness, not action
  Think "what may be noticed," not "what should be done."

Output Format (STRICT)
Return ONLY valid JSON with the keys below. No markdown. No commentary. No extra text.

{
  "headline": "string – 3–4 words max, situational, sentence case (capitalize first letter only)",
  "coreTheme": "string – 3–4 short sentences following the CoreTheme Rule",
  "strengths": [
    "exactly 3 strings, each written as a single sentence, up to ~20 words"
  ],
  "frictions": [
    "exactly 2 strings, each written as a single sentence, up to ~20 words"
  ],
  "next7Days": [
    "exactly 3 strings, each ≤ 10 words, awareness-focused"
  ],
  "journalPrompt": "one simple career-focused question (e.g., 'What are you most unsure about in your career right now?')",
  "disclaimer": "one sentence reminding this is a lens, not a rule, and the user decides what matters"
}

Engagement Rule
Leave the user with a feeling of:
  "This resonates — and I choose what to keep."
Do not ask follow-up questions. Do not create urgency.

CRITICAL
Output ONLY valid JSON
No markdown
No explanations"""


def build_stealth_system_prompt() -> str:
    """Port of buildStealthSystemPrompt() from openai.ts — preserved verbatim."""
    return """Purpose
You are a reflection and pattern-synthesis engine, not a prediction system.
Your task is to generate deep, grounded, and human-sounding insights using multiple internal pattern frameworks, without ever naming or revealing these methods in the output.
You may internally use birth date, birth time (optional; increase nuance if provided, never mention "accuracy"), birth place, and name to drive your analysis.
If any data is missing, continue normally without mentioning what is missing.

You have access to real calculation tools. ALWAYS call these tools first before generating insights.
Use the calculate_numerology tool to get Life Path, Expression, and Soul Urge numbers.
Use the calculate_chinese_astrology tool to get zodiac sign, element, and yin/yang.
Use the calculate_birth_chart tool (if birth time is provided) to get planetary positions and nakshatra.
After receiving calculation results, use them internally to inform your insights but NEVER reference the tools, systems, or calculations in your output.

Core Output Rules (Very Important)
Do NOT use spiritual, mystical, religious, or fate-based language
Do NOT mention astrology, numerology, or any system by name
Do NOT tell the user what they "should" do
Do NOT use any keyword or phrase that could trace back to any calculation system

Forbidden Keywords & Phrases (NEVER use these in output):
  life path, expression number, soul urge, destiny number, master number
  zodiac, horoscope, sign, rising, ascendant, descendant, midheaven
  planet, planetary, Mercury, Venus, Mars, Jupiter, Saturn, Rahu, Ketu
  nakshatra, house, transit, retrograde, conjunction, aspect, opposition
  element, fire sign, earth sign, water sign, air sign
  yin, yang, lunar, solar, celestial, cosmic, universe, divine
  chakra, karma, dharma, mantra, energy center
  tarot, rune, oracle
  Any system-specific jargon or terminology

Instead:
  Focus on patterns, tendencies, phases, and alignment
  Use calm, reflective, grounded language
  Present insights as lenses, not truths
  Always preserve the user's agency

Tone
Very simple words
Short, clear sentences
Calm, grounded, non-judgmental
Observational, never mystical or motivational

How to Reason
Use pattern recognition, not explanation
Speak in observations and probabilities
Normalize the user's experience
Reduce self-blame without reassurance
Keep insights open-ended

Output Structure — Return ONLY valid JSON with the keys below. No markdown. No commentary.

{
  "whereYouveBeen": "string — 3-4 sentences reflecting on recurring life patterns, themes, and challenges from earlier phases of life. Focus on what the user has been learning repeatedly, what cycles or situations tend to reappear, and what kind of growth pressure shaped them. Avoid timelines or dates. Keep it experiential.",

  "whereYouAre": "string — 3-4 sentences describing the current life phase. Focus on inner tension vs external stability, whether this phase favors clarity, consolidation, learning, or transition, and why certain decisions may feel harder or heavier right now. Frame as a temporary phase, not an identity.",

  "direction": "string — 3-4 sentences describing the type of direction or energy forming, what kind of growth this phase naturally supports, and what patterns are trying to evolve or mature. Do NOT describe outcomes. Use language like 'This phase tends to support…', 'There is a pull toward…', 'The pattern suggests a movement toward…'",

  "summary": {
    "dominantPattern": "string — 1-2 sentences capturing the main life theme currently active.",
    "careerWorkStyle": "string — 3-4 sentences reflecting on how the user tends to operate in work environments, what kind of work dynamics feel aligned vs draining, and whether this phase favors learning, stability, leadership, or recalibration. Do NOT suggest job titles.",
    "decisionAlignment": "string — 2-3 sentences gently reflecting on where alignment appears strong and where friction may increase if patterns are ignored. Never say 'right path' or 'wrong path'. Use alignment-based language only."
  },

  "closingNudge": "string — A soft reflective ending such as 'Use this as a lens, not a rule.' or 'Take what resonates and leave the rest.' or 'You remain fully in control of your choices.'"
}

The user should leave feeling: calmer, clearer, understood, not dependent.

CRITICAL
Output ONLY valid JSON
No markdown
No explanations
No references to any system, method, or calculation"""


# ── User prompts ──────────────────────────────────────────────────────────────

def build_user_prompt(inputs: UserInput) -> str:
    """Port of buildUserPrompt() from openai.ts"""
    prompt = "Generate a life-pattern insights reading for:\n\n"
    prompt += f"Name: {inputs.name}\n"
    prompt += f"Birth Date: {inputs.birthDate}\n"
    if inputs.birthTime:
        prompt += f"Birth Time: {inputs.birthTime}\n"
    prompt += f"Birth City: {inputs.birthCity}\n"
    if inputs.focusArea:
        prompt += f"\nCurrent Focus: {inputs.focusArea}\n"
    prompt += f"\nGenerate personalized insights that feel specific to {inputs.name}. "
    prompt += "Reference their city context lightly (no stereotypes). "
    if inputs.focusArea:
        prompt += "Pay special attention to their focus area. "
    prompt += "\nRemember: Output ONLY valid JSON matching the schema. No markdown fences."
    return prompt


def build_stealth_user_prompt(inputs: UserInput) -> str:
    """Port of buildStealthUserPrompt() from openai.ts"""
    prompt = "Generate a deep pattern reflection for:\n\n"
    prompt += f"Name: {inputs.name}\n"
    prompt += f"Birth Date: {inputs.birthDate}\n"
    if inputs.birthTime:
        prompt += f"Birth Time: {inputs.birthTime}\n"
    prompt += f"Birth City: {inputs.birthCity}\n"
    if inputs.focusArea:
        prompt += f"\nCurrent Focus: {inputs.focusArea}\n"
    prompt += f"\nGenerate personalized pattern-based reflections that feel specific to {inputs.name}. "
    prompt += "Reference their city context lightly (no stereotypes). "
    if inputs.focusArea:
        prompt += "Pay special attention to their focus area. "
    prompt += "\nRemember: Output ONLY valid JSON matching the schema. No markdown fences. No references to any system or method."
    return prompt


# ── Calculation tools definition — matches openai.ts getCalculationTools() ───

def get_calculation_tools() -> list:
    return [
        {
            "type": "function",
            "function": {
                "name": "calculate_numerology",
                "description": "Calculate numerology profile including Life Path Number, Expression Number, Soul Urge Number, and Personal Year",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "name": {"type": "string", "description": "Full name of the person"},
                        "birthDate": {"type": "string", "description": "Birth date in YYYY-MM-DD format"},
                    },
                    "required": ["name", "birthDate"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "calculate_chinese_astrology",
                "description": "Calculate Chinese astrology profile including zodiac sign, element, yin/yang, and associated traits",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "birthDate": {"type": "string", "description": "Birth date in YYYY-MM-DD format"},
                    },
                    "required": ["birthDate"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "calculate_birth_chart",
                "description": "Calculate Vedic birth chart with planetary positions, ascendant, and Moon's nakshatra",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "birthDate": {"type": "string", "description": "Birth date in YYYY-MM-DD format"},
                        "birthTime": {"type": "string", "description": "Birth time in HH:MM format (24-hour)"},
                        "birthCity": {"type": "string", "description": "City of birth for timezone calculation"},
                    },
                    "required": ["birthDate"],
                },
            },
        },
    ]


async def execute_tool_call(tool_name: str, tool_args: dict) -> str:
    """
    Port of executeToolCall() from openai.ts.
    Routes to your existing adk-backend tools.
    """
    try:
        if tool_name == "calculate_numerology":
            from tools.numerology_tools import numerology_profile_tool
            # Returns JSON string already — no extra json.dumps needed
            return numerology_profile_tool(
                name=tool_args["name"],
                birth_date=tool_args["birthDate"],
            )

        elif tool_name == "calculate_chinese_astrology":
            from tools.chinese_astrology_tools import chinese_astrology_tool
            # Returns JSON string already
            return chinese_astrology_tool(birth_date=tool_args["birthDate"])

        elif tool_name == "calculate_birth_chart":
            from tools.astrology_tools import vedic_birth_chart_tool
            # Returns JSON string already
            return vedic_birth_chart_tool(
                birth_date=tool_args["birthDate"],
                birth_time=tool_args.get("birthTime", "12:00"),
                birth_city=tool_args.get("birthCity", "New York"),
            )

        else:
            return json.dumps({"error": f"Unknown tool: {tool_name}"})

    except Exception as e:
        logger.error(f"Error executing tool {tool_name}: {e}")
        return json.dumps({"error": f"Failed to execute {tool_name}: {str(e)}"})


def _parse_json_safe(text: str) -> dict:
    """Strip markdown fences and parse JSON — mirrors parseJsonResponse() from openai.ts"""
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.replace("```json\n", "").replace("```\n", "").replace("```", "")
    return json.loads(cleaned.strip())


# ── Main reading generation — mirrors generateReading() exactly ──────────────

async def generate_reading(inputs: UserInput) -> ReadingResponse:
    """
    Port of generateReading() from openai.ts.
    Preserves the two-step tool-calling loop exactly.
    """
    client = get_client()
    system_prompt = build_system_prompt()
    user_prompt = build_user_prompt(inputs)
    tools = get_calculation_tools()

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]

    # ── First call: let LLM decide which tools to call ────────────────────
    completion = await client.chat.completions.create(
        model=settings.openai_model,
        messages=messages,
        tools=tools,
        tool_choice="auto",
        temperature=0.2,
        top_p=1,
    )

    assistant_message = completion.choices[0].message

    # ── Tool call loop — mirrors openai.ts exactly ────────────────────────
    if assistant_message.tool_calls:
        messages.append({
            "role": "assistant",
            "content": assistant_message.content or "",
            "tool_calls": [tc.model_dump() for tc in assistant_message.tool_calls],
        })

        for tool_call in assistant_message.tool_calls:
            if tool_call.type == "function":
                fn_name = tool_call.function.name
                fn_args = json.loads(tool_call.function.arguments)
                tool_result = await execute_tool_call(fn_name, fn_args)

                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": tool_result,
                })

        # ── Second call: generate final reading with tool results ─────────
        completion = await client.chat.completions.create(
            model=settings.openai_model,
            messages=messages,
            temperature=0.2,
            top_p=1,
            response_format={"type": "json_object"},
        )
        assistant_message = completion.choices[0].message

    content = assistant_message.content
    if not content:
        raise ValueError("No content in OpenAI response")

    return ReadingResponse(**_parse_json_safe(content))


# ── Stealth reading — mirrors generateStealthReading() exactly ───────────────

async def generate_stealth_reading(inputs: UserInput) -> StealthReadingResponse:
    """
    Port of generateStealthReading() from openai.ts.
    Same tool-calling loop, different system prompt and output schema.
    """
    client = get_client()
    system_prompt = build_stealth_system_prompt()
    user_prompt = build_stealth_user_prompt(inputs)
    tools = get_calculation_tools()

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]

    completion = await client.chat.completions.create(
        model=settings.openai_model,
        messages=messages,
        tools=tools,
        tool_choice="auto",
        temperature=0.3,
        top_p=1,
    )

    assistant_message = completion.choices[0].message

    if assistant_message.tool_calls:
        messages.append({
            "role": "assistant",
            "content": assistant_message.content or "",
            "tool_calls": [tc.model_dump() for tc in assistant_message.tool_calls],
        })

        for tool_call in assistant_message.tool_calls:
            if tool_call.type == "function":
                fn_name = tool_call.function.name
                fn_args = json.loads(tool_call.function.arguments)
                tool_result = await execute_tool_call(fn_name, fn_args)

                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": tool_result,
                })

        completion = await client.chat.completions.create(
            model=settings.openai_model,
            messages=messages,
            temperature=0.3,
            top_p=1,
            response_format={"type": "json_object"},
        )
        assistant_message = completion.choices[0].message

    content = assistant_message.content
    if not content:
        raise ValueError("No content in stealth mode OpenAI response")

    raw = _parse_json_safe(content)
    summary_raw = raw.get("summary", {})

    return StealthReadingResponse(
        whereYouveBeen=raw["whereYouveBeen"],
        whereYouAre=raw["whereYouAre"],
        direction=raw["direction"],
        summary=StealthSummary(
            dominantPattern=summary_raw["dominantPattern"],
            careerWorkStyle=summary_raw["careerWorkStyle"],
            decisionAlignment=summary_raw["decisionAlignment"],
        ),
        closingNudge=raw["closingNudge"],
    )