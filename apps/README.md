# Apps Folder

Энэ фолдер нь бүх deploy хийгдэх applications-ыг агуулна.

## nextn

Үндсэн Next.js веб апп, дараах технологийг ашигладаг:
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Firebase (Auth & Firestore)
- Genkit AI
- Capacitor (Mobile)

### Development

```bash
# Start dev server
nx serve nextn

# Build production
nx build nextn

# Run tests
nx test nextn

# Lint code
nx lint nextn
```

### Mobile (Android)

```bash
# Sync with Capacitor
nx cap:sync nextn

# Open in Android Studio
nx cap:open:android nextn

# Build APK
nx apk:build nextn
```
