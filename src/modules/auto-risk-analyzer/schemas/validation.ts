import { z } from 'zod';

// Utility for currency strings

export const coverageSchema = z.object({
  bodilyInjuryPerPerson: z.number().min(0, "Limit must be positive"),
  bodilyInjuryPerAccident: z.number().min(0, "Limit must be positive"),
  propertyDamage: z.number().min(0, "Limit must be positive"),
  
  uninsuredMotoristBodilyInjuryPerPerson: z.number().optional(),
  uninsuredMotoristBodilyInjuryPerAccident: z.number().optional(),
  underinsuredMotoristBodilyInjuryPerPerson: z.number().optional(),
  underinsuredMotoristBodilyInjuryPerAccident: z.number().optional(),
  
  pip: z.number().optional(),
  medPay: z.number().optional(),
});

export const vehicleSchema = z.object({
  id: z.string().uuid().or(z.string()),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  vin: z.string().length(17, "VIN must be 17 characters").optional().or(z.literal('')),
  usage: z.enum(['commute', 'pleasure', 'business']).optional(),
  annualMileage: z.number().optional(),
  
  // Coverages attached to vehicle
  comprehensiveDeductible: z.number().optional(),
  collisionDeductible: z.number().optional(),
  rentalReimbursement: z.string().optional(),
  gapCoverage: z.boolean().optional(),
});

export const driverSchema = z.object({
  id: z.string().uuid().or(z.string()),
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().min(1, "Last Name is required"),
  age: z.number().min(16, "Driver must be at least 16").max(100, "Please verify age"),
  licenseState: z.string().length(2, "State code must be 2 characters"),
});

export const financialSchema = z.object({
  annualIncomeRange: z.enum(['<50k', '50k-100k', '100k-250k', '250k+']),
  homeOwner: z.boolean(),
  savingsBuffer: z.enum(['<10k', '10k-50k', '50k+']),
  dependents: z.number().min(0),
});

export const policySchema = z.object({
  id: z.string(),
  stateCode: z.string().length(2),
  drivers: z.array(driverSchema),
  vehicles: z.array(vehicleSchema),
  coverages: coverageSchema,
  financials: financialSchema.optional(), // New field
});
