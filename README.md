# Machi-Pin (PWA-First)

> Your digital scrapbook for places and memories

Machi-Pin is a location-based memory app that combines maps, photos, and sketches to create a unique analog-feeling digital experience.

## 🎯 Project Overview

**Code Name**: Machi-Pin  
**Tech Stack**: Next.js (Pages Router), TypeScript, Firebase, MapLibre, Konva, PWA  
**Architecture**: Turborepo Monorepo with pnpm

## 📁 Monorepo Structure

```
machi_pin/
├── apps/
│   └── web/              # Main PWA application (Next.js)
├── packages/
│   ├── types/            # Shared TypeScript types
│   ├── ui/               # Shared UI components
│   ├── eslint-config/    # Shared ESLint configuration
│   └── typescript-config/# Shared TypeScript configuration
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- Firebase project (for backend services)

### Installation

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd machi_pin
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Set up environment variables**

```bash
cd apps/web
cp .env.example .env.local
```

Edit `apps/web/.env.local` with your Firebase credentials from the [Firebase Console](https://console.firebase.google.com).

4. **Run development server**

```bash
# From the root directory
pnpm dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

## 📦 Available Scripts

Run these from the monorepo root:

```bash
# Development
pnpm dev          # Start all apps in dev mode
pnpm build        # Build all apps and packages
pnpm lint         # Lint all apps and packages

# Web app specific (from apps/web/)
pnpm dev          # Start Next.js dev server
pnpm build        # Build for production
pnpm start        # Start production server
```

## 🏗️ Key Features

### Core Functionality

- 🗺️ **Interactive Maps** - Browse and create location-based collections
- 📍 **Pin Memories** - Save places with photos, sketches, and notes
- ✏️ **Analog Sketching** - Draw on your photos with Konva canvas
- 📷 **Integrated Camera** - Capture moments directly from the map view
- 🔗 **Public Sharing** - Share individual pins with beautiful SSR pages
- 📱 **PWA Support** - Install and use offline

### User Experience

- 📚 **Desk Metaphor** - Organize maps like physical notebooks
- 📄 **Analog UI** - Paper-like textures and handwritten feel
- 🎨 **Simple & Intuitive** - Easy to capture and cherish memories

## 🛠️ Technology Stack

### Frontend
- **Next.js 16** (Pages Router) - React framework with SSR
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **MapLibre GL** - Open-source maps
- **Konva** - Canvas-based drawing

### Backend
- **Firebase Auth** - User authentication
- **Firestore** - NoSQL database
- **Firebase Storage** - File storage for photos

### Developer Tools
- **Turborepo** - High-performance build system
- **pnpm** - Fast, disk space efficient package manager
- **ESLint** - Code linting
- **next-pwa** - PWA configuration

## 📱 App Structure

### Pages

- `/` - Landing page (redirects to dashboard or login)
- `/login` - Authentication page
- `/dashboard` - Main "desk" view with all maps
- `/map/[mapId]` - Interactive map view
- `/pin/[pinId]` - Public pin sharing page (SSR for SEO)

## 🔧 Development

### Adding a New Package

```bash
# Create a new package
mkdir -p packages/your-package
cd packages/your-package
pnpm init
```

### Workspace Dependencies

To reference a workspace package:

```json
{
  "dependencies": {
    "@repo/types": "workspace:*"
  }
}
```

## 🌐 Deployment

The PWA is optimized for deployment on:

- **Vercel** (recommended for Next.js)
- **Firebase Hosting**
- **Netlify**

Make sure to set up your environment variables in your deployment platform.

## 📝 License

[Your License Here]

## 🤝 Contributing

[Your Contributing Guidelines]

---

Built with ❤️ using Next.js and Firebase
