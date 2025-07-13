
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Vehicle, ServiceRecord, Expense, InsurancePolicy, Document } from '@/lib/types';
import {
    vehicles as initialVehicles,
    serviceRecords as initialServiceRecords,
    expenses as initialExpenses,
    insurancePolicies as initialInsurancePolicies,
    documents as initialDocuments
} from '@/lib/data';
import { useAuth } from './auth-context';

interface DataContextType {
  vehicles: Vehicle[];
  serviceRecords: ServiceRecord[];
  expenses: Expense[];
  insurancePolicies: InsurancePolicy[];
  documents: Document[];
  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'userId'>) => void;
  updateVehicle: (vehicleId: string, updatedData: Partial<Omit<Vehicle, 'id' | 'userId'>>) => void;
  addServiceRecord: (record: Omit<ServiceRecord, 'id' | 'vehicleName' | 'userId'>) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'vehicleName' | 'userId'>) => void;
  addInsurancePolicy: (policy: Omit<InsurancePolicy, 'id' | 'vehicleName' | 'userId'>) => void;
  addDocument: (doc: Omit<Document, 'id' | 'vehicleName' | 'userId'>) => void;
  deleteDocument: (docId: string) => void;
  clearAllData: () => void;
  isLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [serviceRecords, setServiceRecords] = useState<ServiceRecord[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [insurancePolicies, setInsurancePolicies] = useState<InsurancePolicy[]>([]);
    const [documents, setDocuments] = useState<Document[]>([]);

    useEffect(() => {
        // Simulate loading data
        setIsLoading(true);
        setTimeout(() => {
            setVehicles(initialVehicles);
            setServiceRecords(initialServiceRecords);
            setExpenses(initialExpenses);
            setInsurancePolicies(initialInsurancePolicies);
            setDocuments(initialDocuments);
            setIsLoading(false);
        }, 500); // 0.5 second delay to show skeleton loaders
    }, []);

    const addVehicle = (vehicleData: Omit<Vehicle, 'id' | 'userId'>) => {
        const newId = `v${Date.now()}`;
        const newVehicle: Vehicle = {
            id: newId,
            userId: 'local-user',
            ...vehicleData,
        }
        setVehicles(prev => [...prev, newVehicle].sort((a, b) => a.name.localeCompare(b.name)));
    };

    const updateVehicle = (vehicleId: string, updatedData: Partial<Omit<Vehicle, 'id' | 'userId'>>) => {
        setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, ...updatedData } as Vehicle : v));
    };

    const addServiceRecord = (recordData: Omit<ServiceRecord, 'id' | 'vehicleName' | 'userId'>) => {
        const newId = `s${Date.now()}`;
        const vehicleName = vehicles.find(v => v.id === recordData.vehicleId)?.name || 'Unknown';
        const newRecord: ServiceRecord = {
            id: newId,
            userId: 'local-user',
            vehicleName,
            ...recordData,
        }
        setServiceRecords(prev => [newRecord, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    };

    const addExpense = (expenseData: Omit<Expense, 'id' | 'vehicleName' | 'userId'>) => {
        const newId = `e${Date.now()}`;
        const vehicleName = vehicles.find(v => v.id === expenseData.vehicleId)?.name || 'Unknown';
        const newExpense: Expense = {
            id: newId,
            userId: 'local-user',
            vehicleName,
            ...expenseData
        };
        setExpenses(prev => [newExpense, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    };

    const addInsurancePolicy = (policyData: Omit<InsurancePolicy, 'id' | 'vehicleName' | 'userId'>) => {
         const newId = `i${Date.now()}`;
         const vehicleName = vehicles.find(v => v.id === policyData.vehicleId)?.name || 'Unknown';
         const newPolicy: InsurancePolicy = {
             id: newId,
             userId: 'local-user',
             vehicleName,
             ...policyData
         };
        setInsurancePolicies(prev => [...prev, newPolicy].sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()));
    };

    const addDocument = (docData: Omit<Document, 'id' | 'vehicleName' | 'userId'>) => {
        const newId = `d${Date.now()}`;
        const vehicleName = vehicles.find(v => v.id === docData.vehicleId)?.name || 'Unknown';
        const newDoc: Document = {
            id: newId,
            userId: 'local-user',
            vehicleName,
            ...docData
        };
        setDocuments(prev => [newDoc, ...prev].sort((a,b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()));
    };

    const deleteDocument = (docId: string) => {
        setDocuments(prev => prev.filter(d => d.id !== docId));
    };

    const clearAllData = () => {
        setIsLoading(true);
        setVehicles([]);
        setServiceRecords([]);
        setExpenses([]);
        setInsurancePolicies([]);
        setDocuments([]);
        setTimeout(() => setIsLoading(false), 200);
    };


    const value = {
        vehicles, serviceRecords, expenses, insurancePolicies, documents,
        addVehicle, updateVehicle, addServiceRecord, addExpense, addInsurancePolicy, addDocument, deleteDocument,
        clearAllData,
        isLoading,
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
