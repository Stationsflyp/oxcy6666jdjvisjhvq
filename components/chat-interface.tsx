"use client"
import { useState, useRef, useEffect } from "react"
import type React from "react"

import { Send, Loader2, MessageSquare, Headphones, UserCircle, Download, Paperclip } from "lucide-react"
import { Button } from "@/components/ui/button"
import { playNotificationSound, showDesktopNotification } from "@/lib/notification-sound"
import { EmojiPicker } from "@/components/emoji-picker"

const translations = {
  en: {
    title: "Support Chat",
    placeholder: "Type your message here...",
    send: "Send",
    refresh: "Refresh",
    error: "Error connecting to server",
    noMessages: "No messages yet. Start the conversation!",
    you: "You",
    support: "Support",
    emptyMessage: "Please write a message before sending",
    messageSent: "Message sent successfully!",
    sendError: "Failed to send message. Please try again.",
    newMessage: "New message received",
    download: "Download Chat",
    downloaded: "Chat downloaded successfully!",
    supportChat: "Support",
    publicChat: "Vlizz Chat",
    maintenanceEnabled: "Maintenance mode enabled",
    maintenanceDisabled: "Maintenance mode disabled",
  },
  es: {
    title: "Chat de Soporte",
    placeholder: "Escribe tu mensaje aquí...",
    send: "Enviar",
    refresh: "Actualizar",
    error: "Error al conectar con el servidor",
    noMessages: "No hay mensajes aún. ¡Inicia la conversación!",
    you: "Tú",
    support: "Soporte",
    emptyMessage: "Por favor escribe un mensaje antes de enviar",
    messageSent: "¡Mensaje enviado exitosamente!",
    sendError: "Error al enviar mensaje. Por favor intenta de nuevo.",
    newMessage: "Nuevo mensaje recibido",
    download: "Descargar Chat",
    downloaded: "¡Chat descargado exitosamente!",
    supportChat: "Soporte",
    publicChat: "Community",
    maintenanceEnabled: "Modo mantenimiento activado",
    maintenanceDisabled: "Modo mantenimiento desactivado",
  },
}

interface ChatInterfaceProps {
  language: "en" | "es"
  onShowToast: (message: string, type: "success" | "error" | "info") => void
  soundEnabled?: boolean
}

