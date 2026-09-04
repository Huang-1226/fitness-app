import { cn } from '@/lib/utils';

export function Stat({
  value,
  label,
  accent = true,
  className,
}: {
  value: string;
  label: string;
  accent?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('rounded-xl bg-secondary/60 px-3 py-3 text-center', className)}>
      <div className={cn('text-2xl font-bold', accent ? 'text-primary' : 'text-foreground')}>
        {value}
      </div>
      <div className="mt-0.5 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}