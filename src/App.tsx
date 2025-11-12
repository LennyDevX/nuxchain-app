import { BrowserRouter as Router } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { POLPriceProvider } from './context/POLPriceContext'
import Navbar from './components/layout/Navbar'
import MobileBottomNavbar from './components/layout/MobileBottomNavbar'
import GlobalBackground from './ui/gradientBackground'
import AppRoutes from './router/routes'

function App() {
  return (
    <POLPriceProvider>
      <Router>
        <GlobalBackground>
          <Navbar />
          <AppRoutes />
          <MobileBottomNavbar />
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1f2937',
                color: '#fff',
                border: '1px solid #374151',
              },
              success: {
                duration: 3000,
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
            }}
          />
        </GlobalBackground>
      </Router>
    </POLPriceProvider>
  )
}

export default App
