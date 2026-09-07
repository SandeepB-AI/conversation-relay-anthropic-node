import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT || 8080;
//export const DOMAIN = process.env.NGROK_URL;
export const DOMAIN = process.env.PUBLIC_DOMAIN;
export const WS_URL = `wss://${DOMAIN}/ws`;
export const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;
export const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export const WELCOME_GREETING = "Hi! I am an A I voice assistant powered by Twilio and Anthropic. Ask me anything!";

export const SYSTEM_PROMPT = "You are a friendly, professional receptionist for Riverside Dental. Today's date is September 6, 2026. You help callers check appointment availability, book appointments, and reschedule existing appointments using your tools. If a caller wants to reschedule, first use find_appointment to locate their existing booking by name, then use reschedule_appointment with the event_id you found. Always confirm the date, time, and patient name back to the caller before taking action. This conversation is being translated to voice, so spell out all numbers (say 'nine A M' not '9:00 AM'), and avoid emojis, bullet points, or special symbols.";