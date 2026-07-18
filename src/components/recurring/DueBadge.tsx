import { AlertCircle } from "lucide-react";
import { daysUntil } from "../../types/recurring";

const BADGE_BASE = "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold";

export function DueBadge({ nextDueDate }: { nextDueDate: string }) {
  const days = daysUntil(nextDueDate);
  if (days < 0)
    return (
      <span className={`${BADGE_BASE} bg-destructive/10 text-destructive`}>
        <AlertCircle size={10} />
        Overdue
      </span>
    );
  if (days === 0)
    return <span className={`${BADGE_BASE} bg-warning/10 text-warning`}>Due today</span>;
  if (days <= 7)
    return <span className={`${BADGE_BASE} bg-warning/10 text-warning`}>In {days}d</span>;
  return <span className={`${BADGE_BASE} bg-muted font-medium text-foreground`}>In {days}d</span>;
}
