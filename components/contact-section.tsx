'use client'

export function ContactSection() {
  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 border-t border-border">
      <div className="max-w-6xl sm:max-w-7xl lg:max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 sm:mb-10 md:mb-12">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground tracking-widest uppercase mb-3 sm:mb-4">Contact</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light mb-4 sm:mb-6 text-foreground">
            Get In <span className="font-semibold">Touch</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl sm:max-w-3xl lg:max-w-4xl">
            We'd love to hear from you. Visit us or call to schedule your appointment.
          </p>
        </div>
        
        {/* Contact Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 bg-border rounded-lg overflow-hidden mb-8 sm:mb-12">
          {/* Address */}
          <div className="bg-background p-4 sm:p-6 border-b border-border md:border-b-0">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground tracking-widest uppercase mb-3 sm:mb-4">Address</p>
            <div className="space-y-2 sm:space-y-3">
              <p className="text-foreground leading-relaxed">
                123 Dental Street<br />
                Medical Plaza<br />
                New York, NY 10001
              </p>
            </div>
          </div>
          
          {/* Phone */}
          <div className="bg-background p-4 sm:p-6 border-l border-border md:border-l-0">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground tracking-widest uppercase mb-3 sm:mb-4">Phone</p>
            <div className="space-y-2 sm:space-y-3">
              <a href="tel:+12125551234" className="text-foreground hover:text-primary transition block text-sm sm:text-base">
                (212) 555-1234
              </a>
              <a href="tel:+18005551234" className="text-foreground hover:text-primary transition block text-sm sm:text-base">
                (800) 555-1234
              </a>
            </div>
          </div>
          
          {/* Email */}
          <div className="bg-background p-4 sm:p-6 border-l border-border md:border-l-0">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground tracking-widest uppercase mb-3 sm:mb-4">Email</p>
            <div className="space-y-2 sm:space-y-3">
              <a href="mailto:info@smilecare.com" className="text-foreground hover:text-primary transition block text-sm sm:text-base">
                info@smilecare.com
              </a>
              <a href="mailto:emergency@smilecare.com" className="text-foreground hover:text-primary transition block text-sm sm:text-base">
                emergency@smilecare.com
              </a>
            </div>
          </div>
        </div>
        
        {/* Hours */}
        <div className="max-w-2xl sm:max-w-3xl lg:max-w-4xl mx-auto border border-border rounded-lg p-4 sm:p-6 md:p-8">
          <h3 className="text-lg sm:text-xl font-medium text-foreground mb-6 sm:mb-8">
            Hours of Operation
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <p className="text-sm sm:text-base font-medium text-foreground mb-3 sm:mb-4">Weekdays</p>
              <p className="text-sm sm:text-base text-muted-foreground">
                Monday - Friday<br />
                9:00 AM – 6:00 PM
              </p>
            </div>
            <div>
              <p className="text-sm sm:text-base font-medium text-foreground mb-3 sm:mb-4">Weekends</p>
              <p className="text-sm sm:text-base text-muted-foreground">
                Saturday 10:00 AM – 4:00 PM<br />
                Sunday Closed
              </p>
            </div>
          </div>
          
          {/* Emergency Note */}
          <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-border">
            <p className="text-xs sm:text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Emergency</span> calls available 24/7
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
