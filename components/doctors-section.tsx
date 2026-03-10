'use client'

import { doctors } from '@/lib/data'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function DoctorsSection() {
  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 border-t border-border">
      <div className="max-w-6xl sm:max-w-7xl lg:max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 sm:mb-10 md:mb-12">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground tracking-widest uppercase mb-3 sm:mb-4">Our Team</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light mb-4 sm:mb-6 text-foreground">
            Meet Our <span className="font-semibold">Specialists</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl sm:max-w-3xl lg:max-w-4xl">
            Our team of experienced dentists is dedicated to providing exceptional care.
          </p>
        </div>

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {doctors.map((doctor) => (
            <div key={doctor.id} className="pt-6 sm:pt-8 border-t border-border hover:bg-muted/50 transition-colors">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-muted mb-4 sm:mb-6 mx-auto"></div>
              <h3 className="text-lg sm:text-xl font-medium text-foreground mb-2 sm:mb-3">
                {doctor.name}
              </h3>
              <p className="text-sm sm:text-base text-primary font-medium mb-3 sm:mb-4">
                {doctor.specialty}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
                {doctor.experience}
              </p>
              <Link href="/appointments/book">
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  Book with {doctor.name.split(' ')[1]}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
