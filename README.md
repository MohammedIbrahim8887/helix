# Helix - AI-Powered Image Caption Generator

Helix is a modern web application that leverages artificial intelligence to generate creative and contextual captions for your images. With support for 6 different tonal variations, Helix helps you craft the perfect caption for any context.

## Features

- **AI-Powered Caption Generation**: Upload images and get intelligent, contextually relevant captions
- **Multiple Tonal Variations**: Generate captions in 6 different tones:
  - Professional
  - Casual
  - Humorous
  - Formal
  - Creative
  - Descriptive

- **User Dashboard**: Manage your generated captions and images in one place
- **Easy Image Upload**: Drag-and-drop interface for seamless image uploading
- **Caption History**: Access and edit your previously generated captions
- **Dark/Light Theme**: Comfortable viewing experience with theme switching

## Tech Stack

- **Frontend**:
  - Next.js 14 (App Router)
  - React
  - TypeScript
  - Tailwind CSS
  - shadcn/ui components
  - React Query for data fetching

- **Backend**:
  - Next.js API Routes
  - Prisma ORM
  - OpenRouter AI for caption generation
  - Uploadthing for image handling

- **Authentication**:
  - Better Auth for secure user authentication

## Getting Started

1. Install dependencies:
```bash
bun install
```

2. Set up environment variables:
Create a `.env` file with the following variables:
```env
DATABASE_URL="your-database-url"
BETTER_AUTH_SECRET="your-auth-secret"
BETTER_AUTH_URL="http://localhost:3000"
OPENROUTER_API_KEY="your-openrouter-api-key"
UPLOADTHING_SECRET="your-uploadthing-secret"
UPLOADTHING_APP_ID="your-uploadthing-app-id"
```

3. Generate database schema:
```bash
bun db:generate
```

4. Run database migrations:
```bash
bun db:migrate
```

5. Start the development server:
```bash
bun dev
```

Open [http://localhost:3002](http://localhost:3002) with your browser to see the application.

## Project Structure

```
helix/
├── prisma/           # Database schema and migrations
├── public/           # Static assets
└── src/
    ├── app/         # Next.js app router pages and API routes
    │   ├── api/     # API endpoints
    │   ├── auth/    # Authentication pages
    │   └── dashboard/ # User dashboard
    ├── components/  # Reusable React components
    │   ├── cards/
    │   ├── file-uploads/
    │   ├── toggles/
    │   └── ui/
    ├── hooks/       # Custom React hooks
    │   ├── query/   # API query hooks
    │   └── ui/      # UI utility hooks
    ├── layout/      # Layout components
    │   ├── common/
    │   └── dashboard/
    ├── lib/         # Utility functions
    ├── types/       # TypeScript type definitions
    └── utils/       # Configuration and helpers
        ├── auth/
        ├── configs/
        ├── helpers/
        └── providers/

```