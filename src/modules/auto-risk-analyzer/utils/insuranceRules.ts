export interface StateRule {
  minBI_Person: number;
  minBI_Accident: number;
  minPD: number;
  pipRequired: boolean;
  umRequired: boolean;
  isNoFault: boolean;
  uninsuredRate: number; // Percentage
  regionalRisks: string[];
}

export const STATE_RULES: Record<string, StateRule> = {
  CA: {
    minBI_Person: 15000,
    minBI_Accident: 30000,
    minPD: 5000,
    pipRequired: false,
    umRequired: false,
    isNoFault: false,
    uninsuredRate: 16,
    regionalRisks: ['High-Value Vehicle Density', 'Uninsured Drivers', 'Litigation Risk']
  },
  TX: {
    minBI_Person: 30000,
    minBI_Accident: 60000,
    minPD: 25000,
    pipRequired: true,
    umRequired: false,
    isNoFault: false,
    uninsuredRate: 20,
    regionalRisks: ['Severe Hail Damage', 'Flash Flooding', 'Uninsured Motorists']
  },
  NY: {
    minBI_Person: 25000,
    minBI_Accident: 50000,
    minPD: 10000,
    pipRequired: true,
    umRequired: true,
    isNoFault: true,
    uninsuredRate: 6,
    regionalRisks: ['Extreme Density Accidents', 'Personal Injury Fraud', 'No-Fault Litigation']
  },
  FL: {
    minBI_Person: 10000,
    minBI_Accident: 20000,
    minPD: 10000,
    pipRequired: true,
    umRequired: false,
    isNoFault: true,
    uninsuredRate: 26,
    regionalRisks: ['Hurricane Surge Exposure', 'High Uninsured Rate', 'Assignment of Benefits Abuse']
  },
};

export const DEFAULT_RULE: StateRule = {
  minBI_Person: 25000,
  minBI_Accident: 50000,
  minPD: 25000,
  pipRequired: false,
  umRequired: false,
  isNoFault: false,
  uninsuredRate: 13,
  regionalRisks: ['Standard Liability Exposure']
};
