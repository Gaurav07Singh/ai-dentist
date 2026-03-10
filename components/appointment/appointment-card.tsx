'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Calendar, Clock, User, Phone, MessageSquare, Edit, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { Appointment, Doctor } from '@/lib/types'
import { toast } from 'sonner'

interface AppointmentCardProps {
  appointment: Appointment
  doctor?: Doctor
  onCancel?: (id: string) => void
  onReschedule?: (appointment: Appointment) => void
  showActions?: boolean
}

export function AppointmentCard({ 
  appointment, 
  doctor, 
  onCancel, 
  onReschedule, 
  showActions = true 
}: AppointmentCardProps) {
  const [isCancelling, setIsCancelling] = useState(false)

  const handleCancel = async () => {
    setIsCancelling(true)
    
    try {
      const response = await fetch(`/api/appointments?id=${appointment.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Appointment cancelled successfully')
        onCancel?.(appointment.id)
      } else {
        toast.error(data.error || 'Failed to cancel appointment')
      }
    } catch (error) {
      toast.error('Failed to cancel appointment')
    } finally {
      setIsCancelling(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const isUpcoming = new Date(`${appointment.date} ${appointment.time}`) > new Date()
  const canCancel = isUpcoming && appointment.status === 'scheduled'
  const canReschedule = isUpcoming && appointment.status === 'scheduled'

  return (
    <Card className={appointment.status === 'cancelled' ? 'opacity-75' : ''}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">
              {doctor?.name || 'Doctor'}
            </CardTitle>
            <CardDescription>
              {doctor?.specialty || 'General Dentistry'}
            </CardDescription>
          </div>
          <Badge className={getStatusColor(appointment.status)}>
            {appointment.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{format(new Date(appointment.date), 'PPP')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{appointment.time}</span>
          </div>
        </div>

        {(appointment.name || appointment.phone) && (
          <div className="space-y-2 text-sm">
            {appointment.name && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{appointment.name}</span>
              </div>
            )}
            {appointment.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{appointment.phone}</span>
              </div>
            )}
          </div>
        )}

        {appointment.problem && (
          <div className="flex items-start gap-2 text-sm">
            <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
            <span className="text-muted-foreground">{appointment.problem}</span>
          </div>
        )}

        {appointment.notes && (
          <div className="text-sm">
            <p className="font-medium mb-1">Notes:</p>
            <p className="text-muted-foreground">{appointment.notes}</p>
          </div>
        )}

        {showActions && (canCancel || canReschedule) && (
          <div className="flex gap-2 pt-2 border-t">
            {canReschedule && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onReschedule?.(appointment)}
                className="flex-1"
              >
                <Edit className="mr-2 h-4 w-4" />
                Reschedule
              </Button>
            )}
            
            {canCancel && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Appointment?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to cancel this appointment? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleCancel}
                      disabled={isCancelling}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isCancelling ? 'Cancelling...' : 'Yes, Cancel'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
