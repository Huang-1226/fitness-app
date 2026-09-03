import { Person } from './person';

export type Mode = 'LOSE_FAT' | 'MAINTAIN' | 'GAIN_MUSCLE';

export interface NutritionResult {
  targetCal: number;
  proteinG: number;
  fatG: number;
  carbG: number;
  warn: string;
}

export function getTargetCalories(
  person: Person,
  mode: Mode,
  activityCode: number,
  trainTotalBurn: number,
): number {
  if (activityCode > 4 || activityCode < 1) {
    throw new Error('活动系数只能填入1~4');
  }
  const preciseTdee = person.getPreciseTDEE(activityCode, trainTotalBurn);
  switch (mode) {
    case 'LOSE_FAT':
      return preciseTdee - 450;
    case 'GAIN_MUSCLE':
      return preciseTdee + 250;
    case 'MAINTAIN':
      return preciseTdee;
  }
}

export function calculateFullNutrition(
  person: Person,
  mode: Mode,
  activityCode: number,
  trainTotalBurn: number,
): NutritionResult {
  if (!person) {
    throw new Error('Person 对象不能为 null');
  }
  const targetCal = getTargetCalories(person, mode, activityCode, trainTotalBurn);

  let proteinFactor: number;
  switch (mode) {
    case 'LOSE_FAT':
      proteinFactor = 2.2;
      break;
    case 'GAIN_MUSCLE':
      proteinFactor = 1.8;
      break;
    case 'MAINTAIN':
      proteinFactor = 1.6;
      break;
  }

  const tde = person.getPreciseTDEE(activityCode, trainTotalBurn);
  let warn = '';
  if (mode === 'LOSE_FAT' && tde - targetCal > 500) {
    warn = '警告：热量缺口超过500大卡，力量训练期间容易流失肌肉，建议缩小减脂缺口';
  }

  const protein = person.getWeight() * proteinFactor;
  const proteinCal = protein * 4;
  const fatCal = targetCal * 0.25;
  const fat = fatCal / 9;
  const carbCal = targetCal - proteinCal - fatCal;
  const carb = carbCal / 4;

  return { targetCal, proteinG: protein, fatG: fat, carbG: carb, warn };
}

export function formatNutritionResult(result: NutritionResult): string {
  const targetCalStr = `${Math.round(result.targetCal)}`;
  const proteinStr = `${Math.round(result.proteinG * 10) / 10}`;
  const fatStr = `${Math.round(result.fatG * 10) / 10}`;
  const carbStr = `${Math.round(result.carbG * 10) / 10}`;
  return (
    '===每日饮食方案===\n' +
    `目标摄入热量：${targetCalStr} kcal\n` +
    `蛋白质：${proteinStr} g\n` +
    `脂肪：${fatStr} g\n` +
    `碳水：${carbStr} g`
  );
}