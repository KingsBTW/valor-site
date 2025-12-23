"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Save, Globe, MessageSquare, Star } from "lucide-react"

export default function AdminContentPage() {
  const [heroTitle, setHeroTitle] = useState("Dominate Every Game You Play")
  const [heroSubtitle, setHeroSubtitle] = useState(
    "Premium gaming enhancement software trusted by over 50,000 elite players. Undetected, feature-rich, and backed by 24/7 support.",
  )
  const [discordLink, setDiscordLink] = useState("https://discord.gg/warpcheats")
  const [supportEmail, setSupportEmail] = useState("support@warpcheats.com")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Content Management</h1>
        <p className="text-muted-foreground">Edit site content and settings</p>
      </div>

      <Tabs defaultValue="homepage" className="space-y-6">
        <TabsList className="glass-panel border border-primary/20 p-1">
          <TabsTrigger
            value="homepage"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Homepage
          </TabsTrigger>
          <TabsTrigger
            value="contact"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Contact Info
          </TabsTrigger>
          <TabsTrigger
            value="testimonials"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Testimonials
          </TabsTrigger>
        </TabsList>

        <TabsContent value="homepage" className="space-y-6">
          <Card className="glass-panel border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Globe className="h-5 w-5 text-primary" />
                Hero Section
              </CardTitle>
              <CardDescription>Edit the main hero section content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Hero Title</Label>
                <Input
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                  className="bg-input border-border"
                />
              </div>
              <div className="space-y-2">
                <Label>Hero Subtitle</Label>
                <Textarea
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                  className="bg-input border-border resize-none"
                  rows={3}
                />
              </div>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-panel border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <FileText className="h-5 w-5 text-primary" />
                Stats Section
              </CardTitle>
              <CardDescription>Edit displayed statistics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Active Users</Label>
                  <Input defaultValue="50K+" className="bg-input border-border" />
                </div>
                <div className="space-y-2">
                  <Label>Games Supported</Label>
                  <Input defaultValue="15+" className="bg-input border-border" />
                </div>
                <div className="space-y-2">
                  <Label>Uptime</Label>
                  <Input defaultValue="99.9%" className="bg-input border-border" />
                </div>
                <div className="space-y-2">
                  <Label>Support Response</Label>
                  <Input defaultValue="<1hr" className="bg-input border-border" />
                </div>
              </div>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <Card className="glass-panel border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <MessageSquare className="h-5 w-5 text-primary" />
                Contact Information
              </CardTitle>
              <CardDescription>Manage support and contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Support Email</Label>
                <Input
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="bg-input border-border"
                />
              </div>
              <div className="space-y-2">
                <Label>Discord Invite Link</Label>
                <Input
                  value={discordLink}
                  onChange={(e) => setDiscordLink(e.target.value)}
                  className="bg-input border-border"
                />
              </div>
              <div className="space-y-2">
                <Label>Business Email</Label>
                <Input defaultValue="business@warpcheats.com" className="bg-input border-border" />
              </div>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testimonials" className="space-y-6">
          <Card className="glass-panel border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Star className="h-5 w-5 text-primary" />
                Testimonials
              </CardTitle>
              <CardDescription>Manage customer testimonials</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 rounded-lg bg-muted/30 border border-border space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input defaultValue={`Customer ${i}`} className="bg-input border-border" />
                    </div>
                    <div className="space-y-2">
                      <Label>Game</Label>
                      <Input defaultValue="Valorant" className="bg-input border-border" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Review</Label>
                    <Textarea
                      defaultValue="Great product, highly recommended!"
                      className="bg-input border-border resize-none"
                      rows={2}
                    />
                  </div>
                </div>
              ))}
              <div className="flex gap-2">
                <Button variant="outline" className="border-primary/30 text-primary bg-transparent">
                  Add Testimonial
                </Button>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Save className="h-4 w-4 mr-2" />
                  Save All
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
