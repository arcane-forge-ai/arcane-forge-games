# Arcane Forge Games

A modern web platform for hosting and playing AI-generated games. Built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

## Features

- 🎮 **Game Library**: Browse and play AI-generated games
- 💬 **Threaded Comments**: Engage with other players through nested comments
- 📊 **Game Statistics**: Track plays, likes, and dislikes
- 📝 **Feedback System**: Submit feedback with optional email notifications
- 🔐 **Admin Interface**: Manage games through a secure admin panel
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile
- ⚡ **Fast Performance**: Built with Next.js 14 and optimized for speed

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase (PostgreSQL)
- **Authentication**: Token-based admin authentication
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd arcane_forge_games
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
   
   # Admin token for API
   ADMIN_API_TOKEN=your_secure_admin_token_here
   
   # App URL
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Database schema ownership**

   Project `nydmouxljprsfymcvqko` is owned by the sibling `arcane_forge_website` repository.
   Follow `../arcane_forge_website/docs/supabase-migrations.html`; never run schema deployment from this repo.

5. **Start the development server**
   ```bash
   npm run dev
   ```

Visit `http://localhost:3000` to see the application.

## Project Structure

```
arcane_forge_games/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   │   ├── games/         # Game-related endpoints
│   │   │   └── admin/         # Admin endpoints
│   │   ├── games/             # Game pages
│   │   │   └── [slug]/        # Individual game page
│   │   └── admin/             # Admin interface
│   ├── components/            # React components
│   │   ├── Banner.tsx         # Game count banner
│   │   ├── GameCard.tsx       # Game grid item
│   │   ├── GameEmbed.tsx      # Game iframe
│   │   ├── StatsBar.tsx       # Like/dislike/play stats
│   │   ├── CommentsThread.tsx # Threaded comments
│   │   ├── CommentForm.tsx    # Comment submission
│   │   └── FeedbackForm.tsx   # Feedback submission
│   ├── lib/                   # Utilities and configurations
│   │   ├── supabase.ts        # Supabase client
│   │   └── utils.ts           # Helper functions
│   └── types/                 # TypeScript type definitions
├── public/
│   └── games/                 # Flutter game builds
│       └── [slug]/            # Individual game files
├── supabase/OWNERSHIP.html    # Schema owner pointer
└── design_docs/              # Architecture documentation
```

## API Endpoints

### Public Endpoints

- `GET /api/games` - List all games
- `GET /api/games/[slug]` - Get game details with stats
- `POST /api/games/[slug]/play` - Increment play count
- `POST /api/games/[slug]/like` - Increment like count
- `POST /api/games/[slug]/dislike` - Increment dislike count
- `GET /api/games/[slug]/comments` - Get game comments
- `POST /api/games/[slug]/comments` - Post a comment
- `POST /api/games/[slug]/feedback` - Submit feedback

### Admin Endpoints (requires authorization header)

- `GET /api/admin/games` - List all games with stats
- `POST /api/admin/games` - Create a new game

## Adding Games

### Via Admin Interface

1. Visit `/admin/games`
2. Enter your admin token
3. Fill out the game form with:
   - Title
   - Description
   - Icon URL
   - Screenshot URL
   - Slug (optional - auto-generated from title)

### Game File Structure

Place Flutter game builds in `/public/games/[slug]/`:
```
public/games/my-awesome-game/
├── index.html              # Main game file
├── main.dart.js           # Compiled Dart code
├── flutter.js             # Flutter web engine
└── assets/                # Game assets
    ├── images/
    └── sounds/
```

## Database Schema

The application uses the following main tables:

- **games**: Game information (title, description, URLs)
- **stats**: Play counts, likes, dislikes per game
- **comments**: Threaded comments system
- **feedback_requests**: User feedback with optional email notifications

See `../arcane_forge_website/supabase/migrations/` for the canonical schema history.

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `ADMIN_API_TOKEN` | Secret token for admin access | Yes |
| `NEXT_PUBLIC_APP_URL` | Your app's URL | Yes |

### Admin Authentication

The admin interface uses a simple token-based authentication system. Set a secure `ADMIN_API_TOKEN` in your environment variables and use it to access the admin panel.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set your environment variables in Vercel dashboard
4. Deploy

### Manual Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## Development

### Running Tests

```bash
npm test                # Run unit tests
npm run test:e2e       # Run end-to-end tests
```

### Linting and Formatting

```bash
npm run lint           # Check code style
npm run lint:fix       # Fix linting issues
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue on GitHub or contact the development team. 