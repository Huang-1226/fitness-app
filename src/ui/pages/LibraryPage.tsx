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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Exercise, MuscleRatio } from '@/core/exercise';
import { useLibraryStore } from '@/store/libraryStore';
import { Select } from '@/ui/components/Select';

import { Modal } from '../components/Modal';

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
        动作库
      </h1>

      <Card className="gap-0 rounded-xl border-border py-0 shadow-sm">
        <CardContent className="space-y-3 p-4">
          <div className="flex flex-wrap gap-2">
            <GroupTag label="全部" active={group === null} onClick={() => setGroup(null)} />
            {GROUPS.map((g) => (
              <GroupTag key={g} label={g} active={group === g} onClick={() => setGroup(g)} />
            ))}
          </div>
          <Button className="w-full" variant="secondary" onClick={() => setShowAdd(true)}>
            <Plus className="size-4" />
            新增力量动作
          </Button>
        </CardContent>
      </Card>

      <Card className="mt-3 gap-0 rounded-xl border-border py-0 shadow-sm">
        <CardHeader className="px-4 pt-4">
          <CardTitle className="text-base">力量动作（{exercises.length}）</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {exercises.map((e) => (
            <div
              key={e.getName()}
              className="rounded-lg border border-border bg-muted/30 px-3 py-2.5 [&+&]:mt-2"
            >
              <div className="font-semibold">
                {e.getName()}
                <Badge variant="secondary" className="ml-1.5">
                  {e.getTrainGroup()}
                </Badge>
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                推荐 {e.getSets()}组×{e.getReps()}次 | MET {e.getMetValue()}
              </div>
              {e.getMuscleRatios().length > 0 && (
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {e.getMuscleRatios().map((mr) => `${mr.getMuscleName()} ${mr.getRatio()}%`).join(' · ')}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="mt-3 gap-0 rounded-xl border-border py-0 shadow-sm">
        <CardHeader className="px-4 pt-4">
          <CardTitle className="text-base">有氧模板</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {cardio.map((t) => (
            <div
              key={t.name}
              className="rounded-lg border border-border bg-muted/30 px-3 py-2.5 [&+&]:mt-2"
            >
              <div className="font-semibold">
                {t.name} <Badge variant="secondary">MET {t.met}</Badge>
              </div>
              <div className="mt-1 text-sm text-muted-foreground">推荐 {t.recommendMin} 分钟</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{t.tip}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      {showAdd && <AddExerciseModal onClose={() => setShowAdd(false)} onAdd={addExercise} />}
    </div>
  );
}

function AddExerciseModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (e: Exercise) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [trainGroup, setTrainGroup] = useState('胸部');
  const [sets, setSets] = useState('3');
  const [reps, setReps] = useState('12');
  const [met, setMet] = useState('6.0');
  const [muscles, setMuscles] = useState<{ name: string; ratio: string }[]>([]);
  const [mName, setMName] = useState('');
  const [mRatio, setMRatio] = useState('');
  const [err, setErr] = useState('');

  const save = async () => {
    if (!name.trim()) {
      setErr('动作名称不能为空');
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
      setErr(e instanceof Error ? e.message : '保存失败');
    }
  };

  return (
    <Modal title="新增力量动作" onClose={onClose}>
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label>动作名称</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="如 杠铃弯举" />
        </div>
        <div className="space-y-1.5">
          <Label>所属肌群</Label>
          <Select value={trainGroup} onChange={(e) => setTrainGroup(e.target.value)}>
            {GROUPS.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <div className="space-y-1.5">
            <Label>推荐组数</Label>
            <Input
              type="number"
              inputMode="numeric"
              value={sets}
              onChange={(e) => setSets(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>推荐次数</Label>
            <Input
              type="number"
              inputMode="numeric"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>MET 值</Label>
          <Input
            type="number"
            inputMode="decimal"
            step="0.1"
            value={met}
            onChange={(e) => setMet(e.target.value)}
          />
        </div>

        <p className="font-semibold">发力肌肉占比（可选）</p>
        {muscles.map((m, i) => (
          <div
            className="flex items-center justify-between gap-2.5 border-b border-border py-2 last:border-0"
            key={i}
          >
            <span>{m.name}</span>
            <span className="text-muted-foreground">{m.ratio}%</span>
          </div>
        ))}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="space-y-1.5">
            <Label>肌肉名称</Label>
            <Input value={mName} onChange={(e) => setMName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>占比 %</Label>
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
              setMuscles([...muscles, { name: mName, ratio: mRatio }]);
              setMName('');
              setMRatio('');
            }
          }}
        >
          添加肌肉
        </Button>

        {err && <p className="text-sm text-destructive">{err}</p>}
        <Button className="w-full" onClick={save}>
          保存动作
        </Button>
      </div>
    </Modal>
  );
}