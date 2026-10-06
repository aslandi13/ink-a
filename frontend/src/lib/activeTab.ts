import { createContext, useContext, useEffect } from 'react'

export const ActiveTabContext = createContext<((tab: string) => void) | null>(null)

export function useReportActiveTab(tab: string) {
  const report = useContext(ActiveTabContext)
  useEffect(() => {
    report?.(tab)
  }, [report, tab])
}
