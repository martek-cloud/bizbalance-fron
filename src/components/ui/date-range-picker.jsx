import * as React from "react"
import { addMonths, endOfMonth, format, startOfMonth, subMonths, startOfYear, getYear, setYear, endOfYear } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const getCurrentYear = () => getYear(new Date())

const presets = [
  {
    label: "Monthly",
    value: "current-month",
    getDate: () => {
      const currentYear = getCurrentYear()
      return {
        from: startOfYear(setYear(new Date(), currentYear)),
        to: new Date(),
      }
    },
  },
  {
    label: "Quarterly",
    value: "last-3-months",
    getDate: () => {
      const currentYear = getCurrentYear()
      const startDate = startOfYear(setYear(new Date(), currentYear))
      const endDate = addMonths(startDate, 3)
      return {
        from: startDate,
        to: endDate,
      }
    },
  },
  {
    label: "Trimestral",
    value: "last-4-months",
    getDate: () => {
      const currentYear = getCurrentYear()
      const startDate = startOfYear(setYear(new Date(), currentYear))
      const endDate = addMonths(startDate, 4)
      return {
        from: startDate,
        to: endDate,
      }
    },
  },
  {
    label: "Semestral",
    value: "last-6-months",
    getDate: () => {
      const currentYear = getCurrentYear()
      const startDate = startOfYear(setYear(new Date(), currentYear))
      const endDate = addMonths(startDate, 6)
      return {
        from: startDate,
        to: endDate,
      }
    },
  },
  {
    label: "Annual",
    value: "last-year",
    getDate: () => {
      const currentYear = getCurrentYear()
      const startDate = startOfYear(setYear(new Date(), currentYear))
      return {
        from: startDate,
        to: endOfYear(startDate),
      }
    },
  },
]

export function DatePickerWithRange({
  className,
  date,
  setDate,
}) {
  const [isOpen, setIsOpen] = React.useState(false)

  const handlePresetClick = (preset) => {
    setDate(preset.getDate())
    setIsOpen(false)
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="border-b p-2 flex gap-1">
            {presets.map((preset) => (
              <Button
                key={preset.value}
                onClick={() => handlePresetClick(preset)}
                variant="outline"
                className="flex-1 text-xs h-8"
              >
                {preset.label}
              </Button>
            ))}
          </div>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
} 