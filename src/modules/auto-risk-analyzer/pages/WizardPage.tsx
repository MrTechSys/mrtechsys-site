import { useRiskStore } from '../store/useRiskStore';
import WizardShell from '../components/WizardShell';
import Step1_Welcome from '../components/Step1_Welcome';
import Step2_PolicyInput from '../components/Step2_PolicyInput';
import Step3_VehiclesDrivers from '../components/Step3_VehiclesDrivers';
import Step4_Coverages from '../components/Step4_Coverages';
import Step5_Review from '../components/Step5_Review';
import Step6_Results from '../components/Step6_Results';
import Step_Financial from '../components/Step_Financial'; // To be created

export default function WizardPage() {
  const { currentStep } = useRiskStore();

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <Step1_Welcome />;
      case 2: return <Step_Financial />; // Financial Questionnaire first for recommendation baseline
      case 3: return <Step2_PolicyInput />;
      case 4: return <Step3_VehiclesDrivers />;
      case 5: return <Step4_Coverages />;
      case 6: return <Step5_Review />;
      case 7: return <Step6_Results />;
      default: return <Step1_Welcome />;
    }
  };

  return (
    <WizardShell>
      {renderStep()}
    </WizardShell>
  );
}
