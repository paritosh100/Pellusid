# Pellucid Insights

A production-ready Next.js application that generates personalized life-pattern insights using OpenAI. This is a reflection and self-guidance tool.

## Features

- ✨ Premium, modern UI with gradient designs
- 🔒 Strict server/client boundaries (OpenAI calls server-side only)
- 🚀 Vercel deployment ready with force-dynamic exports
- 🛡️ Defensive error handling and JSON parsing
- 📝 Type-safe with TypeScript and Zod validation
- 🎨 Beautiful components with shadcn/ui and TailwindCSS
- 🔄 Regenerate readings with same inputs
- 📤 Share readings via URL

## Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS + shadcn/ui
- **AI**: OpenAI API (GPT models)
- **Validation**: Zod
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Installation

1. Clone the repository or navigate to the project directory:

```bash
cd pellucid-insights
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
# Copy the example file
cp .env.local.example .env.local

# Edit .env.local and add your OpenAI API key
```

Required environment variables in `.env.local`:

```env
OPENAI_API_KEY=sk-your-actual-api-key-here
OPENAI_MODEL=gpt-4o-mini  # Optional, defaults to gpt-4o-mini
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
pellucid-insights/
├── app/
│   ├── api/
│   │   └── generate-reading/
│   │       └── route.ts          # API endpoint (server-side only)
│   ├── result/
│   │   └── page.tsx              # Result page (server component)
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page (client component)
│   └── globals.css               # Global styles
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── share-button.tsx          # Share functionality
│   └── regenerate-button.tsx     # Regenerate functionality
├── lib/
│   ├── types.ts                  # TypeScript type definitions
│   ├── storage.ts                # In-memory storage (TODO: migrate to DB)
│   ├── openai.ts                 # OpenAI client and utilities
│   └── utils.ts                  # Utility functions
└── .env.local.example            # Environment variable template
```

## Architecture

### System Overview

Pellucid Insights is a full-stack Next.js application with AI-powered insights generation, user authentication, persistent storage, and comprehensive feedback collection.

```mermaid
graph TB
    subgraph Client["Client (Browser)"]
        UI[User Interface]
        Form[Input Form]
        Results[Results Page]
        Feedback[Feedback Widgets]
    end
    
    subgraph NextJS["Next.js Application"]
        API[API Routes]
        SSR[Server Components]
        
        subgraph APIs["API Endpoints"]
            GenAPI[/api/generate-reading]
            FeedAPI[/api/feedback]
            JournalAPI[/api/answer-prompt]
        end
    end
    
    subgraph External["External Services"]
        OpenAI[OpenAI API<br/>GPT-4o-mini]
        ADK[Google ADK<br/>Gemini 2.0 Flash]
    end
    
    subgraph Database["Supabase (PostgreSQL)"]
        ReadingsDB[(readings)]
        FeedbackDB[(reading_feedback)]
        AnalyticsDB[(analytics_events)]
        JournalDB[(journal_answers)]
    end
    
    UI --> Form
    Form --> GenAPI
    GenAPI --> OpenAI
    GenAPI --> ADK
    GenAPI --> ReadingsDB
    GenAPI --> AnalyticsDB
    
    UI --> Results
    Results --> SSR
    SSR --> ReadingsDB
    
    Feedback --> FeedAPI
    FeedAPI --> FeedbackDB
    FeedAPI --> AnalyticsDB
    
    Results --> JournalAPI
    JournalAPI --> OpenAI
    JournalAPI --> ADK
    JournalAPI --> JournalDB
    
    style Client fill:#e1f5ff
    style NextJS fill:#fff4e1
    style External fill:#ffe1e1
    style Database fill:#e1ffe1
```

### Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS + shadcn/ui
- **AI**: OpenAI API (GPT-4o-mini) + Google ADK (Gemini 2.0 Flash)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Validation**: Zod
- **Deployment**: Vercel

### Server/Client Boundaries

- **Server-only**: All OpenAI/ADK API calls happen in `/app/api/` routes
- **Client components**: Form inputs, interactive buttons, feedback widgets
- **Server components**: Result page rendering, data fetching

### Data Flow

#### Reading Generation
1. User fills form on home page → Client component
2. Form submits to `/api/generate-reading` → Server API route
3. API validates inputs → Calls OpenAI/ADK → Stores in Supabase → Returns `readingId`
4. Client redirects to `/result?rid={readingId}`
5. Server component fetches reading from Supabase → Renders insights

