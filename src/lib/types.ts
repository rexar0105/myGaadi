
export type Vehicle = {
  id: string;
  userId: string;
  name: string;
  make: string;
  model: string;
  year: number;
  registrationNumber: string;
  imageUrl: string;
  customImageUrl?: string;
  dataAiHint: string;
};

export type ServiceRecord = {
  id: string;
  userId: string;
  vehicleId: string;
  vehicleName: string;
  service: string;
  date: string; // ISO string
  cost: number;
  notes: string;
  nextDueDate?: string; // ISO string
};

export type Expense = {
  id: string;
  userId: string;
  vehicleId: string;
  vehicleName: string;
  category: 'Fuel' | 'Repair' | 'Insurance' | 'Other';
  date: string; // ISO string
  amount: number;
  description: string;
};

export type InsurancePolicy = {
  id: string;
  userId: string;
  vehicleId: string;
  vehicleName: string;
  provider: string;
  policyNumber: string;
  expiryDate: string; // ISO string
};

export type Document = {
    id: string;
    userId: string;
    vehicleId: string;
    vehicleName: string;
    documentType: 'Registration' | 'Insurance' | 'Service' | 'Other';
    fileName: string;
    uploadDate: string; // ISO string
    fileUrl: string; // URL to the stored file
}
