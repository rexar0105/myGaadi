import type { Vehicle, ServiceRecord, Expense, InsurancePolicy } from './types';

export const vehicles: Vehicle[] = [
  {
    id: 'v1',
    name: 'My Swift',
    make: 'Maruti Suzuki',
    model: 'Swift VXI',
    year: 2021,
    registrationNumber: 'MH 12 AB 3456',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'white car',
  },
  {
    id: 'v2',
    name: 'Family Creta',
    make: 'Hyundai',
    model: 'Creta SX',
    year: 2022,
    registrationNumber: 'DL 3C CD 7890',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'red suv',
  },
  {
    id: 'v3',
    name: 'Weekend Rider',
    make: 'Royal Enfield',
    model: 'Classic 350',
    year: 2020,
    registrationNumber: 'KA 05 EF 1212',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'black motorcycle',
  },
];

const today = new Date();
const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const serviceRecords: ServiceRecord[] = [
  {
    id: 's1',
    vehicleId: 'v1',
    vehicleName: 'My Swift',
    service: 'General Service',
    date: addDays(today, -90).toISOString(),
    cost: 4500,
    notes: 'Oil change, filter replacement, and general check-up.',
    nextDueDate: addDays(today, 95).toISOString(),
  },
  {
    id: 's2',
    vehicleId: 'v2',
    vehicleName: 'Family Creta',
    service: 'Tire Rotation',
    date: addDays(today, -30).toISOString(),
    cost: 800,
    notes: 'Rotated all four tires.',
    nextDueDate: addDays(today, 150).toISOString(),
  },
  {
    id: 's3',
    vehicleId: 'v3',
    vehicleName: 'Weekend Rider',
    service: 'Chain Lubrication',
    date: addDays(today, -15).toISOString(),
    cost: 350,
    notes: 'Cleaned and lubricated the chain.',
    nextDueDate: addDays(today, 15).toISOString(),
  },
  {
    id: 's4',
    vehicleId: 'v1',
    vehicleName: 'My Swift',
    service: 'AC Check-up',
    date: addDays(today, -180).toISOString(),
    cost: 1200,
    notes: 'AC gas top-up and cleaning.',
    nextDueDate: addDays(today, 30).toISOString(),
  }
];

export const expenses: Expense[] = [
  {
    id: 'e1',
    vehicleId: 'v1',
    vehicleName: 'My Swift',
    category: 'Fuel',
    date: addDays(today, -2).toISOString(),
    amount: 2000,
    description: 'Full tank of petrol.',
  },
  {
    id: 'e2',
    vehicleId: 'v2',
    vehicleName: 'Family Creta',
    category: 'Fuel',
    date: addDays(today, -5).toISOString(),
    amount: 3500,
    description: 'Diesel top-up.',
  },
  {
    id: 'e3',
    vehicleId: 'v3',
    vehicleName: 'Weekend Rider',
    category: 'Repair',
    date: addDays(today, -40).toISOString(),
    amount: 900,
    description: 'Replaced brake pads.',
  },
  {
    id: 'e4',
    vehicleId: 'v1',
    vehicleName: 'My Swift',
    category: 'Other',
    date: addDays(today, -10).toISOString(),
    amount: 500,
    description: 'Car wash and interior cleaning.',
  },
];

export const insurancePolicies: InsurancePolicy[] = [
  {
    id: 'i1',
    vehicleId: 'v1',
    vehicleName: 'My Swift',
    provider: 'Go Digit',
    policyNumber: 'GDI-123456789',
    expiryDate: addDays(today, 65).toISOString(),
  },
  {
    id: 'i2',
    vehicleId: 'v2',
    vehicleName: 'Family Creta',
    provider: 'Acko',
    policyNumber: 'ACKO-987654321',
    expiryDate: addDays(today, 25).toISOString(),
  },
  {
    id: 'i3',
    vehicleId: 'v3',
    vehicleName: 'Weekend Rider',
    provider: 'HDFC Ergo',
    policyNumber: 'HDF-555444333',
    expiryDate: addDays(today, 150).toISOString(),
  },
];
