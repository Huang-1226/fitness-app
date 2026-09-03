import { Person } from '../src/core/person';
import { WorkoutLibrary } from '../src/core/workoutLibrary';
import { calculateFullNutrition, getTargetCalories } from '../src/core/nutritionCalculator';
import { DailyTraining } from '../src/core/dailyTraining';
import { WorkoutLog } from '../src/core/workoutLog';
import { CardioRecord } from '../src/core/cardioRecord';
import { todayISO } from '../src/core/dateUtil';

function assertClose(actual: number, expected: number, label: string) {
  const ok = Math.abs(actual - expected) < 0.01;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}: got=${actual.toFixed(2)} expect=${expected.toFixed(2)}`);
  if (!ok) process.exitCode = 1;
}

function assertTrue(cond: boolean, label: string) {
  console.log(`${cond ? 'PASS' : 'FAIL'} ${label}`);
  if (!cond) process.exitCode = 1;
}

const p = Person.createPerson('male', 175, 70, 20);
assertClose(p.getBMR(), 1698.75, 'BMR male 175/70/20');
assertClose(p.getBMI(), 22.857, 'BMI');
assertTrue(p.getBMILevel().includes('标准'), 'BMI level 标准');
assertClose(p.getTDEE(1), 1698.75 * 1.2, 'TDEE level1');
p.setActivityCode(3);
assertClose(p.getTDEE(3), 1698.75 * 1.55, 'TDEE level3');

const f = Person.createPerson('female', 160, 50, 22);
assertClose(f.getBMR(), 10 * 50 + 6.25 * 160 - 5 * 22 - 161, 'BMR female');

const lib = new WorkoutLibrary();
assertTrue(lib.getAllExercises().length === 53, `default exercises count = 53 (got ${lib.getAllExercises().length})`);
assertTrue(lib.getExerciseByName('杠铃深蹲') !== null, 'find exercise by name');
const fullBody = lib.generateFullBodyPlan();
assertTrue(fullBody.length === 53, 'full body plan = 53');
const ppl = lib.generatePPLThreeSplit();
assertTrue(ppl.length === 3, 'PPL 3 days');
assertClose(lib.getCardioByName('慢跑')!.met, 8.0, 'cardio jog met');

const target = getTargetCalories(p, 'MAINTAIN', 3, 0);
assertClose(target, p.getPreciseTDEE(3, 0), 'maintain calories = TDEE');
const lose = getTargetCalories(p, 'LOSE_FAT', 3, 0);
assertClose(lose, p.getPreciseTDEE(3, 0) - 450, 'lose fat calories');

const result = calculateFullNutrition(p, 'GAIN_MUSCLE', 3, 0);
assertClose(result.proteinG, 70 * 1.8, 'gain muscle protein = weight*1.8');
assertClose(result.targetCal, p.getPreciseTDEE(3, 0) + 250, 'gain muscle calories');

const t = new DailyTraining(p);
assertTrue(t.getDate() === todayISO(), 'today date');
const squat = lib.getExerciseByName('杠铃深蹲')!;
const log = new WorkoutLog(squat);
log.addSet(60, 10, 2);
log.addSet(60, 10, 2);
t.addWorkoutLog(log);
const expectedStrengthBurn = squat.calculateBurnCalorie(70, 2) * 2;
assertClose(t.getStrengthBurn(), expectedStrengthBurn, 'strength burn = met formula');
assertClose(t.getDailyTotalVolume(), 60 * 10 * 2, 'volume 1200');
const cardio = new CardioRecord('慢跑', 8.0, 30);
t.addCardio(cardio);
assertClose(t.getCardioBurn(), 70 * 8.0 * 0.5, 'cardio burn 30min');
assertClose(t.calculateWholeBurn(70), expectedStrengthBurn + 70 * 8.0 * 0.5, 'whole burn');

console.log('\n验证完成');