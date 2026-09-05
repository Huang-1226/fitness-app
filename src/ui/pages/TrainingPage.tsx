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
import { useI18n } from '@/i18n/i18nStore';
import { useLibraryStore } from '@/store/libraryStore';
import { useTrainingStore } from '@/store/trainingStore';
import { useUserStore } from '@/store/userStore';
import { Select } from '@/ui/components/Select';
import { Stat } from '@/ui/components/Stat';

import { Modal } from '../components/Modal';
import { PageHeader } from '../components/PageHeader';

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
  const { t, d } = useI18n();
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
          <PageHeader icon={Dumbbell} title={t('training.title')} />
          <Card className="gap-0 rounded-xl border-border py-0 shadow-sm">
          <CardContent className="p-4">
            <p className="py-6 text-center text-sm text-muted-foreground">
              {t('training.noProfile')}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-[calc(76px+env(safe-area-inset-bottom))]">
      <PageHeader icon={Dumbbell} title={t('training.title')} />

      {!todayTrain ? (
        <Card className="gap-0 rounded-xl border-border py-0 shadow-sm">
          <CardContent className="p-4">
            <p className="py-6 text-center text-sm text-muted-foreground">
              {t('training.noRecord')}
            </p>
            <Button className="w-full" onClick={createToday}>
              {t('training.create')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="gap-0 rounded-xl border-border py-0 shadow-sm">
            <CardContent className="p-4">
              <Row label={t('training.date')}>{todayTrain.getDate()}</Row>
              {todayTrain.getRemark() && <Row label={t('training.remark')}>{todayTrain.getRemark()}</Row>}
              <div className="mt-3 grid grid-cols-2 gap-2.5">
                <Stat value={`${Math.round(strengthBurn)}`} label={t('training.strengthBurn')} />
                <Stat value={`${Math.round(cardioBurn)}`} label={t('training.cardioBurn')} />
              </div>
              <Stat className="mt-2.5" value={`${Math.round(totalBurn)} kcal`} label={t('training.totalBurn')} />
              <p className="mt-2 text-center text-sm text-muted-foreground">
                {t('training.volume')}：{Math.round(volume)}
              </p>
            </CardContent>
          </Card>

          <Card className="mt-3 gap-0 rounded-xl border-border py-0 shadow-sm">
            <CardHeader className="px-4 pt-4">
              <CardTitle className="text-base">{t('training.strengthRecords')}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              {todayTrain.getWorkoutLogs().length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">{t('training.noStrength')}</p>
              ) : (
                todayTrain.getWorkoutLogs().map((log, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-border bg-muted/30 px-3 py-2.5 [&+&]:mt-2"
                  >
                    <div className="font-semibold">
                      {d(log.getExercise().getName())}
                      <Badge variant="secondary" className="ml-1.5">
                        {d(log.getExercise().getTrainGroup())}
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
                      {t('history.volume')} {Math.round(log.getTrainVolume())} | {t('history.total')}{' '}
                      {Math.round(log.getTotalBurn(user.getWeight()))} kcal
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="mt-3 gap-0 rounded-xl border-border py-0 shadow-sm">
            <CardHeader className="px-4 pt-4">
              <CardTitle className="text-base">{t('training.cardioRecords')}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              {todayTrain.getCardioList().length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">{t('training.noCardio')}</p>
              ) : (
                todayTrain.getCardioList().map((c, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-border bg-muted/30 px-3 py-2.5 [&+&]:mt-2"
                  >
                    <div className="font-semibold">{d(c.getCardioName())}</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {c.getMinute()} {t('training.minutes')} | MET {c.getMetValue()} | {t('history.total')}{' '}
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
                {t('training.strengthLog')}
              </Button>
              <Button className="w-full" variant="secondary" onClick={() => setShowCardio(true)}>
                <Flame className="size-4" />
                {t('training.cardioLog')}
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
                {t('training.setRemark')}
              </Button>
              <Button className="w-full" variant="outline" onClick={() => void archiveToday()}>
                {t('training.archive')}
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
        <Modal title={t('training.setRemarkTitle')} onClose={() => setShowRemark(false)}>
          <div className="space-y-3">
            <Textarea
              rows={3}
              value={remarkText}
              onChange={(e) => setRemarkText(e.target.value)}
              placeholder={t('training.remarkPh')}
            />
            <Button
              className="w-full"
              onClick={() => {
                setRemark(remarkText);
                setShowRemark(false);
              }}
            >
              {t('training.saveRemark')}
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
  const { t, d } = useI18n();
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
        const dd = new Date(last + 'T00:00:00');
        const gap = Math.round((today.getTime() - dd.getTime()) / 86400000);
        if (gap < rule.recoverDays) {
          warn = t('training.smRecover', {
            group: d(selected.getTrainGroup()),
            date: last,
            gap,
            days: rule.recoverDays,
          });
        }
      }
    }
  }

  const addSet = () => {
    const w = Number(cur.w);
    const r = Number(cur.r);
    const m = Number(cur.m);
    if (!w || w <= 0 || !r || r <= 0 || !m || m <= 0) {
      setErr(t('training.smInvalid'));
      return;
    }
    setErr('');
    setSets([...sets, { w: cur.w, r: cur.r, m: cur.m }]);
    setCur({ w: '', r: '', m: '' });
  };

  const finish = () => {
    if (!selected) {
      setErr(t('training.smNeedExercise'));
      return;
    }
    if (sets.length === 0) {
      setErr(t('training.smNeedSet'));
      return;
    }
    const log = new WorkoutLog(selected);
    for (const s of sets) {
      log.addSet(Number(s.w), Number(s.r), Number(s.m));
    }
    onAdd(log);
  };

  return (
    <Modal title={t('training.strengthLog')} onClose={onClose}>
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label>{t('training.smChoose')}</Label>
          <Select value={name} onChange={(e) => setName(e.target.value)}>
            <option value="">{t('training.smPlaceholder')}</option>
            {options.map((e) => (
              <option key={e.getName()} value={e.getName()}>
                {d(e.getName())}
              </option>
            ))}
          </Select>
        </div>
        {selected && (
          <p className="text-sm text-muted-foreground">
            {d(selected.getTrainGroup())} | {t('training.smRecommend')}{' '}
            {t('lib.setsReps', { s: selected.getSets(), r: selected.getReps() })} | MET{' '}
            {selected.getMetValue()}
          </p>
        )}
        {warn && (
          <div className="rounded-lg border border-warning/40 bg-warning/10 px-3 py-2.5 text-sm text-warning">
            {warn}
          </div>
        )}

        <p className="font-semibold">
          {t('training.smSets')}：{sets.length}
        </p>
        {sets.map((s, i) => (
          <div
            className="flex items-center justify-between gap-2.5 border-b border-border py-2 last:border-0"
            key={i}
          >
            <span className="text-muted-foreground">{t('training.smSet', { n: i + 1 })}</span>
            <span>{t('training.setRecord', { w: s.w, r: s.r, m: s.m })}</span>
          </div>
        ))}

        <div className="grid grid-cols-2 gap-2.5">
          <div className="space-y-1.5">
            <Label>{t('training.smWeight')}</Label>
            <Input
              type="number"
              inputMode="decimal"
              value={cur.w}
              onChange={(e) => setCur({ ...cur, w: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t('training.smReps')}</Label>
            <Input
              type="number"
              inputMode="numeric"
              value={cur.r}
              onChange={(e) => setCur({ ...cur, r: e.target.value })}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>{t('training.smTime')}</Label>
          <Input
            type="number"
            inputMode="numeric"
            value={cur.m}
            onChange={(e) => setCur({ ...cur, m: e.target.value })}
          />
        </div>
        {err && <p className="text-sm text-destructive">{err}</p>}
        <Button className="w-full" variant="secondary" onClick={addSet}>
          {t('training.smAddSet')}
        </Button>
        <Button className="w-full" onClick={finish}>
          {t('training.smFinish')}
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
  const { t, d } = useI18n();
  const library = useLibraryStore((s) => s.library);
  const [name, setName] = useState('');
  const [minute, setMinute] = useState('');
  const [err, setErr] = useState('');
  const templates = library.getCardioTemplates();

  const selected = templates.find((tt) => tt.name === name);

  const finish = () => {
    if (!selected) {
      setErr(t('training.cmNeedSelect'));
      return;
    }
    const min = Number(minute);
    if (!min || min <= 0) {
      setErr(t('training.cmNeedDuration'));
      return;
    }
    onAdd(new CardioRecord(name, selected.met, min));
  };

  return (
    <Modal title={t('training.cardioLog')} onClose={onClose}>
      <div className="space-y-3">
        <Label>{t('training.cmChoose')}</Label>
        <div className="space-y-2">
          {templates.map((tt) => (
            <div
              className={`cursor-pointer rounded-lg border px-3 py-2.5 ${
                name === tt.name
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-muted/30'
              }`}
              key={tt.name}
              onClick={() => {
                setName(tt.name);
                setMinute(String(tt.recommendMin));
              }}
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
        </div>
        <div className="space-y-1.5">
          <Label>{t('training.cmDuration')}</Label>
          <Input
            type="number"
            inputMode="numeric"
            value={minute}
            onChange={(e) => setMinute(e.target.value)}
          />
        </div>
        {err && <p className="text-sm text-destructive">{err}</p>}
        <Button className="w-full" onClick={finish}>
          {t('training.cmFinish')}
        </Button>
      </div>
    </Modal>
  );
}