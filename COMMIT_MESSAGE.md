fix: resolve critical shorts navigation and video management issues + rebrand to Fitrah

🐛 Critical Bug Fixes:
- Fix shorts scrolling navigation being interrupted by premature consecutive limit checks
- Fix video addition functionality failing due to Firestore Date/Timestamp type mismatches  
- Fix missing videos in UI caused by flawed shorts grouping logic skipping items

🔧 Technical Improvements:
- Update shorts player to only check consecutive limits on session start, not during scroll
- Implement proper Date/Timestamp conversion for all Firestore operations
- Rewrite video/shorts rendering with correct sequential processing algorithm
- Add proper null checks and error handling throughout video management functions

🎨 Rebranding:
- Update all app names from "Parental Choice" to "Fitrah"
- Update PWA manifest, page titles, and installation prompts
- Update project documentation to reflect new branding

⚙️ Configuration:
- Fix Firebase configuration with correct environment variable names
- Add missing NEXT_PUBLIC_FIREBASE_PROJECT_ID variable

Files changed:
- app/shorts/[id]/page.tsx (shorts navigation fix)
- lib/firebase/firestore.ts (video management fixes)  
- app/page.tsx (video display logic rewrite)
- app/layout.tsx (title updates)
- components/InstallPWAPrompt.tsx (branding)
- public/manifest.json (PWA branding)
- PROJECT_DOCUMENTATION.md (documentation updates)
- .env.local (Firebase config fix)

Resolves issues with shorts scrolling, video addition/display, and completes app rebranding.