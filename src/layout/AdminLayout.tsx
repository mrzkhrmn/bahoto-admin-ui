import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import './AdminLayout.css'

export function AdminLayout() {
  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-layout__content">
        <Outlet />
      </main>
    </div>
  )
}
