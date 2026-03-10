import { NextRequest, NextResponse } from 'next/server'
import { doctorAvailability, getAvailableTimeSlots } from '@/lib/data'
import { ApiResponse, TimeSlot } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const doctorId = searchParams.get('doctorId')
    const date = searchParams.get('date')

    if (!doctorId || !date) {
      return NextResponse.json(
        { success: false, error: 'doctorId and date are required' } as ApiResponse,
        { status: 400 }
      )
    }

    // Get availability for the specific doctor and date
    const availability = doctorAvailability.filter(avail => 
      avail.doctor_id === doctorId && 
      avail.is_active
    )

    // Get available time slots for the date
    const targetDate = new Date(date)
    const availableTimeSlots = getAvailableTimeSlots(doctorId, targetDate)

    // Create TimeSlot objects
    const timeSlots: TimeSlot[] = availableTimeSlots.map(time => ({
      time,
      available: true,
    }))

    return NextResponse.json({
      success: true,
      data: {
        availability,
        timeSlots,
      },
    } as ApiResponse<{ availability: any[], timeSlots: TimeSlot[] }>)
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch availability' } as ApiResponse,
      { status: 500 }
    )
  }
}
