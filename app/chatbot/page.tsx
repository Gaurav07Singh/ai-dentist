'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { doctors } from '@/lib/data'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { AIService } from '@/lib/ai-service'

interface Message {
  id: string
  type: 'bot' | 'user'
  text: string
  timestamp: Date
  isAIMessage?: boolean
}

interface AppointmentData {
  name?: string
  phone?: string
  problem?: string
  date?: string
  time?: string
  appointmentType?: string
  doctor_id?: string
}

// Time slots for appointments
const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
]

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<string>('greeting')
  const [appointmentData, setAppointmentData] = useState<AppointmentData>({})
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [showCalendar, setShowCalendar] = useState(false)
  const [showTimeSelector, setShowTimeSelector] = useState(false)
  const [showAppointmentTypeButtons, setShowAppointmentTypeButtons] = useState(false)
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([])
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const initializedRef = useRef(false)

  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true
    initializeConversation()
  }, [])

  const initializeConversation = () => {
    addMessage('bot', 'Hello! Welcome to SmileCare Dental Clinic. I\'m here to help you book an appointment. May I know your name?');
    setStep('name');
  };

  const scrollToBottom = () => {
    const el = messagesContainerRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: 'auto' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const addMessage = (type: 'bot' | 'user', text: string, isAIMessage = false) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      text,
      timestamp: new Date(),
      isAIMessage,
    }
    setMessages((prev) => [...prev, newMessage])
  }

  const handleDateSelect = async (date: Date | undefined) => {
    if (!date) return

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Check if date is in the past
    if (date < today) {
      addMessage('bot', 'Please select a future date. The date you selected has already passed.')
      return
    }

    const dateString = format(date, 'yyyy-MM-dd')
    addMessage('user', format(date, 'PPP'))
    setAppointmentData((prev) => ({ ...prev, date: dateString }))
    setSelectedDate(date)
    setShowCalendar(false)
    setStep('time')
    setShowTimeSelector(true) // Show time selector immediately
    // Load available time slots for the selected date and doctor
    setAvailableTimeSlots([])
    try {
      const doctorId = appointmentData.doctor_id || doctors[0]?.id
      if (doctorId) {
        const availRes = await fetch(`/api/availability?doctorId=${doctorId}&date=${dateString}`)
        const availData = await availRes.json()
        if (availData.success) {
          // Fetch existing appointments to filter out booked slots
          const apptRes = await fetch(`/api/appointments?doctorId=${doctorId}&date=${dateString}`)
          const apptData = await apptRes.json()
          const bookedTimes: string[] = apptData.success
            ? apptData.data.filter((apt: any) => apt.status !== 'cancelled').map((apt: any) => apt.time)
            : []
          let slots: string[] = (availData.data.timeSlots || [])
            .filter((slot: any) => !bookedTimes.includes(slot.time))
            .map((slot: any) => slot.time)
          const previouslySelectedTime = appointmentData.time
          if (previouslySelectedTime && appointmentData.date === dateString) {
            slots = slots.filter((t: string) => t !== previouslySelectedTime)
          }
          setAvailableTimeSlots(slots)
        } else {
          setAvailableTimeSlots([])
        }
      }
    } catch (e) {
      setAvailableTimeSlots([])
    }
    addMessage('bot', 'Excellent! What time would work best for you?')
  }

  const handleTimeSelect = (time: string) => {
    addMessage('user', time)
    setAppointmentData((prev) => ({ ...prev, time }))
    setShowTimeSelector(false)
    setStep('confirmation')

    const doctorName = doctors.find(d => d.id === appointmentData.doctor_id)?.name || 'Selected Doctor'
    const confirmationMessage = `Perfect! Let me confirm all your details before booking the appointment.\n\n` +
                              `Name: ${appointmentData.name}\n` +
                              `Phone: ${appointmentData.phone}\n` +
                              `Problem: ${appointmentData.problem}\n` +
                              `Type: ${appointmentData.appointmentType}\n` +
                              `Doctor: ${doctorName}\n` +
                              `Date: ${appointmentData.date}\n` +
                              `Time: ${time}\n\n` +
                              `Is this correct? (Yes/No)`
    addMessage('bot', confirmationMessage)
  }

  const handleAppointmentTypeSelect = (type: string) => {
    addMessage('user', type)
    setShowAppointmentTypeButtons(false)
    handleAIMessage(type)
  }

  // Doctor selection removed: single-doctor flow assigns automatically

  const handleAIMessage = async (userMessage: string) => {
    setIsLoading(true)
  
    try {
      const intent = await AIService.isQuestionIntent(userMessage);

      if (intent === 'question') {
        const aiResponse = await AIService.getGeminiResponse(userMessage, messages);
        addMessage('bot', aiResponse, true);
      } else {
        // Proceed with the booking flow
        let nextStep = step
        let extractedData = { ...appointmentData }
        let needsConfirmation = false
        
        // Extract information based on current step
        if (step === 'name' && !appointmentData.name) {
          if (userMessage.length > 2 && userMessage.length < 50 && !userMessage.includes('?') && !userMessage.toLowerCase().includes('hi') && !userMessage.toLowerCase().includes('hello')) {
            extractedData.name = userMessage.trim()
            nextStep = 'phone'
          }
        }
        
        if (step === 'phone' && !appointmentData.phone) {
          const phoneMatch = userMessage.match(/(\d{3}[-.\s]?\d{3}[-.\s]?\d{4}|\(\d{3}\)\s?\d{3}[-.\s]?\d{4})/)
          if (phoneMatch) {
            extractedData.phone = phoneMatch[1]
            nextStep = 'problem'
          }
        }
        
        if (step === 'problem' && !appointmentData.problem) {
          if (userMessage.length > 3 && !userMessage.includes('?') && !userMessage.toLowerCase().includes('help') && !userMessage.toLowerCase().includes('information') && !userMessage.toLowerCase().includes('what are') && !userMessage.toLowerCase().includes('tell me')) {
            extractedData.problem = userMessage.trim()
            const analysis = await AIService.analyzeSymptom(extractedData.problem)
            const suggestedType = analysis?.suggestedType || 'Consultation'
            extractedData.appointmentType = suggestedType
            const singleDoctor = doctors[0]
            if (singleDoctor) {
              extractedData.doctor_id = singleDoctor.id
            }
            nextStep = 'date'
            setShowCalendar(true)
            addMessage('bot', `Based on your symptoms, I recommend booking a ${suggestedType} appointment with ${singleDoctor?.name || 'our doctor'}. Please select your preferred date.`)
          }
        }
        
        if (step === 'appointmentType' && !appointmentData.appointmentType) {
          const types = ['consultation', 'cleaning', 'emergency', 'treatment', 'follow-up', 'checkup', 'check-up']
          const lowerMessage = userMessage.toLowerCase()
          for (const type of types) {
            if (lowerMessage.includes(type)) {
              extractedData.appointmentType = type.charAt(0).toUpperCase() + type.slice(1).replace('-', '')
              const singleDoctor = doctors[0]
              if (singleDoctor) {
                extractedData.doctor_id = singleDoctor.id
              }
              nextStep = 'date'
              break
            }
          }
          
          // Handle numeric responses
          if (/\d/.test(userMessage)) {
            const num = parseInt(userMessage.match(/\d/)?.[0] || '0')
            const typeMap: { [key: number]: string } = {
              1: 'Consultation',
              2: 'Cleaning', 
              3: 'Emergency',
              4: 'Treatment',
              5: 'Follow-up'
            }
            if (typeMap[num]) {
              extractedData.appointmentType = typeMap[num]
              const singleDoctor = doctors[0]
              if (singleDoctor) {
                extractedData.doctor_id = singleDoctor.id
              }
              nextStep = 'date'
            }
          }
        }
        
        // Doctor selection step removed (single doctor assigned automatically)
        
        if (step === 'confirmation') {
          const lowerMessage = userMessage.toLowerCase()
          if (lowerMessage.includes('yes') || lowerMessage.includes('correct') || lowerMessage.includes('confirm')) {
            needsConfirmation = true
            nextStep = 'success'
          } else if (lowerMessage.includes('no') || lowerMessage.includes('change') || lowerMessage.includes('different')) {
            nextStep = 'name'
            extractedData = {} // Reset for restart
          }
        }
        
        if (JSON.stringify(extractedData) !== JSON.stringify(appointmentData)) {
          setAppointmentData(extractedData)
        }
        
        // Update step if changed
        if (nextStep !== step) {
          setStep(nextStep)
        }

        if (needsConfirmation) {
          await bookAppointment()
          return
        }

        if (nextStep === 'date' && !showCalendar) {
          setShowCalendar(true)
          addMessage('bot', 'Please select your preferred date from the calendar below:')
          setIsLoading(false)
          return
        }

        if (nextStep === 'time' && !showTimeSelector) {
          setShowTimeSelector(true)
          addMessage('bot', 'Please select your preferred time from the options below:')
          setIsLoading(false)
          return
        }

        let response = ''
        if (nextStep === 'phone') {
          response = `Thank you, ${extractedData.name}! What's your phone number?`
        } else if (nextStep === 'problem') {
          response = 'Great! What dental problem are you experiencing?'
        } else if (nextStep === 'appointmentType') {
          response =
            'Understood. What type of appointment do you need? (e.g., Consultation, Cleaning, Emergency)'
          setShowAppointmentTypeButtons(true)
        } else if (nextStep === 'confirmation') {
          const doctorName =
            doctors.find((d) => d.id === extractedData.doctor_id)?.name ||
            'Selected Doctor'
          response =
            `Please confirm your appointment details:\n\n` +
            `Name: ${extractedData.name}\n` +
            `Phone: ${extractedData.phone}\n` +
            `Problem: ${extractedData.problem}\n` +
            `Type: ${extractedData.appointmentType}\n` +
            `Doctor: ${doctorName}\n` +
            `Date: ${extractedData.date}\n` +
            `Time: ${extractedData.time}\n\n` +
            `Is this correct? (Yes/No)`
        }

        if (response) {
          addMessage('bot', response)
        } else {
          // If no rule-based response was generated, use the AI
          const aiResponse = await AIService.getGeminiResponse(userMessage, messages);
          addMessage('bot', aiResponse, true);
        }
      }
    } catch (error) {
      console.error('❌ Error in handleAIMessage:', error)
      addMessage('bot', 'I apologize, but I\'m having trouble right now. Please try again or call our clinic at (212) 555-1234.')
    } finally {
      setIsLoading(false)
    }
  }


  const bookAppointment = async () => {
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      })

      const data = await response.json()

      if (data.success) {
        const doctorName = doctors.find(d => d.id === appointmentData.doctor_id)?.name || 'Selected Doctor'
        addMessage('bot', `Perfect! Your appointment has been confirmed with ${doctorName}. Your appointment ID is ${data.data.id}. We'll send you a reminder before your visit. Is there anything else I can help you with?`)
        addMessage('bot', 'Thank you for choosing SmileCare Dental Clinic! 😊')
        setStep('success')
        toast.success('Appointment booked successfully!')
      } else {
        addMessage('bot', data.error || 'Sorry, there was an error booking your appointment. Please try again.')
        toast.error(data.error || 'Failed to book appointment')
      }
    } catch (error) {
      addMessage('bot', 'Sorry, there was an error booking your appointment. Please try again.')
      toast.error('Failed to book appointment')
    }
  }

  const resetConversation = () => {
    setMessages([])
    setAppointmentData({})
    setStep('greeting')
    setSelectedDate(undefined)
    setShowCalendar(false)
    setShowTimeSelector(false)
    initializeConversation()
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage = inputValue.trim()
    addMessage('user', userMessage)
    setInputValue('')

    await handleAIMessage(userMessage)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary/80">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <h1 className="text-lg sm:text-xl font-bold">SmileCare AI Assistant</h1>
          </div>
          <div className="flex gap-2">
            <Link href="/appointments">
              <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary/80">
                View Appointments
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-primary-foreground hover:bg-primary/80"
              onClick={resetConversation}
            >
              New Chat
            </Button>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex flex-col h-[calc(100vh-80px)] max-w-4xl mx-auto">
        {/* Messages */}
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4 space-y-2 bg-background">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-foreground/50">
              <p className="text-center">Starting conversation...</p>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex flex-col gap-1 ${
                    message.type === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-xs sm:max-w-md px-3 py-1 rounded-lg whitespace-pre-wrap ${
                      message.type === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-none'
                        : 'bg-muted text-foreground rounded-bl-none'
                    }`}
                  >
                    {message.text}
                  </div>
                  <div className="flex items-center">
                    <p className="text-xs text-muted-foreground">{format(message.timestamp, 'HH:mm')}</p>
                    {message.isAIMessage && <span className="ml-2 text-xs">✨ AI</span>}
                  </div>
                </div>
              ))}
              
              {/* Calendar for date selection */}
              {step === 'date' && showCalendar && (
                <div className="flex justify-start">
                  <div className="bg-card border rounded-lg p-3 shadow-sm">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                      className="rounded-md"
                    />
                  </div>
                </div>
              )}
              
              {/* Time selector for time selection */}
              {step === 'time' && showTimeSelector && (
                <div className="flex justify-start">
                  <div className="bg-card border rounded-lg p-3 shadow-sm">
                    <div className="text-sm font-medium mb-2">Select Appointment Time</div>
                    {availableTimeSlots.length === 0 ? (
                      <div className="text-xs text-muted-foreground">
                        No slots available for the selected date. Please pick another date.
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 max-w-xs">
                        {availableTimeSlots.map((time) => (
                          <Button
                            key={time}
                            variant="outline"
                            size="sm"
                            onClick={() => handleTimeSelect(time)}
                            className="text-xs h-8"
                          >
                            {time}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {step === 'appointmentType' && showAppointmentTypeButtons && (
                <div className="flex justify-start">
                  <div className="bg-card border rounded-lg p-3 shadow-sm">
                    <div className="text-sm font-medium mb-2">Select Appointment Type</div>
                    <div className="flex flex-wrap gap-2">
                      {['Consultation', 'Cleaning', 'Emergency'].map((type) => (
                        <Button
                          key={type}
                          variant="outline"
                          onClick={() => handleAppointmentTypeSelect(type)}
                        >
                          {type}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Doctor selection removed in single-doctor flow */}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted text-foreground px-4 py-2 rounded-lg rounded-bl-none">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              )}
              
            </>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-border p-3 sm:p-4 bg-background">
          {step === 'success' && (
            <div className="mb-2">
              <Link href="/appointments">
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  View Appointments
                </Button>
              </Link>
            </div>
          )}
          {step === 'date' && showCalendar && (
            <div className="text-xs text-muted-foreground bg-blue-50 p-2 rounded border border-blue-200 mb-2">
              💡 Click on a date in the calendar above to select your appointment date
            </div>
          )}
          
          {step === 'time' && showTimeSelector && (
            <div className="text-xs text-muted-foreground bg-blue-50 p-2 rounded border border-blue-200 mb-2">
              🕒 Click on a time slot above to select your appointment time
            </div>
          )}
          
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              className="flex-1"
              disabled={isLoading || step === 'success' || (step === 'date' && showCalendar) || (step === 'time' && showTimeSelector)}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim() || (step === 'date' && showCalendar) || (step === 'time' && showTimeSelector)}
              size="sm"
              className="bg-primary hover:bg-primary/90"
            >
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
