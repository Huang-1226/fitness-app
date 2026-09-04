import { Dumbbell, Pencil, Scale } from 'lucide-react';
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
import type { Person } from '@/core/person';
import { Select } from '@/ui/components/Select';
import { Stat } from '@/ui/components/Stat';

import { useUserStore } from '../../store/userStore';
import { Modal } from '../components/Modal';

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
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>性别</Label>
        <Select value={gender} onChange={(e) => setGender(e.target.value)}>
          <option value="male">男</option>
          <option value="female">女</option>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>年龄</Label>
        <Input
          type="number"
          inputMode="numeric"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          placeholder="如 20"
        />
      </div>
      <div className="space-y-1.5">
        <Label>身高 (cm)</Label>
        <Input
          type="number"
          inputMode="decimal"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          placeholder="如 175"
        />
      </div>
      <div className="space-y-1.5">
        <Label>体重 (kg)</Label>
        <Input
          type="number"
          inputMode="decimal"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="如 70"
        />
      </div>
      {err && <p className="text-sm text-destructive">{err}</p>}
      <Button className="w-full" onClick={submit}>
        保存档案
      </Button>
      <Button className="w-full" variant="secondary" onClick={onCancel}>
        取消
      </Button>
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
    return <div className="px-4 pt-4">加载中…</div>;
  }

  const saveProfile = async (gender: string, height: number, weight: number, age: number) => {
    await createProfile(gender, height, weight, age);
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
    <div className="px-4 pt-4 pb-[calc(76px+env(safe-area-inset-bottom))]">
      <h1 className="mb-4 flex items-center gap-2 text-2xl font-bold">
        <Dumbbell className="size-6 text-primary" />
        我的档案
      </h1>

      {!user && (
        <Card className="gap-0 rounded-xl border-border py-0 shadow-sm">
          <CardHeader className="px-4 pt-4">
            <CardTitle className="text-base">创建个人档案</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <ProfileForm onSubmit={saveProfile} onCancel={() => undefined} />
          </CardContent>
        </Card>
      )}

      {user && (
        <>
          <Card className="gap-0 rounded-xl border-border py-0 shadow-sm">
            <CardContent className="space-y-0 p-4">
              <div className="flex items-center justify-between gap-2.5 border-b border-border py-2 last:border-0">
                <span className="text-muted-foreground">性别</span>
                <span>{user.getGender() === 'male' ? '男' : '女'}</span>
              </div>
              <div className="flex items-center justify-between gap-2.5 border-b border-border py-2 last:border-0">
                <span className="text-muted-foreground">年龄</span>
                <span>{user.getAge()} 岁</span>
              </div>
              <div className="flex items-center justify-between gap-2.5 border-b border-border py-2 last:border-0">
                <span className="text-muted-foreground">身高 / 体重</span>
                <span>
                  {user.getHeight()} cm / {user.getWeight()} kg
                </span>
              </div>
              <div className="flex items-center justify-between gap-2.5 border-b border-border py-2 last:border-0">
                <span className="text-muted-foreground">基础代谢 BMR</span>
                <span>{Math.round(user.getBMR())} kcal</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2.5">
                <Stat value={user.getBMI().toFixed(1)} label="BMI" />
                <Stat value={`${Math.round(user.getTDEE(user.getActivityCode()))}`} label="每日总消耗 TDEE" />
              </div>
              <div className="mt-3">
                <Badge variant="secondary">{user.getBMILevel()}</Badge>
              </div>
              <Button className="mt-4 w-full" variant="secondary" onClick={() => setShowEdit(true)}>
                <Pencil className="size-4" />
                编辑档案
              </Button>
            </CardContent>
          </Card>

          <Card className="mt-3 gap-0 rounded-xl border-border py-0 shadow-sm">
            <CardContent className="p-4">
              <CardTitle className="mb-3 text-base">日常活动等级</CardTitle>
              <Select
                value={user.getActivityCode()}
                onChange={(e) => void setActivityCode(Number(e.target.value))}
              >
                <option value={1}>1 久坐</option>
                <option value={2}>2 轻度活动</option>
                <option value={3}>3 中度活动</option>
                <option value={4}>4 高强度活动</option>
              </Select>
              <p className="mt-1.5 text-xs text-muted-foreground">
                影响 TDEE 与饮食方案计算
              </p>
              <Button className="mt-4 w-full" variant="secondary" onClick={() => setShowWeight(true)}>
                <Scale className="size-4" />
                录入今日体重
              </Button>
            </CardContent>
          </Card>

          <Card className="mt-3 gap-0 rounded-xl border-border py-0 shadow-sm">
            <CardContent className="p-4">
              <CardTitle className="mb-1 text-base">体重追踪</CardTitle>
              {user.getWeightRecordList().length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">暂无体重记录</p>
              ) : (
                user
                  .getWeightRecordList()
                  .slice()
                  .reverse()
                  .map((r) => (
                    <div
                      className="flex items-center justify-between gap-2.5 border-b border-border py-2 last:border-0"
                      key={r.getRecordDate()}
                    >
                      <span className="text-muted-foreground">{r.getRecordDate()}</span>
                      <span>{r.getWeight()} kg</span>
                    </div>
                  ))
              )}
            </CardContent>
          </Card>
        </>
      )}

      {showEdit && user && (
        <Modal title="编辑档案" onClose={() => setShowEdit(false)}>
          <ProfileForm initial={user} onSubmit={saveProfile} onCancel={() => setShowEdit(false)} />
        </Modal>
      )}

      {showWeight && (
        <Modal title="录入今日体重" onClose={() => setShowWeight(false)}>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>体重 (kg)</Label>
              <Input
                type="number"
                inputMode="decimal"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                placeholder="如 69.5"
              />
            </div>
            {weightErr && <p className="text-sm text-destructive">{weightErr}</p>}
            <Button className="w-full" onClick={submitWeight}>
              保存
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}