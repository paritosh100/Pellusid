"""
Storage layer — ported from lib/storage.ts
Mirrors every function exactly: same names, same logic, same Supabase tables.
Uses supabase-py instead of the JS client.
"""

import uuid
import logging
from typing import Optional
from supabase import create_client, Client
from config.settings import settings
from schemas.reading import (
    UserInput, ReadingResponse, StealthReadingResponse,
    StoredReading, StealthStoredReading
)

logger = logging.getLogger(__name__)


def get_supabase() -> Client:
    """Get Supabase client using service role key for server-side operations."""
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


async def track_analytics_event(
    event_type: str,
    reading_id: str,
    user_id: Optional[str] = None,
    metadata: Optional[dict] = None,
) -> None:
    """Mirror of trackAnalyticsEvent from supabase/analytics.ts"""
    try:
        supabase = get_supabase()
        supabase.table("analytics_events").insert({
            "event_type": event_type,
            "reading_id": reading_id,
            "user_id": user_id,
            "metadata": metadata or {},
        }).execute()
    except Exception as e:
        # Analytics should never break the main flow
        logger.warning(f"[Analytics] Failed to track event {event_type}: {e}")


# ── Normal readings ───────────────────────────────────────────────────────────

async def save_reading(
    inputs: UserInput,
    reading: ReadingResponse,
    user_id: Optional[str] = None,
) -> str:
    """Port of saveReading() from storage.ts"""
    reading_id = str(uuid.uuid4())
    supabase = get_supabase()

    result = supabase.table("readings").insert({
        "reading_id": reading_id,
        "user_id": user_id,
        "name": inputs.name,
        "birth_date": inputs.birthDate,
        "birth_time": inputs.birthTime,
        "birth_city": inputs.birthCity,
        "focus_area": inputs.focusArea,
        "headline": reading.headline,
        "core_theme": reading.coreTheme,
        "strengths": reading.strengths,
        "watch_outs": reading.frictions,
        "next_7_days": reading.next7Days,
        "journal_prompt": reading.journalPrompt,
        "disclaimer": reading.disclaimer,
    }).execute()

    if result.data:
        db_id = result.data[0].get("id")
        if db_id:
            await track_analytics_event(
                event_type="reading_generated",
                reading_id=db_id,
                user_id=user_id,
                metadata={
                    "hasFocusArea": bool(inputs.focusArea),
                    "hasBirthTime": bool(inputs.birthTime),
                },
            )

    logger.info(f"[Storage] Saved reading: {reading_id}")
    return reading_id


async def get_reading(reading_id: str) -> Optional[StoredReading]:
    """Port of getReading() from storage.ts"""
    logger.info(f"[Storage] Retrieving reading: {reading_id}")
    supabase = get_supabase()

    result = supabase.table("readings") \
        .select("*") \
        .eq("reading_id", reading_id) \
        .single() \
        .execute()

    if not result.data:
        logger.info(f"[Storage] Reading not found: {reading_id}")
        return None

    data = result.data

    stored = StoredReading(
        readingId=data["reading_id"],
        inputs=UserInput(
            name=data["name"],
            birthDate=data["birth_date"],
            birthTime=data.get("birth_time"),
            birthCity=data["birth_city"],
            focusArea=data.get("focus_area"),
        ),
        reading=ReadingResponse(
            headline=data["headline"],
            coreTheme=data["core_theme"],
            strengths=data["strengths"],
            frictions=data["watch_outs"],
            next7Days=data["next_7_days"],
            journalPrompt=data["journal_prompt"],
            disclaimer=data["disclaimer"],
        ),
        timestamp=int(data["created_at"].timestamp() * 1000) if data.get("created_at") else 0,
    )

    await track_analytics_event(
        event_type="reading_viewed",
        reading_id=data["id"],
        user_id=data.get("user_id"),
    )

    return stored


async def get_user_readings(user_id: str) -> list[StoredReading]:
    """Port of getUserReadings() from storage.ts"""
    supabase = get_supabase()

    result = supabase.table("readings") \
        .select("*") \
        .eq("user_id", user_id) \
        .order("created_at", desc=True) \
        .execute()

    if not result.data:
        return []

    readings = []
    for record in result.data:
        readings.append(StoredReading(
            readingId=record["reading_id"],
            inputs=UserInput(
                name=record["name"],
                birthDate=record["birth_date"],
                birthTime=record.get("birth_time"),
                birthCity=record["birth_city"],
                focusArea=record.get("focus_area"),
            ),
            reading=ReadingResponse(
                headline=record["headline"],
                coreTheme=record["core_theme"],
                strengths=record["strengths"],
                frictions=record["watch_outs"],
                next7Days=record["next_7_days"],
                journalPrompt=record["journal_prompt"],
                disclaimer=record["disclaimer"],
            ),
            timestamp=int(record["created_at"].timestamp() * 1000) if record.get("created_at") else 0,
        ))
    return readings


