# Koouk Development Commands

## Development
```bash
npm run dev          # Start development server with Turbo
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint checks
```

## Package Management
```bash
npm install          # Install dependencies
npm update           # Update packages
```

## Git Commands
```bash
git status           # Check repository status
git add .            # Stage all changes
git commit -m "msg"  # Commit with message
git push             # Push to remote
```

## Deployment
- **Vercel**: Automatic deployment on push to main branch
- **Environment**: Production builds use Next.js optimization

## Testing
- **No testing framework** currently configured
- **Manual testing** in development mode

## Key Paths
- **Source**: `/src` - All application code
- **Components**: `/src/components` - Reusable UI components
- **Pages**: `/src/app` - Next.js App Router pages
- **APIs**: `/src/app/api` - Backend API routes
- **Contexts**: `/src/contexts` - React Context providers
- **Utils**: `/src/lib` - Utility functions and configurations

## Environment Variables
- Check `.env.local` for API keys and configuration
- Supabase, weather API, and analytics keys required