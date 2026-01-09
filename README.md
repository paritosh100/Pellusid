# Pellucid Insights

A production-ready Next.js application that generates personalized life-pattern insights using OpenAI. This is a reflection and self-guidance tool, not astrology or fortune-telling.

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

### Server/Client Boundaries

- **Server-only**: All OpenAI API calls happen in `/app/api/generate-reading/route.ts`
- **Client components**: Form inputs, interactive buttons
- **Server components**: Result page rendering

### Data Flow

1. User fills form on home page → Client component
2. Form submits to `/api/generate-reading` → Server API route
3. API validates inputs → Calls OpenAI → Stores result → Returns `readingId`
4. Client redirects to `/result?rid={readingId}`
5. Server component fetches reading → Renders insights

### Storage

Currently uses in-memory Map for demo purposes. For production:

**TODO**: Migrate to persistent database (Supabase, Redis, or PostgreSQL)

See `lib/storage.ts` for implementation details.

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
