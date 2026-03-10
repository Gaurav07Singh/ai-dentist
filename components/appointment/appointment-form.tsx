'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { DoctorSelect } from './doctor-select'
import { TimeSlotPicker } from './time-slot-picker'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Doctor, AppointmentFormData } from '@/lib/types'
import { doctors } from '@/lib/data'
import { toast } from 'sonner'

const appointmentSchema = z.object({
  doctor_id: z.string().min(1, 'Please select a doctor'),
  date: z.string().min(1, 'Please select a date'),
  time: z.string().min(1, 'Please select a time'),
  notes: z.string().optional(),
  // Legacy fields for backward compatibility
  name: z.string().optional(),
  phone: z.string().optional(),
  problem: z.string().optional(),
  appointmentType: z.string().optional(),
}).refine(
  (data) => {
    // Either new format or legacy format should be complete
    if (data.doctor_id && data.date && data.time) return true
    if (data.name && data.phone && data.problem && data.date && data.time && data.appointmentType) return true
    return false
  },
  {
    message: 'Please complete all required fields',
    path: ['root'],
  }
)

type AppointmentFormValues = z.infer<typeof appointmentSchema>

interface AppointmentFormProps {
  onSuccess?: (appointment: any) => void
  initialData?: Partial<AppointmentFormData>
}

export function AppointmentForm({ onSuccess, initialData }: AppointmentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    initialData?.date ? new Date(initialData.date) : undefined
  )

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      doctor_id: initialData?.doctor_id || '',
      date: initialData?.date || '',
      time: initialData?.time || '',
      notes: initialData?.notes || '',
      name: initialData?.name || '',
      phone: initialData?.phone || '',
      problem: initialData?.problem || '',
      appointmentType: initialData?.appointmentType || '',
    },
  })

  const selectedDoctor = form.watch('doctor_id')
  const selectedTime = form.watch('time')

  useEffect(() => {
    if (selectedDate) {
      form.setValue('date', format(selectedDate, 'yyyy-MM-dd'))
    }
  }, [selectedDate, form])

  const onSubmit = async (values: AppointmentFormValues) => {
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Appointment booked successfully!')
        form.reset()
        setSelectedDate(undefined)
        onSuccess?.(data.data)
      } else {
        toast.error(data.error || 'Failed to book appointment')
      }
    } catch (error) {
      toast.error('Failed to book appointment')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
        <DoctorSelect
          doctors={doctors}
          selectedDoctor={selectedDoctor}
          onDoctorSelect={(doctorId) => form.setValue('doctor_id', doctorId)}
          disabled={isSubmitting}
        />
        {selectedDoctor && form.getValues('date') && (
          <TimeSlotPicker
            doctorId={selectedDoctor}
            selectedDate={form.getValues('date')}
            selectedTime={selectedTime}
            onTimeSelect={(time) => form.setValue('time', time)}
            disabled={isSubmitting}
          />
        )}
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-sm sm:text-base font-medium">Select Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full pl-3 text-left font-normal sm:text-sm sm:pl-4',
                        !field.value && 'text-muted-foreground'
                      )}
                      disabled={isSubmitting}
                    >
                      {field.value ? (
                        <span className="sm:text-sm">{format(new Date(field.value), 'PPP')}</span>
                      ) : (
                        <span className="text-muted-foreground">Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 sm:w-5 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 sm:p-2" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0, 0, 0, 0)) || 
                      isSubmitting
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm sm:text-base font-medium">Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any special requests or notes for your appointment..."
                  className="resize-none sm:text-sm"
                  rows={3}
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting} className="w-full h-12 sm:h-14 text-sm sm:text-base">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 sm:w-5 animate-spin" />}
          Book Appointment
        </Button>
      </form>
    </Form>
  )
}
