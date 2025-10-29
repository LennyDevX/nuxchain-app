import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import LoadingSpinner from '../ui/LoadingSpinner';

// ✅ React 19 Best Practice: Lazy load all routes except critical Home page
// Home page loaded eagerly for optimal FCP (First Contentful Paint)
import Home from '../pages/Home';

// Lazy-loaded pages - code splitting for better performance
// ⚡ OPTIMIZATION: Preload critical pages (NFTs, Marketplace, Profile)
const Staking = lazy(() => import('../pages/Staking'));
const NFTs = lazy(() => import('../pages/NFTs'));
const Marketplace = lazy(() => import('../pages/Marketplace'));
const Airdrops = lazy(() => import('../pages/Airdrops'));
const Chat = lazy(() => import('../pages/Chat'));
const Tokenization = lazy(() => import('../pages/Tokenization'));
const Labs = lazy(() => import('../pages/Labs'));
const Profile = lazy(() => import('../pages/Profile'));
const Blog = lazy(() => import('../pages/Blog'));
const CTAHub = lazy(() => import('../pages/DevHub'));
const Roadmap = lazy(() => import('../pages/Roadmap'));

function AppRoutes() {
  // ⚡ Preload critical pages after initial render (low priority)
  useEffect(() => {
    // Wait 2 seconds after initial load, then preload most visited pages
    const preloadTimer = setTimeout(() => {
      // Preload in order of importance
      import('../pages/Marketplace'); // Most visited
      import('../pages/NFTs'); // Second most visited
      import('../pages/Profile'); // Common after connecting wallet
    }, 2000);

    return () => clearTimeout(preloadTimer);
  }, []);

  return (
    <Suspense fallback={<LoadingSpinner />}>
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
    </Suspense>
  );
}

export default AppRoutes;