
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Vehicle, ServiceRecord, Expense, InsurancePolicy, Document } from '@/lib/types';
import { useAuth } from './auth-context';

// This function loads data from localStorage
const loadFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
};

// This function saves data to localStorage
const saveToLocalStorage = <T,>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Error writing to localStorage key "${key}":`, error);
  }
};

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
    const { isAuthenticated, user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);

    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [serviceRecords, setServiceRecords] = useState<ServiceRecord[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [insurancePolicies, setInsurancePolicies] = useState<InsurancePolicy[]>([]);
    const [documents, setDocuments] = useState<Document[]>([]);

    const DATA_KEYS = {
        VEHICLES: 'myGaadi_vehicles',
        SERVICES: 'myGaadi_serviceRecords',
        EXPENSES: 'myGaadi_expenses',
        INSURANCE: 'myGaadi_insurancePolicies',
        DOCUMENTS: 'myGaadi_documents',
    };

    // Load data from localStorage when the component mounts and user is authenticated
    useEffect(() => {
        if (isAuthenticated) {
            setIsLoading(true);
            setVehicles(loadFromLocalStorage(DATA_KEYS.VEHICLES, []));
            setServiceRecords(loadFromLocalStorage(DATA_KEYS.SERVICES, []));
            setExpenses(loadFromLocalStorage(DATA_KEYS.EXPENSES, []));
            setInsurancePolicies(loadFromLocalStorage(DATA_KEYS.INSURANCE, []));
            setDocuments(loadFromLocalStorage(DATA_KEYS.DOCUMENTS, []));
            setIsLoading(false);
        } else {
            // Clear data if user logs out
            setVehicles([]);
            setServiceRecords([]);
            setExpenses([]);
            setInsurancePolicies([]);
            setDocuments([]);
        }
    }, [isAuthenticated, DATA_KEYS.DOCUMENTS, DATA_KEYS.EXPENSES, DATA_KEYS.INSURANCE, DATA_KEYS.SERVICES, DATA_KEYS.VEHICLES]);

    // Save data to localStorage whenever it changes
    useEffect(() => {
        if(isAuthenticated) saveToLocalStorage(DATA_KEYS.VEHICLES, vehicles);
    }, [vehicles, isAuthenticated, DATA_KEYS.VEHICLES]);
    useEffect(() => {
        if(isAuthenticated) saveToLocalStorage(DATA_KEYS.SERVICES, serviceRecords);
    }, [serviceRecords, isAuthenticated, DATA_KEYS.SERVICES]);
    useEffect(() => {
        if(isAuthenticated) saveToLocalStorage(DATA_KEYS.EXPENSES, expenses);
    }, [expenses, isAuthenticated, DATA_KEYS.EXPENSES]);
    useEffect(() => {
        if(isAuthenticated) saveToLocalStorage(DATA_KEYS.INSURANCE, insurancePolicies);
    }, [insurancePolicies, isAuthenticated, DATA_KEYS.INSURANCE]);
     useEffect(() => {
        if(isAuthenticated) saveToLocalStorage(DATA_KEYS.DOCUMENTS, documents);
    }, [documents, isAuthenticated, DATA_KEYS.DOCUMENTS]);


    const addVehicle = (vehicleData: Omit<Vehicle, 'id' | 'userId'>) => {
        const newId = `v${Date.now()}`;
        const newVehicle: Vehicle = {
            id: newId,
            userId: user?.id || 'local-user',
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
            userId: user?.id || 'local-user',
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
            userId: user?.id || 'local-user',
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
             userId: user?.id || 'local-user',
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
            userId: user?.id || 'local-user',
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
        Object.values(DATA_KEYS).forEach(key => {
            if (typeof window !== 'undefined') {
                window.localStorage.removeItem(key);
            }
        });
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
