"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Loader2, Lock, User, Sparkles } from "lucide-react"
import { loginAction } from "@/app/actions/auth"

export default function AdminLoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    try {
      const result = await loginAction(formData)
      if (result?.error) {
        setError(result.error)
        setIsLoading(false)
      }
    } catch {
      router.push("/admin")
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(239,68,68,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(239,68,68,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

      {/* Animated floating orbs */}
      <div
        className={`absolute top-1/4 left-1/4 w-72 h-72 bg-red-600/20 rounded-full blur-[100px] transition-all duration-1000 ${mounted ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}
        style={{ animation: "float 8s ease-in-out infinite" }}
      />
      <div
        className={`absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px] transition-all duration-1000 delay-300 ${mounted ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}
        style={{ animation: "float 10s ease-in-out infinite reverse" }}
      />
      <div
        className={`absolute top-1/2 right-1/3 w-48 h-48 bg-red-500/10 rounded-full blur-[80px] transition-all duration-1000 delay-500 ${mounted ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}
        style={{ animation: "float 6s ease-in-out infinite" }}
      />

      {/* Scan line effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-red-500/30 to-transparent"
          style={{ animation: "scan-line 4s linear infinite" }}
        />
      </div>

      {/* Particle effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {mounted &&
          [...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-red-500/40 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
      </div>

      {/* Login card */}
      <Card
        className={`w-full max-w-md relative z-10 border-red-500/20 bg-[#111111]/90 backdrop-blur-xl shadow-2xl shadow-red-500/10 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        {/* Card glow effect */}
        <div className="absolute -inset-[1px] bg-gradient-to-r from-red-500/20 via-orange-600/10 to-red-500/20 rounded-xl blur-sm" />

        <div className="relative bg-[#111111] rounded-xl">
          <CardHeader className="text-center space-y-4 pt-8">
            <div
              className={`mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-600/10 flex items-center justify-center border border-red-500/30 transition-all duration-500 delay-200 ${mounted ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}
              style={{ animation: "pulse-glow 3s ease-in-out infinite" }}
            >
              <Image
                src="https://i.postimg.cc/rsCspgyJ/image-removebg-preview.png"
                alt="Valor Logo"
                width={48}
                height={48}
              />
            </div>

            <div
              className={`space-y-2 transition-all duration-500 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4 text-red-500" />
                <span className="text-xs font-medium text-red-500 uppercase tracking-wider">Secure Access</span>
                <Sparkles className="h-4 w-4 text-red-500" />
              </div>
              <CardTitle className="text-3xl font-bold text-white">Admin Portal</CardTitle>
              <CardDescription className="text-gray-400">
                Sign in to access the Valor control panel
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent
            className={`px-8 pb-8 transition-all duration-500 delay-400 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-300 text-sm font-medium">
                  Username
                </Label>
                <div className="relative group">
                  <div className="absolute -inset-[1px] bg-gradient-to-r from-red-500/0 via-red-500/30 to-red-500/0 rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity blur-sm" />
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-red-500 transition-colors" />
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      placeholder="Enter username"
                      className="pl-11 h-12 bg-[#1a1a1a] border-gray-800 text-white placeholder:text-gray-500 focus:border-red-500/50 focus:ring-red-500/20 transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300 text-sm font-medium">
                  Password
                </Label>
                <div className="relative group">
                  <div className="absolute -inset-[1px] bg-gradient-to-r from-red-500/0 via-red-500/30 to-red-500/0 rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity blur-sm" />
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-red-500 transition-colors" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Enter password"
                      className="pl-11 h-12 bg-[#1a1a1a] border-gray-800 text-white placeholder:text-gray-500 focus:border-red-500/50 focus:ring-red-500/20 transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-3 text-red-400 text-sm p-4 rounded-lg bg-red-500/10 border border-red-500/30 animate-in slide-in-from-top-2 duration-300">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-base font-bold bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white border-0 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all duration-300 group"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                    Access Dashboard
                  </>
                )}
              </Button>
            </form>

            {/* Security badge */}
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>256-bit SSL Encrypted Connection</span>
            </div>
          </CardContent>
        </div>
      </Card>

      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-red-500/20" />
      <div className="absolute top-0 right-0 w-32 h-32 border-r-2 border-t-2 border-red-500/20" />
      <div className="absolute bottom-0 left-0 w-32 h-32 border-l-2 border-b-2 border-red-500/20" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-red-500/20" />
    </div>
  )
}



