'use client'

// buttons removed per UI cleanup

interface HeroSectionProps {
  onBookClick?: () => void
}

export function HeroSection({ onBookClick }: HeroSectionProps) {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 py-16 sm:py-20 md:py-24 lg:py-32">
      <div className="max-w-3xl sm:max-w-4xl lg:max-w-6xl w-full text-center">
        {/* Subtitle */}
        <div className="mb-6 sm:mb-8">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground tracking-widest uppercase">SmileCare Dental Clinic</p>
        </div>

        {/* Main heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight mb-6 sm:mb-8 text-foreground leading-tight">
          Exceptional
          <br />
          <span className="font-semibold">Dental Care</span>
        </h1>

        {/* Description */}
        <p className="text-base sm:text-lg text-muted-foreground mb-8 sm:mb-12 leading-relaxed max-w-2xl sm:max-w-3xl mx-auto">
          Experience professional dental care from our team of certified specialists. We combine modern techniques with personalized attention to deliver results you deserve.
        </p>


        {/* Stats */}
        <div className="grid grid-cols-3 gap-12 pt-16 border-t border-border">
          <div>
            <p className="text-4xl font-light text-foreground">15+</p>
            <p className="text-sm text-muted-foreground mt-2">Years Experience</p>
          </div>
          <div>
            <p className="text-4xl font-light text-foreground">2000+</p>
            <p className="text-sm text-muted-foreground mt-2">Patients Treated</p>
          </div>
          <div>
            <p className="text-4xl font-light text-foreground">5★</p>
            <p className="text-sm text-muted-foreground mt-2">Highly Rated</p>
          </div>
        </div>
      </div>
    </section>
  )
}
