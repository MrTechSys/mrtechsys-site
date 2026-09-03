import { useRiskStore } from '../store/useRiskStore';
import { motion } from 'framer-motion';
import Tooltip from './ui/Tooltip';
import { ShieldCheck, AlertCircle, BookOpen, CheckCircle2, XCircle } from 'lucide-react';
import RegionalRiskAlert from './risk/RegionalRiskAlert';

export default function Step4_Coverages() {
  const { policy, updateCoverages, umMatching, setUMMatching, nextStep, prevStep } = useRiskStore();

  const handleCoverageUpdate = (key: string, value: string) => {
    updateCoverages({ [key]: parseInt(value) });
  };

  const isTexas = policy.stateCode === 'TX';

  const umExceedsLiability = (policy.coverages.uninsuredMotoristBodilyInjuryPerPerson || 0) > policy.coverages.bodilyInjuryPerPerson;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="container"
      style={{ paddingTop: '4rem', paddingBottom: '6rem' }}
    >
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{ color: 'var(--color-gold)', fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '0.2em', marginBottom: '0.5rem' }}>
          JURISDICTION: {isTexas ? 'TEXAS' : policy.stateCode}
        </div>
        <h2 style={{ marginBottom: '1rem' }}>Current <span className="text-gold">Coverage</span></h2>
        <p className="text-grey">Select the limits found on your Declarations page.</p>
      </div>

      <RegionalRiskAlert stateCode={policy.stateCode} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '2.5rem' }}>
        
        {/* Liability Section */}
        <section className="card" style={{ background: 'var(--color-grey-dark)', padding: '2.5rem', borderRadius: '20px', border: '1px solid #222' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <ShieldCheck color="var(--color-gold)" size={24} />
            <h3 className="text-gold" style={{ margin: 0 }}>Liability Protection</h3>
          </div>
          
          <CoverageField 
            label="Bodily Injury (PP)"
            tooltip="Maximum paid for one person's injuries in an accident you cause."
            value={policy.coverages.bodilyInjuryPerPerson}
            onChange={(val: string) => handleCoverageUpdate('bodilyInjuryPerPerson', val)}
            options={[15000, 25000, 30000, 50000, 100000, 250000, 500000]}
            isAutoDetected={policy.source === 'ocr'}
          />

          <CoverageField 
            label="Bodily Injury (PA)"
            tooltip="Total maximum paid for all injuries in a single accident."
            value={policy.coverages.bodilyInjuryPerAccident}
            onChange={(val: string) => handleCoverageUpdate('bodilyInjuryPerAccident', val)}
            options={[30000, 50000, 60000, 100000, 300000, 500000]}
            isAutoDetected={policy.source === 'ocr'}
          />

          <CoverageField 
            label="Property Damage"
            tooltip="Maximum paid for damage to other people's property."
            value={policy.coverages.propertyDamage}
            onChange={(val: string) => handleCoverageUpdate('propertyDamage', val)}
            options={[5000, 10000, 25000, 50000, 100000]}
            isAutoDetected={policy.source === 'ocr'}
          />

          <EducationBox 
            title="Liability (BI/PD)"
            whatItDoes="Pays for injuries and property damage you cause to others."
            whatItDoesNot="Does NOT cover your own injuries or your own vehicle."
            texasMin="30/60/25"
            recommendation="100/300/100 or higher if you own a home."
          />
        </section>

        {/* UM/UIM & Benefits Section */}
        <section className="card" style={{ background: 'var(--color-grey-dark)', padding: '2.5rem', borderRadius: '20px', border: '1px solid #222' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <AlertCircle color="var(--color-gold)" size={24} />
            <h3 className="text-gold" style={{ margin: 0 }}>Uninsured / Benefits</h3>
          </div>

          <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input 
              type="checkbox" 
              id="umMatch"
              checked={umMatching}
              onChange={(e) => setUMMatching(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--color-gold)' }}
            />
            <label htmlFor="umMatch" style={{ fontSize: '0.9rem', cursor: 'pointer' }}>Match UM/UIM to Liability Limits</label>
          </div>
          
          <CoverageField 
            label="UM Bodily Injury (PP)"
            tooltip="Protects YOU if hit by someone with no insurance."
            value={policy.coverages.uninsuredMotoristBodilyInjuryPerPerson || 0}
            onChange={(val: string) => handleCoverageUpdate('uninsuredMotoristBodilyInjuryPerPerson', val)}
            disabled={umMatching}
            options={[0, 15000, 25000, 30000, 50000, 100000, 250000]}
            isAutoDetected={policy.source === 'ocr'}
          />
          {umExceedsLiability && !umMatching && (
            <p style={{ color: 'var(--color-error)', fontSize: '0.75rem', marginTop: '-10px', marginBottom: '10px' }}>
              Warning: UM limits typically cannot exceed Liability limits.
            </p>
          )}

          <CoverageField 
            label="PIP / MedPay"
            tooltip="Immediate medical coverage for you and your passengers regardless of fault."
            value={policy.coverages.pip || 0}
            onChange={(val: string) => handleCoverageUpdate('pip', val)}
            options={[0, 2500, 5000, 10000, 50000]}
            isAutoDetected={policy.source === 'ocr'}
          />

          <EducationBox 
            title="Uninsured Motorist (UM)"
            whatItDoes="Covers your medical bills if hit by an uninsured or hit-and-run driver."
            whatItDoesNot="Does not cover accidents where the other driver has enough insurance."
            texasMin="Not required, but must be offered."
            recommendation="Always match your liability limits."
          />
        </section>

      </div>

      <div style={{ display: 'flex', gap: '1.5rem', marginTop: '4rem', justifyContent: 'center' }}>
        <button onClick={prevStep} className="btn-secondary" style={{ padding: '14px 40px' }}>Back</button>
        <button onClick={nextStep} className="btn-primary" style={{ padding: '14px 60px' }}>Generate Risk Analysis</button>
      </div>
    </motion.div>
  );
}

interface EducationBoxProps {
  title: string;
  whatItDoes: string;
  whatItDoesNot: string;
  texasMin: string;
  recommendation: string;
}

function EducationBox({ title, whatItDoes, whatItDoesNot, texasMin, recommendation }: EducationBoxProps) {
  return (
    <div style={{ marginTop: '2.5rem', background: '#0a0a0a', padding: '1.5rem', borderRadius: '12px', borderLeft: '4px solid var(--color-gold)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', color: 'var(--color-gold)' }}>
        <BookOpen size={16} />
        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Library: {title}</span>
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '0.5rem' }}>
          <CheckCircle2 size={14} className="text-success" style={{ flexShrink: 0, marginTop: '2px' }} />
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#eee' }}><strong className="text-success">Covers:</strong> {whatItDoes}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <XCircle size={14} className="text-error" style={{ flexShrink: 0, marginTop: '2px' }} />
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#eee' }}><strong className="text-error">Excludes:</strong> {whatItDoesNot}</p>
        </div>
      </div>

      <div style={{ borderTop: '1px solid #222', paddingTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <span style={{ display: 'block', fontSize: '0.65rem', color: '#666', textTransform: 'uppercase' }}>TX Minimum</span>
          <span style={{ fontSize: '0.85rem', color: 'white' }}>{texasMin}</span>
        </div>
        <div>
          <span style={{ display: 'block', fontSize: '0.65rem', color: '#666', textTransform: 'uppercase' }}>Recommended</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-gold)' }}>{recommendation}</span>
        </div>
      </div>
    </div>
  );
}

interface CoverageFieldProps {
  label: string;
  tooltip: string;
  value: number;
  onChange: (value: string) => void;
  options: number[];
  disabled?: boolean;
  isAutoDetected?: boolean;
}

function CoverageField({ label, tooltip, value, onChange, options, disabled, isAutoDetected }: CoverageFieldProps) {
  return (
    <div style={{ marginBottom: '1.5rem', opacity: disabled ? 0.5 : 1 }}>
      <label className="label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>
          {label}
          <Tooltip text={tooltip} />
        </span>
        {isAutoDetected && (
          <span style={{ background: 'rgba(212, 175, 55, 0.1)', color: 'var(--color-gold)', fontSize: '0.6rem', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
            AUTO-DETECTED
          </span>
        )}
      </label>
      <select 
        className="input-field" 
        value={value || 0}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        <option value="0">{label.includes('UM') || label.includes('PIP') ? 'None / Declined' : 'Select Limit'}</option>
        {options.map((opt: number) => (
          <option key={opt} value={opt}>${opt.toLocaleString()}</option>
        ))}
      </select>
    </div>
  );
}
