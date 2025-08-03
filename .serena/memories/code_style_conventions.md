# Koouk Code Style & Conventions

## General Style
- **TypeScript**: Strict mode enabled, full type safety
- **ESLint**: Next.js recommended config with TypeScript support
- **Components**: Functional components with hooks
- **File Structure**: Feature-based organization under `/src`

## Naming Conventions
- **Files**: kebab-case for components (`AuthButton.tsx`)
- **Components**: PascalCase (`AuthButton`, `WeatherOnly`)
- **Functions**: camelCase (`useWeatherData`, `getSupabase`)
- **Constants**: UPPER_SNAKE_CASE for environment variables

## Component Patterns
- **'use client'**: Required for client-side components
- **Context Providers**: Nested providers in layout.tsx
- **Custom Hooks**: Prefixed with `use` (e.g., `useWeatherData`)
- **Type Definitions**: Interface over type, descriptive naming

## CSS/Styling
- **Tailwind Classes**: Responsive mobile-first design
- **Dark Theme**: Class-based dark mode (`dark:` classes)
- **Color Scheme**: Gray scale with blue accent colors
- **Layout**: Mobile-optimized with `max-w-md` containers

## API Patterns
- **Route Handlers**: Export named functions (GET, POST, etc.)
- **Error Handling**: Consistent error responses with status codes
- **CORS**: Middleware for API endpoint security
- **Rate Limiting**: Applied to external API routes

## Import Organization
1. React imports first
2. Next.js imports
3. External libraries
4. Internal components (with `@/` alias)
5. Types and interfaces