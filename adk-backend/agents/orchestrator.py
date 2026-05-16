"""
Orchestrator agent - coordinates the multi-agent workflow
"""
import asyncio
from typing import Dict
from agents.specialized_agents import (
    run_vedic_analysis,
    run_numerology_analysis,
    run_chinese_analysis,
    run_lunar_analysis,
    run_tarot_analysis,
    run_ayurveda_analysis,
    run_synthesis,
    run_refinement,
    run_validation
)
from agents.fusion_agent import run_fusion_analysis


async def run_reading_workflow(user_data: Dict[str, str]) -> Dict:
    """
    Main orchestrator function that coordinates all agents
    
    Args:
        user_data: Dictionary with user birth data
            - name: str
            - birthDate: str (YYYY-MM-DD)
            - birthTime: str (HH:MM, optional)
            - birthCity: str
            - focusArea: str (optional)
    
    Returns:
        Final reading in Pellucid format
    """
    
    # Phase 1: Run specialized agents in parallel
    print("🔮 Phase 1: Running specialized agents in parallel...")
    vedic_task = run_vedic_analysis(user_data)
    numerology_task = run_numerology_analysis(user_data)
    chinese_task = run_chinese_analysis(user_data)
    lunar_task = run_lunar_analysis(user_data)
    tarot_task = run_tarot_analysis(user_data)
    ayurveda_task = run_ayurveda_analysis(user_data)
    
    # Wait for all specialized agents to complete
    vedic_result, numerology_result, chinese_result, lunar_result, tarot_result, ayurveda_result = await asyncio.gather(
        vedic_task,
        numerology_task,
        chinese_task,
        lunar_task,
        tarot_task,
        ayurveda_task
    )
    
    
    print("✅ Specialized agents completed")
    # Safe printing - handle both dict and list responses
    try:
        if isinstance(vedic_result, dict):
            print(f"  - Vedic: {vedic_result.get('key_themes', [])[:2]}")
        else:
            print(f"  - Vedic: {str(vedic_result)[:50]}...")
    except:
        print(f"  - Vedic: Analysis complete")
    
    try:
        if isinstance(numerology_result, dict):
            print(f"  - Numerology: Life Path {numerology_result.get('life_path_number', 'N/A')}")
        else:
            print(f"  - Numerology: {str(numerology_result)[:50]}...")
    except:
        print(f"  - Numerology: Analysis complete")
    
    try:
        if isinstance(chinese_result, dict):
            print(f"  - Chinese: {chinese_result.get('zodiac_sign', 'N/A')} {chinese_result.get('element', '')}")
        else:
            print(f"  - Chinese: {str(chinese_result)[:50]}...")
    except:
        print(f"  - Chinese: Analysis complete")
        
    try:
        if isinstance(lunar_result, dict):
            print(f"  - Lunar: {lunar_result.get('moon_phase', 'N/A')} {lunar_result.get('moon_sign', '')}")
        else:
            print(f"  - Lunar: {str(lunar_result)[:50]}...")
    except:
        print(f"  - Lunar: Analysis complete")
        
    try:
        if isinstance(tarot_result, dict):
            cards = tarot_result.get('cards_drawn', [])
            print(f"  - Tarot: {', '.join(cards)}")
        else:
            print(f"  - Tarot: {str(tarot_result)[:50]}...")
    except:
        print(f"  - Tarot: Analysis complete")
        
    try:
        if isinstance(ayurveda_result, dict):
            print(f"  - Ayurveda: {ayurveda_result.get('primary_dosha', 'N/A')} dominant")
        else:
            print(f"  - Ayurveda: {str(ayurveda_result)[:50]}...")
    except:
        print(f"  - Ayurveda: Analysis complete")
    
    # Phase 2: Synthesize insights
    print("\n🧩 Phase 2: Synthesizing cross-system patterns...")
    synthesis_result = await run_synthesis(
        vedic_result,
        numerology_result,
        chinese_result,
        lunar_result,
        tarot_result,
        ayurveda_result,
        user_data
    )
    
    print("✅ Synthesis completed")
    try:
        if isinstance(synthesis_result, dict):
            print(f"  - Convergent themes: {synthesis_result.get('convergent_themes', [])[:2]}")
        else:
            print(f"  - Synthesis: {str(synthesis_result)[:50]}...")
    except:
        print(f"  - Synthesis: Complete")
    
    # Phase 2.5: Fusion — rank convergent themes with confidence scores
    print("\n🔬 Phase 2.5: Running cross-system fusion analysis...")
    specialist_outputs = {
        "vedic": vedic_result,
        "numerology": numerology_result,
        "chinese": chinese_result,
        "lunar": lunar_result,
        "tarot": tarot_result,
        "ayurveda": ayurveda_result,
    }
    fusion_result = await run_fusion_analysis(
        specialist_outputs, synthesis_result, user_data
    )
    print("✅ Fusion completed")
    try:
        themes = fusion_result.get("fused_themes", [])
        print(f"  - {len(themes)} fused themes (top: {themes[0]['theme'] if themes else 'N/A'})")
        print(f"  - Cross-system agreement: {fusion_result.get('cross_system_agreement', 'N/A')}")
    except:
        print(f"  - Fusion: Complete")
    
    # Phase 3: Refine into final format (with potential loop)
    max_refinement_attempts = 2
    refined_result = None
    
    for attempt in range(max_refinement_attempts):
        print(f"\n✨ Phase 3: Refining response (attempt {attempt + 1}/{max_refinement_attempts})...")
        
        refined_result = await run_refinement(synthesis_result, user_data, fusion_result=fusion_result)
        
        print("✅ Refinement completed")
        
        # Phase 4: Validate quality
        print("\n🔍 Phase 4: Validating quality...")
        validation_result = await run_validation(refined_result)
        
        if validation_result.get("is_valid", True):
            print("✅ Validation passed!")
            break
        else:
            print(f"⚠️  Validation issues found: {validation_result.get('issues', [])}")
            if attempt < max_refinement_attempts - 1:
                print("🔄 Re-refining...")
            else:
                print("⚠️  Max attempts reached, using current version")
    
    # Add metadata
    refined_result["_metadata"] = {
        "systems_analyzed": ["vedic", "numerology", "chinese", "lunar", "tarot", "ayurveda", "fusion"],
        "model_used": "gemini-2.0-flash",
        "workflow": "multi-agent-synthesis",
        "fusion_themes_count": len(fusion_result.get("fused_themes", [])),
        "cross_system_agreement": fusion_result.get("cross_system_agreement"),
    }
    
    print("\n🎉 Reading generation complete!\n")
    
    return refined_result


