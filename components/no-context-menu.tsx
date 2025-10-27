"use client"

import type React from "react"

import { useEffect } from "react"

export function NoContextMenu({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
    }

    document.addEventListener("contextmenu", handleContextMenu)

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu)
    }
  }, [])

  return <>{children}</>
}
