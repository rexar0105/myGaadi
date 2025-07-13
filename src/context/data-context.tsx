
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, query, where, orderBy, writeBatch } from 'firebase/firestore';
import type { Vehicle, ServiceRecord, Expense, InsurancePolicy, Document } from '@/lib/types';
import { db } from '@/lib/firebase';
import { useAuth } from './auth-context';
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
  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'userId'>) => void;
  updateVehicle: (vehicleId: string, updatedData: Partial<Omit<Vehicle, 'id' | 'userId'>>) => void;
  addServiceRecord: (record: Omit<ServiceRecord, 'id' | 'vehicleName'>) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'vehicleName'>) => void;
  addInsurancePolicy: (policy: Omit<InsurancePolicy, 'id' | 'vehicleName'>) => void;
  addDocument: (doc: Omit<Document, 'id' | 'vehicleName'>) => void;
  deleteDocument: (docId: string) => void;
  clearAllData: () => void;
  isLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
    const { user, isAuthenticated } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [serviceRecords, setServiceRecords] = useState<ServiceRecord[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [insurancePolicies, setInsurancePolicies] = useState<InsurancePolicy[]>([]);
    const [documents, setDocuments] = useState<Document[]>([]);

    const fetchDataForUser = useCallback(async (userId: string) => {
        setIsLoading(true);
        try {
            const collections = {
                vehicles: collection(db, 'vehicles'),
                serviceRecords: collection(db, 'serviceRecords'),
                expenses: collection(db, 'expenses'),
                insurancePolicies: collection(db, 'insurancePolicies'),
                documents: collection(db, 'documents'),
            };

            const q = (col: any) => query(col, where("userId", "==", userId));

            const [
                vehiclesSnap,
                serviceRecordsSnap,
                expensesSnap,
                insurancePoliciesSnap,
                documentsSnap
            ] = await Promise.all([
                getDocs(q(collections.vehicles)),
                getDocs(q(collections.serviceRecords)),
                getDocs(q(collections.expenses)),
                getDocs(q(collections.insurancePolicies)),
                getDocs(q(collections.documents))
            ]);

            const userVehicles = vehiclesSnap.docs.map(d => ({ id: d.id, ...d.data() } as Vehicle));
            const vehicleNameMap = new Map(userVehicles.map(v => [v.id, v.name]));

            setVehicles(userVehicles.sort((a,b) => a.name.localeCompare(b.name)));
            
            setServiceRecords(serviceRecordsSnap.docs.map(d => ({ id: d.id, vehicleName: vehicleNameMap.get(d.data().vehicleId) || 'Unknown', ...d.data() } as ServiceRecord)).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            
            setExpenses(expensesSnap.docs.map(d => ({ id: d.id, vehicleName: vehicleNameMap.get(d.data().vehicleId) || 'Unknown', ...d.data() } as Expense)).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            
            setInsurancePolicies(insurancePoliciesSnap.docs.map(d => ({ id: d.id, vehicleName: vehicleNameMap.get(d.data().vehicleId) || 'Unknown', ...d.data() } as InsurancePolicy)).sort((a,b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()));

            setDocuments(documentsSnap.docs.map(d => ({ id: d.id, vehicleName: vehicleNameMap.get(d.data().vehicleId) || 'Unknown', ...d.data() } as Document)).sort((a,b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()));

        } catch (error) {
            console.error("Error fetching data from Firestore:", error);
            // Handle error, maybe show a toast
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated && user) {
            fetchDataForUser(user.id);
        } else if (!isAuthenticated) {
            // Clear data if user logs out
            setVehicles([]);
            setServiceRecords([]);
            setExpenses([]);
            setInsurancePolicies([]);
            setDocuments([]);
            setIsLoading(false);
        }
    }, [user, isAuthenticated, fetchDataForUser]);

    const addVehicle = async (vehicleData: Omit<Vehicle, 'id' | 'userId'>) => {
        if (!user) return;
        const newVehicleData = { ...vehicleData, userId: user.id };
        const docRef = await addDoc(collection(db, "vehicles"), newVehicleData);
        setVehicles(prev => [...prev, { id: docRef.id, ...newVehicleData }].sort((a,b) => a.name.localeCompare(b.name)));
    };

    const updateVehicle = async (vehicleId: string, updatedData: Partial<Omit<Vehicle, 'id' | 'userId'>>) => {
        if (!user) return;
        const vehicleRef = doc(db, "vehicles", vehicleId);
        await updateDoc(vehicleRef, updatedData);
        setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, ...updatedData } : v));
    };

    const addServiceRecord = async (recordData: Omit<ServiceRecord, 'id' | 'vehicleName'>) => {
        if (!user) return;
        const vehicleName = vehicles.find(v => v.id === recordData.vehicleId)?.name || 'Unknown';
        const newRecordData = { ...recordData, userId: user.id };
        const docRef = await addDoc(collection(db, "serviceRecords"), newRecordData);
        setServiceRecords(prev => [{ id: docRef.id, ...newRecordData, vehicleName }, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    };

    const addExpense = async (expenseData: Omit<Expense, 'id' | 'vehicleName'>) => {
        if (!user) return;
        const vehicleName = vehicles.find(v => v.id === expenseData.vehicleId)?.name || 'Unknown';
        const newExpenseData = { ...expenseData, userId: user.id };
        const docRef = await addDoc(collection(db, "expenses"), newExpenseData);
        setExpenses(prev => [{ id: docRef.id, ...newExpenseData, vehicleName }, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    };

    const addInsurancePolicy = async (policyData: Omit<InsurancePolicy, 'id' | 'vehicleName'>) => {
        if (!user) return;
        const vehicleName = vehicles.find(v => v.id === policyData.vehicleId)?.name || 'Unknown';
        const newPolicyData = { ...policyData, userId: user.id };
        const docRef = await addDoc(collection(db, "insurancePolicies"), newPolicyData);
        setInsurancePolicies(prev => [...prev, { id: docRef.id, ...newPolicyData, vehicleName }].sort((a,b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()));
    };

    const addDocument = async (docData: Omit<Document, 'id' | 'vehicleName'>) => {
        if (!user) return;
        const vehicleName = vehicles.find(v => v.id === docData.vehicleId)?.name || 'Unknown';
        const newDocData = { ...docData, userId: user.id };
        const docRef = await addDoc(collection(db, "documents"), newDocData);
        setDocuments(prev => [{ id: docRef.id, ...newDocData, vehicleName }, ...prev].sort((a,b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()));
    };

    const deleteDocument = async (docId: string) => {
        if (!user) return;
        await deleteDoc(doc(db, "documents", docId));
        setDocuments(prev => prev.filter(d => d.id !== docId));
    };

    const clearAllData = async () => {
        if (!user) return;
        setIsLoading(true);
        const batch = writeBatch(db);
        
        const collectionsToDelete = ['vehicles', 'serviceRecords', 'expenses', 'insurancePolicies', 'documents'];

        for (const colName of collectionsToDelete) {
            const q = query(collection(db, colName), where("userId", "==", user.id));
            const snapshot = await getDocs(q);
            snapshot.docs.forEach(doc => batch.delete(doc.ref));
        }

        await batch.commit();
        
        // Refetch to confirm empty state
        await fetchDataForUser(user.id);
        setIsLoading(false);
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