async def run_journal_answer_workflow(
    journal_prompt: str,
    user_data: Dict[str, str]
) -> str:
    """
    Generate answer to journal prompt (simplified workflow)
    
    Args:
        journal_prompt: The journal question
        user_data: User context data
    
    Returns:
        Answer text
    """
    from google import genai
    from google.genai import types
    from config.settings import settings
    
    client = genai.Client(api_key=settings.google_api_key)
    
    system_prompt = """Purpose
You are a career pattern–analysis module within a reflection tool.
Your role is to help users gain clarity when they feel uncertain, stuck, or overloaded about their career.

You do not give advice, predictions, or instructions.
You surface patterns, tensions, and signals that help the user think more clearly.

Personal inputs (such as birth date and background context) are used only as abstract pattern signals, not as fate, belief, or authority.

Core Rules

Do NOT predict outcomes or timelines
Do NOT tell the user what to do
Do NOT claim certainty or correctness
Avoid mystical, spiritual, or symbolic language
Avoid technical systems, charts, or named frameworks
Never position yourself as an expert or authority
You are a mirror, not a guide.

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

How to Think (internal)

Look for decision patterns, not answers
Notice friction, hesitation, repetition, and timing themes
Identify what feels misaligned vs unresolved
Focus on why clarity is difficult right now, not what the solution is
Translate all signals into plain, grounded career language.

How to Respond

Write 2–3 short paragraphs:

Recognition
Reflect what the user is likely feeling in their career right now
(uncertainty, pressure, split direction, stalled momentum, etc.)

Pattern Insight
Describe the underlying pattern causing this feeling
Use words like: pattern, signal, tension, tendency, timing
Avoid naming systems or causes

Perspective (not advice)
Offer a way to think about the situation differently
No action steps
No instructions
No reassurance clichés
End by gently opening the door for deeper reflection.

Tone & Style

Very simple words
Short, clear sentences
Calm, grounded, non-judgmental
Observational, never mystical or motivational
Confident but non-authoritative
Feels like "this explains something I couldn't name"

Closing Nudge (important)

End with a soft prompt that invites the user to go deeper, such as:
"If you want, you can explore what feels most misaligned right now."
"You may notice this pattern showing up in more than one decision."
"You can ask about a specific choice if that feels useful."
Never push.
Never imply dependency.
Just leave the door open."""
    
    user_prompt = f"""The user is reflecting on this question:

"{journal_prompt}"

Context about the user:
Name: {user_data.get('name', 'User')}
Birth Date: {user_data.get('birthDate', 'Unknown')}
Birth City: {user_data.get('birthCity', 'Unknown')}
Focus Area: {user_data.get('focusArea', 'General reflection')}

Provide a thoughtful, exploratory answer to help them reflect on this question."""
    
    response = client.models.generate_content(
        model=settings.default_model,
        contents=user_prompt,
        config=types.GenerateContentConfig(
            system_instruction=system_prompt,
            temperature=0.3,
            max_output_tokens=200
        )
    )
    
    return response.text


