// Next.js API Route: Save FCM Token
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { token, platform, userAgent, deviceId } = body

    if (!token) {
      return NextResponse.json({ error: "FCM token is required" }, { status: 400 })
    }

    // Extract browser from user agent
    const browser = extractBrowser(userAgent || request.headers.get("user-agent") || "")

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
          user_agent: userAgent || request.headers.get("user-agent") || "",
          browser,
          device_id: deviceId || null,
          is_active: true,
          last_used: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("token", token)

      if (error) {
        console.error("[FCM] Error updating token:", error)
        return NextResponse.json({ error: "Failed to update token" }, { status: 500 })
      }

      return NextResponse.json({ success: true, message: "Token updated" })
    }

    // Insert new token
    const { error } = await supabase.from("fcm_tokens").insert({
      token,
      platform: platform || "web",
      user_agent: userAgent || request.headers.get("user-agent") || "",
      browser,
      device_id: deviceId || null,
      is_active: true,
      last_used: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (error) {
      console.error("[FCM] Error saving token:", error)
      return NextResponse.json({ error: "Failed to save token" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Token saved successfully" })
  } catch (error: any) {
    console.error("[FCM] Error in token route:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

function extractBrowser(userAgent: string): string {
  if (userAgent.includes("Chrome")) return "chrome"
  if (userAgent.includes("Safari")) return "safari"
  if (userAgent.includes("Firefox")) return "firefox"
  if (userAgent.includes("Edge")) return "edge"
  return "unknown"
}