# ── Journal responses ─────────────────────────────────────────────────────────

async def save_journal_response(
    reading_id: str,
    journal_prompt: str,
    accepted: bool,
    answer: Optional[str] = None,
    is_custom: bool = False,
) -> None:
    """Port of saveJournalResponse() from storage.ts"""
    supabase = get_supabase()

    # Get database UUID for this reading_id
    reading_result = supabase.table("readings") \
        .select("id, user_id") \
        .eq("reading_id", reading_id) \
        .single() \
        .execute()

    if not reading_result.data:
        logger.error(f"[Storage] Reading not found for journal response: {reading_id}")
        return

    reading = reading_result.data

    supabase.table("journal_responses").insert({
        "reading_id": reading["id"],
        "journal_prompt": journal_prompt,
        "user_accepted": accepted,
        "generated_answer": answer,
    }).execute()

    await track_analytics_event(
        event_type="prompt_accepted" if accepted else "prompt_rejected",
        reading_id=reading["id"],
        user_id=reading.get("user_id"),
        metadata={"isCustom": is_custom, "questionLength": len(journal_prompt)},
    )


# ── Stealth readings ──────────────────────────────────────────────────────────

async def save_stealth_reading(
    inputs: UserInput,
    reading: StealthReadingResponse,
    user_id: Optional[str] = None,
) -> str:
    """Port of saveStealthReading() from storage.ts"""
    reading_id = str(uuid.uuid4())
    supabase = get_supabase()

    result = supabase.table("stealth_readings").insert({
        "reading_id": reading_id,
        "user_id": user_id,
        "name": inputs.name,
        "birth_date": inputs.birthDate,
        "birth_time": inputs.birthTime,
        "birth_city": inputs.birthCity,
        "focus_area": inputs.focusArea,
        "where_youve_been": reading.whereYouveBeen,
        "where_you_are": reading.whereYouAre,
        "direction": reading.direction,
        "summary": reading.summary.model_dump(),
        "closing_nudge": reading.closingNudge,
    }).execute()

    if result.data:
        db_id = result.data[0].get("id")
        if db_id:
            await track_analytics_event(
                event_type="stealth_reading_generated",
                reading_id=db_id,
                user_id=user_id,
                metadata={
                    "hasFocusArea": bool(inputs.focusArea),
                    "hasBirthTime": bool(inputs.birthTime),
                    "mode": "stealth",
                },
            )

    logger.info(f"[Storage] Saved stealth reading: {reading_id}")
    return reading_id


async def get_stealth_reading(reading_id: str) -> Optional[StealthStoredReading]:
    """Port of getStealthReading() from storage.ts"""
    logger.info(f"[Storage] Retrieving stealth reading: {reading_id}")
    supabase = get_supabase()

    result = supabase.table("stealth_readings") \
        .select("*") \
        .eq("reading_id", reading_id) \
        .single() \
        .execute()

    if not result.data:
        logger.info(f"[Storage] Stealth reading not found: {reading_id}")
        return None

    data = result.data
    from schemas.reading import StealthSummary

    stored = StealthStoredReading(
        readingId=data["reading_id"],
        inputs=UserInput(
            name=data["name"],
            birthDate=data["birth_date"],
            birthTime=data.get("birth_time"),
            birthCity=data["birth_city"],
            focusArea=data.get("focus_area"),
            mode="stealth",
        ),
        reading=StealthReadingResponse(
            whereYouveBeen=data["where_youve_been"],
            whereYouAre=data["where_you_are"],
            direction=data["direction"],
            summary=StealthSummary(**data["summary"]),
            closingNudge=data["closing_nudge"],
        ),
        timestamp=int(data["created_at"].timestamp() * 1000) if data.get("created_at") else 0,
        mode="stealth",
    )

    await track_analytics_event(
        event_type="stealth_reading_viewed",
        reading_id=data["id"],
        user_id=data.get("user_id"),
    )

    return stored


async def get_any_reading(
    reading_id: str,
) -> Optional[StoredReading | StealthStoredReading]:
    """Port of getAnyReading() — tries normal first, then stealth."""
    normal = await get_reading(reading_id)
    if normal:
        return normal
    return await get_stealth_reading(reading_id)