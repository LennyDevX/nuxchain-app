import GlobalBackground from '../ui/gradientBackground';
import TimeCounter from '../components/airdrops/TimeCounter';
import AirdropForm from '../components/airdrops/AirdropForm';
import Statistics from '../components/airdrops/AirdropStatics';
import HeroSection from '../components/airdrops/HeroSection';

function Airdrops() {

  return (
    <GlobalBackground>
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

          {/* How Airdrops Work Section */}
          <div className="card-unified p-8">
            <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-8">
              How Do NFT Airdrops Work?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-purple-400">Discover</h3>
                <p className="text-gray-300">Explore our list of active and upcoming NFT airdrops with verified projects.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-pink-400">Participate</h3>
                <p className="text-gray-300">Complete specific requirements for each airdrop, such as registering and connecting your wallet.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-blue-400">Receive</h3>
                <p className="text-gray-300">If selected, your NFTs will be sent directly to your connected wallet address.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GlobalBackground>
  );
}

export default Airdrops;