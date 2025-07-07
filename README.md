# hold-my-apis

This project was created with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack), a modern TypeScript stack that combines React, React Router, Fastify, and more.

## Features

- **TypeScript** - For type safety and improved developer experience
- **React Router** - Declarative routing for React
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **shadcn/ui** - Reusable UI components
- **Fastify** - Fast, low-overhead web framework
- **HTTP APIs** - RESTful APIs with Zod validation
- **Bun** - Runtime environment
- **Prisma** - TypeScript-first ORM
- **PostgreSQL** - Database engine
- **Authentication** - Email & password authentication with Better Auth
- **React Query** - Powerful data fetching and caching
- **Starlight** - Documentation site with Astro
- **Tauri** - Build native desktop applications
- **Turborepo** - Optimized monorepo build system

## Recent Changes

🔄 **Migration Complete**: Successfully migrated from tRPC to standard HTTP APIs for improved simplicity and performance.

### Migration Benefits:

- **Simplified Architecture**: Removed tRPC complexity in favor of standard REST APIs
- **Better Performance**: Direct HTTP calls without tRPC overhead
- **Improved Developer Experience**: Standard HTTP endpoints are easier to debug and test
- **Enhanced Compatibility**: Works seamlessly with any HTTP client or API testing tool

## API Endpoints

The server now exposes standard HTTP REST endpoints:

### Authentication

- `POST /api/auth/sign-in` - Sign in with email/password
- `POST /api/auth/sign-up` - Register new user
- `POST /api/auth/sign-out` - Sign out user

### Users

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/onboarding/status` - Check onboarding status

### Organizations

- `GET /api/organizations` - Get user organizations
- `POST /api/organizations` - Create new organization
- `GET /api/organizations/:id` - Get organization by ID
- `PUT /api/organizations/:id` - Update organization
- `GET /api/organizations/slug/check?slug=:slug` - Check slug availability
- `POST /api/organizations/slug/generate` - Generate slug from name

### Health & Testing

- `GET /health` - Server health check
- `GET /private` - Test protected endpoint

## Getting Started

First, install the dependencies:

```bash
bun install
```

## Database Setup

This project uses PostgreSQL with Prisma.

1. Make sure you have a PostgreSQL database set up.
2. Update your `apps/server/.env` file with your PostgreSQL connection details.

3. Generate the Prisma client and push the schema:

```bash
bun db:push
```

Then, run the development server:

```bash
bun dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to see the web application.

The API is running at [http://localhost:3000](http://localhost:3000).

## Project Structure

```
hold-my-apis/
├── apps/
│   ├── web/         # Frontend application (React + React Router)
│   ├── docs/        # Documentation site (Astro Starlight)
│   └── server/      # Backend API (Fastify + HTTP REST)
│       ├── src/
│       │   ├── routes/       # HTTP API routes
│       │   ├── services/     # Business logic
│       │   ├── schemas/      # Zod validation schemas
│       │   ├── middleware/   # Custom middleware
│       │   └── lib/          # Utilities and auth config
```

## API Client Usage

The frontend uses a custom HTTP client with React Query integration:

```typescript
import { useUserProfile, useCreateOrganization } from "@/utils/api-client";

// Fetch user profile
const { data: profile, isLoading } = useUserProfile();

// Create organization mutation
const createOrg = useCreateOrganization();
await createOrg.mutateAsync({
  name: "My Organization",
  slug: "my-org",
});
```

## Available Scripts

- `bun dev`: Start all applications in development mode
- `bun build`: Build all applications
- `bun dev:web`: Start only the web application
- `bun dev:server`: Start only the server
- `bun check-types`: Check TypeScript types across all apps
