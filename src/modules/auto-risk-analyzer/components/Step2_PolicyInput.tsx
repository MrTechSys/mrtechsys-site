import { useState } from 'react';
import { useRiskStore } from '../store/useRiskStore';
import { motion } from 'framer-motion';
import { z } from 'zod';
import Tooltip from './ui/Tooltip';
import PolicyIngestion from './PolicyIngestion';

// Schema for this step
const stepSchema = z.object({
  stateCode: z.string().length(2, "Please select a state"),
  effectiveDate: z.string().min(1, "Effective date is required"),
});

export default function Step2_PolicyInput() {
  const { policy, updatePolicy, nextStep, prevStep } = useRiskStore();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleNext = () => {
    const result = stepSchema.safeParse({
      stateCode: policy.stateCode,
      effectiveDate: policy.effectiveDate,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    nextStep();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="container full-screen flex-center"
      style={{ flexDirection: 'column', maxWidth: '800px', margin: '0 auto', paddingTop: '4rem' }}
    >
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '2.5rem' }}>Policy <span className="text-gold">Intelligence</span></h2>
        <p className="text-grey">Upload your current policy for instant analysis or enter details manually.</p>
      </div>

      <PolicyIngestion />

      <div style={{ width: '100%', height: '1px', background: '#222', margin: '2rem 0', position: 'relative' }}>
        <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'black', padding: '0 20px', fontSize: '0.7rem', color: '#444', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
          Manual Entry
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', width: '100%', marginBottom: '3rem' }}>
        <div>
          <label className="label">
            State
            <Tooltip text="Insurance rules and minimums vary significantly by state." />
          </label>
          <select 
            className="input-field"
            style={{ borderColor: errors.stateCode ? 'var(--color-error)' : '' }}
            value={policy.stateCode}
            onChange={(e) => updatePolicy({ stateCode: e.target.value })}
          >
            <option value="">Select State</option>
            <option value="CA">California</option>
            <option value="TX">Texas</option>
            <option value="NY">New York</option>
            <option value="FL">Florida</option>
          </select>
          {errors.stateCode && <p style={{ color: 'var(--color-error)', fontSize: '0.8rem', marginTop: '4px' }}>{errors.stateCode}</p>}
        </div>

        <div>
          <label className="label">Effective Date</label>
          <input 
            type="date" 
            className="input-field"
            style={{ borderColor: errors.effectiveDate ? 'var(--color-error)' : '' }}
            value={policy.effectiveDate || ''}
            onChange={(e) => updatePolicy({ effectiveDate: e.target.value })}
          />
          {errors.effectiveDate && <p style={{ color: 'var(--color-error)', fontSize: '0.8rem', marginTop: '4px' }}>{errors.effectiveDate}</p>}
        </div>
      </div>

      <div style={{ width: '100%', marginBottom: '3rem' }}>
        <label className="label">Policy Number (Optional)</label>
        <input 
          type="text" 
          className="input-field"
          placeholder="Enter policy number"
          value={policy.policyNumber || ''}
          onChange={(e) => updatePolicy({ policyNumber: e.target.value.trim() })}
        />
      </div>

      <div style={{ display: 'flex', gap: '1rem', width: '100%', justifyContent: 'center' }}>
        <button onClick={prevStep} className="btn-secondary" style={{ padding: '14px 40px' }}>Back</button>
        <button onClick={handleNext} className="btn-primary" style={{ padding: '14px 60px' }}>Next: Drivers & Vehicles</button>
      </div>
    </motion.div>
  );
}
