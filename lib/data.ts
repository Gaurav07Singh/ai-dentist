// Static data and mock data for the application

import { Doctor, Availability } from './types'

export const doctors: Doctor[] = [
  {
    id: '1',
    name: 'Dr. Sarah Mitchell',
    specialty: 'General & Cosmetic',
    experience: '18 years',
    email: 'sarah.mitchell@smilecare.com',
    phone: '+1-555-0123',
  },
  {
    id: '2',
    name: 'Dr. James Chen',
    specialty: 'Orthodontics',
    experience: '15 years',
    email: 'james.chen@smilecare.com',
    phone: '+1-555-0124',
  },
  {
    id: '3',
    name: 'Dr. Emily Rodriguez',
    specialty: 'Endodontics',
    experience: '12 years',
    email: 'emily.rodriguez@smilecare.com',
    phone: '+1-555-0125',
  },
]

export const doctorAvailability: Availability[] = [
  // Dr. Sarah Mitchell - Mon-Fri 9AM-5PM
  {
    id: '1',
    doctor_id: '1',
    day_of_week: 1, // Monday
    start_time: '09:00',
    end_time: '17:00',
    is_active: true,
  },
  {
    id: '2',
    doctor_id: '1',
    day_of_week: 2, // Tuesday
    start_time: '09:00',
    end_time: '17:00',
    is_active: true,
  },
  {
    id: '3',
    doctor_id: '1',
    day_of_week: 3, // Wednesday
    start_time: '09:00',
    end_time: '17:00',
    is_active: true,
  },
  {
    id: '4',
    doctor_id: '1',
    day_of_week: 4, // Thursday
    start_time: '09:00',
    end_time: '17:00',
    is_active: true,
  },
  {
    id: '5',
    doctor_id: '1',
    day_of_week: 5, // Friday
    start_time: '09:00',
    end_time: '17:00',
    is_active: true,
  },
  // Dr. James Chen - Mon, Wed, Fri 8AM-4PM
  {
    id: '6',
    doctor_id: '2',
    day_of_week: 1, // Monday
    start_time: '08:00',
    end_time: '16:00',
    is_active: true,
  },
  {
    id: '7',
    doctor_id: '2',
    day_of_week: 3, // Wednesday
    start_time: '08:00',
    end_time: '16:00',
    is_active: true,
  },
  {
    id: '8',
    doctor_id: '2',
    day_of_week: 5, // Friday
    start_time: '08:00',
    end_time: '16:00',
    is_active: true,
  },
  // Dr. Emily Rodriguez - Tue, Thu 10AM-6PM
  {
    id: '9',
    doctor_id: '3',
    day_of_week: 2, // Tuesday
    start_time: '10:00',
    end_time: '18:00',
    is_active: true,
  },
  {
    id: '10',
    doctor_id: '3',
    day_of_week: 4, // Thursday
    start_time: '10:00',
    end_time: '18:00',
    is_active: true,
  },
]

export const appointmentTypes = [
  'Regular Checkup',
  'Cleaning',
  'Emergency',
  'Consultation',
  'Treatment',
  'Follow-up',
]

export const timeSlotOptions = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
]

// Helper functions
export const getDoctorById = (id: string): Doctor | undefined => {
  return doctors.find(doctor => doctor.id === id)
}

export const getDoctorAvailability = (doctorId: string): Availability[] => {
  return doctorAvailability.filter(avail => avail.doctor_id === doctorId && avail.is_active)
}

export const isDoctorAvailableOnDay = (doctorId: string, date: Date): boolean => {
  const dayOfWeek = date.getDay()
  const availability = getDoctorAvailability(doctorId)
  return availability.some(avail => avail.day_of_week === dayOfWeek)
}

export const getAvailableTimeSlots = (doctorId: string, date: Date): string[] => {
  const dayOfWeek = date.getDay()
  const availability = getDoctorAvailability(doctorId)
  const dayAvailability = availability.find(avail => avail.day_of_week === dayOfWeek)
  
  if (!dayAvailability) return []
  
  return timeSlotOptions.filter(time => {
    return time >= dayAvailability.start_time && time <= dayAvailability.end_time
  })
}
