"""
Orchestrator agent - coordinates the multi-agent workflow
"""
import asyncio
from typing import Dict
from agents.specialized_agents import (
    run_vedic_analysis,
    run_numerology_analysis,
    run_chinese_analysis,
    run_synthesis,
    run_refinement,
    run_validation
)


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
    
    # Wait for all specialized agents to complete
    vedic_result, numerology_result, chinese_result = await asyncio.gather(
        vedic_task,
        numerology_task,
        chinese_task
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
    
    # Phase 2: Synthesize insights
    print("\n🧩 Phase 2: Synthesizing cross-system patterns...")
    synthesis_result = await run_synthesis(
        vedic_result,
        numerology_result,
        chinese_result,
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
    
    # Phase 3: Refine into final format (with potential loop)
    max_refinement_attempts = 2
    refined_result = None
    
    for attempt in range(max_refinement_attempts):
        print(f"\n✨ Phase 3: Refining response (attempt {attempt + 1}/{max_refinement_attempts})...")
        
        refined_result = await run_refinement(synthesis_result, user_data)
        
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
        "systems_analyzed": ["vedic", "numerology", "chinese"],
        "model_used": "gemini-2.0-flash-exp",
        "workflow": "multi-agent-synthesis"
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

Clear, calm, grounded

Intelligent but simple

Personal, not generic

Confident but non-authoritative

Feels like “this explains something I couldn’t name”

Closing Nudge (important)

End with a soft prompt that invites the user to go deeper, such as:

“If you want, you can explore what feels most misaligned right now.”

“You may notice this pattern showing up in more than one decision.”

“You can ask about a specific choice if that feels useful.”

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
