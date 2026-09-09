import { google } from 'googleapis';
import { DateTime } from 'luxon';
import { CALENDAR_ID } from '../config.js';

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
  scopes: ['https://www.googleapis.com/auth/calendar'],
});
const calendarClient = google.calendar({ version: 'v3', auth });

const TIMEZONE = 'America/New_York';

function parseDateTime(date, time) {
  return DateTime.fromFormat(`${date} ${time}`, 'yyyy-MM-dd h:mm a', { zone: TIMEZONE });
}

export async function checkAvailability(date) {
  const dayStart = DateTime.fromFormat(date, 'yyyy-MM-dd', { zone: TIMEZONE }).startOf('day');
  const dayEnd = dayStart.endOf('day');

  const res = await calendarClient.events.list({
    calendarId: CALENDAR_ID,
    timeMin: dayStart.toISO(),
    timeMax: dayEnd.toISO(),
    singleEvents: true,
    orderBy: 'startTime',
  });

  const booked = res.data.items.map((e) =>
    DateTime.fromISO(e.start.dateTime, { zone: TIMEZONE }).toFormat('h:mm a')
  );
  const allSlots = ["9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"];
  const available = allSlots.filter((slot) => !booked.includes(slot));
  return available.length ? `Available slots on ${date}: ${available.join(", ")}` : `No available slots on ${date}.`;
}

export async function bookAppointment(date, time, patientName) {
  const start = parseDateTime(date, time);
  const end = start.plus({ minutes: 30 });

  await calendarClient.events.insert({
    calendarId: CALENDAR_ID,
    requestBody: {
      summary: `Dental Appointment - ${patientName}`,
      description: `Patient: ${patientName}`,
      start: { dateTime: start.toISO(), timeZone: TIMEZONE },
      end: { dateTime: end.toISO(), timeZone: TIMEZONE },
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
    timeMin: DateTime.now().setZone(TIMEZONE).toISO(),
  });
  if (!res.data.items.length) return `No upcoming appointments found for ${patientName}.`;
  return res.data.items.map((e) =>
    `Event ID ${e.id}: ${patientName} on ${DateTime.fromISO(e.start.dateTime, { zone: TIMEZONE }).toFormat('yyyy-MM-dd h:mm a')}`
  ).join(" | ");
}

export async function rescheduleAppointment(eventId, newDate, newTime) {
  const start = parseDateTime(newDate, newTime);
  const end = start.plus({ minutes: 30 });

  await calendarClient.events.patch({
    calendarId: CALENDAR_ID,
    eventId: eventId,
    requestBody: {
      start: { dateTime: start.toISO(), timeZone: TIMEZONE },
      end: { dateTime: end.toISO(), timeZone: TIMEZONE },
    },
  });
  return `Rescheduled to ${newDate} at ${newTime}.`;
}