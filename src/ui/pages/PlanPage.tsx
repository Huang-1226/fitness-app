import { useState } from 'react';
import type { Exercise } from '../../core/exercise';
import {
  calculateFullNutrition,
  type Mode,
} from '../../core/nutritionCalculator';
import { WorkoutLog } from '../../core/workoutLog';
import { useLibraryStore } from '../../store/libraryStore';
import { useTrainingStore } from '../../store/trainingStore';
import { useUserStore } from '../../store/userStore';

const GROUP_COLORS: Record<string, string> = {
  胸部: '#f87171',
  背部: '#60a5fa',
  腿部: '#34d399',
  核心: '#facc15',
  肩部: '#c084fc',
  手臂: '#fb923c',
};

function groupColor(group: string): string {
  return GROUP_COLORS[group] ?? '#60a5fa';
}

function planStats(list: Exercise[]) {
  const totalSets = list.reduce((s, e) => s + e.getSets(), 0);
  return { count: list.length, totalSets };
}

function PlanRow({ e, index }: { e: Exercise; index: number }) {
  const color = groupColor(e.getTrainGroup());
  const main = e.getMuscleRatios()[0];
  return (
    <div className="plan-ex-row" style={{ borderLeftColor: color }}>
      <span className="plan-ex-index" style={{ background: color }}>
        {index}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="plan-ex-name">{e.getName()}</div>
        <div className="plan-ex-meta">
          <span className="plan-tag" style={{ color, borderColor: color, background: `${color}1f` }}>
            {e.getTrainGroup()}
          </span>
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
      <span className="plan-ex-met">MET {e.getMetValue()}</span>
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
      const dayMeta = [
        { label: '推 Push', sub: '胸 · 肩 · 三头', color: '#f87171' },
        { label: '拉 Pull', sub: '背 · 二头', color: '#60a5fa' },
        { label: '腿 Leg', sub: '腿 · 臀 · 核心', color: '#34d399' },
      ];
      return (
        <>
          {days.map((day, i) => {
            const st = planStats(day);
            const meta = dayMeta[i];
            return (
              <div className="plan-day-card" key={i} style={{ borderColor: `${meta.color}55` }}>
                <div className="plan-day-head" style={{ background: `${meta.color}1a` }}>
                  <div>
                    <div className="plan-day-title" style={{ color: meta.color }}>
                      {meta.label}
                    </div>
                    <div className="plan-day-sub">{meta.sub}</div>
                  </div>
                  <div className="plan-day-badges">
                    <span className="plan-tag" style={{ color: meta.color, borderColor: meta.color, background: `${meta.color}1f` }}>
                      {st.count} 个动作
                    </span>
                    <span className="plan-tag">约 {st.totalSets} 组</span>
                  </div>
                </div>
                <div className="plan-ex-list">
                  {day.map((e, j) => (
                    <PlanRow key={e.getName()} e={e} index={j + 1} />
                  ))}
                </div>
                <button className="btn-block btn-secondary" style={{ marginTop: 12 }} onClick={() => importPlan(day)}>
                  导入今日训练
                </button>
              </div>
            );
          })}
        </>
      );
    }
    const list = plan as Exercise[];
    const st = planStats(list);
    return (
      <div className="plan-day-card" style={{ borderColor: 'var(--border)' }}>
        <div className="plan-day-head" style={{ background: 'var(--surface-2)' }}>
          <div>
            <div className="plan-day-title">生成计划</div>
            <div className="plan-day-sub">预计时长约 {Math.round(st.totalSets * 2.5)} 分钟</div>
          </div>
          <div className="plan-day-badges">
            <span className="plan-tag" style={{ color: 'var(--accent-2)', borderColor: 'var(--accent-2)' }}>
              {st.count} 个动作
            </span>
            <span className="plan-tag">约 {st.totalSets} 组</span>
          </div>
        </div>
        <div className="plan-ex-list">
          {list.map((e, j) => (
            <PlanRow key={e.getName()} e={e} index={j + 1} />
          ))}
        </div>
        <button className="btn-block btn-secondary" style={{ marginTop: 12 }} onClick={() => importPlan(list)}>
          导入今日训练
        </button>
      </div>
    );
  };

  const strengthBurn = todayTrain ? todayTrain.getStrengthBurn() : 0;
  const cardioBurn = todayTrain ? todayTrain.getCardioBurn() : 0;

  return (
    <div className="page">
      <div className="page-title">📋 计划 & 饮食</div>

      <div className="card">
        <div className="card-title">训练计划生成</div>
        <label>模式</label>
        <select value={planMode} onChange={(e) => setPlanMode(Number(e.target.value))}>
          <option value={1}>全身训练</option>
          <option value={2}>双部位分化</option>
          <option value={3}>单肌群专攻</option>
          <option value={4}>推拉腿三分化 PPL</option>
        </select>
        {planMode === 2 && (
          <div className="grid-2">
            <div>
              <label>部位 1</label>
              <select value={g1} onChange={(e) => setG1(e.target.value)}>
                {groups.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label>部位 2</label>
              <select value={g2} onChange={(e) => setG2(e.target.value)}>
                {groups.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>
        )}
        {planMode === 3 && (
          <div>
            <label>目标肌群</label>
            <select value={singleTarget} onChange={(e) => setSingleTarget(e.target.value)}>
              {groups.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </div>
        )}
        <button className="btn-block" onClick={generatePlan}>
          生成计划
        </button>
        {planMsg && <div className={planMsgOk ? 'ok' : 'error'}>{planMsg}</div>}
        <div style={{ marginTop: 12 }}>{renderPlanResult()}</div>
      </div>

      <div className="card">
        <div className="card-title">按肌肉筛选主打动作</div>
        <label>目标肌肉</label>
        <input value={filterMuscle} onChange={(e) => setFilterMuscle(e.target.value)} placeholder="如 胸大肌 / 背阔肌" />
        <label>最低发力占比 (%)</label>
        <input type="number" inputMode="decimal" value={filterThreshold} onChange={(e) => setFilterThreshold(e.target.value)} />
        <button
          className="btn-block"
          onClick={() => {
            setFilterResult(library.findMainExerciseByMuscle(filterMuscle, Number(filterThreshold)));
            setPlan(null);
          }}
        >
          筛选
        </button>
        {filterResult && (
          <div style={{ marginTop: 12 }}>
            {filterResult.length === 0 ? (
              <div className="empty">无匹配动作</div>
            ) : (
              filterResult.map((e) => (
                <div className="row" key={e.getName()}>
                  <span>{e.getName()}</span>
                  <span className="badge">{e.getTrainGroup()}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-title">个性化饮食方案</div>
        <label>活动等级（默认取档案）</label>
        <select
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
        </select>
        <label>目标</label>
        <select value={dietMode} onChange={(e) => setDietMode(e.target.value as Mode)}>
          <option value="LOSE_FAT">减脂</option>
          <option value="MAINTAIN">维持</option>
          <option value="GAIN_MUSCLE">增肌</option>
        </select>
        <button className="btn-block" onClick={buildDiet}>
          生成方案
        </button>
        {dietErr && <div className="error">{dietErr}</div>}

        {dietResult && (
          <div style={{ marginTop: 14 }}>
            {dietResult.warn && <div className="warn">{dietResult.warn}</div>}
            <div className="grid-2">
              <div className="stat">
                <div className="stat-value">{Math.round(dietResult.targetCal)}</div>
                <div className="stat-label">每日热量 kcal</div>
              </div>
              <div className="stat">
                <div className="stat-value">{Math.round(dietResult.proteinG)}g</div>
                <div className="stat-label">蛋白质</div>
              </div>
            </div>
            <div className="grid-2" style={{ marginTop: 10 }}>
              <div className="stat">
                <div className="stat-value">{Math.round(dietResult.fatG)}g</div>
                <div className="stat-label">脂肪</div>
              </div>
              <div className="stat">
                <div className="stat-value">{Math.round(dietResult.carbG)}g</div>
                <div className="stat-label">碳水</div>
              </div>
            </div>

            <h3>三餐分配 (3:4:3)</h3>
            {(
              [
                ['早餐', 0.3],
                ['午餐', 0.4],
                ['晚餐', 0.3],
              ] as const
            ).map(([label, ratio]) => (
              <div className="row" key={label}>
                <span className="muted">{label}</span>
                <span>
                  {Math.round(dietResult.targetCal * ratio)} kcal · 蛋白质
                  {Math.round(dietResult.proteinG * ratio)}g · 碳水
                  {Math.round(dietResult.carbG * ratio)}g · 脂肪
                  {Math.round(dietResult.fatG * ratio)}g
                </span>
              </div>
            ))}

            <h3>已计入的训练消耗</h3>
            {todayTrain ? (
              <>
                <div className="row">
                  <span className="muted">力量训练消耗</span>
                  <span>{Math.round(strengthBurn)} kcal</span>
                </div>
                <div className="row">
                  <span className="muted">有氧训练消耗</span>
                  <span>{Math.round(cardioBurn)} kcal</span>
                </div>
                <div className="row">
                  <span className="muted">合计已计入</span>
                  <span>{Math.round(strengthBurn + cardioBurn)} kcal</span>
                </div>
              </>
            ) : (
              <p className="muted">今日暂无训练，按休息日标准计算</p>
            )}
          </div>
        )}
      </div>
      {todayTrain === null && <div className="warn">提示：导入计划前，请先在「训练」页新建今日训练</div>}
      {todayTrain === null && (
        <button className="btn-block" onClick={() => { if (user) createToday(); }}>
          立即新建今日训练
        </button>
      )}
    </div>
  );
}