export interface Policy {
  id: string;
  carrier?: string;
  policyNumber?: string;
  effectiveDate?: string;
  expirationDate?: string;
  drivers: Driver[];
  vehicles: Vehicle[];
  coverages: CoverageSet;
  stateCode: string; // e.g., 'CA', 'NY'
  source: 'manual' | 'ocr';
  financials?: FinancialData;
  redactedImageUrl?: string;
  isRedacted?: boolean;
}

export interface FinancialData {
  // Income & Stability
  annualIncomeRange: '<50k' | '50k-100k' | '100k-250k' | '250k+';
  monthlyIncome?: number;
  monthlyExpenses?: number;
  incomeStability?: 'stable' | 'variable' | 'unstable';

  // Assets & Net Worth
  homeOwner: boolean;
  rentalProperty?: boolean;
  savingsBuffer: '<10k' | '10k-50k' | '50k+';
  totalAssetsValue?: number;
  hasEmergencyFund?: boolean;

  // Debt & Obligations
  monthlyDebtPayments?: number;
  hasOutstandingLoans?: boolean;

  // Life Stage & Risk
  dependents: number;
  lifeStage?: 'single' | 'newlywed' | 'family' | 'retired';
  riskTolerance?: 'conservative' | 'balanced' | 'aggressive';
  
  // Other Protections
  hasLifeInsurance?: boolean;
  hasUmbrellaPolicy?: boolean;
}

export interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  gender?: 'M' | 'F';
  licenseState: string;
  yearsLicensed?: number;
  incidents?: Incident[];
}

export interface Incident {
  type: 'accident' | 'ticket' | 'claim';
  date: string;
  description: string;
  points?: number;
}

export interface VehicleCoverage {
  comprehensiveDeductible?: number;
  collisionDeductible?: number;
  rentalReimbursement?: string; // e.g., "30/900"
  towingAndLabor?: string; // e.g., "50"
  gapCoverage?: boolean;
}

export interface Vehicle extends VehicleCoverage {
  id: string;
  year: number;
  make: string;
  model: string;
  vin?: string;
  primaryDriverId?: string;
  usage?: 'commute' | 'pleasure' | 'business';
  annualMileage?: number;
  garagingZip?: string;
}

export interface CoverageSet {
  // Liability
  bodilyInjuryPerPerson: number;
  bodilyInjuryPerAccident: number;
  propertyDamage: number;

  // Uninsured / Underinsured Motorist
  uninsuredMotoristBodilyInjuryPerPerson?: number;
  uninsuredMotoristBodilyInjuryPerAccident?: number;
  underinsuredMotoristBodilyInjuryPerPerson?: number;
  underinsuredMotoristBodilyInjuryPerAccident?: number;
  uninsuredMotoristPropertyDamage?: number;

  // First Party Benefits
  pip?: number;
  medPay?: number;
}

export interface RiskReport {
  overallScore: number; // 0-100
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  analysisDate: string;
  gaps: RiskGap[];
  recommendations: Recommendation[];
  comparison?: {
    current: Partial<CoverageSet>;
    recommended: Partial<CoverageSet>;
  };
}

export interface RiskGap {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  affectedCoverage?: keyof CoverageSet;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  action?: string; // e.g., "Increase BI limits to 100/300"
}
