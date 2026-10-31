import { Route, Routes } from 'react-router'

// Casca vazia: as rotas das features entram nas próprias specs.
export function App() {
  return (
    <Routes>
      <Route path="*" element={<h1>Outsera Razzies</h1>} />
    </Routes>
  )
}
