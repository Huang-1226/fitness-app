import { Exercise, MuscleRatio } from './exercise';

export const GROUP_LEG = '腿部';
export const GROUP_CHEST = '胸部';
export const GROUP_BACK = '背部';
export const GROUP_CORE = '核心';
export const GROUP_SHOULDER = '肩部';
export const GROUP_ARM = '手臂';

export const CARDIO_JOG = '慢跑';
export const CARDIO_SPRINT = '间歇冲刺跑';
export const CARDIO_ROPE = '跳绳';
export const CARDIO_SWIM = '游泳';
export const CARDIO_CYCLE = '动感单车';
export const CARDIO_WALK = '快走';
export const CARDIO_ELIPTICAL = '椭圆机';

export class CardioTemplate {
  name: string;
  met: number;
  recommendMin: number;
  tip: string;

  constructor(name: string, met: number, recommendMin: number, tip: string) {
    this.name = name;
    this.met = met;
    this.recommendMin = recommendMin;
    this.tip = tip;
  }
}

export class WorkoutLibrary {
  private exerciseList: Exercise[] = [];
  private cardioBaseList: CardioTemplate[] = [];

  constructor() {
    this.cardioBaseList = [];
    this.initCardioTemplate();
    this.initDefaultStrengthExercise();
  }

  reloadDefaultExercises(): void {
    this.exerciseList.length = 0;
    this.initDefaultStrengthExercise();
  }

  getExerciseByName(name: string): Exercise | null {
    for (const ex of this.exerciseList) {
      if (ex.getName() === name) {
        return ex;
      }
    }
    return null;
  }

  getAllExercises(): Exercise[] {
    return [...this.exerciseList];
  }

