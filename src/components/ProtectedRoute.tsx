import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useRefreshMutation } from '../api/authApi'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import {
  logout,
  selectRememberMe,
  selectRefreshToken,
  selectToken,
  setCredentials,
} from '../features/auth/authSlice'
import { isJwtExpired } from '../utils/jwt'

export function ProtectedRoute() {
  const dispatch = useAppDispatch()
  const token = useAppSelector(selectToken)
  const refreshToken = useAppSelector(selectRefreshToken)
  const rememberMe = useAppSelector(selectRememberMe)
  const [refresh] = useRefreshMutation()
  const [status, setStatus] = useState<'checking' | 'ready' | 'unauthenticated'>(
    () => {
      if (token && !isJwtExpired(token)) return 'ready'
      if (refreshToken) return 'checking'
      return 'unauthenticated'
    },
  )

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      if (token && !isJwtExpired(token)) {
        if (!cancelled) setStatus('ready')
        return
      }

      if (!refreshToken) {
        dispatch(logout())
        if (!cancelled) setStatus('unauthenticated')
        return
      }

      try {
        const result = await refresh({ refreshToken }).unwrap()
        if (!result.success || !result.data?.token || !result.data.refreshToken) {
          dispatch(logout())
          if (!cancelled) setStatus('unauthenticated')
          return
        }

        dispatch(
          setCredentials({
            token: result.data.token,
            refreshToken: result.data.refreshToken,
            user: {
              userId: result.data.userId,
              email: result.data.email,
              fullName: result.data.fullName,
            },
            rememberMe,
          }),
        )
        if (!cancelled) setStatus('ready')
      } catch {
        dispatch(logout())
        if (!cancelled) setStatus('unauthenticated')
      }
    }

    void bootstrap()
    return () => {
      cancelled = true
    }
  }, [dispatch, refresh, refreshToken, rememberMe, token])

  if (status === 'checking') {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          color: 'var(--muted)',
          fontSize: '0.95rem',
        }}
      >
        Oturum doğrulanıyor...
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
