'use client'

import { Card } from '@/components/ui/card'

const testimonials = [
  {
    id: 1,
    name: 'Michael Johnson',
    text: 'Excellent service and professional staff. Dr. Sarah made my teeth whitening experience smooth and comfortable. Highly recommended!',
    rating: 5,
  },
  {
    id: 2,
    name: 'Lisa Wang',
    text: 'I was nervous about my root canal, but Dr. Chen was incredibly gentle and reassuring. The procedure was painless. Thank you!',
    rating: 5,
  },
  {
    id: 3,
    name: 'David Thompson',
    text: 'Best dental clinic in town. Modern facilities, friendly staff, and affordable prices. Been a patient for 5 years!',
    rating: 5,
  },
  {
    id: 4,
    name: 'Jennifer Lee',
    text: 'My kids love coming here. The whole team is patient and kind with children. SmileCare is our family dentist!',
    rating: 5,
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 border-t border-border">
      <div className="max-w-6xl sm:max-w-7xl lg:max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 sm:mb-10 md:mb-12">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground tracking-widest uppercase mb-3 sm:mb-4">Testimonials</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light mb-4 sm:mb-6 text-foreground">
            Trusted by Our <span className="font-semibold">Patients</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl sm:max-w-3xl lg:max-w-4xl">
            Hear what our satisfied patients have to say about their experience with us.
          </p>
        </div>
        
        {/* Testimonials */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="pb-6 sm:pb-8 border-b border-border last:border-b-0 md:last:border-b md:odd:border-r md:odd:border-b-0 lg:even:border-l lg:odd:border-l lg:even:border-r lg:odd:border-b-0">
              {/* Stars */}
              <div className="flex gap-1 mb-3 sm:mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <span key={i} className="text-primary text-sm sm:text-base">★</span>
                ))}
              </div>
              
              {/* Review */}
              <div className="text-left">
                <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
                  &quot;{testimonial.text}&quot;
                </p>
                
                {/* Author */}
                <p className="font-medium text-sm sm:text-base text-foreground mt-2 sm:mt-3">
                  {testimonial.name}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
