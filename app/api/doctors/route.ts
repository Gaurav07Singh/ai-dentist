import { NextResponse } from 'next/server'
import { doctors } from '@/lib/data'
import { ApiResponse, Doctor } from '@/lib/types'

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: doctors,
      count: doctors.length,
    } as ApiResponse<Doctor[]>)
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch doctors' } as ApiResponse,
      { status: 500 }
    )
  }
}