export function ChatInterface({ language, onShowToast, soundEnabled = true }: ChatInterfaceProps) {
  const [chatType, setChatType] = useState<"support" | "public">("support")
  const [supportMessages, setSupportMessages] = useState<string[]>([])
  const [publicMessages, setPublicMessages] = useState<string[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [sentMessages, setSentMessages] = useState<Set<string>>(new Set())
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const previousSupportCountRef = useRef(0)
  const previousPublicCountRef = useRef(0)
  const lastProcessedCountRef = useRef(0)
  const maintenanceProcessedRef = useRef(false)
  const t = translations[language]

  useEffect(() => {
    const stored = localStorage.getItem("vliz_sent_messages")
    if (stored) {
      try {
        setSentMessages(new Set(JSON.parse(stored)))
      } catch (e) {
        console.error("Error loading sent messages:", e)
      }
    }
    const lastCount = localStorage.getItem("vliz_last_message_count")
    if (lastCount) {
      lastProcessedCountRef.current = Number.parseInt(lastCount, 10)
    }
  }, [])

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch("/api/messages/get")
        if (!response.ok) throw new Error("Failed to fetch")
        const data = await response.json()

        const allMessages: string[] = data.messages || []

        if (!maintenanceProcessedRef.current && allMessages.length > lastProcessedCountRef.current) {
          const newMessages = allMessages.slice(lastProcessedCountRef.current)

          const hasMaintenanceOn = newMessages.some((msg) => msg.trim() === "!mantenimiento on")
          const hasMaintenanceOff = newMessages.some((msg) => msg.trim() === "!mantenimiento off")

          if (hasMaintenanceOn) {
            maintenanceProcessedRef.current = true
            localStorage.setItem("vliz_maintenance", "true")
            localStorage.setItem("vliz_last_message_count", allMessages.length.toString())
            window.location.reload()
            return
          }

          if (hasMaintenanceOff) {
            maintenanceProcessedRef.current = true
            localStorage.setItem("vliz_maintenance", "false")
            localStorage.setItem("vliz_last_message_count", allMessages.length.toString())
            window.location.reload()
            return
          }
        }

        lastProcessedCountRef.current = allMessages.length
        localStorage.setItem("vliz_last_message_count", allMessages.length.toString())

        const support: string[] = []
        const publicMsgs: string[] = []

        allMessages.forEach((msg) => {
          if (msg.trim() === "!mantenimiento on" || msg.trim() === "!mantenimiento off") {
            return
          }

          if (msg.startsWith("[PUBLIC]")) {
            publicMsgs.push(msg.replace("[PUBLIC]", "").trim())
          } else {
            support.push(msg)
          }
        })

        if (support.length > previousSupportCountRef.current && chatType === "support") {
          if (previousSupportCountRef.current > 0 && soundEnabled) {
            playNotificationSound()
            showDesktopNotification("Vliz Support Chat", t.newMessage)
          }
        }

        if (publicMsgs.length > previousPublicCountRef.current && chatType === "public") {
          if (previousPublicCountRef.current > 0 && soundEnabled) {
            playNotificationSound()
            showDesktopNotification("Vliz Support Chat", t.newMessage)
          }
        }

        previousSupportCountRef.current = support.length
        previousPublicCountRef.current = publicMsgs.length

        setSupportMessages(support)
        setPublicMessages(publicMsgs)
      } catch (error) {
        console.error("Error fetching messages:", error)
      }
    }

    fetchMessages()
    const interval = setInterval(fetchMessages, 500)
    return () => clearInterval(interval)
  }, [language, t.newMessage, chatType, soundEnabled])

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [supportMessages, publicMessages, chatType])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!inputMessage.trim()) {
      onShowToast(t.emptyMessage, "error")
      return
    }

    setIsSending(true)

    try {
      const messageToSend = chatType === "public" ? `[PUBLIC]${inputMessage}` : inputMessage

      const response = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ msg: messageToSend }),
      })

      if (!response.ok) throw new Error("Failed to send")

      const newSentMessages = new Set(sentMessages)
      newSentMessages.add(inputMessage.trim())
      setSentMessages(newSentMessages)
      localStorage.setItem("vliz_sent_messages", JSON.stringify(Array.from(newSentMessages)))

      if (soundEnabled) {
        playNotificationSound()
      }
      onShowToast(t.messageSent, "success")
      setInputMessage("")

      if (inputRef.current) {
        inputRef.current.style.height = "52px"
        inputRef.current.focus()
      }
    } catch (error) {
      console.error("Error sending message:", error)
      onShowToast(t.sendError, "error")
    } finally {
      setIsSending(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value)

    if (inputRef.current) {
      inputRef.current.style.height = "auto"
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (inputMessage.trim() && !isSending) {
        handleSendMessage(e as any)
      }
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      onShowToast(language === "en" ? "File too large (max 10MB)" : "Archivo muy grande (máx 10MB)", "error")
      return
    }

    setIsSending(true)

    try {
      const reader = new FileReader()
      reader.onload = async (event) => {
        const base64 = event.target?.result as string
        const messageToSend = `[FILE:${file.name}]${base64}`
        const displayMessage = `📎 ${file.name}`

        const response = await fetch("/api/messages/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ msg: chatType === "public" ? `[PUBLIC]${messageToSend}` : messageToSend }),
        })

        if (!response.ok) throw new Error("Failed to send file")

        const newSentMessages = new Set(sentMessages)
        newSentMessages.add(displayMessage)
        setSentMessages(newSentMessages)
        localStorage.setItem("vliz_sent_messages", JSON.stringify(Array.from(newSentMessages)))

        if (soundEnabled) {
          playNotificationSound()
        }
        onShowToast(language === "en" ? "File sent successfully!" : "¡Archivo enviado exitosamente!", "success")
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error("Error sending file:", error)
      onShowToast(language === "en" ? "Failed to send file" : "Error al enviar archivo", "error")
    } finally {
      setIsSending(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleEmojiSelect = (emoji: string) => {
    setInputMessage((prev) => prev + emoji)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const downloadConversation = () => {
    const timestamp = new Date().toLocaleString()
    const messages = chatType === "support" ? supportMessages : publicMessages
    const chatName = chatType === "support" ? "Support" : "Vlizz Chat"

    let content = `Vliz ${chatName} - ${timestamp}\n`
    content += "=".repeat(50) + "\n\n"

    messages.forEach((message) => {
      content += `${message}\n\n`
    })

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `vliz-${chatType}-chat-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    onShowToast(t.downloaded, "success")
  }

  const currentMessages = chatType === "support" ? supportMessages : publicMessages

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-border bg-card/50 backdrop-blur-sm px-4 py-3 flex flex-wrap gap-3 items-center justify-between transition-all duration-500">
        <div className="flex gap-2">
          <Button
            onClick={() => setChatType("support")}
            variant={chatType === "support" ? "default" : "outline"}
            size="sm"
            className="transition-all duration-500 ease-out hover:scale-105 hover:shadow-lg"
          >
            {t.supportChat}
          </Button>
          <Button
            onClick={() => setChatType("public")}
            variant={chatType === "public" ? "default" : "outline"}
            size="sm"
            className="transition-all duration-500 ease-out hover:scale-105 hover:shadow-lg"
          >
            {t.publicChat}
          </Button>
        </div>
        <Button
          onClick={downloadConversation}
          variant="outline"
          size="sm"
          className="gap-2 transition-all duration-500 ease-out hover:scale-105 hover:shadow-lg bg-transparent"
          disabled={currentMessages.length === 0}
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">{t.download}</span>
        </Button>
      </div>

      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth transition-all duration-500"
      >
        {currentMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
            <MessageSquare className="w-16 h-16 text-primary/30 mb-4 animate-pulse" />
            <p className="text-muted-foreground text-lg">{t.noMessages}</p>
          </div>
        ) : (
          currentMessages.map((message, index) => {
            const isFromClient = sentMessages.has(message.trim())
            const isEcho = !isFromClient && sentMessages.has(message.trim())

            if (isEcho) return null

            return (
              <div
                key={`${index}-${message}`}
                className={`flex gap-2 ${
                  isFromClient
                    ? "justify-start items-start animate-slide-in-left"
                    : "justify-end items-end mt-3 animate-slide-in-right"
                } transition-all duration-500 ease-out`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {isFromClient && (
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg transition-all duration-500 hover:scale-110 hover:shadow-xl">
                    <Headphones className="w-5 h-5 text-primary-foreground" />
                  </div>
                )}

                <div
                  className={`max-w-[75%] md:max-w-[65%] rounded-2xl px-4 py-3 shadow-lg transition-all duration-500 ease-out hover:shadow-2xl hover:scale-[1.02] ${
                    isFromClient
                      ? "bg-card border border-border text-card-foreground rounded-tl-sm"
                      : "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-tr-sm"
                  }`}
                >
                  <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap break-words">{message}</p>
                </div>

                {!isFromClient && (
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg transition-all duration-500 hover:scale-110 hover:shadow-xl">
                    <UserCircle className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      <div className="border-t border-border bg-card/50 backdrop-blur-sm p-4 md:p-6 transition-all duration-500">
        <form onSubmit={handleSendMessage} className="flex gap-3 items-end">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,video/*,.pdf,.doc,.docx,.txt"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSending}
            className="h-[52px] w-[52px] rounded-xl hover:bg-accent transition-all duration-300 hover:scale-110 disabled:opacity-50"
          >
            <Paperclip className="w-5 h-5" />
          </Button>

          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={t.placeholder}
              disabled={isSending}
              rows={1}
              className="w-full resize-none rounded-xl bg-input border border-border px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-500 ease-out disabled:opacity-50 disabled:cursor-not-allowed min-h-[52px] max-h-[120px] hover:border-primary/30"
              style={{ height: "52px" }}
            />
          </div>

          <EmojiPicker onEmojiSelect={handleEmojiSelect} />

          <Button
            type="submit"
            disabled={isSending || !inputMessage.trim()}
            className="h-[52px] w-[52px] rounded-xl bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg hover:shadow-2xl transition-all duration-500 ease-out hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center"
          >
            {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </Button>
        </form>
      </div>
    </div>
  )
}
