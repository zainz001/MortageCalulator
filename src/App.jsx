import { useState } from 'react'

import './App.css'
import MortgageCalculatorPage from './pages/MortgageCalculator/page'
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <MortgageCalculatorPage/>
     </div>
    </>
  )
}

export default App
