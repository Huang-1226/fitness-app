import { ClipboardList, Utensils, Wand2 } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import type { Exercise } from '@/core/exercise';
import {
  calculateFullNutrition,
  type Mode,
} from '@/core/nutritionCalculator';
import { WorkoutLog } from '@/core/workoutLog';
import { useI18n } from '@/i18n/i18nStore';
import { useLibraryStore } from '@/store/libraryStore';
import { useTrainingStore } from '@/store/trainingStore';
import { useUserStore } from '@/store/userStore';
import { Select } from '@/ui/components/Select';
import { Stat } from '@/ui/components/Stat';

import { AddExerciseModal } from '../components/AddExerciseModal';

/** PPL 三分化每日的语义色（Tailwind 令牌色） */
const PPL_COLORS = [
  { title: 'text-red-500', dot: 'bg-red-500' },
  { title: 'text-blue-500', dot: 'bg-blue-500' },
  { title: 'text-emerald-500', dot: 'bg-emerald-500' },
] as const;

function planStats(list: Exercise[]) {
  const totalSets = list.reduce((s, e) => s + e.getSets(), 0);
  return { count: list.length, totalSets };
}

function PlanRow({ e, index }: { e: Exercise; index: number }) {
  const { t, d } = useI18n();
  const main = e.getMuscleRatios()[0];
  return (
    <div className="flex items-center gap-2.5 border-b border-border py-2 last:border-0">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
        {index}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold">{d(e.getName())}</div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
          <Badge variant="secondary" className="px-1.5 py-0 text-[11px]">
            {d(e.getTrainGroup())}
          </Badge>
          <span>{t('lib.setsReps', { s: e.getSets(), r: e.getReps() })}</span>
          {main && (
            <span>
              · {d(main.getMuscleName())} {main.getRatio()}%
            </span>
          )}
        </div>
      </div>
      <span className="shrink-0 rounded-md bg-secondary/70 px-1.5 py-0.5 text-[11px] text-muted-foreground">
        MET {e.getMetValue()}
      </span>
    </div>
  );
}

function Message({ ok, text }: { ok: boolean; text: string }) {
  if (!text) return null;
  return (
    <div
      className={
        ok
          ? 'rounded-lg border border-success/40 bg-success/10 px-3 py-2.5 text-sm text-success'
          : 'rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive'
      }
    >
      {text}
    </div>
  );
}

