# Machi-Pin Command Reference

Quick reference for common commands in the Machi-Pin project.

## 🚀 Development

### Start Development Server

```bash
# From project root (recommended)
pnpm dev

# From apps/web
cd apps/web
pnpm dev
```

Server will start at: http://localhost:3000

### Build for Production

```bash
# Build all packages
pnpm build

# Build only web app
cd apps/web
pnpm build
```

### Start Production Server

```bash
cd apps/web
pnpm start
```

## 📦 Package Management

### Install Dependencies

```bash
# Install all dependencies (from root)
pnpm install

# Add dependency to web app
cd apps/web
pnpm add <package-name>

# Add dev dependency
pnpm add -D <package-name>
```

### Update Dependencies

```bash
# Update all dependencies
pnpm update

# Update specific package
pnpm update <package-name>
```

### Clean Install

```bash
# Remove all node_modules and reinstall
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

## 🔍 Code Quality

### Linting

```bash
# Lint all apps
pnpm lint

# Lint only web app
cd apps/web
pnpm lint

# Fix auto-fixable issues
pnpm lint --fix
```

### Type Checking

```bash
# Type check all packages
pnpm check-types

# Type check web app only
cd apps/web
pnpm check-types
```

## 🏗️ Turborepo Commands

### Run Commands Across Workspace

```bash
# Run dev in all apps
turbo dev

# Run build in all packages
turbo build

# Run specific command
turbo run <command>
```

### Clear Turbo Cache

```bash
# Clear local cache
turbo clean

# Or manually
rm -rf .turbo
```

## 🗂️ Project Structure

### Create New Package

```bash
# Create directory
mkdir -p packages/your-package/src

# Initialize package
cd packages/your-package
pnpm init

# Add to workspace (already done via pnpm-workspace.yaml)
```

### Add Workspace Dependency

In your package.json:

```json
{
  "dependencies": {
    "@repo/types": "workspace:*"
  }
}
```

Then run:

```bash
pnpm install
```

## 🔥 Firebase

### Firebase CLI (Optional)

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in project
firebase init

# Deploy to Firebase Hosting
firebase deploy
```

## 🧹 Cleanup

### Remove Build Artifacts

```bash
# Clean Next.js build
rm -rf apps/web/.next

# Clean all node_modules
rm -rf node_modules apps/*/node_modules packages/*/node_modules
```

### Remove PWA Files

```bash
cd apps/web/public
rm -f sw.js workbox-*.js worker-*.js fallback-*.js
```

## 🔧 Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
pnpm dev -- --port 3001
```

### Module Not Found

```bash
# Reinstall dependencies
pnpm install

# Clear Next.js cache
rm -rf apps/web/.next
pnpm dev
```

### Type Errors in IDE

```bash
# Restart TypeScript server in VS Code
# CMD/CTRL + Shift + P -> "TypeScript: Restart TS Server"

# Or rebuild types
cd packages/types
pnpm check-types
```

## 📱 Testing PWA

### Development Mode

```bash
# PWA is disabled in development by default
# To enable, modify next.config.mjs:
# disable: false
```

### Production Mode

```bash
# Build and start production server
pnpm build
cd apps/web
pnpm start

# Or use Vercel CLI
npm i -g vercel
vercel dev
```

## 🌐 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Firebase Hosting

```bash
# Build
pnpm build

# Deploy
firebase deploy --only hosting
```

## 🐛 Debugging

### Enable Debug Mode

```bash
# Next.js debug
NODE_OPTIONS='--inspect' pnpm dev

# Verbose output
DEBUG=* pnpm dev
```

### Check Environment Variables

```bash
# Print all env vars (be careful with secrets!)
cd apps/web
node -e "console.log(process.env)" | grep NEXT_PUBLIC
```

## 📊 Analysis

### Bundle Analysis

Add to `apps/web/package.json`:

```json
{
  "scripts": {
    "analyze": "ANALYZE=true next build"
  }
}
```

Then install:

```bash
pnpm add -D @next/bundle-analyzer
```

Run:

```bash
pnpm analyze
```

## 🎨 Icons & Assets

### Generate PNG Icons from SVG

```bash
# Using ImageMagick (install first: brew install imagemagick)
cd apps/web/public

# Convert SVG to PNG
convert icon-192x192.svg icon-192x192.png
convert icon-512x512.svg icon-512x512.png
```

### Optimize Images

```bash
# Install sharp (already included)
pnpm add sharp

# Or use online tools:
# - https://squoosh.app/
# - https://tinypng.com/
```

## 📝 Git

### Common Git Workflows

```bash
# Initial commit
git init
git add .
git commit -m "Initial commit: Machi-Pin scaffold"

# Create .gitignore (already created)

# Push to remote
git remote add origin <your-repo-url>
git branch -M main
git push -u origin main
```

## 🎯 Quick Start Commands (Copy-Paste)

```bash
# Complete setup from scratch
cd /Users/ichiyou_kyo/machi_pin
pnpm install
cd apps/web
cp .env.example .env.local
# Edit .env.local with your Firebase config
cd ../..
pnpm dev

# Open browser to http://localhost:3000
```

## 🔗 Useful URLs

- **Local Dev**: http://localhost:3000
- **Firebase Console**: https://console.firebase.google.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind Docs**: https://tailwindcss.com/docs

---

**Tip**: Bookmark this file for quick reference during development!

