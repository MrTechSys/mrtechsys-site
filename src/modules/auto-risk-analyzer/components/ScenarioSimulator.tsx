import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ShieldAlert, Zap, TrendingUp, Info } from 'lucide-react';
import type { Policy } from '../types';

interface Scenario {
  id: string;
  name: string;
  description: string;
  totalCost: number;
  biCost: number;
  pdCost: number;
  icon: React.ReactNode;
  severity: 'low' | 'medium' | 'high';
}

const SCENARIOS: Scenario[] = [
  {
    id: 'minor',
    name: 'Fender Bender',
    description: 'A low-speed rear-end collision at a stoplight. Minor soft-tissue injury to one person.',
    totalCost: 18000,
    biCost: 12000,
    pdCost: 6000,
    icon: <Zap size={20} />,
    severity: 'low'
  },
  {
    id: 'moderate',
    name: 'Multi-Car Incident',
    description: 'Changing lanes too quickly on a highway. Two cars damaged, one driver needs surgery.',
    totalCost: 95000,
    biCost: 65000,
    pdCost: 30000,
    icon: <TrendingUp size={20} />,
    severity: 'medium'
  },
  {
    id: 'catastrophic',
    name: 'The "Surgeon" Event',
    description: 'A major intersection collision. Totaled luxury EV and severe injuries to a high-earning professional.',
    totalCost: 485000,
    biCost: 400000,
    pdCost: 85000,
    icon: <ShieldAlert size={20} />,
    severity: 'high'
  }
];

interface ScenarioSimulatorProps {
  policy: Policy;
}

