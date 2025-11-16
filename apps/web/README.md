# Machi-Pin Web App

This is the main PWA (Progressive Web App) for the Machi-Pin project - your digital scrapbook for places and memories.

## Tech Stack

- **Framework**: Next.js 16 (Pages Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Maps**: MapLibre GL + react-map-gl
- **Drawing**: Konva + react-konva
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Data Fetching**: SWR
- **PWA**: next-pwa

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm 8+

### Installation

1. Install dependencies from the monorepo root:

```bash
cd ../..
pnpm install
```

2. Set up environment variables:

```bash
cp .env.example .env.local
```

Then edit `.env.local` and add your Firebase configuration values from the [Firebase Console](https://console.firebase.google.com).

### Development

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Build

Build for production:

```bash
pnpm build
```

Start the production server:

```bash
pnpm start
```

## Project Structure

```
apps/web/
├── pages/              # Next.js Pages Router
│   ├── _app.tsx       # App wrapper
│   ├── _document.tsx  # Document with PWA meta tags
│   ├── index.tsx      # Landing page
│   ├── login.tsx      # Login page
│   ├── dashboard.tsx  # Main dashboard (desk)
│   ├── map/
│   │   └── [mapId].tsx # Map view with pins
│   └── pin/
│       └── [pinId].tsx # Public pin share page (SSR)
├── components/         # React components
├── lib/               # Utilities and helpers
│   └── firebaseClient.ts # Firebase initialization
├── styles/            # Global styles
│   └── globals.css    # Tailwind + custom styles
└── public/            # Static assets
    └── manifest.json  # PWA manifest
```

## Features

### Core Pages

- **Landing Page** (`/`) - Redirects to dashboard or login
- **Login** (`/login`) - Firebase authentication
- **Dashboard** (`/dashboard`) - "Desk" view with all maps
- **Map View** (`/map/[mapId]`) - Interactive map with pins and camera panel
- **Pin Share** (`/pin/[pinId]`) - Public SSR page for sharing pins

### PWA Features

- Offline support
- Installable on mobile devices
- Optimized caching strategy
- Works standalone

### Camera Integration

The camera is integrated directly into the sliding panel on the map view. Users can swipe up to access the camera and capture photos without navigating to a separate screen.

## Environment Variables

See `.env.example` for required environment variables. All Firebase configuration must be prefixed with `NEXT_PUBLIC_` to be accessible in the browser.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [MapLibre GL Documentation](https://maplibre.org/)
- [Konva Documentation](https://konvajs.org/)
