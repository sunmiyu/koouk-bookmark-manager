# Task Completion Guidelines for Koouk

## Required Commands After Code Changes

### Linting & Type Checking
```bash
npm run lint             # Check for ESLint violations
npm run build            # Verify TypeScript compilation
```

### Testing Approach
- **No automated testing framework** currently configured
- **Manual testing** required:
  1. Run `npm run dev`
  2. Test changed functionality in browser
  3. Verify mobile responsiveness
  4. Check dark/light theme switching
  5. Test authentication flow if auth-related changes

### Pre-Deployment Checklist
1. **Code Quality**:
   - Run `npm run lint` and fix all issues
   - Ensure `npm run build` completes without errors
   - Check TypeScript strict mode compliance

2. **Functionality**:
   - Test all affected features manually
   - Verify API endpoints if backend changes
   - Test PWA installation if service worker changes

3. **Performance**:
   - Check Lighthouse scores for performance
   - Verify image optimization
   - Test loading times

4. **Security**:
   - Review any new environment variables
   - Check CORS configuration if API changes
   - Verify authentication flows

## Development Best Practices
- **Never commit secrets** or API keys
- **Test on mobile viewport** - mobile-first design
- **Check both light and dark themes**
- **Verify Korean/English language switching**
- **Test offline PWA functionality**

## Common Issues to Watch
- **Supabase connection** - check environment variables
- **Rate limiting** - ensure API calls are within limits
- **Context provider nesting** - maintain correct order in layout.tsx
- **localStorage fallbacks** - ensure data persistence works