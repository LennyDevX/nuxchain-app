import { BrowserRouter as Router } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { POLPriceProvider } from './context/POLPriceContext'
import { NetworkProvider } from './context/NetworkContext'
import { AdminAuthProvider } from './context/AdminAuthContext'
import { useScrollToTop } from './hooks/navigation/useScrollToTop'
import Navbar from './components/layout/Navbar'
import MobileBottomNavbar from './components/layout/MobileBottomNavbar'
import GlobalBackground from './ui/gradientBackground'
import AppRoutes from './router/routes'
import NetworkAlert from './components/web3/NetworkAlert'

/**
 * Inner component para que useScrollToTop funcione dentro del Router
 */
function AppContent() {
  useScrollToTop(); // ✅ Se ejecuta automáticamente en cada cambio de ruta

  return (
    <GlobalBackground>
      <NetworkAlert />
      <Navbar />
      <AppRoutes />
      <MobileBottomNavbar />
      <Toaster
        position="top-center"
        containerStyle={{
          top: 16,
          left: 16,
          right: 16,
          maxWidth: '420px',
          margin: '0 auto',
        }}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1f2937',
            color: '#fff',
            border: '1px solid #374151',
            maxWidth: '100%',
            wordBreak: 'break-word',
          },
          success: {
            duration: 4000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
          loading: {
            duration: Infinity,
          },
        }}
      />
    </GlobalBackground>
  );
}

function App() {
  return (
    <POLPriceProvider>
      <NetworkProvider>
        <AdminAuthProvider>
          <Router>
            <AppContent />
          </Router>
        </AdminAuthProvider>
      </NetworkProvider>
    </POLPriceProvider>
  )
}

export default App
