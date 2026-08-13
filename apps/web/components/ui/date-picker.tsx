"use client"

import * as React from "react"
import { format, parseISO } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  value?: string
  onChange?: (dateString: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  hasError?: boolean
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled,
  className,
  hasError,
}: DatePickerProps) {
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
      onChange?.("")
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal h-10 text-sm bg-background border-input",
            !selectedDate && "text-muted-foreground",
            hasError && "border-red-500 ring-1 ring-red-500",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0 opacity-70" />
          {selectedDate ? format(selectedDate, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
        />
      </PopoverContent>
    </Popover>
  )
}
