import React from 'react';
import Hero from '../components/Hero';
import WhyMrTechSys from '../components/WhyMrTechSys';
import FlipEngineTeaser from '../components/FlipEngineTeaser';
import VerticalFabric from '../components/VerticalFabric';
import OriginMission from '../components/OriginMission';

const Home = () => {
  return (
    <div className="w-full">
      <Hero />
      <WhyMrTechSys />
      <FlipEngineTeaser />
      <VerticalFabric />
      <OriginMission />
    </div>
  );
};

export default Home;
