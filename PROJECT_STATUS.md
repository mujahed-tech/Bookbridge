# BookBridge — Project Status

Last audited: 2026-09-13

## Purpose

BookBridge is a mobile-first web app for sharing and requesting educational books. It is currently being converted from a static prototype to a Supabase-backed college book-sharing app.

## Current project structure

```text
D:\bookbridge\
├── src\
│   ├── components\       Reusable UI elements
│   ├── data\             Shared types and educational categories
│   ├── lib\              Supabase client, avatar helpers, time helpers, icons
│   ├── screens\          App pages/routes
│   └── store\            Shared React state and Supabase data access
├── supabase\schema.sql   Database, RLS, profile trigger, and image-storage setup
├── public\               Static assets
├── dist\                 Most recently built production files
├── package.json           Scripts and dependencies
├── .env.example           Safe environment-variable template
├── .env.local             Local credentials file; must never be committed or shared
└── PROJECT_STATUS.md      This document
```

## Technologies and frameworks

- React 19 + TypeScript
- Vite 8 build/dev server
- React Router (`HashRouter`) for client-side routing
- Tailwind CSS 4 for styling
- Framer Motion for page/element animation
- Lucide React for icons
- Supabase JavaScript client
- Oxlint for linting

## Database and storage

- Database provider: Supabase PostgreSQL.
- Schema source: `supabase/schema.sql`.
- Tables: `profiles`, `books`, `book_requests`, `conversations`, `messages`, and `notifications`.
- Row Level Security (RLS) policies are included in the schema.
- Book cover images are intended to use the public Supabase Storage bucket named `book-covers`, limited to JPG, PNG, and WebP files up to 5 MB.

## Authentication

- Supabase Auth is configured for email/password sign-up and sign-in.
- The sign-up flow sends `display_name` metadata.
- The `handle_new_user` database trigger creates a profile row after a user signs up.
- The frontend stores the Supabase session through the Supabase client.
- There is no confirmed password reset flow, email-confirmation handling UI, or account-deletion implementation.

## Google Cloud / OAuth

- No Google Cloud configuration, Google OAuth provider setup, OAuth callback handling, or Google client IDs were found in the application source.
- Do not assume Google sign-in works until it is deliberately configured in Supabase and the frontend.

## Completed features

- Educational categories: Engineering, Computer Science, Mathematics, Science, Commerce & Management, Humanities, Medical & Pharmacy, Competitive Exams, School Textbooks, and Reference & Notes.
- Supabase client setup using browser-safe environment variables.
- Email/password sign-up and sign-in screen.
- Profile name, location, and bio saving to Supabase.
- Home screen using the signed-in member profile and real book listings.
- Book listing form with optional real book-cover photo upload.
- Book-cover fallback gradient when no image is supplied.
- Real book search and category filtering.
- Real category pages and listing detail pages.
- Real book-request creation and a personal request list.
- Real notification display and marking notifications as read, when notifications exist in Supabase.
- Profile pages for real members and their real listings.
- Production build previously passed after the latest migration.

## Features currently working in the source

- Reading public book listings for signed-in members.
- Creating book listings owned by the signed-in member.
- Uploading a book image when the `book-covers` bucket and its RLS policies have been created from `supabase/schema.sql`.
- Viewing own listings and real member listings.
- Editing the signed-in member's basic profile.
- Creating a book request and viewing requests made by the signed-in member.
- Searching and filtering books by title, author, and educational category.
- Signing out from the Profile page.

## Not completed / intentionally unavailable

- Real-time chat and conversations: Chat screens are placeholder/empty-state screens and do not create or send messages.
- Incoming request management for book owners: current request loading focuses on requests made by the signed-in member, not requests received for their listings.
- Accepting, declining, reserving, giving, editing, or deleting a book listing.
- Automated notifications/triggers for new requests, accepted requests, messages, or donations.
- Password reset, email-confirmation UI, Google OAuth, and account deletion.
- Persistent uploaded profile photos; profile avatars currently use generated initials/colours.
- Deployment configuration and production hosting.

## Current errors and issues

