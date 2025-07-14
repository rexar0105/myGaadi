
/**
 * @fileOverview Defines Zod schemas for core application data types.
 * These schemas are used for type safety and validation in Genkit flows.
 */
import { z } from 'zod';

export const VehicleSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  make: z.string(),
  model: z.string(),
  year: z.number(),
  registrationNumber: z.string(),
  imageUrl: z.string(),
  customImageUrl: z.string().optional(),
  dataAiHint: z.string(),
});

export const ServiceRecordSchema = z.object({
  id: z.string(),
  userId: z.string(),
  vehicleId: z.string(),
  vehicleName: z.string(),
  service: z.string(),
  date: z.string(),
  cost: z.number(),
  notes: z.string(),
  nextDueDate: z.string().optional(),
});

export const ExpenseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  vehicleId: z.string(),
  vehicleName: z.string(),
  category: z.enum(["Fuel", "Repair", "Insurance", "Other"]),
  date: z.string(),
  amount: z.number(),
  description: z.string(),
});

export const InsurancePolicySchema = z.object({
  id: z.string(),
  userId: z.string(),
  vehicleId: z.string(),
  vehicleName: z.string(),
  provider: z.string(),
  policyNumber: z.string(),
  expiryDate: z.string(),
});
