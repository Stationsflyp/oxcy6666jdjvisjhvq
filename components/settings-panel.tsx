"use client"

import { useState, useEffect } from "react"
import { Volume2, VolumeX, Bell, BellOff, Palette, Moon, Sun, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ConnectionStatus } from "./connection-status"

interface SettingsPanelProps {
  language: "en" | "es"
}

const translations = {
  en: {
    title: "Settings",
    theme: "Theme",
    themeLight: "Light Mode",
    themeDark: "Dark Mode",
    sound: "Sound Effects",
    soundDesc: "Play sound when receiving messages",
    notifications: "Notifications",
    notificationsDesc: "Show desktop notifications",
    appearance: "Appearance & Preferences",
    systemStatus: "System Status",
  },
  es: {
    title: "Configuración",
    theme: "Tema",
    themeLight: "Modo Claro",
    themeDark: "Modo Oscuro",
    sound: "Efectos de Sonido",
    soundDesc: "Reproducir sonido al recibir mensajes",
    notifications: "Notificaciones",
    notificationsDesc: "Mostrar notificaciones de escritorio",
    appearance: "Apariencia y Preferencias",
    systemStatus: "Estado del Sistema",
  },
}

export function SettingsPanel({ language }: SettingsPanelProps) {
  const t = translations[language]
  const [theme, setTheme] = useState<"light" | "dark">("dark")
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null
    const savedSound = localStorage.getItem("soundEnabled")
    const savedNotifications = localStorage.getItem("notificationsEnabled")

    if (savedTheme) setTheme(savedTheme)
    if (savedSound) setSoundEnabled(savedSound === "true")
    if (savedNotifications) setNotificationsEnabled(savedNotifications === "true")
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle("light-theme", theme === "light")
    localStorage.setItem("theme", theme)
  }, [theme])

  const handleSoundToggle = (checked: boolean) => {
    setSoundEnabled(checked)
    localStorage.setItem("soundEnabled", checked.toString())
  }

  const handleNotificationsToggle = (checked: boolean) => {
    setNotificationsEnabled(checked)
    localStorage.setItem("notificationsEnabled", checked.toString())

    if (checked && "Notification" in window) {
      Notification.requestPermission()
    }
  }

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      <div className="space-y-2 animate-fade-in">
        <div className="flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-amber-400 animate-pulse" />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent">
            {t.title}
          </h2>
        </div>
        <p className="text-sm text-muted-foreground pl-11">{t.appearance}</p>
      </div>

      <div className="space-y-3 animate-slide-in-left" style={{ animationDelay: "0.1s" }}>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t.systemStatus}</h3>
        <ConnectionStatus language={language} />
      </div>

      <div className="space-y-3 animate-slide-in-left" style={{ animationDelay: "0.2s" }}>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t.theme}</h3>
        <Card className="p-6 bg-gradient-to-br from-black/40 to-black/20 border-amber-500/20 backdrop-blur-sm hover:border-amber-500/40 transition-all duration-300">
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <Palette className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-semibold text-foreground">{t.theme}</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                className={`h-28 flex flex-col items-center justify-center gap-3 transition-all duration-300 ${
                  theme === "light"
                    ? "bg-gradient-to-br from-amber-400 to-amber-600 text-black border-amber-400 shadow-lg shadow-amber-500/50"
                    : "border-amber-500/30 hover:border-amber-500/50 hover:bg-amber-500/5"
                }`}
                onClick={() => setTheme("light")}
              >
                <Sun className={`w-8 h-8 ${theme === "light" ? "animate-spin-slow" : ""}`} />
                <span className="text-sm font-medium">{t.themeLight}</span>
              </Button>

              <Button
                variant={theme === "dark" ? "default" : "outline"}
                className={`h-28 flex flex-col items-center justify-center gap-3 transition-all duration-300 ${
                  theme === "dark"
                    ? "bg-gradient-to-br from-amber-400 to-amber-600 text-black border-amber-400 shadow-lg shadow-amber-500/50"
                    : "border-amber-500/30 hover:border-amber-500/50 hover:bg-amber-500/5"
                }`}
                onClick={() => setTheme("dark")}
              >
                <Moon className={`w-8 h-8 ${theme === "dark" ? "animate-pulse" : ""}`} />
                <span className="text-sm font-medium">{t.themeDark}</span>
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-3 animate-slide-in-left" style={{ animationDelay: "0.3s" }}>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t.sound}</h3>
        <Card className="p-6 bg-gradient-to-br from-black/40 to-black/20 border-amber-500/20 backdrop-blur-sm hover:border-amber-500/40 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  soundEnabled
                    ? "bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/30"
                    : "bg-gray-700"
                }`}
              >
                {soundEnabled ? (
                  <Volume2 className="w-6 h-6 text-black" />
                ) : (
                  <VolumeX className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <div>
                <Label
                  htmlFor="sound-toggle"
                  className="text-base font-semibold cursor-pointer group-hover:text-amber-400 transition-colors"
                >
                  {t.sound}
                </Label>
                <p className="text-sm text-muted-foreground">{t.soundDesc}</p>
              </div>
            </div>
            <Switch
              id="sound-toggle"
              checked={soundEnabled}
              onCheckedChange={handleSoundToggle}
              className="data-[state=checked]:bg-amber-500"
            />
          </div>
        </Card>
      </div>

      <div className="space-y-3 animate-slide-in-left" style={{ animationDelay: "0.4s" }}>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t.notifications}</h3>
        <Card className="p-6 bg-gradient-to-br from-black/40 to-black/20 border-amber-500/20 backdrop-blur-sm hover:border-amber-500/40 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  notificationsEnabled
                    ? "bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/30"
                    : "bg-gray-700"
                }`}
              >
                {notificationsEnabled ? (
                  <Bell className="w-6 h-6 text-black" />
                ) : (
                  <BellOff className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <div>
                <Label
                  htmlFor="notifications-toggle"
                  className="text-base font-semibold cursor-pointer group-hover:text-amber-400 transition-colors"
                >
                  {t.notifications}
                </Label>
                <p className="text-sm text-muted-foreground">{t.notificationsDesc}</p>
              </div>
            </div>
            <Switch
              id="notifications-toggle"
              checked={notificationsEnabled}
              onCheckedChange={handleNotificationsToggle}
              className="data-[state=checked]:bg-amber-500"
            />
          </div>
        </Card>
      </div>
    </div>
  )
}
