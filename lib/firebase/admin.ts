// Firebase Admin SDK for server-side operations (Netlify Functions)
import { initializeApp, getApps, cert, App } from "firebase-admin/app"
import { getMessaging, Messaging } from "firebase-admin/messaging"

let adminApp: App | null = null
let adminMessaging: Messaging | null = null

export function getFirebaseAdminApp(): App | null {
  if (!adminApp) {
    const apps = getApps()
    if (apps.length === 0) {
      // Get Firebase Admin credentials from environment variables
      const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
      
      if (!serviceAccountKey) {
        console.error("[FCM Admin] FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set")
        return null
      }

      try {
        // Parse the service account key (should be a JSON string)
        const serviceAccount = JSON.parse(serviceAccountKey)
        
        adminApp = initializeApp({
          credential: cert(serviceAccount),
          projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id,
        })
        
        console.log("[FCM Admin] Firebase Admin initialized successfully")
      } catch (error) {
        console.error("[FCM Admin] Failed to initialize Firebase Admin:", error)
        return null
      }
    } else {
      adminApp = apps[0]
    }
  }

  return adminApp
}

export function getFirebaseAdminMessaging(): Messaging | null {
  if (!adminMessaging) {
    const app = getFirebaseAdminApp()
    if (!app) {
      return null
    }

    try {
      adminMessaging = getMessaging(app)
      return adminMessaging
    } catch (error) {
      console.error("[FCM Admin] Failed to get Firebase Admin Messaging:", error)
      return null
    }
  }

  return adminMessaging
}

export interface FCMNotificationPayload {
  title: string
  body: string
  icon?: string
  image?: string
  data?: Record<string, any>
  badge?: string
  requireInteraction?: boolean
  tag?: string
}

export interface FCMSendResult {
  success: boolean
  messageId?: string
  error?: string
}

export async function sendFCMNotification(
  token: string,
  payload: FCMNotificationPayload
): Promise<FCMSendResult> {
  const messaging = getFirebaseAdminMessaging()
  if (!messaging) {
    return {
      success: false,
      error: "Firebase Admin Messaging not initialized",
    }
  }

  try {
    const message = {
      token,
      notification: {
        title: payload.title,
        body: payload.body,
        imageUrl: payload.image,
      },
      data: {
        ...payload.data,
        icon: payload.icon || "/icon-192.jpg",
        badge: payload.badge || "/icon-192.jpg",
        click_action: payload.data?.url || "/",
      },
      webpush: {
        notification: {
          title: payload.title,
          body: payload.body,
          icon: payload.icon || "/icon-192.jpg",
          badge: payload.badge || "/icon-192.jpg",
          requireInteraction: payload.requireInteraction ?? true,
          tag: payload.tag || "default",
        },
        fcmOptions: {
          link: payload.data?.url || "/",
        },
      },
      apns: {
        payload: {
          aps: {
            alert: {
              title: payload.title,
              body: payload.body,
            },
            sound: "default",
            badge: 1,
          },
        },
      },
    }

    const messageId = await messaging.send(message)
    
    return {
      success: true,
      messageId,
    }
  } catch (error: any) {
    console.error("[FCM Admin] Error sending notification:", error)
    
    let errorMessage = error.message || "Unknown error"
    
    // Handle specific FCM errors
    if (error.code === "messaging/invalid-registration-token" || 
        error.code === "messaging/registration-token-not-registered") {
      errorMessage = "Invalid or unregistered token"
    } else if (error.code === "messaging/message-rate-exceeded") {
      errorMessage = "Message rate exceeded"
    }
    
    return {
      success: false,
      error: errorMessage,
    }
  }
}

export async function sendFCMNotificationToMultiple(
  tokens: string[],
  payload: FCMNotificationPayload
): Promise<{ success: number; failed: number; errors: Array<{ token: string; error: string }> }> {
  const messaging = getFirebaseAdminMessaging()
  if (!messaging) {
    return {
      success: 0,
      failed: tokens.length,
      errors: tokens.map((token) => ({ token: token.substring(0, 20) + "...", error: "Firebase Admin not initialized" })),
    }
  }

  const results = {
    success: 0,
    failed: 0,
    errors: [] as Array<{ token: string; error: string }>,
  }

  // Use sendEach for multiple tokens (more efficient than send)
  const messages = tokens.map((token) => ({
    token,
    notification: {
      title: payload.title,
      body: payload.body,
      imageUrl: payload.image,
    },
    data: {
      ...payload.data,
      icon: payload.icon || "/icon-192.jpg",
      badge: payload.badge || "/icon-192.jpg",
      click_action: payload.data?.url || "/",
    },
    webpush: {
      notification: {
        title: payload.title,
        body: payload.body,
        icon: payload.icon || "/icon-192.jpg",
        badge: payload.badge || "/icon-192.jpg",
        requireInteraction: payload.requireInteraction ?? true,
        tag: payload.tag || "default",
      },
      fcmOptions: {
        link: payload.data?.url || "/",
      },
    },
    apns: {
      payload: {
        aps: {
          alert: {
            title: payload.title,
            body: payload.body,
          },
          sound: "default",
          badge: 1,
        },
      },
    },
  }))

  try {
    const response = await messaging.sendEach(messages)
    
    results.success = response.successCount
    results.failed = response.failureCount
    
    // Collect errors
    response.responses.forEach((resp, index) => {
      if (!resp.success && resp.error) {
        results.errors.push({
          token: tokens[index].substring(0, 20) + "...",
          error: resp.error.message || "Unknown error",
        })
      }
    })
  } catch (error: any) {
    console.error("[FCM Admin] Error sending batch notifications:", error)
    results.failed = tokens.length
    results.errors = tokens.map((token) => ({
      token: token.substring(0, 20) + "...",
      error: error.message || "Unknown error",
    }))
  }

  return results
}
