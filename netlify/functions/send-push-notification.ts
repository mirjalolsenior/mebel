// Netlify Function: Send Push Notification via FCM
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
    // Parse request body
    const body = JSON.parse(event.body || "{}")
    const { title, body: notificationBody, icon, data, token, tokens } = body

    if (!title || !notificationBody) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Title and body are required" }),
      }
    }

    // Get Firebase Admin Messaging
    const messaging = getFirebaseAdminMessaging()

    // Get Supabase client for logging
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    let supabase: any = null
    if (supabaseUrl && supabaseKey) {
      supabase = createClient(supabaseUrl, supabaseKey)
    }

    // Prepare notification payload
    const message = {
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

    // Send to single token or multiple tokens
    if (token) {
      // Single token
      message.token = token

      try {
        const messageId = await messaging.send(message)

        // Log to Supabase if available
        if (supabase) {
          const { data: tokenData } = await supabase
            .from("fcm_tokens")
            .select("id")
            .eq("token", token)
            .single()

          if (tokenData) {
            await supabase.from("fcm_notification_logs").insert({
              token_id: tokenData.id,
              title,
              body: notificationBody,
              icon: icon || "/icon-192.jpg",
              data: data || {},
              status: "sent",
              message_id: messageId,
              sent_at: new Date().toISOString(),
            })
          }
        }

        return {
          statusCode: 200,
          body: JSON.stringify({ success: true, messageId }),
        }
      } catch (error: any) {
        // Log error
        if (supabase) {
          const { data: tokenData } = await supabase
            .from("fcm_tokens")
            .select("id")
            .eq("token", token)
            .single()

          if (tokenData) {
            await supabase.from("fcm_notification_logs").insert({
              token_id: tokenData.id,
              title,
              body: notificationBody,
              icon: icon || "/icon-192.jpg",
              data: data || {},
              status: "failed",
              error_message: error.message,
              sent_at: new Date().toISOString(),
            })

            // Mark token as inactive if invalid
            if (
              error.code === "messaging/invalid-registration-token" ||
              error.code === "messaging/registration-token-not-registered"
            ) {
              await supabase.from("fcm_tokens").update({ is_active: false }).eq("token", token)
            }
          }
        }

        return {
          statusCode: 400,
          body: JSON.stringify({ success: false, error: error.message }),
        }
      }
    } else if (tokens && Array.isArray(tokens) && tokens.length > 0) {
      // Multiple tokens
      const messages = tokens.map((t: string) => ({
        ...message,
        token: t,
      }))

      try {
        const response = await messaging.sendEach(messages)

        // Log results to Supabase if available
        if (supabase) {
          for (let i = 0; i < response.responses.length; i++) {
            const resp = response.responses[i]
            const token = tokens[i]

            const { data: tokenData } = await supabase
              .from("fcm_tokens")
              .select("id")
              .eq("token", token)
              .single()

            if (tokenData) {
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
                await supabase.from("fcm_tokens").update({ is_active: false }).eq("token", token)
              }
            }
          }
        }

        return {
          statusCode: 200,
          body: JSON.stringify({
            success: true,
            successCount: response.successCount,
            failureCount: response.failureCount,
          }),
        }
      } catch (error: any) {
        return {
          statusCode: 500,
          body: JSON.stringify({ success: false, error: error.message }),
        }
      }
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Either 'token' or 'tokens' array is required" }),
      }
    }
  } catch (error: any) {
    console.error("[FCM] Error in send-push-notification:", error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "Internal server error" }),
    }
  }
}
