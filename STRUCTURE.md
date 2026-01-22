# Workspace Overview

```
my-web-workspace/
├── apps/
│   ├── nextn/                  # Main Next.js Application
│   │   ├── src/                # Source code
│   │   │   ├── app/            # Next.js app router pages
│   │   │   ├── components/     # React components
│   │   │   ├── contexts/       # React context providers
│   │   │   ├── firebase/       # Firebase configuration
│   │   │   ├── hooks/          # Custom hooks
│   │   │   ├── lib/            # Utilities & helpers
│   │   │   ├── ai/             # AI flows (Genkit)
│   │   │   └── data/           # Static data
│   │   ├── public/             # Static assets
│   │   ├── android/            # Capacitor Android project
│   │   ├── docs/               # Project documentation
│   │   ├── project.json        # Nx project configuration
│   │   ├── tsconfig.json       # TypeScript config
│   │   ├── next.config.ts      # Next.js config
│   │   ├── tailwind.config.ts  # Tailwind CSS config
│   │   └── postcss.config.mjs  # PostCSS config
│   └── README.md
│
├── libs/                       # Shared Libraries
│   └── README.md               # (Future: ui, utils, types)
│
├── tools/                      # Custom Scripts & Tools
│   └── README.md
│
├── .github/
│   └── workflows/              # CI/CD GitHub Actions
│       ├── ci-cd.yml           # Main CI/CD pipeline
│       └── nx-cloud.yml        # Nx Cloud integration
│
├── nx.json                     # Nx workspace configuration
├── tsconfig.base.json          # Base TypeScript configuration
├── tsconfig.json               # Root TypeScript configuration
├── package.json                # Root dependencies
├── vercel.json                 # Vercel deployment config
├── .gitignore                  # Git ignore rules
├── .nxignore                   # Nx ignore rules
├── README.md                   # Main documentation
└── DEPLOYMENT.md               # Deployment guide
```

## Key Features

### 🏗️ Nx Monorepo
- Optimized build caching
- Dependency graph visualization
- Parallel task execution
- Affected project detection

### 🚀 Next.js 15
- App Router architecture
- Server Components
- Optimized image handling
- TypeScript integration

### 🔥 Firebase
- Authentication
- Firestore database
- Security rules
- Client/Server SDK

### 🤖 AI Integration
- Genkit AI flows
- Auto-generate content
- Chart analysis
- Multi-language support

### 📱 Mobile Ready
- Capacitor integration
- Android build support
- Cross-platform capabilities

### 🎨 Modern UI
- Tailwind CSS
- Radix UI components
- Dark/Light theme
- Responsive design

### ⚙️ CI/CD
- GitHub Actions workflows
- Automated testing
- Vercel deployment
- Nx Cloud caching

## Quick Start

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev

# Build for production
npm run build

# View dependency graph
npm run nx:graph

# Run affected builds only
npm run nx:affected
```

## Project Commands

### Development
```bash
nx serve nextn           # Start dev server
nx build nextn           # Production build
nx lint nextn            # Lint code
nx test nextn            # Run tests
```

### Mobile (Android)
```bash
nx cap:sync nextn        # Sync Capacitor
nx cap:open:android nextn # Open Android Studio
nx apk:build nextn       # Build debug APK
nx apk:release nextn     # Build release APK
```

### Nx Utilities
```bash
nx graph                 # Visualize dependency graph
nx affected:graph        # Show affected projects
nx reset                 # Clear Nx cache
nx show project nextn    # Show project details
```

## Architecture Decisions

### Monorepo Structure
- **apps/**: Deployable applications
- **libs/**: Shared, reusable libraries
- **tools/**: Development scripts

### Benefits
✅ Code sharing across projects  
✅ Consistent tooling & configuration  
✅ Atomic commits across multiple apps  
✅ Faster CI with smart caching  
✅ Better dependency management  

### Future Scalability
- Add new apps easily (`nx g @nx/next:app`)
- Extract shared UI to libs/ui
- Create shared utilities in libs/utils
- Build design system in libs/design-system

## Configuration Files

- **nx.json** - Workspace config, caching, task defaults
- **project.json** - Per-project targets & configurations
- **tsconfig.base.json** - Shared TypeScript settings
- **vercel.json** - Deployment configuration
- **.github/workflows/** - CI/CD automation

## Documentation

- [README.md](README.md) - Main documentation
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide
- [apps/README.md](apps/README.md) - Applications overview
- [libs/README.md](libs/README.md) - Libraries guide
- [tools/README.md](tools/README.md) - Custom tools

## Learn More

- [Nx Documentation](https://nx.dev)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
