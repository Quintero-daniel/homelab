import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import RecipesPage from './pages/RecipesPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
      <Route path="/recipes" element={<RecipesPage />} />
    </Routes>
  )
}

export default App
