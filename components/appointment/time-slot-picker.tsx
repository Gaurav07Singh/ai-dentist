'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import { TimeSlot } from '@/lib/types'

interface TimeSlotPickerProps {
  doctorId: string
  selectedDate: string
  selectedTime?: string
  onTimeSelect: (time: string) => void
  disabled?: boolean
}

export function TimeSlotPicker({ 
  doctorId, 
  selectedDate, 
  selectedTime, 
  onTimeSelect, 
  disabled 
}: TimeSlotPickerProps) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (doctorId && selectedDate) {
      fetchTimeSlots()
    }
  }, [doctorId, selectedDate])

  const fetchTimeSlots = async () => {
    if (!doctorId || !selectedDate) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/availability?doctorId=${doctorId}&date=${selectedDate}`
      )
      const data = await response.json()

      if (data.success) {
        // Check for existing appointments to mark unavailable slots
        const appointmentsResponse = await fetch(
          `/api/appointments?doctorId=${doctorId}&date=${selectedDate}`
        )
        const appointmentsData = await appointmentsResponse.json()

        if (appointmentsData.success) {
          const bookedTimes = appointmentsData.data
            .filter((apt: any) => apt.status !== 'cancelled')
            .map((apt: any) => apt.time)

          const updatedTimeSlots = data.data.timeSlots.map((slot: TimeSlot) => ({
            ...slot,
            available: !bookedTimes.includes(slot.time),
          }))

          setTimeSlots(updatedTimeSlots)
        } else {
          setTimeSlots(data.data.timeSlots)
        }
      } else {
        setError(data.error || 'Failed to load available times')
      }
    } catch (err) {
      setError('Failed to load available times')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2 text-sm text-muted-foreground">Loading available times...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-destructive">{error}</p>
        <Button variant="outline" size="sm" onClick={fetchTimeSlots} className="mt-2">
          Try Again
        </Button>
      </div>
    )
  }

  if (timeSlots.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">No available time slots for this date</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        Select Time
      </label>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {timeSlots.map((slot) => (
          <Button
            key={slot.time}
            variant={selectedTime === slot.time ? "default" : "outline"}
            size="sm"
            disabled={!slot.available || disabled}
            onClick={() => slot.available && onTimeSelect(slot.time)}
            className="relative"
          >
            {slot.time}
            {!slot.available && (
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-2 w-2 p-0" />
            )}
          </Button>
        ))}
      </div>
    </div>
  )
}
