"use client"

import * as React from "react"
import { format, parseISO } from "date-fns"
import { CalendarIcon, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  value?: string | null
  onChange?: (dateString: string | null) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  hasError?: boolean
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date (Optional)",
  disabled,
  className,
  hasError,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  const selectedDate = React.useMemo(() => {
    if (!value) return undefined
    try {
      return parseISO(value)
    } catch {
      return undefined
    }
  }, [value])

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      const formatted = format(date, "yyyy-MM-dd")
      onChange?.(formatted)
    } else {
      onChange?.(null)
    }
    setOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange?.(null)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="relative w-full">
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal h-10 text-sm bg-background border-input pr-8",
              !selectedDate && "text-muted-foreground",
              hasError && "border-red-500 ring-1 ring-red-500",
              className
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0 opacity-70" />
            {selectedDate ? format(selectedDate, "PPP") : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>

        {selectedDate && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 top-3 text-muted-foreground hover:text-foreground p-0.5 rounded-full hover:bg-muted transition-colors"
            title="Clear date (Set to null)"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-1 border-b border-border flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              onChange?.(null)
              setOpen(false)
            }}
            className="h-7 text-xs text-muted-foreground hover:text-foreground"
          >
            Clear Date (null)
          </Button>
        </div>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
        />
      </PopoverContent>
    </Popover>
  )
}
