export const checkAvailabilitySchema = {
  name: "check_availability",
  description: "Checks available appointment slots for a given date at the dental office.",
  input_schema: {
    type: "object",
    properties: { date: { type: "string", description: "The date to check, in YYYY-MM-DD format." } },
    required: ["date"]
  }
};

export const bookAppointmentSchema = {
  name: "book_appointment",
  description: "Books an appointment for a patient at a specific date and time.",
  input_schema: {
    type: "object",
    properties: {
      date: { type: "string", description: "Date in YYYY-MM-DD format." },
      time: { type: "string", description: "Time slot, e.g. '9:00 AM'." },
      patient_name: { type: "string", description: "The patient's name." }
    },
    required: ["date", "time", "patient_name"]
  }
};

export const findAppointmentSchema = {
  name: "find_appointment",
  description: "Finds a patient's existing upcoming appointment by name, to support rescheduling.",
  input_schema: {
    type: "object",
    properties: { patient_name: { type: "string", description: "The patient's name." } },
    required: ["patient_name"]
  }
};

export const rescheduleAppointmentSchema = {
  name: "reschedule_appointment",
  description: "Reschedules an existing appointment (found via find_appointment) to a new date and time.",
  input_schema: {
    type: "object",
    properties: {
      event_id: { type: "string", description: "The event ID returned by find_appointment." },
      new_date: { type: "string", description: "New date, YYYY-MM-DD." },
      new_time: { type: "string", description: "New time, e.g. '2:00 PM'." }
    },
    required: ["event_id", "new_date", "new_time"]
  }
};

export const TOOLS = [checkAvailabilitySchema, bookAppointmentSchema, findAppointmentSchema, rescheduleAppointmentSchema];