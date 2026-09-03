# 🏋️ Fitness App (React PWA)

个人健身与营养管理系统的 **跨平台 PWA 版本**，由 Java 命令行版（`../fitness`）迁移而来。

- **零服务器**：纯前端 + 本地持久化（IndexedDB），数据永远在手机本地
- **跨平台**：Android / iPhone / 桌面浏览器通用，可"添加到主屏幕"全屏使用
- **离线可用**：Service Worker 缓存全部静态资源，断网照常使用
- **免上架**：APK/商店都不需要，GitHub Pages / Vercel 静态托管即可

## 技术栈

- **语言**：TypeScript（业务逻辑由 Java 逐行移植）
- **框架**：React 19 + Vite
- **状态管理**：Zustand
- **本地数据库**：IndexedDB + Dexie
- **PWA**：vite-plugin-pwa（自动生成 manifest + Service Worker）

## 架构

```
src/
├── core/        # 业务逻辑（从 src/model + util + workout 移植，纯计算无 UI）
│   ├── person.ts              ← Person.java   (BMI/BMR/TDEE/体重追踪)
│   ├── dailyTraining.ts       ← DailyTraining.java
│   ├── workoutLog.ts          ← WorkoutLog.java
│   ├── cardioRecord.ts        ← CardioRecord.java
│   ├── exercise.ts            ← Exercise.java
│   ├── muscleRecoverRule.ts   ← MuscleRecoverRule.java (枚举→常量)
│   ├── nutritionCalculator.ts ← NutritionCalculator.java
│   └── workoutLibrary.ts      ← WorkoutLibrary.java (53 个默认动作)
├── db/          # 持久化层
│   ├── types.ts               # 序列化 DTO（IndexedDB 存对象，需显式建模）
│   ├── converters.ts          # class ⇄ DTO 双向转换
│   └── db.ts                  # Dexie 表定义
├── store/       # Zustand 状态层（对应 Main.java 里的内存变量）
│   ├── userStore.ts
│   ├── trainingStore.ts
│   └── libraryStore.ts
└── ui/          # React 界面层（对应 Main.java 的 CLI 菜单）
    ├── components/
    └── pages/   # 首页 / 训练 / 记录 / 计划 / 动作库
```

### 数据流

```
用户操作 → React 组件 → Zustand action → core 业务函数 → Dexie 写 IndexedDB
                               ↑                                ↓
                          状态更新渲染  ←────────────────── 数据查询
```

`Main.java` 的三个序列化文件映射：

| Java CLI | PWA |
|---|---|
| `user.dat` | users 表（id=1） |
| `history.dat` | trainings 表（date 为主键） |
| `exercise.dat` | exercises 表（name 为主键） |

## 快速开始

```bash
npm install
npm run dev      # 本地开发 http://localhost:5173
npm run build    # 产物在 dist/
npm run preview  # 预览生产构建
npm run verify   # 逻辑层回归测试（tsx scripts/verify.ts）
```

## 部署到 GitHub Pages（零服务器）

```bash
npm run build
# 把 dist/ 内容推到 gh-pages 分支，或直接用 GitHub Actions 自动部署
```

仓库设置 → Pages → 选择分支即可。部署后 iPhone/Android 打开链接 → 分享 → 添加到主屏幕。

> 注意：部署到子路径时需在 `vite.config.ts` 设置 `base`（如 `/fitness-app/`）。

## 与 Java 版的功能对应

19 个 CLI 菜单功能已全部映射到 5 个页面：档案/BMI、体重追踪、今日训练（力量/有氧/消耗/归档）、历史与近7天统计、训练计划生成、肌群筛选、饮食方案、动作库增删。

**© 2026 Huang1226** | [原项目 GitHub](https://github.com/Huang-1226)