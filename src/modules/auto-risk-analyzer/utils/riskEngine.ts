import type { Policy, RiskReport, RiskGap, Recommendation, CoverageSet } from '../types';
import { STATE_RULES, DEFAULT_RULE } from './insuranceRules';

export function analyzePolicy(policy: Policy): RiskReport {
  const stateRule = STATE_RULES[policy.stateCode] || DEFAULT_RULE;
  const gaps: RiskGap[] = [];
  const recommendations: Recommendation[] = [];
  let score = 100;

  // 1. Dynamic Recommendation Engine
  const recommended: CoverageSet = {
    bodilyInjuryPerPerson: 100000,
    bodilyInjuryPerAccident: 300000,
    propertyDamage: 100000,
    pip: stateRule.pipRequired ? 10000 : 0,
    uninsuredMotoristBodilyInjuryPerPerson: 100000
  };

  // Adjust recommendations based on financials
  if (policy.financials) {
    const isHighNetWorth = policy.financials.annualIncomeRange === '250k+' || 
                         policy.financials.savingsBuffer === '50k+' ||
                         policy.financials.homeOwner;

    if (isHighNetWorth) {
      recommended.bodilyInjuryPerPerson = 250000;
      recommended.bodilyInjuryPerAccident = 500000;
      recommended.propertyDamage = 100000;
      
      recommendations.push({
        id: 'rec-umbrella',
        title: 'Umbrella Policy Recommended',
        description: 'Your assets exceed standard auto limits. A $1M+ Umbrella policy is essential to protect your net worth from catastrophic claims.',
        action: 'Explore Umbrella'
      });
    }
  }

  // 2. Critical Legal Compliance Checks
  if (policy.coverages.bodilyInjuryPerPerson < stateRule.minBI_Person) {
    gaps.push({
      id: 'bi-illegal',
      severity: 'critical',
      title: 'Illegal Liability Limit',
      description: `Your BI limit ($${policy.coverages.bodilyInjuryPerPerson.toLocaleString()}) is below the state legal requirement of $${stateRule.minBI_Person.toLocaleString()}.`,
    });
    score -= 50;
  }

  if (policy.coverages.propertyDamage < stateRule.minPD) {
    gaps.push({
      id: 'pd-illegal',
      severity: 'critical',
      title: 'PD Below Legal Minimum',
      description: `Your state requires $${stateRule.minPD.toLocaleString()} for Property Damage. You are currently non-compliant.`,
    });
    score -= 40;
  }

  // 3. Asset Protection Analysis
  if (score > 10 && policy.coverages.bodilyInjuryPerPerson < recommended.bodilyInjuryPerPerson) {
    gaps.push({
      id: 'bi-low',
      severity: 'high',
      title: 'Insufficient Asset Protection',
      description: `We recommend $${recommended.bodilyInjuryPerPerson.toLocaleString()} in BI per person to protect your assets. Your current coverage is inadequate for your financial profile.`,
    });
    score -= 20;
  }

  if (policy.coverages.propertyDamage < recommended.propertyDamage) {
    gaps.push({
      id: 'pd-low',
      severity: 'medium',
      title: 'Property Damage Exposure',
      description: 'With the rising cost of EVs and luxury vehicles, a $25k or $50k limit is often insufficient for multi-vehicle accidents.',
    });
    score -= 10;
  }

  // 4. Supplemental Coverages
  if (stateRule.pipRequired && !policy.coverages.pip) {
    gaps.push({
      id: 'pip-missing',
      severity: 'high',
      title: 'Missing No-Fault Benefits',
      description: 'Your state requires PIP. Missing this coverage can lead to unpaid medical bills regardless of fault.',
    });
    score -= 15;
  }

  if (!policy.coverages.uninsuredMotoristBodilyInjuryPerPerson) {
    gaps.push({
      id: 'um-missing',
      severity: 'high',
      title: 'Uninsured Motorist Gap',
      description: 'You have no protection if hit by an uninsured driver. This is a primary cause of personal financial ruin.',
    });
    score -= 15;
    
    recommendations.push({
      id: 'rec-um',
      title: 'Add Uninsured Motorist',
      description: 'Match your UM limits to your BI limits to ensure YOU are protected as well as others.',
    });
  }

  // Final Scoring Logic
  const finalScore = Math.max(0, score);
  let riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical' = 'Low';
  if (finalScore < 30) riskLevel = 'Critical';
  else if (finalScore < 60) riskLevel = 'High';
  else if (finalScore < 85) riskLevel = 'Moderate';

  return {
    overallScore: finalScore,
    riskLevel,
    analysisDate: new Date().toISOString(),
    gaps,
    recommendations,
    comparison: {
      current: policy.coverages,
      recommended
    }
  };
}
