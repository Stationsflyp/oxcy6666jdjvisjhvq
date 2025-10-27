"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ChatInterface } from "@/components/chat-interface"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { SettingsPanel } from "@/components/settings-panel"
import { OwnerPanel } from "@/components/owner-panel"
import { MaintenanceScreen } from "@/components/maintenance-screen"
import { ToastContainer, type ToastProps } from "@/components/ui/toast"
import { Loader2 } from "lucide-react"

let toastIdCounter = 0
function generateToastId() {
  toastIdCounter = (toastIdCounter + 1) % Number.MAX_SAFE_INTEGER
  return `toast-${Date.now()}-${toastIdCounter}`
}

export default function DashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState("")
  const [language, setLanguage] = useState<"en" | "es">("en")
  const [toasts, setToasts] = useState<ToastProps[]>([])
  const [activeView, setActiveView] = useState<"chat" | "settings" | "owner">("chat")
  const [theme, setTheme] = useState<"dark" | "light">("dark")
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false)

  useEffect(() => {
    const checkAuth = () => {
      const auth = localStorage.getItem("vliz_auth")
      const storedUsername = localStorage.getItem("vliz_username")
      const storedLanguage = localStorage.getItem("vliz_language") as "en" | "es"
      const storedTheme = localStorage.getItem("vliz_theme") as "dark" | "light"
      const storedSound = localStorage.getItem("vliz_sound")
      const maintenanceMode = localStorage.getItem("vliz_maintenance") === "true"

      if (!auth || !storedUsername) {
        router.replace("/login")
        return
      }

      setIsAuthenticated(true)
      setUsername(storedUsername)
      setLanguage(storedLanguage || "en")
      setTheme(storedTheme || "dark")
      setSoundEnabled(storedSound !== "false")
      setIsMaintenanceMode(maintenanceMode)
      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    const id = generateToastId()
    setToasts((prev) => [...prev, { id, message, type }])
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const handleLanguageChange = (newLang: "en" | "es") => {
    setLanguage(newLang)
    localStorage.setItem("vliz_language", newLang)
  }

  const handleThemeChange = (newTheme: "dark" | "light") => {
    setTheme(newTheme)
    localStorage.setItem("vliz_theme", newTheme)
    document.documentElement.classList.toggle("light", newTheme === "light")
  }

  const handleSoundToggle = (enabled: boolean) => {
    setSoundEnabled(enabled)
    localStorage.setItem("vliz_sound", enabled.toString())
  }

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  if (isMaintenanceMode) {
    return <MaintenanceScreen language={language} />
  }

  return (
    <div className={`min-h-screen flex ${theme === "light" ? "light" : ""}`}>
      <DashboardSidebar
        username={username}
        language={language}
        activeView={activeView}
        onViewChange={setActiveView}
        onLanguageChange={handleLanguageChange}
      />

      <main className="flex-1 bg-background">
        {activeView === "chat" && (
          <ChatInterface language={language} onShowToast={showToast} soundEnabled={soundEnabled} />
        )}
        {activeView === "settings" && (
          <SettingsPanel
            language={language}
            theme={theme}
            soundEnabled={soundEnabled}
            onThemeChange={handleThemeChange}
            onSoundToggle={handleSoundToggle}
          />
        )}
        {activeView === "owner" && <OwnerPanel language={language} />}
      </main>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}
