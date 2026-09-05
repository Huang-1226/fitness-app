import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Exercise, MuscleRatio } from '@/core/exercise';
import { useI18n } from '@/i18n/i18nStore';
import { Select } from '@/ui/components/Select';

import { Modal } from './Modal';

const GROUPS = ['胸部', '背部', '腿部', '核心', '肩部', '手臂'];

export function AddExerciseModal({
  onClose,
  onAdd,
  initialMuscle,
}: {
  onClose: () => void;
  onAdd: (e: Exercise) => Promise<void>;
  initialMuscle?: string;
}) {
  const { t, d } = useI18n();
  const [name, setName] = useState('');
  const [trainGroup, setTrainGroup] = useState('胸部');
  const [sets, setSets] = useState('3');
  const [reps, setReps] = useState('12');
  const [met, setMet] = useState('6.0');
  const [muscles, setMuscles] = useState<{ name: string; ratio: string }[]>(
    initialMuscle ? [{ name: initialMuscle, ratio: '80' }] : [],
  );
  const [mName, setMName] = useState('');
  const [mRatio, setMRatio] = useState('');
  const [err, setErr] = useState('');

  const save = async () => {
    if (!name.trim()) {
      setErr(t('lib.nameRequired'));
      return;
    }
    try {
      const ex = new Exercise(name.trim(), trainGroup, Number(sets), Number(reps), Number(met));
      for (const m of muscles) {
        ex.getMuscleRatios().push(new MuscleRatio(m.name.trim(), Number(m.ratio)));
      }
      await onAdd(ex);
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : t('lib.saveFail'));
    }
  };

  return (
    <Modal title={t('lib.addTitle')} onClose={onClose}>
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label>{t('lib.name')}</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('lib.namePh')} />
        </div>
        <div className="space-y-1.5">
          <Label>{t('lib.group')}</Label>
          <Select value={trainGroup} onChange={(e) => setTrainGroup(e.target.value)}>
            {GROUPS.map((g) => (
              <option key={g} value={g}>
                {d(g)}
              </option>
            ))}
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <div className="space-y-1.5">
            <Label>{t('lib.sets')}</Label>
            <Input
              type="number"
              inputMode="numeric"
              value={sets}
              onChange={(e) => setSets(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t('lib.reps')}</Label>
            <Input
              type="number"
              inputMode="numeric"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>{t('lib.met')}</Label>
          <Input
            type="number"
            inputMode="decimal"
            step="0.1"
            value={met}
            onChange={(e) => setMet(e.target.value)}
          />
        </div>

        <p className="font-semibold">{t('lib.muscleRatio')}</p>
        {muscles.map((m, i) => (
          <div
            className="flex items-center justify-between gap-2.5 border-b border-border py-2 last:border-0"
            key={i}
          >
            <span>{d(m.name)}</span>
            <span className="text-muted-foreground">{m.ratio}%</span>
          </div>
        ))}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="space-y-1.5">
            <Label>{t('lib.muscleName')}</Label>
            <Input value={mName} onChange={(e) => setMName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>{t('lib.ratio')}</Label>
            <Input
              type="number"
              inputMode="decimal"
              value={mRatio}
              onChange={(e) => setMRatio(e.target.value)}
            />
          </div>
        </div>
        <Button
          className="w-full"
          variant="secondary"
          onClick={() => {
            if (mName.trim() && Number(mRatio) > 0) {
              setMuscles([...muscles, { name: mName.trim(), ratio: mRatio }]);
              setMName('');
              setMRatio('');
            }
          }}
        >
          {t('lib.addMuscle')}
        </Button>

        {err && <p className="text-sm text-destructive">{err}</p>}
        <Button className="w-full" onClick={save}>
          {t('lib.saveExercise')}
        </Button>
      </div>
    </Modal>
  );
}