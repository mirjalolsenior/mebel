// Netlify Function: Send Push Notification to All Active Tokens
import { Handler } from "@netlify/functions"
import { initializeApp, cert, getApps } from "firebase-admin/app"
import { getMessaging } from "firebase-admin/messaging"
import { createClient } from "@supabase/supabase-js"

// Initialize Firebase Admin (only once)
let adminMessaging: any = null

function getFirebaseAdminMessaging() {
  if (adminMessaging) {
    return adminMessaging
  }

  try {
    const apps = getApps()
    let app

    if (apps.length === 0) {
      const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY

      if (!serviceAccountKey) {
        throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set")
      }

      const serviceAccount = JSON.parse(serviceAccountKey)

      app = initializeApp({
        credential: cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id,
      })
    } else {
      app = apps[0]
    }

    adminMessaging = getMessaging(app)
    return adminMessaging
  } catch (error) {
    console.error("[FCM Admin] Failed to initialize:", error)
    throw error
  }
}

export const handler: Handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    }
  }

  try {
    // Get Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Supabase configuration missing" }),
      }
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Parse request body
    const body = JSON.parse(event.body || "{}")
    const { title, body: notificationBody, icon, data } = body

    if (!title || !notificationBody) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Title and body are required" }),
      }
    }

    // Get all active tokens
    const { data: tokens, error: tokensError } = await supabase
      .from("fcm_tokens")
      .select("id, token")
      .eq("is_active", true)

    if (tokensError || !tokens || tokens.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, successCount: 0, failureCount: 0, message: "No active tokens found" }),
      }
    }

    // Get Firebase Admin Messaging
    const messaging = getFirebaseAdminMessaging()

    // Prepare notification payload
    const baseMessage = {
      notification: {
        title,
        body: notificationBody,
        imageUrl: data?.image,
      },
      data: {
        ...data,
        icon: icon || "/icon-192.jpg",
        badge: data?.badge || "/icon-192.jpg",
        click_action: data?.url || "/",
      },
      webpush: {
        notification: {
          title,
          body: notificationBody,
          icon: icon || "/icon-192.jpg",
          badge: data?.badge || "/icon-192.jpg",
          requireInteraction: data?.requireInteraction !== false,
          tag: data?.tag || "default",
        },
        fcmOptions: {
          link: data?.url || "/",
        },
      },
      apns: {
        payload: {
          aps: {
            alert: {
              title,
              body: notificationBody,
            },
            sound: "default",
            badge: 1,
          },
        },
      },
    }

    // Send to all tokens
    const messages = tokens.map((t: any) => ({
      ...baseMessage,
      token: t.token,
    }))

    try {
      const response = await messaging.sendEach(messages)

      // Log results to Supabase
      for (let i = 0; i < response.responses.length; i++) {
        const resp = response.responses[i]
        const tokenData = tokens[i]

        await supabase.from("fcm_notification_logs").insert({
          token_id: tokenData.id,
          title,
          body: notificationBody,
          icon: icon || "/icon-192.jpg",
          data: data || {},
          status: resp.success ? "sent" : "failed",
          message_id: resp.success ? resp.messageId : undefined,
          error_message: resp.success ? undefined : resp.error?.message,
          sent_at: new Date().toISOString(),
        })

        // Mark token as inactive if invalid
        if (
          resp.error &&
          (resp.error.code === "messaging/invalid-registration-token" ||
            resp.error.code === "messaging/registration-token-not-registered")
        ) {
          await supabase.from("fcm_tokens").update({ is_active: false }).eq("token", tokenData.token)
        }
      }

      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          successCount: response.successCount,
          failureCount: response.failureCount,
          total: tokens.length,
        }),
      }
    } catch (error: any) {
      console.error("[FCM] Error sending batch notifications:", error)
      return {
        statusCode: 500,
        body: JSON.stringify({ success: false, error: error.message }),
      }
    }
  } catch (error: any) {
    console.error("[FCM] Error in send-push-to-all:", error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "Internal server error" }),
    }
  }
}