  private initDefaultStrengthExercise(): void {
    if (this.exerciseList.length > 0) {
      return;
    }
    const benchPress = new Exercise('平板杠铃卧推', GROUP_CHEST, 4, 10, 6.5);
    benchPress.getMuscleRatios().push(new MuscleRatio('胸大肌', 85));

    const inclineDumbbellBench = new Exercise('上斜哑铃卧推', GROUP_CHEST, 4, 10, 6.4);
    inclineDumbbellBench.getMuscleRatios().push(new MuscleRatio('上胸', 82));

    const dips = new Exercise('双杠臂屈伸', GROUP_CHEST, 3, 12, 6.2);
    dips.getMuscleRatios().push(new MuscleRatio('下胸', 70));

    const cableCrossover = new Exercise('绳索夹胸', GROUP_CHEST, 3, 15, 5.8);
    cableCrossover.getMuscleRatios().push(new MuscleRatio('胸肌中缝', 78));

    const pecDeck = new Exercise('蝴蝶机夹胸', GROUP_CHEST, 3, 12, 5.7);
    pecDeck.getMuscleRatios().push(new MuscleRatio('胸大肌', 80));

    const dumbbellFly = new Exercise('平板哑铃飞鸟', GROUP_CHEST, 3, 12, 5.9);
    dumbbellFly.getMuscleRatios().push(new MuscleRatio('胸大肌', 75));

    const machineChestPress = new Exercise('坐姿器械推胸', GROUP_CHEST, 4, 12, 6.3);
    machineChestPress.getMuscleRatios().push(new MuscleRatio('胸大肌', 83));

    const declineBench = new Exercise('下斜杠铃卧推', GROUP_CHEST, 4, 10, 6.6);
    declineBench.getMuscleRatios().push(new MuscleRatio('下胸', 81));

    const wideLatPulldown = new Exercise('宽握高位下拉', GROUP_BACK, 4, 10, 6.6);
    wideLatPulldown.getMuscleRatios().push(new MuscleRatio('背阔肌外侧', 86));

    const closeLatPulldown = new Exercise('窄握高位下拉', GROUP_BACK, 4, 10, 6.5);
    closeLatPulldown.getMuscleRatios().push(new MuscleRatio('背阔肌内侧', 84));

    const barbellRow = new Exercise('杠铃俯身划船', GROUP_BACK, 4, 10, 6.7);
    barbellRow.getMuscleRatios().push(new MuscleRatio('中背部、菱形肌', 87));

    const seatedCableRow = new Exercise('坐姿绳索划船', GROUP_BACK, 4, 12, 6.4);
    seatedCableRow.getMuscleRatios().push(new MuscleRatio('中上背', 85));

    const straightArmPulldown = new Exercise('直臂下压', GROUP_BACK, 3, 15, 5.6);
    straightArmPulldown.getMuscleRatios().push(new MuscleRatio('背阔肌下束', 81));

    const pullUp = new Exercise('引体向上', GROUP_BACK, 4, 8, 6.8);
    pullUp.getMuscleRatios().push(new MuscleRatio('整体背阔肌', 88));

    const hyperextension = new Exercise('山羊挺身', GROUP_BACK, 3, 12, 5.5);
    hyperextension.getMuscleRatios().push(new MuscleRatio('竖脊肌', 79));

    const singleDumbbellRow = new Exercise('单臂哑铃划船', GROUP_BACK, 4, 10, 6.5);
    singleDumbbellRow.getMuscleRatios().push(new MuscleRatio('单侧背阔肌', 83));

    const tBarRow = new Exercise('俯身T杠划船', GROUP_BACK, 4, 10, 6.9);
    tBarRow.getMuscleRatios().push(new MuscleRatio('中下斜方肌', 85));

    const barbellSquat = new Exercise('杠铃深蹲', GROUP_LEG, 4, 10, 6.8);
    barbellSquat.getMuscleRatios().push(new MuscleRatio('股四头肌', 82));

    const legPress = new Exercise('腿举', GROUP_LEG, 4, 12, 6.7);
    legPress.getMuscleRatios().push(new MuscleRatio('股四头肌', 84));

    const walkingLunge = new Exercise('箭步蹲', GROUP_LEG, 3, 12, 6.6);
    walkingLunge.getMuscleRatios().push(new MuscleRatio('股四头肌、臀大肌', 76));

    const legCurl = new Exercise('俯卧腿弯举', GROUP_LEG, 3, 12, 5.8);
    legCurl.getMuscleRatios().push(new MuscleRatio('腘绳肌', 85));

    const legExtension = new Exercise('坐姿腿屈伸', GROUP_LEG, 3, 15, 5.7);
    legExtension.getMuscleRatios().push(new MuscleRatio('股四头肌', 87));

    const hipThrust = new Exercise('臀推', GROUP_LEG, 4, 10, 6.5);
    hipThrust.getMuscleRatios().push(new MuscleRatio('臀大肌', 88));

    const standingCalf = new Exercise('站姿提踵', GROUP_LEG, 4, 15, 5.2);
    standingCalf.getMuscleRatios().push(new MuscleRatio('小腿腓肠肌', 90));

    const seatedCalf = new Exercise('坐姿提踵', GROUP_LEG, 4, 15, 5.1);
    seatedCalf.getMuscleRatios().push(new MuscleRatio('小腿比目鱼肌', 89));

    const hackSquat = new Exercise('哈克深蹲', GROUP_LEG, 4, 10, 6.7);
    hackSquat.getMuscleRatios().push(new MuscleRatio('股四头肌', 83));

    const rdl = new Exercise('罗马尼亚硬拉', GROUP_LEG, 4, 10, 7.0);
    rdl.getMuscleRatios().push(new MuscleRatio('腘绳肌、臀部', 86));

    const seatedDumbbellPress = new Exercise('坐姿哑铃推举', GROUP_SHOULDER, 4, 10, 6.3);
    seatedDumbbellPress.getMuscleRatios().push(new MuscleRatio('三角肌中束', 85));

    const lateralRaise = new Exercise('哑铃侧平举', GROUP_SHOULDER, 3, 15, 5.4);
    lateralRaise.getMuscleRatios().push(new MuscleRatio('三角肌中束', 88));

    const frontRaise = new Exercise('哑铃前平举', GROUP_SHOULDER, 3, 12, 5.3);
    frontRaise.getMuscleRatios().push(new MuscleRatio('三角肌前束', 86));

    const rearDeltFly = new Exercise('俯身哑铃飞鸟', GROUP_SHOULDER, 3, 15, 5.2);
    rearDeltFly.getMuscleRatios().push(new MuscleRatio('三角肌后束', 87));

    const cableFacePull = new Exercise('绳索面拉', GROUP_SHOULDER, 3, 12, 5.5);
    cableFacePull.getMuscleRatios().push(new MuscleRatio('肩后束、斜方肌中下束', 84));

    const barbellOverhead = new Exercise('杠铃推举', GROUP_SHOULDER, 4, 10, 6.4);
    barbellOverhead.getMuscleRatios().push(new MuscleRatio('整体三角肌', 82));

    const catCrawl = new Exercise('哑铃招财猫', GROUP_SHOULDER, 3, 12, 5.0);
    catCrawl.getMuscleRatios().push(new MuscleRatio('肩袖肌群', 78));

    const machineShoulderPress = new Exercise('器械肩推', GROUP_SHOULDER, 4, 12, 6.2);
    machineShoulderPress.getMuscleRatios().push(new MuscleRatio('三角肌整体', 84));

    const barbellCurl = new Exercise('杠铃弯举', GROUP_ARM, 3, 12, 5.6);
    barbellCurl.getMuscleRatios().push(new MuscleRatio('肱二头肌', 88));

    const altDumbbellCurl = new Exercise('哑铃交替弯举', GROUP_ARM, 3, 12, 5.5);
    altDumbbellCurl.getMuscleRatios().push(new MuscleRatio('肱二头肌', 86));

    const hammerCurl = new Exercise('锤式弯举', GROUP_ARM, 3, 12, 5.4);
    hammerCurl.getMuscleRatios().push(new MuscleRatio('肱肌、肱桡肌', 85));

    const concentrationCurl = new Exercise('集中弯举', GROUP_ARM, 3, 12, 5.3);
    concentrationCurl.getMuscleRatios().push(new MuscleRatio('肱二头肌峰值', 87));

    const cableCurl = new Exercise('绳索弯举', GROUP_ARM, 3, 15, 5.2);
    cableCurl.getMuscleRatios().push(new MuscleRatio('肱二头肌', 84));

    const tricepPushdown = new Exercise('绳索下压', GROUP_ARM, 3, 15, 5.3);
    tricepPushdown.getMuscleRatios().push(new MuscleRatio('肱三头肌外侧头', 89));

    const overheadDumbbellTricep = new Exercise('颈后哑铃臂屈伸', GROUP_ARM, 3, 12, 5.4);
    overheadDumbbellTricep.getMuscleRatios().push(new MuscleRatio('肱三头肌长头', 86));

    const closePushUp = new Exercise('窄距俯卧撑', GROUP_ARM, 3, 15, 6.0);
    closePushUp.getMuscleRatios().push(new MuscleRatio('肱三头肌', 75));

    const skullCrusher = new Exercise('仰卧臂屈伸', GROUP_ARM, 3, 12, 5.5);
    skullCrusher.getMuscleRatios().push(new MuscleRatio('肱三头肌', 84));

    const singleArmTricep = new Exercise('单臂绳索臂屈伸', GROUP_ARM, 3, 12, 5.1);
    singleArmTricep.getMuscleRatios().push(new MuscleRatio('肱三头肌外侧', 87));

    const plank = new Exercise('平板支撑', GROUP_CORE, 3, 1, 4.2);
    plank.getMuscleRatios().push(new MuscleRatio('腹横肌', 88));

    const crunch = new Exercise('卷腹', GROUP_CORE, 3, 15, 4.8);
    crunch.getMuscleRatios().push(new MuscleRatio('腹直肌上部', 85));

    const legRaise = new Exercise('仰卧举腿', GROUP_CORE, 3, 12, 4.9);
    legRaise.getMuscleRatios().push(new MuscleRatio('腹直肌下部', 86));

    const russianTwist = new Exercise('俄罗斯转体', GROUP_CORE, 3, 20, 5.0);
    russianTwist.getMuscleRatios().push(new MuscleRatio('腹斜肌', 87));

    const hangingLegRaise = new Exercise('悬垂举腿', GROUP_CORE, 3, 10, 5.8);
    hangingLegRaise.getMuscleRatios().push(new MuscleRatio('下腹', 88));

    const mountainClimber = new Exercise('登山跑', GROUP_CORE, 3, 30, 5.4);
    mountainClimber.getMuscleRatios().push(new MuscleRatio('整体腹部', 84));

    const sidePlank = new Exercise('侧平板支撑', GROUP_CORE, 3, 1, 4.3);
    sidePlank.getMuscleRatios().push(new MuscleRatio('腹斜肌', 86));

    const hollowBodyHold = new Exercise('平板收腹支撑', GROUP_CORE, 3, 1, 4.5);
    hollowBodyHold.getMuscleRatios().push(new MuscleRatio('整个核心', 89));

    this.addExercise(benchPress);
    this.addExercise(inclineDumbbellBench);
    this.addExercise(dips);
    this.addExercise(cableCrossover);
    this.addExercise(pecDeck);
    this.addExercise(dumbbellFly);
    this.addExercise(machineChestPress);
    this.addExercise(declineBench);

    this.addExercise(wideLatPulldown);
    this.addExercise(closeLatPulldown);
    this.addExercise(barbellRow);
    this.addExercise(seatedCableRow);
    this.addExercise(straightArmPulldown);
    this.addExercise(pullUp);
    this.addExercise(hyperextension);
    this.addExercise(singleDumbbellRow);
    this.addExercise(tBarRow);

    this.addExercise(barbellSquat);
    this.addExercise(legPress);
    this.addExercise(walkingLunge);
    this.addExercise(legCurl);
    this.addExercise(legExtension);
    this.addExercise(hipThrust);
    this.addExercise(standingCalf);
    this.addExercise(seatedCalf);
    this.addExercise(hackSquat);
    this.addExercise(rdl);

    this.addExercise(seatedDumbbellPress);
    this.addExercise(lateralRaise);
    this.addExercise(frontRaise);
    this.addExercise(rearDeltFly);
    this.addExercise(cableFacePull);
    this.addExercise(barbellOverhead);
    this.addExercise(catCrawl);
    this.addExercise(machineShoulderPress);

    this.addExercise(barbellCurl);
    this.addExercise(altDumbbellCurl);
    this.addExercise(hammerCurl);
    this.addExercise(concentrationCurl);
    this.addExercise(cableCurl);
    this.addExercise(tricepPushdown);
    this.addExercise(overheadDumbbellTricep);
    this.addExercise(closePushUp);
    this.addExercise(skullCrusher);
    this.addExercise(singleArmTricep);

    this.addExercise(plank);
    this.addExercise(crunch);
    this.addExercise(legRaise);
    this.addExercise(russianTwist);
    this.addExercise(hangingLegRaise);
    this.addExercise(mountainClimber);
    this.addExercise(sidePlank);
    this.addExercise(hollowBodyHold);
  }

