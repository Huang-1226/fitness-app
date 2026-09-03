import { useMemo, useState } from 'react';
import { CardioRecord } from '../../core/cardioRecord';
import type { DailyTraining } from '../../core/dailyTraining';
import { findRecoverRuleByGroup } from '../../core/muscleRecoverRule';
import { WorkoutLog } from '../../core/workoutLog';
import { useLibraryStore } from '../../store/libraryStore';
import { useTrainingStore } from '../../store/trainingStore';
import { useUserStore } from '../../store/userStore';
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
      <div className="page">
        <div className="page-title">💪 今日训练</div>
        <div className="card">
          <div className="empty">请先在「首页」创建个人档案</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-title">💪 今日训练</div>

      {!todayTrain ? (
        <div className="card">
          <div className="empty">今天还没有训练记录</div>
          <button className="btn-block" onClick={createToday}>
            新建今日训练
          </button>
        </div>
      ) : (
        <>
          <div className="card">
            <div className="row">
              <span className="muted">训练日期</span>
              <span>{todayTrain.getDate()}</span>
            </div>
            {todayTrain.getRemark() && (
              <div className="row">
                <span className="muted">备注</span>
                <span>{todayTrain.getRemark()}</span>
              </div>
            )}
            <div className="grid-2" style={{ marginTop: 12 }}>
              <div className="stat">
                <div className="stat-value">{Math.round(strengthBurn)}</div>
                <div className="stat-label">力量消耗 kcal</div>
              </div>
              <div className="stat">
                <div className="stat-value">{Math.round(cardioBurn)}</div>
                <div className="stat-label">有氧消耗 kcal</div>
              </div>
            </div>
            <div className="stat" style={{ marginTop: 10 }}>
              <div className="stat-value">{Math.round(totalBurn)} kcal</div>
              <div className="stat-label">今日合计消耗</div>
            </div>
            <p className="muted" style={{ textAlign: 'center', marginTop: 8 }}>
              总训练容量：{Math.round(volume)}
            </p>
          </div>

          <div className="card">
            <div className="card-title">力量训练记录</div>
            {todayTrain.getWorkoutLogs().length === 0 ? (
              <div className="empty">暂无力量记录</div>
            ) : (
              todayTrain.getWorkoutLogs().map((log, i) => (
                <div className="list-item" key={i}>
                  <div className="list-item-title">
                    {log.getExercise().getName()}
                    <span className="badge" style={{ marginLeft: 6 }}>
                      {log.getExercise().getTrainGroup()}
                    </span>
                  </div>
                  <div className="list-item-sub">
                    {log.getSetRecords().map((s, j) => (
                      <span key={j}>
                        {s.getTrainWeight()}kg×{s.getReps()}
                        {j < log.getSetRecords().length - 1 ? '  ' : ''}
                      </span>
                    ))}
                  </div>
                  <div className="list-item-sub">
                    容量 {Math.round(log.getTrainVolume())} | 消耗 {Math.round(log.getTotalBurn(user.getWeight()))} kcal
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="card">
            <div className="card-title">有氧训练记录</div>
            {todayTrain.getCardioList().length === 0 ? (
              <div className="empty">暂无有氧记录</div>
            ) : (
              todayTrain.getCardioList().map((c, i) => (
                <div className="list-item" key={i}>
                  <div className="list-item-title">{c.getCardioName()}</div>
                  <div className="list-item-sub">
                    {c.getMinute()} 分钟 | MET {c.getMetValue()} | 消耗 {Math.round(c.calcBurn(user.getWeight()))} kcal
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="card">
            <button className="btn-block" onClick={() => setShowStrength(true)}>
              力量打卡
            </button>
            <button className="btn-block btn-secondary" onClick={() => setShowCardio(true)}>
              有氧打卡
            </button>
            <button
              className="btn-block btn-secondary"
              onClick={() => {
                setRemarkText(todayTrain.getRemark() ?? '');
                setShowRemark(true);
              }}
            >
              设置备注
            </button>
            <button
              className="btn-block"
              style={{ marginTop: 10 }}
              onClick={() => void archiveToday()}
            >
              归档今日训练
            </button>
          </div>
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
          <textarea
            rows={3}
            value={remarkText}
            onChange={(e) => setRemarkText(e.target.value)}
            placeholder="训练状态、身体感受等"
          />
          <button
            className="btn-block"
            onClick={() => {
              setRemark(remarkText);
              setShowRemark(false);
            }}
          >
            保存备注
          </button>
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
      <label>选择动作</label>
      <select value={name} onChange={(e) => setName(e.target.value)}>
        <option value="">-- 请选择 --</option>
        {options.map((e) => (
          <option key={e.getName()} value={e.getName()}>
            {e.getName()}
          </option>
        ))}
      </select>
      {selected && (
        <p className="muted" style={{ fontSize: 13 }}>
          {selected.getTrainGroup()} | 推荐 {selected.getSets()}组×{selected.getReps()}次 | MET {selected.getMetValue()}
        </p>
      )}
      {warn && <div className="warn">{warn}</div>}

      <h3>已录入组数：{sets.length}</h3>
      {sets.map((s, i) => (
        <div className="row" key={i}>
          <span className="muted">第 {i + 1} 组</span>
          <span>
            {s.w}kg × {s.r}次 × {s.m}min
          </span>
        </div>
      ))}

      <div className="grid-2" style={{ marginTop: 10 }}>
        <div>
          <label>负重 kg</label>
          <input type="number" inputMode="decimal" value={cur.w} onChange={(e) => setCur({ ...cur, w: e.target.value })} />
        </div>
        <div>
          <label>次数</label>
          <input type="number" inputMode="numeric" value={cur.r} onChange={(e) => setCur({ ...cur, r: e.target.value })} />
        </div>
      </div>
      <label>本组用时 (分钟)</label>
      <input type="number" inputMode="numeric" value={cur.m} onChange={(e) => setCur({ ...cur, m: e.target.value })} />
      {err && <div className="error">{err}</div>}
      <button className="btn-block btn-secondary" onClick={addSet}>
        添加本组
      </button>
      <button className="btn-block" onClick={finish}>
        完成打卡
      </button>
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
      <label>选择有氧项目</label>
      {templates.map((t) => (
        <div
          className="list-item"
          key={t.name}
          style={{ cursor: 'pointer', borderColor: name === t.name ? 'var(--accent)' : undefined }}
          onClick={() => {
            setName(t.name);
            setMinute(String(t.recommendMin));
          }}
        >
          <div className="list-item-title">
            {t.name} <span className="badge">MET {t.met}</span>
          </div>
          <div className="list-item-sub">推荐 {t.recommendMin} 分钟</div>
          <div className="muscle-line">{t.tip}</div>
        </div>
      ))}
      <label>本次时长 (分钟)</label>
      <input type="number" inputMode="numeric" value={minute} onChange={(e) => setMinute(e.target.value)} />
      {err && <div className="error">{err}</div>}
      <button className="btn-block" onClick={finish}>
        完成打卡
      </button>
    </Modal>
  );
}