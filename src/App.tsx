import { BrowserRouter as Router } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import GlobalBackground from './ui/gradientBackground'
import AppRoutes from './router/routes'

function App() {
  return (
    <Router>
      <GlobalBackground>
        <Navbar />
        <AppRoutes />
      </GlobalBackground>
    </Router>
  )
}

export default App
