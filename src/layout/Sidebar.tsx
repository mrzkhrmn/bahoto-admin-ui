import { NavLink, useNavigate } from 'react-router-dom'
import { FiDroplet, FiLogOut } from 'react-icons/fi'
import { useAppDispatch } from '../app/hooks'
import { logout } from '../features/auth/authSlice'
import { baseApi } from '../api/baseApi'
import './Sidebar.css'

export function Sidebar() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const handleLogout = () => {
    dispatch(logout())
    dispatch(baseApi.util.resetApiState())
    navigate('/login', { replace: true })
  }

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="sidebar__brand-mark">B</span>
        <div className="sidebar__brand-text">
          <strong>Bahar Oto</strong>
          <span>Admin Panel</span>
        </div>
      </div>

      <nav className="sidebar__nav">
        <NavLink
          to="/yaglama-servisi"
          className={({ isActive }) =>
            `sidebar__link${isActive ? ' sidebar__link--active' : ''}`
          }
        >
          <FiDroplet aria-hidden />
          Yağlama Servisi
        </NavLink>
      </nav>

      <button type="button" className="sidebar__logout" onClick={handleLogout}>
        <FiLogOut aria-hidden />
        Çıkış Yap
      </button>
    </aside>
  )
}
