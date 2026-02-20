import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import LoadingSpinner from '../ui/LoadingSpinner';

// ✅ React 19 Best Practice: Lazy load all routes except critical Home page
// Home page loaded eagerly for optimal FCP (First Contentful Paint)
import Home from '../pages/Home';

// 🚀 Lazy-loaded pages with optimized code splitting
const Staking = lazy(() => import(/* webpackChunkName: "staking" */ '../pages/Staking'));
const NFTs = lazy(() => import(/* webpackChunkName: "nfts" */ '../pages/NFTs'));
const Marketplace = lazy(() => import(/* webpackChunkName: "marketplace" */ '../pages/Marketplace'));
const Chat = lazy(() => import(/* webpackChunkName: "chat" */ '../pages/Chat'));
const Tokenization = lazy(() => import(/* webpackChunkName: "tokenization" */ '../pages/Tokenization'));
const Labs = lazy(() => import(/* webpackChunkName: "labs" */ '../pages/Labs'));
const PriceFeed = lazy(() => import(/* webpackChunkName: "price-feed" */ '../pages/PriceFeed'));
const Profile = lazy(() => import(/* webpackChunkName: "profile" */ '../pages/Profile'));
const Blog = lazy(() => import(/* webpackChunkName: "blog" */ '../pages/Blog'));
const CTAHub = lazy(() => import(/* webpackChunkName: "devhub" */ '../pages/DevHub'));
const Roadmap = lazy(() => import(/* webpackChunkName: "roadmap" */ '../pages/Roadmap'));
const Skills = lazy(() => import(/* webpackChunkName: "skills" */ '../pages/Skills'));
const Store = lazy(() => import(/* webpackChunkName: "store" */ '../pages/store'));
const Market = lazy(() => import(/* webpackChunkName: "market" */ '../pages/Market'));
const Airdrop = lazy(() => import(/* webpackChunkName: "airdrop" */ '../pages/AirdropMaintenance'));
const Tutorial = lazy(() => import(/* webpackChunkName: "tutorial" */ '../pages/Tutorial'));
const Tokenomics = lazy(() => import(/* webpackChunkName: "tokenomics" */ '../pages/TokenomicsMaintenance'));
const ColabPortal = lazy(() => import(/* webpackChunkName: "colab" */ '../pages/ColabPortal'));
const Admin = lazy(() => import(/* webpackChunkName: "admin" */ '../pages/Admin'));
const AdminLogin = lazy(() => import(/* webpackChunkName: "admin-login" */ '../pages/AdminLogin'));

function AppRoutes() {
  // ⚡ Smart preloading: Only preload on fast connections and after idle
  useEffect(() => {
    // Check connection speed using Network Information API
    const connection = (navigator as Navigator & { connection?: { effectiveType?: string } }).connection;
    const isSlowConnection = connection?.effectiveType === '2g' || connection?.effectiveType === 'slow-2g';

    if (isSlowConnection) {
      console.log('⚠️ [Performance] Slow connection detected, skipping preload');
      return;
    }

    // Use requestIdleCallback for non-blocking preload
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        // Preload critical pages after 2 seconds
        const preloadTimer = setTimeout(() => {
          console.log('🚀 [Performance] Starting smart preload');
          import('../pages/Marketplace');
          setTimeout(() => import('../pages/NFTs'), 1000);
          setTimeout(() => import('../pages/Profile'), 2000);
        }, 2000);

        return () => clearTimeout(preloadTimer);
      });
    }
  }, []);

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/staking" element={<Staking />} />
        <Route path="/nfts" element={<NFTs />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/create-my-nfts" element={<Tokenization />} />
        <Route path="/tokenization" element={<Tokenization />} />
        <Route path="/labs" element={<Labs />} />
        <Route path="/labs/price-feed" element={<PriceFeed />} />
        <Route path="/skills" element={<Skills />} />
        <Route path="/store" element={<Store />} />
        <Route path="/roadmap" element={<Roadmap />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/dev-hub" element={<CTAHub />} />
        <Route path="/market" element={<Market />} />
        <Route path="/airdrop" element={<Airdrop />} />
        <Route path="/tutorial" element={<Tutorial />} />
        <Route path="/tokenomics" element={<Tokenomics />} />
        <Route path="/colab" element={<ColabPortal />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<Admin />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/profile/*" element={<Profile />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;