export default function PlanPage() {
  const { t, d } = useI18n();
  const user = useUserStore((s) => s.user);
  const { todayTrain, addWorkoutLog, createToday } = useTrainingStore();
  const { library, addExercise } = useLibraryStore();

  const [planMode, setPlanMode] = useState(1);
  const [g1, setG1] = useState('胸部');
  const [g2, setG2] = useState('背部');
  const [singleTarget, setSingleTarget] = useState('胸部');
  const [plan, setPlan] = useState<Exercise[] | Exercise[][] | null>(null);
  const [planMsg, setPlanMsg] = useState('');
  const [planMsgOk, setPlanMsgOk] = useState(false);

  const [filterMuscle, setFilterMuscle] = useState('');
  const [filterThreshold, setFilterThreshold] = useState('70');
  const [filterResult, setFilterResult] = useState<Exercise[] | null>(null);
  const [showAddEx, setShowAddEx] = useState(false);

  const allMuscles = useMemo(() => {
    const set = new Set<string>();
    for (const e of library.getAllExercises()) {
      for (const m of e.getMuscleRatios()) {
        set.add(m.getMuscleName());
      }
    }
    return [...set].sort();
  }, [library]);

  const [actCode, setActCode] = useState<number>(() => {
    const u = useUserStore.getState().user;
    return u && u.getActivityCode() >= 1 && u.getActivityCode() <= 4 ? u.getActivityCode() : 3;
  });
  const [actCodeTouched, setActCodeTouched] = useState(false);
  const profileActCode =
    user && user.getActivityCode() >= 1 && user.getActivityCode() <= 4 ? user.getActivityCode() : null;
  const effectiveActCode = actCodeTouched || profileActCode === null ? actCode : profileActCode;
  const [dietMode, setDietMode] = useState<Mode>('MAINTAIN');
  const [dietResult, setDietResult] = useState<ReturnType<typeof calculateFullNutrition> | null>(null);
  const [dietErr, setDietErr] = useState('');

  const groups = ['胸部', '背部', '腿部', '核心', '肩部', '手臂'];

  const generatePlan = () => {
    let result: Exercise[] | Exercise[][] | null = null;
    switch (planMode) {
      case 1:
        result = library.generateFullBodyPlan();
        break;
      case 2:
        result = library.generateTwoTargetPlan(g1, g2);
        break;
      case 3:
        result = library.getSingleTargetExercises(singleTarget);
        break;
      case 4:
        result = library.generatePPLThreeSplit();
        break;
    }
    setPlan(result);
    setPlanMsg('');
    setFilterResult(null);
  };

  const importPlan = (list: Exercise[]) => {
    if (!todayTrain) {
      setPlanMsg(t('plan.noTodayImport'));
      setPlanMsgOk(false);
      return;
    }
    for (const ex of list) {
      addWorkoutLog(new WorkoutLog(ex));
    }
    setPlanMsg(t('plan.imported', { n: list.length }));
    setPlanMsgOk(true);
  };

  const buildDiet = () => {
    if (!user) {
      setDietErr(t('plan.noProfile'));
      setDietResult(null);
      return;
    }
    try {
      const todayBurn = todayTrain ? todayTrain.getStrengthBurn() + todayTrain.getCardioBurn() : 0;
      const result = calculateFullNutrition(user, dietMode, effectiveActCode, todayBurn);
      setDietResult(result);
      setDietErr('');
    } catch (e) {
      setDietResult(null);
      setDietErr(e instanceof Error ? e.message : t('plan.genFail'));
    }
  };

  const renderPlanResult = () => {
    if (plan === null) return null;
    const isPPL = planMode === 4 && Array.isArray(plan) && plan[0] && Array.isArray(plan[0]);
    if (isPPL) {
      const days = plan as Exercise[][];
      const labels = [
        { titleKey: 'plan.push', subKey: 'plan.pushSub' },
        { titleKey: 'plan.pull', subKey: 'plan.pullSub' },
        { titleKey: 'plan.leg', subKey: 'plan.legSub' },
      ] as const;
      return (
        <div className="space-y-2.5">
          {days.map((day, i) => {
            const st = planStats(day);
            const label = labels[i];
            const color = PPL_COLORS[i];
            return (
              <div
                key={i}
                className="rounded-lg border border-border bg-muted/30 px-3 py-2.5"
              >
                <div className="mb-1.5 flex items-center justify-between">
                  <div>
                    <div className={cn('flex items-center gap-1.5 font-semibold', color?.title)}>
                      <span className={cn('size-2 rounded-full', color?.dot)} />
                      {t(label?.titleKey)}
                    </div>
                    <div className="text-xs text-muted-foreground">{t(label?.subKey)}</div>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <Badge variant="secondary">{t('plan.exCount', { n: st.count })}</Badge>
                    <Badge variant="outline">{t('plan.setsCount', { n: st.totalSets })}</Badge>
                  </div>
                </div>
                {day.map((e, j) => (
                  <PlanRow key={e.getName()} e={e} index={j + 1} />
                ))}
                <Button className="mt-2.5 w-full" variant="secondary" onClick={() => importPlan(day)}>
                  {t('plan.importToday')}
                </Button>
              </div>
            );
          })}
        </div>
      );
    }
    const list = plan as Exercise[];
    const st = planStats(list);
    return (
      <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5">
        <div className="mb-1.5 flex items-center justify-between">
          <div>
            <div className="font-semibold">{t('plan.generated')}</div>
            <div className="text-xs text-muted-foreground">
              {t('plan.estTime', { n: Math.round(st.totalSets * 2.5) })}
            </div>
          </div>
          <div className="flex shrink-0 gap-1.5">
            <Badge variant="secondary">{t('plan.exCount', { n: st.count })}</Badge>
            <Badge variant="outline">{t('plan.setsCount', { n: st.totalSets })}</Badge>
          </div>
        </div>
        {list.map((e, j) => (
          <PlanRow key={e.getName()} e={e} index={j + 1} />
        ))}
        <Button className="mt-2.5 w-full" variant="secondary" onClick={() => importPlan(list)}>
          {t('plan.importToday')}
        </Button>
      </div>
    );
  };

  const strengthBurn = todayTrain ? todayTrain.getStrengthBurn() : 0;
  const cardioBurn = todayTrain ? todayTrain.getCardioBurn() : 0;

  return (
    <div className="px-4 pt-4 pb-[calc(76px+env(safe-area-inset-bottom))]">
      <h1 className="mb-4 flex items-center gap-2 text-2xl font-bold">
        <ClipboardList className="size-6 text-primary" />
        {t('plan.title')}
      </h1>

      <Card className="gap-0 rounded-xl border-border py-0 shadow-sm">
        <CardHeader className="px-4 pt-4">
          <CardTitle className="flex items-center gap-1.5 text-base">
            <Wand2 className="size-4 text-primary" />
            {t('plan.planGen')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-4 pt-0">
          <div className="space-y-1.5">
            <Label>{t('plan.mode')}</Label>
            <Select value={planMode} onChange={(e) => setPlanMode(Number(e.target.value))}>
              <option value={1}>{t('plan.fullBody')}</option>
              <option value={2}>{t('plan.twoTarget')}</option>
              <option value={3}>{t('plan.singleGroup')}</option>
              <option value={4}>{t('plan.ppl')}</option>
            </Select>
          </div>
          {planMode === 2 && (
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1.5">
                <Label>{t('plan.part1')}</Label>
                <Select value={g1} onChange={(e) => setG1(e.target.value)}>
                  {groups.map((g) => (
                    <option key={g} value={g}>
                      {d(g)}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{t('plan.part2')}</Label>
                <Select value={g2} onChange={(e) => setG2(e.target.value)}>
                  {groups.map((g) => (
                    <option key={g} value={g}>
                      {d(g)}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          )}
          {planMode === 3 && (
            <div className="space-y-1.5">
              <Label>{t('plan.targetGroup')}</Label>
              <Select value={singleTarget} onChange={(e) => setSingleTarget(e.target.value)}>
                {groups.map((g) => (
                  <option key={g} value={g}>
                    {d(g)}
                  </option>
                ))}
              </Select>
            </div>
          )}
          <Button className="w-full" onClick={generatePlan}>
            {t('plan.generate')}
          </Button>
          <Message ok={planMsgOk} text={planMsg} />
          {renderPlanResult()}
        </CardContent>
      </Card>

      <Card className="mt-3 gap-0 rounded-xl border-border py-0 shadow-sm">
        <CardHeader className="px-4 pt-4">
          <CardTitle className="text-base">{t('plan.filter')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-4 pt-0">
          <div className="space-y-1.5">
            <Label>{t('plan.targetMuscle')}</Label>
            <Select
              value={filterMuscle}
              onChange={(e) => {
                setFilterMuscle(e.target.value);
                setFilterResult(null);
              }}
            >
              <option value="">{t('plan.selectMuscle')}</option>
              {allMuscles.map((m) => (
                <option key={m} value={m}>
                  {d(m)}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>{t('plan.threshold')}</Label>
            <Input
              type="number"
              inputMode="decimal"
              value={filterThreshold}
              onChange={(e) => setFilterThreshold(e.target.value)}
            />
          </div>
          <Button
            className="w-full"
            onClick={() => {
              if (!filterMuscle) {
                setFilterResult(null);
                return;
              }
              setFilterResult(library.findMainExerciseByMuscle(filterMuscle, Number(filterThreshold)));
              setPlan(null);
            }}
          >
            {t('plan.filterBtn')}
          </Button>
          {filterResult && (
            <div>
              {filterResult.length === 0 ? (
                <div className="space-y-2.5">
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    {t('plan.noMatchAdd')}
                  </p>
                  <Button className="w-full" variant="secondary" onClick={() => setShowAddEx(true)}>
                    {t('lib.addStrength')}
                  </Button>
                </div>
              ) : (
                filterResult.map((e) => (
                  <div
                    className="flex items-center justify-between gap-2.5 border-b border-border py-2 last:border-0"
                    key={e.getName()}
                  >
                    <span>{d(e.getName())}</span>
                    <Badge variant="secondary">{d(e.getTrainGroup())}</Badge>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {showAddEx && (
        <AddExerciseModal
          initialMuscle={filterMuscle || undefined}
          onClose={() => setShowAddEx(false)}
          onAdd={async (ex) => {
            await addExercise(ex);
            setShowAddEx(false);
            if (filterMuscle) {
              setFilterResult(
                useLibraryStore.getState().library.findMainExerciseByMuscle(filterMuscle, Number(filterThreshold)),
              );
            }
          }}
        />
      )}

      <Card className="mt-3 gap-0 rounded-xl border-border py-0 shadow-sm">
        <CardHeader className="px-4 pt-4">
          <CardTitle className="flex items-center gap-1.5 text-base">
            <Utensils className="size-4 text-primary" />
            {t('plan.diet')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-4 pt-0">
          <div className="space-y-1.5">
            <Label>{t('plan.activityDefault')}</Label>
            <Select
              value={effectiveActCode}
              onChange={(e) => {
                setActCode(Number(e.target.value));
                setActCodeTouched(true);
              }}
            >
              <option value={1}>{t('activity.1')}</option>
              <option value={2}>{t('activity.2')}</option>
              <option value={3}>{t('activity.3')}</option>
              <option value={4}>{t('activity.4')}</option>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>{t('plan.goal')}</Label>
            <Select value={dietMode} onChange={(e) => setDietMode(e.target.value as Mode)}>
              <option value="LOSE_FAT">{t('plan.loseFat')}</option>
              <option value="MAINTAIN">{t('plan.maintain')}</option>
              <option value="GAIN_MUSCLE">{t('plan.gainMuscle')}</option>
            </Select>
          </div>
          <Button className="w-full" onClick={buildDiet}>
            {t('plan.generateDiet')}
          </Button>
          {dietErr && <Message ok={false} text={dietErr} />}

          {dietResult && (
            <div className="space-y-3 pt-1">
              {dietResult.warn && (
                <div className="rounded-lg border border-warning/40 bg-warning/10 px-3 py-2.5 text-sm text-warning">
                  {d(dietResult.warn)}
                </div>
              )}
              <div className="grid grid-cols-2 gap-2.5">
                <Stat value={`${Math.round(dietResult.targetCal)}`} label={t('plan.dailyCal')} />
                <Stat value={`${Math.round(dietResult.proteinG)}g`} label={t('plan.protein')} />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <Stat value={`${Math.round(dietResult.fatG)}g`} label={t('plan.fat')} />
                <Stat value={`${Math.round(dietResult.carbG)}g`} label={t('plan.carb')} />
              </div>

              <p className="font-semibold">{t('plan.mealSplit')}</p>
              {(
                [
                  ['plan.breakfast', 0.3],
                  ['plan.lunch', 0.4],
                  ['plan.dinner', 0.3],
                ] as const
              ).map(([labelKey, ratio]) => (
                <div
                  className="flex items-center justify-between gap-2.5 border-b border-border py-2 last:border-0"
                  key={labelKey}
                >
                  <span className="text-muted-foreground">{t(labelKey)}</span>
                  <span className="text-right">
                    {Math.round(dietResult.targetCal * ratio)} kcal · {t('plan.protein')}
                    {Math.round(dietResult.proteinG * ratio)}g · {t('plan.carb')}
                    {Math.round(dietResult.carbG * ratio)}g · {t('plan.fat')}
                    {Math.round(dietResult.fatG * ratio)}g
                  </span>
                </div>
              ))}

              <p className="pt-1 font-semibold">{t('plan.trainBurn')}</p>
              {todayTrain ? (
                <>
                  <div className="flex items-center justify-between gap-2.5 border-b border-border py-2 last:border-0">
                    <span className="text-muted-foreground">{t('training.strengthBurn')}</span>
                    <span>{Math.round(strengthBurn)} kcal</span>
                  </div>
                  <div className="flex items-center justify-between gap-2.5 border-b border-border py-2 last:border-0">
                    <span className="text-muted-foreground">{t('training.cardioBurn')}</span>
                    <span>{Math.round(cardioBurn)} kcal</span>
                  </div>
                  <div className="flex items-center justify-between gap-2.5 border-b border-border py-2 last:border-0">
                    <span className="text-muted-foreground">{t('plan.totalIncluded')}</span>
                    <span>{Math.round(strengthBurn + cardioBurn)} kcal</span>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">{t('plan.noTrainToday')}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {todayTrain === null && (
        <div className="mt-3 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2.5 text-sm text-warning">
          {t('plan.hintImport')}
        </div>
      )}
      {todayTrain === null && (
        <Button
          className="mt-2.5 w-full"
          onClick={() => {
            if (user) createToday();
          }}
        >
          {t('plan.createToday')}
        </Button>
      )}
    </div>
  );
}