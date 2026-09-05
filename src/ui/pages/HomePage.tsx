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
import { useI18n } from '@/i18n/i18nStore';
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
  const { t } = useI18n();
  const [gender, setGender] = useState(initial ? initial.getGender() : 'male');
  const [age, setAge] = useState(initial ? String(initial.getAge()) : '');
  const [height, setHeight] = useState(initial ? String(initial.getHeight()) : '');
  const [weight, setWeight] = useState(initial ? String(initial.getWeight()) : '');
  const [err, setErr] = useState('');

  const submit = async () => {
    try {
      await onSubmit(gender, Number(height), Number(weight), Number(age));
    } catch (e) {
      setErr(e instanceof Error ? e.message : t('home.invalidInput'));
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>{t('home.gender')}</Label>
        <Select value={gender} onChange={(e) => setGender(e.target.value)}>
          <option value="male">{t('common.male')}</option>
          <option value="female">{t('common.female')}</option>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>{t('home.age')}</Label>
        <Input
          type="number"
          inputMode="numeric"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          placeholder={t('home.agePh')}
        />
      </div>
      <div className="space-y-1.5">
        <Label>{t('home.height')}</Label>
        <Input
          type="number"
          inputMode="decimal"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          placeholder={t('home.heightPh')}
        />
      </div>
      <div className="space-y-1.5">
        <Label>{t('home.weight')}</Label>
        <Input
          type="number"
          inputMode="decimal"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder={t('home.weightPh')}
        />
      </div>
      {err && <p className="text-sm text-destructive">{err}</p>}
      <Button className="w-full" onClick={submit}>
        {t('home.saveProfile')}
      </Button>
      <Button className="w-full" variant="secondary" onClick={onCancel}>
        {t('common.cancel')}
      </Button>
    </div>
  );
}

export default function HomePage() {
  const { t, d } = useI18n();
  const { user, loaded, createProfile, setActivityCode, addWeightRecord } = useUserStore();
  const [showEdit, setShowEdit] = useState(false);
  const [showWeight, setShowWeight] = useState(false);
  const [weightInput, setWeightInput] = useState('');
  const [weightErr, setWeightErr] = useState('');

  if (!loaded) {
    return <div className="px-4 pt-4">{t('common.loading')}</div>;
  }

  const saveProfile = async (gender: string, height: number, weight: number, age: number) => {
    await createProfile(gender, height, weight, age);
    setShowEdit(false);
  };

  const submitWeight = async () => {
    const w = Number(weightInput);
    if (!w || w <= 0) {
      setWeightErr(t('home.weightGt0'));
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
        {t('home.title')}
      </h1>

      {!user && (
        <Card className="gap-0 rounded-xl border-border py-0 shadow-sm">
          <CardHeader className="px-4 pt-4">
            <CardTitle className="text-base">{t('home.createProfile')}</CardTitle>
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
                <span className="text-muted-foreground">{t('home.gender')}</span>
                <span>{user.getGender() === 'male' ? t('common.male') : t('common.female')}</span>
              </div>
              <div className="flex items-center justify-between gap-2.5 border-b border-border py-2 last:border-0">
                <span className="text-muted-foreground">{t('home.age')}</span>
                <span>
                  {user.getAge()} {t('home.yearsOld')}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2.5 border-b border-border py-2 last:border-0">
                <span className="text-muted-foreground">{t('home.heightWeight')}</span>
                <span>
                  {user.getHeight()} cm / {user.getWeight()} kg
                </span>
              </div>
              <div className="flex items-center justify-between gap-2.5 border-b border-border py-2 last:border-0">
                <span className="text-muted-foreground">{t('home.bmr')}</span>
                <span>{Math.round(user.getBMR())} kcal</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2.5">
                <Stat value={user.getBMI().toFixed(1)} label={t('home.bmi')} />
                <Stat
                  value={`${Math.round(user.getTDEE(user.getActivityCode()))}`}
                  label={t('home.tdee')}
                />
              </div>
              <div className="mt-3">
                <Badge variant="secondary">{d(user.getBMILevel())}</Badge>
              </div>
              <Button className="mt-4 w-full" variant="secondary" onClick={() => setShowEdit(true)}>
                <Pencil className="size-4" />
                {t('home.editProfile')}
              </Button>
            </CardContent>
          </Card>

          <Card className="mt-3 gap-0 rounded-xl border-border py-0 shadow-sm">
            <CardContent className="p-4">
              <CardTitle className="mb-3 text-base">{t('home.activityLevel')}</CardTitle>
              <Select
                value={user.getActivityCode()}
                onChange={(e) => void setActivityCode(Number(e.target.value))}
              >
                <option value={1}>{t('activity.1')}</option>
                <option value={2}>{t('activity.2')}</option>
                <option value={3}>{t('activity.3')}</option>
                <option value={4}>{t('activity.4')}</option>
              </Select>
              <p className="mt-1.5 text-xs text-muted-foreground">{t('home.activityTip')}</p>
              <Button className="mt-4 w-full" variant="secondary" onClick={() => setShowWeight(true)}>
                <Scale className="size-4" />
                {t('home.logWeight')}
              </Button>
            </CardContent>
          </Card>

          <Card className="mt-3 gap-0 rounded-xl border-border py-0 shadow-sm">
            <CardContent className="p-4">
              <CardTitle className="mb-1 text-base">{t('home.weightHistory')}</CardTitle>
              {user.getWeightRecordList().length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  {t('home.noWeightRecords')}
                </p>
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
        <Modal title={t('home.editProfile')} onClose={() => setShowEdit(false)}>
          <ProfileForm initial={user} onSubmit={saveProfile} onCancel={() => setShowEdit(false)} />
        </Modal>
      )}

      {showWeight && (
        <Modal title={t('home.logWeight')} onClose={() => setShowWeight(false)}>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>{t('home.weight')}</Label>
              <Input
                type="number"
                inputMode="decimal"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                placeholder={t('home.weightPhModal')}
              />
            </div>
            {weightErr && <p className="text-sm text-destructive">{weightErr}</p>}
            <Button className="w-full" onClick={submitWeight}>
              {t('common.save')}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}