export default function ScenarioSimulator({ policy }: ScenarioSimulatorProps) {
  const [activeId, setActiveId] = useState(SCENARIOS[1].id);
  const activeScenario = useMemo(() => SCENARIOS.find(s => s.id === activeId)!, [activeId]);

  // Calculate Exposure
  const calculation = useMemo(() => {
    const biCovered = Math.min(activeScenario.biCost, policy.coverages.bodilyInjuryPerPerson);
    const pdCovered = Math.min(activeScenario.pdCost, policy.coverages.propertyDamage);
    const totalCovered = biCovered + pdCovered;
    const exposure = Math.max(0, activeScenario.totalCost - totalCovered);
    
    return {
      biCovered,
      pdCovered,
      totalCovered,
      exposure,
      isExposed: exposure > 0
    };
  }, [activeScenario, policy]);

  const exposurePercentage = (calculation.exposure / activeScenario.totalCost) * 100;

  return (
    <div className="scenario-simulator" style={{ marginTop: '3rem', padding: '4rem', background: '#080808', border: '1px solid #1a1a1a', borderRadius: '40px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h3 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontWeight: 800 }}>Catastrophic Loss <span className="text-gold">Simulator</span></h3>
        <p className="text-grey" style={{ maxWidth: '650px', margin: '0 auto', fontSize: '1.1rem', lineHeight: 1.6 }}>
          Real-world claims often exceed legal minimums. Select a scenario to see how your current policy handles the fallout.
        </p>
      </div>

      {/* Scenario Selection */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', marginBottom: '5rem' }}>
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveId(s.id)}
            style={{
              padding: '2rem',
              borderRadius: '24px',
              border: '1px solid',
              borderColor: activeId === s.id ? 'var(--color-gold)' : '#222',
              background: activeId === s.id ? 'rgba(212, 175, 55, 0.05)' : '#050505',
              cursor: 'pointer',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              textAlign: 'left',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {activeId === s.id && <motion.div layoutId="active-bg" style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--color-gold)' }} />}
            <div style={{ color: activeId === s.id ? 'var(--color-gold)' : '#444', marginBottom: '1.25rem' }}>
              {s.icon}
            </div>
            <div style={{ fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '0.5rem', color: activeId === s.id ? 'white' : '#888' }}>
              {s.name}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.4 }}>
              ${s.totalCost.toLocaleString()} Estimated Claim
            </div>
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '5rem', alignItems: 'center' }}>
        {/* Visual Bar */}
        <div>
          <div style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '1rem' }}>
              <span className="text-grey" style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.8rem' }}>Financial Fallout Distribution</span>
              <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Total: ${activeScenario.totalCost.toLocaleString()}</span>
            </div>
            
            <div style={{ height: '100px', width: '100%', background: '#111', borderRadius: '24px', overflow: 'hidden', display: 'flex', border: '1px solid #222', boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.5)' }}>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${100 - exposurePercentage}%` }}
                transition={{ type: 'spring', damping: 25, stiffness: 120 }}
                style={{ 
                  background: 'linear-gradient(90deg, #b8860b 0%, var(--color-gold) 100%)', 
                  height: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  paddingLeft: '2rem',
                  color: 'black',
                  fontWeight: '900',
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  whiteSpace: 'nowrap'
                }}
              >
                {100 - exposurePercentage > 15 && 'Insurance Coverage'}
              </motion.div>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${exposurePercentage}%` }}
                transition={{ type: 'spring', damping: 25, stiffness: 120 }}
                style={{ 
                  background: 'linear-gradient(90deg, #ff4444 0%, #cc0000 100%)', 
                  height: '100%',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'flex-end',
                  paddingRight: '2rem',
                  color: 'white',
                  fontWeight: '900',
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  whiteSpace: 'nowrap'
                }}
              >
                {exposurePercentage > 15 && 'Your Out-of-Pocket Exposure'}
              </motion.div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div style={{ padding: '2rem', borderRadius: '24px', background: 'rgba(212, 175, 55, 0.05)', border: '1px solid rgba(212, 175, 55, 0.1)' }}>
              <div className="text-grey" style={{ fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.1em' }}>Insulated by Policy</div>
              <div style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--color-gold)', fontVariantNumeric: 'tabular-nums' }}>${calculation.totalCovered.toLocaleString()}</div>
            </div>
            <div style={{ padding: '2rem', borderRadius: '24px', background: calculation.isExposed ? 'rgba(239, 68, 68, 0.05)' : 'rgba(34, 197, 94, 0.05)', border: calculation.isExposed ? '1px solid rgba(239, 68, 68, 0.1)' : '1px solid rgba(34, 197, 94, 0.1)' }}>
              <div className="text-grey" style={{ fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.1em' }}>Personal Assets at Risk</div>
              <div style={{ fontSize: '2rem', fontWeight: '900', color: calculation.isExposed ? 'var(--color-error)' : '#22c55e', fontVariantNumeric: 'tabular-nums' }}>
                ${calculation.exposure.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Narrative / Warning */}
        <div style={{ background: '#050505', padding: '2.5rem', borderRadius: '24px', border: '1px solid #222' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeId}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div style={{ color: 'var(--color-gold)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                <Info size={14} /> Scenario Intelligence
              </div>
              <p style={{ fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                {activeScenario.description}
              </p>

              {calculation.isExposed ? (
                <div style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--color-error)', background: 'rgba(239, 68, 68, 0.03)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-error)', fontWeight: 'bold', marginBottom: '0.75rem' }}>
                    <AlertTriangle size={20} /> LIQUIDATION RISK
                  </div>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#aaa', lineHeight: 1.5 }}>
                    Your current limits are exhausted in this scenario. Under Texas law, your wages could be garnished or assets seized to pay the remaining <strong>${calculation.exposure.toLocaleString()}</strong>.
                  </p>
                </div>
              ) : (
                <div style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid #22c55e', background: 'rgba(34, 197, 94, 0.03)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#22c55e', fontWeight: 'bold', marginBottom: '0.75rem' }}>
                    <ShieldAlert size={20} /> FULLY INSULATED
                  </div>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#aaa', lineHeight: 1.5 }}>
                    Your current limits are sufficient to cover this entire event. You have effectively transferred 100% of this financial risk to the insurer.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
