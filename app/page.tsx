'use client'

import { HeroSection } from '@/components/hero-section'
import { ServicesSection } from '@/components/services-section'
import { WhyUsSection } from '@/components/why-us-section'
import { DoctorsSection } from '@/components/doctors-section'
import { TestimonialsSection } from '@/components/testimonials-section'
import { ContactSection } from '@/components/contact-section'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <ServicesSection />
      <WhyUsSection />
      <DoctorsSection />
      <TestimonialsSection />
      <ContactSection />
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 sm:mb-16">
        <Link href="/chatbot">
          <Button
            size="lg"
            className="group bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-6 sm:px-8 w-full sm:w-auto"
          >
            Book Appointment
            <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
        <Link href="/appointments">
          <Button
            size="lg"
            variant="outline"
            className="h-12 px-6 sm:px-8 w-full sm:w-auto"
          >
            View Appointments
          </Button>
        </Link>
      </div>
      <Footer />
    </main>
  )
}
