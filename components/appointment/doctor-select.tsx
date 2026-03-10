'use client'

import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Doctor } from '@/lib/types'

interface DoctorSelectProps {
  doctors: Doctor[]
  selectedDoctor?: string
  onDoctorSelect: (doctorId: string) => void
  disabled?: boolean
}

export function DoctorSelect({ doctors, selectedDoctor, onDoctorSelect, disabled }: DoctorSelectProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        Select Doctor
      </label>
      <Select
        value={selectedDoctor}
        onValueChange={onDoctorSelect}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Choose a doctor..." />
        </SelectTrigger>
        <SelectContent>
          {doctors.map((doctor) => (
            <SelectItem key={doctor.id} value={doctor.id}>
              <div className="flex flex-col">
                <span className="font-medium">{doctor.name}</span>
                <span className="text-sm text-muted-foreground">{doctor.specialty}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
