import { type NextRequest, NextResponse } from "next/server"
import { exchangeCodeForToken, getDiscordUser } from "@/lib/discord-auth"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const error = searchParams.get("error")

  if (error) {
    return NextResponse.redirect(new URL(`/?error=${error}`, request.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL("/?error=no_code", request.url))
  }

  try {
    const accessToken = await exchangeCodeForToken(code)
    const user = await getDiscordUser(accessToken)

    // Create a session token
    const sessionToken = Buffer.from(
      JSON.stringify({
        userId: user.id,
        username: user.username,
        avatar: user.avatar,
        timestamp: Date.now(),
      }),
    ).toString("base64")

    const response = NextResponse.redirect(new URL("/dashboard", request.url))
    response.cookies.set("discord_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error("Discord OAuth error:", error)
    return NextResponse.redirect(new URL("/?error=auth_failed", request.url))
  }
}
