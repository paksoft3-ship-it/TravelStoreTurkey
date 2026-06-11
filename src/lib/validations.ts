import { z } from 'zod';

export const bookingSchema = z.object({
  type: z.enum(['TAXI', 'AIRPORT_TRANSFER', 'PRIVATE_TOUR', 'CUSTOM_TOUR', 'BLUE_LAGOON', 'HOURLY_HIRE']),
  customerName: z.string().min(2, 'Name must be at least 2 characters'),
  customerEmail: z.string().email('Invalid email address'),
  customerPhone: z.string().min(7, 'Invalid phone number'),
  passengers: z.coerce.number().min(1).max(50),
  pickupLocation: z.string().min(3, 'Pickup location is required'),
  dropoffLocation: z.string().optional(),
  pickupDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  pickupTime: z.string(),
  tourId: z.string().optional(),
  routePrice: z.number().optional(),
  routeLargeGroupPrice: z.number().optional(),
  routeName: z.string().optional(),
  flightNumber: z.string().optional(),
  flightTime: z.string().optional(),
  luggageCount: z.coerce.number().optional(),
  options: z.object({
    premiumCar: z.boolean().optional(),
    childSeats: z.number().optional(),
    extraStop: z.boolean().optional(),
    extraTime: z.boolean().optional(),
    packageType: z.string().optional(),
    tourName: z.string().optional(),
    blDirection: z.string().optional(),
    hourlyDuration: z.string().optional(),
    tourStartTime: z.string().optional(),
  }).optional(),
  specialRequests: z.string().optional(),
});

export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  subject: z.string().min(3, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export const newsletterSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const tourSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  shortDescription: z.string().min(20, 'Short description must be at least 20 characters'),
  duration: z.string(),
  durationHours: z.number().min(1),
  price: z.number().min(0),
  currency: z.string().default('EUR'),
  category: z.enum(['FULL_DAY', 'HALF_DAY', 'EVENING', 'MULTI_DAY', 'TRANSFER']),
  highlights: z.array(z.string()),
  includes: z.array(z.string()),
  images: z.array(z.string()),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
});

export type BookingFormData = z.infer<typeof bookingSchema>;
export type ContactFormData = z.infer<typeof contactSchema>;
export type NewsletterFormData = z.infer<typeof newsletterSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type TourFormData = z.infer<typeof tourSchema>;
