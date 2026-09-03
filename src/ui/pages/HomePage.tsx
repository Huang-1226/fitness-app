import { useState } from 'react';
import type { Person } from '../../core/person';
import { Modal } from '../components/Modal';
import { useUserStore } from '../../store/userStore';

function ProfileForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Person;
  onSubmit: (gender: string, height: number, weight: number, age: number) => Promise<void>;
  onCancel: () => void;
}) {
  const [gender, setGender] = useState(initial ? initial.getGender() : 'male');
  const [age, setAge] = useState(initial ? String(initial.getAge()) : '');
  const [height, setHeight] = useState(initial ? String(initial.getHeight()) : '');
  const [weight, setWeight] = useState(initial ? String(initial.getWeight()) : '');
  const [err, setErr] = useState('');

  const submit = async () => {
    try {
      await onSubmit(gender, Number(height), Number(weight), Number(age));
    } catch (e) {
      setErr(e instanceof Error ? e.message : '输入有误');
    }
  };

  return (
    <div>
      <label>性别</label>
      <select value={gender} onChange={(e) => setGender(e.target.value)}>
        <option value="male">男</option>
        <option value="female">女</option>
      </select>
      <label>年龄</label>
      <input type="number" inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)} placeholder="如 20" />
      <label>身高 (cm)</label>
      <input type="number" inputMode="decimal" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="如 175" />
      <label>体重 (kg)</label>
      <input type="number" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="如 70" />
      {err && <div className="error">{err}</div>}
      <button className="btn-block" onClick={submit}>
        保存档案
      </button>
      <button className="btn-block btn-secondary" onClick={onCancel}>
        取消
      </button>
    </div>
  );
}

export default function HomePage() {
  const { user, loaded, createProfile, setActivityCode, addWeightRecord } = useUserStore();
  const [showEdit, setShowEdit] = useState(false);
  const [showWeight, setShowWeight] = useState(false);
  const [weightInput, setWeightInput] = useState('');
  const [weightErr, setWeightErr] = useState('');

  if (!loaded) {
    return <div className="page">加载中…</div>;
  }

  const saveProfile = async (gender: string, height: number, weight: number, age: number) => {
    const p = await createProfile(gender, height, weight, age);
    void p;
    setShowEdit(false);
  };

  const submitWeight = async () => {
    const w = Number(weightInput);
    if (!w || w <= 0) {
      setWeightErr('体重必须大于0');
      return;
    }
    await addWeightRecord(w);
    setWeightInput('');
    setShowWeight(false);
  };

  return (
    <div className="page">
      <div className="page-title">🏋️ 我的档案</div>

      {!user && (
        <div className="card">
          <div className="card-title">创建个人档案</div>
          <ProfileForm onSubmit={saveProfile} onCancel={() => undefined} />
        </div>
      )}

      {user && (
        <>
          <div className="card">
            <div className="row">
              <span className="muted">性别</span>
              <span>{user.getGender() === 'male' ? '男' : '女'}</span>
            </div>
            <div className="row">
              <span className="muted">年龄</span>
              <span>{user.getAge()} 岁</span>
            </div>
            <div className="row">
              <span className="muted">身高 / 体重</span>
              <span>
                {user.getHeight()} cm / {user.getWeight()} kg
              </span>
            </div>
            <div className="row">
              <span className="muted">基础代谢 BMR</span>
              <span>{Math.round(user.getBMR())} kcal</span>
            </div>
            <div className="grid-2" style={{ marginTop: 12 }}>
              <div className="stat">
                <div className="stat-value">{user.getBMI().toFixed(1)}</div>
                <div className="stat-label">BMI</div>
              </div>
              <div className="stat">
                <div className="stat-value">{Math.round(user.getTDEE(user.getActivityCode()))}</div>
                <div className="stat-label">每日总消耗 TDEE</div>
              </div>
            </div>
            <p style={{ marginTop: 12 }}>
              <span className="badge">{user.getBMILevel()}</span>
            </p>
            <button className="btn-block btn-secondary" onClick={() => setShowEdit(true)}>
              编辑档案
            </button>
          </div>

          <div className="card">
            <div className="card-title">日常活动等级</div>
            <select
              value={user.getActivityCode()}
              onChange={(e) => void setActivityCode(Number(e.target.value))}
            >
              <option value={1}>1 久坐</option>
              <option value={2}>2 轻度活动</option>
              <option value={3}>3 中度活动</option>
              <option value={4}>4 高强度活动</option>
            </select>
            <p className="muted" style={{ fontSize: 12, marginTop: 6 }}>
              影响 TDEE 与饮食方案计算
            </p>
            <button className="btn-block btn-secondary" onClick={() => setShowWeight(true)}>
              录入今日体重
            </button>
          </div>

          <div className="card">
            <div className="card-title">体重追踪</div>
            {user.getWeightRecordList().length === 0 ? (
              <div className="empty">暂无体重记录</div>
            ) : (
              user
                .getWeightRecordList()
                .slice()
                .reverse()
                .map((r) => (
                  <div className="row" key={r.getRecordDate()}>
                    <span className="muted">{r.getRecordDate()}</span>
                    <span>{r.getWeight()} kg</span>
                  </div>
                ))
            )}
          </div>
        </>
      )}

      {showEdit && user && (
        <Modal title="编辑档案" onClose={() => setShowEdit(false)}>
          <ProfileForm initial={user} onSubmit={saveProfile} onCancel={() => setShowEdit(false)} />
        </Modal>
      )}

      {showWeight && (
        <Modal title="录入今日体重" onClose={() => setShowWeight(false)}>
          <label>体重 (kg)</label>
          <input
            type="number"
            inputMode="decimal"
            value={weightInput}
            onChange={(e) => setWeightInput(e.target.value)}
            placeholder="如 69.5"
          />
          {weightErr && <div className="error">{weightErr}</div>}
          <button className="btn-block" onClick={submitWeight}>
            保存
          </button>
        </Modal>
      )}
    </div>
  );
}