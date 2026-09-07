import { checkAvailability, bookAppointment, findAppointmentByName, rescheduleAppointment } from '../services/calendarService.js';

export async function executeTool(name, input) {
  switch (name) {
    case "check_availability":
      return await checkAvailability(input.date);
    case "book_appointment":
      return await bookAppointment(input.date, input.time, input.patient_name);
    case "find_appointment":
      return await findAppointmentByName(input.patient_name);
    case "reschedule_appointment":
      return await rescheduleAppointment(input.event_id, input.new_date, input.new_time);
    default:
      return "Unknown tool.";
  }
}