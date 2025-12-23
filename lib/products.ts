export interface Product {
  id: string
  name: string
  game: string
  description: string
  features: string[]
  priceInCents: number
  status: "undetected" | "updating" | "detected" | "testing"
  lastUpdate: string
  image: string
  popular?: boolean
}

export const PRODUCTS: Product[] = [
  {
    id: "valorant-pro",
    name: "Valorant Pro",
    game: "Valorant",
    description:
      "Advanced aimbot, ESP, and radar hack with full customization. Kernel-level bypass for maximum security.",
    features: [
      "Aimbot with smooth aim",
      "Player ESP & Box ESP",
      "Radar Hack",
      "Trigger Bot",
      "Recoil Control",
      "Stream Proof",
    ],
    priceInCents: 4999,
    status: "undetected",
    lastUpdate: "2025-01-07",
    image: "/valorant-game-dark-red-theme.jpg",
    popular: true,
  },
  {
    id: "fortnite-elite",
    name: "Fortnite Elite",
    game: "Fortnite",
    description: "Complete Fortnite solution with aimbot, ESP, and building assistance for competitive advantage.",
    features: ["Silent Aim", "Player & Loot ESP", "Aimbot FOV", "Build Assist", "Bullet TP", "HWID Spoofer"],
    priceInCents: 3999,
    status: "undetected",
    lastUpdate: "2025-01-06",
    image: "/fortnite-battle-royale-dark-gaming.jpg",
    popular: true,
  },
  {
    id: "apex-legends-master",
    name: "Apex Master",
    game: "Apex Legends",
    description: "Dominate the arena with precision aimbot, advanced ESP, and movement enhancements.",
    features: ["Bone Aimbot", "Full ESP Suite", "No Recoil", "Rapid Fire", "Spectator Alert", "Stream Proof"],
    priceInCents: 4499,
    status: "undetected",
    lastUpdate: "2025-01-05",
    image: "/apex-legends-battle-royale-dark.jpg",
  },
  {
    id: "warzone-ultimate",
    name: "Warzone Ultimate",
    game: "Call of Duty: Warzone",
    description: "The ultimate Warzone package with advanced features and anti-detection technology.",
    features: ["Precision Aimbot", "2D/3D Radar", "Player ESP", "Unlock All", "No Recoil", "Anti-Cheat Bypass"],
    priceInCents: 5999,
    status: "undetected",
    lastUpdate: "2025-01-07",
    image: "/call-of-duty-warzone-dark-military.jpg",
    popular: true,
  },
  {
    id: "rust-dominator",
    name: "Rust Dominator",
    game: "Rust",
    description: "Survive and dominate with ESP, aimbot, and resource detection for Rust.",
    features: ["Magic Bullet", "Player & NPC ESP", "Ore ESP", "No Recoil", "Admin Alert", "Infinite Stamina"],
    priceInCents: 4499,
    status: "updating",
    lastUpdate: "2025-01-04",
    image: "/rust-survival-game-dark.jpg",
  },
  {
    id: "cs2-pro",
    name: "CS2 Professional",
    game: "Counter-Strike 2",
    description: "Professional-grade CS2 software with legit and rage configurations.",
    features: ["Legit Aimbot", "Rage Aimbot", "Wallhack", "Skin Changer", "Backtrack", "Anti-Aim"],
    priceInCents: 3999,
    status: "undetected",
    lastUpdate: "2025-01-06",
    image: "/counter-strike-2-tactical-shooter-dark.jpg",
  },
  {
    id: "pubg-tactical",
    name: "PUBG Tactical",
    game: "PUBG",
    description: "Tactical advantage with comprehensive ESP, aimbot, and vehicle mods.",
    features: ["Aimbot", "Vehicle ESP", "Player ESP", "Loot Filter", "No Recoil", "Speed Hack"],
    priceInCents: 3499,
    status: "undetected",
    lastUpdate: "2025-01-05",
    image: "/pubg-battlegrounds-dark-military.jpg",
  },
  {
    id: "escape-tarkov-elite",
    name: "Tarkov Elite",
    game: "Escape from Tarkov",
    description: "Survive Tarkov with advanced loot ESP, aimbot, and extraction assistance.",
    features: ["Loot ESP", "Player ESP", "Aimbot", "No Recoil", "Night Vision", "Extract Helper"],
    priceInCents: 5499,
    status: "testing",
    lastUpdate: "2025-01-03",
    image: "/escape-from-tarkov-dark-realistic.jpg",
  },
]

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id)
}

export function getProductsByGame(game: string): Product[] {
  return PRODUCTS.filter((p) => p.game.toLowerCase().includes(game.toLowerCase()))
}
