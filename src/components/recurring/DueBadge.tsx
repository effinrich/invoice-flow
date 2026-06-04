import { AlertCircle } from 'lucide-react'
import { daysUntil } from '../../types/recurring'

export function DueBadge({ nextDueDate }: { nextDueDate: string }) {
  const days = daysUntil(nextDueDate)
  if (days < 0)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: '#fef2f2', color: '#dc2626' }}>
        <AlertCircle size={10} />Overdue
      </span>
    )
  if (days === 0)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: 'hsl(35 90% 95%)', color: 'hsl(35 75% 40%)' }}>
        Due today
      </span>
    )
  if (days <= 7)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: 'hsl(35 90% 95%)', color: 'hsl(35 75% 40%)' }}>
        In {days}d
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: '#f0ece8', color: '#6b5c4c' }}>
      In {days}d
    </span>
  )
}
