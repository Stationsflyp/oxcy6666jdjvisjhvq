"use client"

import { useState } from "react"
import { LoginForm } from "@/components/login-form"
import { ToastContainer, type ToastProps } from "@/components/ui/toast"

let toastIdCounter = 0
function generateToastId() {
  toastIdCounter = (toastIdCounter + 1) % Number.MAX_SAFE_INTEGER
  return `toast-${Date.now()}-${toastIdCounter}`
}

export default function LoginPage() {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    const id = generateToastId()
    setToasts((prev) => [...prev, { id, message, type }])
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse-glow" />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-destructive/5 rounded-full blur-3xl animate-pulse-glow"
          style={{ animationDelay: "1s" }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 animate-scale-in">
        <LoginForm onShowToast={showToast} />
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}