  private initCardioTemplate(): void {
    this.cardioBaseList.push(new CardioTemplate(CARDIO_JOG, 8.0, 30, '匀速慢跑，心率维持最大心率60%~70%'));
    this.cardioBaseList.push(new CardioTemplate(CARDIO_SPRINT, 12.5, 15, '冲刺30s+慢走60s循环10组，高效燃脂'));
    this.cardioBaseList.push(new CardioTemplate(CARDIO_ROPE, 10.0, 20, '间歇跳绳：跳60s休息30s循环'));
    this.cardioBaseList.push(new CardioTemplate(CARDIO_SWIM, 8.5, 25, '自由泳，零关节压力，适合大体重人群'));
    this.cardioBaseList.push(new CardioTemplate(CARDIO_CYCLE, 7.5, 35, '中等阻力匀速踩踏，侧重下肢减脂'));
    this.cardioBaseList.push(new CardioTemplate(CARDIO_WALK, 4.5, 45, '新手、体重偏大首选，不伤膝盖'));
    this.cardioBaseList.push(new CardioTemplate(CARDIO_ELIPTICAL, 6.8, 30, '全身有氧，膝关节负荷极低'));
  }

  addExercise(e: Exercise | null): void {
    if (e !== null && e !== undefined) {
      this.exerciseList.push(e);
    }
  }

