import { motion } from 'framer-motion';
import { MapPin, ShieldAlert, Activity } from 'lucide-react';
import { STATE_RULES, DEFAULT_RULE } from '../../utils/insuranceRules';

interface RegionalRiskAlertProps {
  stateCode: string;
}

export default function RegionalRiskAlert({ stateCode }: RegionalRiskAlertProps) {
  const rule = STATE_RULES[stateCode] || DEFAULT_RULE;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'rgba(212, 175, 55, 0.03)',
        border: '1px solid rgba(212, 175, 55, 0.1)',
        borderRadius: '20px',
        padding: '2rem',
        marginBottom: '3rem',
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        gap: '2rem',
        alignItems: 'center'
      }}
    >
      <div style={{ color: 'var(--color-gold)', background: 'rgba(212, 175, 55, 0.05)', padding: '1rem', borderRadius: '16px' }}>
        <MapPin size={32} />
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
          <Activity size={14} className="text-gold" />
          <span style={{ color: 'var(--color-gold)', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
            Local Actuarial Data: {stateCode === 'TX' ? 'TEXAS' : stateCode}
          </span>
        </div>
        <h4 style={{ margin: 0, fontSize: '1.25rem', marginBottom: '0.5rem' }}>
          Uninsured Motorist Rate: <span className="text-gold">{rule.uninsuredRate}%</span>
        </h4>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {rule.regionalRisks.map(risk => (
            <span key={risk} style={{ fontSize: '0.75rem', color: '#666', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldAlert size={12} color="var(--color-error)" /> {risk}
            </span>
          ))}
        </div>
      </div>

      <div style={{ textAlign: 'right', borderLeft: '1px solid #222', paddingLeft: '2rem' }}>
        <p className="text-grey" style={{ fontSize: '0.8rem', maxWidth: '250px', margin: 0, lineHeight: 1.5 }}>
          Your UM/UIM limits are your only protection against {rule.uninsuredRate}% of drivers on local roads.
        </p>
      </div>
    </motion.div>
  );
}
