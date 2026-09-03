import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Policy, RiskReport, Vehicle, Driver, FinancialData } from '../types';
import { analyzePolicy } from '../utils/riskEngine';
import { encryptedStorage } from '../utils/crypto';
import { mapExtractedPolicyToStore } from '../utils/mapping';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
}

interface RiskState {
  currentStep: number;
  policy: Policy;
  report: RiskReport | null;
  umMatching: boolean;
  messages: Message[];
  isExtracting: boolean;
  toast: Toast | null;
  
  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updatePolicy: (updates: Partial<Policy>) => void;
  importOCRData: (extracted: any) => void;
  updateFinancials: (updates: Partial<FinancialData>) => void;
  updateCoverages: (updates: Partial<Policy['coverages']>) => void;
  setUMMatching: (val: boolean) => void;
  addMessage: (msg: Message) => void;
  setIsExtracting: (val: boolean) => void;
  addDriver: (driver: Driver) => void;
  removeDriver: (id: string) => void;
  addVehicle: (vehicle: Vehicle) => void;
  removeVehicle: (id: string) => void;
  generateReport: () => void; 
  setReport: (report: RiskReport | null) => void;
  reset: () => void;
  setToast: (toast: Toast | null) => void;
}

const initialPolicy: Policy = {
  id: Math.random().toString(36).substr(2, 9),
  carrier: '',
  policyNumber: '',
  drivers: [],
  vehicles: [],
  coverages: {
    bodilyInjuryPerPerson: 30000,
    bodilyInjuryPerAccident: 60000,
    propertyDamage: 25000,
    pip: 2500,
  },
  stateCode: 'TX',
  source: 'manual',
  financials: {
    annualIncomeRange: '<50k',
    homeOwner: false,
    savingsBuffer: '<10k',
    dependents: 0,
  },
};

export const useRiskStore = create<RiskState>()(
  persist(
    (set, get) => ({
      currentStep: 1,
      policy: initialPolicy,
      report: null,
      umMatching: false,
      messages: [{ role: 'assistant', text: 'I am MrTechSysGPT. Ask me anything about your coverage, risk factors, or insurance terminology.' }],
      isExtracting: false,
      toast: null,

      setStep: (step) => set({ currentStep: step }),
      nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
      prevStep: () => set((state) => ({ currentStep: Math.max(1, state.currentStep - 1) })),
      
      updatePolicy: (updates) => {
        set((state) => ({ 
          policy: { ...state.policy, ...updates } 
        }));
        // Auto-recalculate report if it exists
        if (get().report) get().generateReport();
      },

      importOCRData: (extracted) => {
        const normalized = mapExtractedPolicyToStore(extracted);
        set((state) => ({
          policy: { ...state.policy, ...normalized },
          toast: { message: 'Policy intelligence successfully imported.', type: 'success' }
        }));
        get().generateReport();
      },

      updateFinancials: (updates) => {
        set((state) => ({
          policy: {
            ...state.policy,
            financials: { ...state.policy.financials, ...updates } as FinancialData,
          }
        }));
        if (get().report) get().generateReport();
      },

      updateCoverages: (updates) => {
        const state = get();
        const newCoverages = { ...state.policy.coverages, ...updates };
        
        // UM/UIM Matching Logic
        if (state.umMatching) {
          if (updates.bodilyInjuryPerPerson !== undefined) {
            newCoverages.uninsuredMotoristBodilyInjuryPerPerson = updates.bodilyInjuryPerPerson;
          }
          if (updates.bodilyInjuryPerAccident !== undefined) {
            newCoverages.uninsuredMotoristBodilyInjuryPerAccident = updates.bodilyInjuryPerAccident;
          }
        }

        set({ policy: { ...state.policy, coverages: newCoverages } });
        if (state.report) get().generateReport();
      },

      setUMMatching: (val) => {
        const state = get();
        if (val) {
          const newCoverages = { 
            ...state.policy.coverages, 
            uninsuredMotoristBodilyInjuryPerPerson: state.policy.coverages.bodilyInjuryPerPerson,
            uninsuredMotoristBodilyInjuryPerAccident: state.policy.coverages.bodilyInjuryPerAccident
          };
          set({ umMatching: val, policy: { ...state.policy, coverages: newCoverages } });
        } else {
          set({ umMatching: val });
        }
        if (get().report) get().generateReport();
      },

      addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
      setIsExtracting: (val) => set({ isExtracting: val }),

      addDriver: (driver) => {
        set((state) => ({
          policy: { ...state.policy, drivers: [...state.policy.drivers, driver] }
        }));
        if (get().report) get().generateReport();
      },

      removeDriver: (id) => {
        set((state) => ({
          policy: {
            ...state.policy,
            drivers: state.policy.drivers.filter((d) => d.id !== id),
          },
        }));
        if (get().report) get().generateReport();
      },

      addVehicle: (vehicle) => {
        set((state) => ({
          policy: { ...state.policy, vehicles: [...state.policy.vehicles, vehicle] }
        }));
        if (get().report) get().generateReport();
      },

      removeVehicle: (id) => {
        set((state) => ({
          policy: {
            ...state.policy,
            vehicles: state.policy.vehicles.filter((v) => v.id !== id),
          },
        }));
        if (get().report) get().generateReport();
      },

      generateReport: () => {
        const policy = get().policy;
        const report = analyzePolicy(policy);
        set({ report });
      },

      setReport: (report) => set({ report }),

      reset: () => {
        localStorage.removeItem('risk-storage');
        set({ currentStep: 1, policy: initialPolicy, report: null, umMatching: false, messages: [{ role: 'assistant', text: 'I am MrTechSysGPT. Ask me anything about your coverage, risk factors, or insurance terminology.' }] });
      },

      setToast: (toast) => set({ toast }),
    }),
    {
      name: 'risk-storage',
      storage: createJSONStorage(() => encryptedStorage),
    }
  )
);