  getByTrainGroup(trainGroup: string): Exercise[] {
    const result: Exercise[] = [];
    for (const ex of this.exerciseList) {
      if (trainGroup === ex.getTrainGroup()) {
        result.push(ex);
      }
    }
    return result;
  }

  findAllExerciseByMuscle(targetMuscle: string): Exercise[] {
    const result: Exercise[] = [];
    for (const ex of this.exerciseList) {
      if (ex.getMuscleRatio(targetMuscle) > 0) {
        result.push(ex);
      }
    }
    return result;
  }

  findMainExerciseByMuscle(muscleName: string, threshold: number): Exercise[] {
    const result: Exercise[] = [];
    for (const ex of this.exerciseList) {
      const w = ex.getMuscleRatio(muscleName);
      if (w >= threshold) {
        result.push(ex);
      }
    }
    return result;
  }

  generateFullBodyPlan(): Exercise[] {
    const plan: Exercise[] = [];
    plan.push(...this.getByTrainGroup(GROUP_LEG));
    plan.push(...this.getByTrainGroup(GROUP_CHEST));
    plan.push(...this.getByTrainGroup(GROUP_BACK));
    plan.push(...this.getByTrainGroup(GROUP_CORE));
    plan.push(...this.getByTrainGroup(GROUP_SHOULDER));
    plan.push(...this.getByTrainGroup(GROUP_ARM));
    return plan;
  }

