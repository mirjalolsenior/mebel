import { NextResponse } from "next/server"
import { checkAndSendDeliveryNotifications, checkAndSendInventoryNotifications } from "@/lib/push-notification-service"
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const maxDuration = 60

export async function GET(request: Request) {
  try {
    const triggeredAt = new Date().toISOString()
    
    // Authorization: Check header first, then query parameter as fallback
    const authHeader = request.headers.get("authorization")
    const url = new URL(request.url)
    const queryKey = url.searchParams.get("key")
    
    const expectedSecret = process.env.CRON_SECRET
    let isAuthorized = false
    let authSource = "unknown"
    
    if (expectedSecret) {
      // Check Bearer token in Authorization header
      if (authHeader === `Bearer ${expectedSecret}`) {
        isAuthorized = true
        authSource = "header"
      }
      // Fallback: Check query parameter
      else if (queryKey === expectedSecret) {
        isAuthorized = true
        authSource = "query"
      }
    }
    
    // Reject if authorization failed and secret is set
    if (expectedSecret && !isAuthorized) {
      console.error(`[Cron] Unauthorized attempt at ${triggeredAt}. Auth source attempted: ${authSource}`)
      return NextResponse.json(
        {
          ok: false,
          error: "Unauthorized",
          triggeredAt,
          source: "scheduler",
        },
        { status: 401 },
      )
    }

    console.log(`[Cron] Starting automatic notification checks at ${triggeredAt} (UTC)`)
    console.log(`[Cron] Authorization verified via: ${authSource}`)
    const startTime = Date.now()

    const [deliveryResult, inventoryResult] = await Promise.allSettled([
      checkAndSendDeliveryNotifications(),
      checkAndSendInventoryNotifications(10),
    ])

    const duration = Date.now() - startTime

    const completedAt = new Date().toISOString()
    console.log(`[Cron] Notification checks completed in ${duration}ms`)

    return NextResponse.json(
      {
        ok: true,
        triggeredAt,
        completedAt,
        source: "scheduler",
        duration: `${duration}ms`,
        checks: [
          {
            type: "delivery_dates",
            status: deliveryResult.status === "fulfilled" ? "completed" : "failed",
            error: deliveryResult.status === "rejected" ? deliveryResult.reason?.message : null,
          },
          {
            type: "inventory",
            status: inventoryResult.status === "fulfilled" ? "completed" : "failed",
            error: inventoryResult.status === "rejected" ? inventoryResult.reason?.message : null,
          },
        ],
      },
      { status: 200 },
    )
  } catch (error) {
    const triggeredAt = new Date().toISOString()
    console.error(`[Cron] Error in push-cron endpoint at ${triggeredAt}:`, error)
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
        triggeredAt,
        source: "scheduler",
      },
      { status: 500 },
    )
  }
}

export async function HEAD() {
  return NextResponse.json({ ok: true })
}


export async function POST(request: Request) {
  // Reuse same auth + logic via GET handler
  return GET(request)
}
