"use client"

import { useEffect, useRef } from 'react'

export function NotificationWatcher() {
  // Guarda a hora da última checagem
  const lastCheck = useRef<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    audioRef.current = new Audio('/alert.mp3') // Lembre de por o som na pasta public!
    
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission()
      }
    }

    const checkNotifications = async () => {
      try {
        // Se lastCheck for vazio, a API só devolve a hora exata para começar a contar
        const url = lastCheck.current 
          ? `/api/notifications?since=${lastCheck.current}` 
          : `/api/notifications`

        const res = await fetch(url)
        const data = await res.json()

        // Atualiza nosso relógio com a hora do servidor
        if (data.timestamp) {
          lastCheck.current = data.timestamp
        }

        // Se tiver notificações novas, dispara o som e o alerta visual
        if (data.notifications && data.notifications.length > 0) {
          data.notifications.forEach((notif: any) => {
            audioRef.current?.play().catch(() => console.log("Som bloqueado"))
            
            if (Notification.permission === 'granted') {
              new Notification(notif.title, {
                body: notif.body,
                icon: '/favicon.ico',
              })
            }
          })
        }
      } catch (error) {
        console.error("Erro no Vigia", error)
      }
    }

    // Checa a cada 10 segundos
    const interval = setInterval(checkNotifications, 10000)
    checkNotifications() // Roda uma vez de cara

    return () => clearInterval(interval)
  }, [])

  return null
}