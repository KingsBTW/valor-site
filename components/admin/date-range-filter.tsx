"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, X } from "lucide-react"
import { format, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns"

export function DateRangeFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [startDate, setStartDate] = useState<Date | undefined>(
    searchParams.get("start") ? new Date(searchParams.get("start")!) : undefined,
  )
  const [endDate, setEndDate] = useState<Date | undefined>(
    searchParams.get("end") ? new Date(searchParams.get("end")!) : undefined,
  )
  const [preset, setPreset] = useState<string>("")

  const applyFilter = (start: Date, end: Date) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("start", format(start, "yyyy-MM-dd"))
    params.set("end", format(end, "yyyy-MM-dd"))
    router.push(`?${params.toString()}`)
  }

  const clearFilter = () => {
    setStartDate(undefined)
    setEndDate(undefined)
    setPreset("")
    router.push("/admin")
  }

  const handlePresetChange = (value: string) => {
    setPreset(value)
    const today = new Date()
    let start: Date
    let end: Date = today

    switch (value) {
      case "today":
        start = today
        break
      case "yesterday":
        start = subDays(today, 1)
        end = subDays(today, 1)
        break
      case "last7days":
        start = subDays(today, 6)
        break
      case "last30days":
        start = subDays(today, 29)
        break
      case "thisWeek":
        start = startOfWeek(today, { weekStartsOn: 1 })
        end = endOfWeek(today, { weekStartsOn: 1 })
        break
      case "thisMonth":
        start = startOfMonth(today)
        end = endOfMonth(today)
        break
      default:
        return
    }

    setStartDate(start)
    setEndDate(end)
    applyFilter(start, end)
  }

  const handleCustomApply = () => {
    if (startDate && endDate) {
      applyFilter(startDate, endDate)
    }
  }

  const hasFilter = searchParams.get("start") && searchParams.get("end")

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={preset} onValueChange={handlePresetChange}>
        <SelectTrigger className="w-[160px] bg-background border-border">
          <SelectValue placeholder="Select period" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="yesterday">Yesterday</SelectItem>
          <SelectItem value="last7days">Last 7 Days</SelectItem>
          <SelectItem value="last30days">Last 30 Days</SelectItem>
          <SelectItem value="thisWeek">This Week</SelectItem>
          <SelectItem value="thisMonth">This Month</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex items-center gap-1">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <CalendarIcon className="h-4 w-4" />
              {startDate ? format(startDate, "MMM d") : "Start"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={(date) => {
                setStartDate(date)
                setPreset("")
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <span className="text-muted-foreground">-</span>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <CalendarIcon className="h-4 w-4" />
              {endDate ? format(endDate, "MMM d") : "End"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={(date) => {
                setEndDate(date)
                setPreset("")
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {startDate && endDate && !hasFilter && (
          <Button size="sm" onClick={handleCustomApply}>
            Apply
          </Button>
        )}
      </div>

      {hasFilter && (
        <Button variant="ghost" size="sm" onClick={clearFilter} className="gap-1 text-muted-foreground">
          <X className="h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  )
}
