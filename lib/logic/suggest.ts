// キーワードマッチングによるメニューサジェストロジック

import { SubsidyMenu } from '@/types';
import { allMenus } from '@/lib/data/menus';

export interface MenuSuggestion {
  menu: SubsidyMenu;
  score: number;
  matchedKeywords: string[];
  isDesired: boolean;
}

/**
 * 申請情報からメニュー候補をサジェスト
 */
export function suggestMenus(
  applicationText: string,
  desiredMenuId?: string
): MenuSuggestion[] {
  const suggestions: MenuSuggestion[] = [];

  // テキストを正規化（小文字化、スペース除去）
  const normalizedText = normalizeText(applicationText);

  for (const menu of allMenus) {
    const isDesired = menu.id === desiredMenuId;

    // 希望メニューは自動的にスコア100で追加
    if (isDesired) {
      suggestions.push({
        menu,
        score: 100,
        matchedKeywords: ['申請者希望'],
        isDesired: true,
      });
      continue;
    }

    // キーワードマッチング
    const matchedKeywords: string[] = [];
    let score = 0;

    for (const keyword of menu.keywords) {
      const normalizedKeyword = normalizeText(keyword);
      if (normalizedText.includes(normalizedKeyword)) {
        matchedKeywords.push(keyword);
        score += 1;
      }
    }

    // メニュー名とのマッチング（高配点）
    const normalizedMenuName = normalizeText(menu.name);
    const menuNameWords = normalizedMenuName.split(/\s+/);
    for (const word of menuNameWords) {
      if (word.length >= 2 && normalizedText.includes(word)) {
        score += 3;
        if (!matchedKeywords.includes(menu.name)) {
          matchedKeywords.push(`メニュー名: ${word}`);
        }
      }
    }

    // 目的文とのマッチング（中配点）
    const normalizedPurpose = normalizeText(menu.purpose);
    const purposeWords = normalizedPurpose.split(/\s+/).filter(w => w.length >= 3);
    for (const word of purposeWords) {
      if (normalizedText.includes(word)) {
        score += 2;
        if (!matchedKeywords.includes(word)) {
          matchedKeywords.push(`目的: ${word}`);
        }
      }
    }

    // スコアが1以上ならサジェスト候補に追加
    if (score > 0) {
      suggestions.push({
        menu,
        score,
        matchedKeywords,
        isDesired: false,
      });
    }
  }

  // スコアでソート（降順）、希望メニューは最上位
  suggestions.sort((a, b) => {
    if (a.isDesired) return -1;
    if (b.isDesired) return 1;
    return b.score - a.score;
  });

  return suggestions;
}

/**
 * テキストを正規化（全角→半角、小文字化、記号除去）
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0))
    .replace(/[　\s]+/g, '')
    .replace(/[^\w\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]+/g, '');
}
