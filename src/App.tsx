import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminLayout } from './layout/AdminLayout'
import { CariPage } from './pages/CariPage'
import { FiyatTablosuPage } from './pages/FiyatTablosuPage'
import { LoginPage } from './pages/LoginPage'
import { YaglamaServisiPage } from './pages/YaglamaServisiPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Navigate to="/yaglama-servisi" replace />} />
            <Route path="yaglama-servisi" element={<YaglamaServisiPage />} />
            <Route path="cari" element={<CariPage />} />
            <Route path="fiyat-tablosu" element={<FiyatTablosuPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/yaglama-servisi" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
