import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardioTemplate } from '@/core/workoutLibrary';
import { useI18n } from '@/i18n/i18nStore';

import { Modal } from './Modal';

export function AddCardioModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (t: CardioTemplate) => Promise<void>;
}) {
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [met, setMet] = useState('6.0');
  const [minutes, setMinutes] = useState('30');
  const [tip, setTip] = useState('');
  const [err, setErr] = useState('');

  const save = async () => {
    if (!name.trim()) {
      setErr(t('lib.nameRequired'));
      return;
    }
    try {
      await onAdd(new CardioTemplate(name.trim(), Number(met), Number(minutes), tip.trim()));
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : t('lib.saveFail'));
    }
  };

  return (
    <Modal title={t('lib.addCardioTitle')} onClose={onClose}>
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label>{t('lib.name')}</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('lib.cardioNamePh')}
          />
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <div className="space-y-1.5">
            <Label>{t('lib.met')}</Label>
            <Input
              type="number"
              inputMode="decimal"
              step="0.1"
              value={met}
              onChange={(e) => setMet(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t('lib.cardioMinutes')}</Label>
            <Input
              type="number"
              inputMode="numeric"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>{t('lib.cardioTip')}</Label>
          <Input value={tip} onChange={(e) => setTip(e.target.value)} placeholder={t('lib.cardioTipPh')} />
        </div>

        {err && <p className="text-sm text-destructive">{err}</p>}
        <Button className="w-full" onClick={save}>
          {t('lib.saveCardio')}
        </Button>
      </div>
    </Modal>
  );
}