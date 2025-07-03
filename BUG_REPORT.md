# Bug Report - my-phim-v4

## Summary
Comprehensive analysis of bugs and issues found in the Next.js movie streaming application codebase.

## Critical Issues

### 1. **API Service Issues (movieApi.ts)**
- **Lines 231, 291**: `any` type usage (ESLint error)
- **Lines 235, 239**: Incorrectly named functions `useFallbackLatestMovies` violate React Hooks rules (functions starting with 'use' are treated as hooks)
- **Line 350**: Anonymous default export (ESLint warning)

### 2. **Unused Variables**
- **src/app/movie/[id]/page.tsx:15**: `params` parameter is defined but never used
- **src/app/watch/[id]/page.tsx:15**: `params` parameter is defined but never used  
- **src/app/watch/[id]/page.tsx:125**: `handleEpisodeChange` is assigned but never used
- **src/app/page.tsx:3**: `MovieResponse` import is unused

### 3. **React Hooks Issues**
- **src/app/page.tsx:96**: `useCallback` has unnecessary dependency `trendingMovies.length`

### 4. **HTML/JSX Issues**
- **src/app/search/page.tsx:67**: Unescaped quotes in JSX (need to escape with `&quot;` or similar)
- **src/app/search/page.tsx:79**: Using `<img>` instead of Next.js `<Image>` component (performance issue)

## Error Details

### API Service Problems
```typescript
// Line 231: Unexpected any type
pagination?: any;

// Line 291: Unexpected any type  
pagination?: any;

// Lines 235, 239: Function names violate React Hook naming rules
return await useFallbackLatestMovies(page, limit);  // This should not start with 'use'
```

### Unused Parameters
```typescript
// movie/[id]/page.tsx - params is never used
export default function MovieDetail({ params }: MovieDetailProps) {
  // params is not used anywhere in the function
```

### React Hooks Warning
```typescript
// page.tsx - unnecessary dependency
const changeSlide = useCallback((index: number) => {
  // ... function body doesn't use trendingMovies.length
}, [selectedFeatureIndex, isSliding, trendingMovies.length]); // ← unnecessary dependency
```

### HTML Issues
```typescript
// search/page.tsx - unescaped quotes
<p className="text-gray-500">Không tìm thấy phim nào phù hợp với từ khóa "{query}"</p>
//                                                                              ↑     ↑
//                                                                    These quotes need escaping

// Using img instead of Image
<img 
  src={movie.thumb_url || '/placeholder.jpg'} 
  alt={movie.name}
  className="absolute top-0 left-0 w-full h-full object-cover"
/>
```

## Potential Runtime Issues

### 1. **Type Safety Issues**
- Using `any` types reduces type safety and can lead to runtime errors
- Missing type definitions for pagination objects

### 2. **Performance Issues**
- Using `<img>` instead of Next.js `<Image>` can result in slower LCP and higher bandwidth usage
- Unnecessary re-renders due to incorrect dependency arrays

### 3. **API Error Handling**
- Functions named like React hooks (`useFallbackLatestMovies`) in non-React contexts
- Potential issues with API response handling

## Recommendations

### Immediate Fixes Required:
1. **Fix API service naming**: Rename `useFallbackLatestMovies` to `getFallbackLatestMovies`
2. **Remove unused variables**: Clean up unused parameters and imports
3. **Fix React hooks**: Remove unnecessary dependencies from `useCallback`
4. **Fix HTML issues**: Escape quotes and replace `<img>` with `<Image>`
5. **Replace any types**: Define proper TypeScript interfaces

### Code Quality Improvements:
1. Enable stricter ESLint rules
2. Add proper error boundaries
3. Implement proper loading states
4. Add input validation for API calls

## Build Status
❌ **Build fails** due to ESLint errors
❌ **Lint fails** with multiple errors and warnings

## Files Affected
- `src/services/api/movieApi.ts`
- `src/app/page.tsx` 
- `src/app/movie/[id]/page.tsx`
- `src/app/search/page.tsx`
- `src/app/watch/[id]/page.tsx`

## Additional Files Checked
- `crawler.js` - ✅ **No critical issues found** (appears to be a separate utility script)
- `package.json` - ✅ **No issues** 
- `tsconfig.json` - ✅ **Configuration looks correct**

## Build Commands Tested
- `npm install` - ✅ **Success** (no vulnerabilities found)
- `npm run lint` - ❌ **Failed** (9 errors, 2 warnings)
- `npm run build` - ❌ **Failed** (build stopped due to lint errors)
- `npx tsc --noEmit` - ❌ **TypeScript compilation issues**

## Next Steps
1. Fix critical issues that prevent building
2. Address type safety concerns
3. Improve performance optimizations
4. Add comprehensive error handling