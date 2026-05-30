// /types/index.ts
// 補助金審査支援アプリ 型定義

// ========================================================================
// 経費科目
// ========================================================================
export type ExpenseCategory =
  | "報酬"
  | "報償費"
  | "旅費"
  | "需用費"
  | "役務費"
  | "委託料"
  | "工事請負費"
  | "使用料及賃借料"
  | "原材料費"
  | "備品購入費"
  | "負担金補助及交付金"
  | "公有財産購入費";

export const ALL_EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "報酬",
  "報償費",
  "旅費",
  "需用費",
  "役務費",
  "委託料",
  "工事請負費",
  "使用料及賃借料",
  "原材料費",
  "備品購入費",
  "負担金補助及交付金",
  "公有財産購入費",
];

// ========================================================================
// 補助対象外経費(条件付きあり)
// ========================================================================
export type IneligibleExpense = {
  category: ExpenseCategory;
  /** "ただし○○に係るものを除く" 等の条件 */
  condition?: string;
};

// ========================================================================
// 上限額
// ========================================================================
export type UpperLimit = {
  /** "ア(ｲ)①bに係る経費" 等の適用範囲 */
  scope: string;
  /** 千円単位 */
  amount: number;
  /** "千円/自治体", "千円/件", "千円/台" 等 */
  unit: string;
};

// ========================================================================
// 個別要件
// ========================================================================
export type Requirement = {
  id: string;
  /** "ア(ｱ)", "ア(ｲ)①b" 等の条文コード */
  code: string;
  /** 短い名称 */
  label: string;
  /** 条文の要約 */
  description: string;
  /** 条文原文(参照用、省略可) */
  fullText?: string;
};

// ========================================================================
// 要件グループ(全て/いずれか の論理関係を持つ)
// ========================================================================
export type RequirementGroup = {
  id: string;
  label: string;
  /** "all" = 全て満たす必要、"any" = いずれか1つ以上で可 */
  logic: "all" | "any";
  requirements: Requirement[];
};

// ========================================================================
// 出典参照
// ========================================================================
export type SourceRefs = {
  youkou: string;
  houshin: string;
};

// ========================================================================
// 補助メニュー本体
// ========================================================================
export type SubsidyMenu = {
  id: string;
  category: "policy" | "general";
  /** "ア(ｱ)", "(12)" 等 */
  code: string;
  name: string;
  purpose: string;
  /** (12)など緊急的・重点的なメニュー */
  isEmergency?: boolean;
  subsidyRate: "2/3" | "1/2";
  upperLimits: UpperLimit[];
  /** ア の要件グループ (核心要件) */
  requirementGroups: RequirementGroup[];
  /** イ/ウ の共通要件 (効果検証、周知普及啓発、広域化) */
  commonRequirements: Requirement[];
  /** 補助対象として認められる経費科目 */
  eligibleExpenses: ExpenseCategory[];
  /** 補助対象外科目 (条件付きあり) */
  ineligibleExpenses: IneligibleExpense[];
  /** 「新規・拡充限定」「計画策定前提」「他局事業重複なし」等 */
  conditions: string[];
  /** 留意事項 */
  notes: string[];
  /** サジェスト用キーワード */
  keywords: string[];
  sourceRefs: SourceRefs;
};

// ========================================================================
// 審査状態
// ========================================================================
export type CheckResult = "ok" | "ng" | "unknown";

export type MenuCheckState = {
  /** 要件IDごとの判定結果 */
  requirementResults: Record<string, CheckResult>;
  /** 要件IDごとの担当者メモ */
  requirementNotes: Record<string, string>;
  /** 経費科目ごとの金額(円) */
  expenses: Partial<Record<ExpenseCategory, number>>;
  /** 国等補助金・寄附金等の控除額(円) */
  deductions: number;
  /** 全体所見メモ */
  overallNote: string;
  /** 上限額計算に使う件数(ZEV台数、暑熱対応設備件数等) */
  unitCounts: Record<string, number>;
};

export type ApplicationInfo = {
  name: string;        // 事業名
  applicant: string;   // 申請者名
  purpose: string;     // 目的
  content: string;     // 取組内容
  structure: string;   // 実施体制
  /** 申請者の希望メニューID(任意)。指定された場合、Step2で最優先候補として表示。 */
  desiredMenuId?: string;
};

export type ReviewState = {
  application: ApplicationInfo;
  selectedMenuIds: string[];
  checks: Record<string, MenuCheckState>;
};

// ========================================================================
// 判定結果
// ========================================================================
export type Verdict = "ok" | "warn" | "ng";

export type JudgementResult = {
  /** 総合判定 */
  verdict: Verdict;
  /** 判定理由 */
  reasons: string[];
  /** 不足情報(unknown としてマークされた要件) */
  missingInfo: string[];
  /** 補助対象経費合計(円) */
  totalEligibleExpense: number;
  /** 対象外経費の警告 */
  expenseWarnings: string[];
  /** 控除後額(円) */
  amountAfterDeduction: number;
  /** 補助率適用後額(円、千円未満切捨前) */
  amountBeforeCeil: number;
  /** 最終交付額(円、千円未満切捨) */
  finalSubsidyAmount: number;
  /** 上限額判定 */
  upperLimitJudgement: { scope: string; max: number; applied: number; ok: boolean }[];
};
