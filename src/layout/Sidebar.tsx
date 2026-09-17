import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  FiChevronLeft,
  FiChevronRight,
  FiDroplet,
  FiLogOut,
} from 'react-icons/fi'
import { useLogoutMutation } from '../api/authApi'
import { baseApi } from '../api/baseApi'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { logout, selectRefreshToken } from '../features/auth/authSlice'
import './Sidebar.css'

const STORAGE_KEY = 'bahoto-sidebar-collapsed'

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export function Sidebar() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const refreshToken = useAppSelector(selectRefreshToken)
  const [logoutApi] = useLogoutMutation()
  const [collapsed, setCollapsed] = useState(readCollapsed)

  const handleLogout = async () => {
    if (refreshToken) {
      try {
        await logoutApi({ refreshToken }).unwrap()
      } catch {
        /* yerel çıkış yine yapılır */
      }
    }

    dispatch(logout())
    dispatch(baseApi.util.resetApiState())
    navigate('/login', { replace: true })
  }

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem(STORAGE_KEY, next ? '1' : '0')
      } catch {
        /* ignore */
      }
      return next
    })
  }

  return (
    <aside className={`sidebar${collapsed ? ' sidebar--collapsed' : ''}`}>
      <div className="sidebar__top">
        <div className="sidebar__brand">
          <span className="sidebar__brand-mark">B</span>
          <div className="sidebar__brand-text">
            <strong>Bahar Oto</strong>
            <span>Admin Panel</span>
          </div>
        </div>
        <button
          type="button"
          className="sidebar__toggle"
          onClick={toggleCollapsed}
          aria-expanded={!collapsed}
          aria-label={collapsed ? 'Menüyü genişlet' : 'Menüyü daralt'}
          title={collapsed ? 'Genişlet' : 'Daralt'}
        >
          {collapsed ? (
            <FiChevronRight aria-hidden />
          ) : (
            <FiChevronLeft aria-hidden />
          )}
        </button>
      </div>

      <nav className="sidebar__nav">
        <NavLink
          to="/yaglama-servisi"
          className={({ isActive }) =>
            `sidebar__link${isActive ? ' sidebar__link--active' : ''}`
          }
          title="Yağlama Servisi"
        >
          <FiDroplet aria-hidden />
          <span className="sidebar__link-label">Yağlama Servisi</span>
        </NavLink>
      </nav>

      <button
        type="button"
        className="sidebar__logout"
        onClick={() => void handleLogout()}
        title="Çıkış Yap"
      >
        <FiLogOut aria-hidden />
        <span className="sidebar__link-label">Çıkış Yap</span>
      </button>
    </aside>
  )
}
