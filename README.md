# Elden Ring Builds Forum

A community platform for sharing and discovering Elden Ring character builds.

## Features

- Create and share your Elden Ring character builds
- Browse builds with filtering and sorting options
- Comment on and like builds
- User authentication with Clerk
- Responsive design with Elden Ring-inspired aesthetics

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk
- **Storage**: Supabase Storage
- **Deployment**: Vercel (frontend), Supabase (database)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (for database)
- Clerk account (for authentication)

### Environment Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/elden-builds.git
cd elden-builds
```

2. Install dependencies:

```bash
npm install
```

3. Copy the example environment file and update it with your credentials:

```bash
cp .env.example .env
```

4. Configure Supabase:
   - Create a new project in Supabase
   - Get your Supabase URL and anon key from the project settings
   - Update the `.env` file with your Supabase credentials
   - Create the database tables using the SQL script in `scripts/create-tables.sql`

5. Configure Clerk:
   - Create a new project in Clerk
   - Get your Clerk publishable key and secret key
   - Update the `.env` file with your Clerk credentials

6. Configure Prisma to use Supabase:
   - Update the `DATABASE_URL` and `DIRECT_URL` in the `.env` file with your Supabase connection strings
   - Generate the Prisma client:
     ```bash
     npm run prisma:generate
     ```

7. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Database Schema

The application uses the following database models:

- **User**: User information synchronized from Clerk
- **Build**: Character builds with stats, equipment, and metadata
- **Comment**: Comments on builds
- **Like**: Likes on builds

## API Routes

The API follows RESTful conventions:

- `GET /api/builds`: List all builds with filtering and pagination
- `POST /api/builds`: Create a new build
- `GET /api/builds/:id`: Get a specific build
- `PUT /api/builds/:id`: Update a build
- `DELETE /api/builds/:id`: Delete a build
- `POST /api/builds/:id/like`: Like/unlike a build
- `GET /api/builds/:id/comments`: Get comments for a build
- `POST /api/builds/:id/comments`: Add a comment to a build

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
