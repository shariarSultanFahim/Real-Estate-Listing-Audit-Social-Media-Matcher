"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface ComboboxOption {
  value: string
  label: string
}

export interface ComboboxProps {
  options: ComboboxOption[]
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  className?: string
  disabled?: boolean
  allowCustom?: boolean
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  searchPlaceholder = "Search or enter custom value...",
  emptyText = "No option found.",
  className,
  disabled = false,
  allowCustom = false,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")

  const selectedOption = options.find((opt) => opt.value === value)
  const displayLabel = selectedOption ? selectedOption.label : (allowCustom && value ? value : placeholder)

  const isExactMatch = options.some(
    (opt) => opt.label.toLowerCase() === searchValue.trim().toLowerCase() || opt.value.toLowerCase() === searchValue.trim().toLowerCase()
  )

  const handleSelectCustom = () => {
    if (!searchValue.trim()) return
    onChange?.(searchValue.trim())
    setSearchValue("")
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal text-left h-10 px-3 bg-background border-input text-foreground hover:bg-accent hover:text-accent-foreground",
            !value && "text-muted-foreground",
            className
          )}
        >
          <span className="truncate">
            {displayLabel}
          </span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput
            placeholder={searchPlaceholder}
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            {allowCustom && searchValue.trim() && !isExactMatch ? (
              <CommandGroup heading="Custom Entry">
                <CommandItem
                  value={searchValue}
                  onSelect={handleSelectCustom}
                  className="cursor-pointer text-primary font-medium flex items-center gap-1.5"
                >
                  <Plus className="size-3.5" />
                  Use custom: &ldquo;{searchValue.trim()}&rdquo;
                </CommandItem>
              </CommandGroup>
            ) : (
              <CommandEmpty>{emptyText}</CommandEmpty>
            )}

            <CommandGroup heading="Suggestions">
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => {
                    onChange?.(option.value)
                    setSearchValue("")
                    setOpen(false)
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 size-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
