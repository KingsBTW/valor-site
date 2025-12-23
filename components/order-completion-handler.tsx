"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

export function OrderCompletionHandler() {
  const searchParams = useSearchParams()
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    const paymentIntent = searchParams.get("payment_intent")
    const alreadyProcessed = sessionStorage.getItem(`processed_${paymentIntent}`)
    
    if (paymentIntent && !completed && !alreadyProcessed) {
      // Mark as processing to prevent duplicate calls
      sessionStorage.setItem(`processed_${paymentIntent}`, "true")
      
      // Call the completion endpoint
      fetch("/api/complete-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentIntentId: paymentIntent }),
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`)
          }
          return res.json()
        })
        .then((data) => {
          console.log("Order completion result:", data)
          setCompleted(true)
        })
        .catch((err) => {
          console.error("Error completing order:", err)
          // Remove the flag if there was an error so it can retry
          sessionStorage.removeItem(`processed_${paymentIntent}`)
        })
    }
  }, [completed, searchParams])

  return null
}
