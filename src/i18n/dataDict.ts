const groupNames: Record<string, string> = {
  胸部: 'Chest',
  背部: 'Back',
  腿部: 'Legs',
  核心: 'Core',
  肩部: 'Shoulders',
  手臂: 'Arms',
};

const exerciseNames: Record<string, string> = {
  平板杠铃卧推: 'Barbell Bench Press',
  上斜哑铃卧推: 'Incline Dumbbell Press',
  双杠臂屈伸: 'Dips',
  绳索夹胸: 'Cable Crossover',
  蝴蝶机夹胸: 'Pec Deck Fly',
  平板哑铃飞鸟: 'Flat Dumbbell Fly',
  坐姿器械推胸: 'Machine Chest Press',
  下斜杠铃卧推: 'Decline Barbell Bench Press',
  宽握高位下拉: 'Wide-Grip Lat Pulldown',
  窄握高位下拉: 'Close-Grip Lat Pulldown',
  杠铃俯身划船: 'Barbell Bent-Over Row',
  坐姿绳索划船: 'Seated Cable Row',
  直臂下压: 'Straight-Arm Pulldown',
  引体向上: 'Pull-Up',
  山羊挺身: 'Back Extension',
  单臂哑铃划船: 'One-Arm Dumbbell Row',
  俯身T杠划船: 'T-Bar Row',
  杠铃深蹲: 'Barbell Squat',
  腿举: 'Leg Press',
  箭步蹲: 'Walking Lunge',
  俯卧腿弯举: 'Lying Leg Curl',
  坐姿腿屈伸: 'Leg Extension',
  臀推: 'Hip Thrust',
  站姿提踵: 'Standing Calf Raise',
  坐姿提踵: 'Seated Calf Raise',
  哈克深蹲: 'Hack Squat',
  罗马尼亚硬拉: 'Romanian Deadlift',
  坐姿哑铃推举: 'Seated Dumbbell Shoulder Press',
  哑铃侧平举: 'Lateral Raise',
  哑铃前平举: 'Front Raise',
  俯身哑铃飞鸟: 'Rear Delt Fly',
  绳索面拉: 'Cable Face Pull',
  杠铃推举: 'Barbell Overhead Press',
  哑铃招财猫: 'Dumbbell Cat Crawl',
  器械肩推: 'Machine Shoulder Press',
  杠铃弯举: 'Barbell Curl',
  哑铃交替弯举: 'Alternating Dumbbell Curl',
  锤式弯举: 'Hammer Curl',
  集中弯举: 'Concentration Curl',
  绳索弯举: 'Cable Curl',
  绳索下压: 'Triceps Pushdown',
  颈后哑铃臂屈伸: 'Overhead Dumbbell Triceps Extension',
  窄距俯卧撑: 'Close-Grip Push-Up',
  仰卧臂屈伸: 'Skull Crusher',
  单臂绳索臂屈伸: 'One-Arm Cable Triceps Extension',
  平板支撑: 'Plank',
  卷腹: 'Crunch',
  仰卧举腿: 'Lying Leg Raise',
  俄罗斯转体: 'Russian Twist',
  悬垂举腿: 'Hanging Leg Raise',
  登山跑: 'Mountain Climber',
  侧平板支撑: 'Side Plank',
  平板收腹支撑: 'Hollow Body Hold',
};

