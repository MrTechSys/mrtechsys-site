import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, Zap, Target, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-root" style={{ background: 'var(--color-black)', minHeight: '100vh', color: 'white', overflowX: 'hidden' }}>
      {/* Cinematic Background Grid */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: 'linear-gradient(rgba(212, 175, 55, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(212, 175, 55, 0.03) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
        zIndex: 0
      }} />

      {/* Hero Section */}
      <main className="container" style={{ position: 'relative', zIndex: 1, paddingTop: '10vh', paddingBottom: '10vh' }}>
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', background: 'var(--color-gold)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(212, 175, 55, 0.4)' }}>
              <Shield color="black" size={24} />
            </div>
            <span style={{ fontWeight: 'bold', letterSpacing: '0.2em', fontSize: '1.2rem' }}>MRTECHSYS <span className="text-gold">INTEL</span></span>
          </div>
          <button className="btn-secondary" style={{ padding: '10px 25px', borderRadius: '30px', fontSize: '0.8rem' }}>CLIENT LOGIN</button>
        </nav>

        <div style={{ maxWidth: '900px' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div style={{ color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '0.5em', fontSize: '0.8rem', marginBottom: '2rem' }}>
              Sovereign Risk Assessment
            </div>
            <h1 style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', lineHeight: 0.9, marginBottom: '3rem', fontWeight: 800 }}>
              Defend Your <span className="text-gold">Assets.</span> <br />
              Expose Your <span style={{ color: 'transparent', WebkitTextStroke: '1px rgba(255,255,255,0.3)' }}>Gaps.</span>
            </h1>
            <p className="text-grey" style={{ fontSize: '1.25rem', maxWidth: '600px', lineHeight: 1.6, marginBottom: '4rem' }}>
              Professional-grade insurance risk analysis. Using local AI intelligence to audit your coverage against state laws and financial exposure.
            </p>

            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
              <button 
                className="btn-primary" 
                style={{ padding: '22px 50px', borderRadius: '50px', fontSize: '1.1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '15px' }}
                onClick={() => navigate('app')}
              >
                Begin Intelligence Audit <ArrowRight size={20} />
              </button>
              <div style={{ fontSize: '0.9rem', color: '#444', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-success)', boxShadow: '0 0 10px var(--color-success)' }} />
                LOCAL AI CORE ACTIVE
              </div>
            </div>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div style={{ marginTop: '12rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
          <FeatureCard 
            icon={<Zap className="text-gold" />}
            title="Instant OCR Audit"
            description="Upload your policy declaration page. Our local engine extracts limits with 99.2% accuracy."
          />
          <FeatureCard 
            icon={<Target className="text-gold" />}
            title="Asset Alignment"
            description="We calculate coverage requirements based on your actual net worth and home ownership status."
          />
          <FeatureCard 
            icon={<Shield className="text-gold" />}
            title="State Compliance"
            description="Real-time verification against specific state liability minimums and PIP requirements."
          />
        </div>
      </main>

      {/* Footer Branding */}
      <footer style={{ borderTop: '1px solid #111', padding: '4rem 0', marginTop: '10vh' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', color: '#333', fontSize: '0.8rem' }}>
          <div>© 2026 MRTECHSYS SOVEREIGN INTELLIGENCE</div>
          <div style={{ letterSpacing: '0.2em' }}>ENCRYPTED END-TO-END</div>
        </div>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      style={{ background: '#080808', padding: '3rem', borderRadius: '24px', border: '1px solid #111' }}
    >
      <div style={{ marginBottom: '1.5rem' }}>{icon}</div>
      <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>{title}</h3>
      <p className="text-grey" style={{ lineHeight: 1.6, fontSize: '0.95rem' }}>{description}</p>
    </motion.div>
  );
}
