# Parental Choice - Project Documentation

## Project Overview

**Name:** Parental Choice  
**Type:** Progressive Web App (PWA)  
**Framework:** Next.js 16.1.1 (App Router, Turbopack)  
**Purpose:** YouTube video management app with curated content for parental control

A mobile-first YouTube video organizer that allows users to maintain personalized lists of approved videos and shorts. Features Firebase authentication, Firestore storage, and PWA capabilities including share target integration.

---

## Tech Stack

### Core Framework
- **Next.js 16.1.1** - React framework with App Router
- **Turbopack** - Fast bundler enabled in config
- **TypeScript** - Strict mode enabled
- **React 19** - Latest React version

### Styling
- **Tailwind CSS 4** - Utility-first CSS framework
- **Custom theme** - Dark mode (#0f0f0f background)
- **Lucide React** - Icon library

### Backend Services
- **Firebase Authentication** - Email/password auth (no OAuth)
- **Firestore** - NoSQL database for user video lists
- **Firebase Admin SDK** - Server-side authentication verification

### PWA Infrastructure
- **@ducanh2912/next-pwa v10.2.9** - Service worker generation
- **Manifest.json** - PWA configuration
- **Share Target API** - Receive shared content from other apps

---

## Architecture Decisions

### 1. Authentication Strategy
**Choice:** Session cookie pattern  
**Rationale:** 
- Server components can verify authentication
- Better security than client-only tokens
- Enables protected routes with SSR

**Implementation:**
- Client: Firebase Auth (`onAuthStateChanged`)
- Server: Firebase Admin SDK (`verifySessionCookie`)
- Session cookies created via `/api/auth/session` route
- Logout clears cookie via `/api/auth/signout` route

### 2. Video Storage Model
**Choice:** User-specific Firestore collections  
**Path:** `videoLists/{userId}`  
**Rationale:**
- Simple per-user isolation
- Easy to query and manage
- Supports ordering with `order` field

**Document Structure:**
```typescript
{
  videos: VideoItem[] // Array of video objects
}

interface VideoItem {
  id: string;        // YouTube video ID
  type: 'video' | 'shorts';
  title: string;     // Optional display name
  addedAt: Timestamp;
  order: number;     // Display sequence
}
```

### 3. Default Video List
**Choice:** Hardcoded default list for non-authenticated users  
**Location:** Both `app/page.tsx` and `app/shorts/[id]/page.tsx`  
**Rationale:**
- Instant content for new visitors
- Demonstrates app functionality
- No database queries for anonymous users

### 4. Shorts Infinite Scroll
**Choice:** Circular list (3x array duplication)  
**Rationale:**
- Seamless infinite scroll without API calls
- Instant navigation between videos
- No loading states or delays

**Implementation:**
```typescript
[shorts, shorts, shorts] // Triplicate array
// User navigates in middle copy
// Jump to equivalent position when reaching edges
```

### 5. PWA Approach
**Choice:** Installable with share target, limited offline  
**Rationale:**
- Share target enables content addition from YouTube app
- Offline data caching for video lists (Firestore persistence)
- YouTube playback requires internet (iframe limitation)

---

## Project Structure

```
fitrah/
├── app/
│   ├── page.tsx                 # Home feed (main video list)
│   ├── layout.tsx               # Root layout with AuthProvider
│   ├── globals.css              # Global styles + Tailwind
│   ├── login/
│   │   └── page.tsx             # Login/signup single page
│   ├── profile/
│   │   └── page.tsx             # User profile (server component)
│   ├── add-video/
│   │   └── page.tsx             # Manual video addition form
│   ├── share/
│   │   └── page.tsx             # Share target handler
│   ├── video/[id]/
│   │   └── page.tsx             # Landscape video player
│   ├── shorts/[id]/
│   │   └── page.tsx             # Vertical shorts feed
│   └── api/
│       └── auth/
│           ├── session/route.ts # Create session cookie
│           └── signout/route.ts # Clear session cookie
│
├── components/
│   ├── Header.tsx               # Top nav with logo
│   ├── BottomNav.tsx            # Bottom navigation bar
│   ├── VideoCard.tsx            # Full video thumbnail card
│   ├── ShortsCard.tsx           # Shorts thumbnail card
│   ├── SignOutButton.tsx        # Client logout component
│   ├── InstallPWAPrompt.tsx     # PWA install popup
│   └── providers/
│       └── AuthProvider.tsx     # Auth context provider
│
├── lib/
│   ├── firebase/
│   │   ├── config.ts            # Client Firebase init + offline persistence
│   │   ├── admin.ts             # Server Firebase Admin SDK
│   │   ├── auth.ts              # Auth helper functions
│   │   └── firestore.ts         # Firestore CRUD operations
│   ├── youtube.ts               # (Legacy, unused)
│   └── youtube-utils.ts         # Extract YouTube video IDs
│
├── public/
│   ├── manifest.json            # PWA manifest
│   ├── icon-192x192.png         # App icon (small)
│   └── icon-512x512.png         # App icon (large)
│
├── .env.local                   # Firebase credentials (gitignored)
├── next.config.ts               # Next.js + PWA config
├── tsconfig.json                # TypeScript config
├── tailwind.config.ts           # Tailwind configuration
└── package.json                 # Dependencies
```

---

## Page Descriptions

### Home Page (`app/page.tsx`)
**Type:** Client component  
**Purpose:** Main feed showing user's video list  
**Features:**
- Fetches user videos from Firestore if authenticated
- Shows default list for anonymous users
- Groups shorts in 2-column grid
- Full-width video cards
- "Shorts" section header

**Data Flow:**
1. AuthProvider checks user state
2. If logged in: fetch from Firestore
3. If not logged in: use defaultVideoList
4. Render VideoCard for videos, ShortsCard for shorts

### Login Page (`app/login/page.tsx`)
**Type:** Client component  
**Purpose:** Single page for both login and signup  
**Features:**
- Tab toggle between login/signup
- Email + password fields
- Creates initial video list on signup
- Redirects to home after success

**Design Choice:** Combined page instead of separate routes for simpler UX

### Profile Page (`app/profile/page.tsx`)
**Type:** Server component  
**Purpose:** Display user info  
**Features:**
- Verifies session cookie server-side
- Shows email and user ID
- Includes SignOutButton client component

**Why Server Component:** Demonstrates server-side auth verification pattern

### Add Video Page (`app/add-video/page.tsx`)
**Type:** Client component  
**Purpose:** Manual video addition form  
**Features:**
- YouTube URL input with validation
- Radio buttons for video vs shorts type
- Extracts video ID using `extractYouTubeVideoId()`
- Adds to Firestore with auto-incremented order

**Protected:** Redirects to /login if not authenticated

### Share Page (`app/share/page.tsx`)
**Type:** Client component (wrapped in Suspense)  
**Purpose:** Handle shared YouTube videos from other apps  
**Features:**
- Receives URL via query params (from manifest share_target)
- Auto-detects video type (checks for "/shorts/" in URL)
- Shows processing/success/error states
- Auto-redirects after completion

**Technical Note:** Wrapped in Suspense boundary to satisfy Next.js requirement for `useSearchParams()`

### Video Player (`app/video/[id]/page.tsx`)
**Type:** Client component  
**Purpose:** Full-screen landscape video player  
**Features:**
- YouTube iframe embed with controls
- 16:9 aspect ratio
- Back button to home
- Action buttons (placeholder)
- Channel info section

### Shorts Player (`app/shorts/[id]/page.tsx`)
**Type:** Client component  
**Purpose:** TikTok-style vertical video feed  
**Features:**
- Snap scrolling (one video per viewport)
- Infinite circular scroll (3x array)
- Autoplay on active video
- Auto-loop enabled
- Right-side action buttons
- Instant scroll to clicked short (no visible animation)

**Circular Scroll Logic:**
- Array tripled: [shorts, shorts, shorts]
- User always navigates in middle copy
- When reaching top/bottom edge, jump to equivalent position in middle copy
- Seamless infinite effect without API calls

**Scroll Behavior:**
- Initial: `scrollBehavior: 'auto'` (instant)
- After 100ms: `scrollBehavior: 'smooth'`
- Prevents visible scrolling on page load

---

## Configuration Files

### `next.config.ts`
```typescript
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  reactCompiler: true,  // Enable React Compiler
  turbopack: {},        // Enable Turbopack
};

export default withPWA({
  dest: "public",       // Service worker output
  disable: process.env.NODE_ENV === "development",
  register: true,       // Auto-register service worker
})(nextConfig);
```

**Key Decisions:**
- PWA disabled in development for faster iteration
- Service worker outputs to public/ folder
- Removed `skipWaiting` and `sw` options (unsupported)

### `manifest.json`
```json
{
  "name": "Parental Choice",
  "short_name": "ParentalChoice",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0f0f0f",  // Matches app theme
  "theme_color": "#000000",
  "icons": [...],
  "share_target": {
    "action": "/share",
    "method": "GET",
    "params": {
      "title": "title",
      "text": "text",
      "url": "url"
    }
  }
}
```

**Share Target:** Enables app to appear in Android share menu when sharing from YouTube

### `tsconfig.json`
- Strict mode enabled
- Path alias: `@/*` → `./`
- Target: ES2020

### `.env.local` (gitignored)
```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=fitrah-ridwan
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...
```

**Security:** Client vars have `NEXT_PUBLIC_` prefix, server vars are private

---

## Key Implementation Details

### 1. Authentication Flow

**Client-Side:**
```typescript
// AuthProvider.tsx
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // Create session cookie
    const idToken = await user.getIdToken();
    await fetch('/api/auth/session', {
      method: 'POST',
      body: JSON.stringify({ idToken })
    });
  } else {
    // Clear session cookie
    await fetch('/api/auth/signout', { method: 'POST' });
  }
});
```

**Server-Side:**
```typescript
// profile/page.tsx
const sessionCookie = cookies().get('session')?.value;
const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie);
```

### 2. Firestore Offline Persistence
```typescript
// lib/firebase/config.ts
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Multiple tabs open');
  }
});
```

**Effect:** Video lists cached locally, available offline

### 3. YouTube URL Parsing
```typescript
// lib/youtube-utils.ts
export function extractYouTubeVideoId(url: string): string | null {
  // Supports:
  // - youtube.com/watch?v=ID
  // - youtu.be/ID
  // - youtube.com/shorts/ID
  // - youtube.com/embed/ID
}
```

### 4. PWA Install Prompt
```typescript
// InstallPWAPrompt.tsx
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  setDeferredPrompt(e);
  
  // Show after 3 seconds
  setTimeout(() => setShowPrompt(true), 3000);
});
```

**Dismissal Logic:**
- Saves timestamp to localStorage
- Won't show again for 7 days
- Won't show if already installed

---

## Design Choices & Rationale

### Why Email/Password Only?
**Decision:** No Google OAuth  
**Reason:** User explicitly requested "just use username password"  
**Trade-off:** Lower conversion but simpler implementation

### Why Client Components Everywhere?
**Decision:** Most pages are client components  
**Reason:** 
- Firebase Auth requires client-side listeners
- Interactive forms and state management
- Profile page is server component to demonstrate pattern

### Why No Video Metadata?
**Decision:** Only store ID and type  
**Reason:**
- YouTube API has quotas and complexity
- Thumbnails/titles fetched on-demand via iframe
- Simpler data model

### Why Circular List for Shorts?
**Decision:** Triple array instead of dynamic loading  
**Reason:**
- Instant response (no loading states)
- Simple implementation
- No API rate limits
- Works offline

**Trade-off:** Higher memory usage, but negligible for typical list sizes

### Why Both auth.ts and SignOutButton?
**Decision:** Separate client component for logout  
**Reason:**
- Server components can't handle `onClick` events
- Firebase signOut() requires client-side execution
- Pattern: Server components import client components for interactivity

---

## Firebase Setup

### Collections Structure
```
videoLists/
  {userId}/
    videos: VideoItem[]
```

### Security Rules (Recommended)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /videoLists/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Admin SDK Initialization
- Uses service account credentials from environment variables
- Private key requires newline handling: `FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')`

---

## Deployment Configuration

### Vercel Environment Variables
All `.env.local` variables must be added to Vercel project settings:
- Client vars: `NEXT_PUBLIC_*` (exposed to browser)
- Server vars: `FIREBASE_*` (server-side only)

### Build Process
1. Next.js static generation
2. PWA service worker generation
3. Manifest validation
4. TypeScript type checking

### Known Build Requirements
- `viewport` must be separate export (not in metadata)
- `useSearchParams()` requires Suspense boundary
- PWA options: only `dest`, `disable`, `register` supported

---

## Testing Scenarios

### 1. Anonymous User
- See default video list
- Click video → Play in video player
- Click short → Open shorts feed
- Click + button → Redirect to login

### 2. Authenticated User
- Login → Create session cookie
- See personal video list (or defaults if empty)
- Add video → Extract ID, save to Firestore
- Share from YouTube → Auto-add to list
- Sign out → Clear cookie, redirect to login

### 3. PWA Installation
- Visit site on mobile
- See install prompt after 3 seconds
- Install → App icon on home screen
- Share from YouTube → See app in share menu
- Reopen app → Check for updates

### 4. Offline Mode
- Load app while online
- Go offline
- See cached video list
- Navigate UI
- Videos won't play (YouTube iframe limitation)

---

## Known Limitations

1. **No Video Playback Offline** - YouTube iframes require internet
2. **No Video Title Editing** - Title field exists but not exposed in UI
3. **No Reordering UI** - Order field set automatically, no drag-and-drop
4. **No Delete Functionality** - Can only add videos, not remove
5. **No Search** - List grows indefinitely, no filtering
6. **Single Tab Persistence** - Firestore offline persistence fails with multiple tabs
7. **No Video Validation** - Invalid YouTube IDs accepted (won't play)

---

## Future Enhancement Opportunities

### High Priority
- [ ] Delete video functionality
- [ ] Reorder videos (drag & drop)
- [ ] Edit video titles
- [ ] Search/filter videos

### Medium Priority
- [ ] Bulk import from YouTube playlist
- [ ] Categories/tags for organization
- [ ] View history tracking
- [ ] Favorite/bookmark specific videos

### Low Priority
- [ ] Multi-user accounts (family profiles)
- [ ] Parental controls (time limits, restrictions)
- [ ] Download metadata from YouTube API
- [ ] Custom thumbnails

---

## Troubleshooting Guide

### Build Error: "viewport in metadata export"
**Solution:** Move viewport to separate export
```typescript
export const viewport: Viewport = { ... };
export const metadata: Metadata = { ... };
```

### Build Error: "useSearchParams missing suspense"
**Solution:** Wrap component in Suspense
```typescript
<Suspense fallback={<Loading />}>
  <ComponentUsingSearchParams />
</Suspense>
```

### Firebase: "Multiple tabs" warning
**Expected:** Firestore offline persistence only works in one tab
**Solution:** Acceptable limitation, warning can be ignored

### PWA: Videos won't play offline
**Expected:** YouTube embeds require internet connection
**Solution:** This is a fundamental limitation, cannot be fixed without downloading videos (against YouTube ToS)

### Share Target: 404 Error
**Check:**
1. `/share/page.tsx` exists
2. Manifest `share_target.action` is "/share"
3. App reinstalled after manifest change

---

## Development Workflow

### Local Development
```bash
npm run dev  # Start dev server (PWA disabled)
```

### Build & Deploy
```bash
npm run build  # Test production build
git push       # Auto-deploy to Vercel
```

### Testing PWA Features
1. Build production bundle locally
2. Serve with `npm run start`
3. Use Chrome DevTools > Application > Manifest
4. Test on actual mobile device (required for share target)

---

## Dependencies Versions

### Core
- next: 16.1.1
- react: 19.0.0
- typescript: ^5

### Firebase
- firebase: ^11.1.0
- firebase-admin: ^13.0.2

### PWA
- @ducanh2912/next-pwa: ^10.2.9

### UI
- tailwindcss: ^4.0.0
- lucide-react: ^0.469.0

### Why These Versions?
- Next.js 16.1.1: Latest stable with App Router improvements
- React 19: Required by Next.js 16
- Firebase 11: Latest with better tree-shaking
- Tailwind 4: New architecture with better performance

---

## Project History & Evolution

### Initial Setup
- Supabase considered but rejected
- Firebase chosen per user request
- Email/password only (no OAuth per user request)

### Authentication Pattern
- Started with client-only auth
- Added session cookies for server components
- Created separate API routes for cookie management

### Video Players
- Regular videos: straightforward implementation
- Shorts: evolved from basic player to infinite scroll with circular navigation
- Fixed scroll behavior (auto on load, smooth after)

### PWA Implementation
- Added manifest and service worker
- Implemented install prompt with dismissal logic
- Added share target for YouTube integration
- Fixed build errors with config options

### Offline Support
- Added Firestore persistence
- Updated install prompt (removed "works offline" claim)
- Documented limitations clearly

---

## Contact & Support

**Firebase Project:** fitrah-ridwan  
**Deployment:** Vercel  
**Repository:** (Not specified in codebase)

---

*Last Updated: January 5, 2026*
