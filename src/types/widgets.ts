export enum WidgetType {
  EXECUTION_SCORE = 'executionScore',
  WAKE_CONSISTENCY = 'wakeConsistency',
  CURRENT_STREAK = 'currentStreak',
  AVG_LATENCY = 'avgLatency',
  COGNITIVE_MAP = 'cognitiveMap',
  DAILY_INSIGHT = 'dailyInsight',
  ACHIEVEMENTS = 'achievements',
  FALSE_STARTS = 'falseStarts',
  SLEEP_ENVIRONMENT = 'sleepEnvironment',
  // High Priority Widgets
  SNOOZE_ANALYTICS = 'snoozeAnalytics',
  GOAL_PROGRESS = 'goalProgress',
  WEEKLY_HEATMAP = 'weeklyHeatmap',
  // Medium Priority Widgets
  SLEEP_QUALITY = 'sleepQuality',
  CIRCADIAN_RHYTHM = 'circadianRhythm',
  MORNING_ROUTINE = 'morningRoutine',
}

export enum WidgetCategory {
  ACTIVE_PERFORMANCE = 'activePerformance',
  INSIGHTS = 'insights',
  SYSTEM_MONITORING = 'systemMonitoring',
}

export interface WidgetConfig {
  id: WidgetType;
  category: WidgetCategory;
  icon: string;
  titleKey: string;
  descriptionKey: string;
  defaultEnabled: boolean;
}

export const WIDGET_CONFIGS: WidgetConfig[] = [
  // Active Performance
  {
    id: WidgetType.EXECUTION_SCORE,
    category: WidgetCategory.ACTIVE_PERFORMANCE,
    icon: 'target',
    titleKey: 'widgets.executionScore.title',
    descriptionKey: 'widgets.executionScore.description',
    defaultEnabled: true,
  },
  {
    id: WidgetType.WAKE_CONSISTENCY,
    category: WidgetCategory.ACTIVE_PERFORMANCE,
    icon: 'schedule',
    titleKey: 'widgets.wakeConsistency.title',
    descriptionKey: 'widgets.wakeConsistency.description',
    defaultEnabled: true,
  },
  {
    id: WidgetType.CURRENT_STREAK,
    category: WidgetCategory.ACTIVE_PERFORMANCE,
    icon: 'local_fire_department',
    titleKey: 'widgets.currentStreak.title',
    descriptionKey: 'widgets.currentStreak.description',
    defaultEnabled: true,
  },
  {
    id: WidgetType.AVG_LATENCY,
    category: WidgetCategory.ACTIVE_PERFORMANCE,
    icon: 'speed',
    titleKey: 'widgets.avgLatency.title',
    descriptionKey: 'widgets.avgLatency.description',
    defaultEnabled: false,
  },
  // Insights
  // {
  //   id: WidgetType.COGNITIVE_MAP,
  //   category: WidgetCategory.INSIGHTS,
  //   icon: 'psychology',
  //   titleKey: 'widgets.cognitiveMap.title',
  //   descriptionKey: 'widgets.cognitiveMap.description',
  //   defaultEnabled: true,
  // },
  {
    id: WidgetType.DAILY_INSIGHT,
    category: WidgetCategory.INSIGHTS,
    icon: 'lightbulb',
    titleKey: 'widgets.dailyInsight.title',
    descriptionKey: 'widgets.dailyInsight.description',
    defaultEnabled: true,
  },
  {
    id: WidgetType.ACHIEVEMENTS,
    category: WidgetCategory.INSIGHTS,
    icon: 'emoji_events',
    titleKey: 'widgets.achievements.title',
    descriptionKey: 'widgets.achievements.description',
    defaultEnabled: true,
  },
  // System Monitoring
  {
    id: WidgetType.FALSE_STARTS,
    category: WidgetCategory.SYSTEM_MONITORING,
    icon: 'warning',
    titleKey: 'widgets.falseStarts.title',
    descriptionKey: 'widgets.falseStarts.description',
    defaultEnabled: false,
  },
  {
    id: WidgetType.SLEEP_ENVIRONMENT,
    category: WidgetCategory.SYSTEM_MONITORING,
    icon: 'thermostat',
    titleKey: 'widgets.sleepEnvironment.title',
    descriptionKey: 'widgets.sleepEnvironment.description',
    defaultEnabled: true,
  },
  // High Priority Widgets
  {
    id: WidgetType.SNOOZE_ANALYTICS,
    category: WidgetCategory.ACTIVE_PERFORMANCE,
    icon: 'snooze',
    titleKey: 'widgets.snoozeAnalytics.title',
    descriptionKey: 'widgets.snoozeAnalytics.description',
    defaultEnabled: true,
  },
  // {
  //   id: WidgetType.GOAL_PROGRESS,
  //   category: WidgetCategory.INSIGHTS,
  //   icon: 'flag',
  //   titleKey: 'widgets.goalProgress.title',
  //   descriptionKey: 'widgets.goalProgress.description',
  //   defaultEnabled: false,
  // },
  {
    id: WidgetType.WEEKLY_HEATMAP,
    category: WidgetCategory.ACTIVE_PERFORMANCE,
    icon: 'grid_on',
    titleKey: 'widgets.weeklyHeatmap.title',
    descriptionKey: 'widgets.weeklyHeatmap.description',
    defaultEnabled: true,
  },
  // Medium Priority Widgets
  {
    id: WidgetType.SLEEP_QUALITY,
    category: WidgetCategory.INSIGHTS,
    icon: 'bedtime',
    titleKey: 'widgets.sleepQuality.title',
    descriptionKey: 'widgets.sleepQuality.description',
    defaultEnabled: true,
  },
  {
    id: WidgetType.CIRCADIAN_RHYTHM,
    category: WidgetCategory.INSIGHTS,
    icon: 'routine',
    titleKey: 'widgets.circadianRhythm.title',
    descriptionKey: 'widgets.circadianRhythm.description',
    defaultEnabled: true,
  },
  // {
  //   id: WidgetType.MORNING_ROUTINE,
  //   category: WidgetCategory.ACTIVE_PERFORMANCE,
  //   icon: 'checklist',
  //   titleKey: 'widgets.morningRoutine.title',
  //   descriptionKey: 'widgets.morningRoutine.description',
  //   defaultEnabled: true,
  // },
];
