// Core data types for the appointment scheduling system

export interface Doctor {
  id: string
  name: string
  specialty: string
  experience: string
  email?: string
  phone?: string
}

export interface Appointment {
  id: string
  patient_id: string
  doctor_id: string
  date: string // YYYY-MM-DD format
  time: string // HH:MM format
  status: 'scheduled' | 'cancelled' | 'completed'
  notes?: string
  createdAt: string
  updatedAt: string
  // Legacy fields for backward compatibility
  name?: string
  phone?: string
  problem?: string
  appointmentType?: string
}

export interface Availability {
  id: string
  doctor_id: string
  day_of_week: number // 0-6 (Sunday-Saturday)
  start_time: string // HH:MM format
  end_time: string // HH:MM format
  is_active: boolean
}

export interface TimeSlot {
  time: string
  available: boolean
  appointment?: Appointment
}

export interface AppointmentFormData {
  doctor_id: string
  date: string
  time: string
  notes?: string
  // Legacy fields for backward compatibility
  name?: string
  phone?: string
  problem?: string
  appointmentType?: string
}

export interface Patient {
  id: string
  name: string
  email: string
  phone: string
  date_of_birth?: string
  medical_history?: string
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  count?: number
}

// Form validation types
export interface FormErrors {
  [key: string]: string
}

// UI Component Props
export interface AppointmentCardProps {
  appointment: Appointment
  doctor?: Doctor
  onCancel?: (id: string) => void
  onReschedule?: (appointment: Appointment) => void
  showActions?: boolean
}

export interface TimeSlotPickerProps {
  doctorId: string
  selectedDate: string
  selectedTime?: string
  onTimeSelect: (time: string) => void
  disabled?: boolean
}

export interface DoctorSelectProps {
  doctors: Doctor[]
  selectedDoctor?: string
  onDoctorSelect: (doctorId: string) => void
  disabled?: boolean
}
