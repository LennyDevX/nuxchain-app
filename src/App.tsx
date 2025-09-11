import { BrowserRouter as Router } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import MobileBottomNavbar from './components/layout/MobileBottomNavbar'
import GlobalBackground from './ui/gradientBackground'
import AppRoutes from './router/routes'

function App() {
  return (
    <Router>
      <GlobalBackground>
        <Navbar />
        <AppRoutes />
        <MobileBottomNavbar />
      </GlobalBackground>
    </Router>
  )
}

export default App
