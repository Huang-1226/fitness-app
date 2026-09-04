import { Dumbbell, Flame, Plus, Sparkles } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';

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
import { Textarea } from '@/components/ui/textarea';
import { CardioRecord } from '@/core/cardioRecord';
import type { DailyTraining } from '@/core/dailyTraining';
import { findRecoverRuleByGroup } from '@/core/muscleRecoverRule';
import { WorkoutLog } from '@/core/workoutLog';
import { useLibraryStore } from '@/store/libraryStore';
import { useTrainingStore } from '@/store/trainingStore';
import { useUserStore } from '@/store/userStore';
import { Select } from '@/ui/components/Select';
import { Stat } from '@/ui/components/Stat';

import { Modal } from '../components/Modal';

function lastTrainDateForGroup(history: DailyTraining[], group: string): string | null {
  let latest: string | null = null;
  for (const t of history) {
    for (const log of t.getWorkoutLogs()) {
      if (log.getExercise().getTrainGroup() === group) {
        const d = t.getDate();
        if (!latest || d > latest) latest = d;
        break;
      }
    }
  }
  return latest;
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2.5 border-b border-border py-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span>{children}</span>
    </div>
  );
}

export default function TrainingPage() {
  const user = useUserStore((s) => s.user);
  const { todayTrain, history, createToday, addWorkoutLog, addCardio, setRemark, archiveToday } =
    useTrainingStore();
  const library = useLibraryStore((s) => s.library);

  const [showStrength, setShowStrength] = useState(false);
  const [showCardio, setShowCardio] = useState(false);
  const [showRemark, setShowRemark] = useState(false);
  const [remarkText, setRemarkText] = useState(todayTrain?.getRemark() ?? '');

  const strengthBurn = useMemo(() => todayTrain?.getStrengthBurn() ?? 0, [todayTrain]);
  const cardioBurn = useMemo(() => todayTrain?.getCardioBurn() ?? 0, [todayTrain]);
  const totalBurn = strengthBurn + cardioBurn;
  const volume = useMemo(() => todayTrain?.getDailyTotalVolume() ?? 0, [todayTrain]);

  if (!user) {
    return (
      <div className="px-4 pt-4 pb-[calc(76px+env(safe-area-inset-bottom))]">
        <h1 className="mb-4 flex items-center gap-2 text-2xl font-bold">
          <Dumbbell className="size-6 text-primary" />
          今日训练
        </h1>
        <Card className="gap-0 rounded-xl border-border py-0 shadow-sm">
          <CardContent className="p-4">
            <p className="py-6 text-center text-sm text-muted-foreground">
              请先在「首页」创建个人档案
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-[calc(76px+env(safe-area-inset-bottom))]">
      <h1 className="mb-4 flex items-center gap-2 text-2xl font-bold">
        <Dumbbell className="size-6 text-primary" />
        今日训练
      </h1>

      {!todayTrain ? (
        <Card className="gap-0 rounded-xl border-border py-0 shadow-sm">
          <CardContent className="p-4">
            <p className="py-6 text-center text-sm text-muted-foreground">
              今天还没有训练记录
            </p>
            <Button className="w-full" onClick={createToday}>
              新建今日训练
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="gap-0 rounded-xl border-border py-0 shadow-sm">
            <CardContent className="p-4">
              <Row label="训练日期">{todayTrain.getDate()}</Row>
              {todayTrain.getRemark() && <Row label="备注">{todayTrain.getRemark()}</Row>}
              <div className="mt-3 grid grid-cols-2 gap-2.5">
                <Stat value={`${Math.round(strengthBurn)}`} label="力量消耗 kcal" />
                <Stat value={`${Math.round(cardioBurn)}`} label="有氧消耗 kcal" />
              </div>
              <Stat className="mt-2.5" value={`${Math.round(totalBurn)} kcal`} label="今日合计消耗" />
              <p className="mt-2 text-center text-sm text-muted-foreground">
                总训练容量：{Math.round(volume)}
              </p>
            </CardContent>
          </Card>

          <Card className="mt-3 gap-0 rounded-xl border-border py-0 shadow-sm">
            <CardHeader className="px-4 pt-4">
              <CardTitle className="text-base">力量训练记录</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              {todayTrain.getWorkoutLogs().length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">暂无力量记录</p>
              ) : (
                todayTrain.getWorkoutLogs().map((log, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-border bg-muted/30 px-3 py-2.5 [&+&]:mt-2"
                  >
                    <div className="font-semibold">
                      {log.getExercise().getName()}
                      <Badge variant="secondary" className="ml-1.5">
                        {log.getExercise().getTrainGroup()}
                      </Badge>
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {log.getSetRecords().map((s, j) => (
                        <span key={j}>
                          {s.getTrainWeight()}kg×{s.getReps()}
                          {j < log.getSetRecords().length - 1 ? '  ' : ''}
                        </span>
                      ))}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      容量 {Math.round(log.getTrainVolume())} | 消耗{' '}
                      {Math.round(log.getTotalBurn(user.getWeight()))} kcal
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="mt-3 gap-0 rounded-xl border-border py-0 shadow-sm">
            <CardHeader className="px-4 pt-4">
              <CardTitle className="text-base">有氧训练记录</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              {todayTrain.getCardioList().length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">暂无有氧记录</p>
              ) : (
                todayTrain.getCardioList().map((c, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-border bg-muted/30 px-3 py-2.5 [&+&]:mt-2"
                  >
                    <div className="font-semibold">{c.getCardioName()}</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {c.getMinute()} 分钟 | MET {c.getMetValue()} | 消耗{' '}
                      {Math.round(c.calcBurn(user.getWeight()))} kcal
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="mt-3 gap-0 rounded-xl border-border py-0 shadow-sm">
            <CardContent className="space-y-2.5 p-4">
              <Button className="w-full" onClick={() => setShowStrength(true)}>
                <Plus className="size-4" />
                力量打卡
              </Button>
              <Button className="w-full" variant="secondary" onClick={() => setShowCardio(true)}>
                <Flame className="size-4" />
                有氧打卡
              </Button>
              <Button
                className="w-full"
                variant="secondary"
                onClick={() => {
                  setRemarkText(todayTrain.getRemark() ?? '');
                  setShowRemark(true);
                }}
              >
                <Sparkles className="size-4" />
                设置备注
              </Button>
              <Button className="w-full" variant="outline" onClick={() => void archiveToday()}>
                归档今日训练
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      {showStrength && (
        <StrengthModal
          exercises={library}
          onClose={() => setShowStrength(false)}
          onAdd={(log) => {
            addWorkoutLog(log);
            setShowStrength(false);
          }}
          history={history}
        />
      )}

      {showCardio && (
        <CardioModal
          onClose={() => setShowCardio(false)}
          onAdd={(c) => {
            addCardio(c);
            setShowCardio(false);
          }}
        />
      )}

      {showRemark && (
        <Modal title="设置训练备注" onClose={() => setShowRemark(false)}>
          <div className="space-y-3">
            <Textarea
              rows={3}
              value={remarkText}
              onChange={(e) => setRemarkText(e.target.value)}
              placeholder="训练状态、身体感受等"
            />
            <Button
              className="w-full"
              onClick={() => {
                setRemark(remarkText);
                setShowRemark(false);
              }}
            >
              保存备注
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function StrengthModal({
  exercises,
  history,
  onClose,
  onAdd,
}: {
  exercises: ReturnType<typeof useLibraryStore.getState>['library'];
  history: DailyTraining[];
  onClose: () => void;
  onAdd: (log: WorkoutLog) => void;
}) {
  const [name, setName] = useState('');
  const [sets, setSets] = useState<{ w: string; r: string; m: string }[]>([]);
  const [cur, setCur] = useState({ w: '', r: '', m: '' });
  const [err, setErr] = useState('');

  const options = useMemo(() => exercises.getAllExercises(), [exercises]);

  const selected = options.find((e) => e.getName() === name);
  let warn: string | null = null;
  if (selected) {
    const rule = findRecoverRuleByGroup(selected.getTrainGroup());
    if (rule) {
      const last = lastTrainDateForGroup(history, selected.getTrainGroup());
      if (last) {
        const today = new Date();
        const d = new Date(last + 'T00:00:00');
        const gap = Math.round((today.getTime() - d.getTime()) / 86400000);
        if (gap < rule.recoverDays) {
          warn = `恢复提醒：上次训练【${selected.getTrainGroup()}】在 ${last}，间隔仅 ${gap} 天，建议最少间隔 ${rule.recoverDays} 天`;
        }
      }
    }
  }

  const addSet = () => {
    const w = Number(cur.w);
    const r = Number(cur.r);
    const m = Number(cur.m);
    if (!w || w <= 0 || !r || r <= 0 || !m || m <= 0) {
      setErr('重量/次数/时长都必须大于0');
      return;
    }
    setErr('');
    setSets([...sets, { w: cur.w, r: cur.r, m: cur.m }]);
    setCur({ w: '', r: '', m: '' });
  };

  const finish = () => {
    if (!selected) {
      setErr('请先选择动作');
      return;
    }
    if (sets.length === 0) {
      setErr('至少录入一组数据');
      return;
    }
    const log = new WorkoutLog(selected);
    for (const s of sets) {
      log.addSet(Number(s.w), Number(s.r), Number(s.m));
    }
    onAdd(log);
  };

  return (
    <Modal title="力量打卡" onClose={onClose}>
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label>选择动作</Label>
          <Select value={name} onChange={(e) => setName(e.target.value)}>
            <option value="">-- 请选择 --</option>
            {options.map((e) => (
              <option key={e.getName()} value={e.getName()}>
                {e.getName()}
              </option>
            ))}
          </Select>
        </div>
        {selected && (
          <p className="text-sm text-muted-foreground">
            {selected.getTrainGroup()} | 推荐 {selected.getSets()}组×{selected.getReps()}次 | MET{' '}
            {selected.getMetValue()}
          </p>
        )}
        {warn && (
          <div className="rounded-lg border border-warning/40 bg-warning/10 px-3 py-2.5 text-sm text-warning">
            {warn}
          </div>
        )}

        <p className="font-semibold">已录入组数：{sets.length}</p>
        {sets.map((s, i) => (
          <div
            className="flex items-center justify-between gap-2.5 border-b border-border py-2 last:border-0"
            key={i}
          >
            <span className="text-muted-foreground">第 {i + 1} 组</span>
            <span>
              {s.w}kg × {s.r}次 × {s.m}min
            </span>
          </div>
        ))}

        <div className="grid grid-cols-2 gap-2.5">
          <div className="space-y-1.5">
            <Label>负重 kg</Label>
            <Input
              type="number"
              inputMode="decimal"
              value={cur.w}
              onChange={(e) => setCur({ ...cur, w: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>次数</Label>
            <Input
              type="number"
              inputMode="numeric"
              value={cur.r}
              onChange={(e) => setCur({ ...cur, r: e.target.value })}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>本组用时 (分钟)</Label>
          <Input
            type="number"
            inputMode="numeric"
            value={cur.m}
            onChange={(e) => setCur({ ...cur, m: e.target.value })}
          />
        </div>
        {err && <p className="text-sm text-destructive">{err}</p>}
        <Button className="w-full" variant="secondary" onClick={addSet}>
          添加本组
        </Button>
        <Button className="w-full" onClick={finish}>
          完成打卡
        </Button>
      </div>
    </Modal>
  );
}

function CardioModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (c: CardioRecord) => void;
}) {
  const library = useLibraryStore((s) => s.library);
  const [name, setName] = useState('');
  const [minute, setMinute] = useState('');
  const [err, setErr] = useState('');
  const templates = library.getCardioTemplates();

  const selected = templates.find((t) => t.name === name);

  const finish = () => {
    if (!selected) {
      setErr('请选择有氧项目');
      return;
    }
    const min = Number(minute);
    if (!min || min <= 0) {
      setErr('时长必须大于0');
      return;
    }
    onAdd(new CardioRecord(name, selected.met, min));
  };

  return (
    <Modal title="有氧打卡" onClose={onClose}>
      <div className="space-y-3">
        <Label>选择有氧项目</Label>
        <div className="space-y-2">
          {templates.map((t) => (
            <div
              className={`cursor-pointer rounded-lg border px-3 py-2.5 ${
                name === t.name
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-muted/30'
              }`}
              key={t.name}
              onClick={() => {
                setName(t.name);
                setMinute(String(t.recommendMin));
              }}
            >
              <div className="font-semibold">
                {t.name} <Badge variant="secondary">MET {t.met}</Badge>
              </div>
              <div className="mt-1 text-sm text-muted-foreground">推荐 {t.recommendMin} 分钟</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{t.tip}</div>
            </div>
          ))}
        </div>
        <div className="space-y-1.5">
          <Label>本次时长 (分钟)</Label>
          <Input
            type="number"
            inputMode="numeric"
            value={minute}
            onChange={(e) => setMinute(e.target.value)}
          />
        </div>
        {err && <p className="text-sm text-destructive">{err}</p>}
        <Button className="w-full" onClick={finish}>
          完成打卡
        </Button>
      </div>
    </Modal>
  );
}