const muscleNames: Record<string, string> = {
  胸大肌: 'Pectoralis Major',
  上胸: 'Upper Chest',
  下胸: 'Lower Chest',
  胸肌中缝: 'Inner Chest',
  背阔肌外侧: 'Outer Lats',
  背阔肌内侧: 'Inner Lats',
  '中背部、菱形肌': 'Mid Back & Rhomboids',
  中上背: 'Upper-Mid Back',
  背阔肌下束: 'Lower Lats',
  整体背阔肌: 'Overall Lats',
  竖脊肌: 'Erector Spinae',
  单侧背阔肌: 'Single-Side Lats',
  中下斜方肌: 'Lower-Mid Traps',
  股四头肌: 'Quadriceps',
  '股四头肌、臀大肌': 'Quads & Glutes',
  腘绳肌: 'Hamstrings',
  '腘绳肌、臀部': 'Hamstrings & Glutes',
  臀大肌: 'Glutes',
  小腿腓肠肌: 'Calves (Gastrocnemius)',
  小腿比目鱼肌: 'Soleus',
  三角肌中束: 'Medial Deltoid',
  三角肌前束: 'Anterior Deltoid',
  三角肌后束: 'Posterior Deltoid',
  '肩后束、斜方肌中下束': 'Rear Delt & Lower Traps',
  整体三角肌: 'Overall Deltoids',
  肩袖肌群: 'Rotator Cuff',
  三角肌整体: 'Overall Deltoids',
  肱二头肌: 'Biceps',
  肱二头肌峰值: 'Biceps Peak',
  '肱肌、肱桡肌': 'Brachialis & Brachioradialis',
  肱三头肌外侧头: 'Triceps Lateral Head',
  肱三头肌长头: 'Triceps Long Head',
  肱三头肌: 'Triceps',
  肱三头肌外侧: 'Triceps Lateral',
  腹横肌: 'Transverse Abdominis',
  腹直肌上部: 'Upper Abs',
  腹直肌下部: 'Lower Abs',
  腹斜肌: 'Obliques',
  下腹: 'Lower Abs',
  整体腹部: 'Overall Abs',
  整个核心: 'Whole Core',
};

const cardioNames: Record<string, string> = {
  慢跑: 'Jogging',
  间歇冲刺跑: 'Sprint Intervals',
  跳绳: 'Jump Rope',
  游泳: 'Swimming',
  动感单车: 'Spinning',
  快走: 'Brisk Walking',
  椭圆机: 'Elliptical',
};

const cardioTips: Record<string, string> = {
  '匀速慢跑，心率维持最大心率60%~70%': 'Steady jog, keep heart rate at 60–70% of max',
  '冲刺30s+慢走60s循环10组，高效燃脂': 'Sprint 30s + walk 60s ×10 rounds for fat burn',
  '间歇跳绳：跳60s休息30s循环': 'Interval: jump 60s, rest 30s',
  '自由泳，零关节压力，适合大体重人群': 'Freestyle, zero joint stress, great for heavier users',
  '中等阻力匀速踩踏，侧重下肢减脂': 'Steady cycling at moderate resistance for lower body',
  '新手、体重偏大首选，不伤膝盖': 'Beginner & heavier weight friendly, easy on knees',
  '全身有氧，膝关节负荷极低': 'Full-body cardio, very low knee load',
};

const bmiLevels: Record<string, string> = {
  暂无身体数据: 'No body data',
  '偏瘦，建议力量训练+适度热量盈余增肌': 'Underweight: strength training + moderate calorie surplus recommended',
  '身材标准健康，维持当前作息即可': 'Healthy weight: keep up your current routine',
  '超重，可配合力量训练+温和热量缺口减脂': 'Overweight: strength training + mild calorie deficit recommended',
  '肥胖，建议有氧搭配力量训练逐步减脂': 'Obese: combine cardio and strength training to lose fat gradually',
};

const miscDict: Record<string, string> = {
  '警告：热量缺口超过500大卡，力量训练期间容易流失肌肉，建议缩小减脂缺口':
    'Warning: calorie deficit exceeds 500 kcal, which risks muscle loss during strength training. Consider a smaller deficit.',
};

const tables: Record<string, string>[] = [
  groupNames,
  exerciseNames,
  muscleNames,
  cardioNames,
  cardioTips,
  bmiLevels,
  miscDict,
];

export function dataLookup(text: string): string {
  for (const table of tables) {
    const hit = table[text];
    if (hit) return hit;
  }
  return text;
}