import { z } from 'zod';

// Parking search form schema
export const ParkingSearchSchema = z.object({
  city: z.string().min(1, 'City is required'),
  location: z.string().optional(),
  maxDistance: z.number().min(0).max(50).default(5),
  maxPrice: z.number().min(0).optional(),
  parkingType: z.enum(['car', 'scooter', 'both']).default('car'),
  availability: z.enum(['any', 'available', 'few']).default('any'),
});

export type ParkingSearchInput = z.infer<typeof ParkingSearchSchema>;

// TDX API response schemas
export const CoordinateSchema = z.object({
  Latitude: z.number(),
  Longitude: z.number(),
});

export const TDXParkingLotSchema = z.object({
  ParkingLotID: z.string(),
  ParkingLotName: z.string(),
  TotalSpaces: z.number(),
  AvailableSpaces: z.number(),
  Coordinate: CoordinateSchema,
  Address: z.string(),
  Description: z.string().optional(),
  PayGuide: z.string().optional(),
  UpdateTime: z.string(),
});

export type TDXParkingLot = z.infer<typeof TDXParkingLotSchema>;

// User settings schema
export const UserSettingsSchema = z.object({
  preferredDistance: z.number().min(0).max(50).default(5),
  maxPrice: z.number().min(0).optional(),
  avoidLowSpace: z.boolean().default(false),
  preferCovered: z.boolean().default(false),
  notifications: z.boolean().default(true),
  language: z.enum(['zh-TW', 'en']).default('zh-TW'),
});

export type UserSettings = z.infer<typeof UserSettingsSchema>;

// Contact form schema
export const ContactFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export type ContactFormInput = z.infer<typeof ContactFormSchema>;