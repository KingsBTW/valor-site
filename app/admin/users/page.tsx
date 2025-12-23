"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, MoreHorizontal, Eye, Ban, Mail, Shield } from "lucide-react"

// Mock users data
const usersData = [
  {
    id: "USR-001",
    name: "xShadow",
    email: "xshadow@email.com",
    status: "active",
    orders: 12,
    spent: 58799,
    joined: "2024-06-15",
    lastActive: "2025-01-07T14:30:00",
  },
  {
    id: "USR-002",
    name: "PhantomGG",
    email: "phantom@email.com",
    status: "active",
    orders: 8,
    spent: 31999,
    joined: "2024-08-22",
    lastActive: "2025-01-07T13:15:00",
  },
  {
    id: "USR-003",
    name: "NightHawk",
    email: "nighthawk@email.com",
    status: "active",
    orders: 5,
    spent: 19999,
    joined: "2024-09-10",
    lastActive: "2025-01-07T12:00:00",
  },
  {
    id: "USR-004",
    name: "DeadlyAce",
    email: "deadly@email.com",
    status: "suspended",
    orders: 3,
    spent: 11999,
    joined: "2024-10-05",
    lastActive: "2025-01-05T18:45:00",
  },
  {
    id: "USR-005",
    name: "GhostRider",
    email: "ghost@email.com",
    status: "active",
    orders: 15,
    spent: 67499,
    joined: "2024-03-20",
    lastActive: "2025-01-07T09:30:00",
  },
  {
    id: "USR-006",
    name: "SniperX",
    email: "sniper@email.com",
    status: "active",
    orders: 7,
    spent: 24499,
    joined: "2024-07-12",
    lastActive: "2025-01-06T22:15:00",
  },
  {
    id: "USR-007",
    name: "CyberNinja",
    email: "cyber@email.com",
    status: "banned",
    orders: 2,
    spent: 9999,
    joined: "2024-11-18",
    lastActive: "2024-12-20T10:00:00",
  },
  {
    id: "USR-008",
    name: "DarkMatter",
    email: "dark@email.com",
    status: "active",
    orders: 4,
    spent: 21999,
    joined: "2024-09-28",
    lastActive: "2025-01-06T18:30:00",
  },
]

const statusColors: Record<string, string> = {
  active: "bg-green-500/20 text-green-400 border-green-500/30",
  suspended: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  banned: "bg-red-500/20 text-red-400 border-red-500/30",
}

export default function AdminUsersPage() {
  const [users] = useState(usersData)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getLastActive = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

    if (diffHours < 1) return "Just now"
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `${diffDays}d ago`
    return formatDate(dateString)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Users</h1>
        <p className="text-muted-foreground">Manage your customer accounts</p>
      </div>

      {/* Search */}
      <Card className="glass-panel border-primary/20">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name, email, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-input border-border"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="glass-panel border-primary/20">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">User</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Orders</TableHead>
                <TableHead className="text-muted-foreground">Total Spent</TableHead>
                <TableHead className="text-muted-foreground">Joined</TableHead>
                <TableHead className="text-muted-foreground">Last Active</TableHead>
                <TableHead className="text-muted-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} className="border-border">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                        {user.name[0]}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[user.status]}>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{user.orders}</TableCell>
                  <TableCell className="font-medium text-foreground">${(user.spent / 100).toFixed(2)}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(user.joined)}</TableCell>
                  <TableCell className="text-muted-foreground">{getLastActive(user.lastActive)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="glass-panel border-primary/20">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="h-4 w-4 mr-2" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Shield className="h-4 w-4 mr-2" />
                          Reset HWID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border" />
                        {user.status === "active" ? (
                          <DropdownMenuItem className="text-yellow-400">
                            <Ban className="h-4 w-4 mr-2" />
                            Suspend User
                          </DropdownMenuItem>
                        ) : user.status === "suspended" ? (
                          <>
                            <DropdownMenuItem className="text-green-400">
                              <Shield className="h-4 w-4 mr-2" />
                              Activate User
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-400">
                              <Ban className="h-4 w-4 mr-2" />
                              Ban User
                            </DropdownMenuItem>
                          </>
                        ) : (
                          <DropdownMenuItem className="text-green-400">
                            <Shield className="h-4 w-4 mr-2" />
                            Unban User
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
