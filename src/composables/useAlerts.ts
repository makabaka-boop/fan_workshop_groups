import { computed } from 'vue';
import type { Alert, FanStyle, Group, ActivityInfo } from '../types';

export function useAlerts(
  getStyles: () => FanStyle[],
  getGroups: () => Group[],
  getActivity: () => ActivityInfo
) {
  const alerts = computed<Alert[]>(() => {
    const styles = getStyles();
    const groups = getGroups();
    const activity = getActivity();
    const result: Alert[] = [];

    groups.forEach(group => {
      const groupStyles = group.styleIds
        .map(id => styles.find(s => s.id === id))
        .filter((s): s is FanStyle => s !== undefined);

      const highDifficultyCount = groupStyles.filter(
        s => s.difficulty === 'hard' || s.difficulty === 'expert'
      ).length;

      if (highDifficultyCount > 1) {
        result.push({
          id: `diff-${group.id}`,
          type: 'high-difficulty',
          severity: 'warning',
          message: `${group.name} 包含 ${highDifficultyCount} 个高难度样式`,
          details: '建议每个小组高难度样式不超过1个，以免学习压力过大'
        });
      }
    });

    const assignedStyleIds = new Set<string>();
    groups.forEach(group => {
      group.styleIds.forEach(id => assignedStyleIds.add(id));
    });
    const assignedStyles = styles.filter(s => assignedStyleIds.has(s.id));

    const materialSummary = new Map<string, { name: string; unit: string; required: number; available: number; styles: string[] }>();
    assignedStyles.forEach(style => {
      style.materials.forEach(m => {
        const key = `${m.name}-${m.unit}`;
        const existing = materialSummary.get(key);
        if (existing) {
          existing.required += m.quantity;
          if (m.available !== undefined) {
            existing.available = Math.max(existing.available, m.available);
          }
          if (!existing.styles.includes(style.name)) {
            existing.styles.push(style.name);
          }
        } else {
          materialSummary.set(key, {
            name: m.name,
            unit: m.unit,
            required: m.quantity,
            available: m.available ?? 0,
            styles: [style.name]
          });
        }
      });
    });

    const insufficientMaterials: string[] = [];
    materialSummary.forEach((mat, key) => {
      if (mat.available > 0 && mat.required > mat.available) {
        insufficientMaterials.push(`${mat.name} 需求${mat.required}${mat.unit}，库存${mat.available}${mat.unit} (${mat.styles.join('、')})`);
      }
    });

    const manualInsufficientStyles = styles.filter(s => s.status === 'insufficient-material');
    if (manualInsufficientStyles.length > 0) {
      result.push({
        id: 'material-shortage-manual',
        type: 'material-shortage',
        severity: 'error',
        message: `${manualInsufficientStyles.length} 个样式标记为材料不足`,
        details: manualInsufficientStyles.map(s => s.name).join('、')
      });
    }

    if (insufficientMaterials.length > 0) {
      result.push({
        id: 'material-shortage-auto',
        type: 'material-shortage',
        severity: 'error',
        message: `检测到 ${insufficientMaterials.length} 项材料缺口`,
        details: insufficientMaterials.slice(0, 3).join('；') + (insufficientMaterials.length > 3 ? '...' : '')
      });
    }

    const demoPointsMap = new Map<string, string[]>();
    styles.forEach(style => {
      if (style.demoPoints) {
        const points = style.demoPoints.split('\n').filter(p => p.trim());
        points.forEach(point => {
          const cleanPoint = point.trim().toLowerCase();
          if (cleanPoint.length > 5) {
            if (!demoPointsMap.has(cleanPoint)) {
              demoPointsMap.set(cleanPoint, []);
            }
            demoPointsMap.get(cleanPoint)!.push(style.name);
          }
        });
      }
    });

    const duplicateDemos: string[] = [];
    demoPointsMap.forEach((styleNames, point) => {
      if (styleNames.length > 1) {
        duplicateDemos.push(`${point} (${styleNames.join('、')})`);
      }
    });

    if (duplicateDemos.length > 0) {
      result.push({
        id: 'duplicate-demo',
        type: 'duplicate-demo',
        severity: 'warning',
        message: `发现 ${duplicateDemos.length} 个重复的示范要点`,
        details: duplicateDemos.slice(0, 3).join('；') + (duplicateDemos.length > 3 ? '...' : '')
      });
    }

    const totalAssignedDuration = assignedStyles.reduce((sum, s) => sum + s.duration, 0);

    if (totalAssignedDuration > activity.totalDuration) {
      result.push({
        id: 'time-exceeded',
        type: 'time-exceeded',
        severity: 'error',
        message: `活动总时长超出 ${totalAssignedDuration - activity.totalDuration} 分钟`,
        details: `已分配样式总时长 ${totalAssignedDuration} 分钟，活动计划时长 ${activity.totalDuration} 分钟`
      });
    }

    return result;
  });

  const errorCount = computed(() => {
    return alerts.value.filter(a => a.severity === 'error').length;
  });

  const warningCount = computed(() => {
    return alerts.value.filter(a => a.severity === 'warning').length;
  });

  const hasErrors = computed(() => errorCount.value > 0);

  const hasWarnings = computed(() => warningCount.value > 0);

  return {
    alerts,
    errorCount,
    warningCount,
    hasErrors,
    hasWarnings
  };
}
