# Getting Started with Machi-Pin

This guide will help you set up and run the Machi-Pin project for the first time.

## ✅ Prerequisites Checklist

Before you begin, make sure you have:

- [ ] Node.js 18 or higher installed
- [ ] pnpm 8 or higher installed (`npm install -g pnpm`)
- [ ] A Firebase project created
- [ ] Firebase configuration values ready

## 🚀 Setup Steps

### 1. Install Dependencies

All dependencies are already installed! If you need to reinstall:

```bash
pnpm install
```

### 2. Configure Firebase

#### Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project" or select an existing one
3. Enable the following services:
   - **Authentication** (Email/Password and Google Sign-In)
   - **Firestore Database** (Start in test mode for development)
   - **Storage** (Start in test mode for development)

#### Get Your Configuration

1. In Firebase Console, go to Project Settings (⚙️ icon)
2. Scroll down to "Your apps"
3. Click the Web icon (`</>`) to add a web app
4. Register your app with a nickname (e.g., "Machi-Pin Web")
5. Copy the configuration object

#### Set Up Environment Variables

1. Navigate to the web app directory:

```bash
cd apps/web
```

2. Copy the example environment file:

```bash
cp .env.example .env.local
```

3. Edit `.env.local` and paste your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Run the Development Server

From the project root:

```bash
pnpm dev
```

Or from the `apps/web` directory:

```bash
cd apps/web
pnpm dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

### 4. Verify the Setup

You should see:

1. ✅ The app loads without errors
2. ✅ You can navigate to `/login`
3. ✅ You can navigate to `/dashboard`
4. ✅ You can navigate to `/map/sample-map-1`

## 📱 Testing PWA Features

### On Desktop (Chrome/Edge)

1. Open DevTools (F12)
2. Go to the "Application" tab
3. Check "Service Workers" - you should see the service worker registered
4. Check "Manifest" - you should see the app manifest details

### On Mobile

1. Build the production version:

```bash
pnpm build
pnpm start
```

2. Open the app on your mobile browser
3. Look for the "Install" or "Add to Home Screen" prompt

## 🛠️ Development Workflow

### Running Specific Commands

```bash
# From the monorepo root
pnpm dev          # Start all apps
pnpm build        # Build all apps
pnpm lint         # Lint all apps

# From apps/web
pnpm dev          # Start only the web app
pnpm build        # Build the web app
pnpm lint         # Lint the web app
```

### Project Structure

```
machi_pin/
├── apps/
│   └── web/              # Main PWA (Next.js)
│       ├── pages/        # All pages
│       ├── lib/          # Firebase & utilities
│       ├── styles/       # Global CSS
│       └── public/       # Static assets
├── packages/
│   ├── types/            # Shared TypeScript types
│   ├── ui/               # Shared UI components
│   ├── eslint-config/    # ESLint config
│   └── typescript-config/# TypeScript config
```

### Using Shared Types

In any file in `apps/web`:

```typescript
import type { Pin, Map, User } from '@repo/types';
```

## 🐛 Troubleshooting

### Port 3000 is already in use

Change the port in `apps/web/package.json`:

```json
{
  "scripts": {
    "dev": "next dev --port 3001"
  }
}
```

### Firebase not initializing

Make sure:
- All environment variables are set in `.env.local`
- The file is in `apps/web/.env.local` (not the root)
- You've restarted the dev server after adding the env vars

### TypeScript errors with types

Make sure the types package is properly linked:

```bash
pnpm install
```

If issues persist, try:

```bash
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

## 🎨 Next Steps

Now that your project is set up, you can:

1. **Customize the UI** - Edit Tailwind classes in pages
2. **Add Firebase Security Rules** - Secure your Firestore and Storage
3. **Implement Authentication** - Add Google Sign-In logic
4. **Integrate Maps** - Add MapLibre GL functionality
5. **Add Konva Canvas** - Implement drawing features

## 📚 Useful Resources

- [Next.js Pages Router Docs](https://nextjs.org/docs/pages)
- [Firebase Web SDK](https://firebase.google.com/docs/web/setup)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs/)
- [Konva.js](https://konvajs.org/docs/)
- [Turborepo Docs](https://turbo.build/repo/docs)

---

Happy coding! 🎉

