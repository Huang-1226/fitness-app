import { ClipboardList, Utensils, Wand2 } from 'lucide-react';
import { useState } from 'react';

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
import { useLibraryStore } from '@/store/libraryStore';
import { useTrainingStore } from '@/store/trainingStore';
import { useUserStore } from '@/store/userStore';
import { Select } from '@/ui/components/Select';
import { Stat } from '@/ui/components/Stat';

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
  const main = e.getMuscleRatios()[0];
  return (
    <div className="flex items-center gap-2.5 border-b border-border py-2 last:border-0">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
        {index}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold">{e.getName()}</div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
          <Badge variant="secondary" className="px-1.5 py-0 text-[11px]">
            {e.getTrainGroup()}
          </Badge>
          <span>
            {e.getSets()}组 × {e.getReps()}次
          </span>
          {main && (
            <span>
              · {main.getMuscleName()} {main.getRatio()}%
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
  const user = useUserStore((s) => s.user);
  const { todayTrain, addWorkoutLog, createToday } = useTrainingStore();
  const library = useLibraryStore((s) => s.library);

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
      setPlanMsg('请先在「训练」页新建今日训练，再导入计划');
      setPlanMsgOk(false);
      return;
    }
    for (const ex of list) {
      addWorkoutLog(new WorkoutLog(ex));
    }
    setPlanMsg(`已导入 ${list.length} 个动作到今日训练`);
    setPlanMsgOk(true);
  };

  const buildDiet = () => {
    if (!user) {
      setDietErr('请先创建个人档案');
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
      setDietErr(e instanceof Error ? e.message : '生成失败，请检查活动等级');
    }
  };

  const renderPlanResult = () => {
    if (plan === null) return null;
    const isPPL = planMode === 4 && Array.isArray(plan) && plan[0] && Array.isArray(plan[0]);
    if (isPPL) {
      const days = plan as Exercise[][];
      const labels = [
        { title: '推 Push', sub: '胸 · 肩 · 三头' },
        { title: '拉 Pull', sub: '背 · 二头' },
        { title: '腿 Leg', sub: '腿 · 臀 · 核心' },
      ];
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
                      {label?.title}
                    </div>
                    <div className="text-xs text-muted-foreground">{label?.sub}</div>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <Badge variant="secondary">{st.count} 个动作</Badge>
                    <Badge variant="outline">约 {st.totalSets} 组</Badge>
                  </div>
                </div>
                {day.map((e, j) => (
                  <PlanRow key={e.getName()} e={e} index={j + 1} />
                ))}
                <Button className="mt-2.5 w-full" variant="secondary" onClick={() => importPlan(day)}>
                  导入今日训练
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
            <div className="font-semibold">生成计划</div>
            <div className="text-xs text-muted-foreground">预计时长约 {Math.round(st.totalSets * 2.5)} 分钟</div>
          </div>
          <div className="flex shrink-0 gap-1.5">
            <Badge variant="secondary">{st.count} 个动作</Badge>
            <Badge variant="outline">约 {st.totalSets} 组</Badge>
          </div>
        </div>
        {list.map((e, j) => (
          <PlanRow key={e.getName()} e={e} index={j + 1} />
        ))}
        <Button className="mt-2.5 w-full" variant="secondary" onClick={() => importPlan(list)}>
          导入今日训练
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
        计划 & 饮食
      </h1>

      <Card className="gap-0 rounded-xl border-border py-0 shadow-sm">
        <CardHeader className="px-4 pt-4">
          <CardTitle className="flex items-center gap-1.5 text-base">
            <Wand2 className="size-4 text-primary" />
            训练计划生成
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-4 pt-0">
          <div className="space-y-1.5">
            <Label>模式</Label>
            <Select value={planMode} onChange={(e) => setPlanMode(Number(e.target.value))}>
              <option value={1}>全身训练</option>
              <option value={2}>双部位分化</option>
              <option value={3}>单肌群专攻</option>
              <option value={4}>推拉腿三分化 PPL</option>
            </Select>
          </div>
          {planMode === 2 && (
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1.5">
                <Label>部位 1</Label>
                <Select value={g1} onChange={(e) => setG1(e.target.value)}>
                  {groups.map((g) => (
                    <option key={g}>{g}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>部位 2</Label>
                <Select value={g2} onChange={(e) => setG2(e.target.value)}>
                  {groups.map((g) => (
                    <option key={g}>{g}</option>
                  ))}
                </Select>
              </div>
            </div>
          )}
          {planMode === 3 && (
            <div className="space-y-1.5">
              <Label>目标肌群</Label>
              <Select value={singleTarget} onChange={(e) => setSingleTarget(e.target.value)}>
                {groups.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </Select>
            </div>
          )}
          <Button className="w-full" onClick={generatePlan}>
            生成计划
          </Button>
          <Message ok={planMsgOk} text={planMsg} />
          {renderPlanResult()}
        </CardContent>
      </Card>

      <Card className="mt-3 gap-0 rounded-xl border-border py-0 shadow-sm">
        <CardHeader className="px-4 pt-4">
          <CardTitle className="text-base">按肌肉筛选主打动作</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-4 pt-0">
          <div className="space-y-1.5">
            <Label>目标肌肉</Label>
            <Input
              value={filterMuscle}
              onChange={(e) => setFilterMuscle(e.target.value)}
              placeholder="如 胸大肌 / 背阔肌"
            />
          </div>
          <div className="space-y-1.5">
            <Label>最低发力占比 (%)</Label>
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
              setFilterResult(library.findMainExerciseByMuscle(filterMuscle, Number(filterThreshold)));
              setPlan(null);
            }}
          >
            筛选
          </Button>
          {filterResult && (
            <div>
              {filterResult.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">无匹配动作</p>
              ) : (
                filterResult.map((e) => (
                  <div
                    className="flex items-center justify-between gap-2.5 border-b border-border py-2 last:border-0"
                    key={e.getName()}
                  >
                    <span>{e.getName()}</span>
                    <Badge variant="secondary">{e.getTrainGroup()}</Badge>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-3 gap-0 rounded-xl border-border py-0 shadow-sm">
        <CardHeader className="px-4 pt-4">
          <CardTitle className="flex items-center gap-1.5 text-base">
            <Utensils className="size-4 text-primary" />
            个性化饮食方案
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-4 pt-0">
          <div className="space-y-1.5">
            <Label>活动等级（默认取档案）</Label>
            <Select
              value={effectiveActCode}
              onChange={(e) => {
                setActCode(Number(e.target.value));
                setActCodeTouched(true);
              }}
            >
              <option value={1}>1 久坐</option>
              <option value={2}>2 轻度活动</option>
              <option value={3}>3 中度活动</option>
              <option value={4}>4 高强度活动</option>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>目标</Label>
            <Select value={dietMode} onChange={(e) => setDietMode(e.target.value as Mode)}>
              <option value="LOSE_FAT">减脂</option>
              <option value="MAINTAIN">维持</option>
              <option value="GAIN_MUSCLE">增肌</option>
            </Select>
          </div>
          <Button className="w-full" onClick={buildDiet}>
            生成方案
          </Button>
          {dietErr && <Message ok={false} text={dietErr} />}

          {dietResult && (
            <div className="space-y-3 pt-1">
              {dietResult.warn && (
                <div className="rounded-lg border border-warning/40 bg-warning/10 px-3 py-2.5 text-sm text-warning">
                  {dietResult.warn}
                </div>
              )}
              <div className="grid grid-cols-2 gap-2.5">
                <Stat value={`${Math.round(dietResult.targetCal)}`} label="每日热量 kcal" />
                <Stat value={`${Math.round(dietResult.proteinG)}g`} label="蛋白质" />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <Stat value={`${Math.round(dietResult.fatG)}g`} label="脂肪" />
                <Stat value={`${Math.round(dietResult.carbG)}g`} label="碳水" />
              </div>

              <p className="font-semibold">三餐分配 (3:4:3)</p>
              {(
                [
                  ['早餐', 0.3],
                  ['午餐', 0.4],
                  ['晚餐', 0.3],
                ] as const
              ).map(([label, ratio]) => (
                <div
                  className="flex items-center justify-between gap-2.5 border-b border-border py-2 last:border-0"
                  key={label}
                >
                  <span className="text-muted-foreground">{label}</span>
                  <span className="text-right">
                    {Math.round(dietResult.targetCal * ratio)} kcal · 蛋白质
                    {Math.round(dietResult.proteinG * ratio)}g · 碳水
                    {Math.round(dietResult.carbG * ratio)}g · 脂肪
                    {Math.round(dietResult.fatG * ratio)}g
                  </span>
                </div>
              ))}

              <p className="pt-1 font-semibold">已计入的训练消耗</p>
              {todayTrain ? (
                <>
                  <div className="flex items-center justify-between gap-2.5 border-b border-border py-2 last:border-0">
                    <span className="text-muted-foreground">力量训练消耗</span>
                    <span>{Math.round(strengthBurn)} kcal</span>
                  </div>
                  <div className="flex items-center justify-between gap-2.5 border-b border-border py-2 last:border-0">
                    <span className="text-muted-foreground">有氧训练消耗</span>
                    <span>{Math.round(cardioBurn)} kcal</span>
                  </div>
                  <div className="flex items-center justify-between gap-2.5 border-b border-border py-2 last:border-0">
                    <span className="text-muted-foreground">合计已计入</span>
                    <span>{Math.round(strengthBurn + cardioBurn)} kcal</span>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">今日暂无训练，按休息日标准计算</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {todayTrain === null && (
        <div className="mt-3 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2.5 text-sm text-warning">
          提示：导入计划前，请先在「训练」页新建今日训练
        </div>
      )}
      {todayTrain === null && (
        <Button
          className="mt-2.5 w-full"
          onClick={() => {
            if (user) createToday();
          }}
        >
          立即新建今日训练
        </Button>
      )}
    </div>
  );
}