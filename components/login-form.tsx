"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe, Loader2, MessageCircle } from "lucide-react"
import Image from "next/image"
import { validateCredentials } from "@/lib/auth"

const translations = {
  en: {
    title: "Vliz Support Chat",
    subtitle: "Sign in to access your support dashboard",
    username: "Username",
    password: "Password",
    signIn: "Sign In",
    credits: "Powered by vliz_vip",
    usernameRequired: "Please enter your username",
    passwordRequired: "Please enter your password",
    signingIn: "Signing in...",
    connectWith: "Connect with us",
  },
  es: {
    title: "Vliz Support Chat",
    subtitle: "Inicia sesión para acceder a tu panel de soporte",
    username: "Usuario",
    password: "Contraseña",
    signIn: "Iniciar Sesión",
    credits: "Desarrollado por vliz_vip",
    usernameRequired: "Por favor ingresa tu usuario",
    passwordRequired: "Por favor ingresa tu contraseña",
    signingIn: "Iniciando sesión...",
    connectWith: "Conéctate con nosotros",
  },
}

interface LoginFormProps {
  onShowToast?: (message: string, type: "success" | "error" | "info") => void
}

export function LoginForm({ onShowToast }: LoginFormProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [language, setLanguage] = useState<"en" | "es">("en")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const t = translations[language]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!username.trim()) {
      onShowToast?.(t.usernameRequired, "error")
      return
    }

    if (!password.trim()) {
      onShowToast?.(t.passwordRequired, "error")
      return
    }

    if (!validateCredentials(username, password)) {
      onShowToast?.(language === "en" ? "Invalid credentials" : "Credenciales inválidas", "error")
      return
    }

    setIsLoading(true)
    localStorage.setItem("vliz_auth", "true")
    localStorage.setItem("vliz_username", username)
    localStorage.setItem("vliz_language", language)

    setTimeout(() => {
      router.push("/dashboard")
    }, 3000)
  }

  const handleLanguageChange = () => {
    const newLang = language === "en" ? "es" : "en"
    setLanguage(newLang)
    onShowToast?.(newLang === "en" ? "Language changed to English" : "Idioma cambiado a Español", "success")
  }

  return (
    <Card className="w-full max-w-md border-border bg-card/80 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      <button
        onClick={handleLanguageChange}
        disabled={isLoading}
        className="absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Globe className="h-4 w-4" />
        <span className="text-sm font-medium">{language === "en" ? "ES" : "EN"}</span>
      </button>

      <CardHeader className="space-y-6 text-center pt-8">
        <div className="flex justify-center animate-fade-in">
          <div className="relative h-20 w-20 rounded-2xl overflow-hidden shadow-lg ring-2 ring-primary/20 animate-pulse-slow">
            <Image src="/logo.png" alt="Vliz Logo" fill className="object-contain p-2 animate-float" priority />
          </div>
        </div>
        <div key={language} className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <CardTitle className="text-3xl font-bold text-balance bg-gradient-to-r from-primary via-primary to-destructive bg-clip-text text-transparent">
            {t.title}
          </CardTitle>
          <CardDescription className="text-muted-foreground mt-3 text-base">{t.subtitle}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="username" className="text-foreground font-medium">
              {t.username}
            </Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              className="bg-input/50 border-border h-11 focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground font-medium">
              {t.password}
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="bg-input/50 border-border h-11 focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 h-11 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                {t.signingIn}
              </>
            ) : (
              t.signIn
            )}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-border/50">
          <p className="text-xs text-center text-muted-foreground mb-4 font-medium">{t.connectWith}</p>
          <div className="flex justify-center gap-4">
            <a
              href="https://discord.com/invite/vlizvip"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center w-12 h-12 rounded-xl bg-[#5865F2]/10 hover:bg-[#5865F2]/20 border border-[#5865F2]/30 hover:border-[#5865F2]/50 transition-all duration-300 hover:scale-110"
            >
              <svg className="w-6 h-6 text-[#5865F2]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.076.076 0 0 0 .084.028a14.09 14.09 0 0 0 1.226-1.994a.077.077 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
            </a>
            <a
              href="https://api.whatsapp.com/send/?phone=%2B18296922040&text&type=phone_number&app_absent=0"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center w-12 h-12 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 hover:border-[#25D366]/50 transition-all duration-300 hover:scale-110"
            >
              <MessageCircle className="w-6 h-6 text-[#25D366]" />
            </a>
          </div>
        </div>

        <p className="text-xs text-center text-muted-foreground mt-6 font-medium">{t.credits}</p>
      </CardContent>
    </Card>
  )
}