async def run_stealth_reading_workflow(user_data: Dict[str, str]) -> Dict:
    """
    Generate a stealth reading using Gemini.
    Parallel to the generate_stealth_reading workflow in reading_agent.py,
    but implemented directly in the orchestrator.
    """
    from google import genai
    from google.genai import types
    from config.settings import settings
    import json
    
    # Pre-calculate tools context so Gemini doesn't need to do a multi-turn tool calling loop
    from tools.numerology_tools import numerology_profile_tool
    from tools.chinese_astrology_tools import chinese_astrology_tool
    from tools.astrology_tools import vedic_birth_chart_tool
    
    numerology_data = numerology_profile_tool(
        name=user_data.get("name", ""),
        birth_date=user_data.get("birthDate", "")
    )
    
    chinese_data = chinese_astrology_tool(
        birth_date=user_data.get("birthDate", "")
    )
    
    if user_data.get("birthTime"):
        vedic_data = vedic_birth_chart_tool(
            birth_date=user_data["birthDate"],
            birth_time=user_data["birthTime"],
            birth_city=user_data.get("birthCity", "Unknown")
        )
    else:
        vedic_data = "No birth time provided, skipping detailed Vedic birth chart calculations."
        
    client = genai.Client(api_key=settings.google_api_key)
    
    system_prompt = """Purpose
You are a reflection and pattern-synthesis engine, not a prediction system.
Your task is to generate deep, grounded, and human-sounding insights using multiple internal pattern frameworks, without ever naming or revealing these methods in the output.
You may internally use birth date, birth time (optional; increase nuance if provided, never mention "accuracy"), birth place, and name to drive your analysis.
If any data is missing, continue normally without mentioning what is missing.

You have access to real calculation tools. ALWAYS use the provided calculation data internally to inform your insights but NEVER reference the tools, systems, or calculations in your output.

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

    user_prompt = f"""Generate a deep pattern reflection for:

Name: {user_data.get('name', 'Unknown')}
Birth Date: {user_data.get('birthDate', 'Unknown')}
Birth Time: {user_data.get('birthTime', 'Unknown')}
Birth City: {user_data.get('birthCity', 'Unknown')}
Current Focus: {user_data.get('focusArea', 'General reflection')}

CALCULATED PATTERN DATA (Use internally ONLY, never reference algorithms or names of systems):
{numerology_data}
{chinese_data}
{vedic_data}

Generate personalized pattern-based reflections that feel specific to {user_data.get('name', 'Unknown')}. Reference their city context lightly (no stereotypes). Pay special attention to their focus area. 
Remember: Output ONLY valid JSON matching the schema. No markdown fences. No references to any system or method."""

    response = client.models.generate_content(
        model=settings.default_model,
        contents=user_prompt,
        config=types.GenerateContentConfig(
            system_instruction=system_prompt,
            temperature=0.3,
            response_mime_type="application/json"
        )
    )
    
    try:
        raw = json.loads(response.text)
        return raw
    except json.JSONDecodeError as e:
        # Fallback error structure if parsing fails
        return {
            "error": "Failed to parse stealth reading response",
            "raw": response.text
        }
