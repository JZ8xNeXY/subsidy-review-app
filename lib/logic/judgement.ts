// 要件適合性の総合判定ロジック

import { SubsidyMenu, CheckResult, Verdict, RequirementGroup } from '@/types';

export interface JudgementSummary {
  verdict: Verdict;
  reasons: string[];
  missingInfo: string[];
}

/**
 * 総合判定を実行
 */
export function judgeRequirements(
  menu: SubsidyMenu,
  requirementResults: Record<string, CheckResult>
): JudgementSummary {
  const reasons: string[] = [];
  const missingInfo: string[] = [];
  let hasNg = false;
  let hasUnknown = false;

  // 核心要件グループ（ア）の判定
  for (const group of menu.requirementGroups) {
    // 条件付きグループの場合、条件要件がokでなければスキップ
    if (group.conditionalOn && requirementResults[group.conditionalOn] !== 'ok') {
      continue;
    }

    const groupResult = judgeRequirementGroup(group, requirementResults);

    if (groupResult.verdict === 'ng') {
      hasNg = true;
      reasons.push(`${group.label}: 必須要件を満たしていません（${groupResult.ngItems.join('、')}）`);
    } else if (groupResult.verdict === 'warn') {
      hasUnknown = true;
      missingInfo.push(...groupResult.unknownItems.map(item => `${group.label}: ${item}`));
    } else if (groupResult.verdict === 'ok') {
      reasons.push(`${group.label}: 要件を満たしています`);
    }
  }

  // 共通要件（イ・ウ）の判定（全て必須）
  if (menu.commonRequirements.length > 0) {
    const commonNg: string[] = [];
    const commonUnknown: string[] = [];

    for (const req of menu.commonRequirements) {
      const result = requirementResults[req.id];
      if (result === 'ng') {
        commonNg.push(req.label);
      } else if (result === 'unknown' || !result) {
        commonUnknown.push(req.label);
      }
    }

    if (commonNg.length > 0) {
      hasNg = true;
      reasons.push(`共通要件: 必須要件を満たしていません（${commonNg.join('、')}）`);
    } else if (commonUnknown.length > 0) {
      hasUnknown = true;
      missingInfo.push(...commonUnknown.map(item => `共通要件: ${item}`));
    } else {
      reasons.push('共通要件: 要件を満たしています');
    }
  }

  // 総合判定
  let verdict: Verdict;
  if (hasNg) {
    verdict = 'ng';
  } else if (hasUnknown) {
    verdict = 'warn';
  } else {
    verdict = 'ok';
  }

  return {
    verdict,
    reasons,
    missingInfo,
  };
}

/**
 * 要件グループの判定
 */
function judgeRequirementGroup(
  group: RequirementGroup,
  results: Record<string, CheckResult>
): {
  verdict: 'ok' | 'warn' | 'ng';
  ngItems: string[];
  unknownItems: string[];
} {
  const ngItems: string[] = [];
  const unknownItems: string[] = [];
  const okItems: string[] = [];

  for (const req of group.requirements) {
    const result = results[req.id];
    if (result === 'ng') {
      ngItems.push(req.label);
    } else if (result === 'unknown' || !result) {
      unknownItems.push(req.label);
    } else if (result === 'ok') {
      okItems.push(req.label);
    }
  }

  if (group.logic === 'all') {
    // 全て満たす必要がある
    if (ngItems.length > 0) {
      return { verdict: 'ng', ngItems, unknownItems };
    } else if (unknownItems.length > 0) {
      return { verdict: 'warn', ngItems, unknownItems };
    } else {
      return { verdict: 'ok', ngItems, unknownItems };
    }
  } else {
    // いずれか1つ以上満たせばよい
    if (okItems.length > 0) {
      return { verdict: 'ok', ngItems, unknownItems };
    } else if (unknownItems.length > 0) {
      return { verdict: 'warn', ngItems, unknownItems };
    } else {
      return { verdict: 'ng', ngItems, unknownItems };
    }
  }
}
