
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

interface DataContextType {
  vehicles: Vehicle[];
  serviceRecords: ServiceRecord[];
  expenses: Expense[];
  insurancePolicies: InsurancePolicy[];
  documents: Document[];
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  updateVehicle: (vehicleId: string, updatedData: Partial<Vehicle>) => void;
  addServiceRecord: (record: Omit<ServiceRecord, 'id' | 'vehicleName'>) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'vehicleName'>) => void;
  addInsurancePolicy: (policy: Omit<InsurancePolicy, 'id' | 'vehicleName'>) => void;
  addDocument: (doc: Omit<Document, 'id' | 'vehicleName'>) => void;
  deleteDocument: (docId: string) => void;
  clearAllData: () => void;
  isLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const getLocalStorageItem = <T,>(key: string, fallback: T): T => {
    if (typeof window === 'undefined') {
        return fallback;
    }
    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
    } catch (error) {
        console.error(`Error reading from localStorage key “${key}”:`, error);
        return fallback;
    }
};

const setLocalStorageItem = <T,>(key: string, value: T) => {
    if (typeof window === 'undefined') {
        return;
    }
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error writing to localStorage key “${key}”:`, error);
    }
};

export const DataProvider = ({ children }: { children: ReactNode }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [serviceRecords, setServiceRecords] = useState<ServiceRecord[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [insurancePolicies, setInsurancePolicies] = useState<InsurancePolicy[]>([]);
    const [documents, setDocuments] = useState<Document[]>([]);

    useEffect(() => {
        setVehicles(getLocalStorageItem('myGaadi_vehicles', initialVehicles));
        setServiceRecords(getLocalStorageItem('myGaadi_serviceRecords', initialServiceRecords));
        setExpenses(getLocalStorageItem('myGaadi_expenses', initialExpenses));
        setInsurancePolicies(getLocalStorageItem('myGaadi_insurancePolicies', initialInsurancePolicies));
        setDocuments(getLocalStorageItem('myGaadi_documents', initialDocuments));
        setIsLoading(false);
    }, []);

    const saveData = useCallback(<T,>(key: string, data: T, setter: React.Dispatch<React.SetStateAction<T>>) => {
        setLocalStorageItem(key, data);
        setter(data);
    }, []);

    const addVehicle = useCallback((vehicleData: Omit<Vehicle, 'id'>) => {
        const newVehicle: Vehicle = {
            id: `v${Date.now()}`,
            ...vehicleData,
        };
        const newVehicles = [...vehicles, newVehicle];
        saveData('myGaadi_vehicles', newVehicles, setVehicles);
    }, [vehicles, saveData]);

    const updateVehicle = useCallback((vehicleId: string, updatedData: Partial<Vehicle>) => {
        const newVehicles = vehicles.map(v => v.id === vehicleId ? { ...v, ...updatedData } : v);
        saveData('myGaadi_vehicles', newVehicles, setVehicles);
    }, [vehicles, saveData]);

    const addServiceRecord = useCallback((recordData: Omit<ServiceRecord, 'id' | 'vehicleName'>) => {
        const vehicleName = vehicles.find(v => v.id === recordData.vehicleId)?.name || 'Unknown';
        const newRecord: ServiceRecord = {
            id: `s${Date.now()}`,
            ...recordData,
            vehicleName,
        };
        const newRecords = [newRecord, ...serviceRecords].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        saveData('myGaadi_serviceRecords', newRecords, setServiceRecords);
    }, [serviceRecords, vehicles, saveData]);

    const addExpense = useCallback((expenseData: Omit<Expense, 'id' | 'vehicleName'>) => {
        const vehicleName = vehicles.find(v => v.id === expenseData.vehicleId)?.name || 'Unknown';
        const newExpense: Expense = {
            id: `e${Date.now()}`,
            ...expenseData,
            vehicleName,
        };
        const newExpenses = [newExpense, ...expenses].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        saveData('myGaadi_expenses', newExpenses, setExpenses);
    }, [expenses, vehicles, saveData]);

    const addInsurancePolicy = useCallback((policyData: Omit<InsurancePolicy, 'id' | 'vehicleName'>) => {
        const vehicleName = vehicles.find(v => v.id === policyData.vehicleId)?.name || 'Unknown';
        const newPolicy: InsurancePolicy = {
            id: `i${Date.now()}`,
            ...policyData,
            vehicleName,
        };
        const newPolicies = [...insurancePolicies, newPolicy].sort((a,b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
        saveData('myGaadi_insurancePolicies', newPolicies, setInsurancePolicies);
    }, [insurancePolicies, vehicles, saveData]);

    const addDocument = useCallback((docData: Omit<Document, 'id' | 'vehicleName'>) => {
        const vehicleName = vehicles.find(v => v.id === docData.vehicleId)?.name || 'Unknown';
        const newDocument: Document = {
            id: `d${Date.now()}`,
            ...docData,
            vehicleName,
        };
        const newDocuments = [newDocument, ...documents].sort((a,b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
        saveData('myGaadi_documents', newDocuments, setDocuments);
    }, [documents, vehicles, saveData]);

    const deleteDocument = useCallback((docId: string) => {
        const newDocuments = documents.filter(d => d.id !== docId);
        saveData('myGaadi_documents', newDocuments, setDocuments);
    }, [documents, saveData]);

    const clearAllData = useCallback(() => {
        if (typeof window === 'undefined') return;
        window.localStorage.removeItem('myGaadi_vehicles');
        window.localStorage.removeItem('myGaadi_serviceRecords');
        window.localStorage.removeItem('myGaadi_expenses');
        window.localStorage.removeItem('myGaadi_insurancePolicies');
        window.localStorage.removeItem('myGaadi_documents');
        setVehicles(initialVehicles);
        setServiceRecords(initialServiceRecords);
        setExpenses(initialExpenses);
        setInsurancePolicies(initialInsurancePolicies);
        setDocuments(initialDocuments);
    }, []);

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
