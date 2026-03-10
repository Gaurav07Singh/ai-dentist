import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY as string;
const genAI = new GoogleGenerativeAI(API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 8192,
};

const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

function getSystemPrompt(phase: string, userName: string, userSymptom: string) {
    switch (phase) {
        case 'greeting':
            return `You are a friendly AI dental assistant at SmileCare Dental Clinic. Your first task is to greet the user and ask for their name. Be warm and welcoming.`;
        case 'symptoms':
            return `You are a friendly AI dental assistant. You are speaking with ${userName}. Your goal is to ask them to describe their dental problems or symptoms. After they explain, acknowledge their symptoms with a brief, helpful, and empathetic response. Then, smoothly transition to the Q&A phase by asking if they have any questions.`;
        case 'qa':
            return `You are a helpful dental assistant at SmileCare Dental Clinic. You are speaking with ${userName} who is experiencing: ${userSymptom}. Your current task is to answer any questions they have. 

            Clinic Context:
            - Doctors: Dr. Sarah Johnson (General), Dr. Michael Chen (Ortho), Dr. Emily Davis (Cosmetic).
            - Services: Consultation, Cleaning, Whitening, Braces, Root Canal, Emergency.
            - Hours: Mon-Sat 9AM-6PM.

            Your instructions:
            1. Only answer dental/clinic-related questions.
            2. For unrelated questions, politely redirect.
            3. Be warm, professional, and concise.
            4. After each answer, naturally ask: "Do you have any other questions?"`;
        case 'suggest':
            return `You are an intelligent dental assistant. You have been speaking with ${userName} about their symptom: "${userSymptom}". Your task is to analyze their symptom and suggest an appropriate appointment type. Then, ask them if they would like you to book that appointment. Respond with only the suggestion and the question. For example: "Based on your symptoms, I'd recommend a Consultation. Would you like me to book an appointment for you?"`;
        case 'booking_intent':
            return `You are an intent detection model. The user was just asked if they want to book an appointment. Classify their response as 'yes', 'no', or 'maybe'. Respond with only one of these three words.`;
        default:
            return `You are a helpful dental assistant.`;
    }
}

export const AIService = {
    async generateAiResponse(phase: string, userMessage: string, history: any[], userName = '', userSymptom = '') {
        try {
            const chat = model.startChat({
                generationConfig,
                safetySettings,
                history: history,
                systemInstruction: getSystemPrompt(phase, userName, userSymptom),
            });

            const result = await chat.sendMessage(userMessage);
            const response = result.response;
            return response.text();
        } catch (error) {
            console.error("Error in generateAiResponse:", error);
            return "I can still help with booking and clinic information. What would you like to do next?";
        }
    },
    async getGeminiResponse(userMessage: string, messages: any[]) {
        try {
            const systemInstruction = [
                "You are a helpful dental assistant at SmileCare Dental Clinic.",
                "Doctors: Dr. Sarah Johnson (General), Dr. Michael Chen (Ortho), Dr. Emily Davis (Cosmetic).",
                "Services: Consultation, Cleaning, Whitening, Braces, Root Canal, Emergency.",
                "Hours: Mon-Sat 9AM-6PM.",
                "Only answer dental/clinic-related questions. Be warm, professional, and concise."
            ].join(" ");
            const history = (messages || []).map((m: any) => ({
                role: m.type === 'bot' ? 'model' : 'user',
                parts: [{ text: m.text }]
            }));
            if (history.length > 0 && history[0].role === 'model') {
                history.shift();
            }
            const chat = model.startChat({
                generationConfig,
                safetySettings,
                history,
                systemInstruction
            });
            const result = await chat.sendMessage(userMessage);
            return result.response.text();
        } catch (error) {
            console.error("Error in getGeminiResponse:", error);
            return "I can still help with booking and clinic information. What would you like to do next?";
        }
    },
    async isQuestionIntent(userMessage: string) {
        const t = (userMessage || "").toLowerCase().trim();
        const starters = ["what", "how", "why", "when", "where", "who", "does", "do", "can", "could", "should"];
        if (t.includes("?") || starters.some(s => t.startsWith(s))) {
            return "question";
        }
        return "other";
    },
    async analyzeSymptom(symptom: string) {
        try {
            const prompt = [
                `A dental patient described this symptom: "${symptom}"`,
                "Based on these doctors:",
                "- Dr. Sarah Johnson (General Dentist)",
                "- Dr. Michael Chen (Orthodontist)",
                "- Dr. Emily Davis (Cosmetic Dentist)",
                "And these appointment types:",
                "- Consultation, Cleaning, Emergency",
                "Return ONLY a JSON object:",
                "{",
                '  "suggestedDoctor": "doctor name",',
                '  "suggestedType": "appointment type",',
                '  "reason": "one line reason"',
                "}"
            ].join("\n");
            const result = await model.generateContent(prompt);
            let text = result.response.text().trim();
            text = text.replace(/^```json/i, "").replace(/```$/i, "").trim();
            try {
                const parsed = JSON.parse(text);
                return parsed;
            } catch {
                const match = text.match(/\{[\s\S]*\}/);
                if (match) {
                    return JSON.parse(match[0]);
                }
                return {
                    suggestedDoctor: "Dr. Sarah Johnson",
                    suggestedType: "Consultation",
                    reason: "General consultation is appropriate"
                };
            }
        } catch (error) {
            console.error("Error in analyzeSymptom:", error);
            return {
                suggestedDoctor: "Dr. Sarah Johnson",
                suggestedType: "Consultation",
                reason: "General consultation is appropriate"
            };
        }
    }
};
