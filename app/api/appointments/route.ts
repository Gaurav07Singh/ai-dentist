import { NextRequest, NextResponse } from 'next/server'
import { Appointment, ApiResponse } from '@/lib/types'
import { doctors } from '@/lib/data'

// Enhanced in-memory storage for appointments
let appointments: Appointment[] = []
let nextId = 1

// Helper functions
const generateId = (): string => (nextId++).toString()

const validateAppointmentTime = (doctorId: string, date: string, time: string, excludeId?: string): boolean => {
  const conflictingAppointment = appointments.find(apt => 
    apt.doctor_id === doctorId &&
    apt.date === date &&
    apt.time === time &&
    apt.status !== 'cancelled' &&
    apt.id !== excludeId
  )
  
  return !conflictingAppointment
}

const createAppointment = (data: any): Appointment => {
  const now = new Date().toISOString()
  return {
    id: generateId(),
    patient_id: data.patient_id || `patient_${Date.now()}`,
    doctor_id: data.doctor_id,
    date: data.date,
    time: data.time,
    status: 'scheduled',
    notes: data.notes,
    createdAt: now,
    updatedAt: now,
    // Legacy fields for backward compatibility
    name: data.name,
    phone: data.phone,
    problem: data.problem,
    appointmentType: data.appointmentType,
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const doctorId = searchParams.get('doctorId')
    const date = searchParams.get('date')
    const patientId = searchParams.get('patientId')
    const status = searchParams.get('status')

    let filteredAppointments = appointments

    // Apply filters
    if (doctorId) {
      filteredAppointments = filteredAppointments.filter(apt => apt.doctor_id === doctorId)
    }
    if (date) {
      filteredAppointments = filteredAppointments.filter(apt => apt.date === date)
    }
    if (patientId) {
      filteredAppointments = filteredAppointments.filter(apt => apt.patient_id === patientId)
    }
    if (status) {
      filteredAppointments = filteredAppointments.filter(apt => apt.status === status)
    }

    // Sort by date and time
    filteredAppointments.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date)
      if (dateCompare !== 0) return dateCompare
      return a.time.localeCompare(b.time)
    })

    return NextResponse.json({
      success: true,
      data: filteredAppointments,
      count: filteredAppointments.length,
    } as ApiResponse<Appointment[]>)
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch appointments' } as ApiResponse,
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Support both new and legacy field formats
    const { 
      doctor_id, 
      patient_id, 
      date, 
      time, 
      notes,
      // Legacy fields
      name, 
      phone, 
      problem, 
      appointmentType 
    } = body

    // Validate required fields (support both formats)
    const requiredFields = doctor_id ? [doctor_id, date, time] : [name, phone, problem, date, time, appointmentType]
    
    if (requiredFields.some(field => !field)) {
      return NextResponse.json(
        {
          success: false,
          error: doctor_id 
            ? 'Missing required fields: doctor_id, date, time'
            : 'Missing required fields: name, phone, problem, date, time, appointmentType',
        } as ApiResponse,
        { status: 400 }
      )
    }

    // Validate doctor exists
    if (doctor_id && !doctors.find(d => d.id === doctor_id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid doctor ID' } as ApiResponse,
        { status: 400 }
      )
    }

    // Check for double booking
    if (doctor_id && !validateAppointmentTime(doctor_id, date, time)) {
      return NextResponse.json(
        { success: false, error: 'Time slot is already booked' } as ApiResponse,
        { status: 409 }
      )
    }

    // Create appointment
    const appointment = createAppointment({
      doctor_id: doctor_id || '1', // Default to first doctor for legacy format
      patient_id,
      date,
      time,
      notes,
      name,
      phone,
      problem,
      appointmentType,
    })

    // Store appointment
    appointments.push(appointment)

    return NextResponse.json(
      {
        success: true,
        message: 'Appointment booked successfully',
        data: appointment,
      } as ApiResponse<Appointment>,
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating appointment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create appointment' } as ApiResponse,
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Appointment ID is required' } as ApiResponse,
        { status: 400 }
      )
    }

    const appointmentIndex = appointments.findIndex(apt => apt.id === id)

    if (appointmentIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Appointment not found' } as ApiResponse,
        { status: 404 }
      )
    }

    const body = await request.json()
    const existingAppointment = appointments[appointmentIndex]

    // If updating doctor, date, or time, validate no conflicts
    if (body.doctor_id || body.date || body.time) {
      const newDoctorId = body.doctor_id || existingAppointment.doctor_id
      const newDate = body.date || existingAppointment.date
      const newTime = body.time || existingAppointment.time

      if (!validateAppointmentTime(newDoctorId, newDate, newTime, id)) {
        return NextResponse.json(
          { success: false, error: 'Time slot is already booked' } as ApiResponse,
          { status: 409 }
        )
      }
    }

    // Update appointment
    const updatedAppointment: Appointment = {
      ...existingAppointment,
      ...body,
      updatedAt: new Date().toISOString(),
    }

    appointments[appointmentIndex] = updatedAppointment

    return NextResponse.json(
      {
        success: true,
        message: 'Appointment updated successfully',
        data: updatedAppointment,
      } as ApiResponse<Appointment>
    )
  } catch (error) {
    console.error('Error updating appointment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update appointment' } as ApiResponse,
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Appointment ID is required' } as ApiResponse,
        { status: 400 }
      )
    }

    const index = appointments.findIndex((apt) => apt.id === id)

    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Appointment not found' } as ApiResponse,
        { status: 404 }
      )
    }

    const deleted = appointments.splice(index, 1)

    return NextResponse.json({
      success: true,
      message: 'Appointment deleted successfully',
      data: deleted[0],
    } as ApiResponse<Appointment>)
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete appointment' } as ApiResponse,
      { status: 500 }
    )
  }
}
