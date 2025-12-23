"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Zap,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  Activity,
  LogOut,
  Tag,
  Key,
  Gamepad2,
} from "lucide-react"
import { logoutAction } from "@/app/actions/auth"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Categories", href: "/admin/categories", icon: Gamepad2 },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Coupons", href: "/admin/coupons", icon: Tag },
  { name: "License Keys", href: "/admin/license-keys", icon: Key },
  { name: "Status", href: "/admin/status", icon: Activity },
  { name: "Settings", href: "/admin/settings", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 glass-panel border-r border-primary/20 hidden lg:flex lg:flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 px-6 border-b border-primary/20">
        <Link href="/admin" className="flex items-center gap-3 group">
          <div className="relative">
            <Image
              src="https://i.postimg.cc/g2WLmFgX/warp-logo-blue-removebg-preview.png"
              alt="Warp Cheats Logo"
              width={32}
              height={32}
              className="object-contain"
            />
            <Zap className="h-3 w-3 text-primary absolute -bottom-0.5 -right-0.5" />
          </div>
          <div>
            <span className="text-lg font-bold">
              <span className="gradient-text">WARP</span>
              <span className="text-foreground">CHEATS</span>
            </span>
            <span className="block text-xs text-muted-foreground -mt-1">Admin Panel</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-primary/20 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
        >
          <LogOut className="h-5 w-5" />
          View Site
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-all"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </form>
      </div>
    </aside>
  )
}
