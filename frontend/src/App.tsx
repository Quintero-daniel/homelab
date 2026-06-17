import { Routes, Route, Navigate } from 'react-router-dom'
import RecipesPage from './pages/RecipesPage'

function App() {
  return (
    <Routes>
      <Route path="/recipes" element={<RecipesPage />} />
      <Route path="*" element={<Navigate to="/recipes" replace />} />
    </Routes>
  )
}

export default App
