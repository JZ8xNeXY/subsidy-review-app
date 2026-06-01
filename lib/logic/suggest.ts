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

    // キーワードマッチング（部分一致も対応）
    const matchedKeywords: string[] = [];
    let score = 0;

    for (const keyword of menu.keywords) {
      const normalizedKeyword = normalizeText(keyword);

      // 完全一致
      if (normalizedText.includes(normalizedKeyword)) {
        matchedKeywords.push(keyword);
        score += 3;
      }
      // 入力文字列がキーワードに含まれる（逆方向マッチ）
      else if (normalizedKeyword.includes(normalizedText) && normalizedText.length >= 2) {
        matchedKeywords.push(keyword);
        score += 2;
      }
      // 2文字以上の部分一致（n-gramアプローチ）
      else if (normalizedText.length >= 2) {
        let matched = false;
        // キーワードを2文字ずつスライドして検索
        for (let i = 0; i <= keyword.length - 2; i++) {
          const bigram = normalizeText(keyword.slice(i, i + 2));
          if (bigram.length === 2 && normalizedText.includes(bigram)) {
            matchedKeywords.push(keyword);
            score += 1;
            matched = true;
            break;
          }
        }
        if (!matched && normalizedText.length >= 3) {
          // 3文字の部分一致も試す
          for (let i = 0; i <= keyword.length - 3; i++) {
            const trigram = normalizeText(keyword.slice(i, i + 3));
            if (trigram.length === 3 && normalizedText.includes(trigram)) {
              matchedKeywords.push(keyword);
              score += 1;
              break;
            }
          }
        }
      }
    }

    // メニュー名とのマッチング（高配点）
    const normalizedMenuName = normalizeText(menu.name);
    // 完全一致または双方向部分一致
    if (normalizedText.includes(normalizedMenuName) || normalizedMenuName.includes(normalizedText)) {
      score += 5;
      matchedKeywords.push(`メニュー名: ${menu.name}`);
    } else {
      // 単語単位でのマッチング
      const menuNameWords = extractWords(normalizedMenuName);
      for (const word of menuNameWords) {
        if (word.length >= 2 && (normalizedText.includes(word) || word.includes(normalizedText))) {
          score += 3;
          matchedKeywords.push(`メニュー名: ${word}`);
        }
      }
      // 2文字単位での部分マッチ
      if (normalizedText.length >= 2) {
        for (let i = 0; i <= menu.name.length - 2; i++) {
          const bigram = normalizeText(menu.name.slice(i, i + 2));
          if (bigram.length === 2 && normalizedText.includes(bigram)) {
            score += 2;
            matchedKeywords.push(`メニュー名部分: ${menu.name.slice(i, i + 2)}`);
            break;
          }
        }
      }
    }

    // 目的文とのマッチング（中配点）
    const normalizedPurpose = normalizeText(menu.purpose);
    const purposeWords = extractWords(normalizedPurpose);
    for (const word of purposeWords) {
      if (word.length >= 2 && (normalizedText.includes(word) || word.includes(normalizedText))) {
        score += 2;
        matchedKeywords.push(`目的: ${word}`);
      }
    }
    // 目的文の2文字部分マッチ
    if (normalizedText.length >= 2 && score < 3) {
      for (let i = 0; i <= menu.purpose.length - 2; i++) {
        const bigram = normalizeText(menu.purpose.slice(i, i + 2));
        if (bigram.length === 2 && normalizedText.includes(bigram)) {
          score += 1;
          matchedKeywords.push(`目的部分: ${menu.purpose.slice(i, i + 2)}`);
          break;
        }
      }
    }

    // コードとのマッチング
    const codeMatch = menu.code.replace(/[()]/g, '');
    if (normalizedText.includes(normalizeText(codeMatch))) {
      score += 5;
      matchedKeywords.push(`コード: ${menu.code}`);
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
 * テキストを正規化（全角→半角、小文字化、スペース除去）
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0))
    .replace(/[　\s\-ー・]/g, '')
    .trim();
}

/**
 * テキストから意味のある単語を抽出
 */
function extractWords(text: string): string[] {
  const words: string[] = [];

  // 2文字以上の連続する文字列を抽出
  const matches = text.match(/[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9fafa-z]{2,}/g);
  if (matches) {
    words.push(...matches);
  }

  return words.filter(w => w.length >= 2);
}
