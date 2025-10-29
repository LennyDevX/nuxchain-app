import TimeCounter from '../components/airdrops/TimeCounter';
import AirdropForm from '../components/forms/AirdropForm';
import Statistics from '../components/airdrops/AirdropStatics';
import HeroSection from '../components/airdrops/HeroSection';

function Airdrops() {

  return (
      <div className="min-h-screen text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Statistics Section */}
          <Statistics />

          {/* Hero Section */}
          <HeroSection />

          {/* Registration and Counter Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Time Counter on the left */}
            <TimeCounter />

            {/* Registration Form on the right */}
            <AirdropForm />
          </div>

          
        </div>
      </div>
  );
}


export default Airdrops;