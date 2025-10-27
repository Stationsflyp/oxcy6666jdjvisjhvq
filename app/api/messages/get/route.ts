import { NextResponse } from "next/server"

export async function GET() {
  try {
    const backendUrl = process.env.BACKEND_URL || "http://theo.hidencloud.com:24642"

    console.log("[v0] Attempting to fetch messages from:", `${backendUrl}/get`)

    const response = await fetch(`${backendUrl}/get`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    console.log("[v0] Response status:", response.status)
    console.log("[v0] Response ok:", response.ok)

    if (!response.ok) {
      console.error(`[v0] Backend error: ${response.status} ${response.statusText}`)
      return NextResponse.json(
        {
          messages: [],
          error: `Backend server returned ${response.status}`,
        },
        { status: 200 },
      )
    }

    const contentType = response.headers.get("content-type")
    console.log("[v0] Content-Type:", contentType)

    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text()
      console.error("[v0] Backend did not return JSON:", text.substring(0, 100))
      return NextResponse.json(
        {
          messages: [],
          error: "Backend server is not returning JSON",
        },
        { status: 200 },
      )
    }

    const messages = await response.json()
    console.log("[v0] Received messages count:", Array.isArray(messages) ? messages.length : "not an array")

    if (!Array.isArray(messages)) {
      console.error("[v0] Backend returned non-array:", messages)
      return NextResponse.json({ messages: [] }, { status: 200 })
    }

    return NextResponse.json({ messages })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("[v0] Error fetching messages:", errorMessage)
    console.error("[v0] Full error:", error)
    return NextResponse.json(
      {
        messages: [],
        error: errorMessage,
      },
      { status: 200 },
    )
  }
}
