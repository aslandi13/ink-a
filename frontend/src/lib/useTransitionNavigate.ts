/**
 * Hook that provides a navigate function which:
 * 1. First closes the curtain (covers screen)
 * 2. Then navigates (new page renders behind curtain)
 * 3. Curtain open is triggered by Layout's useEffect on pathname change
 */
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { curtainClose } from './curtain'

export function useTransitionNavigate() {
  const navigate = useNavigate()

  return useCallback(
    (to: string) => {
      curtainClose().then(() => navigate(to))
    },
    [navigate],
  )
}
