import { NextRequest, NextResponse } from 'next/server'

// Chat conversation history stored by session
const conversations: Map<string, any[]> = new Map()

// Conversation states and appointment data per session
const conversationStates: Map<string, { step: string; appointmentData: any }> = new Map()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, sessionId } = body

    if (!message || !sessionId) {
      return NextResponse.json(
        { success: false, error: 'Message and sessionId are required' },
        { status: 400 }
      )
    }

    // Initialize conversation if not exists
    if (!conversations.has(sessionId)) {
      conversations.set(sessionId, [])
      conversationStates.set(sessionId, {
        step: 'greeting',
        appointmentData: {},
      })
    }

    // Get conversation history and state
    const history = conversations.get(sessionId) || []
    const state = conversationStates.get(sessionId) || {
      step: 'greeting',
      appointmentData: {},
    }

    // Add user message to history
    history.push({
      role: 'user',
      content: message,
      timestamp: new Date(),
    })

    // Generate bot response based on current step
    const botResponse = generateBotResponse(message, state)

    // Add bot response to history
    history.push({
      role: 'bot',
      content: botResponse.message,
      timestamp: new Date(),
    })

    // Update conversation state
    conversationStates.set(sessionId, {
      step: botResponse.nextStep,
      appointmentData: botResponse.appointmentData,
    })

    // Update conversation history
    conversations.set(sessionId, history)

    return NextResponse.json({
      success: true,
      message: botResponse.message,
      nextStep: botResponse.nextStep,
      appointmentData: botResponse.appointmentData,
    })
  } catch (error) {
    console.error('Error in chat API:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process chat message' },
      { status: 500 }
    )
  }
}

function generateBotResponse(
  userInput: string,
  state: { step: string; appointmentData: any }
): { message: string; nextStep: string; appointmentData: any } {
  const input = userInput.trim().toLowerCase()
  const { step, appointmentData } = state

  switch (step) {
    case 'greeting':
      return {
        message:
          "Hello! Welcome to SmileCare Dental Clinic. I'm here to help you book an appointment. May I know your name?",
        nextStep: 'name',
        appointmentData,
      }

    case 'name':
      return {
        message: `Nice to meet you, ${userInput}! Could you please provide your phone number so we can contact you?`,
        nextStep: 'phone',
        appointmentData: { ...appointmentData, name: userInput },
      }

    case 'phone':
      const phoneRegex = /^\d{10,}$/
      if (!phoneRegex.test(input.replace(/\D/g, ''))) {
        return {
          message: 'Please provide a valid phone number (at least 10 digits).',
          nextStep: 'phone',
          appointmentData,
        }
      }
      return {
        message: 'Thanks! What is the reason for your visit or dental problem?',
        nextStep: 'problem',
        appointmentData: { ...appointmentData, phone: userInput },
      }

    case 'problem':
      return {
        message:
          'I understand. Are you looking for:\n1. Consultation\n2. Cleaning\n3. Emergency',
        nextStep: 'appointmentType',
        appointmentData: { ...appointmentData, problem: userInput },
      }

    case 'appointmentType':
      const validTypes = ['consultation', 'cleaning', 'emergency']
      const typeInput = input.split(' ')[0]
      if (!validTypes.some((t) => t.includes(typeInput))) {
        return {
          message: 'Please choose from: Consultation, Cleaning, or Emergency',
          nextStep: 'appointmentType',
          appointmentData,
        }
      }
      return {
        message: 'What date would you prefer? (Please provide in YYYY-MM-DD format)',
        nextStep: 'date',
        appointmentData: { ...appointmentData, appointmentType: userInput },
      }

    case 'date':
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      if (!dateRegex.test(input)) {
        return {
          message:
            'Please provide a valid date in YYYY-MM-DD format (e.g., 2024-03-20)',
          nextStep: 'date',
          appointmentData,
        }
      }
      return {
        message:
          'What time would you prefer? (Please provide in HH:MM format, e.g., 14:30)',
        nextStep: 'time',
        appointmentData: { ...appointmentData, date: userInput },
      }

    case 'time':
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
      if (!timeRegex.test(input)) {
        return {
          message: 'Please provide a valid time in HH:MM format (e.g., 14:30)',
          nextStep: 'time',
          appointmentData,
        }
      }
      const updatedData = { ...appointmentData, time: userInput }
      return {
        message:
          'Perfect! Let me confirm your appointment details:\n\n' +
          `Name: ${updatedData.name}\n` +
          `Phone: ${updatedData.phone}\n` +
          `Problem: ${updatedData.problem}\n` +
          `Type: ${updatedData.appointmentType}\n` +
          `Date: ${updatedData.date}\n` +
          `Time: ${userInput}\n\n` +
          'Does everything look correct? (Yes/No)',
        nextStep: 'confirmation',
        appointmentData: updatedData,
      }

    case 'confirmation':
      if (input.includes('yes') || input.includes('confirm')) {
        return {
          message:
            'Thank you! Your appointment request has been submitted. Our clinic will contact you shortly to confirm. We look forward to seeing you at SmileCare Dental Clinic!',
          nextStep: 'success',
          appointmentData,
        }
      } else if (input.includes('no')) {
        return {
          message:
            "No problem! Let's start over. May I know your name?",
          nextStep: 'name',
          appointmentData: {},
        }
      }
      return {
        message: 'Please confirm with "Yes" or "No"',
        nextStep: 'confirmation',
        appointmentData,
      }

    case 'success':
      return {
        message: 'Is there anything else I can help you with?',
        nextStep: 'success',
        appointmentData,
      }

    default:
      return {
        message:
          "I didn't quite understand. Could you please rephrase?",
        nextStep: step,
        appointmentData,
      }
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Chat API is working',
  })
}
