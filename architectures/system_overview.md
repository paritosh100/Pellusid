# Pellucid Insights - System Architecture

This document outlines the high-level architecture, data flows, and database schema for Pellucid Insights, a web application that generates personalized insights using AI.

## 1. High-Level Architecture

The application is built on **Next.js 14**, utilizing **Supabase** for backend services (Auth & Database) and **OpenAI/ADK** for intelligence generation.

```mermaid
graph TD
    User[User Device]
    subgraph Frontend [Next.js Client]
        Landing[Landing Page / App]
        AuthUI[Auth Pages (Login/Signup)]
    end
    
    subgraph Backend [Next.js API Routes]
        GenAPI[POST /api/generate-reading]
        PromptAPI[POST /api/answer-prompt]
        FeedbackAPI[POST /api/feedback]
    end
    
    subgraph Services
        SupabaseAuth[Supabase Auth]
        SupabaseDB[(Supabase Database)]
        OpenAI[OpenAI / ADK LLM]
    end

    User --> Landing
    User --> AuthUI
    
    AuthUI -->|OAuth/Email| SupabaseAuth
    Landing -->|Fetch Profile| SupabaseDB
    
    Landing -->|Submit Form| GenAPI
    GenAPI -->|Generate| OpenAI
    GenAPI -->|Save Result| SupabaseDB
    
    Landing -->|Journaling| PromptAPI
    PromptAPI -->|Refine/Answer| OpenAI
```

## 2. Authentication Flow (Google OAuth)

This sequence diagram details the login process, specifically how the application handles Google OAuth, callbacks, and session persistence across Localhost and Production.

```mermaid
sequenceDiagram
    participant U as User
    participant UI as Login Page (Client)
    participant SB as Supabase Auth
    participant Google as Google OAuth
    participant CB as /auth/callback (Server)
    participant DB as Database

    U->>UI: Clicks "Continue with Google"
    UI->>SB: signInWithOAuth(provider: 'google')
    SB->>Google: Redirect to Google
    U->>Google: Grants Permissions
    Google->>SB: Redirects with Code
    SB->>CB: Redirects to Callback URL params (Code)
    
    CB->>SB: exchangeCodeForSession(code)
    SB-->>CB: Returns Session (Access/Refresh Tokens)
    CB->>U: Sets Cookies & Redirects to Home (/)
    
    U->>UI: Lands on Home Page
    UI->>SB: Check Session (Middleware/Client)
    SB-->>UI: Authenticated User
    
    UI->>DB: Fetch Latest Reading (useEffect)
    DB-->>UI: Return User Data (Name, Birth Info)
    UI->>UI: Pre-fill Form
```

## 3. Reading Generation Workflow

The core feature of the app is generating etheric insights based on user input.

```mermaid
sequenceDiagram
    participant U as User
    participant API as /api/generate-reading
    participant LLM as OpenAI / ADK
    participant DB as Database

    U->>API: POST { name, birthDate, birthTime, city }
    
    Note over API: 1. Authenticate Request<br/>2. Validate Input (Zod)
    
    API->>LLM: Send Prompt + Inputs
    LLM-->>API: Return JSON Reading<br/>(Headline, Theme, Strengths...)
    
    API->>DB: INSERT into 'readings' table
    DB-->>API: Return reading_id
    
    API-->>U: Return { readingId: "uuid" }
    
    U->>U: Display "Reading Ready" Animation
```

## 4. Data Model

The application primarily relies on the `readings` table to store user inputs and generated content.

```mermaid
erDiagram
    users ||--o{ readings : "has many"
    
    users {
        uuid id PK
        string email
        timestamp created_at
    }

    readings {
        uuid id PK
        uuid reading_id "Public ID"
        uuid user_id FK "Nullable (Anonymous users)"
        text name
        date birth_date
        time birth_time
        text birth_city
        text focus_area
        text headline
        text core_theme
        jsonb strengths
        jsonb watch_outs
        text next_7_days
        text journal_prompt
        text disclaimer
        timestamp created_at
    }
```

## 5. Deployment Architecture (Vercel)

```mermaid
graph LR
    Dev[Developer] -->|Push| GitHub
    GitHub -->|Trigger| Vercel[Vercel Deployment]
    
    subgraph VercelRuntime
        Build[Build Process]
        Edge[Edge Network]
        Serverless[Serverless Functions / APIs]
    end
    
    Vercel --> Build
    Build --> Edge
    Edge --> Serverless
    
    Serverless --> Supabase[(Supabase)]
```

This architecture ensures scalability, secure authentication, and a separation of concerns between the client-side presentation and server-side intelligence generation.
