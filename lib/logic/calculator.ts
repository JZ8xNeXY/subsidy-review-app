// 補助金額計算ロジック

import { SubsidyMenu, ExpenseCategory, UpperLimit } from '@/types';

export interface CalculationResult {
  totalEligibleExpense: number;
  expenseWarnings: string[];
  amountAfterDeduction: number;
  amountBeforeCeil: number;
  finalSubsidyAmount: number;
  upperLimitDetails: {
    scope: string;
    limit: number;
    unit: string;
  }[];
}

/**
 * 補助金額を計算
 */
export function calculateSubsidy(
  menu: SubsidyMenu,
  expenses: Partial<Record<ExpenseCategory, number>>,
  deductions: number,
  unitCounts: Record<string, number> = {}
): CalculationResult {
  // 補助対象経費の合計
  let totalEligibleExpense = 0;
  const expenseWarnings: string[] = [];

  // 各科目の金額を集計
  for (const [category, amount] of Object.entries(expenses)) {
    if (amount && amount > 0) {
      const expenseCategory = category as ExpenseCategory;

      // 補助対象かチェック
      if (menu.eligibleExpenses.includes(expenseCategory)) {
        totalEligibleExpense += amount;
      } else {
        // 対象外経費の警告
        const ineligible = menu.ineligibleExpenses.find(ie => ie.category === expenseCategory);
        if (ineligible) {
          if (ineligible.condition) {
            expenseWarnings.push(`${expenseCategory}: ${amount.toLocaleString()}円（${ineligible.condition}）`);
          } else {
            expenseWarnings.push(`${expenseCategory}: ${amount.toLocaleString()}円（補助対象外）`);
          }
        }
      }
    }
  }

  // 控除後の額
  const amountAfterDeduction = Math.max(0, totalEligibleExpense - deductions);

  // 補助率を適用
  const rate = menu.subsidyRate === '2/3' ? 2 / 3 : 1 / 2;
  const amountBeforeCeil = amountAfterDeduction * rate;

  // 上限額を計算
  const maxAmount = calculateMaxAmount(menu.upperLimits, unitCounts);

  // 最終補助金額（上限額と比較して小さい方、千円未満切り捨て）
  const beforeRounding = Math.min(amountBeforeCeil, maxAmount);
  const finalSubsidyAmount = Math.floor(beforeRounding / 1000) * 1000;

  // 上限額の詳細
  const upperLimitDetails = menu.upperLimits.map(limit => ({
    scope: limit.scope,
    limit: limit.amount * 1000, // 千円単位を円に変換
    unit: limit.unit,
  }));

  return {
    totalEligibleExpense,
    expenseWarnings,
    amountAfterDeduction,
    amountBeforeCeil,
    finalSubsidyAmount,
    upperLimitDetails,
  };
}

/**
 * 上限額を計算（複数の上限がある場合は合計）
 */
function calculateMaxAmount(
  upperLimits: UpperLimit[],
  unitCounts: Record<string, number>
): number {
  let total = 0;

  for (const limit of upperLimits) {
    const baseAmount = limit.amount * 1000; // 千円単位を円に変換

    if (limit.unit.includes('千円/台') || limit.unit.includes('千円/件')) {
      // 台数・件数指定の場合
      const count = unitCounts[limit.scope] || 1;
      total += baseAmount * count;
    } else {
      // 区市町村等あたりの場合
      total += baseAmount;
    }
  }

  return total;
}
