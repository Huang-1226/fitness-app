import { useMemo, useState } from 'react';
import { Exercise, MuscleRatio } from '../../core/exercise';
import { useLibraryStore } from '../../store/libraryStore';
import { Modal } from '../components/Modal';

const GROUPS = ['胸部', '背部', '腿部', '核心', '肩部', '手臂'];

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
    <div className="page">
      <div className="page-title">🗂️ 动作库</div>

      <div className="card">
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          <span className="tag" style={{ cursor: 'pointer', borderColor: group === null ? 'var(--accent)' : undefined }} onClick={() => setGroup(null)}>
            全部
          </span>
          {GROUPS.map((g) => (
            <span
              className="tag"
              key={g}
              style={{ cursor: 'pointer', borderColor: group === g ? 'var(--accent)' : undefined }}
              onClick={() => setGroup(g)}
            >
              {g}
            </span>
          ))}
        </div>
        <button className="btn-block btn-secondary" onClick={() => setShowAdd(true)}>
          ＋ 新增力量动作
        </button>
      </div>

      <div className="card">
        <div className="card-title">力量动作（{exercises.length}）</div>
        {exercises.map((e) => (
          <div className="list-item" key={e.getName()}>
            <div className="list-item-title">
              {e.getName()}
              <span className="badge" style={{ marginLeft: 6 }}>
                {e.getTrainGroup()}
              </span>
            </div>
            <div className="list-item-sub">
              推荐 {e.getSets()}组×{e.getReps()}次 | MET {e.getMetValue()}
            </div>
            {e.getMuscleRatios().length > 0 && (
              <div className="muscle-line">
                {e.getMuscleRatios().map((mr) => `${mr.getMuscleName()} ${mr.getRatio()}%`).join(' · ')}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-title">有氧模板</div>
        {cardio.map((t) => (
          <div className="list-item" key={t.name}>
            <div className="list-item-title">
              {t.name} <span className="badge">MET {t.met}</span>
            </div>
            <div className="list-item-sub">推荐 {t.recommendMin} 分钟</div>
            <div className="muscle-line">{t.tip}</div>
          </div>
        ))}
      </div>

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
      <label>动作名称</label>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="如 杠铃弯举" />
      <label>所属肌群</label>
      <select value={trainGroup} onChange={(e) => setTrainGroup(e.target.value)}>
        {GROUPS.map((g) => (
          <option key={g}>{g}</option>
        ))}
      </select>
      <div className="grid-2">
        <div>
          <label>推荐组数</label>
          <input type="number" inputMode="numeric" value={sets} onChange={(e) => setSets(e.target.value)} />
        </div>
        <div>
          <label>推荐次数</label>
          <input type="number" inputMode="numeric" value={reps} onChange={(e) => setReps(e.target.value)} />
        </div>
      </div>
      <label>MET 值</label>
      <input type="number" inputMode="decimal" step="0.1" value={met} onChange={(e) => setMet(e.target.value)} />

      <h3>发力肌肉占比（可选）</h3>
      {muscles.map((m, i) => (
        <div className="row" key={i}>
          <span>{m.name}</span>
          <span className="muted">{m.ratio}%</span>
        </div>
      ))}
      <div className="grid-2">
        <div>
          <label>肌肉名称</label>
          <input value={mName} onChange={(e) => setMName(e.target.value)} />
        </div>
        <div>
          <label>占比 %</label>
          <input type="number" inputMode="decimal" value={mRatio} onChange={(e) => setMRatio(e.target.value)} />
        </div>
      </div>
      <button
        className="btn-block btn-secondary"
        onClick={() => {
          if (mName.trim() && Number(mRatio) > 0) {
            setMuscles([...muscles, { name: mName, ratio: mRatio }]);
            setMName('');
            setMRatio('');
          }
        }}
      >
        添加肌肉
      </button>

      {err && <div className="error">{err}</div>}
      <button className="btn-block" onClick={save}>
        保存动作
      </button>
    </Modal>
  );
}