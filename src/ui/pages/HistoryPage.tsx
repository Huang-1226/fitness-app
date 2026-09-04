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
import { useTrainingStore } from '@/store/trainingStore';
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
  const days = useMemo(() => {
    const today = todayISO();
    const dayBurn = new Map<string, number>();
    const sessions = todayTrain ? [todayTrain, ...history] : history;
    for (const t of sessions) {
      const burn = t.getStrengthBurn() + t.getCardioBurn();
      dayBurn.set(t.getDate(), (dayBurn.get(t.getDate()) ?? 0) + burn);
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
      aria-label="近 7 天每日消耗条形图"
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
    <div className="px-4 pt-4 pb-[calc(76px+env(safe-area-inset-bottom))]">
      <h1 className="mb-4 flex items-center gap-2 text-2xl font-bold">
        <BarChart3 className="size-6 text-primary" />
        训练记录
      </h1>

      <Card className="gap-0 rounded-xl border-border py-0 shadow-sm">
        <CardHeader className="px-4 pt-4">
          <CardTitle className="text-base">近 7 天统计</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <WeekChart history={history} todayTrain={todayTrain} />
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            <Stat value={`${stats.trainDayCount}`} label="有效训练天数" />
            <Stat value={`${Math.round(stats.totalBurn)}`} label="七天总消耗 kcal" />
          </div>
          <Stat className="mt-2.5" value={`${Math.round(stats.avgBurn)}`} label="训练日平均消耗 kcal" />
        </CardContent>
      </Card>

      <Card className="mt-3 gap-0 rounded-xl border-border py-0 shadow-sm">
        <CardHeader className="px-4 pt-4">
          <CardTitle className="text-base">归档历史</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {history.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">暂无归档训练记录</p>
          ) : (
            history.map((t) => {
              const total = t.getStrengthBurn() + t.getCardioBurn();
              const open = openDate === t.getDate();
              return (
                <div
                  key={t.getDate()}
                  className="rounded-lg border border-border bg-muted/30 px-3 py-2.5 [&+&]:mt-2"
                >
                  <div className="cursor-pointer" onClick={() => setOpenDate(open ? null : t.getDate())}>
                    <div className="font-semibold">
                      {t.getDate()}
                      {t.getRemark() && (
                        <span className="ml-1.5 text-muted-foreground">· {t.getRemark()}</span>
                      )}
                    </div>
                    <div className="mt-0.5 text-sm text-muted-foreground">
                      总消耗 {Math.round(total)} kcal | 容量 {Math.round(t.getDailyTotalVolume())}
                      <span className="ml-1 inline-flex items-center gap-0.5 align-middle text-xs">
                        {open ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                        点击{open ? '收起' : '展开'}
                      </span>
                    </div>
                  </div>
                  {open && (
                    <div className="mt-2.5 space-y-1.5">
                      <p className="font-semibold">力量训练</p>
                      {t.getWorkoutLogs().length === 0 ? (
                        <p className="text-sm text-muted-foreground">无</p>
                      ) : (
                        t.getWorkoutLogs().map((log, i) => (
                          <div key={i} className="border-t border-border py-1.5 text-sm">
                            <span className="font-semibold">{log.getExercise().getName()}</span>{' '}
                            <span className="text-muted-foreground">
                              {log.getSetRecords().map((s, j) => (
                                <span key={j}>
                                  {s.getTrainWeight()}kg×{s.getReps()}
                                  {j < log.getSetRecords().length - 1 ? '  ' : ''}
                                </span>
                              ))}
                            </span>
                            <div className="text-xs text-muted-foreground">
                              容量 {Math.round(log.getTrainVolume())}
                            </div>
                          </div>
                        ))
                      )}
                      <p className="pt-1 font-semibold">有氧训练</p>
                      {t.getCardioList().length === 0 ? (
                        <p className="text-sm text-muted-foreground">无</p>
                      ) : (
                        t.getCardioList().map((c, i) => (
                          <div key={i} className="border-t border-border py-1.5 text-sm">
                            {c.getCardioName()} · {c.getMinute()}分钟 ·{' '}
                            {Math.round(c.calcBurn(t.getUserWeight()))} kcal
                          </div>
                        ))
                      )}
                      <Button
                        className="mt-2"
                        variant="destructive"
                        size="sm"
                        onClick={() => void deleteTraining(t.getDate())}
                      >
                        <Trash2 className="size-4" />
                        删除该记录
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
          共 {history.length} 条记录 · 最早距今 {daysBetween(history[history.length - 1].getDate(), todayISO())} 天
        </p>
      )}
    </div>
  );
}