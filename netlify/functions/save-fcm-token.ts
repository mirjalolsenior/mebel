// Netlify Function: Save FCM Token to Supabase
import { Handler } from "@netlify/functions"
import { createClient } from "@supabase/supabase-js"

export const handler: Handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    }
  }

  try {
    // Get environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Supabase configuration missing" }),
      }
    }

    // Parse request body
    const body = JSON.parse(event.body || "{}")
    const { token, platform, userAgent, deviceId } = body

    if (!token) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "FCM token is required" }),
      }
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Extract browser from user agent
    const browser = extractBrowser(userAgent || "")

    // Check if token already exists
    const { data: existing } = await supabase
      .from("fcm_tokens")
      .select("id")
      .eq("token", token)
      .single()

    if (existing) {
      // Update existing token
      const { error } = await supabase
        .from("fcm_tokens")
        .update({
          platform: platform || "web",
          user_agent: userAgent || "",
          browser,
          device_id: deviceId || null,
          is_active: true,
          last_used: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("token", token)

      if (error) {
        console.error("[FCM] Error updating token:", error)
        return {
          statusCode: 500,
          body: JSON.stringify({ error: "Failed to update token" }),
        }
      }

      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, message: "Token updated" }),
      }
    }

    // Insert new token
    const { error } = await supabase.from("fcm_tokens").insert({
      token,
      platform: platform || "web",
      user_agent: userAgent || "",
      browser,
      device_id: deviceId || null,
      is_active: true,
      last_used: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (error) {
      console.error("[FCM] Error saving token:", error)
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Failed to save token" }),
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: "Token saved successfully" }),
    }
  } catch (error: any) {
    console.error("[FCM] Error in save-fcm-token:", error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "Internal server error" }),
    }
  }
}

function extractBrowser(userAgent: string): string {
  if (userAgent.includes("Chrome")) return "chrome"
  if (userAgent.includes("Safari")) return "safari"
  if (userAgent.includes("Firefox")) return "firefox"
  if (userAgent.includes("Edge")) return "edge"
  return "unknown"
}
