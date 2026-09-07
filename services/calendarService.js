import { google } from 'googleapis';
import { CALENDAR_ID } from '../config.js';

/*const auth = new google.auth.GoogleAuth({
  keyFile: './google-service-account.json',
  scopes: ['https://www.googleapis.com/auth/calendar'],
});*/
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
  scopes: ['https://www.googleapis.com/auth/calendar'],
});
const calendarClient = google.calendar({ version: 'v3', auth });

export async function checkAvailability(date) {
  const timeMin = new Date(`${date}T00:00:00`).toISOString();
  const timeMax = new Date(`${date}T23:59:59`).toISOString();
  const res = await calendarClient.events.list({
    calendarId: CALENDAR_ID,
    timeMin,
    timeMax,
    singleEvents: true,
    orderBy: 'startTime',
  });
  const booked = res.data.items.map((e) => new Date(e.start.dateTime).toLocaleTimeString());
  const allSlots = ["9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"];
  const available = allSlots.filter((slot) => !booked.some((b) => b.startsWith(slot.split(":")[0])));
  return available.length ? `Available slots on ${date}: ${available.join(", ")}` : `No available slots on ${date}.`;
}

export async function bookAppointment(date, time, patientName) {
  const startDateTime = new Date(`${date} ${time}`);
  const endDateTime = new Date(startDateTime.getTime() + 30 * 60000);
  await calendarClient.events.insert({
    calendarId: CALENDAR_ID,
    requestBody: {
      summary: `Dental Appointment - ${patientName}`,
      description: `Patient: ${patientName}`,
      start: { dateTime: startDateTime.toISOString() },
      end: { dateTime: endDateTime.toISOString() },
    },
  });
  return `Booked ${patientName} for ${date} at ${time}.`;
}

export async function findAppointmentByName(patientName) {
  const res = await calendarClient.events.list({
    calendarId: CALENDAR_ID,
    q: patientName,
    singleEvents: true,
    orderBy: 'startTime',
    timeMin: new Date().toISOString(),
  });
  if (!res.data.items.length) return `No upcoming appointments found for ${patientName}.`;
  return res.data.items.map((e) =>
    `Event ID ${e.id}: ${patientName} on ${new Date(e.start.dateTime).toLocaleString()}`
  ).join(" | ");
}

export async function rescheduleAppointment(eventId, newDate, newTime) {
  const startDateTime = new Date(`${newDate} ${newTime}`);
  const endDateTime = new Date(startDateTime.getTime() + 30 * 60000);
  await calendarClient.events.patch({
    calendarId: CALENDAR_ID,
    eventId: eventId,
    requestBody: {
      start: { dateTime: startDateTime.toISOString() },
      end: { dateTime: endDateTime.toISOString() },
    },
  });
  return `Rescheduled to ${newDate} at ${newTime}.`;
}