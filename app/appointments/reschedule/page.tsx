'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { AppointmentForm } from '@/components/appointment/appointment-form'
import { Appointment, Doctor } from '@/lib/types'
import { doctors } from '@/lib/data'
import { toast } from 'sonner'

function RescheduleContent() {
  const searchParams = useSearchParams()
  const appointmentId = searchParams.get('id')
  
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateComplete, setUpdateComplete] = useState(false)

  useEffect(() => {
    if (appointmentId) {
      fetchAppointment()
    }
  }, [appointmentId])

  const fetchAppointment = async () => {
    try {
      const response = await fetch('/api/appointments')
      const data = await response.json()

      if (data.success) {
        const foundAppointment = data.data.find((apt: Appointment) => apt.id === appointmentId)
        
        if (foundAppointment) {
          setAppointment(foundAppointment)
          const foundDoctor = doctors.find(d => d.id === foundAppointment.doctor_id)
          setDoctor(foundDoctor || null)
        } else {
          toast.error('Appointment not found')
        }
      } else {
        toast.error('Failed to fetch appointment')
      }
    } catch (error) {
      toast.error('Failed to fetch appointment')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRescheduleSuccess = async (newAppointmentData: any) => {
    if (!appointment) return

    setIsUpdating(true)

    try {
      const response = await fetch(`/api/appointments?id=${appointment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctor_id: newAppointmentData.doctor_id,
          date: newAppointmentData.date,
          time: newAppointmentData.time,
          notes: newAppointmentData.notes,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setUpdateComplete(true)
        toast.success('Appointment rescheduled successfully')
      } else {
        toast.error(data.error || 'Failed to reschedule appointment')
      }
    } catch (error) {
      toast.error('Failed to reschedule appointment')
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Appointment Not Found</h1>
            <p className="text-muted-foreground mb-4">
              The appointment you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/appointments">
              <Button>Back to Appointments</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (updateComplete) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Appointment Rescheduled!</h1>
            <p className="text-muted-foreground mb-6">
              Your appointment has been successfully rescheduled.
            </p>
            
            <Link href="/appointments">
              <Button>View My Appointments</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-8">
          <Link href="/appointments">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Appointments
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Reschedule Appointment</h1>
          <p className="text-muted-foreground mt-2">
            Choose a new date and time for your appointment.
          </p>
        </div>

        {/* Current Appointment Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Current Appointment</CardTitle>
            <CardDescription>
              This is your current appointment that will be rescheduled.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{doctor?.name || 'Doctor'}</span>
              <Badge variant="outline">{doctor?.specialty || 'General Dentistry'}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{format(new Date(appointment.date), 'PPP')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{appointment.time}</span>
            </div>
            {appointment.notes && (
              <div>
                <p className="font-medium mb-1">Notes:</p>
                <p className="text-sm text-muted-foreground">{appointment.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reschedule Form */}
        <Card>
          <CardHeader>
            <CardTitle>Select New Date & Time</CardTitle>
            <CardDescription>
              Choose your preferred new date and time for the appointment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AppointmentForm
              onSuccess={handleRescheduleSuccess}
              initialData={{
                doctor_id: appointment.doctor_id,
                date: appointment.date,
                time: appointment.time,
                notes: appointment.notes,
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function RescheduleAppointmentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RescheduleContent />
    </Suspense>
  )
}
