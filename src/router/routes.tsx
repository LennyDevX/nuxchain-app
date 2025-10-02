import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Staking from '../pages/Staking';
import NFTs from '../pages/NFTs';
import Marketplace from '../pages/Marketplace';
import Airdrops from '../pages/Airdrops';
import Chat from '../pages/Chat';
import Tokenization from '../pages/Tokenization';
import Labs from '../pages/Labs';

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
    </Routes>
  );
}

export default AppRoutes;