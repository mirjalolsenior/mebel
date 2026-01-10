import { type NextRequest, NextResponse } from "next/server"

// FCM Push Notification Sender
// Uses Netlify Function for sending notifications

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, body: notificationBody, icon, data, token, tokens } = body

    if (!title || !notificationBody) {
      return NextResponse.json({ error: "Title and body are required" }, { status: 400 })
    }

    // Get the base URL (either Netlify or local)
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL || "http://localhost:8888"
    const netlifyFunctionUrl = `${baseUrl}/.netlify/functions/${tokens || token ? "send-push-notification" : "send-push-to-all"}`

    // Forward request to Netlify Function
    const response = await fetch(netlifyFunctionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        body: notificationBody,
        icon,
        data,
        token,
        tokens,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      return NextResponse.json(result, { status: response.status })
    }

    return NextResponse.json({
      success: true,
      message: `Push notification sent via FCM`,
      ...result,
    })
  } catch (error: any) {
    console.error("[FCM] Send push error:", error)
    return NextResponse.json({ error: error.message || "Failed to send push notification" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: "FCM Push sending endpoint ready. Use POST to send notifications.",
    note: "Uses Firebase Cloud Messaging (FCM) for push notifications"
  })
}
