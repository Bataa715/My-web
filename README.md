# Nx Монорепо

Энэ төсөл нь Nx монорепо архитектур ашиглан бүтээгдсэн Next.js веб апп.

## Төслийн бүтэц

```
.
├── apps/
│   └── nextn/              # Next.js веб апп
│       ├── src/            # App source code
│       ├── public/         # Static assets
│       ├── android/        # Capacitor Android
│       └── project.json    # Nx project config
├── libs/                   # Shared libraries (future)
├── tools/                  # Custom scripts & tools
├── .github/
│   └── workflows/          # CI/CD workflows
├── nx.json                 # Nx workspace config
├── tsconfig.base.json      # Base TypeScript config
└── package.json            # Root dependencies
```

```bash
# Development server (port 9002)
npm run dev

# Production build
npm run build

# Tests ажиллуулах
npm run test

# Lint шалгах
npm run lint

# Nx graph харах
npm run nx:graph

# Affected projects build хийх
npm run nx:affected

# Vercel руу deploy
npm run deploy

# Android APK build
npm run apk:build
npm run apk:release
```

## CI/CD

Автомат deployment:
- **Main branch** - Production (Vercel)
- **Develop branch** - Preview (Vercel)
- **Pull Requests** - Preview (Vercel)

Дэлгэрэнгүй [DEPLOYMENT.md](./DEPLOYMENT.md) файлаас үзнэ үү.

## Project Structure

```
.
├── src/                    # Next.js application source
├── android/                # Capacitor Android project
├── public/                 # Static assets
├── .github/workflows/      # GitHub Actions CI/CD
├── project.json           # Nx project configuration
├── nx.json                # Nx workspace configuration
└── vercel.json            # Vercel deployment config
```

## Технологи

- **Nx Monorepo** - Workspace удирдлага, build optimization
- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **Firebase** - Authentication & Firestore database
- **Genkit AI** - AI integration
- **Capacitor** - Cross-platform mobile development
- **Vercel** - Cloud deployment platform
- **GitHub Actions** - CI/CD automation

## Хөгжүүлэлтийн орчин

Node.js 20+ шаардлагатай

```bash
npm install --legacy-peer-deps
npm run dev
```
