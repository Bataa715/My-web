# Environment Variables Setup Guide

## 📋 Environment Variables-ийг хэрхэн тохируулах

### 1️⃣ Local Development

#### .env.local файл үүсгэх
```bash
# Root folder-с
cp apps/nextn/.env.example apps/nextn/.env.local
```

#### Шаардлагатай environment variables:

**Firebase Configuration:**
- `NEXT_PUBLIC_FIREBASE_API_KEY` - Firebase API key
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - Firebase project ID
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- `NEXT_PUBLIC_FIREBASE_APP_ID` - Firebase app ID
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` - Firebase measurement ID

**Google AI/Gemini:**
- `GOOGLE_API_KEY` - Google AI Studio API key (https://aistudio.google.com/app/apikey)

#### ⚠️ Аюулгүй байдлын анхааруулга:
- `.env.local` файл **ХЭЗЭЭ Ч** GitHub руу commit **БҮГҮ ХИЙГЭЭРЭЙ**
- `.gitignore` файл `.env*.local`-ийг ignore хийсэн байх ёстой
- Production keys-ийг хэзээ ч git history-д оруулж болохгүй

### 2️⃣ Vercel Deployment

#### Environment Variables нэмэх:
1. [Vercel Dashboard](https://vercel.com) нэвтрэх
2. Төслөө сонгох
3. **Settings** > **Environment Variables** хэсэг рүү орох
4. Дараах variables-ийг **БҮГДИЙГ** нэмэх:

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
GOOGLE_API_KEY
```

#### Environment сонгох:
Хэрэв бүх орчинд ижил утга ашиглах бол:
- ✅ Production
- ✅ Preview
- ✅ Development

Бүгдийг идэвхжүүлээрэй!

### 3️⃣ GitHub Actions CI/CD

#### GitHub Secrets нэмэх:
1. GitHub repository > **Settings**
2. **Secrets and variables** > **Actions**
3. **New repository secret** дарж дараах secrets-ийг нэмэх:

**Environment Variables:**
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
GOOGLE_API_KEY
```

**Vercel Deployment:**
```
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
```

**Nx Cloud (Опциональ):**
```
NX_CLOUD_ACCESS_TOKEN
```

### 4️⃣ Vercel CLI Setup

#### Vercel Token авах:
```bash
# Vercel-д нэвтрэх
npx vercel login

# Project холбох
npx vercel link
```

Энэ нь `.vercel` folder үүсгэж, дотор нь project IDs байна.

#### Project IDs олох:
```bash
# .vercel/project.json файлаас
cat .vercel/project.json
```

Output:
```json
{
  "projectId": "prj_xxxxx",
  "orgId": "team_xxxxx"
}
```

Эдгээрийг GitHub Secrets болон CI/CD workflow-д ашиглана.

## 🔒 Аюулгүй байдал

### ✅ Зөвшөөрөгдсөн:
- `.env.example` - Template файл, keys-гүй
- Environment variables Vercel dashboard дээр
- GitHub Secrets дээр sensitive keys

### ❌ Хориотой:
- `.env.local` - Git-д commit хийхгүй
- API keys GitHub code-д шууд бичихгүй
- Production keys public repository-д
- Sensitive data plain text-ээр

## 🧪 Тест хийх

```bash
# Local тестлэх
npm run dev

# Environment variables шалгах
npm run build

# Production build тестлэх
npm run start
```

## 📝 Checklist

Local Development:
- [ ] `.env.local` файл үүссэн
- [ ] Бүх required variables оруулсан
- [ ] `.gitignore`-д `.env*.local` байгаа
- [ ] Local build амжилттай

Vercel:
- [ ] Бүх environment variables Vercel дээр нэмэгдсэн
- [ ] Production, Preview, Development орчинд тохируулсан
- [ ] Vercel CLI холбогдсон
- [ ] Test deployment хийсэн

GitHub:
- [ ] Бүх secrets GitHub Actions-д нэмэгдсэн
- [ ] Vercel tokens тохируулсан
- [ ] CI/CD workflow ажиллаж байгаа
- [ ] Test push амжилттай

## 🆘 Асуудал гарвал

### Build үед "Firebase: Error (auth/invalid-api-key)"
- Vercel Dashboard > Environment Variables шалгах
- Бүх `NEXT_PUBLIC_*` variables зөв байгаа эсэхийг шалгах
- Redeploy хийх

### CI/CD алдаа
- GitHub Secrets бүрэн эсэхийг шалгах
- Workflow logs шалгах
- Environment variables case-sensitive байгааг санах

### Local дээр API key ажиллахгүй
- `apps/nextn/.env.local` файл байгаа эсэхийг шалгах
- Next.js server restart хийх (`npm run dev`)
- Browser cache цэвэрлэх

## 📚 Холбоосууд

- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Firebase Setup](https://firebase.google.com/docs/web/setup)
- [Google AI Studio](https://aistudio.google.com/)