#### Feedback Collection
1. User interacts with section feedback pills (Hit/Useful/Vague/Off)
2. Client sends to `/api/feedback` → Stores in `reading_feedback` table
3. Analytics functions aggregate feedback for insights
4. Overall feedback widget collects 5-star rating + text

### Database Schema

#### Tables

**`readings`**
- Stores generated readings with user inputs and AI-generated insights
- Fields: `id`, `reading_id`, `user_id`, `headline`, `coreTheme`, `strengths`, `frictions`, `next7Days`, `journalPrompt`, etc.

**`reading_feedback`**
- Stores user feedback on readings
- Quick reactions: `resonated`, `too_vague`, `off_base`, `helpful`, `not_helpful`
- Detailed feedback: `rating` (1-5 stars), `feedback_text`
- Section-specific ratings: `section_ratings` (JSONB)

**`analytics_events`**
- Tracks user interactions and events
- Event types: `reading_generated`, `feedback_submitted`, `journal_answered`

**`journal_answers`**
- Stores AI-generated answers to journal prompts
- Links to readings and user inputs

#### Section Feedback Schema

Section ratings are stored as JSONB:
```json
{
  "coreTheme": { "reaction": "hit", "helpful": true },
  "strengths": { "reaction": "useful", "helpful": true },
  "frictions": { "reaction": "vague", "helpful": false },
  "next7Days": { "reaction": "useful", "helpful": true },
  "journalPrompt": { "reaction": "hit", "helpful": true }
}
```

### Feedback System

#### Section-Specific Feedback
- **Sections**: Core Theme, Strengths, Frictions, Next 7 Days, Journal Prompt
- **Reactions**: Hit, Useful, Vague, Off
- **UI**: Inline pill-shaped buttons with colored text and borders
- **Analytics**: Track positive percentage (Hit + Useful) per section

#### Overall Feedback
- **5-star rating** (required)
- **Text feedback** (optional, max 1000 characters)
- **Question**: "What would make this more helpful?"

### Storage

**Production**: Supabase PostgreSQL with Row Level Security (RLS)
- Authenticated users can view their own readings and feedback
- Anonymous users can submit feedback (stored without user_id)
- Automatic timestamp tracking with triggers

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub

2. Import project in Vercel dashboard

3. Add environment variables:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `OPENAI_MODEL`: (Optional) Model to use

4. Deploy!

### Important Deployment Notes

- All dynamic pages include `export const dynamic = "force-dynamic"`
- No static generation assumptions
- Environment variables are validated on server startup
- Graceful error handling for API failures

## Content Guidelines

This application generates insights using the following constraints:

### ✅ Allowed Language
- Patterns, tendencies, cycles, signals, reflection
- Concrete actions and examples
- Personalized references (name, city context)

### ❌ Prohibited Language
- Astrology, zodiac, horoscope, sign, planets, houses
- Absolute claims or predictions
- Medical, legal, or financial advice

## Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Adding shadcn/ui Components

```bash
npx shadcn@latest add [component-name]
```

## API Reference

### POST `/api/generate-reading`

Generate a new life-pattern insights reading.

**Request Body:**

```json
{
  "name": "string (required, max 100 chars)",
  "birthDate": "string (required, YYYY-MM-DD format)",
  "birthTime": "string (optional, HH:mm format)",
  "birthCity": "string (required, max 100 chars)",
  "focusArea": "string (optional, max 200 chars)"
}
```

**Success Response (200):**

```json
{
  "readingId": "uuid-string"
}
```

**Error Response (400/500):**

```json
{
  "error": "Error message",
  "details": "Detailed error information"
}
```

## Troubleshooting

### "OPENAI_API_KEY environment variable is required"

Make sure you've created `.env.local` and added your API key.

### Build errors on Vercel

Ensure all dynamic pages have `export const dynamic = "force-dynamic"`.

### OpenAI API errors

- Check your API key is valid
- Verify you have credits in your OpenAI account
- Check the model name is correct (e.g., `gpt-4o-mini`)

## License

MIT

## Contributing

This is a production application. Contributions should maintain:
- Strict server/client boundaries
- Defensive error handling
- Type safety
- Vercel deployment compatibility
