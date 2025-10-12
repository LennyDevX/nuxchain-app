import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Staking from '../pages/Staking';
import NFTs from '../pages/NFTs';
import Marketplace from '../pages/Marketplace';
import Airdrops from '../pages/Airdrops';
import Chat from '../pages/Chat';
import Tokenization from '../pages/Tokenization';
import Labs from '../pages/Labs';
import Profile from '../pages/Profile';
import Blog from '../pages/Blog';
import CTAHub from '../pages/CTAHub';
import Roadmap from '../pages/Roadmap';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/staking" element={<Staking />} />
      <Route path="/nfts" element={<NFTs />} />
      <Route path="/marketplace" element={<Marketplace />} />
      <Route path="/airdrops" element={<Airdrops />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/create-my-nfts" element={<Tokenization />} />
      <Route path="/tokenization" element={<Tokenization />} />
      <Route path="/labs" element={<Labs />} />
      <Route path="/roadmap" element={<Roadmap />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/dev-hub" element={<CTAHub />} />
      <Route path="/profile/*" element={<Profile />} />
    </Routes>
  );
}

export default AppRoutes;