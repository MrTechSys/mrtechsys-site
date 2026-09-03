import React, { useRef } from 'react';
import { useRiskStore } from '../store/useRiskStore';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { 
  TrendingUp, 
  ShieldCheck, 
  Coins, 
  Activity, 
  Briefcase, 
  Users, 
  Car,
  Info,
  ChevronRight,
  ChevronLeft,
  ArrowDown,
  LayoutDashboard
} from 'lucide-react';
import type { FinancialData } from '../types';

export default function Step_Financial() {
  const { policy, updateFinancials, nextStep, prevStep } = useRiskStore();
  const financials = policy.financials || {} as FinancialData;

  const handleUpdate = (updates: Partial<FinancialData>) => {
    updateFinancials(updates);
  };

  return (
    <div className="relative bg-black text-white selection:bg-gold selection:text-black">
      {/* 1. Intro Section */}
      <ParallaxSection id="intro">
        <div className="max-w-4xl mx-auto text-center space-y-10 px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <div className="w-24 h-24 rounded-3xl bg-gold/10 flex items-center justify-center mx-auto mb-8 border border-gold/20 shadow-[0_0_30px_rgba(212,175,55,0.1)]">
              <ShieldCheck className="text-gold" size={48} strokeWidth={1.5} />
            </div>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 uppercase leading-[0.9]">
              Financial <br/><span className="text-gold">Readiness</span>
            </h1>
            <p className="text-xl md:text-2xl text-neutral-400 leading-relaxed max-w-2xl mx-auto font-medium">
              We measure how well your insurance coverage aligns with your actual economic life. 
              Protecting your future starts with understanding your current exposure.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="pt-16"
          >
            <div className="flex flex-col items-center gap-4 text-neutral-600">
              <span className="text-xs tracking-[0.5em] uppercase font-bold">Scroll to Begin Audit</span>
              <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <ArrowDown size={24} />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </ParallaxSection>

      {/* 2. Income, Cash Flow, and Stability */}
      <ParallaxSection id="income">
        <ContentBlock 
          icon={<TrendingUp size={48} />}
          title="Income & Stability"
          description="Insurers evaluate your monthly cash flow to determine how much financial shock you can absorb. Stable income allows for higher deductibles, while variable income suggests a need for lower out-of-pocket costs."
        >
          <div className="space-y-16 w-full max-w-2xl mx-auto">
            <div className="space-y-6">
              <label className="block text-center text-sm tracking-[0.4em] uppercase text-gold font-black">Average Monthly Income</label>
              <div className="relative max-w-md mx-auto">
                <span className="absolute left-0 bottom-4 text-4xl font-black text-neutral-700">$</span>
                <input 
                  type="number" 
                  className="w-full bg-transparent border-b-4 border-neutral-900 text-center text-6xl py-4 focus:border-gold outline-none transition-all font-black"
                  placeholder="0,000"
                  value={financials.monthlyIncome || ''}
                  onChange={(e) => handleUpdate({ monthlyIncome: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="space-y-6">
              <label className="block text-center text-sm tracking-[0.4em] uppercase text-neutral-500 font-black">Stability Profile</label>
              <div className="flex flex-wrap justify-center gap-4">
                {['stable', 'variable', 'unstable'].map(type => (
                  <button
                    key={type}
                    onClick={() => handleUpdate({ incomeStability: type as any })}
                    className={`px-10 py-4 rounded-2xl border-2 transition-all font-black uppercase text-sm tracking-widest ${financials.incomeStability === type ? 'border-gold bg-gold text-black shadow-[0_0_30px_rgba(212,175,55,0.3)]' : 'border-neutral-900 hover:border-neutral-700 text-neutral-500'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </ContentBlock>
      </ParallaxSection>

      {/* 3. Assets, Savings, and Net Worth */}
      <ParallaxSection id="assets">
        <ContentBlock 
          icon={<Coins size={48} />}
          title="Assets & Net Worth"
          description="Your liability limits should scale with your assets. Higher net worth creates a larger target for litigation, requiring advanced protection layers to prevent total asset loss."
        >
          <div className="space-y-16 w-full max-w-2xl mx-auto">
            <div className="space-y-8">
              <label className="block text-center text-sm tracking-[0.4em] uppercase text-gold font-black">Real Estate Ownership</label>
              <div className="flex justify-center gap-8">
                <button 
                  className={`flex-1 py-10 rounded-[40px] border-2 text-3xl font-black transition-all ${financials.homeOwner ? 'border-gold bg-gold text-black shadow-[0_20px_50px_rgba(212,175,55,0.3)]' : 'border-neutral-900 bg-neutral-950 text-neutral-700 hover:border-neutral-800'}`}
                  onClick={() => handleUpdate({ homeOwner: true })}
                >OWNER</button>
                <button 
                  className={`flex-1 py-10 rounded-[40px] border-2 text-3xl font-black transition-all ${financials.homeOwner === false ? 'border-gold bg-gold text-black shadow-[0_20px_50px_rgba(212,175,55,0.3)]' : 'border-neutral-900 bg-neutral-950 text-neutral-700 hover:border-neutral-800'}`}
                  onClick={() => handleUpdate({ homeOwner: false })}
                >RENTER</button>
              </div>
            </div>
            <div className="space-y-8">
              <label className="block text-center text-sm tracking-[0.4em] uppercase text-neutral-500 font-black">Total Asset Liquidity</label>
              <div className="relative">
                <select 
                  className="w-full bg-neutral-950 border-2 border-neutral-900 rounded-3xl text-center text-2xl py-8 px-10 focus:border-gold outline-none transition-all font-black appearance-none"
                  value={financials.annualIncomeRange || ''}
                  onChange={(e) => handleUpdate({ annualIncomeRange: e.target.value as any })}
                >
                  <option value="" className="bg-black">Select Asset Tier</option>
                  <option value="<50k" className="bg-black">Under $50,000</option>
                  <option value="50k-100k" className="bg-black">$50,000 - $250,000</option>
                  <option value="100k-250k" className="bg-black">$250,000 - $1,000,000</option>
                  <option value="250k+" className="bg-black">$1,000,000+</option>
                </select>
                <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-700">
                  <ChevronRight size={32} className="rotate-90" />
                </div>
              </div>
            </div>
          </div>
        </ContentBlock>
      </ParallaxSection>

      {/* 4. Existing Insurance Protections */}
      <ParallaxSection id="protections">
        <ContentBlock 
          icon={<LayoutDashboard size={48} />}
          title="Integrated Protections"
          description="Do you have other insurance policies (life, disability, property, health)? Identifying gaps across your entire portfolio ensures that your auto policy isn't an isolated vulnerability."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl mx-auto">
            <ParallaxToggleButton 
              label="Life Insurance" 
              active={financials.hasLifeInsurance}
              onClick={() => handleUpdate({ hasLifeInsurance: !financials.hasLifeInsurance })}
            />
            <ParallaxToggleButton 
              label="Umbrella Policy" 
              active={financials.hasUmbrellaPolicy}
              onClick={() => handleUpdate({ hasUmbrellaPolicy: !financials.hasUmbrellaPolicy })}
            />
          </div>
        </ContentBlock>
      </ParallaxSection>

      {/* 5. Debt & Obligations */}
      <ParallaxSection id="debt">
        <ContentBlock 
          icon={<Briefcase size={48} />}
          title="Debt & Obligations"
          description="Outstanding loans and monthly obligations show your vulnerability to unexpected expenses. High debt-to-income ratios suggest a need for lower deductibles to avoid additional strain."
        >
          <div className="space-y-10 w-full max-w-2xl mx-auto text-center">
            <label className="block text-sm tracking-[0.4em] uppercase text-gold font-black">Total Monthly Debt Payments</label>
            <div className="relative max-w-md mx-auto">
              <span className="absolute left-0 bottom-4 text-4xl font-black text-neutral-700">$</span>
              <input 
                type="number" 
                className="w-full bg-transparent border-b-4 border-neutral-900 text-center text-6xl py-4 focus:border-gold outline-none transition-all font-black"
                placeholder="0,000"
                value={financials.monthlyDebtPayments || ''}
                onChange={(e) => handleUpdate({ monthlyDebtPayments: Number(e.target.value) })}
              />
            </div>
            <p className="text-neutral-500 text-lg font-medium max-w-md mx-auto">
              Include mortgage, student loans, and significant personal credit lines.
            </p>
          </div>
        </ContentBlock>
      </ParallaxSection>

      {/* 6. Risk Tolerance */}
      <ParallaxSection id="tolerance">
        <ContentBlock 
          icon={<Activity size={48} />}
          title="Risk Philosophy"
          description="How comfortable are you with higher deductibles to reduce premiums? Would you prefer to pay more monthly to avoid large unexpected expenses?"
        >
          <div className="grid grid-cols-1 gap-6 w-full max-w-3xl mx-auto">
            {['conservative', 'balanced', 'aggressive'].map(level => (
              <button
                key={level}
                onClick={() => handleUpdate({ riskTolerance: level as any })}
                className={`group p-10 rounded-[40px] border-2 transition-all flex items-center justify-between text-left ${financials.riskTolerance === level ? 'border-gold bg-gold/5 shadow-[0_0_40px_rgba(212,175,55,0.1)]' : 'border-neutral-900 bg-neutral-950/50 hover:border-neutral-800'}`}
              >
                <div className="space-y-2">
                  <div className={`text-3xl font-black uppercase tracking-tighter ${financials.riskTolerance === level ? 'text-gold' : 'text-neutral-400 group-hover:text-white'}`}>{level}</div>
                  <div className="text-neutral-500 text-base md:text-lg leading-snug">
                    {level === 'conservative' && 'Prioritize total insulation with minimal out-of-pocket exposure.'}
                    {level === 'balanced' && 'A strategic mix of competitive premiums and secure coverage.'}
                    {level === 'aggressive' && 'Maximize monthly savings by accepting higher claim risk.'}
                  </div>
                </div>
                <div className={`w-14 h-14 rounded-full border-4 flex items-center justify-center transition-all flex-shrink-0 ml-6 ${financials.riskTolerance === level ? 'border-gold bg-gold shadow-[0_0_30px_rgba(212,175,55,0.5)]' : 'border-neutral-800'}`}>
                  {financials.riskTolerance === level && <div className="w-4 h-4 rounded-full bg-black" />}
                </div>
              </button>
            ))}
          </div>
        </ContentBlock>
      </ParallaxSection>

      {/* 7. Life Stage & Dependents */}
      <ParallaxSection id="life">
        <ContentBlock 
          icon={<Users size={48} />}
          title="Life Stage & Dependents"
          description="Are you planning major life changes? Marriage, children, or a home purchase? These responsibilities change your liability needs and umbrella suitability."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 w-full max-w-3xl mx-auto">
            <div className="space-y-6 text-center">
              <label className="block text-sm tracking-[0.4em] uppercase text-gold font-black">Dependents</label>
              <input 
                type="number" 
                className="w-full bg-transparent border-b-4 border-neutral-900 text-center text-7xl py-4 focus:border-gold outline-none transition-all font-black"
                value={financials.dependents || 0}
                onChange={(e) => handleUpdate({ dependents: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-6 text-center">
              <label className="block text-sm tracking-[0.4em] uppercase text-gold font-black">Current Life Stage</label>
              <div className="relative">
                <select 
                  className="w-full bg-neutral-950 border-2 border-neutral-900 rounded-3xl text-center text-2xl py-8 px-10 focus:border-gold outline-none transition-all font-black appearance-none"
                  value={financials.lifeStage || ''}
                  onChange={(e) => handleUpdate({ lifeStage: e.target.value as any })}
                >
                  <option value="" className="bg-black">Select Stage</option>
                  <option value="single" className="bg-black">Single</option>
                  <option value="newlywed" className="bg-black">Newlywed</option>
                  <option value="family" className="bg-black">Family</option>
                  <option value="retired" className="bg-black">Retired</option>
                </select>
                <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-700">
                  <ChevronRight size={32} className="rotate-90" />
                </div>
              </div>
            </div>
          </div>
        </ContentBlock>
      </ParallaxSection>

      {/* 8. Driving Behavior & Exposure */}
      <ParallaxSection id="driving">
        <ContentBlock 
          icon={<Car size={48} />}
          title="Driving Exposure"
          description="How many miles do you drive per year? Do you frequently commute in high-traffic areas or use your vehicle for business? Exposure directly affects your recommended limits."
        >
          <div className="space-y-12 w-full max-w-2xl mx-auto text-center">
            <div className="space-y-6">
              <label className="block text-sm tracking-[0.4em] uppercase text-gold font-black">Estimated Annual Mileage</label>
              <div className="relative max-w-md mx-auto">
                <input 
                  type="number" 
                  className="w-full bg-transparent border-b-4 border-neutral-900 text-center text-6xl py-4 focus:border-gold outline-none transition-all font-black"
                  placeholder="12,000"
                  onChange={(e) => {/* Custom logic if mileage needed in store */}}
                />
                <span className="absolute right-0 bottom-4 text-xl font-black text-neutral-700 uppercase tracking-widest">Miles</span>
              </div>
            </div>
            <div className="p-8 rounded-[32px] bg-neutral-950 border border-neutral-900">
              <p className="text-neutral-500 text-lg leading-relaxed italic">
                "High-frequency highway exposure in Texas increases statistical risk by up to 40%."
              </p>
            </div>
          </div>
        </ContentBlock>
      </ParallaxSection>

      {/* 9. Summary / Final Action */}
      <ParallaxSection id="summary">
        <div className="max-w-4xl mx-auto text-center space-y-12 px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="w-24 h-24 rounded-[32px] bg-gold/10 flex items-center justify-center mx-auto mb-10 border border-gold/20 shadow-[0_0_50px_rgba(212,175,55,0.15)]">
              <Info className="text-gold" size={48} />
            </div>
            <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-10">
              Audit <br/><span className="text-gold">Validated</span>
            </h2>
            <div className="space-y-8 text-xl md:text-2xl text-neutral-400 leading-relaxed max-w-2xl mx-auto font-medium">
              <p>Financial-readiness data helps us identify under-insurance and suggest personalized deductible levels that match your specific risk profile.</p>
              <p className="text-xs tracking-[0.6em] text-neutral-700 uppercase font-black">Expose Your Gaps. Defend Your Assets.</p>
            </div>
          </motion.div>

          <div className="flex flex-col md:flex-row gap-8 justify-center pt-16">
            <button 
              onClick={prevStep}
              className="px-14 py-6 rounded-full font-black border-2 border-neutral-900 text-neutral-600 hover:text-white hover:border-neutral-700 transition-all flex items-center justify-center gap-4 text-sm tracking-widest"
            >
              <ChevronLeft size={20} /> REVIEW VEHICLES
            </button>
            <button 
              onClick={nextStep}
              className="bg-gold hover:bg-gold/80 text-black px-24 py-7 rounded-full font-black text-2xl transition-all shadow-[0_30px_60px_rgba(212,175,55,0.3)] flex items-center justify-center gap-4 active:scale-95"
            >
              GENERATE AUDIT <ChevronRight size={32} />
            </button>
          </div>
        </div>
      </ParallaxSection>
    </div>
  );
}

function ParallaxSection({ children, id }: { children: React.ReactNode, id: string }) {
  return (
    <motion.section 
      id={id}
      className="min-h-screen flex items-center justify-center relative py-40 overflow-hidden"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ margin: "-10%" }}
      transition={{ duration: 1 }}
    >
      {/* Cinematic Gradient Background per Section */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(42,13,13,0.4)_0%,transparent_70%)] pointer-events-none" />
      <div className="relative z-10 w-full">
        {children}
      </div>
    </motion.section>
  );
}

function ContentBlock({ icon, title, description, children }: { icon: React.ReactNode, title: string, description: string, children: React.ReactNode }) {
  return (
    <div className="max-w-5xl mx-auto px-6 text-center space-y-16">
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="space-y-8"
      >
        <div className="text-gold flex justify-center drop-shadow-[0_0_20px_rgba(212,175,55,0.3)]">
          {icon}
        </div>
        <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white leading-tight">
          {title}
        </h2>
        <p className="text-xl md:text-2xl text-neutral-400 max-w-3xl mx-auto leading-relaxed font-medium">
          {description}
        </p>
      </motion.div>
      
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="pt-10"
      >
        {children}
      </motion.div>
    </div>
  );
}

function ParallaxToggleButton({ label, active, onClick }: { label: string, active?: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`p-16 rounded-[60px] border-4 transition-all flex flex-col items-center gap-6 group ${active ? 'border-gold bg-gold text-black shadow-[0_20px_60px_rgba(212,175,55,0.2)]' : 'border-neutral-900 bg-neutral-950 text-neutral-600 hover:border-neutral-800'}`}
    >
      <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all ${active ? 'border-black bg-black' : 'border-neutral-800 group-hover:border-neutral-700'}`}>
        {active && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-4 h-4 rounded-full bg-gold" />}
      </div>
      <span className="text-2xl font-black uppercase tracking-tighter">{label}</span>
    </button>
  );
}
