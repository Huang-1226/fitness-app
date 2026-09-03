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

export default function PlanPage() {
  const user = useUserStore((s) => s.user);
  const { todayTrain, addWorkoutLog, createToday } = useTrainingStore();
  const library = useLibraryStore((s) => s.library);

  const [planMode, setPlanMode] = useState(1);
  const [g1, setG1] = useState('胸部');
  const [g2, setG2] = useState('背部');
  const [singleTarget, setSingleTarget] = useState('胸部');
  const [plan, setPlan] = useState<Exercise[] | Exercise[][] | null>(null);

  const [filterMuscle, setFilterMuscle] = useState('');
  const [filterThreshold, setFilterThreshold] = useState('70');
  const [filterResult, setFilterResult] = useState<Exercise[] | null>(null);

  const [actCode, setActCode] = useState(user ? user.getActivityCode() : 3);
  const [dietMode, setDietMode] = useState<Mode>('MAINTAIN');
  const [dietResult, setDietResult] = useState<ReturnType<typeof calculateFullNutrition> | null>(null);

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
    setFilterResult(null);
  };

  const importPlan = (list: Exercise[]) => {
    if (!todayTrain) {
      alert('请先在「训练」页新建今日训练，再导入计划');
      return;
    }
    for (const ex of list) {
      addWorkoutLog(new WorkoutLog(ex));
    }
    alert(`已导入 ${list.length} 个动作到今日训练`);
  };

  const buildDiet = () => {
    if (!user) {
      alert('请先创建个人档案');
      return;
    }
    const todayBurn = todayTrain ? todayTrain.getStrengthBurn() + todayTrain.getCardioBurn() : 0;
    const result = calculateFullNutrition(user, dietMode, actCode, todayBurn);
    setDietResult(result);
  };

  const showPlan = (planMode: number) => {
    if (plan === null) return null;
    if (planMode === 4 && Array.isArray(plan) && plan[0] && Array.isArray(plan[0])) {
      const days = plan as Exercise[][];
      const labels = ['推 Push · 胸肩三头', '拉 Pull · 背二头', '腿 Leg · 腿臀核心'];
      return (
        <>
          {days.map((day, i) => (
            <div className="list-item" key={i}>
              <div className="list-item-title">{labels[i]}</div>
              <div className="muscle-line">
                {day.map((e) => `${e.getName()}(${e.getSets()}×${e.getReps()})`).join('  ')}
              </div>
              <button className="btn-sm" style={{ marginTop: 8 }} onClick={() => importPlan(day)}>
                导入今日训练
              </button>
            </div>
          ))}
        </>
      );
    }
    const list = plan as Exercise[];
    return (
      <div className="list-item">
        <div className="muscle-line">
          {list.map((e) => `${e.getName()}(${e.getSets()}×${e.getReps()})`).join('  ')}
        </div>
        <button className="btn-sm" style={{ marginTop: 8 }} onClick={() => importPlan(list)}>
          导入今日训练
        </button>
      </div>
    );
  };

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
        {plan && <div style={{ marginTop: 12 }}>{showPlan(planMode)}</div>}
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
        <select value={actCode} onChange={(e) => setActCode(Number(e.target.value))}>
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
            <button
              className="btn-block btn-secondary"
              style={{ marginTop: 10 }}
              onClick={() => {
                if (!todayTrain) {
                  alert('请先新建今日训练，或今日暂无训练按休息日计算');
                  return;
                }
                alert(
                  `今日训练消耗 ${Math.round(todayTrain.getStrengthBurn() + todayTrain.getCardioBurn())} kcal 已计入方案`,
                );
              }}
            >
              查看今日训练消耗明细
            </button>
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