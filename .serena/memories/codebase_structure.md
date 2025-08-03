# Koouk Codebase Structure

## Root Directory
```
├── src/                    # Main application source
├── public/                 # Static assets
├── supabase/              # Database migrations
├── package.json           # Dependencies and scripts
├── next.config.ts         # Next.js configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── eslint.config.mjs      # ESLint configuration
```

## Source Directory (`/src`)
```
├── app/                   # Next.js App Router
│   ├── api/              # API routes (weather, stocks, etc.)
│   ├── auth/             # Authentication pages
│   ├── settings/         # Settings pages
│   ├── pricing/          # Pricing page
│   ├── layout.tsx        # Root layout with providers
│   └── page.tsx          # Main dashboard page
├── components/           # Reusable UI components
│   ├── mini-functions/   # Mini function widgets
│   ├── AuthButton.tsx    # Authentication component
│   ├── Weather.tsx       # Weather display
│   └── ...              # Other UI components
├── contexts/             # React Context providers
│   ├── AuthContext.tsx   # User authentication state
│   ├── ContentContext.tsx # Content management state
│   └── ...              # Other contexts
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
│   ├── supabase.ts      # Database client
│   ├── translations.ts   # Internationalization
│   └── ...              # Other utilities
└── types/                # TypeScript type definitions
```

## Key Components
- **Main Page**: Tabbed interface (Summary, Today, Dashboard, Contents, Popular)
- **Mini Functions**: 14 different widgets for personal life management
- **Content Management**: Bookmarks for links, videos, images, notes
- **Todo System**: Task management with real-time sync
- **Weather Integration**: Live weather data with temperature graphs

## Database Schema
- **Supabase PostgreSQL** with migrations in `/supabase/migrations/`
- **Authentication**: Built-in Supabase Auth
- **User Data**: Content, todos, mini functions, preferences