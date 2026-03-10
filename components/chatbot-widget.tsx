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

interface Message {
  id: string
  type: 'bot' | 'user'
  text: string
  timestamp: Date
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

interface ChatbotWidgetProps {
  isOpen?: boolean
  onToggle?: (isOpen: boolean) => void
}

// Time slots for appointments
const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
]

export function ChatbotWidget({ isOpen: externalIsOpen, onToggle }: ChatbotWidgetProps = {}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<string>('greeting')
  const [appointmentData, setAppointmentData] = useState<AppointmentData>({})
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [showCalendar, setShowCalendar] = useState(false)
  const [showTimeSelector, setShowTimeSelector] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const addMessage = (type: 'bot' | 'user', text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      text,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newMessage])
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Check if date is in the past
    if (date < today) {
      addMessage('bot', 'Please select a future date. The date you selected has already passed.')
      return
    }

    const dateString = format(date, 'yyyy-MM-dd')
    setAppointmentData((prev) => ({ ...prev, date: dateString }))
    setSelectedDate(date)
    setShowCalendar(false)
    setStep('time')
    
    // Add user message with selected date
    addMessage('user', format(date, 'PPP'))
    
    // Add bot response asking for time
    setTimeout(() => {
      addMessage('bot', 'Perfect! Please select your preferred time from the options below:')
      setShowTimeSelector(true)
    }, 500)
  }

  const handleTimeSelect = (time: string) => {
    setAppointmentData((prev) => ({ ...prev, time }))
    setShowTimeSelector(false)
    setStep('confirmation')
    
    // Add user message with selected time
    addMessage('user', time)
    
    // Add bot response asking for confirmation
    const doctorName = doctors.find(d => d.id === appointmentData.doctor_id)?.name || 'Selected Doctor'
    const finalData = { ...appointmentData, time }
    
    setTimeout(() => {
      addMessage('bot', 'Perfect! Let me confirm your appointment details:\n\n' +
             `Name: ${finalData.name}\n` +
             `Phone: ${finalData.phone}\n` +
             `Doctor: ${doctorName}\n` +
             `Problem: ${finalData.problem}\n` +
             `Type: ${finalData.appointmentType}\n` +
             `Date: ${finalData.date}\n` +
             `Time: ${time}\n\n` +
             'Does everything look correct? (Yes/No)')
    }, 500)
  }

  const getBotResponse = async (userInput: string): Promise<string> => {
    const input = userInput.trim().toLowerCase()

    switch (step) {
      case 'greeting':
        setStep('name')
        return "Hello! Welcome to SmileCare Dental Clinic. I'm here to help you book an appointment. May I know your name?"

      case 'name':
        setAppointmentData((prev) => ({ ...prev, name: userInput }))
        setStep('phone')
        return `Thank you ${userInput}! What's your phone number?`

      case 'phone':
        setAppointmentData((prev) => ({ ...prev, phone: userInput }))
        setStep('problem')
        return "What dental problem are you experiencing?"

      case 'problem':
        setAppointmentData((prev) => ({ ...prev, problem: userInput }))
        setStep('appointmentType')
        return "What type of appointment do you need?\n\n1. Consultation\n2. Cleaning\n3. Emergency\n4. Treatment\n5. Follow-up"

      case 'appointmentType':
        const typeMap: { [key: string]: string } = {
          '1': 'Consultation',
          '2': 'Cleaning',
          '3': 'Emergency',
          '4': 'Treatment',
          '5': 'Follow-up'
        }
        
        const validTypes = ['consultation', 'cleaning', 'emergency', 'treatment', 'follow-up']
        const selectedType = typeMap[input] || validTypes.find(t => t.includes(input))
        
        if (!selectedType) {
          return 'Please choose from: Consultation (1), Cleaning (2), Emergency (3), Treatment (4), or Follow-up (5)'
        }
        
        setAppointmentData((prev) => ({ ...prev, appointmentType: selectedType }))
        setStep('doctor')
        return "Which doctor would you like to see?\n\n1. Dr. Sarah Johnson\n2. Dr. Michael Chen\n3. Dr. Emily Davis"

      case 'doctor':
        const doctorMap: { [key: string]: string } = {
          '1': 'Dr. Sarah Johnson',
          '2': 'Dr. Michael Chen',
          '3': 'Dr. Emily Davis'
        }
        
        const selectedDoctor = doctorMap[input] || doctors.find(d => d.name.toLowerCase().includes(input))
        
        if (!selectedDoctor) {
          return 'Please choose from: Dr. Sarah Johnson (1), Dr. Michael Chen (2), or Dr. Emily Davis (3)'
        }
        
        setAppointmentData((prev) => ({ ...prev, doctor_id: selectedDoctor.id }))
        setStep('date')
        setShowCalendar(true)
        return 'Please select your preferred date from the calendar below:'

      case 'date':
        // Handle both calendar selection and manual date entry
        if (showCalendar) {
          return 'Please use the calendar above to select your appointment date.'
        }
        
        // Manual date entry
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/
        if (!dateRegex.test(input)) {
          return 'Please provide a valid date in YYYY-MM-DD format (e.g., 2024-03-20)'
        }
        
        // Check if date is in the past
        const selectedDate = new Date(input)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        if (selectedDate < today) {
          return 'Please select a future date. The date you provided has already passed.'
        }
        
        setAppointmentData((prev) => ({ ...prev, date: input }))
        setStep('time')
        setShowTimeSelector(true)
        return 'Perfect! Please select your preferred time from the options below:'

      case 'time':
        // Handle both time selector and manual time entry
        if (showTimeSelector) {
          return 'Please use the time buttons above to select your appointment time.'
        }
        
        // Manual time entry
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
        if (!timeRegex.test(input)) {
          return 'Please provide a valid time in HH:MM format (e.g., 14:30)'
        }
        
        const finalData = { ...appointmentData, time: userInput }
        setAppointmentData(finalData)
        setStep('confirmation')
        
        const doctorName = doctors.find(d => d.id === appointmentData.doctor_id)?.name || 'Selected Doctor'
        
        return 'Perfect! Let me confirm your appointment details:\n\n' +
               `Name: ${finalData.name}\n` +
               `Phone: ${finalData.phone}\n` +
               `Doctor: ${doctorName}\n` +
               `Problem: ${finalData.problem}\n` +
               `Type: ${finalData.appointmentType}\n` +
               `Date: ${finalData.date}\n` +
               `Time: ${userInput}\n\n` +
               'Does everything look correct? (Yes/No)'

      case 'confirmation':
        if (input === 'yes') {
          setIsLoading(true)
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
              addMessage('bot', `Great! Your appointment has been confirmed. Your appointment ID is ${data.data.id}. We'll send you a reminder before your visit.`)
              setStep('success')
              toast.success('Appointment booked successfully!')
              
              // Reset form
              setTimeout(() => {
                if (onToggle) {
                  onToggle(false)
                } else {
                  setInternalIsOpen(false)
                }
              }, 3000)
            } else {
              addMessage('bot', data.error || 'Sorry, there was an error booking your appointment. Please try again.')
              toast.error(data.error || 'Failed to book appointment')
            }
          } catch (error) {
            addMessage('bot', 'Sorry, there was an error booking your appointment. Please try again.')
            toast.error('Failed to book appointment')
          } finally {
            setIsLoading(false)
          }
          return 'Processing your appointment...'
        } else {
          // Reset conversation
          setStep('greeting')
          setAppointmentData({})
          setSelectedDate(undefined)
          setShowCalendar(false)
          setShowTimeSelector(false)
          addMessage('bot', "Let's start over. What's your name?")
          return 'Starting over...'
        }

      default:
        return "I'm here to help you book an appointment. Please tell me what you need."
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage = inputValue.trim()
    addMessage('user', userMessage)
    setInputValue('')

    // Show typing indicator
    setIsLoading(true)

    try {
      const botResponse = await getBotResponse(userMessage)
      setTimeout(() => {
        addMessage('bot', botResponse)
        setIsLoading(false)
      }, 500)
    } catch (error) {
      addMessage('bot', 'Sorry, I encountered an error. Please try again.')
      setIsLoading(false)
    }
  }

  const handleQuickReply = (reply: string) => {
    setInputValue(reply)
    handleSendMessage()
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => {
          if (onToggle) {
            onToggle(true)
          } else {
            setInternalIsOpen(true)
          }
          if (messages.length === 0) {
            addMessage('bot', 'Hello! Welcome to SmileCare Dental Clinic. I\'m here to help you book an appointment. May I know your name?')
            setStep('name')
          }
        }}
        className="fixed bottom-4 sm:bottom-6 sm:right-4 right-4 w-12 h-12 sm:w-14 sm:h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg flex items-center justify-center cursor-pointer transition-all hover:scale-110 z-50"
        aria-label="Open chatbot"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
        </svg>
      </button>
    )
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 top-0 z-50 flex items-end justify-end p-2 sm:p-4">
      <div className="w-full max-w-md sm:max-w-lg mx-auto h-[80vh] sm:h-[600px] bg-card rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-border">
        {/* Header */}
        <div className="bg-primary text-primary-foreground p-3 sm:p-4 flex justify-between items-center shrink-0">
          <h3 className="font-bold text-sm sm:text-lg">SmileCare Assistant</h3>
          <button
            onClick={() => onToggle ? onToggle(false) : setInternalIsOpen(false)}
            className="hover:bg-primary/80 rounded-full p-1 sm:p-1.5 transition"
            aria-label="Close chatbot"
          >
            <span className="text-sm sm:text-base">✕</span>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-foreground/50">
              <p className="text-center">Start a conversation to book your appointment</p>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg whitespace-pre-wrap ${
                      message.type === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-none'
                        : 'bg-muted text-foreground rounded-bl-none'
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
              
              {/* Calendar for date selection */}
              {step === 'date' && showCalendar && (
                <div className="flex justify-start">
                  <div className="bg-card border rounded-lg p-4 shadow-sm">
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
                  <div className="bg-card border rounded-lg p-4 shadow-sm">
                    <div className="text-sm font-medium mb-3">Select Appointment Time</div>
                    <div className="grid grid-cols-3 gap-2 max-w-xs">
                      {timeSlots.map((time) => (
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
                  </div>
                </div>
              )}
              
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
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-border p-4 space-y-3 bg-background">
          {step === 'date' && showCalendar && (
            <div className="text-xs text-muted-foreground bg-blue-50 p-2 rounded border border-blue-200">
              💡 Click on a date in the calendar above to select your appointment date
            </div>
          )}
          
          {step === 'time' && showTimeSelector && (
            <div className="text-xs text-muted-foreground bg-blue-50 p-2 rounded border border-blue-200">
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

          {/* Quick Reply Buttons */}
          {step === 'greeting' && (
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleQuickReply('Book Appointment')}
                className="text-xs"
              >
                Book Appointment
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleQuickReply('Clinic Timings')}
                className="text-xs"
              >
                Clinic Timings
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleQuickReply('Emergency Visit')}
                className="text-xs"
              >
                Emergency Visit
              </Button>
            </div>
          )}
          
          {step === 'doctor' && (
            <div className="flex gap-2 flex-wrap">
              {doctors.map((doctor) => (
                <Button
                  key={doctor.id}
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuickReply(doctor.name)}
                  className="text-xs"
                >
                  {doctor.name.split(' ')[1]}
                </Button>
              ))}
            </div>
          )}
          
          {step === 'appointmentType' && (
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleQuickReply('1')}
                className="text-xs"
              >
                Consultation
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleQuickReply('2')}
                className="text-xs"
              >
                Cleaning
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleQuickReply('3')}
                className="text-xs"
              >
                Emergency
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleQuickReply('4')}
                className="text-xs"
              >
                Treatment
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleQuickReply('5')}
                className="text-xs"
              >
                Follow-up
              </Button>
            </div>
          )}
          
          {step === 'date' && showCalendar && (
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowCalendar(false)
                  setInputValue('')
                  addMessage('bot', 'You can also type the date in YYYY-MM-DD format (e.g., 2024-03-20). What date would you prefer?')
                }}
                className="text-xs"
              >
                Type Date Instead
              </Button>
            </div>
          )}
          
          {step === 'time' && showTimeSelector && (
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowTimeSelector(false)
                  setInputValue('')
                  addMessage('bot', 'You can also type the time in HH:MM format (e.g., 14:30). What time would you prefer?')
                }}
                className="text-xs"
              >
                Type Time Instead
              </Button>
            </div>
          )}
          
          {step === 'confirmation' && (
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                variant="default"
                onClick={() => handleQuickReply('Yes')}
                className="text-xs bg-green-600 hover:bg-green-700"
              >
                Yes, Book It
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleQuickReply('No')}
                className="text-xs"
              >
                Start Over
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
