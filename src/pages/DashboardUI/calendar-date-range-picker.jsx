'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon } from '@radix-ui/react-icons';
import { format, startOfMonth, endOfMonth } from 'date-fns';

export function CalendarDateRangePicker({ className, date, onDateChange }) {
  // Internal state to manage dates before saving
  const [internalDate, setInternalDate] = React.useState(date || {
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });

  // State to control popover
  const [isOpen, setIsOpen] = React.useState(false);

  // Update internal state when date prop changes
  React.useEffect(() => {
    if (date) {
      setInternalDate(date);
    }
  }, [date]);

  const handleSelect = (selectedDate) => {
    setInternalDate(selectedDate);
  };

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={'outline'}
            className={cn(
              'w-[260px] justify-start text-left font-normal',
              !internalDate && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {internalDate?.from ? (
              internalDate.to ? (
                <>
                  {format(internalDate.from, 'LLL dd, y')} -{' '}
                  {format(internalDate.to, 'LLL dd, y')}
                </>
              ) : (
                format(internalDate.from, 'LLL dd, y')
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={internalDate?.from}
            selected={internalDate}
            onSelect={handleSelect}
            numberOfMonths={2}
          />
          <div className="flex justify-end gap-2 p-3 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => {
                onDateChange(internalDate);
                setIsOpen(false);
              }}
            >
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}