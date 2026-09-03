import { daysBetween } from './dateUtil';

export interface MuscleRecoverRuleDef {
  groupName: string;
  recoverDays: number;
}

const RULES: MuscleRecoverRuleDef[] = [
  { groupName: '胸部', recoverDays: 2 },
  { groupName: '背部', recoverDays: 3 },
  { groupName: '腿部', recoverDays: 3 },
];

export function findRecoverRuleByGroup(trainGroup: string): MuscleRecoverRuleDef | null {
  for (const rule of RULES) {
    if (rule.groupName === trainGroup) {
      return rule;
    }
  }
  return null;
}

export function needWarn(lastTrainDate: string, today: string, recoverDays: number): boolean {
  const gap = daysBetween(lastTrainDate, today);
  return gap < recoverDays;
}