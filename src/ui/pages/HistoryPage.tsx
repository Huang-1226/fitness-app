import { useMemo, useState } from 'react';
import { addDaysISO, daysBetween, todayISO } from '../../core/dateUtil';
import { useTrainingStore } from '../../store/trainingStore';

export default function HistoryPage() {
  const { history, todayTrain, deleteTraining } = useTrainingStore();
  const [openDate, setOpenDate] = useState<string | null>(null);

  const stats = useMemo(() => {
    const today = todayISO();
    const agoISO = addDaysISO(today, -6);

    const burnByDate = new Map<string, number>();
    const sessions = todayTrain ? [todayTrain, ...history] : history;
    for (const t of sessions) {
      const date = t.getDate();
      if (date >= agoISO && date <= today) {
        burnByDate.set(date, (burnByDate.get(date) ?? 0) + t.getStrengthBurn() + t.getCardioBurn());
      }
    }
    const trainDayCount = burnByDate.size;
    const totalBurn = [...burnByDate.values()].reduce((s, v) => s + v, 0);
    const avgBurn = trainDayCount > 0 ? totalBurn / trainDayCount : 0;
    return { trainDayCount, totalBurn, avgBurn };
  }, [history, todayTrain]);

  return (
    <div className="page">
      <div className="page-title">📊 训练记录</div>

      <div className="card">
        <div className="card-title">近 7 天统计</div>
        <div className="grid-2">
          <div className="stat">
            <div className="stat-value">{stats.trainDayCount}</div>
            <div className="stat-label">有效训练天数</div>
          </div>
          <div className="stat">
            <div className="stat-value">{Math.round(stats.totalBurn)}</div>
            <div className="stat-label">七天总消耗 kcal</div>
          </div>
        </div>
        <div className="stat" style={{ marginTop: 10 }}>
          <div className="stat-value">{Math.round(stats.avgBurn)}</div>
          <div className="stat-label">训练日平均消耗 kcal</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">归档历史</div>
        {history.length === 0 ? (
          <div className="empty">暂无归档训练记录</div>
        ) : (
          history.map((t) => {
            const total = t.getStrengthBurn() + t.getCardioBurn();
            const open = openDate === t.getDate();
            return (
              <div className="list-item" key={t.getDate()}>
                <div
                  style={{ cursor: 'pointer' }}
                  onClick={() => setOpenDate(open ? null : t.getDate())}
                >
                  <div className="list-item-title">
                    {t.getDate()}
                    {t.getRemark() && <span className="muted" style={{ marginLeft: 6 }}>· {t.getRemark()}</span>}
                  </div>
                  <div className="list-item-sub">
                    总消耗 {Math.round(total)} kcal | 容量 {Math.round(t.getDailyTotalVolume())}
                    {'  '}（点击展开详情）
                  </div>
                </div>
                {open && (
                  <div style={{ marginTop: 10 }}>
                    <h3>力量训练</h3>
                    {t.getWorkoutLogs().length === 0 ? (
                      <p className="muted">无</p>
                    ) : (
                      t.getWorkoutLogs().map((log, i) => (
                        <div key={i} style={{ padding: '6px 0', borderTop: '1px solid var(--border)' }}>
                          <b>{log.getExercise().getName()}</b>{' '}
                          <span className="muted">
                            {log.getSetRecords().map((s, j) => (
                              <span key={j}>
                                {s.getTrainWeight()}kg×{s.getReps()}
                                {j < log.getSetRecords().length - 1 ? '  ' : ''}
                              </span>
                            ))}
                          </span>
                          <div className="muscle-line">容量 {Math.round(log.getTrainVolume())}</div>
                        </div>
                      ))
                    )}
                    <h3>有氧训练</h3>
                    {t.getCardioList().length === 0 ? (
                      <p className="muted">无</p>
                    ) : (
                      t.getCardioList().map((c, i) => (
                        <div key={i} style={{ padding: '6px 0', borderTop: '1px solid var(--border)' }}>
                          {c.getCardioName()} · {c.getMinute()}分钟 · {Math.round(c.calcBurn(t.getUserWeight()))} kcal
                        </div>
                      ))
                    )}
                    <button
                      className="btn-sm btn-danger"
                      style={{ marginTop: 10 }}
                      onClick={() => void deleteTraining(t.getDate())}
                    >
                      删除该记录
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      {history.length > 0 && (
        <p className="muted" style={{ fontSize: 12, textAlign: 'center' }}>
          共 {history.length} 条记录 · 最早距今 {daysBetween(history[history.length - 1].getDate(), todayISO())} 天
        </p>
      )}
    </div>
  );
}