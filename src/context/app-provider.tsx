
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { Vehicle, ServiceRecord, Expense, InsurancePolicy, Document } from '@/lib/types';
import { useSettings } from './settings-context';

// --- DATA PERSISTENCE HELPERS ---
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

const saveToLocalStorage = <T,>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Error writing to localStorage key "${key}":`, error);
  }
};


// --- TYPES ---
interface User {
  id: string;
  email: string;
}

export type ProfileState = {
  name: string;
  dob?: string;
  bloodGroup?: string;
  phone?: string;
  address?: string;
  licenseNumber?: string;
  licenseExpiryDate?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  avatarUrl: string | null;
};

interface AppContextType {
  // App State
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Auth
  user: User | null;
  profile: ProfileState | null;
  setProfile: (profile: ProfileState) => void;
  loginWithEmail: (email: string, pass: string) => Promise<boolean>;
  signup: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  loginWithGoogle: () => Promise<boolean>;

  // Data
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DATA_KEYS = {
    VEHICLES: 'myGaadi_vehicles',
    SERVICES: 'myGaadi_serviceRecords',
    EXPENSES: 'myGaadi_expenses',
    INSURANCE: 'myGaadi_insurancePolicies',
    DOCUMENTS: 'myGaadi_documents',
    PROFILE: 'myGaadiProfile',
    USER: 'myGaadiUser',
};

// --- THE UNIFIED PROVIDER ---
export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfileState] = useState<ProfileState | null>(null);
    
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [serviceRecords, setServiceRecords] = useState<ServiceRecord[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [insurancePolicies, setInsurancePolicies] = useState<InsurancePolicy[]>([]);
    const [documents, setDocuments] = useState<Document[]>([]);
    
    const { settings } = useSettings();

    // The single, master initialization effect
    useEffect(() => {
        setIsLoading(true);
        // In a real app, this would be an API call to check session.
        // Here, we simulate it by checking local storage.
        const storedUser = loadFromLocalStorage<User | null>(DATA_KEYS.USER, null);

        if (storedUser) {
            setUser(storedUser);
            
            // Load profile
            const storedProfile = loadFromLocalStorage<ProfileState | null>(DATA_KEYS.PROFILE, null);
            if (storedProfile) {
                setProfileState(storedProfile);
            } else {
                // Create a default profile if none exists
                const defaultProfile = { name: storedUser.email.split('@')[0] || "User", avatarUrl: null };
                setProfileState(defaultProfile);
                saveToLocalStorage(DATA_KEYS.PROFILE, defaultProfile);
            }

            // Load all other app data
            setVehicles(loadFromLocalStorage(DATA_KEYS.VEHICLES, []));
            setServiceRecords(loadFromLocalStorage(DATA_KEYS.SERVICES, []));
            setExpenses(loadFromLocalStorage(DATA_KEYS.EXPENSES, []));
            setInsurancePolicies(loadFromLocalStorage(DATA_KEYS.INSURANCE, []));
            setDocuments(loadFromLocalStorage(DATA_KEYS.DOCUMENTS, []));

        } else {
            // Ensure all data is cleared if no user
            setProfileState(null);
            setVehicles([]);
            setServiceRecords([]);
            setExpenses([]);
            setInsurancePolicies([]);
            setDocuments([]);
        }
        
        setIsLoading(false);
    }, []);

    // --- AUTH METHODS ---
    
    const performLogin = (loggedInUser: User) => {
        const defaultProfile: ProfileState = {
            name: loggedInUser.email.split('@')[0] || "New User",
            avatarUrl: null
        };
        saveToLocalStorage(DATA_KEYS.USER, loggedInUser);
        saveToLocalStorage(DATA_KEYS.PROFILE, defaultProfile);
        setUser(loggedInUser);
        setProfileState(defaultProfile);
    };

    const loginWithEmail = async (email: string, pass: string): Promise<boolean> => {
        const localUser = { id: 'local-user', email };
        performLogin(localUser);
        return true;
    };

    const loginWithGoogle = async (): Promise<boolean> => {
        const localUser = { id: 'local-user', email: 'user@example.com' };
        performLogin(localUser);
        return true;
    };
    
    const signup = async (email: string, pass: string) => {
        // In a real app, you'd create the user here. For this demo, it's just a success.
        // A new profile will be created on first login.
    };

    const setProfile = useCallback((newProfile: ProfileState) => {
        setProfileState(newProfile);
        saveToLocalStorage(DATA_KEYS.PROFILE, newProfile);
    }, []);

    const logout = () => {
        setUser(null);
        setProfileState(null);

        if(settings.clearDataOnLogout) {
            sessionStorage.removeItem('myGaadiNotifiedAlerts');
        }

        // Clear all user and app data from storage
        Object.values(DATA_KEYS).forEach(key => localStorage.removeItem(key));
        
        // Also clear state
        setVehicles([]);
        setServiceRecords([]);
        setExpenses([]);
        setInsurancePolicies([]);
        setDocuments([]);
    };
    
    // --- DATA METHODS ---
    const addVehicle = useCallback((vehicleData: Omit<Vehicle, 'id' | 'userId'>) => {
        if (!user) return;
        const newId = `v${Date.now()}`;
        const newVehicle: Vehicle = { id: newId, userId: user.id, ...vehicleData };
        setVehicles(prev => {
            const newState = [...prev, newVehicle].sort((a, b) => a.name.localeCompare(b.name));
            saveToLocalStorage(DATA_KEYS.VEHICLES, newState);
            return newState;
        });
    }, [user]);
    
    const updateVehicle = useCallback((vehicleId: string, updatedData: Partial<Omit<Vehicle, 'id' | 'userId'>>) => {
        setVehicles(prev => {
            const newState = prev.map(v => v.id === vehicleId ? { ...v, ...updatedData } as Vehicle : v);
            saveToLocalStorage(DATA_KEYS.VEHICLES, newState);
            return newState;
        });
    }, []);

    const addServiceRecord = useCallback((recordData: Omit<ServiceRecord, 'id' | 'vehicleName' | 'userId'>) => {
        if (!user) return;
        const vehicleName = vehicles.find(v => v.id === recordData.vehicleId)?.name || 'Unknown';
        const newRecord: ServiceRecord = { id: `s${Date.now()}`, userId: user.id, vehicleName, ...recordData };
        setServiceRecords(prev => {
            const newState = [newRecord, ...prev];
            saveToLocalStorage(DATA_KEYS.SERVICES, newState);
            return newState;
        });
    }, [user, vehicles]);

    const addExpense = useCallback((expenseData: Omit<Expense, 'id' | 'vehicleName' | 'userId'>) => {
        if (!user) return;
        const vehicleName = vehicles.find(v => v.id === expenseData.vehicleId)?.name || 'Unknown';
        const newExpense: Expense = { id: `e${Date.now()}`, userId: user.id, vehicleName, ...expenseData };
        setExpenses(prev => {
            const newState = [newExpense, ...prev];
            saveToLocalStorage(DATA_KEYS.EXPENSES, newState);
            return newState;
        });
    }, [user, vehicles]);

    const addInsurancePolicy = useCallback((policyData: Omit<InsurancePolicy, 'id' | 'vehicleName' | 'userId'>) => {
        if (!user) return;
        const vehicleName = vehicles.find(v => v.id === policyData.vehicleId)?.name || 'Unknown';
        const newPolicy: InsurancePolicy = { id: `i${Date.now()}`, userId: user.id, vehicleName, ...policyData };
        setInsurancePolicies(prev => {
            const newState = [...prev, newPolicy];
            saveToLocalStorage(DATA_KEYS.INSURANCE, newState);
            return newState;
        });
    }, [user, vehicles]);

    const addDocument = useCallback((docData: Omit<Document, 'id' | 'vehicleName' | 'userId'>) => {
        if (!user) return;
        const vehicleName = vehicles.find(v => v.id === docData.vehicleId)?.name || 'Unknown';
        const newDoc: Document = { id: `d${Date.now()}`, userId: user.id, vehicleName, ...docData };
        setDocuments(prev => {
            const newState = [newDoc, ...prev];
            saveToLocalStorage(DATA_KEYS.DOCUMENTS, newState);
            return newState;
        });
    }, [user, vehicles]);

    const deleteDocument = useCallback((docId: string) => {
        setDocuments(prev => {
            const newState = prev.filter(d => d.id !== docId);
            saveToLocalStorage(DATA_KEYS.DOCUMENTS, newState);
            return newState;
        });
    }, []);

    const clearAllData = useCallback(() => {
        setVehicles([]);
        setServiceRecords([]);
        setExpenses([]);
        setInsurancePolicies([]);
        setDocuments([]);
        // Keep profile and user, just clear app data
        localStorage.removeItem(DATA_KEYS.VEHICLES);
        localStorage.removeItem(DATA_KEYS.SERVICES);
        localStorage.removeItem(DATA_KEYS.EXPENSES);
        localStorage.removeItem(DATA_KEYS.INSURANCE);
        localStorage.removeItem(DATA_KEYS.DOCUMENTS);
    }, []);

    const value: AppContextType = {
        isLoading,
        isAuthenticated: !!user,
        user,
        profile,
        setProfile,
        loginWithEmail,
        signup,
        logout,
        loginWithGoogle,
        vehicles,
        serviceRecords,
        expenses,
        insurancePolicies,
        documents,
        addVehicle,
        updateVehicle,
        addServiceRecord,
        addExpense,
        addInsurancePolicy,
        addDocument,
        deleteDocument,
        clearAllData,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// --- THE UNIFIED HOOK ---
export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
