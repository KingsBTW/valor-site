"use client"

import { useEffect, useState } from "react"

declare global {
  interface Window {
    Tawk_API?: {
      onLoad?: () => void
      hideWidget?: () => void
      showWidget?: () => void
      toggle?: () => void
      popup?: () => void
      maximize?: () => void
      minimize?: () => void
      endChat?: () => void
      setAttributes?: (attributes: Record<string, string>, callback?: (error?: Error) => void) => void
      addEvent?: (eventName: string, metadata?: Record<string, string>, callback?: (error?: Error) => void) => void
      addTags?: (tags: string[], callback?: (error?: Error) => void) => void
      removeTags?: (tags: string[], callback?: (error?: Error) => void) => void
    }
    Tawk_LoadStart?: Date
  }
}

export function TawkChat() {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    // Prevent duplicate loading
    if (loaded || window.Tawk_API) {
      return
    }

    // Initialize Tawk_API and Tawk_LoadStart
    window.Tawk_API = window.Tawk_API || {}
    window.Tawk_LoadStart = new Date()

    // Hardcoded Tawk.to IDs from your script
    const tawkPropertyId = "69451270fea955197cd68294"
    const tawkWidgetId = "1jcqt01pl"

    // Create and inject the script
    const script = document.createElement("script")
    script.async = true
    script.src = `https://embed.tawk.to/${tawkPropertyId}/${tawkWidgetId}`
    script.charset = "UTF-8"
    script.setAttribute("crossorigin", "*")

    script.onerror = () => {
      // Silently fail - don't break the app if Tawk.to is blocked
    }

    script.onload = () => {
      setLoaded(true)
    }

    // Insert script
    document.head.appendChild(script)

    // Cleanup function
    return () => {
      const tawkScript = document.querySelector(`script[src*="embed.tawk.to"]`)
      if (tawkScript) {
        tawkScript.remove()
      }
      delete window.Tawk_API
      delete window.Tawk_LoadStart
    }
  }, [loaded])

  return null
}
