import { z } from 'zod';

export const bookingSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters long." }).max(200, { message: "Title cannot exceed 200 characters." }),
  description: z.string().max(500, { message: "Description cannot exceed 500 characters." }).optional(),
  date: z.string().min(1, { message: "Date is required." }),
  starttime: z.string().min(1, { message: "Start time is required." }),
  endtime: z.string().min(1, { message: "End time is required." }),
  roomid: z.number().positive({ message: "A room must be selected." }).nullable(),
  attendees: z.array(z.object({
    userid: z.number(),
    name: z.string(),
    status: z.string().optional(),
  })).optional(),
}).refine(data => {
  const startDateTime = new Date(`${data.date}T${data.starttime}`);
  const endDateTime = new Date(`${data.date}T${data.endtime}`);
  return endDateTime > startDateTime;
}, {
  message: "End time must be after the start time.",
  path: ["endtime"],
});

export type BookingFormData = z.infer<typeof bookingSchema>;