  getSingleTargetExercises(target: string): Exercise[] {
    const groupData = this.getByTrainGroup(target);
    if (groupData.length > 0) {
      return groupData;
    }
    return this.findAllExerciseByMuscle(target);
  }

  generateTwoTargetPlan(target1: string, target2: string): Exercise[] {
    const plan: Exercise[] = [];
    const list1 = this.getSingleTargetExercises(target1);
    const list2 = this.getSingleTargetExercises(target2);
    plan.push(...list1);
    for (const ex of list2) {
      if (!plan.some((p) => p.equals(ex))) {
        plan.push(ex);
      }
    }
    return plan;
  }

  generatePushPlan(): Exercise[] {
    const push: Exercise[] = [];
    push.push(...this.getByTrainGroup(GROUP_CHEST));
    push.push(...this.getByTrainGroup(GROUP_SHOULDER));
    push.push(...this.getByTrainGroup(GROUP_ARM));
    return push;
  }

  generatePullPlan(): Exercise[] {
    const pull: Exercise[] = [];
    pull.push(...this.getByTrainGroup(GROUP_BACK));
    pull.push(...this.getByTrainGroup(GROUP_ARM));
    return pull;
  }

  generateLegPlan(): Exercise[] {
    const leg: Exercise[] = [];
    leg.push(...this.getByTrainGroup(GROUP_LEG));
    leg.push(...this.getByTrainGroup(GROUP_CORE));
    return leg;
  }

  generatePPLThreeSplit(): Exercise[][] {
    return [this.generatePushPlan(), this.generatePullPlan(), this.generateLegPlan()];
  }

  getCardioByName(cardioName: string): CardioTemplate | null {
    for (const t of this.cardioBaseList) {
      if (t.name === cardioName) {
        return t;
      }
    }
    return null;
  }

  getCardioTemplates(): CardioTemplate[] {
    return [...this.cardioBaseList];
  }

  isEmpty(): boolean {
    return this.exerciseList.length === 0;
  }
}