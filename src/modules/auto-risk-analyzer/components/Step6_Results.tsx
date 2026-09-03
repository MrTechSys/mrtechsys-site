import { useRiskStore } from '../store/useRiskStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertCircle, TrendingDown, CheckCircle2, FileText, Play, RotateCcw, BarChart3, Target, Briefcase, Code, Copy, Check } from 'lucide-react';
import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { analyzePolicy } from '../utils/riskEngine';
import type { Policy } from '../types';
import ScenarioSimulator from './ScenarioSimulator';

export default function Step6_Results() {
  const { report, setReport, policy, reset } = useRiskStore();
  const [isExporting, setIsExporting] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [showPayload, setShowPayload] = useState(false);
  const [copied, setCopied] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  if (!report || !policy) return null;

  const handleExport = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    
    try {
      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: '#000000',
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`MrTechSys-Risk-Report-${new Date().getTime()}.pdf`);
    } catch (error) {
      console.error('PDF Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const copyPayload = () => {
    const payload = JSON.stringify({ policy, riskReport: report }, null, 2);
    navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scoreColor = report.overallScore > 80 ? 'var(--color-success)' : report.overallScore > 50 ? 'var(--color-gold)' : 'var(--color-error)';

  const isFinancialSkipped = !policy.financials || (policy.financials.annualIncomeRange === '<50k' && !policy.financials.homeOwner && policy.financials.savingsBuffer === '<10k');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container"
      style={{ paddingTop: '2rem', paddingBottom: '6rem' }}
    >
      <div ref={reportRef} style={{ background: 'black', padding: '40px', borderRadius: '32px', border: '1px solid #111' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{ color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '0.4em', fontSize: '0.7rem', marginBottom: '1rem' }}>
            Risk Intelligence Audit Complete
          </div>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '3rem' }}>Sovereign <span className="text-gold">Exposure</span></h2>
          
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <svg width="200" height="200" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#222" strokeWidth="8" />
              <motion.circle 
                cx="50" cy="50" r="45" fill="none" 
                stroke={scoreColor} 
                strokeWidth="8" 
                strokeDasharray="283"
                initial={{ strokeDashoffset: 283 }}
                animate={{ strokeDashoffset: 283 - (283 * report.overallScore) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
              <div style={{ fontSize: '3.5rem', fontWeight: 'bold', color: scoreColor, lineHeight: 1 }}>{report.overallScore}</div>
              <div style={{ fontSize: '0.7rem', color: '#666', textTransform: 'uppercase' }}>Security Index</div>
            </div>
          </div>
        </div>

        {/* Structured Summary Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
          <SummaryCard 
            icon={<BarChart3 size={24} className="text-gold" />}
            title="Coverage Overview"
            items={[
              { label: 'Liability (BI)', value: `${policy.coverages.bodilyInjuryPerPerson / 1000}k/${policy.coverages.bodilyInjuryPerAccident / 1000}k`, highlight: true },
              { label: 'Property Damage', value: `$${(policy.coverages.propertyDamage / 1000)}k`, highlight: true },
              { label: 'PIP / MedPay', value: policy.coverages.pip ? `$${policy.coverages.pip.toLocaleString()}` : 'Declined', highlight: true }
            ]}
          />
          <SummaryCard 
            icon={<Target size={24} className="text-gold" />}
            title="Risk Exposure"
            items={[
              { label: 'Lawsuit Risk', value: report.overallScore < 60 ? 'Critical' : 'Moderate' },
              { label: 'Asset Protection', value: policy.financials?.homeOwner ? 'Low' : 'Adequate' },
              { label: 'Medical Gap', value: policy.coverages.pip ? 'Protected' : 'Exposed' }
            ]}
          />
          <SummaryCard 
            icon={<Briefcase size={24} className="text-gold" />}
            title="Financial Alignment"
            items={[
              { label: 'Income Tier', value: policy.financials?.annualIncomeRange || 'Not Provided' },
              { label: 'Homeowner', value: policy.financials?.homeOwner ? 'Yes' : 'No' },
              { label: 'Savings Buffer', value: policy.financials?.savingsBuffer || 'Unknown' }
            ]}
          />
        </div>

        {/* Comparison Grid */}
        <section style={{ marginBottom: '5rem', background: '#0a0a0a', padding: '3.5rem', borderRadius: '32px', border: '1px solid #1a1a1a' }}>
          <h3 style={{ marginBottom: '3rem', textAlign: 'center', letterSpacing: '0.1em' }}>Protection Gap vs. Asset Value</h3>
          
          {isFinancialSkipped && (
            <div style={{ marginBottom: '2rem', background: 'rgba(212, 175, 55, 0.05)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(212, 175, 55, 0.2)', textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-gold)' }}>
                <strong>Standard Texas Recommendations:</strong> These benchmarks are based on average Texas driver risk. For a personalized asset protection audit, complete the financial assessment.
              </p>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '4rem' }}>
            <ComparisonChart 
              label="Bodily Injury (Individual)" 
              current={report.comparison?.current.bodilyInjuryPerPerson || 0}
              recommended={report.comparison?.recommended.bodilyInjuryPerPerson || 0}
              max={500000}
              description="Maximum protection for assets if you injure one person."
            />
            <ComparisonChart 
              label="Bodily Injury (Total)" 
              current={report.comparison?.current.bodilyInjuryPerAccident || 0}
              recommended={report.comparison?.recommended.bodilyInjuryPerAccident || 0}
              max={500000}
              description="Total lawsuit protection for multi-party accidents."
            />
            <ComparisonChart 
              label="Property Damage" 
              current={report.comparison?.current.propertyDamage || 0}
              recommended={report.comparison?.recommended.propertyDamage || 0}
              max={100000}
              description="Covers damage to high-value vehicles or structures."
            />
          </div>
        </section>

        {/* Cinematic Scenario Simulator */}
        <section style={{ marginBottom: '5rem' }}>
          <ScenarioSimulator policy={policy} />
        </section>

        {/* Insights Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2.5rem' }}>
          <div style={{ background: 'var(--color-grey-dark)', padding: '2.5rem', borderRadius: '24px', border: '1px solid #222', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'var(--color-error)' }} />
            <h4 style={{ marginBottom: '2rem', color: 'var(--color-error)', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.25rem' }}>
              <AlertCircle size={24} /> Critical Gaps Identified
            </h4>
            {report.gaps.map(gap => (
              <div key={gap.id} style={{ marginBottom: '2rem', display: 'flex', gap: '1.5rem' }}>
                <TrendingDown color="var(--color-error)" size={20} style={{ flexShrink: 0, marginTop: '4px' }} />
                <div>
                  <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#eee' }}>{gap.title}</div>
                  <p className="text-grey" style={{ fontSize: '0.95rem', margin: 0, lineHeight: 1.6 }}>{gap.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: 'var(--color-grey-dark)', padding: '2.5rem', borderRadius: '24px', border: '1px solid #222', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'var(--color-gold)' }} />
            <h4 style={{ marginBottom: '2rem', color: 'var(--color-gold)', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.25rem' }}>
              <Shield size={24} /> Recommended Adjustments
            </h4>
            {report.recommendations.map(rec => (
              <div key={rec.id} style={{ marginBottom: '2rem', display: 'flex', gap: '1.5rem' }}>
                <CheckCircle2 color="var(--color-gold)" size={20} style={{ flexShrink: 0, marginTop: '4px' }} />
                <div>
                  <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#eee' }}>{rec.title}</div>
                  <p className="text-grey" style={{ fontSize: '0.95rem', margin: 0, lineHeight: 1.6 }}>{rec.description}</p>
                  {rec.action && <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--color-gold)', fontWeight: 'bold' }}>ACTION: {rec.action}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Simulator Toggle */}
      <div style={{ marginTop: '4rem', textAlign: 'center', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <button 
          onClick={() => setShowSimulator(!showSimulator)}
          className="btn-secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '14px 28px', border: '1px dashed var(--color-gold)', background: 'transparent' }}
        >
          <Play size={18} /> {showSimulator ? 'Close Risk Simulator' : 'Enter Risk Simulator (What-If?)'}
        </button>

        <button 
          onClick={() => setShowPayload(!showPayload)}
          className="btn-secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '14px 28px', border: '1px dashed #444', background: 'transparent' }}
        >
          <Code size={18} /> {showPayload ? 'Hide API Payload' : 'Carrier Integration Payload'}
        </button>
      </div>

      <AnimatePresence>
        {showSimulator && (
          <RiskSimulator policy={policy} onUpdate={(newPolicy: Policy) => {
            const newReport = analyzePolicy(newPolicy);
            setReport(newReport);
          }} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPayload && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden', marginTop: '2rem', background: '#050505', border: '1px solid #222', borderRadius: '24px', padding: '2.5rem' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h4 style={{ margin: 0, color: '#00ccff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Code size={18} /> Underwriter JSON Payload
              </h4>
              <button 
                onClick={copyPayload}
                style={{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}
              >
                {copied ? <><Check size={14} color="#00ccff" /> Copied</> : <><Copy size={14} /> Copy JSON</>}
              </button>
            </div>
            <pre style={{ 
              background: '#000', 
              padding: '1.5rem', 
              borderRadius: '12px', 
              fontSize: '0.8rem', 
              color: '#00ccff', 
              overflowX: 'auto',
              border: '1px solid #111',
              fontFamily: 'monospace'
            }}>
              {JSON.stringify({ policy, riskReport: report }, null, 2)}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ textAlign: 'center', marginTop: '5rem', display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="btn-secondary" style={{ padding: '18px 45px', borderRadius: '40px', display: 'flex', alignItems: 'center', gap: '10px' }} onClick={reset}>
          <RotateCcw size={18} /> Analyze New Policy
        </button>
        <button 
          className="btn-primary" 
          style={{ padding: '18px 65px', borderRadius: '40px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }} 
          onClick={handleExport}
          disabled={isExporting}
        >
          {isExporting ? <><FileText className="animate-pulse" /> Generating...</> : <><Shield size={18} color="black" /> Export Secure Report</>}
        </button>
      </div>
    </motion.div>
  );
}

interface SummaryItem {
  label: string;
  value: string;
  highlight?: boolean;
}

interface SummaryCardProps {
  icon: React.ReactNode;
  title: string;
  items: SummaryItem[];
}

function SummaryCard({ icon, title, items }: SummaryCardProps) {
  return (
    <div style={{ background: '#080808', padding: '2rem', borderRadius: '24px', border: '1px solid #111', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
        {icon}
        <h5 style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '0.8rem', color: '#666' }}>{title}</h5>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ color: '#555', fontSize: '0.9rem' }}>{item.label}</span>
            <span style={{ 
              fontWeight: '800', 
              color: item.highlight ? 'var(--color-gold)' : '#eee', 
              fontSize: item.highlight ? '1.5rem' : '1rem',
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '-0.02em'
            }}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RiskSimulator({ policy }: { policy: Policy }) {
  const { updateCoverages } = useRiskStore();

  const handleSlider = (key: string, value: number) => {
    updateCoverages({ [key]: value });
  };

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      style={{ overflow: 'hidden', marginTop: '2rem', background: '#050505', border: '1px solid #222', borderRadius: '24px', padding: '3rem' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <h4 style={{ margin: 0, color: 'var(--color-gold)', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.5rem' }}>
          <Play size={22} fill="currentColor" /> Catastrophic Loss Simulator
        </h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(212, 175, 55, 0.1)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', color: 'var(--color-gold)', fontWeight: 'bold' }}>
          <div className="pulse" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-gold)' }} />
          LIVE CALIBRATION ACTIVE
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
        <SimulatorControl 
          label="Bodily Injury (Per Person)"
          value={policy.coverages.bodilyInjuryPerPerson}
          min={30000}
          max={500000}
          step={5000}
          onChange={(v: number) => handleSlider('bodilyInjuryPerPerson', v)}
        />
        <SimulatorControl 
          label="Bodily Injury (Per Accident)"
          value={policy.coverages.bodilyInjuryPerAccident}
          min={60000}
          max={1000000}
          step={10000}
          onChange={(v: number) => handleSlider('bodilyInjuryPerAccident', v)}
        />
        <SimulatorControl 
          label="Property Damage"
          value={policy.coverages.propertyDamage}
          min={25000}
          max={250000}
          step={5000}
          onChange={(v: number) => handleSlider('propertyDamage', v)}
        />
      </div>
    </motion.div>
  );
}

interface SimulatorControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}

function SimulatorControl({ label, value, min, max, step, onChange }: SimulatorControlProps) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <label style={{ fontSize: '0.8rem', color: '#888' }}>{label}</label>
        <span style={{ color: 'white', fontWeight: 'bold' }}>${value.toLocaleString()}</span>
      </div>
      <input 
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        style={{
          width: '100%',
          accentColor: 'var(--color-gold)',
          height: '4px',
          background: '#222',
          borderRadius: '2px',
          cursor: 'pointer'
        }}
      />
    </div>
  );
}

interface ComparisonChartProps {
  label: string;
  current: number;
  recommended: number;
  max: number;
  description: string;
}

function ComparisonChart({ label, current, recommended, max, description }: ComparisonChartProps) {
  const currentWidth = Math.min(100, (current / max) * 100);
  const recommendedWidth = Math.min(100, (recommended / max) * 100);
  const isDangerous = current < recommended;

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', fontSize: '0.8rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        <span>{label}</span>
      </div>
      
      {/* Cinematic Bar */}
      <div style={{ height: '60px', width: '100%', background: '#050505', borderRadius: '8px', position: 'relative', overflow: 'hidden', border: '1px solid #111' }}>
        {/* Recommended Area (Target) */}
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${recommendedWidth}%` }}
          transition={{ duration: 1, delay: 0.2 }}
          style={{ height: '100%', background: 'rgba(212, 175, 55, 0.08)', position: 'absolute', top: 0, left: 0, borderRight: '1px dashed rgba(212, 175, 55, 0.5)' }} 
        />
        {/* Current Coverage Bar */}
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${currentWidth}%` }}
          transition={{ duration: 1, delay: 0.5 }}
          style={{ 
            height: '100%', 
            background: isDangerous ? 'linear-gradient(90deg, #222 0%, #444 100%)' : 'linear-gradient(90deg, #111 0%, var(--color-gold) 100%)', 
            position: 'absolute', 
            top: 0,
            left: 0,
            display: 'flex',
            alignItems: 'center',
            paddingLeft: '1.5rem',
            overflow: 'hidden'
          }}
        >
          <span style={{ color: isDangerous ? '#666' : 'black', fontSize: '0.9rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
            ${current.toLocaleString()}
          </span>
        </motion.div>
      </div>
      <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#444', lineHeight: 1.5 }}>{description}</p>
    </div>
  );
}
