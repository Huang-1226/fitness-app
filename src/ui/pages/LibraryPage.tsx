import { Library, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useI18n } from '@/i18n/i18nStore';
import { useLibraryStore } from '@/store/libraryStore';

import { AddExerciseModal } from '../components/AddExerciseModal';

const GROUPS = ['胸部', '背部', '腿部', '核心', '肩部', '手臂'];

function GroupTag({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-sm transition-colors ${
        active
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-border bg-secondary/50 text-muted-foreground'
      }`}
    >
      {label}
    </button>
  );
}

export default function LibraryPage() {
  const { t, d } = useI18n();
  const { library, addExercise } = useLibraryStore();
  const [group, setGroup] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const exercises = useMemo(() => {
    const all = library.getAllExercises();
    return group ? all.filter((e) => e.getTrainGroup() === group) : all;
  }, [library, group]);

  const cardio = library.getCardioTemplates();

  return (
    <div className="px-4 pt-4 pb-[calc(76px+env(safe-area-inset-bottom))]">
      <h1 className="mb-4 flex items-center gap-2 text-2xl font-bold">
        <Library className="size-6 text-primary" />
        {t('lib.title')}
      </h1>

      <Card className="gap-0 rounded-xl border-border py-0 shadow-sm">
        <CardContent className="space-y-3 p-4">
          <div className="flex flex-wrap gap-2">
            <GroupTag label={t('lib.all')} active={group === null} onClick={() => setGroup(null)} />
            {GROUPS.map((g) => (
              <GroupTag key={g} label={d(g)} active={group === g} onClick={() => setGroup(g)} />
            ))}
          </div>
          <Button className="w-full" variant="secondary" onClick={() => setShowAdd(true)}>
            <Plus className="size-4" />
            {t('lib.addStrength')}
          </Button>
        </CardContent>
      </Card>

      <Card className="mt-3 gap-0 rounded-xl border-border py-0 shadow-sm">
        <CardHeader className="px-4 pt-4">
          <CardTitle className="text-base">{t('lib.strength', { n: exercises.length })}</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {exercises.map((e) => (
            <div
              key={e.getName()}
              className="rounded-lg border border-border bg-muted/30 px-3 py-2.5 [&+&]:mt-2"
            >
              <div className="font-semibold">
                {d(e.getName())}
                <Badge variant="secondary" className="ml-1.5">
                  {d(e.getTrainGroup())}
                </Badge>
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {t('lib.recommend', { sets: e.getSets(), reps: e.getReps() })} | MET {e.getMetValue()}
              </div>
              {e.getMuscleRatios().length > 0 && (
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {e.getMuscleRatios().map((mr) => `${d(mr.getMuscleName())} ${mr.getRatio()}%`).join(' · ')}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="mt-3 gap-0 rounded-xl border-border py-0 shadow-sm">
        <CardHeader className="px-4 pt-4">
          <CardTitle className="text-base">{t('lib.cardioTemplates')}</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {cardio.map((tt) => (
            <div
              key={tt.name}
              className="rounded-lg border border-border bg-muted/30 px-3 py-2.5 [&+&]:mt-2"
            >
              <div className="font-semibold">
                {d(tt.name)} <Badge variant="secondary">MET {tt.met}</Badge>
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {t('training.cmRecommend', { n: tt.recommendMin })}
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">{d(tt.tip)}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      {showAdd && <AddExerciseModal onClose={() => setShowAdd(false)} onAdd={addExercise} />}
    </div>
  );
}