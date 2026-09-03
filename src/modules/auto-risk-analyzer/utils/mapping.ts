import type { Policy, CoverageSet } from '../types';

/**
 * Normalizes raw OCR/Extraction data into the store format.
 * Handles string-to-number conversion and default fallbacks.
 */
export const mapExtractedPolicyToStore = (extracted: any): Partial<Policy> => {
  const parseLimit = (val: any) => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
      const cleaned = val.replace(/[^0-9.]/g, '');
      return cleaned ? parseFloat(cleaned) : 0;
    }
    return 0;
  };

  const coverages: Partial<CoverageSet> = {
    bodilyInjuryPerPerson: parseLimit(extracted.coverages?.bodilyInjuryPerPerson) || 30000,
    bodilyInjuryPerAccident: parseLimit(extracted.coverages?.bodilyInjuryPerAccident) || 60000,
    propertyDamage: parseLimit(extracted.coverages?.propertyDamage) || 25000,
    pip: parseLimit(extracted.coverages?.pip) || 2500,
    medicalPayments: parseLimit(extracted.coverages?.medicalPayments),
    uninsuredMotoristBodilyInjuryPerPerson: parseLimit(extracted.coverages?.uninsuredMotoristBodilyInjuryPerPerson),
    uninsuredMotoristBodilyInjuryPerAccident: parseLimit(extracted.coverages?.uninsuredMotoristBodilyInjuryPerAccident),
    comprehensiveDeductible: parseLimit(extracted.coverages?.comprehensiveDeductible),
    collisionDeductible: parseLimit(extracted.coverages?.collisionDeductible),
  };

  return {
    carrier: extracted.policyInfo?.carrier,
    policyNumber: extracted.policyInfo?.policyNumber,
    effectiveDate: extracted.policyInfo?.effectiveDate,
    expirationDate: extracted.policyInfo?.expirationDate,
    stateCode: extracted.policyInfo?.stateCode || 'TX',
    coverages: coverages as CoverageSet,
    vehicles: extracted.vehicles || [],
    drivers: extracted.drivers || [],
    source: 'ocr'
  };
};
