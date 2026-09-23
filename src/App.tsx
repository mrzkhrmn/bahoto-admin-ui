import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminLayout } from './layout/AdminLayout'
import { CariPage } from './pages/CariPage'
import { LoginPage } from './pages/LoginPage'
import { UrunlerPage } from './pages/UrunlerPage'
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
            <Route path="urunler" element={<UrunlerPage />} />
            <Route path="cari" element={<CariPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/yaglama-servisi" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