- No TypeScript build error was present in the most recently verified production build. This audit intentionally did not run a new build.
- The chat screens deliberately show that messaging is unavailable; they are not a completed feature.
- `NewRequestInput` accepts an optional author, but the database `book_requests` schema does not store an author column; that author is currently not persisted.
- The `notifications` table is readable in the UI, but the project has no backend trigger/function currently creating notification rows.
- `src/data/demoData.ts` remains in the repository as legacy prototype data. No active source file imports it, but it should not be reintroduced into live screens.
- The local Supabase project, tables, RLS policies, Storage bucket, and production auth settings were not connected to or tested during this audit.
- Oxlint previously reported a non-blocking React Fast Refresh warning in `src/store/store.tsx`; it does not prevent building or running the app.

## Important environment variables — names only

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Never place a Supabase secret key, service-role key, password, token, or API credential in frontend source, `PROJECT_STATUS.md`, Git, or a public deployment.

## Important files

- `src/App.tsx` — Application routes and the shared store provider.
- `src/store/store.tsx` — Central application state, Supabase reads/writes, sessions, profiles, books, requests, and notifications.
- `src/lib/supabase.ts` — Creates the browser Supabase client using the two public environment-variable names above.
- `src/data/types.ts` — Current TypeScript data model for Supabase-backed records.
- `src/data/categories.ts` — Educational category definitions used by live screens.
- `src/screens/Auth.tsx` — Email/password sign-up and sign-in.
- `src/screens/Home.tsx` — Real home feed and signed-in identity display.
- `src/screens/DonateBook.tsx` — Book listing creation and optional cover-image upload.
- `src/screens/BookDetails.tsx` — Real listing detail view.
- `src/screens/RequestBook.tsx` and `src/screens/MyRequests.tsx` — Request creation and the current user's request history.
- `src/screens/Profile.tsx` and `src/screens/EditProfile.tsx` — User profile display and editing.
- `src/screens/Notifications.tsx` — Supabase notification display.
- `src/screens/ChatList.tsx` and `src/screens/ChatConversation.tsx` — Honest placeholders until messaging is implemented.
- `supabase/schema.sql` — Required Supabase database/storage setup. It is designed to be re-runnable for the included policies.
- `.env.example` — Safe environment-variable template; copy to `.env.local` locally only.

## Git and GitHub status

- `D:\bookbridge` (the actual app root) is **not** a Git repository.
- A separate nested repository exists at `D:\bookbridge\Bookbridge`.
- The nested repository is on branch `main`, has a clean working tree, and its most recent commit is `bb27e83 Initial commit`.
- The nested repository's `origin` remote points to `https://github.com/mujahed-tech/Bookbridge.git`.
- Important: because the app source is outside the nested repository, the actual application files in `D:\bookbridge\src`, `supabase`, and `package.json` are not currently tracked by that nested GitHub repository. Do not assume current application work is backed up to GitHub.

## Exact next steps

1. Back up the whole `D:\bookbridge` folder before further work.
2. Decide whether to initialise Git at `D:\bookbridge` or move the app source into the existing nested Git repository. Do this carefully so the real app source becomes tracked before major changes continue.
3. In Supabase, verify that the full `supabase/schema.sql` has run successfully, including the `book-covers` bucket and policies.
4. Test this complete manual flow with two test accounts: sign up, edit profile, list a book with an image, find the listing through search, and create a request.
5. Implement received-request management for book owners: list requests for owned books, accept/decline them, and update book/request status.
6. Add database triggers or server-side logic for notification creation.
7. Implement real conversations/messages only after request management works.
8. Add account recovery, production auth settings, and deployment configuration before sharing publicly.
9. Run `npm.cmd run build` and `npm.cmd run lint` after every code change.

## Important instructions / do not change

- Do not expose `.env.local` or copy its values into code, documents, commits, screenshots, or chat.
- Do not use Supabase secret/service-role keys in this React/Vite frontend. Only the publishable browser key belongs in `VITE_` environment variables.
- Do not disable or weaken Supabase RLS policies merely to make a feature work.
- Do not reintroduce `src/data/demoData.ts` into live screens; use `src/data/types.ts`, `src/data/categories.ts`, and `src/store/store.tsx` instead.
- Do not delete the `book-covers` bucket or existing database tables without an explicit backup and migration plan.
- Do not treat the nested `D:\bookbridge\Bookbridge` Git repository as a backup of the application source until the repository layout is corrected.
