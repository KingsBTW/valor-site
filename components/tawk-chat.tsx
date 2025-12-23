"use client"

import { useEffect, useState } from "react"

declare global {
  interface Window {
    Tawk_API?: {
      onLoad?: () => void
      onLoaded?: () => void
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

    // Initialize Tawk_API with all required properties
    window.Tawk_API = {
      onLoad: () => {},
      onLoaded: () => {
        setLoaded(true)
      },
    }
    window.Tawk_LoadStart = new Date()

    // Tawk.to IDs
    const tawkPropertyId = "694aff2fe73714198407f10d"
    const tawkWidgetId = "1jd6f9kbb"

    // Create and inject the script
    const script = document.createElement("script")
    script.async = true
    script.src = `https://embed.tawk.to/${tawkPropertyId}/${tawkWidgetId}`
    script.setAttribute("crossorigin", "*")

    script.onerror = () => {
      // Silently fail - don't break the app if Tawk.to is blocked
      console.warn("Tawk.to chat widget failed to load")
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
