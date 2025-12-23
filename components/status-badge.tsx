import { cn } from "@/lib/utils"

type Status = "undetected" | "updating" | "down" | "testing"

const statusConfig = {
  undetected: {
    color: "bg-green-500",
    text: "Undetected",
    bgLight: "bg-green-500/20",
    textColor: "text-green-400",
  },
  updating: {
    color: "bg-yellow-500",
    text: "Updating",
    bgLight: "bg-yellow-500/20",
    textColor: "text-yellow-400",
  },
  down: {
    color: "bg-red-500",
    text: "Down",
    bgLight: "bg-red-500/20",
    textColor: "text-red-400",
  },
  testing: {
    color: "bg-blue-500",
    text: "Testing",
    bgLight: "bg-blue-500/20",
    textColor: "text-blue-400",
  },
}

export function StatusBadge({ status, size = "default" }: { status: Status; size?: "small" | "default" | "large" }) {
  const config = statusConfig[status]

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border",
        config.bgLight,
        config.textColor,
        size === "small" && "px-2 py-0.5 text-xs",
        size === "default" && "px-3 py-1 text-sm",
        size === "large" && "px-4 py-2 text-base",
      )}
    >
      <span className="relative flex h-2 w-2">
        <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", config.color)} />
        <span className={cn("relative inline-flex rounded-full h-2 w-2", config.color)} />
      </span>
      {config.text}
    </div>
  )
}
