import { BarChart3, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { addDaysISO, daysBetween, todayISO } from '@/core/dateUtil';
import { useI18n } from '@/i18n/i18nStore';
import { useTrainingStore } from '@/store/trainingStore';
import { PageHeader } from '@/ui/components/PageHeader';
import { Stat } from '@/ui/components/Stat';

const CHART_W = 294;
const CHART_H = 150;
const BAR_W = 24;
const BAR_GAP = (CHART_W - BAR_W * 7) / 6;
const TOP_PAD = 18;
const BOTTOM_PAD = 20;
const INNER_H = CHART_H - TOP_PAD - BOTTOM_PAD;

function WeekChart({
  history,
  todayTrain,
}: {
  history: ReturnType<typeof useTrainingStore.getState>['history'];
  todayTrain: ReturnType<typeof useTrainingStore.getState>['todayTrain'];
}) {
  const { t } = useI18n();
  const days = useMemo(() => {
    const today = todayISO();
    const dayBurn = new Map<string, number>();
    const sessions = todayTrain ? [todayTrain, ...history] : history;
    for (const tt of sessions) {
      const burn = tt.getStrengthBurn() + tt.getCardioBurn();
      dayBurn.set(tt.getDate(), (dayBurn.get(tt.getDate()) ?? 0) + burn);
    }
    const items: { date: string; burn: number; label: string }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = addDaysISO(today, -i);
      const burn = dayBurn.get(date) ?? 0;
      const [, m, d] = date.split('-');
      items.push({ date, burn, label: `${Number(m)}/${Number(d)}` });
    }
    return items;
  }, [history, todayTrain]);

  const max = Math.max(...days.map((d) => d.burn), 1);

  return (
    <svg
      viewBox={`0 0 ${CHART_W} ${CHART_H}`}
      className="h-auto w-full"
      role="img"
      aria-label={t('history.chartAria')}
    >
      {days.map((d, i) => {
        const x = i * (BAR_W + BAR_GAP);
        const barH = Math.max((d.burn / max) * INNER_H, 3);
        const y = TOP_PAD + (INNER_H - barH);
        const active = d.burn > 0;
        return (
          <g key={d.date}>
            <rect
              x={x}
              y={y}
              width={BAR_W}
              height={barH}
              rx={4}
              className={active ? 'fill-primary' : 'fill-border'}
            />
            {active && (
              <text
                x={x + BAR_W / 2}
                y={y - 4}
                textAnchor="middle"
                className="fill-muted-foreground"
                fontSize={9}
              >
                {Math.round(d.burn)}
              </text>
            )}
            <text
              x={x + BAR_W / 2}
              y={CHART_H - 4}
              textAnchor="middle"
              className="fill-muted-foreground"
              fontSize={9}
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function HistoryPage() {
  const { t, d } = useI18n();
  const { history, todayTrain, deleteTraining } = useTrainingStore();
  const [openDate, setOpenDate] = useState<string | null>(null);

  const stats = useMemo(() => {
    const today = todayISO();
    const agoISO = addDaysISO(today, -6);

    const burnByDate = new Map<string, number>();
    const sessions = todayTrain ? [todayTrain, ...history] : history;
    for (const tt of sessions) {
      const date = tt.getDate();
      if (date >= agoISO && date <= today) {
        burnByDate.set(date, (burnByDate.get(date) ?? 0) + tt.getStrengthBurn() + tt.getCardioBurn());
      }
    }
    const trainDayCount = burnByDate.size;
    const totalBurn = [...burnByDate.values()].reduce((s, v) => s + v, 0);
    const avgBurn = trainDayCount > 0 ? totalBurn / trainDayCount : 0;
    return { trainDayCount, totalBurn, avgBurn };
  }, [history, todayTrain]);

  return (
    <div className="px-4 pt-4 pb-[calc(76px+env(safe-area-inset-bottom))]">
      <PageHeader icon={BarChart3} title={t('history.title')} />

      <Card className="gap-0 rounded-xl border-border py-0 shadow-sm">
        <CardHeader className="px-4 pt-4">
          <CardTitle className="text-base">{t('history.weekStats')}</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <WeekChart history={history} todayTrain={todayTrain} />
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            <Stat value={`${stats.trainDayCount}`} label={t('history.trainDays')} />
            <Stat value={`${Math.round(stats.totalBurn)}`} label={t('history.totalBurn7')} />
          </div>
          <Stat className="mt-2.5" value={`${Math.round(stats.avgBurn)}`} label={t('history.avgBurn')} />
        </CardContent>
      </Card>

      <Card className="mt-3 gap-0 rounded-xl border-border py-0 shadow-sm">
        <CardHeader className="px-4 pt-4">
          <CardTitle className="text-base">{t('history.archive')}</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {history.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">{t('history.empty')}</p>
          ) : (
            history.map((tt) => {
              const total = tt.getStrengthBurn() + tt.getCardioBurn();
              const open = openDate === tt.getDate();
              return (
                <div
                  key={tt.getDate()}
                  className="rounded-lg border border-border bg-muted/30 px-3 py-2.5 [&+&]:mt-2"
                >
                  <div className="cursor-pointer" onClick={() => setOpenDate(open ? null : tt.getDate())}>
                    <div className="font-semibold">
                      {tt.getDate()}
                      {tt.getRemark() && (
                        <span className="ml-1.5 text-muted-foreground">· {tt.getRemark()}</span>
                      )}
                    </div>
                    <div className="mt-0.5 text-sm text-muted-foreground">
                      {t('history.total')} {Math.round(total)} kcal | {t('history.volume')}{' '}
                      {Math.round(tt.getDailyTotalVolume())}
                      <span className="ml-1 inline-flex items-center gap-0.5 align-middle text-xs">
                        {open ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                        {t('history.tap')}
                        {open ? t('history.collapse') : t('history.expand')}
                      </span>
                    </div>
                  </div>
                  {open && (
                    <div className="mt-2.5 space-y-1.5">
                      <p className="font-semibold">{t('history.strength')}</p>
                      {tt.getWorkoutLogs().length === 0 ? (
                        <p className="text-sm text-muted-foreground">{t('history.none')}</p>
                      ) : (
                        tt.getWorkoutLogs().map((log, i) => (
                          <div key={i} className="border-t border-border py-1.5 text-sm">
                            <span className="font-semibold">{d(log.getExercise().getName())}</span>{' '}
                            <span className="text-muted-foreground">
                              {log.getSetRecords().map((s, j) => (
                                <span key={j}>
                                  {s.getTrainWeight()}kg×{s.getReps()}
                                  {j < log.getSetRecords().length - 1 ? '  ' : ''}
                                </span>
                              ))}
                            </span>
                            <div className="text-xs text-muted-foreground">
                              {t('history.volume')} {Math.round(log.getTrainVolume())}
                            </div>
                          </div>
                        ))
                      )}
                      <p className="pt-1 font-semibold">{t('history.cardio')}</p>
                      {tt.getCardioList().length === 0 ? (
                        <p className="text-sm text-muted-foreground">{t('history.none')}</p>
                      ) : (
                        tt.getCardioList().map((c, i) => (
                          <div key={i} className="border-t border-border py-1.5 text-sm">
                            {d(c.getCardioName())} · {c.getMinute()} {t('training.minutes')} ·{' '}
                            {Math.round(c.calcBurn(tt.getUserWeight()))} kcal
                          </div>
                        ))
                      )}
                      <Button
                        className="mt-2"
                        variant="destructive"
                        size="sm"
                        onClick={() => void deleteTraining(tt.getDate())}
                      >
                        <Trash2 className="size-4" />
                        {t('history.delete')}
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
      {history.length > 0 && (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          {t('history.summary', {
            n: history.length,
            d: daysBetween(history[history.length - 1].getDate(), todayISO()),
          })}
        </p>
      )}
    </div>
  );
}