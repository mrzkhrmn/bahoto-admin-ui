import { useAppSelector } from '../app/hooks'
import { selectGlobalLoading } from '../features/ui/uiSlice'
import './GlobalLoading.css'

export function GlobalLoading() {
  const isLoading = useAppSelector(selectGlobalLoading)

  if (!isLoading) return null

  return (
    <div className="global-loading" role="status" aria-live="polite">
      <div className="global-loading__panel">
        <span className="global-loading__spinner" aria-hidden />
        <span>Yükleniyor...</span>
      </div>
    </div>
  )
}
