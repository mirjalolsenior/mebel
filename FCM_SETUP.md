# Firebase Cloud Messaging (FCM) Setup Guide

## Environment Variables Required

### Next.js Environment Variables (`.env.local` or Netlify Environment Variables)

#### Firebase Client Config (Public)
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key
```

#### Firebase Admin (Server-side - Netlify Functions)
```
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}
FIREBASE_PROJECT_ID=your_project_id
```

#### Supabase
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key (for Netlify Functions)
```

#### Site URL
```
NEXT_PUBLIC_SITE_URL=https://your-site.netlify.app
```

## Firebase Setup Steps

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or select existing
   - Enable Cloud Messaging API

2. **Get Firebase Config**
   - Go to Project Settings > General
   - Scroll down to "Your apps" section
   - Click on Web app icon (</>) or add web app
   - Copy the config values (apiKey, authDomain, projectId, etc.)

3. **Get VAPID Key**
   - Go to Project Settings > Cloud Messaging
   - Scroll to "Web configuration"
   - Copy the "Web Push certificates" key pair
   - Use the public key as `NEXT_PUBLIC_FIREBASE_VAPID_KEY`

4. **Get Service Account Key**
   - Go to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Download the JSON file
   - Copy the entire JSON content as `FIREBASE_SERVICE_ACCOUNT_KEY` (escape quotes for env vars)

5. **Enable Cloud Messaging API**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Select your Firebase project
   - Enable "Firebase Cloud Messaging API"

## Supabase Setup Steps

1. **Run Migration SQL**
   - Go to Supabase Dashboard > SQL Editor
   - Run the migration script: `scripts/006_fcm_tokens_migration.sql`
   - This creates the `fcm_tokens` and `fcm_notification_logs` tables

## Netlify Setup Steps

1. **Set Environment Variables**
   - Go to Netlify Dashboard > Site Settings > Environment Variables
   - Add all the environment variables listed above
   - For `FIREBASE_SERVICE_ACCOUNT_KEY`, paste the entire JSON (Netlify handles multi-line values)

2. **Deploy**
   - Push code to your connected Git repository
   - Netlify will automatically build and deploy
   - Netlify Functions will be automatically detected from `netlify/functions/` directory

## Testing

See testing instructions below for Android and iOS.
