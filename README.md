# Sherdor Mebel - Mebel Boshqaruv Tizimi

Zamonaviy mebel kompaniyasi uchun real-time boshqaruv web-ilovasi.

## Xususiyatlar

- 📦 Tovarlar boshqaruvi
- 📋 Zakazlar nazorati
- 👥 Mijozlar bazasi (oddiy va doimiy mijozlar)
- 🔐 Admin panel (parol: "sherzod")
- 📱 PWA qo'llab-quvvatlash
- 🔄 Real-time yangilanishlar
- 📊 Statistika va hisobotlar

## Texnologiyalar

- **Frontend**: Next.js 14, React 19, TypeScript
- **Backend**: Supabase (PostgreSQL, Real-time)
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI, shadcn/ui
- **PWA**: Service Worker, Web App Manifest

## Deployment

### Netlify

1. Repository'ni Netlify'ga ulang
2. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
3. Environment variables qo'shing:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### Vercel

1. Repository'ni Vercel'ga ulang
2. Environment variables qo'shing
3. Supabase integration qo'shing

## Lokal ishga tushirish

\`\`\`bash
# Dependencies o'rnatish
npm install

# Development server ishga tushirish
npm run dev

# Production build
npm run build
npm start
\`\`\`

## Database Schema

Loyiha 4 ta asosiy jadval ishlatadi:

1. **products** - Tovarlar ma'lumotlari
2. **orders** - Zakazlar ma'lumotlari  
3. **clients** - Oddiy mijozlar
4. **regular_clients** - Doimiy mijozlar

SQL skriptlar `scripts/` papkasida joylashgan.

## Admin Panel

Admin panel `/admin` yo'lida joylashgan. Kirish uchun parol: **sherzod**

## PWA Xususiyatlari

- Offline ishlash imkoniyati
- Push notifications
- App o'rnatish imkoniyati
- Muddati tugash haqida ogohlantirishlar

## Litsenziya

Bu loyiha Sherdor Mebel kompaniyasi uchun maxsus ishlab chiqilgan.
