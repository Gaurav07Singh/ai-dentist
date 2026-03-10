'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AppointmentForm } from '@/components/appointment/appointment-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { Appointment } from '@/lib/types'

export default function BookAppointmentPage() {
  const [bookingComplete, setBookingComplete] = useState(false)
  const [bookedAppointment, setBookedAppointment] = useState<Appointment | null>(null)

  const handleBookingSuccess = (appointment: Appointment) => {
    setBookedAppointment(appointment)
    setBookingComplete(true)
  }

  const handleBookAnother = () => {
    setBookingComplete(false)
    setBookedAppointment(null)
  }

  if (bookingComplete && bookedAppointment) {
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
          </div>

          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Appointment Confirmed!</CardTitle>
              <CardDescription>
                Your appointment has been successfully booked.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <h3 className="font-medium mb-2">Appointment Details</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Appointment ID:</strong> {bookedAppointment.id}</p>
                  <p><strong>Date:</strong> {new Date(bookedAppointment.date).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {bookedAppointment.time}</p>
                  <p><strong>Status:</strong> {bookedAppointment.status}</p>
                  {bookedAppointment.notes && (
                    <p><strong>Notes:</strong> {bookedAppointment.notes}</p>
                  )}
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg">
                <p className="font-medium text-blue-900 mb-1">What's Next?</p>
                <ul className="space-y-1 text-blue-800">
                  <li>• You'll receive a confirmation message shortly</li>
                  <li>• Please arrive 10 minutes before your appointment</li>
                  <li>• Bring your ID and insurance information</li>
                  <li>• Contact us if you need to reschedule</li>
                </ul>
              </div>

              <div className="flex gap-2 pt-4">
                <Link href="/appointments" className="flex-1">
                  <Button variant="outline" className="w-full">
                    View My Appointments
                  </Button>
                </Link>
                <Button onClick={handleBookAnother} className="flex-1">
                  Book Another Appointment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-4 sm:py-6 px-4 sm:px-6">
      <div className="container mx-auto max-w-2xl sm:max-w-4xl">
        <div className="mb-6 sm:mb-8">
          <Link href="/appointments">
            <Button variant="ghost" className="mb-4 sm:mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Appointments
            </Button>
          </Link>
          
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center sm:text-left">Book Appointment</h1>
          <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 text-center sm:text-left max-w-2xl mx-auto">
            Schedule your dental appointment with our experienced doctors.
          </p>
        </div>

        <Card className="w-full">
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="text-lg sm:text-xl">New Appointment</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Fill in details below to book your appointment.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <AppointmentForm onSuccess={handleBookingSuccess} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
