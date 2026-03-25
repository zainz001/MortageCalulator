import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import './App.css'
import MortgageCalculatorPage from './pages/MortgageCalculator/page'
import MortgageCalculatorPage1 from './pages/MortgageCalculator1/page'

function App() {
  return (
    <Router>
      <div className="app-container">
    
        <Routes>
          {/* This loads when the URL is exactly "/" */}
          <Route path="/" element={<MortgageCalculatorPage />} />
          
          {/* This loads when the URL is "/offset" */}
          <Route path="/MortgageCalculatorPage1" element={<MortgageCalculatorPage1 />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App